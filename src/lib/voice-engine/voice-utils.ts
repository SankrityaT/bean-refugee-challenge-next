'use client';

import { EmotionMapping } from '@/types/agents';
import { HumeClient } from './hume-client';

// Add TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Voice options for speech synthesis
export interface VoiceOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Speech recognition controller options
export interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

// Speech recognition callbacks
export interface SpeechRecognitionCallbacks {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

// Get available voices
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return [];
  }
  
  return window.speechSynthesis.getVoices();
};

// Get voice characteristics based on emotion
export const getVoiceCharacteristics = (
  emotion: keyof EmotionMapping = 'neutral'
): VoiceOptions => {
  // Default voice options
  const defaultOptions: VoiceOptions = {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  };
  
  // Adjust voice characteristics based on emotion
  switch (emotion) {
    case 'anger':
      return {
        ...defaultOptions,
        rate: 1.3,
        pitch: 1.2,
        volume: 1.0
      };
    case 'compassion':
      return {
        ...defaultOptions,
        rate: 0.9,
        pitch: 0.9,
        volume: 0.8
      };
    case 'frustration':
      return {
        ...defaultOptions,
        rate: 1.1,
        pitch: 1.1,
        volume: 0.9
      };
    case 'enthusiasm':
      return {
        ...defaultOptions,
        rate: 1.2,
        pitch: 1.1,
        volume: 1.0
      };
    case 'concern':
      return {
        ...defaultOptions,
        rate: 0.95,
        pitch: 0.95,
        volume: 0.9
      };
    case 'neutral':
    default:
      return defaultOptions;
  }
};

// Speak text using browser's speech synthesis
export const speakText = async (
  text: string,
  voiceOptions: {
    voiceId?: string;
    emotion?: string;
    intensity?: number;
    rate?: number;
    pitch?: number;
  },
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> => {
  const humeClient = new HumeClient();

  try {
    // Use Hume voices if voiceId is provided
    if (voiceOptions.voiceId) {
      const config = {
        voice_id: voiceOptions.voiceId,
        text,
        speaking_style: {
          emotion: voiceOptions.emotion || 'neutral',
          intensity: voiceOptions.intensity || 0.8,
          speaking_rate: voiceOptions.rate || 1.0,
          speaking_pitch: voiceOptions.pitch || 1.0
        }
      };

      const response = await humeClient.createVoiceStream(text, voiceOptions.voiceId, config);
      
      if (response.stream_id) {
        let attempts = 0;
        while (attempts < 10) {
          const audioUrl = await humeClient.getAudioUrl(response.stream_id);
          if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.onplay = onStart;
            audio.onended = onEnd;
            await audio.play();
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
      }
      throw new Error('Failed to get audio URL');
    }

    // Fallback to browser TTS if no Hume voice ID provided
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceOptions.rate || 1;
    utterance.pitch = voiceOptions.pitch || 1;
    
    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Speech synthesis error:', error);
    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(text);
    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  }
};

// Speech recognition controller
export class SpeechRecognitionController {
  private recognition: any;
  private options: SpeechRecognitionOptions;
  private callbacks: SpeechRecognitionCallbacks;
  private isListening: boolean = false;
  
  constructor(
    options: SpeechRecognitionOptions = {},
    callbacks: SpeechRecognitionCallbacks = {}
  ) {
    this.options = options;
    this.callbacks = callbacks;
    
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      } else {
        console.warn('Speech recognition not supported in this browser');
      }
    }
  }
  
  private setupRecognition(): void {
    if (!this.recognition) return;
    
    // Set options
    this.recognition.continuous = this.options.continuous || false;
    this.recognition.interimResults = this.options.interimResults || false;
    this.recognition.lang = this.options.lang || 'en-US';
    
    // Set event handlers
    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      const isFinal = event.results[event.results.length - 1].isFinal;
      
      if (this.callbacks.onResult) {
        this.callbacks.onResult(transcript, isFinal);
      }
    };
    
    this.recognition.onstart = () => {
      this.isListening = true;
      
      if (this.callbacks.onStart) {
        this.callbacks.onStart();
      }
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd();
      }
    };
    
    this.recognition.onerror = (error: any) => {
      this.isListening = false;
      
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    };
  }
  
  // Start listening
  public start(): void {
    if (!this.recognition) {
      console.warn('Speech recognition not supported');
      return;
    }
    
    if (!this.isListening) {
      this.recognition.start();
    }
  }
  
  // Stop listening
  public stop(): void {
    if (!this.recognition) return;
    
    if (this.isListening) {
      this.recognition.stop();
    }
  }
  
  // Check if listening
  public isActive(): boolean {
    return this.isListening;
  }
}

// Detect emotion from text
export const detectEmotion = (text: string): keyof EmotionMapping => {
  const lowerText = text.toLowerCase();
  
  // Simple keyword-based emotion detection
  if (lowerText.includes('angry') || 
      lowerText.includes('furious') || 
      lowerText.includes('outraged')) {
    return 'anger';
  }
  
  if (lowerText.includes('care') || 
      lowerText.includes('compassion') || 
      lowerText.includes('empathy')) {
    return 'compassion';
  }
  
  if (lowerText.includes('frustrated') || 
      lowerText.includes('annoyed') || 
      lowerText.includes('irritated')) {
    return 'frustration';
  }
  
  if (lowerText.includes('excited') || 
      lowerText.includes('enthusiastic') || 
      lowerText.includes('thrilled')) {
    return 'enthusiasm';
  }
  
  if (lowerText.includes('concerned') || 
      lowerText.includes('worried') || 
      lowerText.includes('anxious')) {
    return 'concern';
  }
  
  return 'neutral';
};