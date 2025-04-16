'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useGameContext } from '@/context/GameContext';
import ReflectionPrompt from '@/components/ui/ReflectionPrompt';
import { generateReflection } from '@/lib/reflection-engine';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportDocument from '@/components/ui/ReportDocument';
import PolicyFeedback from '@/components/ui/PolicyFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { generatePolicyFeedback } from '@/lib/feedback-generator';

export default function EthicalReflectionPage() {
  const router = useRouter();
  const { 
    getSelectedPolicyObjects,
    reflectionData,
    setReflectionData,
    saveReflection,
    aiFeedback,
    setAiFeedback
  } = useGameContext();

  // All hooks at the top!
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [policyFeedback, setPolicyFeedback] = useState<string | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState<Record<string, string>>({});
  const [isGeneratingQuestionFeedback, setIsGeneratingQuestionFeedback] = useState<Record<string, boolean>>({});

  // First useEffect - for generating reflection data
  useEffect(() => {
    if (!reflectionData) {
      const selectedPolicyObjects = getSelectedPolicyObjects();
      const reflection = generateReflection(selectedPolicyObjects);
      setReflectionData(reflection);
    }
  }, []);

  // Second useEffect - for generating feedback
  // MOVE THIS BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    // Only run if reflectionData exists
    if (!reflectionData) return;
    
    if (!aiFeedback) {
      generateFeedback();
    } else {
      setPolicyFeedback(aiFeedback);
    }
  }, [reflectionData, aiFeedback]);

  // Handle saving a reflection response
  const handleSaveReflection = (questionId: string, response: string) => {
    saveReflection(questionId, response);
    
    // Generate AI feedback for this specific reflection response
    generateQuestionFeedback(questionId, response);
    
    toast({
      title: "Reflection Saved",
      description: "Your reflection has been saved and will be included in your policy report.",
    });
  };

  // Generate feedback for a specific reflection question response
  const generateQuestionFeedback = async (questionId: string, response: string) => {
    if (!response.trim()) return; // Don't generate feedback for empty responses
    
    setIsGeneratingQuestionFeedback(prev => ({ ...prev, [questionId]: true }));
    
    try {
      // Find the question text
      const question = reflectionData?.questions.find(q => q.id === questionId);
      if (!question) return;
      
      // Call your AI service to generate feedback
      // This is a simplified example - you'll need to implement or use your existing AI service
      const feedback = await fetch('/api/generate-reflection-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: question.text,
          userResponse: response,
          selectedPolicies: getSelectedPolicyObjects(),
        })
      }).then(res => res.json()).then(data => data.feedback);
      
      // Store the feedback
      setQuestionFeedback(prev => ({ ...prev, [questionId]: feedback }));
    } catch (error) {
      console.error('Error generating question feedback:', error);
      toast({
        title: "Feedback Error",
        description: "Could not generate feedback for your reflection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQuestionFeedback(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // Count completed reflections for progress tracking
  const completedReflections = reflectionData ? Object.keys(reflectionData.responses).length : 0;
  const totalReflections = reflectionData ? reflectionData.questions.length : 0;
  const completionPercentage = Math.round((completedReflections / totalReflections) * 100);

  // Generate policy feedback
  const generateFeedback = async () => {
    setIsLoadingFeedback(true);
    try {
      const selectedPolicyObjects = getSelectedPolicyObjects();
      const feedback = await generatePolicyFeedback(selectedPolicyObjects, reflectionData);
      setPolicyFeedback(feedback);
      setAiFeedback(feedback); // Store in context for later reference
    } catch (error) {
      console.error('Error generating feedback:', error);
      toast({
        title: "Feedback Error",
        description: "Could not generate policy feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  if (!reflectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading reflection data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-opensans">
      {/* Header */}
      <header className="bg-policy-maroon text-white py-6 px-4 md:px-8">
        <div className="container mx-auto">
          <h1 className="font-bebas text-4xl md:text-6xl lg:text-7xl tracking-wider mb-2">
            THE CHALLENGE GAME
          </h1>
          <p className="text-hope-turquoise text-lg md:text-xl max-w-3xl">
            Reflect on the ethical implications of your refugee education policies.
          </p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="font-bebas text-3xl mb-6">Ethical Reflection</h2>
        
        <div className="space-y-8">
          {/* Policy Impact Assessment Card */}
          <Card className="bg-white transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bebas">Policy Impact Assessment</CardTitle>
              <CardDescription>
                Your policy package has been analyzed for equity and inclusion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Equity Score</h3>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-hope-turquoise h-4 rounded-full" 
                      style={{ width: `${(reflectionData.equityScore / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-bold">{reflectionData.equityScore}/5</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on UNESCO inclusion metrics for refugee education
                </p>
              </div>
              
              {/* AI Policy Analysis */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Policy Analysis</h3>
                {isLoadingFeedback ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-policy-maroon"></div>
                  </div>
                ) : policyFeedback ? (
                  <div className="prose max-w-none">
                    <div className="bg-gray-50 p-4 rounded-md border-l-4 border-hope-turquoise">
                      {policyFeedback.split('\n\n').map((paragraph, i) => (
                        <p key={i} className={i === 0 ? "font-medium" : ""}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Button onClick={generateFeedback} className="bg-policy-maroon text-white hover:bg-opacity-90">
                    Generate Policy Analysis
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Reflection Progress */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h3 className="font-bebas text-xl mb-4">Reflection Progress</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-progress-green h-4 rounded-full" 
                  style={{ width: `${(Object.keys(reflectionData.responses).length / reflectionData.questions.length) * 100}%` }}
                ></div>
              </div>
              <span className="font-bold">
                {Object.keys(reflectionData.responses).length}/{reflectionData.questions.length}
              </span>
            </div>
          </div>
          
          {/* Reflection Questions */}
          <div className="space-y-6">
            <h3 className="font-bebas text-2xl">Reflection Questions</h3>
            {reflectionData.questions.map((question) => (
              <ReflectionPrompt
                key={question.id}
                question={question}
                initialResponse={reflectionData.responses[question.id] || ''}
                onSave={(response) => handleSaveReflection(question.id, response)}
                selectedPolicies={getSelectedPolicyObjects()}
                feedback={questionFeedback[question.id]}
                isGeneratingFeedback={isGeneratingQuestionFeedback[question.id]}
              />
            ))}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/stakeholder-negotiation')}
            >
              Back to Negotiation
            </Button>
            
            <Button 
              className="bg-policy-maroon text-white hover:bg-opacity-90"
              onClick={() => router.push('/summary')}
            >
              View Final Summary
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}