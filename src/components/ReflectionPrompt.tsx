
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
  onSave?: (response: string) => void;
}

const ReflectionPrompt: React.FC<ReflectionPromptProps> = ({ 
  question,
  category,
  onSave
}) => {
  const [response, setResponse] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [recordingEmotion, setRecordingEmotion] = useState<'neutral' | 'enthusiasm' | 'concern'>('neutral');
  
  // Reference to the speech recognition object
  const recognitionRef = useRef<any>(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }
  
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  
    recognition.onstart = () => {
      setIsRecording(true);
      console.log('Recording started');
    };
  
    recognition.onend = () => {
      setIsRecording(false);
      console.log('Recording ended');
    };
  
    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript;
      
      if (lastResult.isFinal) {
        setResponse(prev => prev + ' ' + transcript);
      } else {
        setTranscription(transcript);
      }
  
      // Emotion analysis
      analyzeSentiment(transcript);
    };
  
    recognition.onerror = (event) => {
      console.error('Recognition error:', event.error);
      setIsRecording(false);
    };
  
    recognitionRef.current = recognition;
  
    return () => {
      recognition.stop();
    };
  }, []);
  
  const analyzeSentiment = (text: string) => {
    const lowerText = text.toLowerCase();
    if (/excit|happy|great|wonderful/i.test(lowerText)) {
      setRecordingEmotion('enthusiasm');
    } else if (/worr|concern|problem|issue/i.test(lowerText)) {
      setRecordingEmotion('concern');
    } else {
      setRecordingEmotion('neutral');
    }
  };
  
  const startRecording = () => {
    setIsRecording(true);
    setTranscription('');
    
    if (recognitionRef.current) {
      recognitionRef.current.start();
    } else {
      // Fallback for browsers without speech recognition
      console.log('Speech recognition not supported in this browser');
    }
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Update the response with the transcription
    if (transcription) {
      setResponse(transcription);
    }
  };
  
  const handleSave = () => {
    setIsSubmitted(true);
    if (onSave) {
      onSave(response);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{question}</CardTitle>
            <CardDescription>Reflect on your policy choices</CardDescription>
          </div>
          <Badge variant="outline" className="bg-reflection-yellow bg-opacity-20">
            {category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {isRecording && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Recording in progress...</p>
            <VoiceVisualizer 
              isActive={true} 
              emotion={recordingEmotion} 
              intensity="medium" 
            />
            <p className="text-sm italic mt-2">{transcription || "Speak now..."}</p>
          </div>
        )}
        
        <Textarea
          placeholder="Type or record your reflection here..."
          className="min-h-[120px]"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={isSubmitted}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <div>
          {!isRecording ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={startRecording}
              disabled={isSubmitted}
            >
              <Mic className="h-4 w-4 mr-2" />
              Record Voice
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={stopRecording}
              className="text-red-500 border-red-500"
            >
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={!response.trim() || isSubmitted}
          size="sm"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitted ? "Saved" : "Save Reflection"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReflectionPrompt;
