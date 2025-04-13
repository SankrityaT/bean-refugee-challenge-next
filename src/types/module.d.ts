// Type declarations for custom modules

declare module '*/groq-integration' {
  import { AgentStance } from '@/types/agents';
  import { PolicyWithArea, SentimentType } from '../lib/ai-negotiation/agent-engine';
  
  export interface GroqRequestParams {
    agentName: string;
    agentStance: AgentStance;
    selectedPolicies: PolicyWithArea[];
    sentiment: SentimentType;
  }
  
  export function generateGroqResponse(params: GroqRequestParams): Promise<string>;
}
