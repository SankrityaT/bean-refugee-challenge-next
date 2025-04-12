
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface BudgetIndicatorProps {
  totalBudget: number;
  allocatedBudget: number;
}

const BudgetIndicator: React.FC<BudgetIndicatorProps> = ({ 
  totalBudget, 
  allocatedBudget 
}) => {
  const percentUsed = (allocatedBudget / totalBudget) * 100;
  const isOverBudget = allocatedBudget > totalBudget;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bebas text-lg">Policy Budget</h3>
        <span className={`font-bold ${isOverBudget ? 'text-warning-orange' : 'text-black'}`}>
          ${allocatedBudget}M / ${totalBudget}M
        </span>
      </div>
      
      <Progress 
        value={percentUsed > 100 ? 100 : percentUsed} 
        className={`h-3 ${isOverBudget ? 'bg-gray-200' : 'bg-gray-100'}`}
        indicatorClassName={isOverBudget ? 'bg-warning-orange' : 'bg-progress-green'}
      />
      
      {isOverBudget && (
        <p className="text-warning-orange text-sm mt-2 font-semibold">
          Warning: You've exceeded your allocated budget!
        </p>
      )}
    </div>
  );
};

export default BudgetIndicator;
