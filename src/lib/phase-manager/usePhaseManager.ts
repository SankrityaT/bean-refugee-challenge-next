import { useState } from 'react';
import { validateSelections } from '../budget-engine';
import { PolicyOption } from '@/types/policies';

export type GamePhase = 'policy' | 'negotiation' | 'reflection';

interface PhaseTransitionResult {
  canProceed: boolean;
  message: string;
}

export const usePhaseManager = () => {
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('policy');
  
  const canProceedToPhase = (
    fromPhase: GamePhase, 
    toPhase: GamePhase, 
    data: any
  ): PhaseTransitionResult => {
    // Going backwards is always allowed
    if (getPhaseIndex(fromPhase) > getPhaseIndex(toPhase)) {
      return { canProceed: true, message: '' };
    }
    
    // Check specific phase transition requirements
    if (fromPhase === 'policy' && toPhase === 'negotiation') {
      // Validate policy selections
      const validation = validateSelections(data as PolicyOption[]);
      if (!validation.isValid) {
        return { 
          canProceed: false, 
          message: 'You must select valid policies before proceeding to negotiation. ' + 
                   validation.warnings.join('. ')
        };
      }
    }
    
    if (fromPhase === 'negotiation' && toPhase === 'reflection') {
      // Check if enough stakeholder interactions occurred
      const negotiationLogs = data as any[];
      if (negotiationLogs.length < 4) {
        return {
          canProceed: false,
          message: 'You must interact with at least 4 stakeholders before proceeding to reflection.'
        };
      }
    }
    
    return { canProceed: true, message: '' };
  };
  
  const proceedToPhase = (phase: GamePhase, data: any): PhaseTransitionResult => {
    const result = canProceedToPhase(currentPhase, phase, data);
    if (result.canProceed) {
      setCurrentPhase(phase);
    }
    return result;
  };
  
  const getPhaseIndex = (phase: GamePhase): number => {
    const phases: GamePhase[] = ['policy', 'negotiation', 'reflection'];
    return phases.indexOf(phase);
  };
  
  return {
    currentPhase,
    canProceedToPhase,
    proceedToPhase,
    getPhaseIndex
  };
};