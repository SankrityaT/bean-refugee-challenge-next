import React, { useEffect, useState } from 'react';
import { Heart, AlertTriangle, Smile, Frown, Meh } from "lucide-react";

interface EmotionMeterProps {
  emotion: string;
  showIntensity?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface EmotionData {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  label: string;
}

const EmotionMeter: React.FC<EmotionMeterProps> = ({
  emotion,
  showIntensity = true,
  size = 'md',
  className = ''
}) => {
  const [intensity, setIntensity] = useState(50);
  const [prevEmotion, setPrevEmotion] = useState<string>(emotion);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Generate a random intensity value when emotion changes
  useEffect(() => {
    if (emotion !== prevEmotion) {
      setIsTransitioning(true);
      // Animate intensity down before changing emotion
      const timer1 = setTimeout(() => {
        setPrevEmotion(emotion);
        // Generate a random intensity between 60-95 for more dynamic visualization
        const newIntensity = Math.floor(Math.random() * 35) + 60;
        setIntensity(newIntensity);
        setIsTransitioning(false);
      }, 300);
      
      return () => clearTimeout(timer1);
    }
  }, [emotion, prevEmotion]);

  // Map emotions to their visual representation
  const getEmotionData = (emotion: string) => {
    // Generic emotion categories based on the emotion name
    if (emotion.includes('Anger') || emotion.includes('Disgust') || emotion.includes('Contempt')) {
      return { 
        icon: <AlertTriangle className={`${getSizeClass('icon')}`} />, 
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: emotion
      };
    } else if (emotion.includes('Joy') || emotion.includes('Satisfaction') || 
               emotion.includes('Enthusiasm') || emotion.includes('Excitement')) {
      return { 
        icon: <Smile className={`${getSizeClass('icon')}`} />, 
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: emotion
      };
    } else if (emotion.includes('Concern') || emotion.includes('Fear') || 
               emotion.includes('Anxiety') || emotion.includes('Worry')) {
      return { 
        icon: <AlertTriangle className={`${getSizeClass('icon')}`} />, 
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        label: emotion
      };
    } else if (emotion.includes('Compassion') || emotion.includes('Love') || 
               emotion.includes('Sympathy') || emotion.includes('Empathy')) {
      return { 
        icon: <Heart className={`${getSizeClass('icon')}`} />, 
        color: 'text-pink-600',
        bgColor: 'bg-pink-100',
        label: emotion
      };
    } else if (emotion.includes('Frustration') || emotion.includes('Disappointment') || 
               emotion.includes('Annoyance') || emotion.includes('Irritation')) {
      return { 
        icon: <Frown className={`${getSizeClass('icon')}`} />, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        label: emotion
      };
    } else {
      // Default to neutral for any other emotion
      return { 
        icon: <Meh className={`${getSizeClass('icon')}`} />, 
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        label: emotion
      };
    }
  };

  // Get size-specific classes
  function getSizeClass(type: 'container' | 'icon' | 'text' | 'meter'): string {
    if (type === 'container') {
      return size === 'sm' ? 'p-1' : size === 'md' ? 'p-2' : 'p-3';
    } else if (type === 'icon') {
      return size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';
    } else if (type === 'text') {
      return size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base';
    } else if (type === 'meter') {
      return size === 'sm' ? 'h-1' : size === 'md' ? 'h-1.5' : 'h-2';
    }
    return '';
  }

  const { icon, color, bgColor, label } = getEmotionData(emotion);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className={`flex items-center ${getSizeClass('container')} ${bgColor} ${color} rounded-lg transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="mr-2">
          {icon}
        </div>
        <span className={`${getSizeClass('text')} font-medium`}>
          {label}
        </span>
      </div>
      
      {showIntensity && (
        <div className="w-full bg-gray-200 rounded-full mt-1 overflow-hidden">
          <div 
            className={`${getSizeClass('meter')} ${color.replace('text', 'bg')} transition-all duration-500 ease-out`}
            style={{ width: `${intensity}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default EmotionMeter;
