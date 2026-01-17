export interface Voice {
  voice_id: string;
  name: string;
  samples: unknown[] | null;
  category: string;
  fine_tuning: {
    is_allowed_to_fine_tune: boolean;
    state: Record<string, unknown>;
  };
  labels: Record<string, string>;
  description: string | null;
  preview_url: string;
  available_for_tiers: string[];
  settings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  } | null;
  sharing: unknown | null;
  high_quality_base_model_ids: string[];
}

export interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  speed?: number;
}

export interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

export interface TextToSpeechWithTimestampsResponse {
  audio_base64: string;
  alignment: ElevenLabsAlignment;
  normalized_alignment?: ElevenLabsAlignment;
}

export class ElevenLabs {
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(private apiKey: string) {}

  async getVoices(): Promise<Voice[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch voices: ${error}`);
    }

    const data = await response.json();
    return data.voices || [];
  }

  async getVoice(voiceId: string): Promise<Voice> {
    const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch voice: ${error}`);
    }

    return response.json();
  }

  async textToSpeechWithTimestamps(
    voiceId: string,
    text: string,
    options?: {
      model_id?: string;
      voice_settings?: VoiceSettings;
      output_format?: string;
    }
  ): Promise<TextToSpeechWithTimestampsResponse> {
    const response = await fetch(
      `${this.baseUrl}/text-to-speech/${voiceId}/with-timestamps`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: options?.model_id || 'eleven_multilingual_v2',
          voice_settings: options?.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
          },
          output_format: options?.output_format || 'mp3_44100_128',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to convert text to speech: ${error}`);
    }

    return response.json();
  }

  async textToSpeech(
    voiceId: string,
    text: string,
    options?: {
      model_id?: string;
      voice_settings?: VoiceSettings;
      output_format?: string;
    }
  ): Promise<ArrayBuffer> {
    const response = await fetch(
      `${this.baseUrl}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: options?.model_id || 'eleven_multilingual_v2',
          voice_settings: options?.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to convert text to speech: ${error}`);
    }

    return response.arrayBuffer();
  }

  async getModels(): Promise<{ model_id: string; name: string; description: string }[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch models: ${error}`);
    }

    return response.json();
  }

  async getUserInfo(): Promise<{
    subscription: {
      tier: string;
      character_count: number;
      character_limit: number;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/user`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch user info: ${error}`);
    }

    return response.json();
  }
}
