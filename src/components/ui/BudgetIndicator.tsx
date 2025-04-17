
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface BudgetIndicatorProps {
  totalBudget: number;
  allocatedBudget: number;
  isValid?: boolean;
  warnings?: string[];
  selectedPolicies?: Array<{id: string, tier: number, category: string}>;
}

const BudgetIndicator: React.FC<BudgetIndicatorProps> = ({ 
  totalBudget, 
  allocatedBudget,
  isValid = true,
  warnings = [],
  selectedPolicies = []
}) => {
  // Calculate percentage for progress bar
  const percentage = Math.min(100, (allocatedBudget / totalBudget) * 100);
  
  // Generate segments for the progress bar based on selected policies
  const segments = selectedPolicies.map(policy => ({
    id: policy.id,
    percentage: (policy.tier / totalBudget) * 100,
    category: policy.category
  }));
  
  // Function to get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'access': return '#A0F6DA';
      case 'language': return '#FED64D';
      case 'teacher': return '#EF5EFF';
      case 'curriculum': return '#7FFF2A';
      case 'psychosocial': return '#5CCBFF';
      case 'financial': return '#F46A1F';
      case 'certification': return '#A0522D';
      default: return '#CCCCCC';
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200">
        {/* Render segments for each policy */}
        {segments.map((segment, index) => {
          // Calculate the left position based on previous segments
          const leftPosition = segments
            .slice(0, index)
            .reduce((acc, curr) => acc + curr.percentage, 0);
            
          return (
            <div 
              key={segment.id}
              className="absolute top-0 h-full"
              style={{
                left: `${leftPosition}%`,
                width: `${segment.percentage}%`,
                backgroundColor: getCategoryColor(segment.category),
                transition: 'all 0.3s ease'
              }}
            />
          );
        })}
        
        {/* Fallback progress bar if no segments */}
        {segments.length === 0 && (
          <div 
            className={`h-full transition-all duration-300 ${!isValid ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      
      {warnings.length > 0 && (
        <p className={`text-sm ${!isValid ? 'text-red-500' : 'text-amber-500'}`}>
          Warning: {warnings[0]}
        </p>
      )}
    </div>
  );
};

export default BudgetIndicator;
