'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Download, Save } from "lucide-react";
import ReflectionPrompt from './ReflectionPrompt';
import { ReflectionData, saveReflectionResponse, exportReflectionData } from '@/lib/reflection-engine';
import { PolicyOption } from '@/types/policies';

interface ReflectionPageProps {
  reflectionData: ReflectionData;
  selectedPolicies: PolicyOption[];
  onSaveAllReflections: (updatedReflectionData: ReflectionData) => void;
}

const ReflectionPage: React.FC<ReflectionPageProps> = ({
  reflectionData,
  selectedPolicies,
  onSaveAllReflections
}) => {
  const [localReflectionData, setLocalReflectionData] = useState<ReflectionData>(reflectionData);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
  // Update local reflection data when prop changes
  useEffect(() => {
    setLocalReflectionData(reflectionData);
  }, [reflectionData]);
  
  // Handle saving individual reflection responses
  const handleSaveReflection = (questionId: string, response: string) => {
    const updatedData = saveReflectionResponse(localReflectionData, questionId, response);
    setLocalReflectionData(updatedData);
    
    // Notify parent component of the update
    onSaveAllReflections(updatedData);
  };
  
  // Generate download URL for reflection data export
  const handleExportReflections = () => {
    const url = exportReflectionData(localReflectionData);
    setDownloadUrl(url);
    
    toast({
      title: "Export Ready",
      description: "Your reflections are ready to download.",
    });
  };
  
  // Count completed reflections
  const completedReflections = Object.keys(localReflectionData.responses).length;
  const totalReflections = localReflectionData.questions.length;
  const completionPercentage = Math.round((completedReflections / totalReflections) * 100);
  
  return (
    <div className="space-y-8">
      {/* Policy Impact Assessment Card */}
      <Card className="bg-white transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bebas">Policy Impact Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl font-bold">{localReflectionData.equityScore}</div>
            <div>
              <p className="font-semibold">Equity Score</p>
              <p className="text-sm text-gray-600">Based on UNESCO inclusion metrics</p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col md:flex-row gap-4">
            <Button 
              onClick={handleExportReflections}
              className="bg-policy-maroon text-white hover:bg-opacity-90 transition-all"
            >
              <Save className="h-4 w-4 mr-2" />
              Export Reflections
            </Button>
            
            {downloadUrl && (
              <a 
                href={downloadUrl} 
                download="refugee-policy-reflections.json"
                className="inline-flex items-center justify-center rounded-md bg-reflection-yellow text-black px-4 py-2 text-sm font-medium hover:bg-opacity-90 transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Reflections
              </a>
            )}
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Reflection Progress</span>
              <span className="text-sm font-medium">{completedReflections}/{totalReflections}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-reflection-yellow h-2.5 rounded-full" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Selected Policies Summary */}
      <Card className="bg-white transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bebas">Your Selected Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedPolicies.map((policy) => (
              <div key={policy.id} className="border rounded p-2 text-sm">
                <div className="font-medium">{policy.title}</div>
                <div className="text-xs text-gray-500">{policy.area} • Tier {policy.tier}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Reflection Questions */}
      <div className="space-y-6">
        <h3 className="font-bebas text-2xl">Reflection Questions</h3>
        <p className="text-gray-600">
          Use the microphone button or type your responses to the following reflection questions.
          Your responses will be automatically saved when you click the "Save Reflection" button.
        </p>
        
        {localReflectionData.questions.map((question) => (
          <ReflectionPrompt 
            key={question.id}
            question={question.question}
            category={question.category}
            questionId={question.id}
            savedResponse={localReflectionData.responses[question.id] || ''}
            onSave={handleSaveReflection}
          />
        ))}
      </div>
    </div>
  );
};

export default ReflectionPage;
