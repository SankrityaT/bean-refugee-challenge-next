'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Save, Check } from "lucide-react";
import VoiceVisualizer from './VoiceVisualizer';
import { toast } from "@/hooks/use-toast";
import { PolicyWithArea } from '@/lib/ai-negotiation/shared-types';
import { ReflectionQuestion } from '@/data/reflection-questions';
import { PolicyOption } from '@/types/policies';

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

// Update the props interface
export interface ReflectionPromptProps {
  question: ReflectionQuestion;
  initialResponse: string;
  onSave: (response: string) => void;
  selectedPolicies: PolicyWithArea[];
  feedback?: string;
  isGeneratingFeedback?: boolean;
}

const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({
  question,
  initialResponse,
  onSave,
  selectedPolicies,
  feedback,
  isGeneratingFeedback
}) => {
  const [response, setResponse] = useState(initialResponse);
  const [isRecording, setIsRecording] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [audioVisualizerData, setAudioVisualizerData] = useState<number[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  
  // Check if speech recognition is supported
  const speechRecognitionSupported = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);
  
  // Initialize speech recognition
  useEffect(() => {
    if (speechRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setResponse(prev => prev + ' ' + transcript);
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    }
    
    return () => {
      stopRecording();
    };
  }, []);
  
  // Handle recording toggle
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Start recording
  const startRecording = async () => {
    if (!recognitionRef.current) return;
    
    try {
      // Start audio visualization
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;
      
      // Set up audio context for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Configure analyser
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Update visualization data
      const updateVisualization = () => {
        if (!isRecording) return;
        
        analyserRef.current!.getByteFrequencyData(dataArray);
        const normalizedData = Array.from(dataArray).map(val => val / 255);
        setAudioVisualizerData(normalizedData);
        
        requestAnimationFrame(updateVisualization);
      };
      
      updateVisualization();
      
      // Start speech recognition
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsRecording(false);
    setAudioVisualizerData([]);
  };
  
  // Handle save
  const handleSave = () => {
    onSave(response);
    setIsSaved(true);
    
    // Reset saved indicator after 2 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };
  
  return (
    <Card className="mb-6 overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          {question.question}
          <Badge variant="outline" className="ml-2 text-xs">
            {question.category}
          </Badge>
        </CardTitle>
        <CardDescription>
          Reflect on how your selected policies address this question
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your reflection here..."
          className="min-h-[120px] resize-y"
        />
        
        {isRecording && (
          <div className="mt-2">
            <VoiceVisualizer data={audioVisualizerData} />
          </div>
        )}
        
        {/* Add the feedback display here */}
        {feedback && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">AI Feedback</h4>
            <div className="bg-gray-50 p-3 rounded-md border-l-4 border-hope-turquoise text-sm">
              {feedback}
            </div>
          </div>
        )}

        {isGeneratingFeedback && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-policy-maroon"></div>
            Generating feedback...
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div>
          {speechRecognitionSupported ? (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRecording}
              className={isRecording ? "bg-red-100 text-red-800" : ""}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Record Voice
                </>
              )}
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <MicOff className="h-4 w-4 mr-2" />
              Voice Not Supported
            </Button>
          )}
        </div>
        
        <Button 
          onClick={handleSave}
          size="sm"
          className="bg-policy-maroon text-white hover:bg-opacity-90"
          disabled={!response.trim()}
        >
          {isSaved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Reflection
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReflectionPrompt;
