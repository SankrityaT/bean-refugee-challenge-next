'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGameContext, NegotiationLog } from '@/context/GameContext';
import ConversationManager from '@/components/ui/ConversationManager';
import { AgentStance } from '@/types/agents';
import { Users, ArrowRight, MessageCircle, Lightbulb, HeartHandshake, Mic, MicOff, Send, X, ChevronRight, ChevronLeft, MessageSquare, Check, ChevronDown } from 'lucide-react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat'
});

// Define the structure for the agents passed to ConversationManager
type AgentOpinion = 'positive' | 'negative';

interface DisplayAgent {
  id: string;
  name: string;
  stance: AgentStance;
  role: string;
  age: number;
  concerns: string[];
  avatar: string;
  gender: 'male' | 'female';
  opinion: AgentOpinion;
}

interface AgentProfile {
  name: string;
  role: string;
  ageRange: [number, number];
  concerns: string[];
  possibleStances: AgentStance[];
  avatar: string;
  gender: 'male' | 'female';
  possibleOpinions: AgentOpinion[];
}

// Define an expanded pool of potential agent profiles
const agentProfilePool: AgentProfile[] = [
  // Original agents with gender and possibleOpinions
  { 
    name: "Minister Santos", 
    role: "Education Minister", 
    ageRange: [48, 60], 
    concerns: ["Budget constraints", "Economic impact", "Standardized testing"], 
    possibleStances: [AgentStance.NEOLIBERAL, AgentStance.MODERATE], 
    avatar: "/avatars/minister.png",
    gender: 'male' as const,
    possibleOpinions: ['negative', 'positive'] as const
  },
  { 
    name: "Dr. Chen", 
    role: "Education Researcher", 
    ageRange: [40, 55], 
    concerns: ["Equity", "Inclusion", "Cultural sensitivity", "Teacher training"], 
    possibleStances: [AgentStance.PROGRESSIVE], 
    avatar: "/avatars/researcher.png",
    gender: 'female' as const,
    possibleOpinions: ['positive'] as const
  },
  { 
    name: "Mayor Johnson", 
    role: "Local Government", 
    ageRange: [45, 65], 
    concerns: ["Community integration", "Public services", "Local economy"], 
    possibleStances: [AgentStance.MODERATE, AgentStance.NEOLIBERAL], 
    avatar: "/avatars/mayor.png",
    gender: 'male' as const,
    possibleOpinions: ['negative', 'positive'] as const
  },
  { 
    name: "Ms. Rodriguez", 
    role: "Refugee Advocate", 
    ageRange: [30, 45], 
    concerns: ["Human rights", "Family reunification", "Mental health support"], 
    possibleStances: [AgentStance.HUMANITARIAN, AgentStance.PROGRESSIVE], 
    avatar: "/avatars/advocate.png",
    gender: 'female' as const,
    possibleOpinions: ['positive'] as const
  },
  { 
    name: "Mr. Patel", 
    role: "Business Leader", 
    ageRange: [40, 60], 
    concerns: ["Economic impact", "Labor market", "Skills training"], 
    possibleStances: [AgentStance.NEOLIBERAL], 
    avatar: "/avatars/business.png",
    gender: 'male' as const,
    possibleOpinions: ['negative'] as const
  },
  { 
    name: "Dr. Okafor", 
    role: "Healthcare Director", 
    ageRange: [45, 60], 
    concerns: ["Healthcare access", "Trauma support", "Public health"], 
    possibleStances: [AgentStance.HUMANITARIAN, AgentStance.MODERATE], 
    avatar: "/avatars/doctor.png",
    gender: 'female' as const,
    possibleOpinions: ['positive', 'negative'] as const
  }
];

// Extend the NegotiationLog interface to include the policyId property
interface ExtendedNegotiationLog extends NegotiationLog {
  policyId: string;
}

// Utility function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Rainbow Stripe component (top + bottom)
const RainbowStripe = () => (
  <div className="flex w-full h-8">
    <div className="flex-1 bg-[#6E1E1E]" />
    <div className="flex-1 bg-[#FFD700]" />
    <div className="flex-1 bg-[#1C140D]" />
    <div className="flex-1 bg-[#388E3C]" />
    <div className="flex-1 bg-[#42A5F5]" />
    <div className="flex-1 bg-[#EF6C00]" />
    <div className="flex-1 bg-[#A0522D]" />
    <div className="flex-1 bg-[#80C9D5]" />
    <div className="flex-1 bg-[#E148A1]" />
  </div>
);

export default function PoliticalAssemblyDebatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    negotiationLogs,
    addNegotiationLog,
    setNegotiationLogs,
    getSelectedPolicyObjects
  } = useGameContext();

  // State to track conversation and policy selection
  const [currentPolicyIndex, setCurrentPolicyIndex] = useState(0);
  const [policyOrder, setPolicyOrder] = useState<string[]>([]);
  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<DisplayAgent[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [debatedPolicies, setDebatedPolicies] = useState<Set<string>>(new Set());
  const [currentPolicyDebateComplete, setCurrentPolicyDebateComplete] = useState(false);
  // Add a conversation key to force ConversationManager to reinitialize when switching policies
  const [conversationKey, setConversationKey] = useState(0);

  // State for storing all conversation logs across all policies
  const [allNegotiationLogs, setAllNegotiationLogs] = useState<ExtendedNegotiationLog[]>([]);
  const [showFullHistory, setShowFullHistory] = useState(false);

  // Helper to get the currently selected policy object
  const getSelectedPolicy = () => {
    if (!selectedPolicyId) return null;
    return getSelectedPolicyObjects().find(p => p.id === selectedPolicyId) || null;
  };

  // Enhanced agent selection for gender/opinion balance for the current policy
  const selectDebateAgents = (policyId: string) => {
    const policy = getSelectedPolicyObjects().find(p => p.id === policyId);
    if (!policy) return [];
    
    // Filter agent pool for those with possibleOpinions matching the policy
    const positiveAgents = agentProfilePool.filter(a => a.possibleOpinions.includes('positive'));
    const negativeAgents = agentProfilePool.filter(a => a.possibleOpinions.includes('negative'));
    
    // Gender split
    const posMales = positiveAgents.filter(a => a.gender === 'male');
    const posFemales = positiveAgents.filter(a => a.gender === 'female');
    const negMales = negativeAgents.filter(a => a.gender === 'male');
    const negFemales = negativeAgents.filter(a => a.gender === 'female');
    
    // Track selected agents to prevent duplicates
    const selectedAgentNames = new Set<string>();
    const supportingAgents = [];
    const opposingAgents = [];
    
    // Helper function to select a random agent while avoiding duplicates
    const selectRandomAgent = (pool: AgentProfile[]) => {
      // Filter out already selected agents
      const availableAgents = pool.filter(a => !selectedAgentNames.has(a.name));
      if (availableAgents.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * availableAgents.length);
      const selectedAgent = availableAgents[randomIndex];
      selectedAgentNames.add(selectedAgent.name);
      return selectedAgent;
    };
    
    // Select 1 male + 1 female for supporting agents (positive opinion)
    const posMale = selectRandomAgent(posMales);
    if (posMale) supportingAgents.push(posMale);
    
    const posFemale = selectRandomAgent(posFemales);
    if (posFemale) supportingAgents.push(posFemale);
    
    // Select 1 male + 1 female for opposing agents (negative opinion)
    const negMale = selectRandomAgent(negMales);
    if (negMale) opposingAgents.push(negMale);
    
    const negFemale = selectRandomAgent(negFemales);
    if (negFemale) opposingAgents.push(negFemale);
    
    // Ensure we have exactly 2 supporting and 2 opposing agents
    // If we don't have enough supporting agents, add more from any gender
    while (supportingAgents.length < 2) {
      const nextAgent = selectRandomAgent(positiveAgents);
      if (!nextAgent) break; // No more unique positive agents available
      supportingAgents.push(nextAgent);
    }
    
    // If we don't have enough opposing agents, add more from any gender
    while (opposingAgents.length < 2) {
      const nextAgent = selectRandomAgent(negativeAgents);
      if (!nextAgent) break; // No more unique negative agents available
      opposingAgents.push(nextAgent);
    }
    
    // Combine supporting and opposing agents
    const selected = [...supportingAgents, ...opposingAgents];
    
    // If we still don't have 4 agents, add from any available agent
    while (selected.length < 4) {
      const allAgents = [...positiveAgents, ...negativeAgents];
      const nextAgent = selectRandomAgent(allAgents);
      if (!nextAgent) break; // No more unique agents available
      
      // Determine if this should be a supporting or opposing agent to maintain balance
      if (supportingAgents.length < 2) {
        supportingAgents.push(nextAgent);
      } else {
        opposingAgents.push(nextAgent);
      }
      selected.push(nextAgent);
    }
    
    // Map to DisplayAgent with unique IDs
    return selected.slice(0,4).map((profile, idx) => {
      const stance = profile.possibleStances[0];
      const age = Math.floor(Math.random() * (profile.ageRange[1] - profile.ageRange[0] + 1)) + profile.ageRange[0];
      
      // Assign opinion based on which group the agent is in
      const opinion = supportingAgents.includes(profile) ? 'positive' as const : 'negative' as const;
      
      return {
        id: `${profile.name.replace(/\s+/g, '-')}-${idx}`, // Add unique ID
        name: profile.name,
        role: profile.role,
        stance: stance,
        age: age,
        concerns: profile.concerns,
        avatar: profile.avatar || "/avatars/default.png",
        gender: profile.gender,
        opinion: opinion
      };
    });
  };

  // When selectedPolicyId changes, update agents
  useEffect(() => {
    if (selectedPolicyId) {
      setSelectedAgents(selectDebateAgents(selectedPolicyId));
    }
  }, [selectedPolicyId]);

  const [showTutorial, setShowTutorial] = useState(true);
  const [currentPolicy, setCurrentPolicy] = useState<any>(null);
  const [negotiationComplete, setNegotiationComplete] = useState(false);
  const [policySpecificMode, setPolicySpecificMode] = useState(false);

  // Initialize policy order on component mount
  useEffect(() => {
    const policies = getSelectedPolicyObjects();
    const policyIds = policies.map(policy => policy.id);
    setPolicyOrder(policyIds);
  }, [getSelectedPolicyObjects]);

  // Function to get current policy
  const getCurrentPolicy = () => {
    const policies = getSelectedPolicyObjects();
    if (policyOrder.length === 0 || currentPolicyIndex >= policyOrder.length) {
      return null;
    }
    
    const currentPolicyId = policyOrder[currentPolicyIndex];
    const policy = policies.find(p => p.id === currentPolicyId);
    
    if (!policy) return null;
    
    return {
      id: policy.id,
      title: policy.title,
      description: policy.description || "No description available",
      selectedPolicy: policy
    };
  };

  // Function to go to next policy
  const goToNextPolicy = () => {
    if (currentPolicyIndex < policyOrder.length - 1) {
      setCurrentPolicyIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  // Function to go to previous policy
  const goToPreviousPolicy = () => {
    if (currentPolicyIndex > 0) {
      setCurrentPolicyIndex(prev => prev - 1);
      return true;
    }
    return false;
  };

  // Select random agents on component mount
  useEffect(() => {
    // Function to select and configure random agents
    const selectRandomAgents = () => {
      // Separate agents by gender
      const maleAgents = agentProfilePool.filter(agent => agent.gender === 'male');
      const femaleAgents = agentProfilePool.filter(agent => agent.gender === 'female');
      
      // Shuffle both arrays
      const shuffledMales = shuffleArray([...maleAgents]);
      const shuffledFemales = shuffleArray([...femaleAgents]);
      
      // Track selected agents to prevent duplicates
      const selectedAgentNames = new Set<string>();
      const supportingAgents = [];
      const opposingAgents = [];
      
      // Helper function to select unique agents
      const selectUniqueAgents = (pool: AgentProfile[], count: number) => {
        const result = [];
        for (const agent of pool) {
          if (result.length >= count) break;
          if (!selectedAgentNames.has(agent.name)) {
            selectedAgentNames.add(agent.name);
            result.push(agent);
          }
        }
        return result;
      };
      
      // Select 1 male + 1 female for supporting agents
      const supportingMale = selectUniqueAgents(shuffledMales.filter(a => a.possibleOpinions.includes('positive')), 1);
      const supportingFemale = selectUniqueAgents(shuffledFemales.filter(a => a.possibleOpinions.includes('positive')), 1);
      supportingAgents.push(...supportingMale, ...supportingFemale);
      
      // Select 1 male + 1 female for opposing agents
      const opposingMale = selectUniqueAgents(shuffledMales.filter(a => a.possibleOpinions.includes('negative')), 1);
      const opposingFemale = selectUniqueAgents(shuffledFemales.filter(a => a.possibleOpinions.includes('negative')), 1);
      opposingAgents.push(...opposingMale, ...opposingFemale);
      
      // Ensure we have exactly 2 supporting and 2 opposing agents
      while (supportingAgents.length < 2) {
        const availableAgents = shuffleArray([...maleAgents, ...femaleAgents])
          .filter(a => a.possibleOpinions.includes('positive') && !selectedAgentNames.has(a.name));
        
        if (availableAgents.length === 0) break;
        selectedAgentNames.add(availableAgents[0].name);
        supportingAgents.push(availableAgents[0]);
      }
      
      while (opposingAgents.length < 2) {
        const availableAgents = shuffleArray([...maleAgents, ...femaleAgents])
          .filter(a => a.possibleOpinions.includes('negative') && !selectedAgentNames.has(a.name));
        
        if (availableAgents.length === 0) break;
        selectedAgentNames.add(availableAgents[0].name);
        opposingAgents.push(availableAgents[0]);
      }
      
      // Combine and shuffle
      const combinedAgents = shuffleArray([...supportingAgents, ...opposingAgents]);
      
      // Map to DisplayAgent with unique IDs
      return combinedAgents.map((profile, index) => {
        // Randomly select a stance from the possible stances for this agent
        const stance = profile.possibleStances[Math.floor(Math.random() * profile.possibleStances.length)];
        // Randomly select an age within the agent's age range
        const age = Math.floor(Math.random() * (profile.ageRange[1] - profile.ageRange[0] + 1)) + profile.ageRange[0];
        
        // Assign opinion based on which group the agent is in
        const opinion = supportingAgents.includes(profile) ? 'positive' as const : 'negative' as const;
        
        return {
          id: `${profile.name.replace(/\s+/g, '-')}-${index}`, // Add unique ID
          name: profile.name,
          role: profile.role,
          stance: stance,
          age: age,
          concerns: profile.concerns,
          avatar: profile.avatar || "/avatars/default.png",
          gender: profile.gender,
          opinion: opinion
        };
      });
    };

    setSelectedAgents(selectRandomAgents());
  }, []);

  // Update current policy when policy index changes
  useEffect(() => {
    if (policySpecificMode) {
      setCurrentPolicy(getCurrentPolicy());
      
      // Don't clear conversation logs when switching policies
      // Instead, just reset the conversation key to force ConversationManager to reinitialize
      // with the correct agents while preserving the full history
      setConversationKey(Date.now());
    }
  }, [currentPolicyIndex, policySpecificMode]);

  // Update all logs whenever negotiation logs change
  useEffect(() => {
    if (negotiationLogs.length > 0) {
      // Add policy ID to each log if not already present and ensure all required properties exist
      const logsWithPolicy = negotiationLogs.map(log => {
        // Ensure content property is always defined
        const messageContent = log.content || '';
        
        // Ensure agent name is properly set
        let agentName = log.agent;
        if (!agentName || agentName === 'Unknown Speaker') {
          agentName = log.isUser ? 'Policy Advisor' : 'System';
        }
        
        // Ensure emotion is properly set
        let emotion = log.emotion;
        if (!emotion || emotion === 'neutral') {
          emotion = log.isUser ? 'Neutral' : 'Neutral';
        }
        
        // Capitalize first letter of emotion for consistency
        if (emotion && typeof emotion === 'string') {
          emotion = emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();
        }
        
        return {
          ...log,
          policyId: selectedPolicyId || 'general',
          isUser: log.isUser || false, // Ensure isUser is always defined
          content: messageContent, // Ensure content property is always defined
          timestamp: log.timestamp || new Date().toISOString(), // Ensure timestamp is always defined
          agent: agentName, // Use the properly set agent name
          emotion: emotion, // Use the properly formatted emotion
          id: log.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` // Ensure each log has a unique ID
        } as ExtendedNegotiationLog;
      });
      
      // Update all logs while preserving logs from other policies
      setAllNegotiationLogs(prev => {
        // Instead of removing logs for the current policy, we'll keep all logs
        // and just add the new ones that aren't already in the array
        
        // Create a map of existing log IDs for quick lookup
        const existingLogIds = new Set(prev.map(log => log.id));
        
        // Filter out logs that already exist in prev
        const newLogs = logsWithPolicy.filter(log => !existingLogIds.has(log.id));
        
        // Combine previous logs with new logs and sort by timestamp
        return [...prev, ...newLogs].sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
    }
  }, [negotiationLogs, selectedPolicyId]);

  // Helper to check if user has replied at least 4 times for the CURRENT policy only
  const hasRepliedEnoughTimes = () => {
    // Only count replies for the current policy
    const currentPolicyReplies = allNegotiationLogs.filter(log => 
      log.isUser && log.policyId === selectedPolicyId
    );
    
    return currentPolicyReplies.length >= 4;
  };

  // Helper to get logs for a specific policy with proper chronological ordering
  const getPolicyLogs = (policyId: string) => {
    if (!policyId) return [];
    
    // Get all logs for this policy
    const policyLogs = allNegotiationLogs.filter(log => log.policyId === policyId);
    
    // Sort logs by timestamp to ensure chronological order
    return policyLogs.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  // Helper to check if user has replied to all 4 agents at least once
  const hasUserRepliedToAllAgents = () => {
    if (!selectedAgents || selectedAgents.length === 0) return false;
    // For each agent, check if there's at least one log with isUser === true and log.agent === agent.name
    return selectedAgents.every(agent =>
      negotiationLogs.some(log => log.isUser && log.agent === agent.name)
    );
  };

  // Helper to check if user has replied at least X times - this is the SINGLE source of truth
  const getUserReplyCount = () => {
    if (negotiationLogs.length === 0) return 0;
    
    // Count user replies for the current policy only
    const currentPolicyUserReplies = allNegotiationLogs.filter(log => 
      log.isUser && log.policyId === selectedPolicyId
    );
    
    return currentPolicyUserReplies.length;
  };

  // Helper to display the remaining replies needed
  const getRemainingRepliesText = () => {
    const repliesCount = getUserReplyCount();
    const remaining = Math.max(0, 4 - repliesCount);
    
    if (remaining === 0) {
      return "You can now proceed to the ethical reflection phase";
    } else if (remaining === 1) {
      return "1 more reply needed before proceeding";
    } else {
      return `${remaining} more replies needed before proceeding`;
    }
  };

  const handleContinue = () => {
    if (policySpecificMode) {
      if (negotiationComplete) {
        router.push('/ethical-reflection');
      } else {
        toast({
          title: "Negotiation Incomplete",
          description: "Please discuss all policy areas before continuing.",
          variant: "destructive"
        });
      }
    } else {
      // Make sure this is consistent with the button's enabled state
      if (hasRepliedEnoughTimes()) {
        router.push('/ethical-reflection');
      } else {
        toast({
          title: "Cannot Proceed",
          description: `Please reply ${getUserReplyCount()}/4 times before moving to ethical reflection.`,
          variant: "destructive",
        });
      }
    }
  };

  // Add handlers for policy navigation
  const handleNextPolicy = () => {
    const hasNext = goToNextPolicy();
    if (!hasNext) {
      // No more policies to negotiate, mark as complete
      setNegotiationComplete(true);
      toast({
        title: "Negotiation Complete",
        description: "You've discussed all policy areas with the stakeholders.",
      });
    }
  };

  const handlePreviousPolicy = () => {
    goToPreviousPolicy();
  };

  const handleStartDiscussion = () => {
    // Prevent starting if no policies are selected
    if (getSelectedPolicyObjects().length === 0) {
      toast({
        title: "No policies selected",
        description: "Please select at least one policy before starting the assembly discussion.",
        variant: "destructive"
      });
      return;
    }
    
    // If no policy is specifically selected, select the first one
    if (!selectedPolicyId && getSelectedPolicyObjects().length > 0) {
      setSelectedPolicyId(getSelectedPolicyObjects()[0].id);
    }
    
    setIsConversationStarted(true);
    setCurrentPolicyDebateComplete(false);
  };

  const finishPolicyDebate = () => {
    if (selectedPolicyId) {
      // Mark this policy as debated
      const updatedDebatedPolicies = new Set(debatedPolicies);
      updatedDebatedPolicies.add(selectedPolicyId);
      setDebatedPolicies(updatedDebatedPolicies);
      
      // Set current debate as complete
      setCurrentPolicyDebateComplete(true);
      
      // Allow selecting a new policy
      toast({
        title: "Policy Debate Complete",
        description: "You can now select another policy to debate.",
      });
    }
  };
  
  const startNewPolicyDebate = (policyId: string) => {
    // Set the new policy ID
    setSelectedPolicyId(policyId);
    setCurrentPolicyDebateComplete(false);
    
    // Get the policy object for the new policy
    const newPolicy = getSelectedPolicyObjects().find(p => p.id === policyId);
    if (!newPolicy) return;
    
    // Clear previous conversation logs for this specific policy
    const filteredLogs = negotiationLogs.filter(log => log.policyAreaId !== policyId);
    setNegotiationLogs(filteredLogs);
    
    // Force the ConversationManager to reinitialize with the new policy context
    setConversationKey(prev => prev + 1); // This will cause the component to remount
    
    // Select new agents for this policy
    setSelectedAgents(selectDebateAgents(policyId));
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };

  // Helper function to get a random color for agent avatars
  const getRandomAvatarColor = (): string => {
    const colors = [
      'bg-blue-200',
      'bg-green-200',
      'bg-yellow-200',
      'bg-red-200',
      'bg-purple-200',
      'bg-indigo-200',
      'bg-pink-200'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  // UI for policy selection
  const selectedPolicy = getSelectedPolicy();
  const selectedPolicies = getSelectedPolicyObjects();

  // State for tracking which policies have been discussed
  const [discussedPolicies, setDiscussedPolicies] = useState<string[]>([]);
  
  // State for tracking expanded policy discussions in the history view
  const [expandedPolicies, setExpandedPolicies] = useState<Record<string, boolean>>({});
  
  // Update discussed policies when a policy discussion is completed
  useEffect(() => {
    if (currentPolicyDebateComplete && selectedPolicyId && !discussedPolicies.includes(selectedPolicyId)) {
      setDiscussedPolicies(prev => [...prev, selectedPolicyId]);
    }
  }, [currentPolicyDebateComplete, selectedPolicyId, discussedPolicies]);
  
  // Helper to toggle a policy's expanded state in the history view
  const togglePolicyExpanded = (policyId: string) => {
    setExpandedPolicies(prev => ({
      ...prev,
      [policyId]: !prev[policyId]
    }));
  };
  
  // Helper function to get emotion color class based on emotion type
  const getEmotionColorClass = (emotion: string): string => {
    const emotionMap: Record<string, string> = {
      'Neutral': 'text-gray-500',
      'Anger': 'text-red-500',
      'Frustration': 'text-orange-500',
      'Disappointment': 'text-amber-500',
      'Concern': 'text-yellow-600',
      'Interest': 'text-blue-500',
      'Enthusiasm': 'text-green-500',
      'Satisfaction': 'text-emerald-500',
      'Compassion': 'text-purple-500',
      'Determination': 'text-indigo-500',
      'Confusion': 'text-pink-500',
      'Doubt': 'text-rose-500',
      'Contemplation': 'text-cyan-500',
      'Boredom': 'text-slate-500',
      'Disapproval': 'text-red-600'
    };
    
    // Normalize emotion string for lookup
    const normalizedEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();
    
    // Return the color class or default to gray
    return emotionMap[normalizedEmotion] || 'text-gray-500';
  };

  return (
    <div className={`min-h-screen bg-[#eac95d] text-white flex flex-col font-sans relative overflow-hidden ${montserrat.variable}`} style={{ fontFamily: 'var(--font-montserrat)' }}>
      {/* Background grid pattern for consistency */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30" />
      {/* Rainbow Top Bar */}
      <RainbowStripe />
      {/* Header styling to match policy selection */}
      <div className="container mx-auto px-4 sm:px-6 py-8 relative z-10">
        <div className="bg-white rounded-full py-6 px-8 mb-10 shadow-lg">
          <h1 className="text-center mb-2">
            <span className="text-[#6E1E1E] font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">POLITICAL ASSEMBLY</span>
          </h1>
          <p className="text-center text-gray-800 text-base sm:text-lg md:text-xl font-light">
            Discuss each policy with a diverse assembly of colleagues.
          </p>
        </div>
        {/* Policy selection UI */}
        <div className="mt-6 mb-2">
          <h4 className="text-lg font-medium text-[#6E1E1E] flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#6E1E1E]/70" />
            <span>Select a policy to discuss with the assembly</span>
          </h4>
          <p className="text-sm text-gray-600 mb-3">Click on a policy below to start the discussion about it with assembly members</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {selectedPolicies.map(policy => {
            const isDebated = debatedPolicies.has(policy.id);
            const isActive = selectedPolicyId === policy.id;
            const canSelect = !isConversationStarted || currentPolicyDebateComplete || isActive;
            
            return (
              <button
                key={policy.id}
                className={`px-4 py-2 rounded-full border ${
                  isActive && isConversationStarted && !currentPolicyDebateComplete 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-300' 
                    : isDebated 
                      ? 'bg-green-100 text-green-800 border-green-300' 
                      : 'bg-white text-blue-700'
                } shadow hover:${canSelect ? 'bg-blue-200' : 'bg-gray-100'} relative`}
                onClick={() => {
                  if (canSelect) {
                    if (isConversationStarted && currentPolicyDebateComplete) {
                      startNewPolicyDebate(policy.id);
                    } else if (!isConversationStarted) {
                      setSelectedPolicyId(policy.id);
                    }
                  }
                }}
                disabled={isConversationStarted && !currentPolicyDebateComplete && !isActive}
              >
                {policy.title}
                {isActive && isConversationStarted && !currentPolicyDebateComplete && (
                  <span className="ml-2 text-xs font-semibold">(In Discussion)</span>
                )}
                {isDebated && !isActive && (
                  <span className="ml-2 text-xs font-semibold text-green-700">(Discussed)</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Main content area */}
      <main className="container mx-auto px-4 py-6 flex-1 relative z-10">
        {/* Policy Navigation (shown when conversation started) */}
        {isConversationStarted && policySpecificMode && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                onClick={handlePreviousPolicy}
                disabled={currentPolicyIndex === 0 || isAgentSpeaking}
                className={`${isAgentSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> 
                {isAgentSpeaking ? "Please wait..." : "Previous Policy"}
              </Button>
              
              <div className="text-sm text-gray-500">
                {isAgentSpeaking ? (
                  <span className="text-amber-600 font-medium flex items-center">
                    <span className="mr-1">Agent speaking</span>
                    <span className="flex space-x-1">
                      <span className="h-1.5 w-1.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="h-1.5 w-1.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="h-1.5 w-1.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </span>
                ) : (
                  <span>Policy {currentPolicyIndex + 1} of {selectedPolicies.length}</span>
                )}
              </div>
              
              <Button
                variant={negotiationComplete ? "default" : "outline"}
                onClick={negotiationComplete ? handleContinue : handleNextPolicy}
                disabled={isAgentSpeaking}
                className={`${isAgentSpeaking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {negotiationComplete ? (
                  <>
                    {isAgentSpeaking ? "Please wait..." : "Continue"} <Check className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    {isAgentSpeaking ? "Please wait..." : "Next Policy"} <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            
            {/* Current Policy Information */}
            {currentPolicy && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {currentPolicy.title}
                </h2>
                <p className="text-gray-700 mb-4">{currentPolicy.description}</p>
                
                <div className="bg-white p-3 rounded border border-gray-200">
                  <h3 className="font-medium text-gray-800">Selected Policy:</h3>
                  <p className="text-gray-700">{currentPolicy.selectedPolicy.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Tier {currentPolicy.selectedPolicy.tier} - {currentPolicy.selectedPolicy.impact}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Political Assembly Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main conversation area styled as assembly */}
          <div className="lg:col-span-2">
            {!isConversationStarted ? (
              <div className="flex flex-col items-center justify-center h-full">
                {showTutorial && (
                  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
                      {/* Rainbow top border */}
                      <RainbowStripe />
                      {/* Header with golden background */}
                      <div className="bg-[#eac95d] px-8 py-6">
                        <h2 className="font-serif text-3xl text-gray-800 font-bold">Welcome to Stakeholder Negotiation</h2>
                        <p className="text-gray-700 mt-2 font-medium">Your next step: Build consensus with key stakeholders</p>
                      </div>
                      <div className="p-8">
                        {/* Step 1 */}
                        <div className="mb-6 bg-gradient-to-r from-[#f0f9ff] to-white p-5 rounded-xl border-l-4 border-[#42A5F5] shadow-sm">
                          <div className="flex gap-5 items-start">
                            <div className="bg-gradient-to-br from-[#42A5F5] to-[#0078D7] text-white rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 shadow-lg">
                              <span className="font-serif font-bold text-xl">1</span>
                            </div>
                            <div>
                              <h3 className="font-serif text-xl text-gray-800 font-semibold">Meet Your Colleagues</h3>
                              <p className="text-gray-600 mt-2">
                                You'll interact with 4 randomly selected stakeholders, each with their own stance, concerns, and priorities regarding refugee education.
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Step 2 */}
                        <div className="mb-6 bg-gradient-to-r from-[#fffbeb] to-white p-5 rounded-xl border-l-4 border-[#FFD700] shadow-sm">
                          <div className="flex gap-5 items-start">
                            <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA000] text-gray-800 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 shadow-lg">
                              <span className="font-serif font-bold text-xl">2</span>
                            </div>
                            <div>
                              <h3 className="font-serif text-xl text-gray-800 font-semibold">Debate with Assembly Members</h3>
                              <p className="text-gray-600 mt-2">
                                Discuss your selected policies with each stakeholder. They'll respond based on their stance and concerns. Try to build consensus and address their objections.
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Step 3 */}
                        <div className="mb-8 bg-gradient-to-r from-[#f0fdf4] to-white p-5 rounded-xl border-l-4 border-[#388E3C] shadow-sm">
                          <div className="flex gap-5 items-start">
                            <div className="bg-gradient-to-br from-[#388E3C] to-[#2E7D32] text-white rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 shadow-lg">
                              <span className="font-serif font-bold text-xl">3</span>
                            </div>
                            <div>
                              <h3 className="font-serif text-xl text-gray-800 font-semibold">Track Your Progress</h3>
                              <p className="text-gray-600 mt-2">
                                You must engage with at least 4 stakeholders before proceeding. The sidebar shows your selected policies and stakeholder profiles for reference.
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Button */}
                        <div className="flex justify-end">
                          <Button
                            onClick={handleCloseTutorial}
                            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium tracking-wide text-white transition-all duration-300 ease-out bg-gradient-to-r from-[#388E3C] to-[#42A5F5] rounded-full hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
                          >
                            <span className="relative flex items-center gap-3">
                              Got it, let's start
                              <ArrowRight className="h-5 w-5" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Only show Start Negotiation button after tutorial is closed */}
                {!showTutorial && !isConversationStarted && (
                  <div className="mt-12 flex flex-col items-center">
                    {/* Instructional card */}
                    <div className="mb-10 max-w-lg w-full min-h-0 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 flex flex-col items-center">
                      <Users className="h-12 w-12 text-policy-maroon mb-2" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Ready to Negotiate</h3>
                      <p className="text-base text-gray-700 mb-5 text-center max-w-md">
                        You are about to enter negotiations with key stakeholders regarding your proposed education policies. Your goal is to build consensus and address concerns.
                      </p>
                      <ul className="w-full flex flex-col gap-3">
                        <li className="flex items-start gap-3">
                          <MessageCircle className="h-5 w-5 text-policy-maroon flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700"><span className="font-semibold">Engage in dialogue</span> with your colleagues in the assembly who have different perspectives.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-policy-maroon flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700"><span className="font-semibold">Explain your policies</span> and address questions raised by each assembly member.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <ArrowRight className="h-5 w-5 text-policy-maroon flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700"><span className="font-semibold">Complete at least 4 interactions</span> before proceeding to the ethical reflection phase.</span>
                        </li>
                      </ul>
                    </div>
                    {/* Animated prompt and button stack (policy selection style) */}
                    <div className="w-full">
                      <div className="flex justify-center">
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-70 blur-md animate-pulse"></div>
                          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                            <div className="text-gray-800 bg-white px-4 py-2 rounded-lg shadow-md font-medium text-center mb-2">
                              Click here to continue
                            </div>
                            {/* Flickering arrow animation below prompt */}
                            <svg className="w-7 h-7 text-blue-400 animate-flicker" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                            </svg>
                          </div>
                          <Button
                            onClick={handleStartDiscussion}
                            className="group relative inline-flex items-center justify-center px-8 py-5 text-xl font-medium tracking-wide text-white transition-all duration-500 ease-out bg-gradient-to-r from-[#388E3C] to-[#42A5F5] rounded-full hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 animate-[wiggle_1s_ease-in-out_infinite]"
                          >
                            <span className="relative flex items-center gap-3">
                              Start Negotiation
                              <ArrowRight className="h-5 w-5 animate-pulse" />
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Assembly header */}
                <div className="bg-gray-800 text-white p-4 text-center">
                  <h3 className="text-xl font-bold">Political Assembly Discussion</h3>
                  <p className="text-sm">Current topic: {selectedPolicy?.title || "All Policies"}</p>
                </div>
                
                {/* Conversation manager with updated props */}
                <ConversationManager
                  key={`conversation-${selectedPolicyId}-${conversationKey}`}
                  selectedPolicies={selectedPolicy ? [selectedPolicy] : []}
                  agents={selectedAgents}
                  onConversationUpdate={setNegotiationLogs}
                  userTitle="Policy Advisor"
                  showMic={true}
                  showAgentVoice={true}
                  showEmotion={true}
                  policySpecificMode={true}
                  currentPolicyArea={selectedPolicy ? {
                    id: selectedPolicy.id,
                    title: selectedPolicy.title,
                    description: selectedPolicy.description
                  } : undefined}
                  onAgentSpeakingChange={setIsAgentSpeaking}
                />
                
                {/* Finish debate button */}
                {!currentPolicyDebateComplete && negotiationLogs.length >= 4 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-center">
                      <Button 
                        onClick={finishPolicyDebate}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full"
                      >
                        <span className="flex items-center gap-2">
                          Complete Policy Discussion
                          <Check className="h-4 w-4" />
                        </span>
                      </Button>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Complete this discussion to select another policy
                    </p>
                  </div>
                )}
                
                {/* Completed debate message */}
                {currentPolicyDebateComplete && (
                  <div className="p-4 border-t border-gray-200 bg-green-50">
                    <div className="text-center text-green-800">
                      <p className="font-medium">Policy discussion complete!</p>
                      <p className="text-sm mt-1">Select another policy to continue the assembly discussion</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Policy summary sidebar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-lg w-full min-h-0 p-4 md:p-6">
            <h3 className="text-xl mb-4 font-bold text-[#6E1E1E] border-b-2 border-[#eac95d] pb-2">Your Selected Policies</h3>
            <div className="space-y-3">
              {getSelectedPolicyObjects().length > 0 ? (
                getSelectedPolicyObjects().map((policy) => (
                  <div key={policy.id} className="border border-[#eac95d]/50 rounded-lg p-3 text-sm shadow-sm hover:shadow-md transition-shadow duration-200 bg-gradient-to-r from-white to-[#eac95d]/10">
                    <div className="font-medium bg-[#eac95d]/20 text-[#6E1E1E] px-3 py-1.5 rounded-md inline-block mb-2 shadow-sm">{policy.title}</div>
                    <div className="text-xs text-gray-700 flex items-center gap-1">
                      <span className="font-medium">{policy.area}</span>
                      <span className="text-[#6E1E1E]/60">•</span>
                      <span className="bg-[#6E1E1E]/10 text-[#6E1E1E] px-2 py-0.5 rounded-full">
                        Tier {policy.tier}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-center py-4">No policies selected yet</p>
              )}
            </div>
            
            {/* Assembly Members section - added spacing above */}
            <div className="mt-8 bg-gradient-to-r from-[#eac95d]/10 to-white rounded-xl p-4 shadow-md mb-6 border border-[#eac95d]/30">
              <h4 className="font-bold mb-2 text-[#6E1E1E] text-lg flex items-center gap-2 border-b border-[#eac95d]/50 pb-2">
                <Users className="inline-block h-5 w-5 text-[#6E1E1E]/70" /> Assembly Members
              </h4>
              <div className="text-xs text-[#6E1E1E]/80 mb-3">These are your fellow colleagues for this discussion.</div>
              <div className="flex flex-col gap-3">
                {selectedAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-[#eac95d]/40 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#eac95d]/30 text-[#6E1E1E] font-bold text-base uppercase shadow-sm">
                      {agent.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <span className="text-[#6E1E1E] font-semibold text-base">{agent.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Full conversation history - show ALL logs across policies */}
            <div className="mt-8 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowFullHistory(!showFullHistory)}
              >
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-[#6E1E1E]" />
                  Complete Transcript History
                  {allNegotiationLogs.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {allNegotiationLogs.length} messages
                    </span>
                  )}
                </h3>
                <ChevronDown className={`h-5 w-5 transition-transform ${showFullHistory ? 'rotate-180' : ''}`} />
              </div>
              
              {showFullHistory && (
                <div className="mt-4">
                  {/* Complete transcript of all messages */}
                  <div className="border rounded-lg overflow-hidden bg-white mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-white flex justify-between items-center border-b">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <h4 className="font-medium text-gray-700">
                          Complete Conversation Transcript
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          All Messages
                        </span>
                        {allNegotiationLogs.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {allNegotiationLogs.length} total messages
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Show ALL messages without filtering */}
                    <div className="divide-y max-h-[600px] overflow-y-auto">
                      {allNegotiationLogs.length > 0 ? (
                        // Filter out "Unknown Speaker" entries with empty content and deduplicate
                        allNegotiationLogs
                          .filter(log => log.content && log.content.trim() !== '')
                          // Remove duplicate messages (same content and agent within 1 second)
                          .filter((log, index, self) => {
                            // Always keep the first occurrence
                            if (index === 0) return true;
                            
                            // Check if this is a duplicate of a previous message
                            const prevLog = self[index - 1];
                            const sameContent = log.content === prevLog.content;
                            const sameAgent = log.agent === prevLog.agent;
                            const closeTimestamp = Math.abs(
                              new Date(log.timestamp).getTime() - new Date(prevLog.timestamp).getTime()
                            ) < 1000; // Within 1 second
                            
                            // Keep if not a duplicate
                            return !(sameContent && sameAgent && closeTimestamp);
                          })
                          .map((log, idx) => (
                          <div key={`log-${idx}`} className="p-3 hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <div className={`h-8 w-8 rounded-full ${log.isUser ? 'bg-blue-100 text-blue-800' : 'bg-[#eac95d]/30 text-[#6E1E1E]'} flex items-center justify-center font-medium`}>
                                  {log.isUser ? 'P' : (log.agent && log.agent !== 'Unknown Speaker' ? log.agent.charAt(0) : 'S')}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="font-medium text-gray-900">
                                    {log.isUser ? 'Policy Advisor' : (log.agent !== 'Unknown Speaker' ? log.agent : 'System')}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                                      {getSelectedPolicyObjects().find(p => p.id === log.policyId)?.title || log.policyId}
                                    </span>
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                  </div>
                                </div>
                                <div className="text-gray-700 whitespace-pre-wrap">
                                  {log.content}
                                </div>
                                {log.emotion && (
                                  <div className={`mt-1 text-xs italic ${getEmotionColorClass(log.emotion)}`}>
                                    Emotion: {log.emotion}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No messages in the transcript yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Add Continue to Reflection button */}
            {isConversationStarted && (
              <div className="mt-6">
                <Button
                  onClick={handleContinue}
                  disabled={isAgentSpeaking || !hasRepliedEnoughTimes()}
                  className={`w-full bg-gradient-to-r from-[#388E3C] to-[#42A5F5] text-white font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-300 ${(isAgentSpeaking || !hasRepliedEnoughTimes()) ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#2E7D32] hover:to-[#1976D2] hover:shadow-lg'}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isAgentSpeaking ? (
                      <>
                        Please wait for agent to finish
                        <span className="ml-2 flex space-x-1">
                          <span className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                      </>
                    ) : (
                      <>
                        Continue to Reflection
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </span>
                </Button>
                <p className="text-xs text-center text-gray-600 mt-2">
                  {isAgentSpeaking 
                    ? "Please wait for the current speaker to finish before proceeding" 
                    : !hasRepliedEnoughTimes()
                      ? getRemainingRepliesText()
                      : "You can now proceed to the ethical reflection phase"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Bottom Rainbow Strip */}
      <div className="w-full mt-10">
        <RainbowStripe />
      </div>
    </div>
  );
}
