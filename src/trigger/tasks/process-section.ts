import { task, logger } from "@trigger.dev/sdk/v3";
import { processBlock, type ProcessBlockResult } from "./process-block";
import type { TTSProvider, TTSModel } from "@/lib/tts-provider";

interface ProcessSectionPayload {
  bookId: string;
  sectionOrder: number;
  voiceId: string;
  provider: TTSProvider;
  model?: TTSModel;
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
  maxDuration: 1800, // 30 minutes per section
  run: async ({
    bookId,
    sectionOrder,
    voiceId,
    provider,
    model,
  }: ProcessSectionPayload) => {
    const startTime = Date.now();
    logger.info("=== STARTING SECTION PROCESSING ===", {
      bookId,
      sectionOrder,
      voiceId,
      provider,
      model,
      timestamp: new Date().toISOString(),
    });

    // Dynamic imports
    const { db } = await import("@/db");
    const { appSettings, blockTimestamps, reporting } = await import("@/db/schema");
    const { eq, and } = await import("drizzle-orm");
    const { v4: uuidv4 } = await import("uuid");

    // Get Cashmere API key for fetching blocks
    logger.info("[Section] Fetching Cashmere API key");
    const [cashmereKeySetting] = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'cashmereApiKey'));

    if (!cashmereKeySetting?.value) {
      logger.error("[Section] FAILED: Cashmere API key not configured");
      throw new Error("Cashmere API key not configured");
    }
    logger.info("[Section] Cashmere API key retrieved successfully");

    // Initialize Cashmere client
    const { default: Cashmere } = await import("@/lib/cashmere");
    const { uploadFile } = await import("@/lib/storage");
    const cashmere = new Cashmere(cashmereKeySetting.value);

    // 1. Fetch blocks from Cashmere
    logger.info("[Section] Fetching blocks from Cashmere", { bookId, sectionOrder });
    const blocks = await cashmere.getSectionBookBlocks(bookId, `${sectionOrder}`);
    logger.info("[Section] Blocks fetched", { totalBlocks: blocks.length });

    // Helper to safely extract text from block (handles string or array)
    const getBlockText = (block: TextBlock): string => {
      const text = block.properties?.text;
      const content = block.properties?.content;

      // Handle array case (Cashmere sometimes returns text as array)
      if (Array.isArray(text)) {
        return text.join(' ').trim();
      }
      if (Array.isArray(content)) {
        return content.join(' ').trim();
      }

      // Handle string case
      if (typeof text === 'string') {
        return text.trim();
      }
      if (typeof content === 'string') {
        return content.trim();
      }

      return '';
    };

    // Filter for blocks that have text content
    const textBlockTypes = ['text', 'paragraph', 'heading', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'quote', 'blockquote'];
    const textBlocks: TextBlock[] = blocks.filter((block: TextBlock) => {
      const hasText = getBlockText(block);
      const isTextType = textBlockTypes.includes(block.type);
      return hasText || isTextType;
    }).filter((block: TextBlock) => getBlockText(block));

    logger.info(`Found ${textBlocks.length} text blocks from ${blocks.length} total blocks`);

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

    // 4. Process blocks based on provider
    logger.info(`Processing ${textBlocks.length} blocks with ${provider} provider`, {
      executionMode: provider === 'openai' ? 'PARALLEL' : 'SEQUENTIAL',
    });

    let blockResults: ProcessBlockResult[];
    const requestIds: string[] = [];

    if (provider === 'openai') {
      // OpenAI: Process blocks in parallel (no stitching support)
      logger.info("[OpenAI] Starting parallel block processing");

      const blockPayloads = textBlocks
        .map((block, index) => {
          const blockText = getBlockText(block);
          if (!blockText.trim()) return null;
          return {
            payload: {
              bookId,
              sectionOrder,
              blockIndex: index,
              blockId: block.uuid,
              blockText,
              voiceId,
              provider,
              model,
            },
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      if (blockPayloads.length === 0) {
        logger.info("[OpenAI] No blocks to process");
        blockResults = [];
      } else {
        logger.info(`[OpenAI] Triggering ${blockPayloads.length} block tasks in parallel`);
        const results = await processBlock.batchTriggerAndWait(blockPayloads);

        // Sort results by blockIndex to maintain order
        blockResults = results.runs
          .filter((r): r is typeof r & { ok: true; output: ProcessBlockResult } => r.ok === true)
          .map(r => r.output)
          .sort((a, b) => a.blockIndex - b.blockIndex);

        // Check for failures
        const failures = results.runs.filter(r => !r.ok);
        if (failures.length > 0) {
          logger.error(`[OpenAI] ${failures.length} blocks failed to process`);
          for (const failure of failures) {
            if (!failure.ok) {
              logger.error("Block processing failed", { error: failure.error });
            }
          }
          throw new Error(`${failures.length} of ${blockPayloads.length} blocks failed to process`);
        }

        logger.info(`[OpenAI] All ${blockResults.length} blocks processed successfully`);
      }
    } else {
      // ElevenLabs: Process blocks sequentially (maintains request stitching)
      logger.info("[ElevenLabs] Starting sequential block processing with stitching");
      blockResults = [];

      for (let i = 0; i < textBlocks.length; i++) {
        const block = textBlocks[i];
        const blockText = getBlockText(block);

        if (!blockText.trim()) {
          logger.info(`[ElevenLabs] Skipping empty block ${i + 1}/${textBlocks.length}`);
          continue;
        }

        // Get context text for stitching
        const previousText = i > 0 ? getBlockText(textBlocks[i - 1]) : undefined;
        const nextText = i < textBlocks.length - 1 ? getBlockText(textBlocks[i + 1]) : undefined;

        logger.info(`[ElevenLabs] Processing block ${i + 1}/${textBlocks.length}`, {
          blockId: block.uuid,
          textLength: blockText.length,
          hasContext: { prev: !!previousText, next: !!nextText },
        });

        const result = await processBlock.triggerAndWait({
          bookId,
          sectionOrder,
          blockIndex: i,
          blockId: block.uuid,
          blockText,
          voiceId,
          provider,
          model,
          previousText,
          nextText,
        });

        if (!result.ok) {
          logger.error(`[ElevenLabs] Block ${i + 1} failed`, { error: result.error });
          throw new Error(`Block ${i + 1} failed: ${result.error}`);
        }

        blockResults.push(result.output);
        if (result.output.requestId) {
          requestIds.push(result.output.requestId);
        }

        logger.info(`[ElevenLabs] Block ${i + 1} completed`, {
          durationMs: result.output.durationMs,
          audioSize: result.output.audio.length,
        });
      }

      logger.info(`[ElevenLabs] All ${blockResults.length} blocks processed`);
    }

    // 5. Calculate cumulative timestamps and prepare audio buffers
    const audioBuffers: Buffer[] = [];
    const blockMappings: {
      blockId: string;
      startTimeMs: number;
      endTimeMs: number;
    }[] = [];

    let cumulativeTimeMs = 0;
    for (const result of blockResults) {
      audioBuffers.push(result.audio);

      blockMappings.push({
        blockId: result.blockId,
        startTimeMs: cumulativeTimeMs,
        endTimeMs: cumulativeTimeMs + result.durationMs,
      });

      cumulativeTimeMs += result.durationMs;
      if (result.requestId && !requestIds.includes(result.requestId)) {
        requestIds.push(result.requestId);
      }
    }

    // 6. Concatenate all audio buffers
    const combinedAudio = Buffer.concat(audioBuffers);
    logger.info("Combined audio buffers", {
      totalBuffers: audioBuffers.length,
      totalSize: combinedAudio.length,
      totalDurationMs: cumulativeTimeMs,
    });

    // 7. Upload combined audio to R2
    const audioPath = `${bookId}/${voiceId}/section-${sectionOrder}.mp3`;
    logger.info("Uploading audio to R2", { path: audioPath, size: combinedAudio.length });
    await uploadFile(audioPath, combinedAudio, 'audio/mpeg');

    // 8. Store block-timestamp mappings
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

    // 9. Report audio conversion license usage
    const conversionReports = blockResults.map((result, index) => ({
      id: uuidv4(),
      blockId: result.blockId,
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
      executionMode: provider === 'openai' ? 'PARALLEL' : 'SEQUENTIAL',
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
