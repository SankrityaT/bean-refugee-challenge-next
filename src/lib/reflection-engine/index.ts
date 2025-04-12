import { PolicyOption } from '../../types/policies';
import { ReflectionQuestion, REFLECTION_QUESTIONS } from '../../data/reflection-questions';

interface ReflectionResult {
  questions: ReflectionQuestion[];
  equityScore: number;
}

/**
 * Generates reflection questions based on policy selections
 */
export const generateReflection = (selections: PolicyOption[]): ReflectionResult => {
  // Calculate equity score based on policy impact
  const equityScore = calculateEquityScore(selections);
  
  // Get questions based on policy selections
  const questions = getRelevantQuestions(selections);
  
  return {
    questions,
    equityScore
  };
};

/**
 * Calculates an equity score based on UNESCO guidelines
 * Higher scores indicate more inclusive and transformative policies
 */
const calculateEquityScore = (selections: PolicyOption[]): number => {
  // Map impact to score values
  const impactScores = {
    'Exclusionary': 1,
    'Moderate Inclusion': 3,
    'Transformative': 5
  };
  
  // Calculate average score
  const totalScore = selections.reduce((sum, policy) => {
    return sum + impactScores[policy.impact];
  }, 0);
  
  return Math.round((totalScore / selections.length) * 10) / 10; // Round to 1 decimal place
};

/**
 * Selects relevant reflection questions based on policy choices
 */
const getRelevantQuestions = (selections: PolicyOption[]): ReflectionQuestion[] => {
  // For now, return all questions
  // In a more advanced implementation, we could filter or prioritize questions
  // based on the specific policies selected
  return REFLECTION_QUESTIONS;
};