import { EmotionType } from '../ai-negotiation/shared-types';

/**
 * Detect emotions from text using our Python server's emotion detection API
 * @param text Text to analyze for emotions
 * @returns Detected emotion type and raw emotion data
 */
export async function detectEmotionsWithHume(text: string): Promise<{
  dominantEmotion: EmotionType;
  emotions: Array<{ name: string; score: number }>;
}> {
  try {
    // Call our Python server's emotion detection endpoint
    const response = await fetch('http://localhost:5001/api/emotion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error(`Error detecting emotions: ${response.statusText}`);
      // Return neutral as fallback
      return {
        dominantEmotion: 'neutral',
        emotions: []
      };
    }

    const data = await response.json();
    
    // If no emotions data, fall back to stance-based emotion
    if (!data.dominantEmotion) {
      return {
        dominantEmotion: 'neutral',
        emotions: []
      };
    }
    
    return {
      dominantEmotion: data.dominantEmotion as EmotionType,
      emotions: data.emotions || []
    };
  } catch (error) {
    console.error('Error detecting emotions with Hume:', error);
    // Return neutral as fallback
    return {
      dominantEmotion: 'neutral',
      emotions: []
    };
  }
}

/**
 * Get emotion color based on emotion type
 * @param emotion Emotion type
 * @returns CSS color class
 */
export function getEmotionColor(emotion: EmotionType): string {
  const emotionColors: Record<EmotionType, string> = {
    'neutral': 'text-gray-600',
    'anger': 'text-red-600',
    'compassion': 'text-pink-600',
    'frustration': 'text-orange-600',
    'enthusiasm': 'text-green-600',
    'concern': 'text-amber-600'
  };
  
  return emotionColors[emotion] || emotionColors.neutral;
}

/**
 * Get emotion background color based on emotion type
 * @param emotion Emotion type
 * @returns CSS background color class
 */
export function getEmotionBgColor(emotion: EmotionType): string {
  const emotionBgColors: Record<EmotionType, string> = {
    'neutral': 'bg-gray-100',
    'anger': 'bg-red-50',
    'compassion': 'bg-pink-50',
    'frustration': 'bg-orange-50',
    'enthusiasm': 'bg-green-50',
    'concern': 'bg-amber-50'
  };
  
  return emotionBgColors[emotion] || emotionBgColors.neutral;
}
