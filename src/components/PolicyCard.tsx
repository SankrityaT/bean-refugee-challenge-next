
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

export interface PolicyCardProps {
  title: string;
  description: string;
  impact: string;
  cost: number;
  icon: React.ReactNode;
  category: 'housing' | 'education' | 'healthcare' | 'employment' | 'integration';
  onClick: () => void;
}

const getCategoryStyles = (category: string) => {
  switch(category) {
    case 'housing':
      return 'border-l-8 border-l-hope-turquoise';
    case 'education':
      return 'border-l-8 border-l-reflection-yellow';
    case 'healthcare':
      return 'border-l-8 border-l-progress-green';
    case 'employment':
      return 'border-l-8 border-l-warning-orange';
    case 'integration':
      return 'border-l-8 border-l-policy-maroon';
    default:
      return '';
  }
};

const PolicyCard: React.FC<PolicyCardProps> = ({ 
  title, 
  description, 
  impact, 
  cost,
  icon,
  category,
  onClick
}) => {
  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      getCategoryStyles(category)
    )}>
      <CardHeader className="bg-policy-maroon text-white">
        <div className="flex items-center gap-3">
          <div className="text-hope-turquoise">
            {icon}
          </div>
          <CardTitle className="font-bebas text-2xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <CardDescription className="font-opensans text-base mb-4">{description}</CardDescription>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold">Impact:</span>
          <span className="text-progress-green font-bold">{impact}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">Budget Cost:</span>
          <span className={cn(
            "font-bold",
            cost > 75 ? "text-warning-orange" : "text-black"
          )}>
            ${cost}M
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onClick}
          className="w-full bg-hope-turquoise hover:bg-hope-turquoise/80 text-black"
        >
          Select Policy
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PolicyCard;
