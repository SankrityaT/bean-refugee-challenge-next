'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useGameContext } from '@/context/GameContext';
import ConversationManager from '@/components/ui/ConversationManager';
import { AgentStance } from '@/types/agents';
import { Check, Users, MessageCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat'
});

// Define the structure for the agents passed to ConversationManager
interface DisplayAgent {
  name: string;
  stance: AgentStance;
  role: string;
  age: number;
  concerns: string[];
}

// Define an expanded pool of potential agent profiles
const agentProfilePool = [
  // Original agents
  { name: "Minister Santos", role: "Education Minister", ageRange: [48, 60], concerns: ["Budget constraints", "Economic impact", "Standardized testing"], possibleStances: [AgentStance.NEOLIBERAL, AgentStance.MODERATE] },
  { name: "Dr. Chen", role: "Education Researcher", ageRange: [40, 55], concerns: ["Equity", "Inclusion", "Cultural sensitivity", "Teacher training"], possibleStances: [AgentStance.PROGRESSIVE] },
  { name: "Mayor Okonjo", role: "City Mayor", ageRange: [45, 58], concerns: ["Community integration", "Balanced approach", "Local infrastructure"], possibleStances: [AgentStance.MODERATE, AgentStance.NEOLIBERAL] },
  { name: "Community Leader Patel", role: "Refugee Advocate", ageRange: [35, 50], concerns: ["Trauma-informed care", "Child welfare", "Human rights", "Family reunification"], possibleStances: [AgentStance.HUMANITARIAN, AgentStance.PROGRESSIVE] },
  // Additional agents (16 more for a total of 20)
  { name: "Principal Rodriguez", role: "School Principal", ageRange: [42, 62], concerns: ["School resources", "Teacher morale", "Student safety", "Parent engagement"], possibleStances: [AgentStance.MODERATE, AgentStance.PROGRESSIVE] },
  { name: "Business Owner Lee", role: "Local Entrepreneur", ageRange: [40, 65], concerns: ["Workforce development", "Economic stability", "Tax implications"], possibleStances: [AgentStance.NEOLIBERAL] },
  { name: "Social Worker Ali", role: "NGO Social Worker", ageRange: [30, 45], concerns: ["Mental health support", "Access to services", "Child protection"], possibleStances: [AgentStance.HUMANITARIAN] },
  { name: "Union Rep Garcia", role: "Teachers' Union Rep", ageRange: [45, 60], concerns: ["Teacher salaries", "Working conditions", "Class sizes"], possibleStances: [AgentStance.PROGRESSIVE, AgentStance.MODERATE] },
  { name: "Finance Director Müller", role: "Municipal Finance Director", ageRange: [50, 65], concerns: ["Fiscal responsibility", "Budget allocation", "Return on investment"], possibleStances: [AgentStance.NEOLIBERAL] },
  { name: "Dr. Adebayo", role: "Public Health Official", ageRange: [45, 58], concerns: ["Health screenings", "Vaccination programs", "Mental health services"], possibleStances: [AgentStance.HUMANITARIAN, AgentStance.MODERATE] },
  { name: "Journalist Khan", role: "Investigative Journalist", ageRange: [30, 45], concerns: ["Transparency", "Accountability", "Public perception", "Social impact"], possibleStances: [AgentStance.PROGRESSIVE, AgentStance.MODERATE] },
  { name: "Elder Ibrahim", role: "Refugee Community Elder", ageRange: [60, 75], concerns: ["Cultural preservation", "Community cohesion", "Respect for traditions", "Intergenerational support"], possibleStances: [AgentStance.HUMANITARIAN, AgentStance.MODERATE] },
  { name: "Police Chief Miller", role: "Chief of Police", ageRange: [50, 62], concerns: ["Public safety", "Community policing", "Resource allocation", "Youth engagement"], possibleStances: [AgentStance.MODERATE, AgentStance.NEOLIBERAL] },
  { name: "University Dean Sharma", role: "Dean of Education", ageRange: [55, 68], concerns: ["Higher education access", "Teacher pipeline", "Research partnerships", "Curriculum standards"], possibleStances: [AgentStance.PROGRESSIVE] },
  { name: "Immigration Lawyer Diaz", role: "Immigration Lawyer", ageRange: [38, 52], concerns: ["Legal rights", "Due process", "Family reunification policies", "Access to counsel"], possibleStances: [AgentStance.HUMANITARIAN, AgentStance.PROGRESSIVE] },
  { name: "Housing Authority Director Evans", role: "Housing Authority Director", ageRange: [48, 60], concerns: ["Affordable housing", "Settlement support", "Infrastructure strain"], possibleStances: [AgentStance.MODERATE] },
  { name: "Youth Worker Jackson", role: "Community Youth Worker", ageRange: [28, 40], concerns: ["After-school programs", "Mentorship", "Preventing marginalization", "Skill development"], possibleStances: [AgentStance.PROGRESSIVE, AgentStance.HUMANITARIAN] },
  { name: "Taxpayer Advocate Smith", role: "Concerned Taxpayer Advocate", ageRange: [50, 70], concerns: ["Government spending", "Tax burden", "Efficient use of funds"], possibleStances: [AgentStance.NEOLIBERAL] },
  { name: "Language Specialist Dubois", role: "ESL Program Coordinator", ageRange: [35, 50], concerns: ["Language acquisition support", "Bilingual resources", "Teacher training for ESL"], possibleStances: [AgentStance.PROGRESSIVE, AgentStance.MODERATE] },
  { name: "Former Refugee Ahmed", role: "Successful Former Refugee", ageRange: [40, 55], concerns: ["Integration challenges", "Importance of opportunity", "Mentorship potential", "Giving back"], possibleStances: [AgentStance.HUMANITARIAN, AgentStance.MODERATE] },
];

