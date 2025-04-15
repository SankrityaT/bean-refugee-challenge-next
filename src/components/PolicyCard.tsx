'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PolicyCardProps {
  title: string;
  description: string;
  impact: string;
  tier: number;
  cost?: number;
  icon: any;
  category: string;
  isSelected?: boolean;
  onClick: () => void;
  id?: string; 
}

const getCategoryBorderColor = (category: string) => {
  switch(category) {
    case 'access':
      return 'border-l-hope-turquoise';
    case 'language':
      return 'border-l-reflection-yellow';
    case 'teacher':
      return 'border-l-progress-green';
    case 'curriculum':
      return 'border-l-warning-orange';
    case 'psychosocial':
      return 'border-l-policy-maroon';
    case 'financial':
      return 'border-l-purple-500';
    case 'certification':
      return 'border-l-blue-500';
    default:
      return 'border-l-gray-400';
  }
};

const getImpactStyles = (impact: string) => {
  switch(impact) {
    case 'Exclusionary':
      return 'bg-red-100 text-red-800';
    case 'Moderate Inclusion':
      return 'bg-yellow-100 text-yellow-800';
    case 'Transformative':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTierDisplay = (tier: number) => {
  return '●'.repeat(tier) + '○'.repeat(3 - tier);
};

const getImpactClass = (impact: string) => {
  switch(impact) {
    case 'Exclusionary':
      return 'bg-red-500 text-white';
    case 'Moderate Inclusion':
      return 'bg-yellow-500 text-white';
    case 'Transformative':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getTierClass = (tier: number) => {
  switch(tier) {
    case 1:
      return 'text-red-500';
    case 2:
      return 'text-yellow-500';
    case 3:
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

const PolicyCard: React.FC<PolicyCardProps> = ({ 
  title, 
  description, 
  impact, 
  tier,
  cost,
  icon,
  category,
  isSelected = false,
  onClick,
  id = ''
}) => {
  // Get background image for policies
  let backgroundImage = null;
  if (category === 'access') {
    if (id === 'access1') backgroundImage = '/cyanBlueOption1.jpg';
    else if (id === 'access2') backgroundImage = '/cyanBlueOption2.jpg';
    else if (id === 'access3') backgroundImage = '/cyanBlueOption3.jpg';
  } else if (category === 'language') {
    if (id === 'language1') backgroundImage = '/languageInstructionOption1.jpg';
    else if (id === 'language2') backgroundImage = '/languageInstructionOption2.jpg';
    else if (id === 'language3') backgroundImage = '/languageInstructionOption3.jpg';
  } else if (category === 'teacher') {
    if (id === 'teacher1') backgroundImage = '/teacherTrainingOption1.jpg';
    else if (id === 'teacher2') backgroundImage = '/teacherTrainingOption2.jpg';
    else if (id === 'teacher3') backgroundImage = '/teacherTrainingOption3.jpg';
  } else if (category === 'curriculum') {
    if (id === 'curriculum1') backgroundImage = '/curriculumOption1.jpg';
    else if (id === 'curriculum2') backgroundImage = '/curriculumOption2.jpg';
    else if (id === 'curriculum3') backgroundImage = '/curriculumOption3.jpg';
  } else if (category === 'psychosocial') {
    if (id === 'psychosocial1') backgroundImage = '/psychosocialOption1.jpg';
    else if (id === 'psychosocial2') backgroundImage = '/pyschosocialOption2.jpg';
    else if (id === 'psychosocial3') backgroundImage = '/psychosocialOption3.jpg';
  } else if (category === 'financial') {
    if (id === 'financial1') backgroundImage = '/financialSupportOption1.jpg';
    else if (id === 'financial2') backgroundImage = '/financialOption2.jpg';
    else if (id === 'financial3') backgroundImage = '/financialOption3.jpg';
  } else if (category === 'certification') {
    if (id === 'certification1') backgroundImage = '/certificationOption1.jpg';
    else if (id === 'certification2') backgroundImage = '/certificationOption2.jpg';
    else if (id === 'certification3') backgroundImage = '/certificationOption3.jpg';
  }
  
  return (
    <div 
      className={`relative rounded-lg overflow-hidden h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      {/* Background Image with Gradient Overlay */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Very light gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/20"></div>
        </div>
      )}

      <div className="relative z-10 p-4 flex flex-col h-full">
        {/* Card Header */}
        <div className="mb-2">
          <h3 className="font-bold text-lg text-white">{title}</h3>
        </div>
        
        {/* Card Content - Empty to allow full image visibility */}
        <div className="flex-grow"></div>
        
        {/* Card Footer - Only Select Policy button */}
        <div className="mt-auto">
          <button className="w-full mt-2 py-2 bg-gray-800/80 text-white rounded-md hover:bg-gray-700/80 transition-colors">
            Select Policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
