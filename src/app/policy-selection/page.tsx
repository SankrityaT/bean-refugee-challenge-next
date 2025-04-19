'use client';

import React, { useEffect, useState } from 'react';
import PolicyCard from '@/components/ui/PolicyCard';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import BudgetIndicator from '@/components/ui/BudgetIndicator';
import { POLICY_AREAS } from '@/data/game-data';
import { calculateRemainingUnits, validateSelections } from '@/lib/budget-engine';
import { useGameContext } from '@/context/GameContext';
import StackedPolicyCards from '@/components/ui/StackedPolicyCards';
import { DollarSign, BookOpen, Check, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Montserrat } from 'next/font/google';

// Add this font definition at the top
const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat'
});

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
  
  // In the handlePolicySelect function, let's enhance the toast messages
  const handlePolicySelect = (policyId: string, policyTier: number) => {
    if (selectedPolicies.includes(policyId)) {
      // Policy already selected, remove it
      removeSelectedPolicy(policyId);
    } else {
      // Find which area this policy belongs to
      let policyArea = null;
      
      for (const area of POLICY_AREAS) {
        const foundPolicy = area.policies.find(p => p.id === policyId);
        if (foundPolicy) {
          policyArea = area;
          break;
        }
      }
      
      if (policyArea) {
        // Check if any policy from this area is already selected
        const existingPolicyFromSameArea = getSelectedPolicyObjects().find(
          p => policyArea.policies.some(areaPolicy => areaPolicy.id === p.id)
        );
        
        if (existingPolicyFromSameArea) {
          // Remove the existing policy from this area first
          removeSelectedPolicy(existingPolicyFromSameArea.id);
          toast({
            title: "Policy Replaced",
            description: `Previous policy from ${policyArea.title} has been replaced.`,
          });
        }
      }
      
      // Add the new policy
      addSelectedPolicy(policyId);
    }
  };
  
  const handleContinue = () => {
    if (budgetValidation.isValid) {
      // Get selected policy objects
      const selectedPolicyObjects = getSelectedPolicyObjects();
      const totalUnits = selectedPolicyObjects.reduce((sum, policy) => sum + policy.tier, 0);
      
      // Check if at least 8 units are allocated
      if (totalUnits < 8) {
        toast({
          title: "Cannot Proceed",
          description: "You must allocate at least 8 budget units before continuing.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if there's a mix of tier levels (at least one tier 1 and one tier 2 or higher)
      const hasTier1 = selectedPolicyObjects.some(policy => policy.tier === 1);
      const hasHigherTier = selectedPolicyObjects.some(policy => policy.tier > 1);
      
      if (!hasTier1 || !hasHigherTier) {
        toast({
          title: "Cannot Proceed",
          description: "You must select a mix of tier levels (at least one Tier 1 and one higher tier policy).",
          variant: "destructive",
        });
        return;
      }
      
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
  
  // Add state for tutorial
  const [showTutorial, setShowTutorial] = useState(true);
  
  return (
    <div className="min-h-screen bg-[#eac95d] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30" />
      
      {/* Rainbow Top Bar */}
      <RainbowStripe />
      
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* White rounded rectangle background for title */}
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
            Develop comprehensive refugee education policies for the Republic of Bean
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-1 relative z-10">
        {/* Map Section - Replace MapCanvas with bean.jpg image */}
        <section className="mb-10 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            <div className="p-6">
              <h2 className="font-serif text-3xl mb-4 text-gray-800">Republic of Bean: Refugee Crisis</h2>
              
              {/* Replace MapCanvas with direct image */}
              <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                <img 
                  src="/bean.jpg" 
                  alt="Map of Republic of Bean" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
              </div>
              
              <p className="text-gray-700 mt-4">
                Yellow lines indicate major refugee movement patterns across borders.
                As the Minister of Refugee Affairs, your challenge is to develop effective
                education policies that address both immediate needs and long-term integration.
              </p>
            </div>
          </div>
        </section>
        
        {/* Budget Indicator - Updated to show units instead of monetary value */}
        
        <div className="bg-white p-4 rounded-lg shadow-lg border mb-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-serif text-xl text-gray-800">Policy Budget</h3>
            <span className={`font-bold ${!budgetValidation.isValid ? 'text-warning-orange' : 'text-gray-800'}`}>
              {14 - remainingUnits} / 14 Units
            </span>
          </div>
          
          <BudgetIndicator 
            totalBudget={14} 
            allocatedBudget={14 - remainingUnits} 
            isValid={budgetValidation.isValid}
            warnings={budgetValidation.warnings}
            selectedPolicies={getSelectedPolicyObjects().map(policy => {
              // Find the policy area for this policy
              const policyArea = POLICY_AREAS.find(area => 
                area.policies.some(p => p.id === policy.id)
              );
              return {
                id: policy.id,
                tier: policy.tier,
                category: policyArea?.id || ''
              };
            })}
          />
        </div>
        
        {/* Selected Policies Bubbles */}
        {selectedPolicies.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-lg border mb-8">
            <h3 className="font-serif text-xl text-gray-800 mb-3">Selected Policies</h3>
            <div className="flex flex-wrap gap-2">
              {getSelectedPolicyObjects().map((policy) => {
                // Find the policy area for this policy
                const policyArea = POLICY_AREAS.find(area => 
                  area.policies.some(p => p.id === policy.id)
                );
                
                return (
                  <div 
                    key={policy.id}
                    className="flex items-center gap-1 px-3 py-1 rounded-full shadow-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                    style={{ borderLeftColor: getCategoryBackgroundColor(policyArea?.id || ''), borderLeftWidth: '4px' }}
                  >
                    <span className="text-sm text-gray-800 font-medium truncate max-w-[150px]">
                      {policy.title}
                    </span>
                    <button
                      onClick={() => handlePolicySelect(policy.id, policy.tier)}
                      className="ml-1 text-gray-500 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${policy.title}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Custom styling to ensure Option 2 certification card button is visible */}
        <style jsx global>{`
          .certification-option-2-button {
            position: absolute !important;
            bottom: -30px !important;
            z-index: 9999 !important;
          }
          
          /* Make toast more prominent */
          :root {
            --toast-bg: rgba(255, 255, 255, 0.95);
            --toast-border: rgba(0, 0, 0, 0.1);
            --toast-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          }
          
          [data-sonner-toast] {
            background-color: var(--toast-bg) !important;
            border: 1px solid var(--toast-border) !important;
            box-shadow: var(--toast-shadow) !important;
            padding: 16px !important;
            border-radius: 12px !important;
            font-size: 1.05rem !important;
          }
          
          [data-sonner-toast][data-type="error"] {
            background-color: rgba(254, 226, 226, 0.95) !important;
            border-color: rgba(239, 68, 68, 0.2) !important;
          }
          
          [data-sonner-toast][data-type="success"] {
            background-color: rgba(236, 253, 245, 0.95) !important;
            border-color: rgba(16, 185, 129, 0.2) !important;
          }
        `}</style>
        
        <h2 className="font-serif text-3xl mt-8 mb-6 text-gray-800 bg-white px-6 py-3 rounded-full shadow-md inline-block">Policy Selection</h2>
        
        {/* Update the policy categories section */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 py-2">
            {POLICY_AREAS.map((area) => (
              <div 
                key={`category-${area.id}`} 
                className={`px-4 py-2 rounded-full shadow-md border flex items-center gap-2 cursor-pointer transition-all duration-300 ${
                  selectedArea === area.id 
                    ? 'text-white border-gray-800' 
                    : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: selectedArea === area.id ? getCategoryBackgroundColor(area.id) : ''
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
                      <h3 className="font-serif text-2xl flex items-center gap-2 text-gray-800 bg-white px-4 py-2 rounded-full shadow-md">
                        <area.icon className="h-6 w-6" />
                        {area.title}
                      </h3>
                    </div>
                    
                    {/* Horizontal policy cards layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="bg-white rounded-lg shadow-lg p-6 space-y-4"
                >
                  <h3 className="font-serif text-2xl flex items-center gap-2 text-gray-800 border-b pb-2">
                    <area.icon className="h-6 w-6" />
                    {area.title}
                  </h3>
                  <p className="text-gray-700 mt-4">{area.description}</p>
                  
                  {/* Update the container to be more compact when stacked */}
                  <div className="relative">
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

        <div className="mt-12 flex justify-center">
          <div className="relative">
            {/* Pulsing effect behind the button */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-70 blur-md animate-pulse"></div>
            
            {/* Arrow pointing to button */}
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
              disabled={!budgetValidation.isValid}
              className="group relative inline-flex items-center justify-center px-8 py-5 text-xl font-medium tracking-wide text-white transition-all duration-500 ease-out bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 animate-[wiggle_1s_ease-in-out_infinite]"
            >
              <span className="relative flex items-center gap-3">
                Continue to Stakeholder Negotiation
                <ArrowRight className="h-6 w-6 animate-pulse" />
                <span className="absolute left-0 -bottom-1 w-full h-px bg-white/50 transform origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
              </span>
            </Button>
          </div>
        </div>

        {/* Add keyframe animation for wiggle effect */}
        <style jsx global>{`
          @keyframes wiggle {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}</style>
      </main>
    
      {/* Persistent Budget Summary - Add right here before the Rainbow Bottom Bar */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">Budget:</span>
            <span className={`font-bold ${!budgetValidation.isValid ? 'text-red-500' : 'text-green-600'}`}>
              {14 - remainingUnits} / 14 Units
            </span>
            {!budgetValidation.isValid && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                {remainingUnits < 0 ? `Over by ${Math.abs(remainingUnits)}` : 'Invalid selection'}
              </span>
            )}
            {budgetValidation.isValid && remainingUnits > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {remainingUnits} remaining
              </span>
            )}
          </div>
          {budgetValidation.warnings.length > 0 && (
            <div className="mt-1 text-xs text-amber-700">
              {budgetValidation.warnings[0]}
            </div>
          )}
        </div>
      </div>
      
      {/* Rainbow Bottom Bar */}
      <RainbowStripe />
      
      {/* Onboarding Tutorial - Fixed structure */}
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
              <h2 className="font-serif text-3xl text-gray-800 font-bold">Welcome to Policy Selection</h2>
              <p className="text-gray-700 mt-2 font-medium">Your first step as Minister of Refugee Affairs</p>
            </div>
            
            <div className="p-8">
              {/* Step 1 - Using policy icon instead of number */}
              <div className="mb-6 bg-gradient-to-r from-[#f0f9ff] to-white p-5 rounded-xl border-l-4 border-[#42A5F5] shadow-sm">
                <div className="flex gap-5 items-start">
                  <div className="bg-gradient-to-br from-[#42A5F5] to-[#0078D7] text-white rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-gray-800 font-semibold">Select Your Policies</h3>
                    <p className="text-gray-600 mt-2">
                      Choose policies across 7 key areas that address refugee education needs. Each policy has a tier (1-3) that represents its cost in budget units.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Step 2 - Using budget icon instead of number */}
              <div className="mb-6 bg-gradient-to-r from-[#fffbeb] to-white p-5 rounded-xl border-l-4 border-[#FFD700] shadow-sm">
                <div className="flex gap-5 items-start">
                  <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA000] text-gray-800 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-gray-800 font-semibold">Manage Your Budget</h3>
                    <p className="text-gray-600 mt-2">
                      You have 14 budget units to allocate. Tier 1 policies cost 1 unit, Tier 2 cost 2 units, and Tier 3 cost 3 units. You must include at least 2 different tier levels.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Step 3 - Using impact icon instead of number */}
              <div className="mb-8 bg-gradient-to-r from-[#f0fdf4] to-white p-5 rounded-xl border-l-4 border-[#388E3C] shadow-sm">
                <div className="flex gap-5 items-start">
                  <div className="bg-gradient-to-br from-[#388E3C] to-[#2E7D32] text-white rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-gray-800 font-semibold">Consider Policy Impact</h3>
                    <p className="text-gray-600 mt-2">
                      Each policy has an impact level: Exclusionary, Moderate Inclusion, or Transformative. Your choices will affect stakeholder negotiations and final outcomes.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowTutorial(false)}
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
    </div>
  );
}

