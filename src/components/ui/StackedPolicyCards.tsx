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

  // Handle card click to bring it to the front
  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="relative h-full">
      {/* View toggle button */}
      <button 
        onClick={toggleView}
        className="absolute top-2 right-2 z-50 bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-white transition-all"
      >
        {showAll ? 'Stack Cards' : 'Show All'}
      </button>

      {showAll ? (
        // Grid view - all cards visible with fixed heights
        <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-1" style={{ maxHeight: '100%' }}>
          {policies.map((policy, index) => (
            <div key={policy.id} className="transform transition-all duration-300 mb-4">
              <div className="relative">
                <PolicyCard
                  id={policy.id}
                  title={policy.title}
                  description={policy.description}
                  impact={policy.impact}
                  tier={policy.tier}
                  icon={areaIcon}
                  category={areaId}
                  isSelected={selectedPolicies.includes(policy.id)}
                  onClick={() => {}}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gray-800/80 text-white text-center py-4 rounded-b-lg z-40"
                  style={{ width: '100%' }}
                  onClick={() => onSelectPolicy(policy.id, policy.tier)}
                >
                  <span className="text-xl font-medium">Select Policy</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Apple Wallet style stacked view
        <div className="relative w-full h-full overflow-visible">
          <div className="relative w-full h-full">
            {/* Stack cards with Apple Wallet style offsets */}
            <div className="relative w-full h-full">
              {/* Option 3 - Top card */}
              {policies.length > 2 && (
                <div 
                  key={policies[2].id} 
                  className="absolute inset-x-0 transition-all duration-300 ease-in-out shadow-md cursor-pointer"
                  style={{
                    top: '-160px',  
                    height: '100%',
                    zIndex: activeIndex === 2 ? 40 : 10,
                    borderRadius: '8px',
                  }}
                  onClick={() => {
                    handleCardClick(2);
                  }}
                >
                  <PolicyCard
                    id={policies[2].id}
                    title={policies[2].title}
                    description={policies[2].description}
                    impact={policies[2].impact}
                    tier={policies[2].tier}
                    icon={areaIcon}
                    category={areaId}
                    isSelected={selectedPolicies.includes(policies[2].id)}
                    onClick={() => handleCardClick(2)}
                  />
                  {activeIndex === 2 && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-gray-800/80 text-white text-center py-4 rounded-b-lg z-40"
                      style={{ width: '100%' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPolicy(policies[2].id, policies[2].tier);
                      }}
                    >
                      <span className="text-xl font-medium">Select Policy</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Option 2 - Middle card */}
              {policies.length > 1 && (
                <div 
                  key={policies[1].id} 
                  className="absolute inset-x-0 transition-all duration-300 ease-in-out shadow-md cursor-pointer"
                  style={{
                    top: '-80px',  
                    height: '100%',
                    zIndex: activeIndex === 1 ? 40 : 20,
                    borderRadius: '8px',
                  }}
                  onClick={() => {
                    handleCardClick(1);
                  }}
                >
                  <PolicyCard
                    id={policies[1].id}
                    title={policies[1].title}
                    description={policies[1].description}
                    impact={policies[1].impact}
                    tier={policies[1].tier}
                    icon={areaIcon}
                    category={areaId}
                    isSelected={selectedPolicies.includes(policies[1].id)}
                    onClick={() => handleCardClick(1)}
                  />
                  {activeIndex === 1 && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-gray-800/80 text-white text-center py-4 rounded-b-lg z-40"
                      style={{ width: '100%' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPolicy(policies[1].id, policies[1].tier);
                      }}
                    >
                      <span className="text-xl font-medium">Select Policy</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Option 1 - Bottom card */}
              <div 
                key={policies[0].id} 
                className="absolute inset-x-0 transition-all duration-300 ease-in-out shadow-md cursor-pointer"
                style={{
                  top: '0px',
                  height: '100%',
                  zIndex: activeIndex === 0 ? 40 : 30,
                  borderRadius: '8px',
                }}
                onClick={() => {
                  handleCardClick(0);
                }}
              >
                <PolicyCard
                  id={policies[0].id}
                  title={policies[0].title}
                  description={policies[0].description}
                  impact={policies[0].impact}
                  tier={policies[0].tier}
                  icon={areaIcon}
                  category={areaId}
                  isSelected={selectedPolicies.includes(policies[0].id)}
                  onClick={() => handleCardClick(0)}
                />
                {activeIndex === 0 && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gray-800/80 text-white text-center py-4 rounded-b-lg z-40"
                    style={{ width: '100%' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPolicy(policies[0].id, policies[0].tier);
                    }}
                  >
                    <span className="text-xl font-medium">Select Policy</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StackedPolicyCards;