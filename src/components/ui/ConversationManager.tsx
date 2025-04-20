import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AgentStance } from '@/types/agents';
import { PolicyWithArea, EmotionType, PolicyAreaContext } from '@/lib/ai-negotiation/shared-types';
import { startSpeechRecognition, stopSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/voice-engine/voice-utils';
import { speakWithEmotion } from '@/lib/voice-engine/hume-integration';
import { detectEmotionsWithHume } from '@/lib/emotion-engine/hume-emotion-detection';
import VoiceVisualizer from './VoiceVisualizer';
import EmotionMeter from '../EmotionMeter';
import EmotionAvatar from '../EmotionAvatar';
import { useToast } from '@/hooks/use-toast';
import { useGameContext } from '@/context/GameContext';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  emotion?: string;
  isUser?: boolean;
  respondingTo?: string;
  policyAreaId?: string; // Add policy area ID
}

interface ConversationManagerProps {
  selectedPolicies: PolicyWithArea[];
  agents: {
    name: string;
    stance: AgentStance;
    avatar: string;
    // Optional properties that might be present in some implementations
    role?: string;
    age?: number;
    concerns?: string[];
  }[];
  onConversationUpdate?: (logs: any[]) => void;
  onSpeakingStateChange?: (isSpeaking: boolean) => void;
  userTitle?: string;
  showMic?: boolean;
  showAgentVoice?: boolean;
  showEmotion?: boolean;
  // Add new props for policy-specific mode
  policySpecificMode?: boolean;
  currentPolicyArea?: PolicyAreaContext;
}

