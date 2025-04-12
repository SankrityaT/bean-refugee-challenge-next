import { PolicyOption } from '@/types/policies';
import { validateSelections } from '../budget-engine';

export type GamePhase = 'policy' | 'negotiation' | 'reflection';

export interface PhaseGate {
  unlockCondition: (data: any) => boolean;
  errorMessage: string;
}

export const PHASE_GATES: Record<GamePhase, PhaseGate> = {
  policy: {
    unlockCondition: () => true, // Always unlocked as it's the starting phase
    errorMessage: ''
  },
  negotiation: {
    unlockCondition: (selections: PolicyOption[]) => {
      const validation = validateSelections(selections);
      return validation.isValid;
    },
    errorMessage: 'You must select valid policies before proceeding to negotiation'
  },
  reflection: {
    unlockCondition: (negotiationLogs: any[]) => negotiationLogs.length >= 4,
    errorMessage: 'You must complete at least 4 stakeholder negotiations before reflection'
  }
};

export const usePhaseManager = () => {
  const canProceedToPhase = (
    currentPhase: GamePhase, 
    targetPhase: GamePhase, 
    data: any
  ): { canProceed: boolean; message: string } => {
    // If moving backward or staying on same phase, always allow
    if (
      (currentPhase === 'negotiation' && targetPhase === 'policy') ||
      (currentPhase === 'reflection' && (targetPhase === 'policy' || targetPhase === 'negotiation')) ||
      currentPhase === targetPhase
    ) {
      return { canProceed: true, message: '' };
    }
    
    // Check if the target phase's gate condition is met
    const gate = PHASE_GATES[targetPhase];
    const canProceed = gate.unlockCondition(data);
    
    return {
      canProceed,
      message: canProceed ? '' : gate.errorMessage
    };
  };
  
  return { canProceedToPhase };
};