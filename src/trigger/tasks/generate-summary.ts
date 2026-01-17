import { task, logger } from "@trigger.dev/sdk/v3";

interface GenerateSummaryPayload {
  bookId: string;
}

export const generateSummary = task({
  id: "generate-summary",
  maxDuration: 120, // 2 minutes
  run: async ({ bookId }: GenerateSummaryPayload) => {
    const startTime = Date.now();
    logger.info("=== STARTING SUMMARY GENERATION ===", {
      bookId,
      timestamp: new Date().toISOString(),
    });

    // Dynamic imports
    const { db } = await import("@/db");
    const { appSettings, omnipubs, blockMetadata, reporting } = await import("@/db/schema");
    const { eq, and } = await import("drizzle-orm");
    const { v4: uuidv4 } = await import("uuid");

    // Get OpenAI API key
    logger.info("[Summary] Checking OpenAI API key");
    const openAiKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'openAiApiKey'));

    if (!openAiKeySetting.length || !openAiKeySetting[0].value) {
      logger.warn("[Summary] OpenAI API key not configured, skipping");
      return { success: true, skipped: true, reason: "OpenAI API key not configured" };
    }
    logger.info("[Summary] OpenAI API key found");

    // Get omnipub metadata (primary source)
    const omnipub = await db.select()
      .from(omnipubs)
      .where(eq(omnipubs.uuid, bookId))
      .limit(1);

    if (!omnipub.length) {
      throw new Error("Omnipub not found");
    }

    const bookTitle = omnipub[0].title;
    const creators = omnipub[0].creators || [];

    // Get Cashmere API key to fetch content
    const cashmereKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'cashmereApiKey'));

    if (!cashmereKeySetting.length || !cashmereKeySetting[0].value) {
      throw new Error("Cashmere API key not configured");
    }

    // Fetch book content for summary
    const { default: Cashmere } = await import("@/lib/cashmere");
    const cashmere = new Cashmere(cashmereKeySetting[0].value);

    // Get all text blocks from the book
    const allBlocks = await cashmere.getAllBookBlocks(bookId);
    const textContent = allBlocks
      .flatMap((section: { blocks: { type: string; properties?: { text?: string } }[] }) =>
        section.blocks
          .filter((block: { type: string }) => block.type === 'text')
          .map((block: { properties?: { text?: string } }) => block.properties?.text || '')
      )
      .join('\n\n')
      .slice(0, 15000); // Limit to ~15k characters for summary

    if (!textContent) {
      logger.warn("No text content found for summary");
      return { success: true, skipped: true };
    }

    // Generate summary with OpenAI
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openAiKeySetting[0].value });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a literary expert. Generate a concise but engaging summary of the book based on the provided content. The summary should be 2-3 paragraphs and capture the essence of the book.",
        },
        {
          role: "user",
          content: `Book: ${bookTitle}\nAuthors: ${creators.join(', ') || 'Unknown'}\n\nContent:\n${textContent}`,
        },
      ],
      max_tokens: 500,
    });

    const summary = response.choices[0]?.message?.content || '';
    logger.info("[Summary] Summary generated successfully", {
      summaryLength: summary.length,
      model: response.model,
      usage: response.usage,
    });

    // Store summary directly on omnipubs table
    await db.update(omnipubs)
      .set({
        summary,
        updatedAt: new Date(),
      })
      .where(eq(omnipubs.uuid, bookId));

    // Also update blockMetadata for backward compatibility
    const bookData = await db.select()
      .from(blockMetadata)
      .where(and(eq(blockMetadata.bookId, bookId), eq(blockMetadata.type, 'book')))
      .limit(1);

    if (bookData.length > 0) {
      await db.update(blockMetadata)
        .set({
          data: {
            ...(bookData[0].data as object),
            summary,
          },
          updatedAt: new Date(),
        })
        .where(eq(blockMetadata.id, bookData[0].id));
    }

    // Report license usage for summary generation
    await db.insert(reporting).values({
      id: uuidv4(),
      blockId: bookId,
      licenseType: 'static-summary',
      data: { bookId, length: summary.length },
      timestamp: new Date(),
    }).onConflictDoNothing();

    const totalDuration = Date.now() - startTime;
    logger.info("=== SUMMARY GENERATION COMPLETED ===", {
      bookId,
      summaryLength: summary.length,
      processingTimeMs: totalDuration,
    });

    return {
      success: true,
      summaryLength: summary.length,
      processingTimeMs: totalDuration,
    };
  },
});
