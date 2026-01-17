import type { TextToSpeechResult } from './elevenlabs-service';

// Re-export types and model definitions from client-safe module
export type {
  TTSProvider,
  OpenAIModel,
  ElevenLabsModel,
  TTSModel,
  ModelInfo,
} from './tts-models';

export {
  OPENAI_MODELS,
  ELEVENLABS_MODELS,
  getModelsForProvider,
  getDefaultModel,
} from './tts-models';

// Import types for use in this file
import type { TTSProvider, TTSModel, OpenAIModel, ElevenLabsModel } from './tts-models';

export interface TTSResult {
  audio: Buffer;
  requestId?: string;
  alignment?: {
    characters: string[];
    characterStartTimesSeconds: number[];
    characterEndTimesSeconds: number[];
  };
}

export interface ConvertTextToSpeechParams {
  text: string;
  voiceId: string;
  provider: TTSProvider;
  apiKey: string;
  model?: TTSModel;
  // ElevenLabs-specific stitching params (ignored for OpenAI)
  previousText?: string;
  nextText?: string;
  previousRequestIds?: string[];
}

/**
 * Convert text to speech using the specified provider.
 *
 * This factory function abstracts the TTS provider, allowing the caller
 * to switch between ElevenLabs and OpenAI without changing the call site.
 *
 * Note: OpenAI TTS doesn't support request stitching or character alignment.
 * The previousText, nextText, and previousRequestIds params are ignored for OpenAI.
 */
export async function convertTextToSpeech(params: ConvertTextToSpeechParams): Promise<TTSResult> {
  const { text, voiceId, provider, apiKey, model, previousText, nextText } = params;

  if (provider === 'openai') {
    const { OpenAITTSService } = await import('./openai-tts-service');
    const service = new OpenAITTSService(apiKey);

    // OpenAI has a 4096 char limit - use chunking method
    // Default to tts-1-hd for higher quality audiobook narration
    const openaiModel = (model as OpenAIModel) || 'tts-1-hd';
    const result = await service.convertWithChunking({
      text,
      voiceId: voiceId as any,
      model: openaiModel,
    });

    return {
      audio: result.audio,
      // OpenAI doesn't return request IDs or alignment data
    };
  } else {
    // Default to ElevenLabs
    const { ElevenLabsService } = await import('./elevenlabs-service');
    const service = new ElevenLabsService(apiKey);

    // Default to eleven_multilingual_v2 for best quality
    const elevenModel = (model as ElevenLabsModel) || 'eleven_multilingual_v2';
    const result = await service.convertWithStitching({
      text,
      voiceId,
      previousText,
      nextText,
      modelId: elevenModel,
    });

    return {
      audio: result.audio,
      requestId: result.requestId,
      alignment: result.alignment,
    };
  }
}

export interface VoiceInfo {
  voiceId: string;
  provider: TTSProvider;
  name: string;
  description?: string;
  previewUrl?: string;
}

/**
 * Get available voices for a provider.
 *
 * For OpenAI, returns the static list of 6 predefined voices.
 * For ElevenLabs, fetches voices from the API.
 */
export async function getProviderVoices(provider: TTSProvider, apiKey?: string): Promise<VoiceInfo[]> {
  if (provider === 'openai') {
    const { OpenAITTSService } = await import('./openai-tts-service');
    return OpenAITTSService.getVoices().map(voice => ({
      ...voice,
      provider: 'openai' as TTSProvider,
    }));
  } else {
    // ElevenLabs requires API key to fetch voices
    if (!apiKey) {
      throw new Error('API key required for ElevenLabs voices');
    }

    const { ElevenLabsService } = await import('./elevenlabs-service');
    const service = new ElevenLabsService(apiKey);
    const response = await service.getVoices();

    return response.voices.map(voice => ({
      voiceId: voice.voiceId,
      provider: 'elevenlabs' as TTSProvider,
      name: voice.name || 'Unknown Voice',
      description: (voice.labels as Record<string, string>)?.description,
      previewUrl: voice.previewUrl || undefined,
    }));
  }
}

/**
 * Check if a voice ID is valid for a given provider.
 */
export function isValidVoiceForProvider(voiceId: string, provider: TTSProvider): boolean {
  if (provider === 'openai') {
    const validVoices = ['alloy', 'ash', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'];
    return validVoices.includes(voiceId);
  }
  // ElevenLabs voice IDs are UUIDs - basic validation
  return voiceId.length > 0;
}
