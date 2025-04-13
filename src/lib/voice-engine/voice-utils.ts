/**
 * Speech recognition utilities for capturing user input during negotiations
 */

// Interface for speech recognition result handlers
interface SpeechRecognitionHandlers {
  onResult?: (transcript: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

// Add type declarations for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
  prototype: SpeechRecognition;
}

interface Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

// Global speech recognition instance
let recognition: SpeechRecognition | null = null;

/**
 * Initialize the speech recognition system
 * Uses the Web Speech API if available
 */
const initSpeechRecognition = (): boolean => {
  // Check if browser supports speech recognition
  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognitionClass) {
    console.error('Speech recognition not supported in this browser');
    return false;
  }
  
  if (!recognition) {
    recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
  }
  
  return true;
};

/**
 * Start speech recognition to capture user input
 * @param handlers Object containing callback handlers for recognition events
 * @returns Boolean indicating if recognition started successfully
 */
export const startSpeechRecognition = (handlers: SpeechRecognitionHandlers): boolean => {
  if (!initSpeechRecognition()) {
    if (handlers.onError) handlers.onError('Speech recognition not supported');
    return false;
  }
  
  try {
    // Set up event handlers
    recognition.onstart = () => {
      if (handlers.onStart) handlers.onStart();
    };
    
    recognition.onend = () => {
      if (handlers.onEnd) handlers.onEnd();
    };
    
    recognition.onerror = (event: any) => {
      if (handlers.onError) handlers.onError(event.error);
    };
    
    recognition.onresult = (event: any) => {
      if (handlers.onResult) {
        // Get the most recent result
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ');
        
        handlers.onResult(transcript);
      }
    };
    
    // Start recognition
    recognition.start();
    return true;
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    if (handlers.onError) handlers.onError(error);
    return false;
  }
};

/**
 * Stop the speech recognition process
 */
export const stopSpeechRecognition = (): void => {
  if (recognition) {
    try {
      recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }
};

/**
 * Map user speech input to relevant policy concerns
 * @param transcript The speech transcript to analyze
 * @param concerns Array of possible concerns to match against
 * @returns Array of matched concerns
 */
export const mapSpeechToConcerns = (transcript: string, concerns: string[]): string[] => {
  const lowercaseTranscript = transcript.toLowerCase();
  
  // Find concerns mentioned in the transcript
  return concerns.filter(concern => {
    const lowercaseConcern = concern.toLowerCase();
    return lowercaseTranscript.includes(lowercaseConcern);
  });
};

/**
 * Check if speech recognition is supported in the current browser
 * @returns Boolean indicating if speech recognition is supported
 */
export const isSpeechRecognitionSupported = (): boolean => {
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
};