// Shuffle function (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Rainbow stripe component for tutorial
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

export default function StakeholderNegotiationPage() {
  const router = useRouter();
  const {
    negotiationLogs,
    setNegotiationLogs,
    getSelectedPolicyObjects
  } = useGameContext();

  const [isConversationStarted, setIsConversationStarted] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<DisplayAgent[]>([]);
  const [showTutorial, setShowTutorial] = useState(true);

  // Select random agents on component mount
  useEffect(() => {
    // Function to select and configure random agents
    const selectRandomAgents = () => {
      const shuffledPool = shuffleArray([...agentProfilePool]);
      const selectedProfiles = shuffledPool.slice(0, 4); // Select 4 random agents

      return selectedProfiles.map(profile => {
        // Randomly select a stance from the possible stances for this agent
        const stance = profile.possibleStances[Math.floor(Math.random() * profile.possibleStances.length)];
        // Randomly select an age within the agent's age range
        const age = Math.floor(Math.random() * (profile.ageRange[1] - profile.ageRange[0] + 1)) + profile.ageRange[0];

        return {
          name: profile.name,
          role: profile.role,
          stance: stance,
          age: age,
          concerns: profile.concerns,
        };
      });
    };

    setSelectedAgents(selectRandomAgents());
  }, []);

  // Helper to check if user has replied to all 4 agents at least once
  const hasUserRepliedToAllAgents = () => {
    if (!selectedAgents || selectedAgents.length === 0) return false;
    // For each agent, check if there's at least one log with isUser === true and log.agent === agent.name
    return selectedAgents.every(agent =>
      negotiationLogs.some(log => log.isUser && log.agent === agent.name)
    );
  };

  const handleContinue = () => {
    if (hasUserRepliedToAllAgents()) {
      router.push('/ethical-reflection');
    } else {
      toast({
        title: "Cannot Proceed",
        description: "Please reply to each agent at least once before moving to ethical reflection.",
        variant: "destructive",
      });
    }
  };

  const handleStartDiscussion = () => {
    setIsConversationStarted(true);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };

  // Helper function to get stance color class
  const getStanceColorClass = (stance: AgentStance): string => {
    switch(stance) {
      case AgentStance.NEOLIBERAL: return 'bg-blue-500';
      case AgentStance.PROGRESSIVE: return 'bg-green-500';
      case AgentStance.MODERATE: return 'bg-yellow-500';
      case AgentStance.HUMANITARIAN: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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
            <span className="text-[#6E1E1E] font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">C</span>
            <span className="text-[#FFD700] font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">H</span>
            <span className="text-[#1C140D] font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">A</span>
            <span className="text-[#388E3C] font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">L</span>
            <span className="text-[#42A5F5] font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">L</span>
            <span className="text-[#EF6C00] font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">E</span>
            <span className="text-[#A0522D] font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">N</span>
            <span className="text-[#80C9D5] font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">G</span>
            <span className="text-[#E148A1] font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight">E</span>
          </h1>
          <p className="text-center text-gray-800 text-base sm:text-lg md:text-xl font-light">
            Negotiate with stakeholders to build consensus on your selected policies.
          </p>
        </div>
      </div>
      {/* Main content area styling to match policy selection */}
      <main className="container mx-auto px-4 py-6 flex-1 relative z-10">
        {/* Sidebar and negotiation UI should use white backgrounds, rounded corners, shadows, and gray/dark text for contrast, matching policy selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main conversation area */}
          <div className="lg:col-span-2">
            {!isConversationStarted ? (
              <div className="flex flex-col items-center justify-center h-full">
                {showTutorial && (
                  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
                      {/* Rainbow top border */}
                      <div className="flex w-full h-3">
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
                              <h3 className="font-serif text-xl text-gray-800 font-semibold">Meet Your Stakeholders</h3>
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
                              <h3 className="font-serif text-xl text-gray-800 font-semibold">Engage in Conversation</h3>
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
                          <span className="text-gray-700"><span className="font-semibold">Engage in dialogue</span> with stakeholders who have different perspectives on refugee education.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-policy-maroon flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700"><span className="font-semibold">Explain your policies</span> and address concerns raised by each stakeholder based on their stance.</span>
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
                {/* Rest of the code remains the same */}
              </div>
            ) : (
              <ConversationManager
                selectedPolicies={getSelectedPolicyObjects()}
                agents={selectedAgents}
                onConversationUpdate={setNegotiationLogs}
                userTitle="Policy Advisor"
                showMic={true}
                showAgentVoice={true}
                showEmotion={true}
              />
            )}
          </div>
          {/* Policy summary sidebar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-lg w-full min-h-0 p-4 md:p-6">
            <h3 className="text-xl mb-3 text-gray-800">Your Selected Policies</h3>
            <div className="space-y-2">
              {getSelectedPolicyObjects().length > 0 ? (
                getSelectedPolicyObjects().map((policy) => (
                  <div key={policy.id} className="border rounded p-2 text-sm">
                    <div className="font-medium">{policy.title}</div>
                    <div className="text-xs text-gray-500">{policy.area} • Tier {policy.tier}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No policies selected yet</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2 text-gray-800">Stakeholder Profiles</h4>
              <div className="space-y-2 text-xs">
                {selectedAgents.map((agent) => (
                  <div key={agent.name} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStanceColorClass(agent.stance)}`}></div>
                    <span>
                      <strong className="text-gray-800">{agent.name} ({agent.role}):</strong> <span className="text-black">{agent.stance.charAt(0).toUpperCase() + agent.stance.slice(1).toLowerCase()}, concerned with {agent.concerns.slice(0, 2).join(', ')}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {isConversationStarted && (
          <div className="mt-12 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-70 blur-md animate-pulse"></div>
              <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                <div className="text-gray-800 bg-white px-4 py-2 rounded-lg shadow-md font-medium text-center mb-2">
                  Click here to continue
                </div>
                <svg className="w-6 h-6 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <Button
                onClick={handleContinue}
                className="group relative inline-flex items-center justify-center px-8 py-5 text-xl font-medium tracking-wide text-white transition-all duration-500 ease-out bg-gradient-to-r from-[#388E3C] to-[#42A5F5] rounded-full hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 animate-[wiggle_1s_ease-in-out_infinite]"
                disabled={!isConversationStarted || !hasUserRepliedToAllAgents()}
              >
                <span className="relative flex items-center gap-3">
                  Continue to Ethical Reflection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Button>
            </div>
          </div>
        )}
      </main>
      {/* Rainbow Stripe at the bottom to replace the footer */}
      <div className="w-full mt-12">
        <RainbowStripe />
      </div>
      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        .animate-flicker {
          animation: flicker 1s infinite;
        }
      `}</style>
    </div>
  );
}