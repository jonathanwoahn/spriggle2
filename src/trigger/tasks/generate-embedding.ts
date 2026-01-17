import { task, logger } from "@trigger.dev/sdk/v3";

interface GenerateEmbeddingPayload {
  bookId: string;
}

export const generateEmbedding = task({
  id: "generate-embedding",
  maxDuration: 60, // 1 minute
  run: async ({ bookId }: GenerateEmbeddingPayload) => {
    const startTime = Date.now();
    logger.info("=== STARTING EMBEDDING GENERATION ===", {
      bookId,
      timestamp: new Date().toISOString(),
    });

    // Dynamic imports
    const { db } = await import("@/db");
    const { appSettings, omnipubs, blockMetadata, reporting } = await import("@/db/schema");
    const { eq, and, sql } = await import("drizzle-orm");
    const { v4: uuidv4 } = await import("uuid");

    // Get OpenAI API key
    logger.info("[Embedding] Checking OpenAI API key");
    const openAiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'openAiApiKey'));

    if (!openAiKeySetting.length || !openAiKeySetting[0].value) {
      logger.warn("[Embedding] OpenAI API key not configured, skipping");
      return { success: true, skipped: true, reason: "OpenAI API key not configured" };
    }
    logger.info("[Embedding] OpenAI API key found");

    // Get omnipub with summary
    const omnipub = await db.select()
      .from(omnipubs)
      .where(eq(omnipubs.uuid, bookId))
      .limit(1);

    if (!omnipub.length) {
      throw new Error("Omnipub not found");
    }

    const { title, creators, summary } = omnipub[0];

    if (!summary) {
      logger.warn("No summary found for embedding generation");
      return { success: true, skipped: true };
    }

    // Generate embedding with OpenAI
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openAiKeySetting[0].value });

    // Combine title, creators, and summary for better semantic search
    const textForEmbedding = [
      title,
      creators?.join(', ') || '',
      summary,
    ].filter(Boolean).join('\n\n');

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: textForEmbedding,
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      throw new Error("Failed to generate embedding");
    }

    logger.info("Generated embedding", { dimensions: embedding.length });

    // Store embedding directly on omnipubs table using pgvector
    // Use raw SQL to properly format the vector
    await db.execute(sql`
      UPDATE omnipubs
      SET embedding = ${JSON.stringify(embedding)}::vector,
          updated_at = NOW()
      WHERE uuid = ${bookId}
    `);

    // Also update blockMetadata for backward compatibility (as JSON string)
    const bookData = await db.select()
      .from(blockMetadata)
      .where(and(eq(blockMetadata.bookId, bookId), eq(blockMetadata.type, 'book')))
      .limit(1);

    if (bookData.length > 0) {
      await db.update(blockMetadata)
        .set({
          embedding: JSON.stringify(embedding),
          updatedAt: new Date(),
        })
        .where(eq(blockMetadata.id, bookData[0].id));
    }

    // Report license usage for embedding generation
    await db.insert(reporting).values({
      id: uuidv4(),
      blockId: bookId,
      licenseType: 'embedding',
      data: { bookId, dimensions: embedding.length },
      timestamp: new Date(),
    }).onConflictDoNothing();

    const totalDuration = Date.now() - startTime;
    logger.info("=== EMBEDDING GENERATION COMPLETED ===", {
      bookId,
      embeddingDimensions: embedding.length,
      processingTimeMs: totalDuration,
    });

    return {
      success: true,
      embeddingDimensions: embedding.length,
      processingTimeMs: totalDuration,
    };
  },
});
