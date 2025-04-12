
export type AgentStance = 'neoliberal' | 'socialist' | 'liberal' | 'moderate' | 'conservative';

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  age: number;
  stance: AgentStance;
  concerns: string;
  educationalLevel?: string;
  socioeconomicStatus?: string;
}
