'use client';

import React, { useEffect, useState } from 'react';
import PolicyCard from '@/components/ui/PolicyCard';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import MapCanvas from '@/components/ui/MapCanvas';
import BudgetIndicator from '@/components/ui/BudgetIndicator';
import { POLICY_AREAS } from '@/data/game-data';
import { calculateRemainingUnits, validateSelections } from '@/lib/budget-engine';
import { useGameContext } from '@/context/GameContext';
import StackedPolicyCards from '@/components/ui/StackedPolicyCards';

// Function to get the background color for each category
const getCategoryBackgroundColor = (category: string) => {
  switch (category) {
    case 'access':
      return '#A0F6DA'; // Cyan Blue
    case 'language':
      return '#FED64D'; // Yellow
    case 'teacher':
      return '#EF5EFF'; // Pink
    case 'curriculum':
      return '#7FFF2A'; // Green
    case 'psychosocial':
      return '#5CCBFF'; // Red (example)
    case 'financial':
      return '#F46A1F'; // Blue (example)
    case 'certification':
      return '#A0522D'; // Orange (example)
    default:
      return '#FFFFFF'; // Default White
  }
};

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
  
  // Add state for selected policy area
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  
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
        <section className="mb-10 bg-white rounded-lg shadow-md p-6">
          <h2 className="font-bebas text-3xl mb-4">Republic of Bean: Refugee Crisis</h2>
          <MapCanvas />
          <p className="text-gray-700">
            Yellow lines indicate major refugee movement patterns across borders.
            As the Minister of Refugee Affairs, your challenge is to develop effective
            education policies that address both immediate needs and long-term integration.
          </p>
        </section>
        
        {/* Budget Indicator - Updated to show units instead of monetary value */}
        <div className="bg-white p-4 rounded-lg shadow-md border mb-8">
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
        
        {/* Custom styling to ensure Option 2 certification card button is visible */}
        <style jsx global>{`
          .certification-option-2-button {
            position: absolute !important;
            bottom: -30px !important;
            z-index: 9999 !important;
          }
        `}</style>
        
        <h2 className="font-bebas text-3xl mt-8 mb-6 text-policy-maroon">Policy Selection</h2>
        
        {/* Update the policy categories section */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 py-2">
            {POLICY_AREAS.map((area) => (
              <div 
                key={`category-${area.id}`} 
                className={`px-4 py-2 rounded-full shadow-sm border flex items-center gap-2 cursor-pointer transition-all duration-300 ${
                  selectedArea === area.id 
                    ? 'text-white border-policy-maroon' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: selectedArea === area.id ? getCategoryBackgroundColor(area.id) : '#FFFFFF'
                }}
                onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
              >
                <area.icon className="h-5 w-5" />
                <span className="whitespace-nowrap font-medium">{area.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Update the policy cards display section */}
        <div className="mt-8">
          {selectedArea ? (
            <div className="w-full">
              {POLICY_AREAS.map((area) => (
                area.id === selectedArea && (
                  <div key={area.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bebas text-2xl flex items-center gap-2">
                        <area.icon className="h-6 w-6" />
                        {area.title}
                      </h3>
                    </div>
                    
                    {/* Horizontal policy cards layout */}
                    <div className="grid grid-cols-3 gap-6">
                      {area.policies.map((policy) => (
                        <div key={policy.id} className="relative">
                          <PolicyCard
                            id={policy.id}
                            title={policy.title}
                            description={policy.description}
                            impact={policy.impact}
                            tier={policy.tier}
                            icon={area.icon}
                            category={area.id}
                            isSelected={selectedPolicies.includes(policy.id)}
                            onClick={() => handlePolicySelect(policy.id, policy.tier)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            // Original stacked view when no area is selected
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {POLICY_AREAS.map((area) => (
                <div 
                  key={area.id}
                  className="bg-white rounded-lg shadow-md p-6 space-y-4"
                >
                  <h3 className="font-bebas text-2xl flex items-center gap-2 text-policy-maroon border-b pb-2">
                    <area.icon className="h-6 w-6" />
                    {area.title}
                  </h3>
                  <p className="text-sm text-gray-600">{area.description}</p>
                  
                  <div className="h-[55rem] relative">
                    <StackedPolicyCards
                      areaId={area.id}
                      areaIcon={area.icon}
                      policies={area.policies}
                      selectedPolicies={selectedPolicies}
                      onSelectPolicy={handlePolicySelect}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 flex justify-end">
          <Button 
            onClick={handleContinue}
            disabled={!budgetValidation.isValid}
            className="bg-policy-maroon hover:bg-opacity-90 text-lg px-6 py-3"
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