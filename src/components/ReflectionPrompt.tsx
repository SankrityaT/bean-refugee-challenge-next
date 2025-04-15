'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Save, Check } from "lucide-react";
import VoiceVisualizer from './VoiceVisualizer';
import { toast } from "@/components/ui/use-toast";

// Add TypeScript declarations for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ReflectionPromptProps {
  question: string;
  category: string;
  onSave?: (questionId: string, response: string) => void;
  questionId?: string;
  savedResponse?: string;
}

const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({ 
  question,
  category,
  onSave,
  questionId = '',
  savedResponse = ''
}) => {
  const [response, setResponse] = useState(savedResponse || '');
  const [isSubmitted, setIsSubmitted] = useState(!!savedResponse);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  // Speech recognition setup
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setResponse(prev => prev + (prev ? ' ' : '') + finalTranscript);
          }
          setTranscription(interimTranscript);
        };
        
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
          toast({
            title: "Speech Recognition Error",
            description: `Error: ${event.error}. Please try again or type your reflection.`,
            variant: "destructive",
          });
        };
      }
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
      }
    };
  }, []);
  
  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      setTranscription('');
      recognitionRef.current.start();
      
      toast({
        title: "Recording Started",
        description: "Speak your reflection now. Click the microphone again to stop.",
      });
    } else {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition. Please type your reflection instead.",
        variant: "destructive",
      });
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setTranscription('');
  };
  
  const handleSubmit = () => {
    if (response.trim().length > 0) {
      setIsSubmitted(true);
      
      // Call the onSave callback if provided
      if (onSave && questionId) {
        onSave(questionId, response.trim());
        
        toast({
          title: "Reflection Saved",
          description: "Your reflection has been saved successfully.",
        });
      }
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
          <div className="w-full flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsSubmitted(false)}
            >
              Edit Response
            </Button>
            <Button 
              variant="ghost" 
              className="text-green-600"
              disabled
            >
              <Check className="h-4 w-4 mr-2" />
              Saved
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReflectionPrompt;
