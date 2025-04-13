import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AgentStance } from '@/types/agents';
import { PolicyWithArea, EmotionType } from '@/lib/ai-negotiation/shared-types';
import { startSpeechRecognition, stopSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/voice-engine/voice-utils';
import { speakWithEmotion } from '@/lib/voice-engine/hume-integration';
import VoiceVisualizer from './VoiceVisualizer';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  emotion?: string;
  isUser?: boolean;
}

interface ConversationManagerProps {
  selectedPolicies: PolicyWithArea[];
  agents: {
    name: string;
    stance: AgentStance;
    role: string;
    age: number;
    concerns: string[];
  }[];
  onConversationUpdate: (logs: any[]) => void;
}

const ConversationManager: React.FC<ConversationManagerProps> = ({
  selectedPolicies,
  agents,
  onConversationUpdate
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [userEmotion, setUserEmotion] = useState('neutral');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationStarted = useRef(false);
  
  // Check if speech recognition is supported
  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
    
    // Start conversation with welcome message
    if (!conversationStarted.current && agents.length > 0) {
      conversationStarted.current = true;
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: `system-${Date.now()}`,
        sender: 'Facilitator',
        content: 'Welcome to the stakeholder negotiation phase. The community leaders are ready to discuss your selected policies. You can speak or type your responses.',
        timestamp: new Date(),
        emotion: 'neutral'
      };
      
      setMessages([welcomeMessage]);
      
      // Schedule first agent to speak after 2 seconds
      setTimeout(() => {
        triggerAgentResponse(agents[0].name);
      }, 2000);
    }
    
    return () => {
      // Clean up speech recognition when component unmounts
      stopSpeechRecognition();
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Update conversation logs for parent component
  useEffect(() => {
    const logs = messages.map(msg => ({
      agent: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      emotion: msg.emotion,
      isUser: msg.isUser
    }));
    
    onConversationUpdate(logs);
  }, [messages, onConversationUpdate]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Analyze user input for emotion
    const detectedEmotion = analyzeUserEmotion(userInput);
    setUserEmotion(detectedEmotion);
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'You',
      content: userInput,
      timestamp: new Date(),
      emotion: detectedEmotion,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    
    // Determine which agent should respond
    const nextAgent = determineRespondingAgent(userInput, agents, messages);
    
    // Schedule agent response
    setTimeout(() => {
      triggerAgentResponse(nextAgent);
    }, 1000);
  };
  
  const toggleSpeechRecognition = () => {
    if (!speechSupported) return;
    
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
  
  // Analyze user input to detect emotion
  const analyzeUserEmotion = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    // Simple keyword-based emotion detection
    if (lowerText.includes('angry') || lowerText.includes('upset') || 
        lowerText.includes('unfair') || lowerText.includes('ridiculous')) {
      return 'anger';
    }
    
    if (lowerText.includes('worried') || lowerText.includes('concern') || 
        lowerText.includes('afraid') || lowerText.includes('risk')) {
      return 'concern';
    }
    
    if (lowerText.includes('happy') || lowerText.includes('excited') || 
        lowerText.includes('great') || lowerText.includes('excellent')) {
      return 'enthusiasm';
    }
    
    if (lowerText.includes('sad') || lowerText.includes('disappointed') || 
        lowerText.includes('unfortunate')) {
      return 'frustration';
    }
    
    if (lowerText.includes('help') || lowerText.includes('support') || 
        lowerText.includes('care') || lowerText.includes('understand')) {
      return 'compassion';
    }
    
    return 'neutral';
  };
  
  // Determine which agent should respond based on conversation context
  const determineRespondingAgent = (userInput: string, agents: any[], messages: Message[]): string => {
    // If the conversation just started, go in order
    if (messages.length <= 2) {
      return agents[0].name;
    }
    
    // Content-based selection with weighted randomness
    const agentScores: {[key: string]: number} = {};
    
    // Initialize scores
    agents.forEach(agent => {
      agentScores[agent.name] = 1; // Base score
    });
    
    // Adjust scores based on who spoke recently (less likely to speak again immediately)
    const recentSpeakers = messages
      .slice(-3)
      .filter(msg => !msg.isUser)
      .map(msg => msg.sender);
      
    recentSpeakers.forEach(speaker => {
      if (agentScores[speaker]) {
        agentScores[speaker] -= 0.5; // Reduce chance for recent speakers
      }
    });
    
    // Most recent speaker is least likely to speak again
    const lastSpeaker = messages.filter(msg => !msg.isUser).pop()?.sender;
    if (lastSpeaker && agentScores[lastSpeaker]) {
      agentScores[lastSpeaker] -= 0.3;
    }
    
    // Content relevance boosts
    const lowerInput = userInput.toLowerCase();
    
    // Economic/budget topics -> Neoliberal agent
    if (lowerInput.includes('economic') || lowerInput.includes('cost') || lowerInput.includes('budget') || 
        lowerInput.includes('fund') || lowerInput.includes('expense') || lowerInput.includes('tax')) {
      const neoliberalAgent = agents.find(a => a.stance === AgentStance.NEOLIBERAL)?.name;
      if (neoliberalAgent && agentScores[neoliberalAgent]) {
        agentScores[neoliberalAgent] += 1.5;
      }
    }
    
    // Rights/justice/equality topics -> Progressive agent
    if (lowerInput.includes('right') || lowerInput.includes('justice') || lowerInput.includes('equal') || 
        lowerInput.includes('fair') || lowerInput.includes('access') || lowerInput.includes('inclusion')) {
      const progressiveAgent = agents.find(a => a.stance === AgentStance.PROGRESSIVE)?.name;
      if (progressiveAgent && agentScores[progressiveAgent]) {
        agentScores[progressiveAgent] += 1.5;
      }
    }
    
    // Balance/compromise topics -> Moderate agent
    if (lowerInput.includes('balance') || lowerInput.includes('compromise') || lowerInput.includes('middle') || 
        lowerInput.includes('reasonable') || lowerInput.includes('practical') || lowerInput.includes('realistic')) {
      const moderateAgent = agents.find(a => a.stance === AgentStance.MODERATE)?.name;
      if (moderateAgent && agentScores[moderateAgent]) {
        agentScores[moderateAgent] += 1.5;
      }
    }
    
    // Humanitarian/support topics -> Humanitarian agent
    if (lowerInput.includes('help') || lowerInput.includes('support') || lowerInput.includes('humanitarian') || 
        lowerInput.includes('child') || lowerInput.includes('trauma') || lowerInput.includes('care')) {
      const humanitarianAgent = agents.find(a => a.stance === AgentStance.HUMANITARIAN)?.name;
      if (humanitarianAgent && agentScores[humanitarianAgent]) {
        agentScores[humanitarianAgent] += 1.5;
      }
    }
    
    // Direct mentions of agents by name
    agents.forEach(agent => {
      if (lowerInput.includes(agent.name.toLowerCase())) {
        agentScores[agent.name] += 2; // Big boost if directly addressed
      }
    });
    
    // Ensure minimum score
    Object.keys(agentScores).forEach(name => {
      agentScores[name] = Math.max(agentScores[name], 0.1);
    });
    
    // Weighted random selection
    const totalScore = Object.values(agentScores).reduce((sum, score) => sum + score, 0);
    let random = Math.random() * totalScore;
    
    for (const [name, score] of Object.entries(agentScores)) {
      random -= score;
      if (random <= 0) {
        return name;
      }
    }
    
    // Fallback to random selection if something went wrong
    return agents[Math.floor(Math.random() * agents.length)].name;
  };
  
  // Trigger an agent to respond
  const triggerAgentResponse = async (agentName: string) => {
    setActiveAgent(agentName);
    setIsSpeaking(true);
    
    // Find the agent's data
    const agent = agents.find(a => a.name === agentName);
    if (!agent) return;
    
    try {
      // Generate agent response
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentName,
          agentStance: agent.stance,
          selectedPolicies,
          previousMessages: messages.slice(-5) // Send last 5 messages for context
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate response');
      }
      
      const data = await response.json();
      const { message, emotion } = data;
      
      // Set current emotion for visualization
      setCurrentEmotion(emotion);
      
      // Add agent message
      const agentMessage: Message = {
        id: `${agentName.toLowerCase().replace(' ', '-')}-${Date.now()}`,
        sender: agentName,
        content: message,
        timestamp: new Date(),
        emotion
      };
      
      setMessages(prev => [...prev, agentMessage]);
      
      // Use Hume TTS API to speak the message with emotion
      try {
        await speakWithEmotion(
          message,
          agentName,
          emotion as EmotionType,
          () => {
            // Speech started callback
            console.log(`${agentName} started speaking`);
          },
          () => {
            // Speech ended callback
            console.log(`${agentName} finished speaking`);
            setIsSpeaking(false);
            setActiveAgent(null);
            
            // Continue the conversation by triggering another agent to respond
            // But only if there are enough messages and not right after user input
            const lastMessage = messages[messages.length - 1];
            const shouldContinueConversation = 
              messages.length >= 3 && // At least a few messages exchanged
              !lastMessage?.isUser && // Last message wasn't from user
              Math.random() < 0.7; // 70% chance to continue conversation between agents
            
            if (shouldContinueConversation) {
              // Pick next agent, ensuring it's not the same one who just spoke
              const availableAgents = agents.filter(a => a.name !== agentName);
              if (availableAgents.length > 0) {
                const nextAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)].name;
                setTimeout(() => {
                  triggerAgentResponse(nextAgent);
                }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
              }
            }
          }
        );
      } catch (error) {
        console.error('Error with speech synthesis:', error);
        // Fallback to timer-based approach if speech synthesis fails
        const speakingTime = Math.min(Math.max(message.length * 50, 3000), 10000);
        setTimeout(() => {
          setIsSpeaking(false);
          setActiveAgent(null);
          
          // Continue the conversation by triggering another agent to respond
          // But only if there are enough messages and not right after user input
          const lastMessage = messages[messages.length - 1];
          const shouldContinueConversation = 
            messages.length >= 3 && // At least a few messages exchanged
            !lastMessage?.isUser && // Last message wasn't from user
            Math.random() < 0.7; // 70% chance to continue conversation between agents
          
          if (shouldContinueConversation) {
            // Pick next agent, ensuring it's not the same one who just spoke
            const availableAgents = agents.filter(a => a.name !== agentName);
            if (availableAgents.length > 0) {
              const nextAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)].name;
              setTimeout(() => {
                triggerAgentResponse(nextAgent);
              }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
            }
          }
        }, speakingTime);
      }
      
    } catch (error) {
      console.error('Error generating agent response:', error);
      setIsSpeaking(false);
      setActiveAgent(null);
      
      // Add fallback message
      const fallbackMessage: Message = {
        id: `${agentName.toLowerCase().replace(' ', '-')}-fallback-${Date.now()}`,
        sender: agentName,
        content: `I'd like to discuss these policies further, but I'm having trouble formulating my thoughts right now.`,
        timestamp: new Date(),
        emotion: 'neutral'
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    }
  };
  
  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Live Debate Space Header */}
      <div className="p-4 border-b bg-policy-maroon text-white">
        <div className="flex justify-between items-center">
          <h3 className="font-bebas text-2xl">LIVE POLICY DEBATE</h3>
          <div className="flex items-center">
            <div className="animate-pulse mr-2 h-3 w-3 bg-red-500 rounded-full"></div>
            <span className="text-xs font-medium">LIVE</span>
          </div>
        </div>
        <p className="text-sm opacity-90 mt-1">
          Join the conversation with stakeholders. Speak freely and listen to different perspectives.
        </p>
        
        {/* Active participants */}
        <div className="mt-3 flex -space-x-2 overflow-hidden">
          {agents.map(agent => (
            <div 
              key={agent.name} 
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
              title={`${agent.name} (${agent.role})`}
            >
              <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-policy-maroon font-medium">
                {agent.name.substring(0, 1)}
              </div>
            </div>
          ))}
          <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white">
            <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-policy-maroon font-medium">
              You
            </div>
          </div>
        </div>
      </div>
      
      {/* Live conversation area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] ${
                  message.isUser 
                    ? 'bg-policy-maroon text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' 
                    : 'bg-white border rounded-tl-2xl rounded-tr-2xl rounded-br-2xl shadow-sm'
                } p-3`}
              >
                {!message.isUser && (
                  <div className="flex items-center mb-2">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="bg-gray-200">
                        {message.sender.substring(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-sm">{message.sender}</div>
                    {message.emotion && message.emotion !== 'neutral' && (
                      <div className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
                        {message.emotion}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="text-sm">
                  {message.content}
                </div>
                
                <div className="text-xs mt-1 opacity-70 text-right">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Active speakers area */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-sm">Active Speakers</h4>
          <div className="text-xs text-gray-500">
            {activeAgent && isSpeaking ? '1 person speaking' : 'Waiting for next speaker'}
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Current speaker */}
          {activeAgent && isSpeaking ? (
            <div className="bg-white rounded-lg p-3 border-l-4 border-policy-maroon shadow-sm animate-pulse-subtle">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-policy-maroon text-white">
                    {activeAgent.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="font-medium">{activeAgent}</div>
                    <div className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium">SPEAKING</div>
                    {currentEmotion && currentEmotion !== 'neutral' && (
                      <div className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {currentEmotion}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {agents.find(a => a.name === activeAgent)?.role}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <VoiceVisualizer isActive={true} emotion={currentEmotion as any} intensity="high" />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 border border-dashed border-gray-300 text-center text-gray-500 text-sm">
              No one is currently speaking. Join the conversation!
            </div>
          )}
          
          {/* Next speakers queue - show 1-2 agents who will speak next */}
          {!isSpeaking && (
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-2">Next in queue:</div>
              <div className="flex space-x-2">
                {agents
                  .filter(agent => agent.name !== activeAgent)
                  .slice(0, 2)
                  .map(agent => (
                    <div key={agent.name} className="flex items-center bg-white rounded-full px-2 py-1 border text-xs">
                      <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center mr-1 text-[10px]">
                        {agent.name.substring(0, 1)}
                      </div>
                      <span>{agent.name}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Voice control dock */}
      <div className="sticky bottom-0 bg-white border-t shadow-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isListening && (
              <div className="text-sm font-medium text-policy-maroon flex items-center">
                <div className="animate-pulse mr-2 h-2 w-2 bg-red-500 rounded-full"></div>
                Recording...
              </div>
            )}
            
            {!isListening && userInput && (
              <div className="text-sm text-gray-500 truncate max-w-[200px] italic">
                "{userInput}"
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Quick reactions */}
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-2"
                onClick={() => setUserInput(prev => prev + ' I agree with that point.')}
                disabled={isSpeaking}
              >
                👍 Agree
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-2"
                onClick={() => setUserInput(prev => prev + ' I disagree with that approach.')}
                disabled={isSpeaking}
              >
                👎 Disagree
              </Button>
            </div>
            
            {/* Mic button */}
            <Button 
              variant={isListening ? "destructive" : "default"}
              size="icon" 
              className={`h-12 w-12 rounded-full ${isListening ? 'animate-pulse' : ''}`}
              onClick={toggleSpeechRecognition}
              disabled={!speechSupported || isSpeaking}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            {/* Send button */}
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full"
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isSpeaking}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Policy topics */}
        <div className="mt-2 flex flex-wrap gap-1">
          <div className="text-xs text-gray-500 mr-1">Topics:</div>
          {selectedPolicies.slice(0, 3).map(policy => (
            <div 
              key={policy.id} 
              className="text-xs px-2 py-0.5 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200"
              onClick={() => setUserInput(prev => `${prev} Regarding ${policy.title}, `)}
            >
              {policy.title}
            </div>
          ))}
          {selectedPolicies.length > 3 && (
            <div className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
              +{selectedPolicies.length - 3} more
            </div>
          )}
        </div>
      </div>
      
      {/* User emotion indicator */}
      {userEmotion !== 'neutral' && (
        <div className="px-3 py-1 bg-gray-50 border-t text-xs text-gray-500">
          Detected emotion: <span className="font-medium">{userEmotion}</span>
        </div>
      )}
    </div>
  );
};

export default ConversationManager;
