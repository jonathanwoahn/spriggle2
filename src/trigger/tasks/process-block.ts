import { task, logger } from "@trigger.dev/sdk/v3";
import type { TTSProvider, TTSModel } from "@/lib/tts-provider";

export interface ProcessBlockPayload {
  bookId: string;
  sectionOrder: number;
  blockIndex: number;
  blockId: string;
  blockText: string;
  voiceId: string;
  provider: TTSProvider;
  model?: TTSModel;
  // ElevenLabs stitching context (ignored for OpenAI)
  previousText?: string;
  nextText?: string;
}

export interface ProcessBlockResult {
  blockIndex: number;
  blockId: string;
  audio: Buffer;
  durationMs: number;
  requestId?: string;
}

export const processBlock = task({
  id: "process-block",
  maxDuration: 300, // 5 minutes - plenty for a single block
  run: async ({
    bookId,
    sectionOrder,
    blockIndex,
    blockId,
    blockText,
    voiceId,
    provider,
    model,
    previousText,
    nextText,
  }: ProcessBlockPayload): Promise<ProcessBlockResult> => {
    logger.info("Processing block", {
      bookId,
      sectionOrder,
      blockIndex,
      blockId,
      textLength: blockText.length,
      provider,
      model,
      hasContext: { prev: !!previousText, next: !!nextText },
    });

    // Dynamic imports
    const { db } = await import("@/db");
    const { appSettings } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    // Determine which API key to fetch based on provider
    const ttsApiKeyName = provider === 'openai' ? 'openAiApiKey' : 'elevenLabsApiKey';

    // Get TTS API key
    const [ttsKeySetting] = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, ttsApiKeyName));

    if (!ttsKeySetting?.value) {
      logger.error(`${provider} API key not configured`, { provider, keyName: ttsApiKeyName });
      throw new Error(`${provider} API key not configured`);
    }

    // Import TTS provider
    const { convertTextToSpeech } = await import("@/lib/tts-provider");

    // Convert text to speech
    const result = await convertTextToSpeech({
      text: blockText,
      voiceId,
      provider,
      apiKey: ttsKeySetting.value,
      model,
      // ElevenLabs stitching params (ignored for OpenAI)
      previousText: previousText?.slice(-500),
      nextText: nextText?.slice(0, 500),
    });

    // Calculate duration from alignment or estimate
    let durationMs: number;
    if (result.alignment && result.alignment.characterEndTimesSeconds.length > 0) {
      const endTimes = result.alignment.characterEndTimesSeconds;
      durationMs = Math.max(...endTimes) * 1000;
    } else {
      // Estimate: ~150 words per minute, average 5 chars per word
      // ~750 chars per minute = 12.5 chars per second
      durationMs = (blockText.length / 12.5) * 1000;
    }

    logger.info("Block processed successfully", {
      blockIndex,
      blockId,
      durationMs,
      audioSize: result.audio.length,
      requestId: result.requestId || 'N/A',
    });

    return {
      blockIndex,
      blockId,
      audio: result.audio,
      durationMs,
      requestId: result.requestId,
    };
  },
});
