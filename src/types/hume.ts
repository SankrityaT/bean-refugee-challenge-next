export interface HumeStreamResponse {
  stream_id: string;
  status: string;
  url?: string;
  error?: string;
}

export interface HumeVoiceConfig {
  voice_id: string;
  text: string;
  acting_instructions?: string;
  continuation?: boolean;
  speaking_style?: {
    emotion: string;
    intensity: number;
    speaking_rate: number;
    speaking_pitch: number;
  };
}

export interface HumeApiResponse {
  status: string;
  stream_id?: string;
  url?: string;
  error?: string;
  audio_url?: string;
}

export interface HumeErrorResponse {
  error: {
    message: string;
    code: string;
  };
}