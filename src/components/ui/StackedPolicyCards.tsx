'use client';

import React, { useState, useRef, useEffect, TouchEvent } from 'react';
import PolicyCard from './PolicyCard';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
// Add to your imports at the top of the file
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  
  // Touch handling state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Update container height on mount and window resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        // Use a percentage of viewport height that works well on mobile
        const height = Math.min(window.innerHeight * 0.7, 600); 
        setContainerHeight(height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Toggle between stacked view and grid view
  const toggleView = () => {
    setShowAll(!showAll);
  };

  // Handle card click to bring it to the front
  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  // Handle policy selection
  const handleSelectPolicy = (policyId: string, policyTier: number) => {
    onSelectPolicy(policyId, policyTier);
  };
  
  // Navigate to previous card
  const goToPrevious = () => {
    setActiveIndex(prev => (prev > 0 ? prev - 1 : policies.length - 1));
  };
  
  // Navigate to next card
  const goToNext = () => {
    setActiveIndex(prev => (prev < policies.length - 1 ? prev + 1 : 0));
  };
  
  // Touch event handlers for swipe
  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Add state to track if "Show All" is clicked
  const [showAll, setShowAll] = useState(false);
  
  // In the return statement, update the container's height based on showAll state
  return (
    <div 
      className="relative w-full" 
      ref={containerRef} 
      style={{ height: containerHeight }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* View toggle button */}
      <button 
        onClick={toggleView}
        className="absolute top-2 right-2 z-50 bg-white/90 text-black px-3 py-1 rounded-full text-sm font-medium shadow-md hover:bg-white transition-all"
      >
        {showAll ? 'Stack Cards' : 'Show All'}
      </button>

      {showAll ? (
        // Grid view - all cards visible with scrollable container
        <div className="grid grid-cols-1 gap-6 overflow-y-auto p-4" 
             style={{ maxHeight: '100%', paddingBottom: '2rem' }}>
          {policies.map((policy, index) => (
            <div key={policy.id} className="transform transition-all duration-300">
              <div className="relative">
                {/* Tier badge - moved to top right */}
                <div className="absolute top-2 right-2 z-20">
                  <Badge className="bg-primary text-white font-bold">
                    {policy.tier} {policy.tier === 1 ? 'Unit' : 'Units'}
                  </Badge>
                </div>
                
                <PolicyCard
                  id={policy.id}
                  title={policy.title}
                  description={policy.description}
                  impact={policy.impact}
                  tier={policy.tier}
                  cost={policy.cost}
                  icon={areaIcon}
                  category={areaId}
                  isSelected={selectedPolicies.includes(policy.id)}
                  onClick={() => handleCardClick(index)}
                />
                <div className="absolute bottom-4 right-4 z-10">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPolicy(policy.id, policy.tier);
                    }}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {selectedPolicies.includes(policy.id) ? 'Deselect Policy' : 'Select Policy'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Stacked view - cards stacked with active card on top
        <div className="relative h-full flex items-center justify-center overflow-hidden">
          {/* Left navigation arrow for desktop - REMOVE the hidden md:block class */}
          <button 
  onClick={goToPrevious}
  className="absolute left-1 md:left-4 z-50 bg-white rounded-full p-1 md:p-2 shadow-lg hover:bg-gray-100"
  aria-label="Previous card"
>
  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
</button>

<button 
  onClick={goToNext}
  className="absolute right-1 md:right-4 z-50 bg-white rounded-full p-1 md:p-2 shadow-lg hover:bg-gray-100"
  aria-label="Next card"
>
  <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
</button>
          
          <AnimatePresence>
            {policies.map((policy, index) => {
              // Calculate offset for stacked appearance
              const isActive = index === activeIndex;
              const zIndex = policies.length - Math.abs(activeIndex - index);
              
              // Adjust rotation and offset for better mobile display
              // Reduce rotation angle for better readability on small screens
              const rotation = index < activeIndex 
                ? -3 + (index - activeIndex) * 1 
                : 3 + (index - activeIndex) * 1;
              
              // Adjust x-offset to ensure cards are fully visible on mobile
              // Use percentage-based offsets for better responsiveness
              const xOffset = index < activeIndex 
                ? `-${15 + (activeIndex - index) * 5}%` 
                : `${15 + (index - activeIndex) * 5}%`;
              
              // Reduce y-offset for mobile
              const yOffset = Math.abs(index - activeIndex) * 10;
              
              return (
                <motion.div
                  key={policy.id}
                  className="absolute cursor-pointer"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ 
                    scale: isActive ? 1 : 0.95 - Math.abs(activeIndex - index) * 0.03,
                    opacity: 1 - Math.abs(activeIndex - index) * 0.15,
                    rotateZ: rotation,
                    x: xOffset,
                    y: yOffset,
                    zIndex
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ 
                    zIndex,
                    width: '85%', // Reduced width to ensure cards are fully visible
                    maxWidth: '380px',
                    pointerEvents: 'auto' // Ensure all cards are clickable
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="relative">
                    {/* Tier badge - moved to top right */}
                    <div className="absolute top-2 right-2 z-20">
                      <Badge className="bg-primary text-white font-bold">
                        {policy.tier} {policy.tier === 1 ? 'Unit' : 'Units'}
                      </Badge>
                    </div>
                    
                    <PolicyCard
                      id={policy.id}
                      title={policy.title}
                      description={policy.description}
                      impact={policy.impact}
                      tier={policy.tier}
                      cost={policy.cost}
                      icon={areaIcon}
                      category={areaId}
                      isSelected={selectedPolicies.includes(policy.id)}
                      onClick={() => {}} // Handled by parent div
                    />
                    
                    {isActive && (
                      <div className="absolute bottom-4 right-4 z-10">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPolicy(policy.id, policy.tier);
                          }}
                          className="bg-primary hover:bg-primary/90 text-white text-sm md:text-base px-2 md:px-4 py-1 md:py-2"
                        >
                          {selectedPolicies.includes(policy.id) ? 'Deselect' : 'Select Policy'}
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Mobile-friendly card navigation dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-50">
            {policies.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === activeIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => handleCardClick(index)}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Budget reminder */}
          <div className="absolute top-2 left-2 z-50">
            <Badge variant="outline" className="bg-white/90 text-black font-medium px-3 py-1">
              Budget: 14 Units Total
            </Badge>
          </div>
          
          {/* Mobile swipe indicator - only shown initially */}
          <div className="absolute bottom-12 left-0 right-0 flex justify-center z-40 md:hidden">
            <div className="bg-white/80 text-xs text-gray-600 px-2 py-1 rounded-full">
              Swipe to navigate cards
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StackedPolicyCards;