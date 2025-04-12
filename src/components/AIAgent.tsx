
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import VoiceVisualizer from './VoiceVisualizer';
import { AgentStance } from '@/types/agents';

interface AIAgentProps {
  name: string;
  role: string;
  stance: AgentStance;
  onInteract: () => void;
  age: number;
  concerns: string;
}

const AIAgent: React.FC<AIAgentProps> = ({
  name,
  role,
  stance,
  onInteract,
  age,
  concerns
}) => {
  const [emotion, setEmotion] = useState<'neutral' | 'anger' | 'compassion' | 'frustration'>('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const handleInteract = () => {
    setIsSpeaking(true);
    
    // More nuanced emotion selection based on stance
    const stanceEmotions = {
      'neoliberal': ['neutral', 'frustration'],
      'socialist': ['compassion', 'anger'],
      'liberal': ['neutral', 'compassion'],
      'moderate': ['neutral'],
      'conservative': ['frustration']
    };
    
    const emotions = stanceEmotions[stance] || ['neutral'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)] as 
      'neutral' | 'anger' | 'compassion' | 'frustration';
    
    setEmotion(randomEmotion);
    
    setTimeout(() => {
      setIsSpeaking(false);
      onInteract();
    }, 3000);
  };
  
  return (
    <div className="flex flex-col items-center p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
      <Avatar className="h-20 w-20 mb-3">
        <AvatarFallback className="text-lg font-bold bg-gray-200">
          {name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <h3 className="font-bebas text-xl">{name}</h3>
      <p className="text-sm text-gray-600 mb-2">{role}, {age} years old</p>
      <p className="text-xs text-gray-500 mb-2 italic">{concerns}</p>
      
      <div className="px-3 py-1 rounded-full text-xs font-medium mb-3 bg-gray-200 text-gray-700">
        {stance.charAt(0).toUpperCase() + stance.slice(1)} Stance
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