const ConversationManager: React.FC<ConversationManagerProps> = ({
  selectedPolicies,
  agents,
  onConversationUpdate = () => {},
  onSpeakingStateChange = () => {}, // Default empty function
  userTitle = "Policy Advisor",
  showMic = true,
  showAgentVoice = true,
  showEmotion = true,
  policySpecificMode = false,
  currentPolicyArea
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
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [lastAgent, setLastAgent] = useState<string | null>(null);

  const { toast } = useToast();
  
  // Get policy-specific methods from GameContext
  const gameContext = useGameContext();
  const addPolicyNegotiationLog = gameContext.addNegotiationLog;
  const getPolicyNegotiationLogs = gameContext.negotiationLogs;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const conversationStarted = useRef(false);
  const retryCountRef = useRef(0);
  // Add a response lock to prevent duplicate agent responses
  const isAgentRespondingRef = useRef(false);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());

    return () => {
      stopSpeechRecognition();
    };
  }, []);
  
  // Effect to notify parent component when speaking state changes
  useEffect(() => {
    onSpeakingStateChange(isSpeaking || isAgentLoading);
  }, [isSpeaking, isAgentLoading, onSpeakingStateChange]);

  // Initialize messages based on policy-specific mode
  // Store conversation state in refs to prevent re-renders
  const prevPolicyAreaRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  
  // Initialize conversation only once when component mounts or when policy changes
  useEffect(() => {
    // Skip if already initialized for this policy
    const currentPolicyId = currentPolicyArea?.id || null;
    if (prevPolicyAreaRef.current === currentPolicyId && initializedRef.current) {
      return;
    }
    
    // Update refs to track initialization
    prevPolicyAreaRef.current = currentPolicyId;
    initializedRef.current = true;
    
    // Only run this effect when the policy area changes or on initial mount
    if (policySpecificMode && currentPolicyArea && addPolicyNegotiationLog) {
      // Load ALL messages to preserve full conversation history
      // We'll display all messages but only focus on the current policy for agent responses
      const allMessages = getPolicyNegotiationLogs || [];
      
      // Check if there are already messages for this specific policy
      const hasPolicyMessages = allMessages.some(log => log.policyAreaId === currentPolicyArea.id);
      
      if (allMessages.length > 0) {
        // Use functional update to avoid dependency on messages
        // Convert all logs to Message format
        setMessages(allMessages.map(log => ({
          id: log.id || uuidv4(),
          sender: log.agent,
          content: log.content,
          timestamp: new Date(log.timestamp),
          emotion: log.emotion,
          isUser: log.isUser,
          policyAreaId: log.policyAreaId
        })));
      }
      
      // If there are no messages for this specific policy, initialize with a welcome message
      if (!hasPolicyMessages && !conversationStarted.current) {
        // Initialize with welcome message for this policy area
        const initialMessage: Message = {
          id: uuidv4(),
          sender: "System",
          content: `Let's discuss the ${currentPolicyArea.title} policy.`,
          timestamp: new Date(),
          emotion: "Neutral",
          isUser: false,
          policyAreaId: currentPolicyArea.id
        };
        
        // Add the initial message to the existing messages
        setMessages(prev => [...prev, initialMessage]);
        
        // Add to policy negotiation history - use setTimeout to break potential circular dependencies
        setTimeout(() => {
          if (addPolicyNegotiationLog) {
            addPolicyNegotiationLog({
              agent: initialMessage.sender,
              content: initialMessage.content,
              timestamp: initialMessage.timestamp.toISOString(),
              emotion: initialMessage.emotion,
              isUser: initialMessage.isUser,
              policyAreaId: initialMessage.policyAreaId,
              id: initialMessage.id
            });
          }
          
          // Have an agent start the conversation after a short delay
          if (agents.length > 0) {
            setTimeout(() => {
              // Select a random agent to start the conversation instead of always using the first one
              const randomIndex = Math.floor(Math.random() * agents.length);
              const startingAgent = agents[randomIndex];
              // Set the last agent to prevent the same agent from responding next
              setLastAgent(startingAgent.name);
              triggerAgentResponse(startingAgent.name);
            }, 1000);
          }
        }, 0);
      }
    } else if (!conversationStarted.current && agents.length > 0) {
      conversationStarted.current = true;

      const welcomeMessage: Message = {
        id: `system-${Date.now()}`,
        sender: userTitle,
        content: 'Welcome to the stakeholder negotiation phase. The community leaders are ready to discuss your selected policies. Each stakeholder will speak in turn, and you can respond after each one.',
        timestamp: new Date(),
        emotion: 'neutral',
        isUser: true
      };

      setMessages([welcomeMessage]);

      setTimeout(() => {
        triggerAgentResponse(agents[0].name);
      }, 2000);
    }
  }, [policySpecificMode, currentPolicyArea, agents, userTitle, addPolicyNegotiationLog, getPolicyNegotiationLogs]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Use a ref to track if we need to update the parent component
  const shouldUpdateParent = useRef(false);
  
  // Update parent component with conversation logs, but use a ref to prevent infinite loops
  useEffect(() => {
    // Only update if messages have actually changed and we have a callback
    if (onConversationUpdate && shouldUpdateParent.current) {
      const logs = messages.map(msg => {
        if (msg.isUser) {
          return {
            agent: msg.respondingTo || '',
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
            emotion: msg.emotion,
            isUser: msg.isUser,
            policyAreaId: msg.policyAreaId,
            id: msg.id
          };
        } else {
          return {
            agent: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
            emotion: msg.emotion,
            isUser: msg.isUser,
            policyAreaId: msg.policyAreaId,
            id: msg.id
          };
        }
      });
      
      // Use setTimeout to break potential circular dependencies
      setTimeout(() => {
        onConversationUpdate(logs);
      }, 0);
      
      // Reset the flag after updating
      shouldUpdateParent.current = false;
    }
  }, [messages, onConversationUpdate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getNextRespondingAgent = (allAgents: any[]): any => {
    // Track which agents have already spoken
    const agentsWhoSpoke = new Set(
      messages
        .filter(msg => !msg.isUser && allAgents.some(a => a.name === msg.sender))
        .map(msg => msg.sender)
    );
    
    // First try to find an agent who hasn't spoken yet
    const nextAgent = allAgents.find(a => !agentsWhoSpoke.has(a.name));
    if (nextAgent) {
      return nextAgent;
    } else {
      // If all agents have spoken, find agents who haven't spoken recently
      // Get the most recent non-user messages (up to 4)
      const recentSpeakers = messages
        .slice(-4)
        .filter(msg => !msg.isUser)
        .map(msg => msg.sender);
      
      // Most importantly, never select the agent who just spoke last
      const mostRecentAgent = lastAgent;
      
      // Filter out recent speakers, especially the most recent one
      const availableAgents = allAgents.filter(a => 
        a.name !== mostRecentAgent && !recentSpeakers.includes(a.name)
      );
      
      // If we filtered out all agents, at least make sure we don't pick the most recent one
      const agentPool = availableAgents.length > 0 ? 
        availableAgents : 
        allAgents.filter(a => a.name !== mostRecentAgent);
      
      // If we somehow filtered out all agents (should never happen), use all agents
      const finalPool = agentPool.length > 0 ? agentPool : allAgents;
      
      // Select a random agent from the pool
      return finalPool[Math.floor(Math.random() * finalPool.length)];
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    if (isListening) {
      stopSpeechRecognition();
      setIsListening(false);
    }
    try {
      const detectedEmotion = await detectEmotionsWithHume(userInput);
      setUserEmotion(detectedEmotion);
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        sender: userTitle,
        content: userInput,
        timestamp: new Date(),
        emotion: detectedEmotion,
        isUser: true,
        respondingTo: lastAgent,
        // Add policy area ID if in policy-specific mode
        ...(policySpecificMode && currentPolicyArea ? { policyAreaId: currentPolicyArea.id } : {})
      };
      shouldUpdateParent.current = true;
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setUserInput('');
      
      // Add to policy negotiation history if in policy-specific mode
      if (policySpecificMode && currentPolicyArea && addPolicyNegotiationLog) {
        setTimeout(() => {
          addPolicyNegotiationLog({
            agent: userMessage.sender,
            content: userMessage.content,
            timestamp: userMessage.timestamp.toISOString(),
            emotion: userMessage.emotion,
            isUser: userMessage.isUser,
            policyAreaId: userMessage.policyAreaId,
            id: userMessage.id
          });
        }, 0);
      }
      
      // Use setTimeout to break circular dependencies when updating parent
      setTimeout(() => {
        if (onConversationUpdate) {
          onConversationUpdate(messages.concat(userMessage));
        }
      }, 0);
      setWaitingForUserResponse(false);
      const nextAgent = getNextRespondingAgent(agents);
      if (nextAgent) {
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

  const findLastUserMessage = (messages: Message[]): Message | undefined => {
    return messages
      .filter(msg => msg.isUser)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .shift();
  };

  const triggerAgentResponse = async (agentName: string, respondToUserId: string | null = null) => {
    // Check if an agent is already responding to prevent duplicate responses
    if (isAgentRespondingRef.current) {
      console.log('Agent already responding, skipping duplicate response');
      return;
    }
    
    // Set the response lock
    isAgentRespondingRef.current = true;
    
    setActiveAgent(agentName);
    setIsAgentLoading(true);
    setIsSpeaking(false);
    setLastAgent(agentName);
    const agent = agents.find(a => a.name === agentName);
    if (!agent) {
      isAgentRespondingRef.current = false;
      return;
    }
    try {
      const lastUserMessage = findLastUserMessage(messages);
      const lastUserMessageId = respondToUserId || (lastUserMessage ? lastUserMessage.id : null);
      
      // Prepare API request
      const apiRequestBody: any = {
        agentName,
        agentStance: agent.stance,
        selectedPolicies,
        previousMessages: messages.slice(-5),
        respondToUserId: lastUserMessageId
      };
      
      // Add policy area context if in policy-specific mode
      if (policySpecificMode && currentPolicyArea) {
        apiRequestBody.policyAreaContext = currentPolicyArea;
      }
      
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiRequestBody)
      });
      
      if (!response.ok) throw new Error('Failed to generate response');
      const data = await response.json();
      const { message } = data;
      // Fetch emotion from Hume API backend for the agent's message
      let emotion = 'neutral';
      try {
        emotion = await detectEmotionsWithHume(message);
      } catch (emotionErr) {
        console.error('Hume emotion fetch failed:', emotionErr);
        emotion = 'neutral';
      }
      setCurrentEmotion(emotion);
      const agentMessage: Message = {
        id: `${agentName.toLowerCase().replace(' ', '-')}-${Date.now()}`,
        sender: agentName,
        content: message, // transcript
        timestamp: new Date(),
        emotion,
        respondingTo: lastUserMessageId,
        // Add policy area ID if in policy-specific mode
        ...(policySpecificMode && currentPolicyArea ? { policyAreaId: currentPolicyArea.id } : {})
      };
      setMessages(prev => [...prev, agentMessage]);
      
      // In triggerAgentResponse function
      // Add to policy negotiation history if in policy-specific mode
      if (policySpecificMode && currentPolicyArea && addPolicyNegotiationLog) {
        addPolicyNegotiationLog({
          agent: agentMessage.sender,
          content: agentMessage.content,
          timestamp: agentMessage.timestamp.toISOString(),
          emotion: agentMessage.emotion,
          isUser: agentMessage.isUser,
          policyAreaId: agentMessage.policyAreaId,
          id: agentMessage.id
        });
      }
      
      try {
        await speakWithEmotion(
          message,
          agentName,
          emotion as EmotionType,
          () => { setIsAgentLoading(false); setIsSpeaking(true); },
          () => {
            setIsSpeaking(false);
            setActiveAgent(null);
            toast({
              title: "Your turn to respond",
              description: "Click the microphone button or type your response",
            });
            setWaitingForUserResponse(true);
            // Release the response lock when agent is done speaking
            isAgentRespondingRef.current = false;
          }
        );
      } catch (error) {
        console.error('Error with speech synthesis:', error);
        const speakingTime = Math.min(Math.max(message.length * 50, 3000), 10000);
        setTimeout(() => {
          setIsSpeaking(false);
          setActiveAgent(null);
          toast({
            title: "Your turn to respond",
            description: "Click the microphone button or type your response",
          });
          setWaitingForUserResponse(true);
          // Release the response lock on speech synthesis error
          isAgentRespondingRef.current = false;
        }, speakingTime);
      }
    } catch (error) {
      console.error('Error generating agent response:', error);
      setIsAgentLoading(false);
      setIsSpeaking(false);
      setActiveAgent(null);
      const fallbackMessage: Message = {
        id: `${agentName.toLowerCase().replace(' ', '-')}-fallback-${Date.now()}`,
        sender: agentName,
        content: `I'd like to discuss these policies further, but I'm having trouble formulating my thoughts right now.`,
        timestamp: new Date(),
        emotion: 'neutral'
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setWaitingForUserResponse(true);
      // Release the response lock on main error
      isAgentRespondingRef.current = false;
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
      stopSpeechRecognition();
      setIsListening(false);
      setSpeechError(null);
      toast({
        title: "Recording stopped",
        description: "Press send when you're ready to submit your response",
      });
    } else {
      if (isSpeaking) {
        setSpeechError('Please wait for the speaker to finish');
        return;
      }
      setSpeechError(null);
      const success = startSpeechRecognition({
        onStart: () => {
          setIsListening(true);
          setSpeechError(null);
          toast({
            title: "Listening...",
            description: "Speak clearly, then click the mic button again when finished",
          });
        },
        onEnd: () => {},
        onResult: (transcript) => { setUserInput(transcript); },
        onError: (error) => {
          setIsListening(false);
          if (!error.includes('no-speech')) {
            setSpeechError(error);
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

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden text-black relative">
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
          {/* Loading indicator overlay when waiting for agent response */}
          {isAgentLoading && activeAgent && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 animate-fade-in">
                <svg className="animate-spin h-8 w-8 text-policy-maroon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <div className="text-lg font-semibold text-policy-maroon">{activeAgent} is preparing their response...</div>
                <div className="text-sm text-gray-600">Please wait for the agent to speak</div>
              </div>
            </div>
          )}
          {/* Top Row - 4 agents */}
          {agents.slice(0, 4).map((agent, index) => (
            <div 
              key={`agent-${agent.name}-${index}`} 
              className={`bg-white rounded-lg shadow-sm p-3 flex flex-col overflow-hidden ${
                activeAgent === agent.name ? 'ring-2 ring-policy-maroon' : ''
              }`}
            >
              <div className="flex items-center mb-2">
                <EmotionAvatar
                  agentName={agent.name}
                  emotion={messages.filter(msg => msg.sender === agent.name).slice(-1)[0]?.emotion as EmotionType || 'neutral'}
                  isActive={activeAgent === agent.name}
                  size="md"
                  className="mr-2 shrink-0 min-w-0 max-w-[2.5rem]"
                />
                <div>
                  <div className="font-medium text-sm">{agent.name}</div>
                  {/* Removed role designation as requested */}
                </div>
                <div className="ml-auto flex flex-col items-end gap-1">
                  {activeAgent === agent.name && (
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                      <span className="text-xs text-green-600">Speaking</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto text-sm text-black">
                {messages
                  .filter(msg => msg.sender === agent.name)
                  .slice(-1)
                  .map(msg => (
                    <div key={msg.id}>
                      <div className="text-xs text-gray-500 mb-1">
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div>{msg.content}</div>
                      <div className="mt-1">
                        <EmotionMeter 
                          emotion={msg.emotion as EmotionType || 'neutral'}
                          size="sm"
                          showIntensity={true}
                        />
                      </div>
                    </div>
                  ))}
                {messages.filter(msg => msg.sender === agent.name).length === 0 && (
                  <div className="text-gray-400 italic">No messages yet</div>
                )}
              </div>
              
              {/* Removed political stance display as requested by user */}
            </div>
          ))}
          
          {/* Bottom Row - Policy Advisor (You) */}
          <div className="bg-policy-maroon text-white rounded-lg shadow-sm p-3 flex flex-col col-span-4">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2 text-policy-maroon">
                P
              </div>
              <div>
                <div className="font-medium">{userTitle}</div>
                {/* Removed role designation as requested */}
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                {isListening && (
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs text-green-600">Listening</span>
                  </div>
                )}
                {messages.filter(msg => msg.isUser).length > 0 && (
                  <EmotionMeter 
                    emotion={messages.filter(msg => msg.isUser).slice(-1)[0]?.emotion as EmotionType || 'neutral'}
                    size="sm"
                    showIntensity={true}
                  />
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto text-sm bg-white bg-opacity-20 rounded p-2 text-white">
              {messages
                .filter(msg => msg.isUser)
                .slice(-1)
                .map(msg => (
                  <div key={msg.id}>
                    <div className="text-xs text-gray-200 mb-1">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-white">{msg.content}</div>
                  </div>
                ))}
              {messages.filter(msg => msg.isUser).length === 0 && (
                <div className="text-gray-200 italic">No messages yet</div>
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
                  } p-3 text-black`}
                >
                  {!message.isUser && showAgentVoice && (
                    <VoiceVisualizer isActive={isSpeaking && activeAgent === message.sender} emotion={showEmotion ? (message.emotion as EmotionType) : 'neutral'} />
                  )}
                  {!message.isUser && (
                    <div className="flex items-center mb-2">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="bg-gray-200">
                          {message.sender.substring(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{message.sender}</div>
                        <div className="text-xs text-gray-500">{message.isUser ? 'Policy Advisor' : 'Stakeholder'}</div>
                      </div>
                      <div className="ml-auto flex flex-col items-end gap-1">
                        {message.emotion && message.emotion !== 'neutral' && showEmotion && (
                          <EmotionMeter 
                            emotion={message.emotion as EmotionType}
                            size="sm"
                            showIntensity={true}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {message.isUser && (
                    <div className="flex items-center mb-2 justify-end">
                      <div className="font-medium text-sm">{message.sender}</div>
                      <div className="ml-auto flex flex-col items-end gap-1">
                        {message.emotion && message.emotion !== 'neutral' && showEmotion && (
                          <EmotionMeter 
                            emotion={message.emotion as EmotionType}
                            size="sm"
                            showIntensity={true}
                          />
                        )}
                      </div>
                      <Avatar className="h-6 w-6 ml-2">
                        <AvatarFallback className="bg-white text-policy-maroon font-medium">
                          {message.sender.substring(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  <div className="text-sm text-black">
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
              className="resize-none border-2 focus:border-policy-maroon text-black"
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
            {speechSupported && showMic && (
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                onClick={toggleSpeechRecognition}
                disabled={isSpeaking}
                className="h-10 w-10 rounded-full"
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="h-5 w-5 text-black" /> : <Mic className="h-5 w-5 text-black" />}
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
      </div>
    </div>
  );
};

export default ConversationManager;