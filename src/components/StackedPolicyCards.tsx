'use client';

import React, { useState } from 'react';
import PolicyCard from './PolicyCard';

interface StackedPolicyCardsProps {
  policies: any[];
  areaId: string;
  areaIcon: any;
  selectedPolicies: string[];
  onSelectPolicy: (policyId: string, policyTier: number) => void;
}

const StackedPolicyCards: React.FC<StackedPolicyCardsProps> = ({
  policies,
  areaId,
  areaIcon,
  selectedPolicies,
  onSelectPolicy
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // Toggle between stacked view and grid view
  const toggleView = () => {
    setShowAll(!showAll);
  };

  return (
    <div className="relative h-full">
      {/* View toggle button */}
      <button 
        onClick={toggleView}
        className="absolute top-2 right-2 z-30 bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-white transition-all"
      >
        {showAll ? 'Stack Cards' : 'Show All'}
      </button>

      {showAll ? (
        // Grid view - all cards visible with fixed heights
        <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1" style={{ maxHeight: '320px' }}>
          {policies.map((policy, index) => (
            <div key={policy.id} className="transform transition-all duration-300 h-[180px] mb-2">
              <PolicyCard
                id={policy.id}
                title={policy.title}
                description={policy.description}
                impact={policy.impact}
                tier={policy.tier}
                icon={areaIcon}
                category={areaId}
                isSelected={selectedPolicies.includes(policy.id)}
                onClick={() => onSelectPolicy(policy.id, policy.tier)}
              />
            </div>
          ))}
        </div>
      ) : (
        // Stacked view - cards stacked with active one on top (Apple Wallet style)
        <div className="relative h-[320px] w-full mx-auto mt-0">
          {/* Card stack */}
          {policies.map((policy, index) => {
            // Calculate position and z-index based on distance from active index
            const isActive = index === activeIndex;
            const distance = Math.abs(index - activeIndex);
            const zIndex = policies.length - distance;
            
            // For cards below the active card
            let translateY = 0;
            let translateX = 0;
            let scale = 1;
            let opacity = 1;
            
            if (index > activeIndex) {
              // Cards below active card - stack them like credit cards
              translateY = (index - activeIndex) * 12; // Stack vertically with minimal overlap
              scale = 1 - ((index - activeIndex) * 0.03); // Very slight scaling
              opacity = 1 - ((index - activeIndex) * 0.1); // Slight transparency
            } else if (index < activeIndex) {
              // Cards that should be behind - move them to the bottom
              translateY = ((policies.length - index) * 10) + 250;
              scale = 0.9;
              opacity = 0.7;
            }
            
            return (
              <div 
                key={policy.id} 
                className={`absolute left-0 top-0 w-full transition-all duration-500 ease-in-out ${isActive ? 'shadow-xl cursor-pointer' : 'shadow-md cursor-pointer'}`}
                style={{
                  transform: `translateY(${translateY}px) translateX(${translateX}px) scale(${scale})`,
                  zIndex,
                  opacity: Math.max(0.5, opacity),
                  height: '100%'
                }}
                onClick={() => {
                  if (!isActive) {
                    setActiveIndex(index);
                  }
                }}
              >
                <PolicyCard
                  id={policy.id}
                  title={policy.title}
                  description={policy.description}
                  impact={policy.impact}
                  tier={policy.tier}
                  icon={areaIcon}
                  category={areaId}
                  isSelected={selectedPolicies.includes(policy.id)}
                  onClick={() => {
                    // Only trigger the policy selection if this is the active card
                    if (isActive) {
                      onSelectPolicy(policy.id, policy.tier);
                    } else {
                      setActiveIndex(index);
                    }
                  }}
                />
              </div>
            );
          })}
          
          {/* Card indicators - small dots at bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {policies.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${index === activeIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StackedPolicyCards;
