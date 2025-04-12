
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff } from "lucide-react";
import { AIAgentProps, AgentStance } from '@/types/agents';
import VoiceVisualizer from './VoiceVisualizer';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Enhanced AIAgent component with speaking animations
const AIAgent: React.FC<Partial<AIAgentProps>> = ({ 
  name = "Agent", 
  stance = AgentStance.MODERATE,
  role = "Stakeholder",
  age = 45,
  concerns = ["Education access", "Resource allocation"],
  onInteract = () => console.log("Agent interaction")
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userMuted, setUserMuted] = useState(false);
  const [emotion, setEmotion] = useState<'neutral' | 'anger' | 'compassion' | 'frustration'>('neutral');
  const [message, setMessage] = useState("");
  
  const getStanceColor = (stance: AgentStance) => {
    switch(stance) {
      case AgentStance.NEOLIBERAL:
        return 'bg-blue-100 text-blue-800';
      case AgentStance.PROGRESSIVE:
        return 'bg-green-100 text-green-800';
      case AgentStance.MODERATE:
        return 'bg-yellow-100 text-yellow-800';
      case AgentStance.HUMANITARIAN:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getEmotionBasedOnStance = () => {
    const emotions = {
      [AgentStance.NEOLIBERAL]: ['neutral', 'frustration'],
      [AgentStance.PROGRESSIVE]: ['compassion', 'enthusiasm'],
      [AgentStance.MODERATE]: ['neutral', 'concern'],
      [AgentStance.HUMANITARIAN]: ['compassion', 'concern']
    };
    
    const stanceEmotions = emotions[stance] || ['neutral'];
    return stanceEmotions[Math.floor(Math.random() * stanceEmotions.length)] as 'neutral' | 'anger' | 'compassion' | 'frustration';
  };
  
  const handleInteract = () => {
    setIsSpeaking(true);
    setEmotion(getEmotionBasedOnStance());
    
    // Simulate agent speaking with different messages based on stance
    const stanceMessages = {
      [AgentStance.NEOLIBERAL]: [
        "We need to consider the economic impact of these policies.",
        "How will this affect our budget long-term?",
        "Let's focus on sustainable solutions that don't strain resources."
      ],
      [AgentStance.PROGRESSIVE]: [
        "Education access must be equitable for all refugees.",
        "These children deserve the same opportunities as everyone else.",
        "We should prioritize inclusive policies over cost concerns."
      ],
      [AgentStance.MODERATE]: [
        "We need to balance humanitarian needs with practical constraints.",
        "Let's find middle ground that works for everyone.",
        "I see merit in both approaches to this issue."
      ],
      [AgentStance.HUMANITARIAN]: [
        "The wellbeing of refugee children must come first.",
        "We have a moral obligation to provide quality education.",
        "These policies don't go far enough to address trauma and displacement."
      ]
    };
    
    const messages = stanceMessages[stance] || ["I'd like to discuss these policies further."];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    
    // Simulate speaking duration based on message length
    const speakingTime = Math.max(2000, message.length * 50);
    
    setTimeout(() => {
      setIsSpeaking(false);
      onInteract();
    }, speakingTime);
  };
  
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gray-200">
                {name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription>{role}, {age} years old</CardDescription>
            </div>
          </div>
          <Badge className={getStanceColor(stance)}>
            {stance.toLowerCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <p className="text-sm text-gray-600">Key concerns:</p>
          <ul className="list-disc pl-5 text-sm">
            {Array.isArray(concerns) ? concerns.map((concern, index) => (
              <li key={index}>{concern}</li>
            )) : <li>{concerns}</li>}
          </ul>
        </div>
        
        {/* Speaking animation and message */}
        <div className="mt-4 min-h-[80px] bg-gray-50 rounded-md p-3 relative">
          {isSpeaking ? (
            <>
              <VoiceVisualizer isActive={isSpeaking} emotion={emotion} />
              <p className="text-sm mt-2 italic">{message}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              {message ? "..." : "Click 'Start Discussion' to engage"}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={() => setUserMuted(!userMuted)}
          variant="outline"
          size="sm"
          className="w-12"
        >
          {userMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button 
          onClick={handleInteract} 
          disabled={isSpeaking}
          className="flex-1 ml-2"
        >
          {isSpeaking ? 'Listening...' : 'Start Discussion'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIAgent;
