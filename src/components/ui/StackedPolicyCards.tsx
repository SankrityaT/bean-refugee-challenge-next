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
        className="absolute top-2 right-2 z-50 bg-white text-black px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-gray-100 transition-all"
      >
        {showAll ? 'Stack Cards' : 'Show All'}
      </button>

      {showAll ? (
        // Grid view - all cards visible with fixed heights
        <div className="grid grid-cols-1 gap-6 overflow-y-auto pr-1 pb-4" style={{ maxHeight: '100%' }}>
          {policies.map((policy, index) => (
            <div key={policy.id} className="transform transition-all duration-300 mb-10">
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
                {/* Select Policy button styled like the Show All button */}
                <div 
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-gray-100 transition-all cursor-pointer"
                  onClick={() => onSelectPolicy(policy.id, policy.tier)}
                >
                  <span>Select Policy</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Apple Wallet style stacked view with improved positioning
        <div className="relative w-full h-full overflow-hidden bg-transparent">
          {/* Container with proper height to contain all cards */}
          <div className="relative w-full h-[35rem] mt-[120px]">
            {/* Stack cards with Apple Wallet style offsets */}
            <div className="relative w-full h-full overflow-visible">
              {/* Option 3 - Top card */}
              {policies.length > 2 && (
                <div 
                  key={policies[2].id} 
                  className="absolute inset-x-0 transition-all duration-300 ease-in-out shadow-lg cursor-pointer bg-white"
                  style={{
                    top: '-120px',  
                    height: policies[2].id.includes('psychosocial') ? '32rem' : 
                           policies[2].id.includes('certification') ? '38rem' : '30rem',
                    zIndex: activeIndex === 2 ? 40 : 10,
                    borderRadius: '12px',
                    transform: activeIndex === 2 ? 'scale(1.02)' : 'scale(1)',
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
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-gray-100 transition-all z-40 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPolicy(policies[2].id, policies[2].tier);
                      }}
                    >
                      <span>Select Policy</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Option 2 - Middle card */}
              {policies.length > 1 && (
                <div 
                  key={policies[1].id} 
                  className="absolute inset-x-0 transition-all duration-300 ease-in-out shadow-lg cursor-pointer bg-white"
                  style={{
                    top: '-60px',  
                    height: policies[1].id.includes('psychosocial') ? '32rem' : 
                           policies[1].id.includes('certification') ? '46rem' : '30rem',
                    zIndex: activeIndex === 1 ? 40 : 20,
                    borderRadius: '12px',
                    transform: activeIndex === 1 ? 'scale(1.02)' : 'scale(1)',
                    overflow: policies[1].id.includes('certification') ? 'visible' : 'hidden'
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
                  
                  {/* Special case for Option 2 certification cards */}
                  {activeIndex === 1 && (
                    <>
                      {policies[1].id.includes('certification') ? (
                        <button 
                          className="absolute left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-gray-100 transition-all z-[9999] cursor-pointer"
                          style={{ bottom: '-30px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPolicy(policies[1].id, policies[1].tier);
                          }}
                        >
                          Select Policy
                        </button>
                      ) : (
                        <div 
                          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-gray-100 transition-all z-50 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPolicy(policies[1].id, policies[1].tier);
                          }}
                        >
                          <span>Select Policy</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              
              {/* Option 1 - Bottom card */}
              <div 
                key={policies[0].id} 
                className="absolute inset-x-0 transition-all duration-300 ease-in-out shadow-lg cursor-pointer bg-white"
                style={{
                  top: '0px',
                  height: policies[0].id.includes('psychosocial') ? '32rem' : 
                         policies[0].id.includes('certification') ? '38rem' : '30rem',
                  zIndex: activeIndex === 0 ? 40 : 30,
                  borderRadius: '12px',
                  transform: activeIndex === 0 ? 'scale(1.02)' : 'scale(1)',
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
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-gray-100 transition-all z-40 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPolicy(policies[0].id, policies[0].tier);
                    }}
                  >
                    <span>Select Policy</span>
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