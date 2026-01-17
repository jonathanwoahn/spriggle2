import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// ElevenLabs has a 10,000 character limit per request
const MAX_CHARS_PER_REQUEST = 9500; // Leave some buffer

/**
 * Split text into chunks at sentence boundaries, respecting max character limit.
 */
function splitTextIntoChunks(text: string, maxChars: number = MAX_CHARS_PER_REQUEST): string[] {
  if (text.length <= maxChars) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      chunks.push(remaining);
      break;
    }

    // Find a good break point (sentence end) before maxChars
    let breakPoint = maxChars;

    // Look for sentence endings (. ! ?) followed by space or end
    const searchRegion = remaining.substring(0, maxChars);
    const sentenceEnds = Array.from(searchRegion.matchAll(/[.!?][\s"')\]]*(?=\s|$)/g));

    if (sentenceEnds.length > 0) {
      // Use the last sentence ending found
      const lastMatch = sentenceEnds[sentenceEnds.length - 1];
      breakPoint = lastMatch.index! + lastMatch[0].length;
    } else {
      // No sentence end found, look for other break points
      // Try paragraph break, then comma, then space
      const paragraphBreak = searchRegion.lastIndexOf('\n\n');
      const commaBreak = searchRegion.lastIndexOf(', ');
      const spaceBreak = searchRegion.lastIndexOf(' ');

      if (paragraphBreak > maxChars * 0.5) {
        breakPoint = paragraphBreak + 2;
      } else if (commaBreak > maxChars * 0.5) {
        breakPoint = commaBreak + 2;
      } else if (spaceBreak > 0) {
        breakPoint = spaceBreak + 1;
      }
      // If no good break found, just use maxChars (will break mid-word)
    }

    chunks.push(remaining.substring(0, breakPoint).trim());
    remaining = remaining.substring(breakPoint).trim();
  }

  return chunks.filter(chunk => chunk.length > 0);
}

export interface TextToSpeechResult {
  audio: Buffer;
  requestId: string;
  alignment?: {
    characters: string[];
    characterStartTimesSeconds: number[];
    characterEndTimesSeconds: number[];
  };
}

export interface ConvertWithStitchingParams {
  text: string;
  voiceId: string;
  previousText?: string;
  nextText?: string;
  modelId?: string;
}

/**
 * ElevenLabs service wrapper with request stitching support.
 * Request stitching helps maintain consistent voice and prosody across multiple TTS requests.
 *
 * Two methods of stitching:
 * 1. Text-based: `previous_text` and `next_text` provide text context
 * 2. Request ID-based: `previous_request_ids` use actual generated audio context (more accurate)
 *
 * Note: Request IDs expire after 2 hours, so they should only be used within a single ingestion session.
 */
export class ElevenLabsService {
  private client: ElevenLabsClient;
  private previousRequestIds: string[] = [];
  private readonly MAX_REQUEST_IDS = 3; // ElevenLabs recommends keeping last 3

  constructor(apiKey: string) {
    this.client = new ElevenLabsClient({ apiKey });
  }

  /**
   * Reset context for a new book/session.
   * Call this before starting a new ingestion.
   */
  resetContext(): void {
    this.previousRequestIds = [];
  }

  /**
   * Get the current request IDs for stitching.
   * Useful for passing to subtasks if needed.
   */
  getRequestIds(): string[] {
    return [...this.previousRequestIds];
  }

  /**
   * Set request IDs from a previous session.
   * Useful for resuming stitching in subtasks.
   */
  setRequestIds(ids: string[]): void {
    this.previousRequestIds = ids.slice(-this.MAX_REQUEST_IDS);
  }

  /**
   * Convert text to speech with request stitching for context continuity.
   * Automatically handles chunking for text exceeding ElevenLabs' 10k char limit.
   *
   * @param params - Conversion parameters
   * @returns Audio buffer, request ID, and optional character-level alignment
   */
  async convertWithStitching(params: ConvertWithStitchingParams): Promise<TextToSpeechResult> {
    const { text, voiceId, previousText, nextText, modelId = 'eleven_multilingual_v2' } = params;

    // Split text into chunks if needed
    const chunks = splitTextIntoChunks(text);

    if (chunks.length === 1) {
      // Single chunk - use standard processing
      return this.convertSingleChunk(chunks[0], voiceId, previousText, nextText, modelId);
    }

    // Multiple chunks - process sequentially and concatenate
    console.log(`Processing ${chunks.length} chunks for text of ${text.length} characters`);

    const audioBuffers: Buffer[] = [];
    const allCharacters: string[] = [];
    const allStartTimes: number[] = [];
    const allEndTimes: number[] = [];
    let cumulativeDuration = 0;
    let lastRequestId = '';

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isFirst = i === 0;
      const isLast = i === chunks.length - 1;

      // For context stitching between chunks:
      // - First chunk uses previousText from params
      // - Middle/last chunks use end of previous chunk as context
      // - Last chunk uses nextText from params
      const chunkPrevText = isFirst ? previousText : chunks[i - 1].slice(-500);
      const chunkNextText = isLast ? nextText : chunks[i + 1].slice(0, 500);

      const result = await this.convertSingleChunk(
        chunk,
        voiceId,
        chunkPrevText,
        chunkNextText,
        modelId
      );

      audioBuffers.push(result.audio);
      lastRequestId = result.requestId;

      // Merge alignment data with time offset
      if (result.alignment) {
        allCharacters.push(...result.alignment.characters);
        allStartTimes.push(...result.alignment.characterStartTimesSeconds.map(t => t + cumulativeDuration));
        allEndTimes.push(...result.alignment.characterEndTimesSeconds.map(t => t + cumulativeDuration));

        // Calculate duration of this chunk for offset
        const chunkEndTimes = result.alignment.characterEndTimesSeconds;
        if (chunkEndTimes.length > 0) {
          cumulativeDuration += Math.max(...chunkEndTimes);
        }
      }
    }

    // Concatenate audio buffers
    const combinedAudio = Buffer.concat(audioBuffers);

    // Build merged alignment
    const alignment = allCharacters.length > 0
      ? {
          characters: allCharacters,
          characterStartTimesSeconds: allStartTimes,
          characterEndTimesSeconds: allEndTimes,
        }
      : undefined;

    return {
      audio: combinedAudio,
      requestId: lastRequestId,
      alignment,
    };
  }

  /**
   * Convert a single chunk of text (under 10k chars).
   */
  private async convertSingleChunk(
    text: string,
    voiceId: string,
    previousText?: string,
    nextText?: string,
    modelId: string = 'eleven_multilingual_v2'
  ): Promise<TextToSpeechResult> {
    // Use the endpoint with alignment for character-level timestamps
    // SDK uses camelCase property names that get serialized to snake_case
    const response = await this.client.textToSpeech.convertWithTimestamps(voiceId, {
      text,
      modelId,
      previousText,
      nextText,
      previousRequestIds: this.previousRequestIds.length > 0 ? this.previousRequestIds : undefined,
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
      },
    });

    // Extract audio and alignment from response
    const audioBase64 = response.audioBase64;
    const audio = Buffer.from(audioBase64, 'base64');

    // Extract request ID from response header or generate one
    // Note: The SDK may expose this differently - adjust as needed
    const requestId = (response as any).requestId || `req_${Date.now()}`;

    // Track request ID for future stitching (keep last 3, they expire after 2 hours)
    this.previousRequestIds.push(requestId);
    if (this.previousRequestIds.length > this.MAX_REQUEST_IDS) {
      this.previousRequestIds.shift();
    }

    // Extract alignment data if available
    const alignment = response.alignment
      ? {
          characters: response.alignment.characters,
          characterStartTimesSeconds: response.alignment.characterStartTimesSeconds,
          characterEndTimesSeconds: response.alignment.characterEndTimesSeconds,
        }
      : undefined;

    return { audio, requestId, alignment };
  }

  /**
   * Simple text-to-speech without stitching context.
   * Use for standalone conversions where context doesn't matter.
   */
  async convert(voiceId: string, text: string, modelId = 'eleven_multilingual_v2'): Promise<Buffer> {
    const audioStream = await this.client.textToSpeech.convert(voiceId, {
      text,
      modelId,
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
      },
    });

    // Collect the ReadableStream into a buffer
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    return Buffer.concat(chunks);
  }

  /**
   * Get list of available voices.
   */
  async getVoices() {
    return this.client.voices.getAll();
  }

  /**
   * Get a specific voice by ID.
   */
  async getVoice(voiceId: string) {
    return this.client.voices.get(voiceId);
  }

  /**
   * Get user subscription info (useful for tracking usage/costs).
   */
  async getUserInfo() {
    return this.client.user.subscription.get();
  }
}

// Singleton instance factory
let instance: ElevenLabsService | null = null;

export function getElevenLabsService(apiKey: string): ElevenLabsService {
  if (!instance) {
    instance = new ElevenLabsService(apiKey);
  }
  return instance;
}

export function resetElevenLabsService(): void {
  instance = null;
}
