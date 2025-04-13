
import React from 'react';
import { EmotionType } from '@/lib/ai-negotiation/shared-types';

interface VoiceVisualizerProps {
  isActive?: boolean;
  emotion?: EmotionType;
  intensity?: 'low' | 'medium' | 'high';
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ 
  isActive = false,
  emotion = 'neutral',
  intensity = 'medium'
}) => {
  const getEmotionColor = () => {
    switch(emotion) {
      case 'anger':
        return 'bg-policy-maroon';
      case 'compassion':
        return 'bg-progress-green';
      case 'frustration':
        return 'bg-warning-orange';
      case 'enthusiasm':
        return 'bg-reflection-yellow';
      case 'concern':
        return 'bg-purple-500';
      default:
        return 'bg-hope-turquoise';
    }
  };

  const getIntensityStyle = () => {
    const baseHeight = intensity === 'low' ? 8 : intensity === 'medium' ? 12 : 16;
    return `h-${baseHeight}`;
  };

  return (
    <div className={`flex items-end justify-center ${getIntensityStyle()} gap-1 my-4`}>
      {[1, 2, 3, 4, 5].map((barIndex) => (
        <div
          key={barIndex}
          className={`w-2 h-3 rounded-t-sm ${getEmotionColor()} ${
            isActive ? `animate-wave-${barIndex}` : 'h-1'
          } transform-origin-bottom transition-height duration-300`}
          style={{ 
            animationPlayState: isActive ? 'running' : 'paused',
            height: isActive ? undefined : '4px',
            animationDuration: `${0.8 + (barIndex * 0.1)}s`
          }}
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;
