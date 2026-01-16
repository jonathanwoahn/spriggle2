import { task, logger } from "@trigger.dev/sdk/v3";

interface ProcessSectionPayload {
  bookId: string;
  sectionOrder: number;
  voiceId: string;
}

interface TextBlock {
  uuid: string;
  type: string;
  properties: {
    text?: string;
    content?: string;
  };
}

export const processSection = task({
  id: "process-section",
  maxDuration: 600, // 10 minutes per section
  run: async ({
    bookId,
    sectionOrder,
    voiceId,
  }: ProcessSectionPayload) => {
    const startTime = Date.now();
    logger.info("=== STARTING SECTION PROCESSING ===", {
      bookId,
      sectionOrder,
      voiceId,
      timestamp: new Date().toISOString(),
    });

    // Dynamic imports
    const { db } = await import("@/db");
    const { appSettings, blockTimestamps, reporting } = await import("@/db/schema");
    const { eq, and } = await import("drizzle-orm");
    const { v4: uuidv4 } = await import("uuid");

    // Get API keys
    logger.info("[Section] Fetching API keys");
    const [cashmereKeySetting, elevenLabsKeySetting] = await Promise.all([
      db.select().from(appSettings).where(eq(appSettings.key, 'cashmereApiKey')),
      db.select().from(appSettings).where(eq(appSettings.key, 'elevenLabsApiKey')),
    ]);

    if (!cashmereKeySetting.length || !cashmereKeySetting[0].value) {
      logger.error("[Section] FAILED: Cashmere API key not configured");
      throw new Error("Cashmere API key not configured");
    }
    if (!elevenLabsKeySetting.length || !elevenLabsKeySetting[0].value) {
      logger.error("[Section] FAILED: ElevenLabs API key not configured");
      throw new Error("ElevenLabs API key not configured");
    }
    logger.info("[Section] API keys retrieved successfully");

    // Initialize clients
    const { default: Cashmere } = await import("@/lib/cashmere");
    const { ElevenLabsService } = await import("@/lib/elevenlabs-service");
    const { uploadFile } = await import("@/lib/storage");

    const cashmere = new Cashmere(cashmereKeySetting[0].value);
    const elevenLabs = new ElevenLabsService(elevenLabsKeySetting[0].value);

    // Reset ElevenLabs context for this section
    elevenLabs.resetContext();

    // 1. Fetch blocks from Cashmere
    logger.info("[Section] Fetching blocks from Cashmere", { bookId, sectionOrder });
    const blocks = await cashmere.getSectionBookBlocks(bookId, `${sectionOrder}`);
    logger.info("[Section] Blocks fetched", { totalBlocks: blocks.length });

    // Filter for blocks that have text content
    // Include paragraph, text, heading, and other content types
    const textBlockTypes = ['text', 'paragraph', 'heading', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'quote', 'blockquote'];
    const textBlocks: TextBlock[] = blocks.filter((block: TextBlock) => {
      // Include if it's a known text type OR if it has text content
      const hasText = block.properties?.text?.trim();
      const isTextType = textBlockTypes.includes(block.type);
      return hasText || isTextType;
    }).filter((block: TextBlock) => block.properties?.text?.trim()); // Final filter to ensure text exists

    logger.info(`Found ${textBlocks.length} text blocks from ${blocks.length} total blocks`);

    if (textBlocks.length === 0) {
      logger.info("No text blocks in section, skipping");
      return { success: true, sectionOrder, blocksProcessed: 0 };
    }

    // Helper to extract text from block
    const getBlockText = (block: TextBlock): string => {
      return block.properties?.text || block.properties?.content || '';
    };

    // 2. Report storage license usage
    const storageReports = textBlocks.map((block) => ({
      id: uuidv4(),
      blockId: block.uuid,
      licenseType: 'storage',
      data: { bookId, sectionOrder },
      timestamp: new Date(),
    }));
    await db.insert(reporting).values(storageReports).onConflictDoNothing();

    // 3. Delete existing timestamps for this section/voice before processing
    await db.delete(blockTimestamps)
      .where(and(
        eq(blockTimestamps.bookId, bookId),
        eq(blockTimestamps.sectionOrder, sectionOrder),
        eq(blockTimestamps.voiceId, voiceId)
      ));

    // 4. Process each block with request stitching
    logger.info("Processing blocks with request stitching");

    const audioBuffers: Buffer[] = [];
    const blockMappings: {
      blockId: string;
      startTimeMs: number;
      endTimeMs: number;
    }[] = [];

    let cumulativeTimeMs = 0;
    const requestIds: string[] = [];

    for (let i = 0; i < textBlocks.length; i++) {
      const block = textBlocks[i];
      const blockText = getBlockText(block);

      if (!blockText.trim()) {
        logger.info(`Skipping empty block ${i + 1}/${textBlocks.length}`);
        continue;
      }

      // Get context text for stitching within this section only
      // Previous text: from previous block in this section
      const previousText = i > 0 ? getBlockText(textBlocks[i - 1]) : undefined;

      // Next text: from next block in this section
      const nextText = i < textBlocks.length - 1 ? getBlockText(textBlocks[i + 1]) : undefined;

      logger.info(`Converting block ${i + 1}/${textBlocks.length}`, {
        blockId: block.uuid,
        textLength: blockText.length,
        hasContext: { prev: !!previousText, next: !!nextText },
      });

      // Convert this block with request stitching
      // The ElevenLabsService internally tracks previous_request_ids
      const result = await elevenLabs.convertWithStitching({
        text: blockText,
        voiceId,
        previousText: previousText?.slice(-500), // Use last 500 chars of prev
        nextText: nextText?.slice(0, 500), // Use first 500 chars of next
      });

      // Track audio and timing
      audioBuffers.push(result.audio);

      // Calculate timing from alignment or estimate from audio duration
      let blockDurationMs: number;
      if (result.alignment && result.alignment.characterEndTimesSeconds.length > 0) {
        // Use alignment data for accurate timing
        const endTimes = result.alignment.characterEndTimesSeconds;
        blockDurationMs = Math.max(...endTimes) * 1000;
      } else {
        // Estimate: ~150 words per minute, average 5 chars per word
        // So roughly 750 chars per minute = 12.5 chars per second
        blockDurationMs = (blockText.length / 12.5) * 1000;
      }

      blockMappings.push({
        blockId: block.uuid,
        startTimeMs: cumulativeTimeMs,
        endTimeMs: cumulativeTimeMs + blockDurationMs,
      });

      cumulativeTimeMs += blockDurationMs;
      requestIds.push(result.requestId);

      logger.info(`Block ${i + 1} converted`, {
        requestId: result.requestId,
        durationMs: blockDurationMs,
        audioSize: result.audio.length,
      });
    }

    // 5. Concatenate all audio buffers
    const combinedAudio = Buffer.concat(audioBuffers);
    logger.info("Combined audio buffers", {
      totalBuffers: audioBuffers.length,
      totalSize: combinedAudio.length,
      totalDurationMs: cumulativeTimeMs,
    });

    // 6. Upload combined audio to R2
    const audioPath = `${bookId}/${voiceId}/section-${sectionOrder}.mp3`;
    logger.info("Uploading audio to R2", { path: audioPath, size: combinedAudio.length });
    await uploadFile(audioPath, combinedAudio, 'audio/mpeg');

    // 7. Store block-timestamp mappings
    if (blockMappings.length > 0) {
      await db.insert(blockTimestamps).values(
        blockMappings.map(m => ({
          bookId,
          voiceId,
          sectionOrder,
          blockId: m.blockId,
          startTimeMs: m.startTimeMs,
          endTimeMs: m.endTimeMs,
        }))
      );
    }

    // 8. Report audio conversion license usage
    const conversionReports = textBlocks
      .filter(block => getBlockText(block).trim())
      .map((block, index) => ({
        id: uuidv4(),
        blockId: block.uuid,
        licenseType: 'audio-conversion',
        data: {
          bookId,
          sectionOrder,
          voiceId,
          requestId: requestIds[index] || 'unknown',
        },
        timestamp: new Date(),
      }));

    if (conversionReports.length > 0) {
      await db.insert(reporting).values(conversionReports).onConflictDoNothing();
    }

    const totalDuration = Date.now() - startTime;
    logger.info("=== SECTION PROCESSING COMPLETED ===", {
      sectionOrder,
      blocksProcessed: blockMappings.length,
      audioDurationMs: cumulativeTimeMs,
      audioPath,
      processingTimeMs: totalDuration,
      processingTimeSeconds: (totalDuration / 1000).toFixed(2),
    });

    return {
      success: true,
      sectionOrder,
      blocksProcessed: blockMappings.length,
      audioDurationMs: cumulativeTimeMs,
      requestIds,
      processingTimeMs: totalDuration,
    };
  },
});
