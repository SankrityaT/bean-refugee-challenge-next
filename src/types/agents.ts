
export enum AgentStance {
  NEOLIBERAL = 'NEOLIBERAL',
  PROGRESSIVE = 'PROGRESSIVE',
  MODERATE = 'MODERATE',
  HUMANITARIAN = 'HUMANITARIAN'
}

export interface AIAgentProps {
  name: string;
  stance: AgentStance;
  role: string;
  age: number;
  concerns: string[];
  onInteract: () => void;
}

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
