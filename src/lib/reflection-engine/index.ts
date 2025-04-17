import { PolicyOption } from '@/types/policies';
import { ReflectionQuestion, REFLECTION_QUESTIONS } from '@/data/reflection-questions';

export interface ReflectionData {
  equityScore: number;
  questions: ReflectionQuestion[];
  responses: Record<string, string>;
}

/**
 * Generates reflection data based on selected policies
 * @param selectedPolicies Array of selected policy options
 * @returns ReflectionData object with equity score and reflection questions
 */
export const generateReflection = (selectedPolicies: PolicyOption[]): ReflectionData => {
  // Calculate equity score based on selected policies
  // This is a simplified scoring mechanism that could be enhanced
  const equityScore = calculateEquityScore(selectedPolicies);
  
  // Return reflection data with questions and empty responses
  return {
    equityScore,
    questions: REFLECTION_QUESTIONS,
    responses: {}
  };
};

/**
 * Calculates an equity score based on the selected policies
 * Higher tiers and more diverse policy areas contribute to a higher score
 * @param selectedPolicies Array of selected policy options
 * @returns Equity score between 0-5
 */
const calculateEquityScore = (selectedPolicies: PolicyOption[]): number => {
  if (!selectedPolicies || selectedPolicies.length === 0) {
    return 0;
  }
  
  // Count unique policy areas
  const uniqueAreas = new Set(selectedPolicies.map(policy => policy.area)).size;
  
  // Calculate average tier level (1-3)
  const avgTier = selectedPolicies.reduce((sum, policy) => sum + (policy.tier || 1), 0) / selectedPolicies.length;
  
  // Calculate raw score based on diversity and tier level
  // More diverse policy areas and higher tiers result in higher scores
  const rawScore = (uniqueAreas / 7) * 2.5 + (avgTier / 3) * 2.5;
  
  // Normalize to 0-5 scale and round to one decimal place
  return Math.min(5, Math.max(0, Math.round(rawScore * 10) / 10));
};

/**
 * Saves a reflection response for a specific question
 * @param reflectionData Current reflection data
 * @param questionId ID of the question being answered
 * @param response User's reflection response
 * @returns Updated reflection data with the new response
 */
export const saveReflectionResponse = (
  reflectionData: ReflectionData,
  questionId: string,
  response: string
): ReflectionData => {
  return {
    ...reflectionData,
    responses: {
      ...reflectionData.responses,
      [questionId]: response
    }
  };
};

/**
 * Exports reflection data to a downloadable format (e.g., JSON)
 * @param reflectionData Reflection data to export
 * @returns Blob URL for downloading the reflection data
 */
export const exportReflectionData = (reflectionData: ReflectionData): string => {
  const dataStr = JSON.stringify(reflectionData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  return URL.createObjectURL(dataBlob);
};
