
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface BudgetIndicatorProps {
  totalBudget: number;
  allocatedBudget: number;
  isValid?: boolean;
  warnings?: string[];
}

const BudgetIndicator: React.FC<BudgetIndicatorProps> = ({ 
  totalBudget, 
  allocatedBudget,
  isValid = true,
  warnings = []
}) => {
  const percentUsed = (allocatedBudget / totalBudget) * 100;
  const isOverBudget = allocatedBudget > totalBudget;
  
  return (
    <div>
      <Progress 
        value={percentUsed > 100 ? 100 : percentUsed} 
        className={`h-3 ${isOverBudget ? 'bg-gray-200' : 'bg-gray-100'}`}
        indicatorClassName={!isValid ? 'bg-warning-orange' : 'bg-progress-green'}
      />
      
      {warnings.length > 0 && (
        <div className="mt-2">
          {warnings.map((warning, index) => (
            <p key={index} className="text-warning-orange text-sm font-semibold">
              Warning: {warning}
            </p>
          ))}
        </div>
      )}
      
      {isValid && allocatedBudget >= totalBudget * 0.85 && (
        <p className="text-amber-500 text-sm mt-2">
          You're approaching your budget limit!
        </p>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        <span className="font-medium">Tier System:</span> Each policy has a tier value (1-3). 
        Your total cannot exceed 14 units and must include at least 2 different tier levels.
      </div>
    </div>
  );
};

export default BudgetIndicator;
