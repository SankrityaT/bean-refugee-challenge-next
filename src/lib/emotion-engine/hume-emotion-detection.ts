import { EmotionType } from '@/lib/ai-negotiation/shared-types';

/**
 * Detects emotions in text using Hume AI's Language API via our Python server
 * @param text Text to analyze for emotions
 * @returns Detected emotion type
 */
export const detectEmotionsWithHume = async (text: string): Promise<string> => {
  try {
    // Call our Python server's emotion detection endpoint
    // Use IPv4 address explicitly to avoid IPv6 connection issues
    const humeResponse = await fetch('http://127.0.0.1:5001/api/emotion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text
      })
    });
    
    if (!humeResponse.ok) {
      console.error('Hume API error details:', await humeResponse.text());
      return 'Neutral';
    }
    
    const humeData = await humeResponse.json();
    
    // Log the full emotion data for debugging
    console.log('Hume server-side emotion data:', humeData);
    
    // Return the raw emotion from Hume
    return humeData.dominantEmotion;
  } catch (error) {
    console.error('Error detecting emotions with Hume:', error);
    return 'Neutral';
  }
};

/**
 * Get emotion color based on emotion type
 * @param emotion Emotion type
 * @returns CSS color class
 */
export const getEmotionColor = (emotion: string): string => {
  // Basic emotion categories for UI purposes
  const emotionColors: Record<string, string> = {
    'Neutral': 'text-gray-600',
    'Anger': 'text-red-500',
    'Annoyance': 'text-red-400',
    'Frustration': 'text-orange-500',
    'Disappointment': 'text-orange-400',
    'Enthusiasm': 'text-blue-500',
    'Joy': 'text-blue-400',
    'Excitement': 'text-blue-500',
    'Satisfaction': 'text-blue-400',
    'Compassion': 'text-pink-500',
    'Empathy': 'text-pink-400',
    'Sympathy': 'text-pink-400',
    'Concern': 'text-yellow-500',
    'Anxiety': 'text-yellow-400',
    'Fear': 'text-yellow-600',
  };
  
  // Default to neutral if no match
  return emotionColors[emotion] || 'text-gray-600';
};

/**
 * Get emotion background color based on emotion type
 * @param emotion Emotion type
 * @returns CSS background color class
 */
export const getEmotionBgColor = (emotion: string): string => {
  // Basic emotion categories for UI purposes
  const emotionBgColors: Record<string, string> = {
    'Neutral': 'bg-gray-100',
    'Anger': 'bg-red-100',
    'Annoyance': 'bg-red-50',
    'Frustration': 'bg-orange-100',
    'Disappointment': 'bg-orange-50',
    'Enthusiasm': 'bg-blue-100',
    'Joy': 'bg-blue-50',
    'Excitement': 'bg-blue-100',
    'Satisfaction': 'bg-blue-50',
    'Compassion': 'bg-pink-100',
    'Empathy': 'bg-pink-50',
    'Sympathy': 'bg-pink-50',
    'Concern': 'bg-yellow-100',
    'Anxiety': 'bg-yellow-50',
    'Fear': 'bg-yellow-100',
  };
  
  // Default to neutral if no match
  return emotionBgColors[emotion] || 'bg-gray-100';
};
