import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, ChevronDown, Heart, AlertTriangle, Smile, Frown, Meh } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AgentStance } from '@/types/agents';
import { PolicyWithArea, EmotionType } from '@/lib/ai-negotiation/shared-types';
import { startSpeechRecognition, stopSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/voice-engine/voice-utils';
import { speakWithEmotion } from '@/lib/voice-engine/hume-integration';
import { detectEmotionsWithHume } from '@/lib/emotion-engine/hume-emotion-detection';
import VoiceVisualizer from './VoiceVisualizer';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  emotion?: string;
  isUser?: boolean;
  respondingTo?: string;
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
  userTitle?: string;
}

const ConversationManager: React.FC<ConversationManagerProps> = ({
  selectedPolicies,
  agents,
  onConversationUpdate,
  userTitle = "Policy Advisor"
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [userEmotion, setUserEmotion] = useState('neutral');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [waitingForUserResponse, setWaitingForUserResponse] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  const { toast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const conversationStarted = useRef(false);
  const retryCountRef = useRef(0);
  
  // Check if speech recognition is supported
  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
    
    // Start conversation with welcome message
    if (!conversationStarted.current && agents.length > 0) {
      conversationStarted.current = true;
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: `system-${Date.now()}`,
        sender: userTitle,
        content: 'Welcome to the stakeholder negotiation phase. The community leaders are ready to discuss your selected policies. Each stakeholder will speak in turn, and you can respond after each one.',
        timestamp: new Date(),
        emotion: 'neutral',
        isUser: true
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
  
  // Function to determine which agent should respond next
  const getNextRespondingAgent = (allAgents: any[]): any => {
    // Find which agents have already spoken
    const agentsWhoSpoke = new Set(
      messages
        .filter(msg => !msg.isUser && allAgents.some(a => a.name === msg.sender))
        .map(msg => msg.sender)
    );
    
    // Find the next agent who hasn't spoken yet
    const nextAgent = allAgents.find(a => !agentsWhoSpoke.has(a.name));
    
    // If all agents have spoken, pick a random one who hasn't spoken recently
    if (nextAgent) {
      return nextAgent;
    } else {
      // All agents have spoken at least once, pick one who hasn't spoken recently
      // Exclude the most recent agent who spoke
      const recentSpeakers = messages
        .slice(-4)
        .filter(msg => !msg.isUser)
        .map(msg => msg.sender);
      
      const availableAgents = allAgents.filter(a => !recentSpeakers.includes(a.name));
      
      // If all agents spoke recently, pick a random one
      const agentPool = availableAgents.length > 0 ? availableAgents : allAgents;
      return agentPool[Math.floor(Math.random() * agentPool.length)];
    }
  };

  // Function to handle sending user messages
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Set loading state
    const isProcessing = true;
    
    try {
      // Detect emotion from user input using Hume AI
      const emotionResult = await detectEmotionsWithHume(userInput);
      const detectedEmotion = emotionResult.dominantEmotion;
      setUserEmotion(detectedEmotion);
      
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        sender: userTitle,
        content: userInput,
        timestamp: new Date(),
        emotion: detectedEmotion,
        isUser: true
      };
      
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setUserInput('');
      
      // Update conversation logs
      onConversationUpdate(updatedMessages);
      
      // Reset waiting for user response flag
      setWaitingForUserResponse(false);
      
      // Automatically trigger a response from one of the agents after user sends a message
      const nextAgent = getNextRespondingAgent(agents);
      if (nextAgent) {
        // Wait a short moment before agent responds (for natural conversation flow)
        setTimeout(() => {
          triggerAgentResponse(nextAgent.name, userMessage.id);
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "There was an error processing your message. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Analyze user input to detect emotion - DEPRECATED, now using Hume AI
  const analyzeUserEmotion = (text: string): string => {
    // This function is kept for fallback purposes but is no longer the primary emotion detection method
    const lowerInput = text.toLowerCase();
    
    // Simple keyword-based emotion detection
    if (lowerInput.includes('angry') || lowerInput.includes('upset') || 
        lowerInput.includes('unfair') || lowerInput.includes('ridiculous')) {
      return 'anger';
    }
    
    if (lowerInput.includes('worried') || lowerInput.includes('concern') || 
        lowerInput.includes('afraid') || lowerInput.includes('risk')) {
      return 'concern';
    }
    
    if (lowerInput.includes('happy') || lowerInput.includes('excited') || 
        lowerInput.includes('great') || lowerInput.includes('excellent')) {
      return 'enthusiasm';
    }
    
    if (lowerInput.includes('sad') || lowerInput.includes('disappointed') || 
        lowerInput.includes('unfortunate')) {
      return 'frustration';
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('support') || 
        lowerInput.includes('care') || lowerInput.includes('understand')) {
      return 'compassion';
    }
    
    return 'neutral';
  };
  
  // Find the last user message
  const findLastUserMessage = (messages: Message[]): Message | undefined => {
    return messages
      .filter(msg => msg.isUser)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .shift();
  };
  
  // Trigger an agent to respond
  const triggerAgentResponse = async (agentName: string, respondToUserId: string | null = null) => {
    setActiveAgent(agentName);
    setIsSpeaking(true);
    
    // Find the agent's data
    const agent = agents.find(a => a.name === agentName);
    if (!agent) return;
    
    try {
      // Find the last user message to ensure the agent responds to it
      const lastUserMessage = findLastUserMessage(messages);
      const lastUserMessageId = respondToUserId || (lastUserMessage ? lastUserMessage.id : null);
      
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
          previousMessages: messages.slice(-5), // Send last 5 messages for context
          respondToUserId: lastUserMessageId // Explicitly tell the API which message to respond to
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
        emotion,
        respondingTo: lastUserMessageId // Track which message this is responding to
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
            
            // After agent speaks, wait for user response
            toast({
              title: "Your turn to respond",
              description: "Click the microphone button or type your response",
            });
            
            // Set a flag indicating we're waiting for user response
            setWaitingForUserResponse(true);
          }
        );
      } catch (error) {
        console.error('Error with speech synthesis:', error);
        // Fallback to timer-based approach if speech synthesis fails
        const speakingTime = Math.min(Math.max(message.length * 50, 3000), 10000);
        setTimeout(() => {
          setIsSpeaking(false);
          setActiveAgent(null);
          
          // After agent speaks, wait for user response
          toast({
            title: "Your turn to respond",
            description: "Click the microphone button or type your response",
          });
          
          // Set a flag indicating we're waiting for user response
          setWaitingForUserResponse(true);
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
      
      // Even with error, we still wait for user response
      setWaitingForUserResponse(true);
    }
  };
  
  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use text input instead.",
        variant: "destructive",
      });
      return;
    }
    
    if (isListening) {
      // User manually stopped speaking
      stopSpeechRecognition();
      setIsListening(false);
      setSpeechError(null);
      
      // Don't auto-send - let the user decide when to send
      toast({
        title: "Recording stopped",
        description: "Press send when you're ready to submit your response",
      });
    } else {
      // Make sure we're not speaking before starting recognition
      if (isSpeaking) {
        console.log('Cannot start speech recognition while agent is speaking');
        setSpeechError('Please wait for the speaker to finish');
        return;
      }
      
      // Clear any previous error
      setSpeechError(null);
      
      const success = startSpeechRecognition({
        onStart: () => {
          setIsListening(true);
          setSpeechError(null);
          console.log('Speech recognition started');
          
          // Show a toast to indicate recording has started
          toast({
            title: "Listening...",
            description: "Speak clearly, then click the mic button again when finished",
          });
        },
        onEnd: () => {
          // Don't automatically set isListening to false
          // This will be handled by the user clicking the mic button again
          console.log('Speech recognition ended');
          
          // Don't auto-send message - let the user decide when to send
        },
        onResult: (transcript) => {
          setUserInput(transcript);
          console.log('Speech recognition result:', transcript);
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          
          // Only show error if it's not a no-speech error (which is common and not a real error)
          if (!error.includes('no-speech')) {
            setSpeechError(error);
            
            // Show toast notification for network errors
            if (error.includes('Network error')) {
              toast({
                title: "Speech Recognition Error",
                description: "Network connection issue. Try using the text input instead.",
                variant: "destructive",
              });
            }
          }
        }
      });
      
      if (!success) {
        console.error('Failed to start speech recognition');
        setIsListening(false);
        setSpeechError('Speech recognition not available');
        
        toast({
          title: "Speech Recognition Unavailable",
          description: "Your browser may not support this feature. Try using text input instead.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Get emotion icon and color based on emotion type
  const getEmotionDisplay = (emotion: string = 'neutral') => {
    const emotionMap: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
      'neutral': { 
        icon: <Meh className="h-3 w-3 mr-1" />, 
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      },
      'anger': { 
        icon: <AlertTriangle className="h-3 w-3 mr-1" />, 
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      },
      'compassion': { 
        icon: <Heart className="h-3 w-3 mr-1" />, 
        color: 'text-pink-600',
        bgColor: 'bg-pink-50'
      },
      'frustration': { 
        icon: <Frown className="h-3 w-3 mr-1" />, 
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      'enthusiasm': { 
        icon: <Smile className="h-3 w-3 mr-1" />, 
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      'concern': { 
        icon: <AlertTriangle className="h-3 w-3 mr-1" />, 
        color: 'text-amber-600',
        bgColor: 'bg-amber-50'
      }
    };

    return emotionMap[emotion] || emotionMap['neutral'];
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Live Debate Section */}
      <div className="bg-policy-maroon text-white p-3 flex justify-between items-center">
        <h2 className="text-xl font-bold">LIVE POLICY DEBATE</h2>
        <div className="flex items-center">
          <div className="animate-pulse mr-2 h-3 w-3 bg-red-500 rounded-full"></div>
          <span className="text-sm">LIVE</span>
        </div>
      </div>
      
      {/* Five Speaker Boxes Layout */}
      <div className="flex-1 bg-gray-50 p-3">
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-full">
          {/* Top Row - 4 agents */}
          <div 
            className={`bg-white rounded-lg shadow-sm p-3 flex flex-col ${
              activeAgent === 'Minister Santos' ? 'ring-2 ring-policy-maroon' : ''
            }`}
          >
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                M
              </div>
              <div>
                <div className="font-medium text-sm">Minister Santos</div>
                <div className="text-xs text-gray-500">Education Minister</div>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                {activeAgent === 'Minister Santos' && (
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-green-600">Speaking</span>
                  </div>
                )}
                {messages.filter(msg => msg.sender === 'Minister Santos').length > 0 && (() => {
                  const emotion = messages
                    .filter(msg => msg.sender === 'Minister Santos')
                    .slice(-1)[0]?.emotion || 'neutral';
                  const { icon, color, bgColor } = getEmotionDisplay(emotion);
                  
                  return (
                    <div className="flex items-center">
                      <span className={`text-[10px] px-1.5 py-0.5 ${bgColor} ${color} rounded-full capitalize flex items-center whitespace-nowrap overflow-hidden`}>
                        {icon}
                        {emotion}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto text-sm">
              {messages
                .filter(msg => msg.sender === 'Minister Santos')
                .slice(-1)
                .map(msg => (
                  <div key={msg.id}>
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
              {messages.filter(msg => msg.sender === 'Minister Santos').length === 0 && (
                <div className="text-gray-400 italic">No messages yet</div>
              )}
            </div>
            
            <div className="mt-2 text-xs px-2 py-1 bg-gray-100 rounded-full self-start">
              NEOLIBERAL
            </div>
          </div>
          
          <div 
            className={`bg-white rounded-lg shadow-sm p-3 flex flex-col ${
              activeAgent === 'Dr. Chen' ? 'ring-2 ring-policy-maroon' : ''
            }`}
          >
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                D
              </div>
              <div>
                <div className="font-medium text-sm">Dr. Chen</div>
                <div className="text-xs text-gray-500">Education Researcher</div>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                {activeAgent === 'Dr. Chen' && (
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-green-600">Speaking</span>
                  </div>
                )}
                {messages.filter(msg => msg.sender === 'Dr. Chen').length > 0 && (() => {
                  const emotion = messages
                    .filter(msg => msg.sender === 'Dr. Chen')
                    .slice(-1)[0]?.emotion || 'neutral';
                  const { icon, color, bgColor } = getEmotionDisplay(emotion);
                  
                  return (
                    <div className="flex items-center">
                      <span className={`text-[10px] px-1.5 py-0.5 ${bgColor} ${color} rounded-full capitalize flex items-center whitespace-nowrap overflow-hidden`}>
                        {icon}
                        {emotion}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto text-sm">
              {messages
                .filter(msg => msg.sender === 'Dr. Chen')
                .slice(-1)
                .map(msg => (
                  <div key={msg.id}>
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
              {messages.filter(msg => msg.sender === 'Dr. Chen').length === 0 && (
                <div className="text-gray-400 italic">No messages yet</div>
              )}
            </div>
            
            <div className="mt-2 text-xs px-2 py-1 bg-gray-100 rounded-full self-start">
              PROGRESSIVE
            </div>
          </div>
          
          <div 
            className={`bg-white rounded-lg shadow-sm p-3 flex flex-col ${
              activeAgent === 'Mayor Okonjo' ? 'ring-2 ring-policy-maroon' : ''
            }`}
          >
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                M
              </div>
              <div>
                <div className="font-medium text-sm">Mayor Okonjo</div>
                <div className="text-xs text-gray-500">City Mayor</div>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                {activeAgent === 'Mayor Okonjo' && (
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-green-600">Speaking</span>
                  </div>
                )}
                {messages.filter(msg => msg.sender === 'Mayor Okonjo').length > 0 && (() => {
                  const emotion = messages
                    .filter(msg => msg.sender === 'Mayor Okonjo')
                    .slice(-1)[0]?.emotion || 'neutral';
                  const { icon, color, bgColor } = getEmotionDisplay(emotion);
                  
                  return (
                    <div className="flex items-center">
                      <span className={`text-[10px] px-1.5 py-0.5 ${bgColor} ${color} rounded-full capitalize flex items-center whitespace-nowrap overflow-hidden`}>
                        {icon}
                        {emotion}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto text-sm">
              {messages
                .filter(msg => msg.sender === 'Mayor Okonjo')
                .slice(-1)
                .map(msg => (
                  <div key={msg.id}>
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
              {messages.filter(msg => msg.sender === 'Mayor Okonjo').length === 0 && (
                <div className="text-gray-400 italic">No messages yet</div>
              )}
            </div>
            
            <div className="mt-2 text-xs px-2 py-1 bg-gray-100 rounded-full self-start">
              MODERATE
            </div>
          </div>
          
          <div 
            className={`bg-white rounded-lg shadow-sm p-3 flex flex-col ${
              activeAgent === 'Community Leader Patel' ? 'ring-2 ring-policy-maroon' : ''
            }`}
          >
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                C
              </div>
              <div>
                <div className="font-medium text-sm">Community Leader Patel</div>
                <div className="text-xs text-gray-500">Community Advocate</div>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                {activeAgent === 'Community Leader Patel' && (
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-green-600">Speaking</span>
                  </div>
                )}
                {messages.filter(msg => msg.sender === 'Community Leader Patel').length > 0 && (() => {
                  const emotion = messages
                    .filter(msg => msg.sender === 'Community Leader Patel')
                    .slice(-1)[0]?.emotion || 'neutral';
                  const { icon, color, bgColor } = getEmotionDisplay(emotion);
                  
                  return (
                    <div className="flex items-center">
                      <span className={`text-[10px] px-1.5 py-0.5 ${bgColor} ${color} rounded-full capitalize flex items-center whitespace-nowrap overflow-hidden`}>
                        {icon}
                        {emotion}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto text-sm">
              {messages
                .filter(msg => msg.sender === 'Community Leader Patel')
                .slice(-1)
                .map(msg => (
                  <div key={msg.id}>
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
              {messages.filter(msg => msg.sender === 'Community Leader Patel').length === 0 && (
                <div className="text-gray-400 italic">No messages yet</div>
              )}
            </div>
            
            <div className="mt-2 text-xs px-2 py-1 bg-gray-100 rounded-full self-start">
              HUMANITARIAN
            </div>
          </div>
          
          {/* Bottom Row - Policy Advisor (You) */}
          <div className="bg-policy-maroon text-white rounded-lg shadow-sm p-3 flex flex-col col-span-4">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2 text-policy-maroon">
                P
              </div>
              <div>
                <div className="font-medium">{userTitle}</div>
                <div className="text-xs text-white text-opacity-80">Ministry of Refugee Affairs</div>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                {isListening && (
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-green-600">Listening</span>
                  </div>
                )}
                {messages.filter(msg => msg.isUser).length > 0 && (() => {
                  const emotion = messages
                    .filter(msg => msg.isUser)
                    .slice(-1)[0]?.emotion || 'neutral';
                  const { icon, color, bgColor } = getEmotionDisplay(emotion);
                  
                  return (
                    <div className="flex items-center">
                      <span className={`text-[10px] px-1.5 py-0.5 ${bgColor} ${color} rounded-full capitalize flex items-center whitespace-nowrap overflow-hidden`}>
                        {icon}
                        {emotion}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto text-sm bg-white bg-opacity-20 rounded p-2">
              {messages
                .filter(msg => msg.isUser)
                .slice(-1)
                .map(msg => (
                  <div key={msg.id}>
                    <div className="text-xs text-white text-opacity-70 mb-1">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
              {messages.filter(msg => msg.isUser).length === 0 && (
                <div className="text-white text-opacity-70 italic">No messages yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Full Conversation History */}
      <div className="border-t bg-white">
        <div className="p-2 flex justify-between items-center cursor-pointer hover:bg-gray-50" 
             onClick={() => setShowFullHistory(prev => !prev)}>
          <span className="text-sm font-medium">Full Conversation History</span>
          <ChevronDown className={`h-4 w-4 transform ${showFullHistory ? 'rotate-180' : ''}`} />
        </div>
        
        {showFullHistory && (
          <div className="max-h-[200px] overflow-y-auto p-3 space-y-3" ref={messagesContainerRef}>
            {messages.map(message => (
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
                  
                  {message.isUser && (
                    <div className="flex items-center mb-2 justify-end">
                      <div className="font-medium text-sm">{message.sender}</div>
                      {message.emotion && message.emotion !== 'neutral' && (
                        <div className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-gray-700 text-white">
                          {message.emotion}
                        </div>
                      )}
                      <Avatar className="h-6 w-6 ml-2">
                        <AvatarFallback className="bg-white text-policy-maroon font-medium">
                          {message.sender.substring(0, 1)}
                        </AvatarFallback>
                      </Avatar>
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
        )}
      </div>
      
      {/* Message Input Area */}
      <div className="border-t bg-white p-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message here..."
              className="resize-none border-2 focus:border-policy-maroon"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
          
          <div className="flex gap-2">
            {speechSupported && (
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={toggleSpeechRecognition}
                disabled={isSpeaking}
                className="h-10 w-10 rounded-full"
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            )}
            
            <Button
              variant="default"
              size="icon"
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isSpeaking}
              className="h-10 w-10 bg-policy-maroon hover:bg-policy-maroon/90 rounded-full"
            >
              <Send className="h-5 w-5" />
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
    </div>
  );
};

export default ConversationManager;
