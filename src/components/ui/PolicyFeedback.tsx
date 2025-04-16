'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Volume2, VolumeX } from "lucide-react";
import { PolicyWithArea } from '@/lib/ai-negotiation/shared-types';
import { ReflectionData } from '@/lib/reflection-engine';

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useGameContext } from '@/context/GameContext';
import { generatePolicyFeedback } from '@/lib/feedback-generator';

// Remove this first interface and keep only the exported one
export interface PolicyFeedbackProps {
  selectedPolicies: PolicyWithArea[];
  reflectionData: ReflectionData;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}

const PolicyFeedback: React.FC<PolicyFeedbackProps> = ({
  selectedPolicies,
  reflectionData,
  isGenerating,
  setIsGenerating
}) => {
  const { aiFeedback, setAiFeedback } = useGameContext();

  const handleGenerateFeedback = async () => {
    setIsGenerating(true);
    try {
      const feedback = await generatePolicyFeedback(selectedPolicies, reflectionData);
      setAiFeedback(feedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">AI Policy Analysis</h3>
      
      {aiFeedback ? (
        <Card className="p-4 bg-gray-50 mb-4">
          <p className="text-sm">{aiFeedback}</p>
        </Card>
      ) : (
        <p className="text-sm text-gray-600 mb-4">
          Generate an AI analysis of your policy package to understand its potential impact on refugee education.
        </p>
      )}
      
      <Button
        onClick={handleGenerateFeedback}
        disabled={isGenerating}
        className="bg-policy-maroon text-white hover:bg-opacity-90"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing policies...
          </>
        ) : (
          aiFeedback ? 'Regenerate Analysis' : 'Generate AI Analysis'
        )}
      </Button>
    </div>
  );
};

export default PolicyFeedback;