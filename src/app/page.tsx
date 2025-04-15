'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import MapCanvas from '@/components/MapCanvas';
import PolicyCard from '@/components/PolicyCard';
import ReflectionPrompt from '@/components/ReflectionPrompt';
import AIAgent from '@/components/AIAgent';
import BudgetIndicator from '@/components/BudgetIndicator';
import OnboardingView from '@/components/OnboardingView';
import ConversationManager from '@/components/ConversationManager';
import { POLICY_AREAS } from '@/data/game-data';
import { REFLECTION_QUESTIONS } from '@/data/reflection-questions';
import { AI_AGENTS } from '@/data/game-data';
import { AgentStance } from '@/types/agents';
import { validateSelections, calculateRemainingUnits } from '@/lib/budget-engine';
import { usePhaseManager, GamePhase } from '@/lib/phase-manager';
import { generateReflection } from '@/lib/reflection-engine';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportDocument from '@/components/ReportDocument';

export default function Home() {
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<GamePhase>('policy');
  const [negotiationLogs, setNegotiationLogs] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [reflectionData, setReflectionData] = useState(null);
  const [budgetValidation, setBudgetValidation] = useState({ 
    isValid: true, 
    warnings: [], 
    totalUnits: 0,
    tierDiversity: false
  });
  
  const { canProceedToPhase } = usePhaseManager();
  
  // Get selected policy objects
  const getSelectedPolicyObjects = () => {
    const policies: any[] = [];
    POLICY_AREAS.forEach(area => {
      area.policies.forEach(policy => {
        if (selectedPolicies.includes(policy.id)) {
          policies.push({...policy, area: area.title});
        }
      });
    });
    return policies;
  };
  
  // Validate budget whenever selected policies change
  useEffect(() => {
    const selectedPolicyObjects = getSelectedPolicyObjects();
    const validation = validateSelections(selectedPolicyObjects);
    setBudgetValidation(validation);
  }, [selectedPolicies]);
  
  // Generate reflection data when entering reflection phase
  useEffect(() => {
    if (currentTab === 'reflection') {
      const selectedPolicyObjects = getSelectedPolicyObjects();
      const reflection = generateReflection(selectedPolicyObjects);
      setReflectionData(reflection);
    }
  }, [currentTab]);
  
  const handlePolicySelect = (policyId: string, policyTier: number) => {
    if (selectedPolicies.includes(policyId)) {
      // Policy already selected, remove it
      setSelectedPolicies(prev => prev.filter(id => id !== policyId));
      toast({
        title: "Policy Removed",
        description: `Policy has been removed from your plan.`,
      });
    } else {
      // Add new policy
      setSelectedPolicies(prev => [...prev, policyId]);
      
      const selectedPolicyObjects = getSelectedPolicyObjects().concat({id: policyId, tier: policyTier});
      const validation = validateSelections(selectedPolicyObjects);
      
      if (!validation.isValid) {
        toast({
          title: "Budget Warning",
          description: validation.warnings.join('. '),
          variant: "destructive",
        });
      } else if (validation.warnings.length > 0) {
        toast({
          title: "Budget Notice",
          description: validation.warnings.join('. '),
        });
      } else {
        toast({
          title: "Policy Added",
          description: `Policy has been added to your plan.`,
        });
      }
    }
  };
  
  const handleAgentInteraction = (agentName: string) => {
    // Add to negotiation logs
    setNegotiationLogs(prev => [...prev, {
      agent: agentName,
      timestamp: new Date().toISOString()
    }]);
    
    toast({
      title: `${agentName} responds`,
      description: "The stakeholder has shared their perspective on your policies.",
    });
  };
  
  const handleTabChange = (value: string) => {
    const targetPhase = value as GamePhase;
    
    // Check if can proceed to the target phase
    const data = targetPhase === 'negotiation' 
      ? getSelectedPolicyObjects()
      : negotiationLogs;
      
    const { canProceed, message } = canProceedToPhase(currentTab, targetPhase, data);
    
    if (canProceed) {
      setCurrentTab(targetPhase);
    } else {
      toast({
        title: "Cannot Proceed",
        description: message,
        variant: "destructive",
      });
    }
  };
  
  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    toast({
      title: "Welcome to The CHALLENGE Game",
      description: "You can now start making policy decisions for the Republic of Bean.",
    });
  };
  
  // Handle saving a reflection response
  const handleSaveReflection = (questionId: string, response: string) => {
    if (reflectionData) {
      // Update the reflectionData with the new response
      const updatedReflectionData = {
        ...reflectionData,
        responses: {
          ...reflectionData.responses,
          [questionId]: response
        }
      };
      
      setReflectionData(updatedReflectionData);
      
      toast({
        title: "Reflection Saved",
        description: "Your reflection has been saved and will be included in your policy report.",
      });
    }
  };

  if (showOnboarding) {
    return <OnboardingView onComplete={handleCompleteOnboarding} />;
  }
  
  // Calculate remaining budget units
  const remainingUnits = calculateRemainingUnits(getSelectedPolicyObjects());
  
  return (
    <div className="min-h-screen bg-gray-50 font-opensans">
      {/* Header */}
      <header className="bg-policy-maroon text-white py-6 px-4 md:px-8">
        <div className="container mx-auto">
          <h1 className="font-bebas text-4xl md:text-6xl lg:text-7xl tracking-wider mb-2">
            THE CHALLENGE GAME
          </h1>
          <p className="text-hope-turquoise text-lg md:text-xl max-w-3xl">
            Develop comprehensive refugee education policies for the Republic of Bean while 
            balancing humanitarian needs with economic realities.
          </p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Map Section */}
        <section className="mb-10 bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-bebas text-3xl mb-4">Republic of Bean: Refugee Crisis</h2>
          <MapCanvas />
          <p className="text-gray-700">
            Yellow lines indicate major refugee movement patterns across borders.
            As the Minister of Refugee Affairs, your challenge is to develop effective
            education policies that address both immediate needs and long-term integration.
          </p>
        </section>
        
        {/* Budget Indicator - Updated to show units instead of monetary value */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bebas text-lg">Policy Budget</h3>
            <span className={`font-bold ${!budgetValidation.isValid ? 'text-warning-orange' : 'text-black'}`}>
              {14 - remainingUnits} / 14 Units
            </span>
          </div>
          
          <BudgetIndicator 
            totalBudget={14} 
            allocatedBudget={14 - remainingUnits} 
            isValid={budgetValidation.isValid}
            warnings={budgetValidation.warnings}
          />
        </div>
        
        {/* Main Game Tabs */}
        <Tabs 
          value={currentTab} 
          onValueChange={handleTabChange}
          className="mt-8"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="policy">Policy Selection</TabsTrigger>
            <TabsTrigger value="negotiation">Stakeholder Negotiation</TabsTrigger>
            <TabsTrigger value="reflection">Ethical Reflection</TabsTrigger>
          </TabsList>
          
          {/* Policy Selection Tab */}
          <TabsContent value="policy" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {POLICY_AREAS.map((area) => (
                <div key={area.id} className="space-y-4">
                  <h3 className="font-bebas text-2xl flex items-center gap-2">
                    <area.icon className="h-6 w-6" />
                    {area.title}
                  </h3>
                  <p className="text-sm text-gray-600">{area.description}</p>
                  
                  <div className="space-y-3">
                    {area.policies.map((policy) => (
                      <PolicyCard
                        key={policy.id}
                        title={policy.title}
                        description={policy.description}
                        impact={policy.impact}
                        tier={policy.tier}
                        icon={area.icon}
                        category={area.id}
                        isSelected={selectedPolicies.includes(policy.id)}
                        onClick={() => handlePolicySelect(policy.id, policy.tier)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Stakeholder Negotiation Tab */}
          <TabsContent value="negotiation" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main conversation area */}
              <div className="lg:col-span-2">
                <ConversationManager
                  selectedPolicies={getSelectedPolicyObjects()}
                  agents={[
                    {
                      name: "Minister Santos",
                      stance: AgentStance.NEOLIBERAL,
                      role: "Education Minister",
                      age: 52,
                      concerns: ["Budget constraints", "Economic impact"]
                    },
                    {
                      name: "Dr. Chen",
                      stance: AgentStance.PROGRESSIVE,
                      role: "Education Researcher",
                      age: 45,
                      concerns: ["Equity", "Inclusion", "Cultural sensitivity"]
                    },
                    {
                      name: "Mayor Okonjo",
                      stance: AgentStance.MODERATE,
                      role: "City Mayor",
                      age: 48,
                      concerns: ["Community integration", "Balanced approach"]
                    },
                    {
                      name: "Community Leader Patel",
                      stance: AgentStance.HUMANITARIAN,
                      role: "Refugee Advocate",
                      age: 39,
                      concerns: ["Trauma-informed care", "Child welfare", "Human rights"]
                    }
                  ]}
                  onConversationUpdate={setNegotiationLogs}
                />
              </div>
              
              {/* Policy summary sidebar */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-bebas text-xl mb-3">Your Selected Policies</h3>
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
                  <h4 className="font-medium mb-2">Stakeholder Profiles</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span><strong>Minister Santos:</strong> Neoliberal, concerned with economic impact</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span><strong>Dr. Chen:</strong> Progressive, advocates for equity and inclusion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span><strong>Mayor Okonjo:</strong> Moderate, seeks balanced solutions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span><strong>Community Leader Patel:</strong> Humanitarian, prioritizes refugee welfare</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Ethical Reflection Tab */}
          <TabsContent value="reflection" className="mt-6">
            {reflectionData && (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bebas text-2xl mb-4">Policy Impact Assessment</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl font-bold">{reflectionData.equityScore}</div>
                    <div>
                      <p className="font-semibold">Equity Score</p>
                      <p className="text-sm text-gray-600">Based on UNESCO inclusion metrics</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <PDFDownloadLink 
                      document={<ReportDocument policies={getSelectedPolicyObjects()} reflectionData={reflectionData} />}
                      fileName="refugee-policy-report.pdf"
                      className="bg-policy-maroon text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-all"
                    >
                      {({ loading }) => loading ? 'Generating report...' : 'Download Policy Report (PDF)'}
                    </PDFDownloadLink>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="font-bebas text-2xl">Reflection Questions</h3>
                  <p className="text-gray-600 mb-4">
                    Use the microphone button or type your responses to the following reflection questions.
                    Your responses will be automatically saved when you click the "Save Reflection" button
                    and included in your policy report PDF.
                  </p>
                  {reflectionData.questions.map((question) => (
                    <ReflectionPrompt 
                      key={question.id}
                      question={question.question}
                      category={question.category}
                      questionId={question.id}
                      savedResponse={reflectionData.responses[question.id] || ''}
                      onSave={handleSaveReflection}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 mt-16">
        <div className="container mx-auto text-center">
          <h2 className="font-bebas text-2xl mb-4">THE CHALLENGE GAME</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            A simulation designed to explore the complexities of refugee education policy-making
            through interactive decision-making and ethical reflection.
          </p>
          <div className="mt-6 text-sm text-gray-400">
            &copy; 2025 CHALLENGE Game Project
          </div>
        </div>
      </footer>
    </div>
  );
}