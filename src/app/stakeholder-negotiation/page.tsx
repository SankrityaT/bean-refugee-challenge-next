'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useGameContext } from '@/context/GameContext';
import ConversationManager from '@/components/ui/ConversationManager';
import { AgentStance } from '@/types/agents';

export default function StakeholderNegotiationPage() {
  const router = useRouter();
  const { 
    negotiationLogs, 
    setNegotiationLogs,
    getSelectedPolicyObjects
  } = useGameContext();
  
  const handleContinue = () => {
    if (negotiationLogs.length >= 3) { // Require at least 3 interactions
      router.push('/ethical-reflection');
    } else {
      toast({
        title: "Cannot Proceed",
        description: "Please engage with at least 3 stakeholders before proceeding.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 font-opensans">
      {/* Header */}
      <header className="bg-policy-maroon text-white py-6 px-4 md:px-8">
        <div className="container mx-auto">
          <h1 className="font-bebas text-4xl md:text-6xl lg:text-7xl tracking-wider mb-2">
            THE CHALLENGE GAME
          </h1>
          <p className="text-hope-turquoise text-lg md:text-xl max-w-3xl">
            Negotiate with stakeholders to build consensus for your refugee education policies.
          </p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="font-bebas text-3xl mb-6">Stakeholder Negotiation</h2>
        
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
        
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleContinue}
            className="bg-policy-maroon hover:bg-opacity-90"
          >
            Continue to Ethical Reflection
          </Button>
        </div>
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