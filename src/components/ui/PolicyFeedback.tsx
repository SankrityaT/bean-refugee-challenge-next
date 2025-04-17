'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Volume2, VolumeX, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { PolicyWithArea } from '@/lib/ai-negotiation/shared-types';
import { ReflectionData } from '@/lib/reflection-engine';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useGameContext } from '@/context/GameContext';
import { generatePolicyFeedback } from '@/lib/feedback-generator';
import { Badge } from "@/components/ui/badge";

export interface PolicyFeedbackProps {
  selectedPolicies: PolicyWithArea[];
  reflectionData: ReflectionData;
  isGenerating: boolean;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}

interface FeedbackSection {
  title: string;
  content: string;
  type: 'overview' | 'positive' | 'challenge' | 'recommendation';
  icon: React.ReactNode;
}

const PolicyFeedback: React.FC<PolicyFeedbackProps> = ({
  selectedPolicies,
  reflectionData,
  isGenerating,
  setIsGenerating
}) => {
  const { aiFeedback, setAiFeedback } = useGameContext();
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [showFullContent, setShowFullContent] = useState(false);

  // Parse the feedback into sections
  const parseFeedbackIntoSections = (feedback: string): FeedbackSection[] => {
    if (!feedback) return [];
    
    // Look for bullet points or sections in the feedback
    const sections: FeedbackSection[] = [];
    
    // For bullet point format, try to identify the main sections
    const strengthsMatch = feedback.match(/STRENGTHS?:([^•\n]*)/i);
    const concernsMatch = feedback.match(/CONCERNS?:([^•\n]*)/i);
    const recommendationMatch = feedback.match(/RECOMMENDATIONS?:([^•\n]*)/i);
    
    // If we detected the bullet point format
    if (strengthsMatch || concernsMatch || recommendationMatch) {
      // Add a summary section with the first part of the feedback
      sections.push({
        title: 'Summary',
        content: feedback.split('•')[0] || 'Policy analysis based on your selections.',
        type: 'overview',
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
      });
      
      // Add strengths section
      if (strengthsMatch && strengthsMatch[1]) {
        sections.push({
          title: 'Strengths',
          content: strengthsMatch[1].trim(),
          type: 'positive',
          icon: <CheckCircle className="h-5 w-5 text-emerald-500" />
        });
      }
      
      // Add concerns section
      if (concernsMatch && concernsMatch[1]) {
        sections.push({
          title: 'Concerns',
          content: concernsMatch[1].trim(),
          type: 'challenge',
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
        });
      }
      
      // Add recommendation section
      if (recommendationMatch && recommendationMatch[1]) {
        sections.push({
          title: 'Recommendation',
          content: recommendationMatch[1].trim(),
          type: 'recommendation',
          icon: <Lightbulb className="h-5 w-5 text-blue-500" />
        });
      }
      
      return sections;
    }
    
    // Fallback to the previous paragraph-based approach
    const paragraphs = feedback.split('\n\n').filter(p => p.trim().length > 0);
    
    // Always add the first paragraph as overview
    if (paragraphs.length > 0) {
      sections.push({
        title: 'Overview',
        content: paragraphs[0],
        type: 'overview',
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
      });
    }
    
    // Add interactions if there's a second paragraph
    if (paragraphs.length > 1) {
      sections.push({
        title: 'Key Points',
        content: paragraphs[1],
        type: 'positive',
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />
      });
    }
    
    // Add implications if there's a third paragraph
    if (paragraphs.length > 2) {
      sections.push({
        title: 'Recommendations',
        content: paragraphs[2],
        type: 'recommendation',
        icon: <Lightbulb className="h-5 w-5 text-blue-500" />
      });
    }
    
    return sections;
  };

  const feedbackSections = aiFeedback ? parseFeedbackIntoSections(aiFeedback) : [];

  const handleGenerateFeedback = async () => {
    setIsGenerating(true);
    try {
      const feedback = await generatePolicyFeedback(selectedPolicies, reflectionData);
      setAiFeedback(feedback);
      // Reset expanded sections when generating new feedback
      setExpandedSections({});
      setShowFullContent(false);
    } catch (error) {
      console.error('Error generating feedback:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSection = (index: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleAllSections = () => {
    setShowFullContent(!showFullContent);
    
    const newExpandedState = {};
    feedbackSections.forEach((_, index) => {
      newExpandedState[index] = !showFullContent;
    });
    
    setExpandedSections(newExpandedState);
  };

  if (!PolicyFeedback) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-4">Policy Analysis</h3>
      
      {aiFeedback ? (
        <div className="space-y-4">
          {/* Summary card always visible */}
          {feedbackSections.length > 0 && (
            <Card className="overflow-hidden border-l-4 border-l-amber-500">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-md font-medium flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 py-2">
                <p className="text-sm">
                  {feedbackSections[0]?.content.split('. ')[0]}.
                </p>
              </CardContent>
              <CardFooter className="pt-0 pb-2 px-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleAllSections}
                  className="text-xs flex items-center text-gray-500"
                >
                  {showFullContent ? 'Show Less' : 'Show All Details'}
                  {showFullContent ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Detailed section cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackSections.map((section, index) => {
              // Skip the overview which is already shown in the summary
              if (index === 0 && !expandedSections[index] && !showFullContent) return null;
              
              const borderColorClass = 
                section.type === 'positive' ? 'border-l-emerald-500' :
                section.type === 'challenge' ? 'border-l-amber-500' :
                section.type === 'recommendation' ? 'border-l-blue-500' : 'border-l-gray-300';
              
              return (
                <Card 
                  key={index} 
                  className={`overflow-hidden border-l-4 ${borderColorClass} transition-all duration-300`}
                >
                  <CardHeader 
                    className="pb-2 pt-4 px-4 cursor-pointer flex flex-row items-center justify-between"
                    onClick={() => toggleSection(index)}
                  >
                    <CardTitle className="text-md font-medium flex items-center">
                      {section.icon}
                      <span className="ml-2">{section.title}</span>
                    </CardTitle>
                    {expandedSections[index] || showFullContent ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </CardHeader>
                  
                  {(expandedSections[index] || showFullContent) && (
                    <CardContent className="px-4 py-2">
                      <p className="text-sm">{section.content}</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="p-4 bg-gray-50 mb-4">
          <p className="text-sm text-gray-600">
            Generate an AI analysis of your policy package to understand its potential impact on refugee education.
          </p>
        </Card>
      )}
      
      <Button
        onClick={handleGenerateFeedback}
        disabled={isGenerating}
        className="bg-policy-maroon text-white hover:bg-opacity-90 mt-4"
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