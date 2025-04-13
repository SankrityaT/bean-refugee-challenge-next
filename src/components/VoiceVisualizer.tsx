
'use client';

import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
  emotion?: 'neutral' | 'anger' | 'compassion' | 'frustration' | 'enthusiasm' | 'concern';
  intensity?: 'low' | 'medium' | 'high';
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ 
  isActive, 
  emotion = 'neutral',
  intensity = 'medium'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Get color based on emotion
  const getEmotionColor = (emotion: string): string => {
    switch (emotion) {
      case 'anger':
        return '#FF5252';
      case 'compassion':
        return '#64B5F6';
      case 'frustration':
        return '#FF7043';
      case 'enthusiasm':
        return '#4CAF50';
      case 'concern':
        return '#FFC107';
      case 'neutral':
      default:
        return '#9E9E9E';
    }
  };
  
  // Get amplitude based on intensity
  const getAmplitude = (intensity: string): number => {
    switch (intensity) {
      case 'low':
        return 10;
      case 'high':
        return 30;
      case 'medium':
      default:
        return 20;
    }
  };
  
  // Draw visualization
  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!isActive) {
      // Draw flat line when inactive
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.strokeStyle = getEmotionColor(emotion);
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }
    
    // Get color and amplitude
    const color = getEmotionColor(emotion);
    const amplitude = getAmplitude(intensity);
    const frequency = emotion === 'enthusiasm' || emotion === 'anger' ? 0.05 : 0.03;
    
    // Draw waveform
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    
    for (let x = 0; x < canvas.width; x++) {
      // Create a dynamic wave effect
      const time = Date.now() * 0.001;
      const y = canvas.height / 2 + 
                Math.sin(x * frequency + time) * amplitude * Math.sin(time * 2) + 
                Math.sin(x * frequency * 0.8 + time * 1.5) * amplitude * 0.5;
      
      ctx.lineTo(x, y);
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Continue animation
    animationRef.current = requestAnimationFrame(drawVisualization);
  };
  
  // Initialize and clean up animation
  useEffect(() => {
    // Set canvas dimensions
    if (canvasRef.current) {
      canvasRef.current.width = canvasRef.current.offsetWidth;
      canvasRef.current.height = 50;
    }
    
    // Start animation
    animationRef.current = requestAnimationFrame(drawVisualization);
    
    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, emotion, intensity]);
  
  return (
    <div className={`h-[50px] w-full rounded-md overflow-hidden transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default VoiceVisualizer;
