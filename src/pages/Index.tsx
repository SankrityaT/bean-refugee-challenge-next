import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import MapCanvas from '@/components/MapCanvas';
import BudgetIndicator from '@/components/BudgetIndicator';
import OnboardingView from '@/components/OnboardingView';
import AIAgent from '@/components/AIAgent';
import ReflectionPrompt from '@/components/ReflectionPrompt';
import PolicyOptionCard from '@/components/PolicyOptionCard';
import { POLICY_AREAS, REFLECTION_QUESTIONS, AI_AGENTS } from '@/data/game-data';

// Rainbow stripe component (top + bottom)
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

const Index = () => {
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('policy');
  const [allocatedBudget, setAllocatedBudget] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const totalBudget = 200; // $200M total budget
  
  const handlePolicySelect = (policyId: string, policyCost: number) => {
    if (selectedPolicies.includes(policyId)) {
      // Policy already selected, remove it
      setSelectedPolicies(prev => prev.filter(id => id !== policyId));
      setAllocatedBudget(prev => prev - policyCost);
      toast({
        title: "Policy Removed",
        description: `Policy has been removed from your plan. Budget updated.`,
      });
    } else {
      // Add new policy
      setSelectedPolicies(prev => [...prev, policyId]);
      setAllocatedBudget(prev => prev + policyCost);
      
      if (allocatedBudget + policyCost > totalBudget) {
        toast({
          title: "Budget Warning",
          description: "You've exceeded your budget allocation!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Policy Added",
          description: `Policy has been added to your plan. Budget updated.`,
        });
      }
    }
  };
  
  const handleAgentInteraction = (agentName: string) => {
    toast({
      title: `${agentName} responds`,
      description: "The stakeholder has shared their perspective on your policies.",
    });
  };
  
  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
    toast({
      title: "Welcome to The CHALLENGE Game",
      description: "You can now start making policy decisions for the Republic of Bean.",
    });
  };
  
  if (showOnboarding) {
    return <OnboardingView onComplete={handleCompleteOnboarding} />;
  }
  
  return (
    <div className="min-h-screen bg-[#eac95d] text-white flex flex-col font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30" />
      
      {/* 🔺 Rainbow Top Bar */}
      <RainbowStripe />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 flex-1 flex flex-col relative z-10">
        <div className="max-w-6xl w-full mx-auto">
          {/* White rounded rectangle background for title and subtitle */}
          <div className="bg-white rounded-full py-8 px-8 mb-16 shadow-lg">
            <h1 className="text-center mb-2">
              <span className="text-[#6E1E1E] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">C</span>
              <span className="text-[#FFD700] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">H</span>
              <span className="text-[#1C140D] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">A</span>
              <span className="text-[#388E3C] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">L</span>
              <span className="text-[#42A5F5] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">L</span>
              <span className="text-[#EF6C00] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">E</span>
              <span className="text-[#A0522D] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">N</span>
              <span className="text-[#80C9D5] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">G</span>
              <span className="text-[#E148A1] font-serif font-bold text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight">E</span>
            </h1>
            <p className="text-center text-gray-800 text-lg sm:text-xl md:text-2xl font-light">
              Develop comprehensive refugee policies for the Republic of Bean while 
              balancing humanitarian needs with economic realities.
            </p>
          </div>
        </div>
      
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Map Section */}
          <section className="mb-10 bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-bebas text-3xl mb-4">Republic of Bean: Refugee Crisis</h2>
            <MapCanvas />
            <p className="text-gray-700">
              Yellow lines indicate major refugee movement patterns across borders.
              As the Minister of Refugee Affairs, your challenge is to develop effective
              policies that address both immediate needs and long-term integration.
            </p>
          </section>
          
          {/* Budget Indicator */}
          <BudgetIndicator totalBudget={totalBudget} allocatedBudget={allocatedBudget} />
          
          {/* Main Game Tabs */}
          <Tabs 
            value={currentTab} 
            onValueChange={setCurrentTab}
            className="mt-8"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="policy">Policy Selection</TabsTrigger>
              <TabsTrigger value="negotiation">Stakeholder Negotiation</TabsTrigger>
              <TabsTrigger value="reflection">Ethical Reflection</TabsTrigger>
            </TabsList>
            
            {/* Policy Selection Tab */}
            <TabsContent value="policy" className="mt-6">
              <h2 className="font-bebas text-3xl mb-6">Select Your Policies</h2>
              
              {POLICY_AREAS.map((area) => (
                <div key={area.id} className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <area.icon className="h-6 w-6 text-hope-turquoise" />
                    <h3 className="font-bebas text-2xl">{area.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{area.description}</p>
                  
                  {area.id === 'access' ? (
                    // Bento grid layout for Education Policy cards
                    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-8">
                      {/* First card - larger size */}
                      <div className="md:col-span-6 lg:col-span-8 lg:row-span-2">
                        <PolicyOptionCard
                          key={area.policies[0].id}
                          id={area.policies[0].id}
                          title={area.policies[0].title}
                          description={area.policies[0].description}
                          impact={area.policies[0].impact}
                          tier={area.policies[0].tier}
                          cost={area.policies[0].cost}
                          isSelected={selectedPolicies.includes(area.policies[0].id)}
                          onClick={() => handlePolicySelect(area.policies[0].id, area.policies[0].cost)}
                        />
                      </div>
                      {/* Second card */}
                      <div className="md:col-span-3 lg:col-span-4">
                        <PolicyOptionCard
                          key={area.policies[1].id}
                          id={area.policies[1].id}
                          title={area.policies[1].title}
                          description={area.policies[1].description}
                          impact={area.policies[1].impact}
                          tier={area.policies[1].tier}
                          cost={area.policies[1].cost}
                          isSelected={selectedPolicies.includes(area.policies[1].id)}
                          onClick={() => handlePolicySelect(area.policies[1].id, area.policies[1].cost)}
                        />
                      </div>
                      {/* Third card */}
                      <div className="md:col-span-3 lg:col-span-4">
                        <PolicyOptionCard
                          key={area.policies[2].id}
                          id={area.policies[2].id}
                          title={area.policies[2].title}
                          description={area.policies[2].description}
                          impact={area.policies[2].impact}
                          tier={area.policies[2].tier}
                          cost={area.policies[2].cost}
                          isSelected={selectedPolicies.includes(area.policies[2].id)}
                          onClick={() => handlePolicySelect(area.policies[2].id, area.policies[2].cost)}
                        />
                      </div>
                    </div>
                  ) : (
                    // Regular grid for other policy areas
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {area.policies.map((policy) => (
                        <PolicyOptionCard
                          key={policy.id}
                          id={policy.id}
                          title={policy.title}
                          description={policy.description}
                          impact={policy.impact}
                          tier={policy.tier}
                          cost={policy.cost}
                          isSelected={selectedPolicies.includes(policy.id)}
                          onClick={() => handlePolicySelect(policy.id, policy.cost)}
                        />
                      ))}
                    </div>
                  )}
                  
                  <Separator className="mt-8 mb-2" />
                </div>
              ))}
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setCurrentTab('negotiation')}
                  className="bg-hope-turquoise text-black hover:bg-hope-turquoise/80"
                >
                  Proceed to Stakeholder Negotiation
                </Button>
              </div>
            </TabsContent>
            
            {/* Negotiation Tab */}
            <TabsContent value="negotiation" className="mt-6">
              <h2 className="font-bebas text-3xl mb-6">Negotiate With Stakeholders</h2>
              <p className="text-gray-700 mb-6">
                Present your policy choices to key stakeholders. Each has their own priorities
                and concerns. Try to build consensus while maintaining your core goals.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {AI_AGENTS.map((agent) => (
                  <AIAgent
                    key={agent.id}
                    name={agent.name}
                    role={agent.role}
                    stance={agent.stance}
                    age={agent.age}
                    concerns={agent.concerns}
                    onInteract={() => handleAgentInteraction(agent.name)}
                  />
                ))}
              </div>
              
              <div className="bg-gray-100 rounded-lg p-6 mt-10">
                <h3 className="font-bebas text-xl mb-3">Negotiation Progress</h3>
                <p className="text-gray-700">
                  As you engage with stakeholders, their feedback will influence the success of your policies.
                  Try to address their concerns without compromising your humanitarian goals.
                </p>
                <div className="mt-4 flex gap-4 justify-end">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentTab('policy')}
                  >
                    Revise Policies
                  </Button>
                  <Button 
                    onClick={() => setCurrentTab('reflection')}
                    className="bg-hope-turquoise text-black hover:bg-hope-turquoise/80"
                  >
                    Proceed to Reflection
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Reflection Tab */}
            <TabsContent value="reflection" className="mt-6">
              <h2 className="font-bebas text-3xl mb-6">Ethical Reflection</h2>
              <p className="text-gray-700 mb-6">
                Consider the following questions to deepen your understanding of the ethical
                dimensions of refugee policy and your decision-making process.
              </p>
              
              <div className="space-y-2 mt-8">
                {REFLECTION_QUESTIONS.map((item) => (
                  <ReflectionPrompt
                    key={item.id}
                    question={item.question}
                    category={item.category}
                  />
                ))}
              </div>
              
              <div className="bg-white border rounded-lg p-6 mt-10 shadow-sm">
                <h3 className="font-bebas text-xl mb-3">Game Completion</h3>
                <p className="text-gray-700 mb-4">
                  You've completed all phases of the CHALLENGE Game. Your policy choices,
                  negotiation approaches, and ethical reflections demonstrate your approach
                  to refugee policy management.
                </p>
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={() => {
                      toast({
                        title: "Game Complete",
                        description: "Thank you for playing the CHALLENGE Game!",
                      });
                      setCurrentTab('policy');
                    }}
                    className="bg-policy-maroon text-white hover:bg-policy-maroon/90"
                  >
                    Complete Game
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
        
        {/* Footer */}
        <footer className="relative z-10 mt-16">
          <div className="container mx-auto text-center px-4 py-8">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="font-serif text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">THE CHALLENGE GAME</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                A simulation designed to explore the complexities of refugee policy-making
                through interactive decision-making and ethical reflection.
              </p>
              <div className="mt-6 text-sm text-gray-500">
                2025 CHALLENGE Game Project
              </div>
            </div>
          </div>
          
          {/* 🔻 Rainbow Bottom Bar */}
          <RainbowStripe />
        </footer>
      </div>
    </div>
  );
};

export default Index;
