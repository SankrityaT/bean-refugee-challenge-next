'use client';

import { EmotionMapping } from '@/types/agents';
import { HumeClient } from './hume-client';
import { HumeVoiceConfig } from '@/types/hume';

// Emotion mapping for Hume EVI
const emotionMap: Record<string, string> = {
  neutral: 'neutral',
  anger: 'anger',
  compassion: 'caring',
  frustration: 'exasperation',
  enthusiasm: 'excitement',
  concern: 'concern'
};

// Voice mapping for agents with acting instructions
// Fix voiceMap structure
const voiceMap: Record<string, { id: string; instructions: string }> = {
  'minister-santos': {
    id: 'ee96fb5f-ec1a-4f41-a9ba-6d119e64c8fd',
    instructions: 'You are Minister Santos, a government official with a neoliberal stance. Speak professionally and authoritatively about refugee policies.'
  },
  'dr-chen': {
    id: '5bb7de05-c8fe-426a-8fcc-ba4fc4ce9f9c',
    instructions: 'You are Dr. Chen, an education expert. Speak analytically and thoughtfully about educational access for refugees.'
  },
  'mayor-okonjo': {
    id: 'f042c0be-b7cc-4a59-bea2-65f23e12c710',
    instructions: 'You are Mayor Okonjo, a local government leader. Speak pragmatically about community integration.'
  },
  'ms-patel': {
    id: 'c7aa10be-57c1-4647-9306-7ac48dde3536',
    instructions: 'You are Ms. Patel, a community advocate. Speak empathetically about refugee welfare and support.'
  }
};

const getSpeakingRate = (emotion: keyof EmotionMapping): number => {
  switch (emotion) {
    case 'enthusiasm': return 1.2;
    case 'anger': return 1.3;
    case 'frustration': return 1.1;
    default: return 1.0;
  }
};

const getSpeakingPitch = (emotion: keyof EmotionMapping): number => {
  switch (emotion) {
    case 'enthusiasm': return 1.1;
    case 'compassion': return 0.9;
    case 'concern': return 0.95;
    default: return 1.0;
  }
};

// Check if Hume API key is available
const isHumeApiKeyAvailable = (): boolean => {
  const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY;
  return typeof apiKey === 'string' && apiKey.length > 0;
};

// Validate voice ID format (UUID v4)
const isValidVoiceId = (voiceId: string): boolean => {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(voiceId);
};

export const generateHumeSpeech = async (
  text: string,
  agentId: string,
  emotion: keyof EmotionMapping = 'neutral'
): Promise<{ audioUrl: string; error?: string }> => {
  if (!isHumeApiKeyAvailable()) {
    throw new Error('Hume API key is not available. Please set the NEXT_PUBLIC_HUME_API_KEY environment variable.');
  }

  const humeClient = new HumeClient();
  
  try {
    const voice = voiceMap[agentId];
    if (!voice) {
      throw new Error(`Voice not found for agent: ${agentId}`);
    }

    if (!isValidVoiceId(voice.id)) {
      throw new Error(`Invalid voice ID format for agent: ${agentId}`);
    }

    const config: HumeVoiceConfig = {
      voice_id: voice.id,
      text,
      acting_instructions: voice.instructions,
      continuation: true,
      speaking_style: {
        emotion: emotionMap[emotion] || 'neutral',
        intensity: emotion === 'neutral' ? 0.5 : 0.8,
        speaking_rate: getSpeakingRate(emotion),
        speaking_pitch: getSpeakingPitch(emotion)
      }
    };

    // Use voice stream endpoint instead of chat
    const response = await humeClient.createVoiceStream(text, voice.id, config);
    
    if (!response || !response.stream_id) {
      throw new Error('Invalid response from Hume API');
    }
    
    // Poll for audio URL with exponential backoff
    let attempts = 0;
    let delay = 500; // Start with 500ms delay
    const maxDelay = 5000; // Max delay of 5 seconds
    const maxAttempts = 20; // Maximum 20 attempts (about 30 seconds total with backoff)
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        const audioUrl = await humeClient.getAudioUrl(response.stream_id);
        if (audioUrl) {
          return { audioUrl };
        }
      } catch (error) {
        console.warn(`Attempt ${attempts + 1} failed:`, error);
        // Continue with next attempt
      }
      
      attempts++;
      // Exponential backoff with max delay
      delay = Math.min(delay * 1.5, maxDelay);
    }
    throw new Error(`Timeout waiting for audio generation after ${maxAttempts} attempts`);
  } catch (error) {
    console.error('Error generating Hume speech:', error);
    throw error; // Let the caller handle the error
  }
};

