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

// Extended interface to include our custom properties
interface ExtendedSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  manualStop?: boolean; // Custom property to track manual stopping
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
  onerror: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionConstructor {
  new(): ExtendedSpeechRecognition;
  prototype: ExtendedSpeechRecognition;
}

interface Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

// Global speech recognition instance
let recognition: ExtendedSpeechRecognition | null = null;

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
  
  try {
    if (!recognition) {
      recognition = new SpeechRecognitionClass();
      recognition.continuous = true; 
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
    }
    return true;
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    return false;
  }
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
    // Clean up any existing recognition instance
    if (recognition) {
      try {
        recognition.abort();
      } catch (e) {
        // Ignore abort errors
      }
    }
    
    // Re-initialize to get a fresh instance
    if (!initSpeechRecognition()) {
      if (handlers.onError) handlers.onError('Failed to initialize speech recognition');
      return false;
    }
    
    // Set up event handlers
    recognition.onstart = () => {
      console.log('Speech recognition started');
      if (handlers.onStart) handlers.onStart();
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
      
      // Restart recognition to keep it going until user manually stops
      try {
        // Only restart if we're not intentionally stopping
        if (recognition && !recognition.manualStop) {
          console.log('Restarting speech recognition');
          recognition.start();
        } else {
          if (handlers.onEnd) handlers.onEnd();
        }
      } catch (e) {
        console.error('Error restarting speech recognition:', e);
        if (handlers.onEnd) handlers.onEnd();
      }
    };
    
    recognition.onerror = (event: any) => {
      // Handle specific error types
      let errorMessage = event.error || 'Unknown error';
      
      // Provide more user-friendly error messages
      if (errorMessage === 'network') {
        errorMessage = 'Network error: Please check your internet connection and try again';
        console.warn('Speech recognition network error - this often happens when the browser cannot connect to the recognition service');
      } else if (errorMessage === 'not-allowed') {
        errorMessage = 'Microphone access denied: Please allow microphone access in your browser settings';
      } else if (errorMessage === 'aborted') {
        errorMessage = 'Speech recognition was aborted';
      } else if (errorMessage === 'audio-capture') {
        errorMessage = 'No microphone detected: Please connect a microphone and try again';
      } else if (errorMessage === 'no-speech') {
        errorMessage = 'No speech detected: Please speak more clearly or check your microphone';
      }
      
      console.error('Speech recognition error:', errorMessage);
      
      if (handlers.onError) handlers.onError(errorMessage);
    };
    
    recognition.onresult = (event: any) => {
      if (handlers.onResult && event.results && event.results.length > 0) {
        // Get the most recent result
        const result = event.results[event.resultIndex];
        
        if (result && result[0]) {
          const transcript = result[0].transcript;
          console.log('Speech recognition result:', transcript);
          handlers.onResult(transcript);
        }
      }
    };
    
    // Add a flag to track if we're manually stopping
    recognition.manualStop = false;
    
    // Start recognition
    recognition.start();
    
    return true;
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    if (handlers.onError) handlers.onError(String(error));
    return false;
  }
};

/**
 * Stop the speech recognition process
 */
export const stopSpeechRecognition = (): void => {
  if (recognition) {
    try {
      // Set flag to indicate we're manually stopping
      recognition.manualStop = true;
      
      recognition.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      
      // If stop fails, try to abort
      try {
        recognition.abort();
      } catch (abortError) {
        console.error('Error aborting speech recognition:', abortError);
      }
      
      // Reset the recognition instance
      recognition = null;
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
