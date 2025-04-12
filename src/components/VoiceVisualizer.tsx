
import React from 'react';

interface VoiceVisualizerProps {
  isActive?: boolean;
  emotion?: 'neutral' | 'anger' | 'compassion' | 'frustration';
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ 
  isActive = false,
  emotion = 'neutral'
}) => {
  const getEmotionColor = () => {
    switch(emotion) {
      case 'anger':
        return 'bg-policy-maroon';
      case 'compassion':
        return 'bg-progress-green';
      case 'frustration':
        return 'bg-warning-orange';
      default:
        return 'bg-hope-turquoise';
    }
  };

  return (
    <div className="flex items-end justify-center h-12 gap-1 my-4">
      {[1, 2, 3, 4, 5].map((barIndex) => (
        <div
          key={barIndex}
          className={`w-2 h-3 rounded-t-sm ${getEmotionColor()} ${
            isActive ? `animate-wave-${barIndex}` : 'h-1'
          } transform-origin-bottom transition-height duration-300`}
          style={{ 
            animationPlayState: isActive ? 'running' : 'paused',
            height: isActive ? undefined : '4px'
          }}
        />
      ))}
    </div>
  );
};

export default VoiceVisualizer;
