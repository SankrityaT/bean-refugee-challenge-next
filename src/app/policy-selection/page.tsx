'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import MapCanvas from '@/components/ui/MapCanvas';
import PolicyCard from '@/components/ui/PolicyCard';
import BudgetIndicator from '@/components/ui/BudgetIndicator';
import { POLICY_AREAS } from '@/data/game-data';
import { calculateRemainingUnits, validateSelections } from '@/lib/budget-engine';
import { useGameContext } from '@/context/GameContext';

export default function PolicySelectionPage() {
  const router = useRouter();
  const { 
    selectedPolicies, 
    addSelectedPolicy, 
    removeSelectedPolicy, 
    getSelectedPolicyObjects,
    budgetValidation 
  } = useGameContext();
  
  const handlePolicySelect = (policyId: string, policyTier: number) => {
    if (selectedPolicies.includes(policyId)) {
      // Policy already selected, remove it
      removeSelectedPolicy(policyId);
      toast({
        title: "Policy Removed",
        description: `Policy has been removed from your plan.`,
      });
    } else {
      // Add new policy
      addSelectedPolicy(policyId);
      
      // Instead of trying to create a partial policy object, just get the updated list
      // after adding the policy
      const updatedPolicyObjects = getSelectedPolicyObjects();
      const validation = validateSelections(updatedPolicyObjects);
      
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
  
  const handleContinue = () => {
    if (budgetValidation.isValid) {
      router.push('/stakeholder-negotiation');
    } else {
      toast({
        title: "Cannot Proceed",
        description: "Please address budget issues before proceeding.",
        variant: "destructive",
      });
    }
  };
  
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
        
        <h2 className="font-bebas text-3xl mt-8 mb-4">Policy Selection</h2>
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
        
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleContinue}
            disabled={!budgetValidation.isValid}
            className="bg-policy-maroon hover:bg-opacity-90"
          >
            Continue to Stakeholder Negotiation
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