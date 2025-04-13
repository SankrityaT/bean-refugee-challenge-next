
// Agent types and interfaces for the AI negotiation system

// Political stances for AI agents
// Agent stances
export enum AgentStance {
  NEOLIBERAL = 'NEOLIBERAL',
  PROGRESSIVE = 'PROGRESSIVE',
  MODERATE = 'MODERATE',
  HUMANITARIAN = 'HUMANITARIAN'
}

// Emotion mapping
export interface EmotionMapping {
  neutral: string;
  anger: string;
  compassion: string;
  frustration: string;
  enthusiasm: string;
  concern: string;
}

// AI agent interface
export interface AIAgent {
  id: string;
  name: string;
  role: string;
  age: number;
  stance: AgentStance;
  concerns: string[];
  responsePatterns: {
    positive: string[];
    neutral: string[];
    negative: string[];
  };
}

// AI agent props for component
export interface AIAgentProps {
  id: string;
  name: string;
  role: string;
  age: number;
  stance: AgentStance;
  concerns: string[];
  onInteract: () => void;
}

// Enhanced AI agent with additional negotiation properties
export interface EnhancedAIAgent extends AIAgent {
  negotiationStyle: 'collaborative' | 'competitive' | 'compromising' | 'accommodating' | 'avoiding';
  concessionThreshold: number; // 0-100, higher means less likely to concede
  priorityIssues: string[]; // Issues the agent cares most about
  dealBreakers: string[]; // Issues the agent won't compromise on
}
