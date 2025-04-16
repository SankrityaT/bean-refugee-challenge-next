
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PolicyCardProps {
  title: string;
  description: string;
  impact: string;
  tier: number;
  icon: any;
  category: string;
  isSelected?: boolean;
  onClick: () => void;
}

const getCategoryStyles = (category: string) => {
  switch(category) {
    case 'access':
      return 'border-l-8 border-l-hope-turquoise';
    case 'language':
      return 'border-l-8 border-l-reflection-yellow';
    case 'teacher':
      return 'border-l-8 border-l-progress-green';
    case 'curriculum':
      return 'border-l-8 border-l-warning-orange';
    case 'psychosocial':
      return 'border-l-8 border-l-policy-maroon';
    case 'financial':
      return 'border-l-8 border-l-purple-500';
    case 'certification':
      return 'border-l-8 border-l-blue-500';
    default:
      return 'border-l-8 border-l-gray-400';
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

const PolicyCard: React.FC<PolicyCardProps> = ({ 
  title, 
  description, 
  impact, 
  tier,
  icon,
  category,
  isSelected = false,
  onClick
}) => {
  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      getCategoryStyles(category),
      isSelected ? "ring-2 ring-policy-maroon ring-offset-2" : ""
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {React.createElement(icon, { className: "h-5 w-5" })}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <CardDescription>{description}</CardDescription>
        <div className="flex justify-between items-center mt-4">
          <Badge className={getImpactStyles(impact)}>
            {impact}
          </Badge>
          <div className="text-sm font-medium">
            Tier: {getTierDisplay(tier)}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onClick} 
          variant={isSelected ? "destructive" : "default"}
          className="w-full"
        >
          {isSelected ? "Remove Policy" : "Select Policy"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PolicyCard;
