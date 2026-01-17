// TTS Model definitions - safe for client-side use
// This file contains only type definitions and static data

export type TTSProvider = 'elevenlabs' | 'openai';

// OpenAI TTS models
export type OpenAIModel = 'tts-1' | 'tts-1-hd' | 'gpt-4o-mini-tts';

// ElevenLabs models
export type ElevenLabsModel =
  | 'eleven_multilingual_v2'
  | 'eleven_v3'
  | 'eleven_turbo_v2_5'
  | 'eleven_flash_v2_5';

// Union type for all models
export type TTSModel = OpenAIModel | ElevenLabsModel;

// OpenAI voice types
export type OpenAIVoice =
  | 'alloy' | 'ash' | 'coral' | 'echo' | 'fable'
  | 'nova' | 'onyx' | 'sage' | 'shimmer'
  | 'ballad' | 'verse' | 'marin' | 'cedar';

// Model definitions with metadata
export interface ModelInfo {
  id: TTSModel;
  name: string;
  description: string;
  provider: TTSProvider;
}

// Voice definitions with metadata
export interface OpenAIVoiceInfo {
  voiceId: OpenAIVoice;
  name: string;
  description: string;
  // Which models support this voice
  supportedModels: OpenAIModel[];
}

export const OPENAI_MODELS: ModelInfo[] = [
  { id: 'gpt-4o-mini-tts', name: 'GPT-4o Mini TTS', description: 'Latest model, best quality, all 13 voices', provider: 'openai' },
  { id: 'tts-1-hd', name: 'TTS-1 HD', description: 'High quality, 9 classic voices', provider: 'openai' },
  { id: 'tts-1', name: 'TTS-1', description: 'Standard quality, lower latency', provider: 'openai' },
];

export const ELEVENLABS_MODELS: ModelInfo[] = [
  { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Best quality, supports 29 languages', provider: 'elevenlabs' },
  { id: 'eleven_v3', name: 'Eleven v3', description: 'Latest model with improved quality', provider: 'elevenlabs' },
  { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5', description: 'Faster generation with great quality', provider: 'elevenlabs' },
  { id: 'eleven_flash_v2_5', name: 'Flash v2.5', description: 'Fastest, good for real-time', provider: 'elevenlabs' },
];

// All OpenAI voices with model compatibility
// tts-1 and tts-1-hd support 9 classic voices
// gpt-4o-mini-tts supports all 13 voices including 4 new ones
const ALL_OPENAI_MODELS: OpenAIModel[] = ['tts-1', 'tts-1-hd', 'gpt-4o-mini-tts'];
const CLASSIC_MODELS: OpenAIModel[] = ['tts-1', 'tts-1-hd', 'gpt-4o-mini-tts'];
const GPT4O_ONLY: OpenAIModel[] = ['gpt-4o-mini-tts'];

export const OPENAI_VOICES: OpenAIVoiceInfo[] = [
  // Classic voices (available on all models)
  { voiceId: 'alloy', name: 'Alloy', description: 'Neutral and balanced', supportedModels: ALL_OPENAI_MODELS },
  { voiceId: 'ash', name: 'Ash', description: 'Clear and precise', supportedModels: ALL_OPENAI_MODELS },
  { voiceId: 'coral', name: 'Coral', description: 'Warm and friendly', supportedModels: ALL_OPENAI_MODELS },
  { voiceId: 'echo', name: 'Echo', description: 'Resonant and deep', supportedModels: ALL_OPENAI_MODELS },
  { voiceId: 'fable', name: 'Fable', description: 'Expressive and dynamic', supportedModels: CLASSIC_MODELS },
  { voiceId: 'nova', name: 'Nova', description: 'Friendly and conversational', supportedModels: CLASSIC_MODELS },
  { voiceId: 'onyx', name: 'Onyx', description: 'Deep and authoritative', supportedModels: CLASSIC_MODELS },
  { voiceId: 'sage', name: 'Sage', description: 'Calm and thoughtful', supportedModels: ALL_OPENAI_MODELS },
  { voiceId: 'shimmer', name: 'Shimmer', description: 'Bright and energetic', supportedModels: ALL_OPENAI_MODELS },
  // New voices (gpt-4o-mini-tts only)
  { voiceId: 'ballad', name: 'Ballad', description: 'Melodic and smooth', supportedModels: GPT4O_ONLY },
  { voiceId: 'verse', name: 'Verse', description: 'Versatile and expressive', supportedModels: GPT4O_ONLY },
  { voiceId: 'marin', name: 'Marin', description: 'Fresh and coastal (recommended)', supportedModels: GPT4O_ONLY },
  { voiceId: 'cedar', name: 'Cedar', description: 'Warm and grounded (recommended)', supportedModels: GPT4O_ONLY },
];

export function getModelsForProvider(provider: TTSProvider): ModelInfo[] {
  return provider === 'openai' ? OPENAI_MODELS : ELEVENLABS_MODELS;
}

export function getDefaultModel(provider: TTSProvider): TTSModel {
  return provider === 'openai' ? 'gpt-4o-mini-tts' : 'eleven_multilingual_v2';
}

// Get voices compatible with a specific OpenAI model
export function getOpenAIVoicesForModel(model: OpenAIModel): OpenAIVoiceInfo[] {
  return OPENAI_VOICES.filter(voice => voice.supportedModels.includes(model));
}
