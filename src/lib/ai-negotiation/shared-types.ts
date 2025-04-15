import { AgentStance } from '@/types/agents';

// Shared types used by both agent-engine.ts and groq-integration.ts
export interface PolicyWithArea {
  id: string;
  title: string;
  description: string;
  impact: string;
  tier: number;
  area: string;
}

export type EmotionType = 'neutral' | 'anger' | 'compassion' | 'frustration' | 'enthusiasm' | 'concern';
export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface GroqRequestParams {
  agentName: string;
  agentStance: AgentStance;
  selectedPolicies: PolicyWithArea[];
  sentiment: SentimentType;
  conversationContext?: string;
  mustRespondToUser?: boolean;
}
