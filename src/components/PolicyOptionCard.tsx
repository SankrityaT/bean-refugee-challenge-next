import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PolicyOptionCardProps {
  id: string;
  title: string;
  description: string;
  impact: string;
  tier: number;
  cost?: number;
  isSelected?: boolean;
  onClick: () => void;
}

const PolicyOptionCard: React.FC<PolicyOptionCardProps> = ({
  id,
  title,
  description,
  impact,
  tier,
  cost,
  isSelected = false,
  onClick
}) => {
  // Determine which option image to use
  const getOptionImage = () => {
    // For education policies, use the cyan blue option cards
    if (id.startsWith('access')) {
      const optionNumber = id.charAt(id.length - 1);
      return `/cyanBlueOption${optionNumber}.jpg`;
    }
    
    // For other policies, we could add more custom images in the future
    return null;
  };
  
  const optionImage = getOptionImage();
  
  // Get impact badge styles
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
  
  // Get tier display
  const getTierDisplay = (tier: number) => {
    return '●'.repeat(tier) + '○'.repeat(3 - tier);
  };
  
  return (
    <div className={`w-full h-[30rem] rounded-xl border-2 ${isSelected ? 'border-policy-maroon' : 'border-gray-300'} shadow-md overflow-hidden flex flex-col relative`}>
      {/* Top Header (Cyan Blue) */}
      <div className="bg-[#A0F6DA] px-4 py-3">
        <h2 className="text-black font-bold text-lg">{title}</h2>
      </div>
      
      {optionImage ? (
        // Background Image Version
        <div className="flex-grow relative overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full bg-center bg-cover" 
            style={{ backgroundImage: `url(${optionImage})` }}
          ></div>
          
          {/* Content overlaid on image */}
          <div className="absolute inset-0 flex flex-col p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-start gap-3 mt-2">
              <div className="flex flex-col items-start">
                <div className="text-[#A0F6DA] font-bold text-sm bg-black/70 px-2 rounded">Option</div>
                <div className="text-[#A0F6DA] text-6xl font-bold leading-none">{id.charAt(id.length - 1)}</div>
              </div>
              <p className="text-white font-bold text-sm leading-snug bg-black/70 p-2 rounded">
                {description}
              </p>
            </div>
            
            <div className="mt-auto mb-4 flex flex-col gap-2">
              <div className="flex justify-between items-center bg-white/90 p-2 rounded">
                <Badge className={getImpactStyles(impact)}>
                  {impact}
                </Badge>
                <div className="text-sm font-medium">
                  Tier: {getTierDisplay(tier)}
                </div>
              </div>
              
              {cost !== undefined && (
                <div className="text-sm font-medium bg-white/90 p-2 rounded">
                  Budget Impact: ${cost}M
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Standard Version for non-image policies
        <div className="flex-grow flex flex-col p-4">
          <p className="text-black font-medium mt-2 mb-4">{description}</p>
          
          <div className="flex items-start gap-2 mt-auto">
            <svg className="w-10 h-10 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h4V9H1v12zM23 10c0-.55-.45-1-1-1h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L15.17 2 7.59 9.59C7.22 9.95 7 10.45 7 11v9c0 .55.45 1 1 1h9c.38 0 .72-.21.89-.55l3.58-7.16c.1-.18.15-.38.15-.59V10z" />
            </svg>
            <div>
              <h3 className="font-bold text-sm">Advantages</h3>
              <p className="text-sm text-gray-800">
                {impact === 'Transformative' ? 'Comprehensive solution with long-term benefits' : 
                 impact === 'Moderate Inclusion' ? 'Balanced approach with moderate results' : 
                 'Quick implementation with minimal resources'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 mt-4">
            <svg className="w-10 h-10 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 3H6c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h6l4 4V4c0-.55-.45-1-1-1zm6 0h-2v16h2V3z" />
            </svg>
            <div>
              <h3 className="font-bold text-sm">Disadvantages</h3>
              <p className="text-sm text-gray-800">
                {impact === 'Exclusionary' ? 'Limited impact and may exclude vulnerable groups' : 
                 impact === 'Moderate Inclusion' ? 'Requires moderate resources and coordination' : 
                 'Resource intensive and complex implementation'}
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Badge className={getImpactStyles(impact)}>
              {impact}
            </Badge>
            <div className="text-sm font-medium">
              Tier: {getTierDisplay(tier)}
            </div>
          </div>
          
          {cost !== undefined && (
            <div className="mt-2 text-sm font-medium text-gray-600">
              Budget Impact: ${cost}M
            </div>
          )}
        </div>
      )}
      
      {/* Bottom Action Area */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <Button 
          onClick={onClick} 
          variant={isSelected ? "destructive" : "default"}
          className="w-full"
        >
          {isSelected ? "Remove Policy" : "Select Policy"}
        </Button>
      </div>
      
      {/* Graduation Cap Icon for Education Policies */}
      {id.startsWith('access') && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-20 h-14 bg-[#A0F6DA] rounded-t-full flex items-center justify-center">
            {/* Graduation cap icon */}
            <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-5-9-5zm0 10.5l-7-4v3l7 4 7-4v-3l-7 4zm-5 1.5v3c0 1.38 3.58 2.5 5 2.5s5-1.12 5-2.5v-3l-5 2.5-5-2.5z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyOptionCard;
