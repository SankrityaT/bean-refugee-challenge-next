'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useGameContext } from '@/context/GameContext';
import ReflectionPrompt from '@/components/ui/ReflectionPrompt';
import { generateReflection } from '@/lib/reflection-engine';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportDocument from '@/components/ui/ReportDocument';

export default function EthicalReflectionPage() {
  const router = useRouter();
  const { 
    getSelectedPolicyObjects,
    reflectionData,
    setReflectionData,
    saveReflection
  } = useGameContext();
  
  // Generate reflection data when entering this page
  useEffect(() => {
    if (!reflectionData) {
      const selectedPolicyObjects = getSelectedPolicyObjects();
      const reflection = generateReflection(selectedPolicyObjects);
      setReflectionData(reflection);
    }
  }, []);
  
  // Handle saving a reflection response
  const handleSaveReflection = (questionId: string, response: string) => {
    saveReflection(questionId, response);
    
    toast({
      title: "Reflection Saved",
      description: "Your reflection has been saved and will be included in your policy report.",
    });
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
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bebas text-2xl mb-4">Policy Impact Assessment</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl font-bold">{reflectionData.equityScore}</div>
              <div>
                <p className="font-semibold">Equity Score</p>
                <p className="text-sm text-gray-600">Based on UNESCO inclusion metrics</p>
              </div>
            </div>
            
            <div className="mt-4">
              <PDFDownloadLink 
                document={<ReportDocument policies={getSelectedPolicyObjects()} reflectionData={reflectionData} />}
                fileName="refugee-policy-report.pdf"
                className="bg-policy-maroon text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-all"
              >
                {({ loading }) => loading ? 'Generating report...' : 'Download Policy Report (PDF)'}
              </PDFDownloadLink>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="font-bebas text-2xl">Reflection Questions</h3>
            <p className="text-gray-600 mb-4">
              Use the microphone button or type your responses to the following reflection questions.
              Your responses will be automatically saved when you click the "Save Reflection" button
              and included in your policy report PDF.
            </p>
            {reflectionData.questions.map((question) => (
              <ReflectionPrompt 
                key={question.id}
                question={question.question}
                category={question.category}
                questionId={question.id}
                savedResponse={reflectionData.responses[question.id] || ''}
                onSave={handleSaveReflection}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={() => router.push('/')}
            className="bg-policy-maroon hover:bg-opacity-90"
          >
            Return to Home
          </Button>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 mt-16">
        <div className="container mx-auto text-center">
          <h2 className="font-bebas text-2xl mb-4">THE CHALLENGE GAME</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            A simulation designed to explore the complexities of refugee education policy-making
            through interactive decision-making and ethical reflection.
          </p>
          <div className="mt-6 text-sm text-gray-400">
            &copy; 2025 CHALLENGE Game Project
          </div>
        </div>
      </footer>
    </div>
  );
}