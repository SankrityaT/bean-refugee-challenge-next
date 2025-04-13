import { AgentStance } from '@/types/agents';

// Map policy characteristics to agent emotions
interface PolicyEmotionInput {
  stance: AgentStance;
  policyTier: number;
  policyArea: string;
}

// Get emotion based on policy and agent stance
export const mapPolicyToEmotion = (
  input: PolicyEmotionInput
): 'neutral' | 'anger' | 'compassion' | 'frustration' | 'enthusiasm' | 'concern' => {
  const { stance, policyTier, policyArea } = input;
  
  // Check if policy area aligns with agent concerns
  const isAreaOfConcern = (area: string): boolean => {
    const lowerArea = area.toLowerCase();
    
    switch (stance) {
      case AgentStance.NEOLIBERAL:
        return lowerArea.includes('economic') || 
               lowerArea.includes('cost') || 
               lowerArea.includes('efficiency');
      case AgentStance.PROGRESSIVE:
        return lowerArea.includes('equity') || 
               lowerArea.includes('inclusion') || 
               lowerArea.includes('access');
      case AgentStance.MODERATE:
        return lowerArea.includes('balance') || 
               lowerArea.includes('integration') || 
               lowerArea.includes('community');
      case AgentStance.HUMANITARIAN:
        return lowerArea.includes('wellbeing') || 
               lowerArea.includes('support') || 
               lowerArea.includes('trauma');
      default:
        return false;
    }
  };
  
  // Determine emotion based on stance and policy tier
  switch (stance) {
    case AgentStance.NEOLIBERAL:
      // Neoliberals prefer lower tier (cost-effective) policies
      if (policyTier === 1) {
        return isAreaOfConcern(policyArea) ? 'enthusiasm' : 'neutral';
      } else if (policyTier === 3) {
        return isAreaOfConcern(policyArea) ? 'frustration' : 'concern';
      }
      return 'neutral';
      
    case AgentStance.PROGRESSIVE:
      // Progressives prefer higher tier (transformative) policies
      if (policyTier === 3) {
        return isAreaOfConcern(policyArea) ? 'enthusiasm' : 'neutral';
      } else if (policyTier === 1) {
        return isAreaOfConcern(policyArea) ? 'frustration' : 'concern';
      }
      return 'neutral';
      
    case AgentStance.MODERATE:
      // Moderates prefer balanced approaches
      if (policyTier === 2) {
        return 'neutral';
      } else if (policyTier === 1 || policyTier === 3) {
        return isAreaOfConcern(policyArea) ? 'concern' : 'neutral';
      }
      return 'neutral';
      
    case AgentStance.HUMANITARIAN:
      // Humanitarians strongly prefer higher tier policies
      if (policyTier === 3) {
        return isAreaOfConcern(policyArea) ? 'enthusiasm' : 'compassion';
      } else if (policyTier === 1) {
        return isAreaOfConcern(policyArea) ? 'anger' : 'frustration';
      }
      return 'concern';
      
    default:
      return 'neutral';
  }
};

// Get voice characteristics based on emotion
export const getVoiceCharacteristics = (
  emotion: 'neutral' | 'anger' | 'compassion' | 'frustration' | 'enthusiasm' | 'concern'
): { rate: number; pitch: number; volume: number } => {
  // Default voice options
  const defaultOptions = {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  };
  
  // Adjust voice characteristics based on emotion
  switch (emotion) {
    case 'anger':
      return {
        rate: 1.3,
        pitch: 1.2,
        volume: 1.0
      };
    case 'compassion':
      return {
        rate: 0.9,
        pitch: 0.9,
        volume: 0.8
      };
    case 'frustration':
      return {
        rate: 1.1,
        pitch: 1.1,
        volume: 0.9
      };
    case 'enthusiasm':
      return {
        rate: 1.2,
        pitch: 1.1,
        volume: 1.0
      };
    case 'concern':
      return {
        rate: 0.95,
        pitch: 0.95,
        volume: 0.9
      };
    case 'neutral':
    default:
      return defaultOptions;
  }
};