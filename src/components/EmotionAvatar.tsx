import React, { useEffect, useState } from 'react';
import { EmotionType } from '@/lib/ai-negotiation/shared-types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EmotionAvatarProps {
  agentName: string;
  emotion: EmotionType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBorder?: boolean;
  isActive?: boolean;
}

const EmotionAvatar: React.FC<EmotionAvatarProps> = ({
  agentName,
  emotion,
  size = 'md',
  className = '',
  showBorder = true,
  isActive = false
}) => {
  const [prevEmotion, setPrevEmotion] = useState<EmotionType>(emotion);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle emotion transitions
  useEffect(() => {
    if (emotion !== prevEmotion) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setPrevEmotion(emotion);
        setIsTransitioning(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [emotion, prevEmotion]);

  // Get size class for avatar
  const getSizeClass = () => {
    return size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-10 w-10' : 'h-12 w-12';
  };

  // Get border color based on emotion
  const getBorderColor = () => {
    if (!showBorder) return '';
    
    // Use a more generic approach based on emotion categories
    if (emotion.includes('Anger') || emotion.includes('Disgust') || emotion.includes('Contempt')) {
      return 'ring-red-500';
    } else if (emotion.includes('Joy') || emotion.includes('Satisfaction') || emotion.includes('Enthusiasm')) {
      return 'ring-green-500';
    } else if (emotion.includes('Concern') || emotion.includes('Fear') || emotion.includes('Anxiety')) {
      return 'ring-amber-500';
    } else if (emotion.includes('Compassion') || emotion.includes('Love') || emotion.includes('Sympathy')) {
      return 'ring-pink-500';
    } else if (emotion.includes('Frustration') || emotion.includes('Disappointment') || emotion.includes('Annoyance')) {
      return 'ring-orange-500';
    } else {
      return 'ring-gray-300'; // Neutral and other emotions
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get background color for fallback avatar
  const getFallbackBgColor = () => {
    const bgColors: Record<EmotionType, string> = {
      'neutral': 'bg-gray-200',
      'anger': 'bg-red-100',
      'compassion': 'bg-pink-100',
      'frustration': 'bg-orange-100',
      'enthusiasm': 'bg-green-100',
      'concern': 'bg-amber-100'
    };
    
    return bgColors[emotion] || bgColors.neutral;
  };

  // Get text color for fallback avatar
  const getFallbackTextColor = () => {
    const textColors: Record<EmotionType, string> = {
      'neutral': 'text-gray-700',
      'anger': 'text-red-700',
      'compassion': 'text-pink-700',
      'frustration': 'text-orange-700',
      'enthusiasm': 'text-green-700',
      'concern': 'text-amber-700'
    };
    
    return textColors[emotion] || textColors.neutral;
  };

  // Get emotion-specific avatar image (if available)
  const getEmotionAvatarImage = () => {
    // This could be expanded with actual emotion-specific avatar images
    // For now, we'll return null and use the fallback
    return null;
  };

  return (
    <div className={`relative ${className}`}>
      <Avatar 
        className={`${getSizeClass()} transition-all duration-300 ${
          showBorder ? `ring-2 ${getBorderColor()}` : ''
        } ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
      >
        <AvatarImage src={getEmotionAvatarImage()} />
        <AvatarFallback className={`${getFallbackBgColor()} ${getFallbackTextColor()}`}>
          {getInitials(agentName)}
        </AvatarFallback>
      </Avatar>
      
      {isActive && (
        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full ring-1 ring-white"></span>
      )}
    </div>
  );
};

export default EmotionAvatar;
