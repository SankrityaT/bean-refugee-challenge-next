'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameContext } from '@/context/GameContext';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeft, Home } from 'lucide-react';

export default function SummaryPage() {
  const router = useRouter();
  const { 
    getSelectedPolicyObjects,
    reflectionData,
    aiFeedback
  } = useGameContext();
  
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
  // Generate download URL for reflection data export
  const handleExportSummary = () => {
    const selectedPolicies = getSelectedPolicyObjects();
    
    const summaryData = {
      policies: selectedPolicies.map(p => ({
        title: p.title,
        area: p.area,
        tier: p.tier,
        impact: p.impact
      })),
      equityScore: reflectionData?.equityScore || 0,
      reflections: reflectionData?.responses || {},
      feedback: aiFeedback
    };
    
    const dataStr = JSON.stringify(summaryData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    setDownloadUrl(dataUri);
  };
  
  // Count completed reflections
  const completedReflections = reflectionData ? Object.keys(reflectionData.responses).length : 0;
  const totalReflections = reflectionData ? reflectionData.questions.length : 0;
  
  if (!reflectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading summary data...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 font-opensans">
      {/* Header */}
      <header className="bg-policy-maroon text-white py-6 px-4 md:px-8">
        <div className="container mx-auto">
          <h1 className="font-bebas text-4xl md:text-6xl lg:text-7xl tracking-wider mb-2">
            CHALLENGE COMPLETE
          </h1>
          <p className="text-hope-turquoise text-lg md:text-xl max-w-3xl">
            Your refugee education policy journey summarized
          </p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Policy Package Summary */}
          <Card className="bg-white transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bebas">Your Policy Package</CardTitle>
              <CardDescription>
                You selected {getSelectedPolicyObjects().length} policies across {new Set(getSelectedPolicyObjects().map(p => p.area)).size} areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getSelectedPolicyObjects().map((policy) => (
                  <div key={policy.id} className="border rounded-md p-3 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{policy.title}</h3>
                      <Badge variant="outline">{policy.area}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                    <div className="mt-auto pt-2 flex justify-between text-xs text-gray-500">
                      <span>Tier {policy.tier}</span>
                      <span>Impact: {policy.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Equity Score */}
          <Card className="bg-white transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bebas">Equity Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="bg-hope-turquoise h-6 rounded-full" 
                      style={{ width: `${(reflectionData.equityScore / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-xl">{reflectionData.equityScore}/5</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on UNESCO inclusion metrics for refugee education
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* AI Feedback */}
          <Card className="bg-white transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bebas">Policy Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {aiFeedback ? (
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-4 rounded-md border-l-4 border-hope-turquoise">
                    {aiFeedback.split('\n\n').map((paragraph, i) => (
                      <p key={i} className={i === 0 ? "font-medium" : ""}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <p>No policy analysis available.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Reflection Highlights */}
          <Card className="bg-white transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bebas">Your Reflections</CardTitle>
              <CardDescription>
                {completedReflections} of {totalReflections} reflections completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(reflectionData.responses).map(([questionId, response]) => {
                  const question = reflectionData.questions.find(q => q.id === questionId);
                  if (!question) return null;
                  
                  return (
                    <div key={questionId} className="border-b pb-4">
                      <div className="flex items-start gap-2">
                        <h3 className="font-semibold">{question.question}</h3>
                        <Badge variant="outline" className="text-xs">
                          {question.category}
                        </Badge>
                      </div>
                      <p className="mt-2 text-gray-700">{response as string}</p>
                    </div>
                  );
                })}
                
                {completedReflections === 0 && (
                  <p className="text-gray-500 italic">No reflections completed yet.</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleExportSummary}
                disabled={!downloadUrl}
              >
                <Download className="h-4 w-4 mr-2" />
                {downloadUrl ? (
                  <a href={downloadUrl} download="challenge-summary.json">
                    Download Summary
                  </a>
                ) : (
                  "Prepare Download"
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/ethical-reflection')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reflection
            </Button>
            
            <Button 
              className="bg-policy-maroon text-white hover:bg-opacity-90"
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}