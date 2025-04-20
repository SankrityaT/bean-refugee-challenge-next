import { EmotionType } from '../ai-negotiation/shared-types';

// Voice IDs for different agents - using Hume AI's preset voices
// These are example IDs - you should replace with actual voice IDs from your Hume AI account
const VOICE_IDS = {
  'Minister Santos': 'hume_ai_male_1', // Male, authoritative
  'Dr. Chen': 'hume_ai_female_1', // Female, professional
  'Mayor Okonjo': 'hume_ai_male_2', // Male, confident
  'Community Leader Patel': 'hume_ai_female_2', // Female, warm
  'default': 'hume_ai_male_1' // Default fallback voice
};

// Acting instructions for different emotions
// These are used as 'description' in the Hume AI API to guide voice expression
const EMOTION_INSTRUCTIONS = {
  'neutral': 'Speak in a calm, balanced tone.',
  'anger': 'Speak with controlled frustration and intensity.',
  'compassion': 'Speak with warmth and genuine care.',
  'frustration': 'Speak with a hint of exasperation and concern.',
  'enthusiasm': 'Speak with energy and positive excitement.',
  'concern': 'Speak with thoughtful worry and seriousness.'
};

// Audio element for playing speech
let audioElement: HTMLAudioElement | null = null;

// Flag to track if we're currently using Hume or fallback TTS
let usingHumeTTS = true;

/**
 * Generate and play speech with emotion using Hume AI
 * @param text Text to be spoken
 * @param agentId ID or name of the agent (used to select voice)
 * @param emotion Emotion to convey in speech
 * @param onStart Callback when speech starts
 * @param onEnd Callback when speech ends
 */
export const speakWithEmotion = async (
  text: string,
  agentId: string,
  emotion: EmotionType = 'neutral',
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> => {
  try {
    // Check if Hume API key is configured
    if (!process.env.NEXT_PUBLIC_HUME_API_KEY) {
      throw new Error('Hume API key not configured');
    }
    
    // Clean up any existing audio element
    if (audioElement) {
      audioElement.pause();
      audioElement = null;
    }
    
    // Get the voice ID for the agent
    const voiceId = VOICE_IDS[agentId] || VOICE_IDS.default;
    
    // Get emotion acting instructions
    const description = EMOTION_INSTRUCTIONS[emotion] || EMOTION_INSTRUCTIONS.neutral;
    
    try {
      // Make request to our Flask API server for TTS
      console.log(`Generating speech for: ${text.substring(0, 50)}... with emotion: ${emotion}`);
      
      // Use environment variable for API URL or fallback to localhost for development
      const apiBaseUrl = process.env.NEXT_PUBLIC_HUME_API_SERVER_URL || 'http://localhost:5001';
      
      const response = await fetch(`${apiBaseUrl}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          emotion,
          agentName: agentId
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Flask API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Get audio blob directly from response
      const audioBlob = await response.blob();
      
      // Create object URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Log success for debugging
      console.log('Successfully generated speech with Hume AI TTS API');
      usingHumeTTS = true;
      
      // Create and play audio element with the generated audio
      audioElement = new Audio(audioUrl);
      audioElement.addEventListener('play', () => {
        usingHumeTTS = true;
        if (onStart) onStart();
      });
      audioElement.addEventListener('ended', () => {
        if (onEnd) onEnd();
        URL.revokeObjectURL(audioUrl); // Clean up
      });
      
      // Play the audio
      try {
        await audioElement.play();
      } catch (playError) {
        console.error('Error playing audio:', playError);
        // If autoplay is blocked, show a message to the user
        console.warn('Audio autoplay might be blocked by the browser. User interaction required.');
      }
    } catch (error) {
      console.error('Error using Hume AI TTS:', error);
      console.log('Falling back to browser TTS');
      
      // Use browser TTS as fallback
      useBrowserTTS(text, emotion, onStart, onEnd);
      usingHumeTTS = false;
      return;
    }
    
    // Audio element creation and playback is now handled inside the try block above
  } catch (error) {
    console.error('Error using Hume TTS:', error);
    // Fall back to browser TTS
    useBrowserTTS(text, emotion, onStart, onEnd);
  }
};

/**
 * Pause the currently playing Hume speech
 */
export const pauseHumeSpeech = (): void => {
  if (audioElement && !audioElement.paused) {
    audioElement.pause();
  } else if (usingHumeTTS === false) {
    // If using browser TTS, cancel it
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }
};

/**
 * Resume the paused Hume speech
 */
export const resumeHumeSpeech = (): void => {
  if (audioElement && audioElement.paused) {
    audioElement.play();
  } else if (usingHumeTTS === false) {
    // If using browser TTS, resume it
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }
};

/**
 * Fallback to browser's built-in TTS when Hume API fails
 * @param text Text to be spoken
 * @param emotion Emotion (used to adjust pitch and rate)
 * @param onStart Callback when speech starts
 * @param onEnd Callback when speech ends
 */
const useBrowserTTS = (
  text: string,
  emotion: EmotionType = 'neutral',
  onStart?: () => void,
  onEnd?: () => void
): void => {
  // Check if browser supports speech synthesis
  if (!window.speechSynthesis) {
    console.error('Browser does not support speech synthesis');
    return;
  }
  
  usingHumeTTS = false;
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Adjust speech parameters based on emotion
  switch (emotion) {
    case 'anger':
      utterance.pitch = 1.2;
      utterance.rate = 1.1;
      break;
    case 'compassion':
      utterance.pitch = 0.9;
      utterance.rate = 0.9;
      break;
    case 'frustration':
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      break;
    case 'enthusiasm':
      utterance.pitch = 1.2;
      utterance.rate = 1.2;
      break;
    case 'concern':
      utterance.pitch = 0.8;
      utterance.rate = 0.9;
      break;
    default: // neutral
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
  }
  
  // Set event handlers
  utterance.onstart = () => {
    if (onStart) onStart();
  };
  
  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  
  // Speak the text
  window.speechSynthesis.speak(utterance);
};

/**
 * Get available voice configurations from Hume AI
 * @returns Array of available voice configurations
 */
export const getHumeVoiceConfigs = async (): Promise<any[]> => {
  try {
    // Check if API key is configured
    if (!process.env.NEXT_PUBLIC_HUME_API_KEY) {
      throw new Error('Hume API key not configured');
    }
    
    // Use the current Hume AI TTS voices endpoint
    const response = await fetch('https://api.hume.ai/v0/tts/voices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HUME_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Hume API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching Hume voice configs:', error);
    return [];
  }
};
