
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Save } from "lucide-react";
import VoiceVisualizer from './VoiceVisualizer';

interface ReflectionPromptProps {
  question: string;
  category: string;
}

const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({ 
  question,
  category
}) => {
  const [response, setResponse] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  // Mock speech recognition (in a real implementation, you'd use the Web Speech API)
  const startRecording = () => {
    setIsRecording(true);
    
    // In a real implementation, you would use the SpeechRecognition API
    // For now, we'll simulate transcription with a timeout
    setTimeout(() => {
      const mockResponses = [
        "I believe our policies tried to balance immediate needs with long-term integration goals, but we may have overlooked the cultural preservation aspect.",
        "The budget constraints definitely limited our thinking. We focused too much on cost-effective solutions rather than transformative ones.",
        "I think we prioritized education access but might have neglected the quality aspect in our decision-making process."
      ];
      
      const newTranscription = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setTranscription(newTranscription);
      setResponse(prev => prev + (prev ? ' ' : '') + newTranscription);
      setIsRecording(false);
    }, 3000); // Simulate 3 seconds of recording
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    // In a real implementation, you would stop the SpeechRecognition here
  };
  
  const handleSubmit = () => {
    if (response.trim().length > 0) {
      setIsSubmitted(true);
    }
  };
  
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <Badge className="w-fit mb-2 bg-reflection-yellow text-black">{category}</Badge>
        <CardTitle className="text-lg">{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Type your reflection here or use the microphone to speak..."
          className="min-h-[100px]"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={isSubmitted || isRecording}
        />
        
        {isRecording && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <VoiceVisualizer 
              isActive={isRecording} 
              emotion="neutral" 
              intensity="medium"
            />
            <p className="text-sm text-center mt-2">Listening to your reflection...</p>
            {transcription && (
              <p className="text-sm italic mt-2">{transcription}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {!isSubmitted ? (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSubmitted}
              className="w-12 h-10"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-reflection-yellow text-black hover:bg-yellow-600"
              disabled={response.trim().length === 0 || isRecording}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Reflection
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsSubmitted(false)}
          >
            Edit Response
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReflectionPrompt;
