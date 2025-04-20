'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGameContext } from '@/context/GameContext';
import ConversationManager from '@/components/ui/ConversationManager';
import { AgentStance } from '@/types/agents';
import { Users, ArrowRight, MessageCircle, Lightbulb, HeartHandshake, Mic, MicOff, Send, X, ChevronRight, ChevronLeft, MessageSquare, Check } from 'lucide-react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat'
});

// Define the structure for the agents passed to ConversationManager
type AgentOpinion = 'positive' | 'negative';

interface DisplayAgent {
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
    // Select 1 male + 1 female for each opinion if possible
    const selected = [];
    if (posMales.length) selected.push(posMales[Math.floor(Math.random()*posMales.length)]);
    if (posFemales.length) selected.push(posFemales[Math.floor(Math.random()*posFemales.length)]);
    if (negMales.length) selected.push(negMales[Math.floor(Math.random()*negMales.length)]);
    if (negFemales.length) selected.push(negFemales[Math.floor(Math.random()*negFemales.length)]);
    // Fallback to fill up to 4 agents
    while (selected.length < 4) {
      const pool = [...positiveAgents, ...negativeAgents].filter(a => !selected.includes(a));
      if (!pool.length) break;
      selected.push(pool[Math.floor(Math.random()*pool.length)]);
    }
    // Map to DisplayAgent
    return selected.slice(0,4).map((profile, idx) => {
      const stance = profile.possibleStances[0];
      const age = Math.floor(Math.random() * (profile.ageRange[1] - profile.ageRange[0] + 1)) + profile.ageRange[0];
      const opinion = profile.possibleOpinions[0];
      return {
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
      
      // Select 2 from each gender
      const selectedMales = shuffledMales.slice(0, 2);
      const selectedFemales = shuffledFemales.slice(0, 2);
      
      // Combine and shuffle again
      const combinedAgents = [...selectedMales, ...selectedFemales];
      const shuffledCombined = shuffleArray(combinedAgents);
      
      // Assign opinions to ensure 2 positive and 2 negative
      return shuffledCombined.map((profile, index) => {
        // Randomly select a stance from the possible stances for this agent
        const stance = profile.possibleStances[Math.floor(Math.random() * profile.possibleStances.length)];
        // Randomly select an age within the agent's age range
        const age = Math.floor(Math.random() * (profile.ageRange[1] - profile.ageRange[0] + 1)) + profile.ageRange[0];
        
        // Assign opinion based on index to ensure balance
        const opinion = index < 2 ? 'positive' as const : 'negative' as const;
        
        return {
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
    }
  }, [currentPolicyIndex, policySpecificMode]);

  // Helper to check if user has replied to all 4 agents at least once
  const hasUserRepliedToAllAgents = () => {
    if (!selectedAgents || selectedAgents.length === 0) return false;
    // For each agent, check if there's at least one log with isUser === true and log.agent === agent.name
    return selectedAgents.every(agent =>
      negotiationLogs.some(log => log.isUser && log.agent === agent.name)
    );
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
      if (hasUserRepliedToAllAgents()) {
        router.push('/ethical-reflection');
      } else {
        toast({
          title: "Cannot Proceed",
          description: "Please reply to each agent at least once before moving to ethical reflection.",
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

  // UI for policy selection
  const selectedPolicy = getSelectedPolicy();
  const selectedPolicies = getSelectedPolicyObjects();

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
                disabled={currentPolicyIndex === 0}
              >
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Previous Policy
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-gray-500">
                  Policy {currentPolicyIndex + 1} of {policyOrder.length}
                </span>
              </div>
              
              <Button
                variant={negotiationComplete ? "default" : "outline"}
                onClick={negotiationComplete ? handleContinue : handleNextPolicy}
              >
                {negotiationComplete ? (
                  <>
                    Continue <Check className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next Policy <ArrowRight className="ml-2 h-4 w-4" />
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
                      <span className="bg-[#6E1E1E]/10 text-[#6E1E1E] px-2 py-0.5 rounded-full">Tier {policy.tier}</span>
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
                  <div key={agent.name} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-[#eac95d]/40 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#eac95d]/30 text-[#6E1E1E] font-bold text-base uppercase shadow-sm">
                      {agent.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <span className="text-[#6E1E1E] font-semibold text-base">{agent.name}</span>
                  </div>
                ))}
              </div>
            </div>
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
