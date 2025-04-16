
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Pause, Play } from "lucide-react";
import { AIAgentProps, AgentStance } from '@/types/agents';
import VoiceVisualizer from './VoiceVisualizer';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAgentResponse } from '@/lib/ai-negotiation/agent-engine';
import { EmotionType, PolicyWithArea } from '@/lib/ai-negotiation/shared-types';
import { speakWithEmotion, pauseHumeSpeech, resumeHumeSpeech } from '@/lib/voice-engine/hume-integration';
import { startSpeechRecognition, stopSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/voice-engine/voice-utils';

// Enhanced AIAgent component with speaking animations and AI integration
const AIAgent: React.FC<Partial<AIAgentProps> & { selectedPolicies?: PolicyWithArea[] }> = ({ 
  name = "Agent", 
  stance = AgentStance.MODERATE,
  role = "Stakeholder",
  age = 45,
  concerns = ["Education access", "Resource allocation"],
  selectedPolicies = [],
  onInteract = () => console.log("Agent interaction")
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userMuted, setUserMuted] = useState(false);
  const [emotion, setEmotion] = useState<EmotionType>('neutral');
  const [message, setMessage] = useState("");
  const [userInput, setUserInput] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  
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
  
  // Check if speech recognition is supported on component mount
  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
    
    // Cleanup function to run on unmount
    return () => {
      isMounted.current = false;
      stopSpeechRecognition();
      if (isSpeaking) {
        pauseHumeSpeech();
      }
    };
  }, []);

  /**
   * Generate a response using the AI negotiation system
   */
  const generateResponse = async () => {
    setIsSpeaking(true);
    setIsPaused(false);
    
    try {
      // Generate response using the agent-engine
      const response = await generateAgentResponse(
        name,
        stance,
        selectedPolicies
      );
      
      if (isMounted.current) {
        setMessage(response.message);
        setEmotion(response.emotion);
        
        // Use Hume AI to speak with emotion
        await speakWithEmotion(
          response.message,
          name,
          response.emotion,
          () => console.log("Started speaking"),
          () => {
            if (isMounted.current) {
              setIsSpeaking(false);
              onInteract();
            }
          }
        );
      }
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Fallback to simple response if AI generation fails
      const fallbackMessage = getFallbackMessage();
      setMessage(fallbackMessage);
      setEmotion('neutral');
      
      // Simulate speaking duration
      setTimeout(() => {
        if (isMounted.current) {
          setIsSpeaking(false);
          onInteract();
        }
      }, 3000);
    }
  };
  
  /**
   * Get a fallback message based on agent stance if AI generation fails
   */
  const getFallbackMessage = () => {
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
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  /**
   * Handle user interaction with the agent
   */
  const handleInteract = () => {
    if (isSpeaking) {
      // If already speaking, toggle pause/resume
      if (isPaused) {
        resumeHumeSpeech();
        setIsPaused(false);
      } else {
        pauseHumeSpeech();
        setIsPaused(true);
      }
    } else {
      // Start a new conversation
      generateResponse();
    }
  };
  
  /**
   * Toggle speech recognition for user input
   */
  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      return;
    }
    
    if (isListening) {
      stopSpeechRecognition();
      setIsListening(false);
    } else {
      const success = startSpeechRecognition({
        onStart: () => setIsListening(true),
        onEnd: () => setIsListening(false),
        onResult: (transcript) => setUserInput(transcript),
        onError: (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        }
      });
      
      if (!success) {
        setIsListening(false);
      }
    }
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
              <VoiceVisualizer isActive={isSpeaking && !isPaused} emotion={emotion} />
              <p className="text-sm mt-2 italic">{message}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              {message ? "..." : "Click 'Start Discussion' to engage"}
            </p>
          )}
        </div>
        
        {/* User speech input display */}
        {isListening && (
          <div className="mt-2 p-2 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-500 mb-1">Listening...</p>
            <p className="text-sm italic">{userInput || "Say something..."}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={toggleSpeechRecognition}
          variant="outline"
          size="sm"
          className="w-12"
          disabled={!speechSupported}
          title={speechSupported ? "Toggle speech recognition" : "Speech recognition not supported"}
        >
          {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button 
          onClick={handleInteract} 
          variant={isSpeaking ? "outline" : "default"}
          className="flex-1 ml-2"
        >
          {isSpeaking 
            ? (isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />)
            : null
          }
          {isSpeaking 
            ? (isPaused ? "Resume" : "Pause") 
            : "Start Discussion"
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIAgent;
