
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Play, Pause } from "lucide-react";
import { AIAgentProps, AgentStance } from '@/types/agents';
import VoiceVisualizer from './VoiceVisualizer';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAgentResponse } from '@/lib/ai-negotiation/agent-engine';
import { speakWithEmotion } from '@/lib/voice-engine/hume-integration';
import { SpeechRecognitionController } from '@/lib/voice-engine/voice-utils';
import { generateGroqResponse } from '@/lib/ai-negotiation/groq-integration';
import { POLICY_AREAS } from '@/data/game-data';
import { PolicyWithArea } from '@/types/policies';
import { pauseHumeSpeech, resumeHumeSpeech, stopHumeSpeech } from '@/lib/voice-engine/hume-integration';

const AIAgent: React.FC<Partial<AIAgentProps>> = ({ 
  id = "",
  name = "Agent", 
  stance = AgentStance.MODERATE,
  role = "Stakeholder",
  age = 45,
  concerns = ["Education access", "Resource allocation"],
  onInteract = () => console.log("Agent interaction")
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [emotion, setEmotion] = useState<'neutral' | 'anger' | 'compassion' | 'frustration' | 'enthusiasm' | 'concern'>('neutral');
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [userResponse, setUserResponse] = useState("");
  const [recognitionController, setRecognitionController] = useState<SpeechRecognitionController | null>(null);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      stopHumeSpeech();
      if (recognitionController) {
        recognitionController.stop();
      }
    };
  }, [recognitionController]);

  const handlePauseResume = () => {
    if (isPaused) {
      resumeHumeSpeech();
      setIsPaused(false);
    } else {
      pauseHumeSpeech();
      setIsPaused(true);
    }
  };

  // Get selected policies from all policy areas (for demo, selecting one from each area)
  const getSelectedPolicies = (): PolicyWithArea[] => {
    return POLICY_AREAS.map(area => {
      // For demo purposes, select a random policy from each area
      // In a real implementation, this would come from user selections
      const randomIndex = Math.floor(Math.random() * area.policies.length);
      const policy = area.policies[randomIndex];
      
      return {
        id: policy.id,
        title: policy.title,
        description: policy.description,
        tier: policy.tier,
        cost: 50 + (policy.tier * 25), // Estimate cost based on tier
        impact: policy.tier * 30, // Estimate impact based on tier
        area: area.title
      };
    });
  };
  
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
  
  const handleInteract = async () => {
    setIsThinking(true);
    
    try {
      // Get actual policies from the game data
      const selectedPolicies = getSelectedPolicies();
      
      // Generate a dynamic response
      let agentId = id;
      if (!agentId) {
        // Map agent names to standard IDs
        const nameToIdMap: Record<string, string> = {
          'Minister Santos': 'minister-santos',
          'Dr. Chen': 'dr-chen',
          'Mayor Okonjo': 'mayor-okonjo',
          'Community Leader Patel': 'ms-patel'
        };
        
        // Try exact match first
        agentId = nameToIdMap[name] || '';
        
        // If no exact match, try case-insensitive includes as fallback
        if (!agentId) {
          if (name.toLowerCase().includes('santos')) agentId = 'minister-santos';
          else if (name.toLowerCase().includes('chen')) agentId = 'dr-chen';
          else if (name.toLowerCase().includes('okonjo')) agentId = 'mayor-okonjo';
          else if (name.toLowerCase().includes('patel')) agentId = 'ms-patel';
        }
      }
      
      // Validate that we have a valid agent ID
      if (!agentId) {
        console.warn(`Could not determine agent ID for name: ${name}. Using default responses.`);
        agentId = 'unknown-agent';
      }
      
      // Determine sentiment based on policy tiers and agent stance
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      
      const avgTier = selectedPolicies.reduce((sum, p) => sum + p.tier, 0) / selectedPolicies.length;
      
      switch (stance) {
        case AgentStance.NEOLIBERAL:
          sentiment = avgTier < 2 ? 'positive' : avgTier > 2.5 ? 'negative' : 'neutral';
          break;
        case AgentStance.PROGRESSIVE:
          sentiment = avgTier > 2.5 ? 'positive' : avgTier < 1.5 ? 'negative' : 'neutral';
          break;
        case AgentStance.MODERATE:
          sentiment = avgTier >= 1.8 && avgTier <= 2.2 ? 'positive' : 'neutral';
          break;
        case AgentStance.HUMANITARIAN:
          sentiment = avgTier > 2 ? 'positive' : 'negative';
          break;
      }
      
      // Create agent object for Groq
      const agent = {
        id: agentId,
        name,
        role,
        age,
        stance,
        concerns,
        responsePatterns: {
          positive: [
            "I support these policies for {POLICY_AREAS}.",
            "These {POLICY_COUNT} policies align with my values.",
            "I'm pleased with the approach to {AGENT_CONCERN}."
          ],
          neutral: [
            "I have mixed feelings about these policies for {POLICY_AREAS}.",
            "These {POLICY_COUNT} policies have both strengths and weaknesses.",
            "I'm neither opposed nor enthusiastic about this approach to {AGENT_CONCERN}."
          ],
          negative: [
            "I cannot support these policies for {POLICY_AREAS}.",
            "These {POLICY_COUNT} policies don't align with my values.",
            "I'm concerned about this approach to {AGENT_CONCERN}."
          ]
        }
      };
      
      // Try to use Groq for response generation
      let responseData;
      try {
        responseData = await generateGroqResponse(agent, selectedPolicies, sentiment);
      } catch (error) {
        console.warn('Groq response generation failed, falling back to predefined responses');
        responseData = generateAgentResponse(agentId, selectedPolicies, sentiment);
      }
      
      const { message: responseMessage, emotion: responseEmotion } = responseData;
      
      setMessage(responseMessage);
      setEmotion(responseEmotion as any);
      setIsThinking(false);
      
      // Speak the response using Hume or fallback
      setIsSpeaking(true);
      
      await speakWithEmotion(
        responseMessage,
        agentId,
        responseEmotion as any,
        () => {
          console.log('Started speaking');
          setIsSpeaking(true);
          setIsPaused(false);
        },
        () => {
          setIsSpeaking(false);
          setIsPaused(false);
          onInteract();
        }
      );
    } catch (error) {
      console.error('Error in AI agent interaction:', error);
      setIsThinking(false);
      setIsPaused(false);
      setIsSpeaking(false);
      setMessage("I'm having trouble processing your request right now.");
      setEmotion('neutral');
    }
  };
  
  const startListening = () => {
    setIsListening(true);
    setUserResponse("");
    
    // Initialize speech recognition
    const controller = new SpeechRecognitionController(
      { continuous: true, interimResults: true },
      {
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            setUserResponse(transcript);
            stopListening();
          }
        },
        onStart: () => console.log('Started listening'),
        onEnd: () => setIsListening(false),
        onError: (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        }
      }
    );
    
    setRecognitionController(controller);
    controller.start();
  };
  
  const stopListening = () => {
    if (recognitionController) {
      recognitionController.stop();
    }
    setIsListening(false);
  };
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
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
            {stance.charAt(0) + stance.slice(1).toLowerCase()} Stance
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <strong>Concerns:</strong> {Array.isArray(concerns) ? concerns.join(', ') : concerns}
          </div>
          
          {message && (
            <div className="p-3 bg-gray-50 rounded-lg mt-3">
              <p className="text-sm">{message}</p>
            </div>
          )}
          
          <VoiceVisualizer 
            isActive={isSpeaking} 
            emotion={emotion} 
            intensity={emotion === 'anger' || emotion === 'enthusiasm' ? 'high' : emotion === 'neutral' ? 'low' : 'medium'} 
          />
          
          {userResponse && (
            <div className="p-3 bg-blue-50 rounded-lg mt-3">
              <p className="text-sm italic">Your response: {userResponse}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button 
          onClick={handleInteract}
          disabled={isSpeaking || isThinking}
          variant="outline"
          className="border-hope-turquoise text-hope-turquoise hover:bg-hope-turquoise hover:text-white"
        >
          {isThinking ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Hear Perspective'}
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking || isThinking}
            variant="outline"
            className={isListening ? "border-red-500 text-red-500" : "border-gray-300"}
          >
            {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {isListening ? 'Stop' : 'Respond'}
          </Button>
          
          {isSpeaking && (
            <Button
              onClick={handlePauseResume}
              variant="outline"
              size="sm"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIAgent;