export const speakWithEmotion = async (
  text: string,
  agentId: string,
  emotion: keyof EmotionMapping = 'neutral',
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> => {
  // Always call onStart and onEnd even if there's an error
  const safeOnEnd = () => {
    try {
      if (onEnd) onEnd();
    } catch (e) {
      console.error('Error in onEnd callback:', e);
    }
  };

  const safeOnStart = () => {
    try {
      if (onStart) onStart();
    } catch (e) {
      console.error('Error in onStart callback:', e);
    }
  };

  try {
    // Check if Hume API key is available before attempting to use it
    if (!isHumeApiKeyAvailable()) {
      console.warn('Hume API key not available, falling back to browser speech synthesis');
      await fallbackToSpeechSynthesis(text, emotion, safeOnStart, safeOnEnd);
      return;
    }

    const { audioUrl } = await generateHumeSpeech(text, agentId, emotion);
    await playHumeAudio(audioUrl, safeOnStart, safeOnEnd);
  } catch (error) {
    console.error('Error in Hume speech synthesis, falling back to browser TTS:', error);
    // Fallback to browser TTS
    await fallbackToSpeechSynthesis(text, emotion, safeOnStart, safeOnEnd);
  }
};

// Fallback to browser's speech synthesis with better error handling
const fallbackToSpeechSynthesis = async (
  text: string,
  emotion: keyof EmotionMapping = 'neutral',
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if browser supports speech synthesis
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      if (onEnd) onEnd();
      resolve();
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = getSpeakingRate(emotion);
    utterance.pitch = getSpeakingPitch(emotion);
    
    // Create a synthetic audio element for pause/resume functionality
    const syntheticAudio = {
      pause: () => window.speechSynthesis.pause(),
      play: () => window.speechSynthesis.resume(),
      currentTime: 0,
      paused: false
    };
    currentAudio = syntheticAudio as any;
    
    if (onStart) utterance.onstart = onStart;
    
    utterance.onend = () => {
      currentAudio = null;
      if (onEnd) onEnd();
      resolve();
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      currentAudio = null;
      if (onEnd) onEnd();
      resolve();
    };
    
    window.speechSynthesis.speak(utterance);
  });
};

export const playHumeAudio = async (
  audioUrl: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!audioUrl) {
      reject('No audio URL provided');
      return;
    }
    
    const audio = new Audio(audioUrl);
    currentAudio = audio; // Assign to the global variable
    
    audio.onplay = () => {
      if (onStart) onStart();
    };
    
    audio.onended = () => {
      if (onEnd) onEnd();
      currentAudio = null; // Clear the reference when audio ends
      resolve();
    };
    
    audio.onerror = (error) => {
      console.error('Error playing Hume audio:', error);
      currentAudio = null; // Clear the reference on error
      reject(error);
    };
    
    audio.play().catch(error => {
      currentAudio = null; // Clear the reference on error
      reject(error);
    });
  });
};

let currentAudio: HTMLAudioElement | null = null;

export const pauseHumeSpeech = (): void => {
  if (currentAudio) {
    currentAudio.pause();
  }
};

export const resumeHumeSpeech = (): void => {
  if (currentAudio) {
    currentAudio.play();
  }
};

export const stopHumeSpeech = (): void => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};