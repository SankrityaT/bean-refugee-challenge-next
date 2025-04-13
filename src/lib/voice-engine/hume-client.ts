import { HumeStreamResponse, HumeVoiceConfig, HumeApiResponse } from '@/types/hume';

export class HumeClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.hume.ai/v0';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY || '';
    
    // Validate API key is available
    if (!this.apiKey) {
      console.error('Hume API key is missing. Please set NEXT_PUBLIC_HUME_API_KEY in your environment variables.');
    }
  }

  async createVoiceStream(text: string, voiceId: string, config: HumeVoiceConfig): Promise<HumeApiResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Hume API key is missing. Please set NEXT_PUBLIC_HUME_API_KEY in your environment variables.');
      }
      
      const url = `${this.baseUrl}/voice/stream`;
      console.log('Calling Hume API:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...config,
          voice_id: voiceId,
          text
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Hume API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Hume API error (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Hume API response:', data);
      return data;
    } catch (error) {
      console.error('Error in createVoiceStream:', error);
      throw error;
    }
  }

  async getAudioUrl(streamId: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('Hume API key is missing. Please set NEXT_PUBLIC_HUME_API_KEY in your environment variables.');
      }
      
      const url = `${this.baseUrl}/voice/stream/${streamId}`;
      console.log('Fetching audio URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Hume API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Failed to get audio URL (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      if (!data.url) {
        console.warn('No URL in Hume API response:', data);
        throw new Error('No URL found in Hume API response');
      }
      
      return data.url;
    } catch (error) {
      console.error('Error in getAudioUrl:', error);
      throw error;
    }
  }
}