
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import VoiceVisualizer from './VoiceVisualizer';

interface AIAgentProps {
  name: string;
  role: string;
  stance: 'favorable' | 'neutral' | 'opposing';
  avatarSrc?: string;
  onInteract: () => void;
}

const AIAgent: React.FC<AIAgentProps> = ({
  name,
  role,
  stance,
  avatarSrc,
  onInteract
}) => {
  const [emotion, setEmotion] = useState<'neutral' | 'anger' | 'compassion' | 'frustration'>('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const handleInteract = () => {
    setIsSpeaking(true);
    // Randomly select an emotion based on stance
    const emotions: ('neutral' | 'anger' | 'compassion' | 'frustration')[] = 
      stance === 'favorable' 
        ? ['compassion', 'neutral', 'compassion'] 
        : stance === 'opposing'
          ? ['anger', 'frustration', 'neutral']
          : ['neutral', 'compassion', 'frustration'];
    
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    setEmotion(randomEmotion);
    
    // Simulate agent speaking
    setTimeout(() => {
      setIsSpeaking(false);
      onInteract();
    }, 3000);
  };
  
  return (
    <div className="flex flex-col items-center p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
      <Avatar className="h-20 w-20 mb-3">
        <AvatarImage src={avatarSrc} alt={name} />
        <AvatarFallback className="text-lg font-bold bg-gray-200">
          {name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <h3 className="font-bebas text-xl">{name}</h3>
      <p className="text-sm text-gray-600 mb-2">{role}</p>
      
      <div className={`px-3 py-1 rounded-full text-xs font-medium mb-3 
        ${stance === 'favorable' ? 'bg-progress-green/20 text-progress-green' : 
          stance === 'opposing' ? 'bg-policy-maroon/20 text-policy-maroon' : 
          'bg-gray-200 text-gray-700'}`}>
        {stance === 'favorable' ? 'Supportive' : 
         stance === 'opposing' ? 'Opposing' : 'Neutral'}
      </div>
      
      <VoiceVisualizer isActive={isSpeaking} emotion={emotion} />
      
      <Button 
        onClick={handleInteract}
        disabled={isSpeaking}
        variant="outline"
        className="mt-2 border-hope-turquoise text-hope-turquoise hover:bg-hope-turquoise hover:text-white"
      >
        {isSpeaking ? 'Speaking...' : 'Engage'}
      </Button>
    </div>
  );
};

export default AIAgent;
