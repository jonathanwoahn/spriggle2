import OpenAI from 'openai';
import type { OpenAIVoice, OpenAIModel } from './tts-models';
import { OPENAI_VOICES, getOpenAIVoicesForModel } from './tts-models';

export type { OpenAIVoice, OpenAIModel };

export interface OpenAITTSConvertParams {
  text: string;
  voiceId: OpenAIVoice;
  model?: OpenAIModel;
}

export interface OpenAITTSResult {
  audio: Buffer;
}

export interface OpenAIVoiceInfo {
  voiceId: OpenAIVoice;
  name: string;
  description: string;
}

export class OpenAITTSService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Convert text to speech using OpenAI TTS
   * Note: OpenAI TTS has a 4096 character limit per request
   */
  async convert(params: OpenAITTSConvertParams): Promise<OpenAITTSResult> {
    const { text, voiceId, model = 'tts-1' } = params;

    const response = await this.openai.audio.speech.create({
      model,
      voice: voiceId,
      input: text,
      response_format: 'mp3',
    });

    const arrayBuffer = await response.arrayBuffer();
    const audio = Buffer.from(arrayBuffer);

    return { audio };
  }

  /**
   * Convert text to speech, automatically chunking if text exceeds limit
   */
  async convertWithChunking(params: OpenAITTSConvertParams): Promise<OpenAITTSResult> {
    const { text, voiceId, model = 'tts-1' } = params;
    const MAX_CHARS = 4096;

    // If text is within limit, use simple convert
    if (text.length <= MAX_CHARS) {
      return this.convert(params);
    }

    // Split text into chunks at sentence boundaries
    const chunks = this.splitTextIntoChunks(text, MAX_CHARS);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const result = await this.convert({ text: chunk, voiceId, model });
      audioBuffers.push(result.audio);
    }

    // Concatenate audio buffers (simple approach - may need proper audio merging)
    const audio = Buffer.concat(audioBuffers);
    return { audio };
  }

  /**
   * Split text into chunks at sentence boundaries
   */
  private splitTextIntoChunks(text: string, maxChars: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    // Split by sentences (periods, exclamation marks, question marks)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= maxChars) {
        currentChunk += sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        // If a single sentence is too long, split by words
        if (sentence.length > maxChars) {
          const words = sentence.split(' ');
          currentChunk = '';
          for (const word of words) {
            if (currentChunk.length + word.length + 1 <= maxChars) {
              currentChunk += (currentChunk ? ' ' : '') + word;
            } else {
              if (currentChunk) {
                chunks.push(currentChunk.trim());
              }
              currentChunk = word;
            }
          }
        } else {
          currentChunk = sentence;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Get available OpenAI TTS voices for a specific model
   * @param model - Optional model to filter voices by. If not provided, returns all voices.
   */
  static getVoices(model?: OpenAIModel): OpenAIVoiceInfo[] {
    const voices = model ? getOpenAIVoicesForModel(model) : OPENAI_VOICES;
    return voices.map(v => ({
      voiceId: v.voiceId,
      name: v.name,
      description: v.description,
    }));
  }

  /**
   * Get all available OpenAI TTS voices (all 13)
   */
  static getAllVoices(): OpenAIVoiceInfo[] {
    return OPENAI_VOICES.map(v => ({
      voiceId: v.voiceId,
      name: v.name,
      description: v.description,
    }));
  }
}
