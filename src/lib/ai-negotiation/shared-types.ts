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

export type EmotionType = string;
export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface GroqRequestParams {
  agentName: string;
  agentStance: AgentStance;
  selectedPolicies: PolicyWithArea[];
  sentiment: SentimentType;
  conversationContext?: string;
  mustRespondToUser?: boolean;
  temperature?: number;
  max_tokens?: number;
}
