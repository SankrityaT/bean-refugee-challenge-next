import { useState, useCallback } from 'react';

interface ReflectionQuestion {
  id: string;
  question: string;
  category: string;
}

interface SavedReflection {
  id: string;
  questionId: string;
  text: string;
  timestamp: string;
}

export const useReflection = (initialQuestions: ReflectionQuestion[] = []) => {
  const [questions] = useState<ReflectionQuestion[]>(initialQuestions);
  const [savedReflections, setSavedReflections] = useState<SavedReflection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Save a reflection
  const saveReflection = useCallback(async (questionId: string, reflectionText: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionId,
          reflectionText
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save reflection');
      }
      
      const data = await response.json();
      
      setSavedReflections(prev => [...prev, data]);
      setIsLoading(false);
      
      return data;
    } catch (error) {
      console.error('Error saving reflection:', error);
      setError('Failed to save reflection. Please try again.');
      setIsLoading(false);
      return null;
    }
  }, []);
  
  // Get saved reflections for a question
  const getReflection = useCallback(async (questionId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/reflection?questionId=${questionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get reflection');
      }
      
      const data = await response.json();
      
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error('Error getting reflection:', error);
      setError('Failed to get reflection. Please try again.');
      setIsLoading(false);
      return null;
    }
  }, []);
  
  return {
    questions,
    savedReflections,
    isLoading,
    error,
    saveReflection,
    getReflection
  };
};