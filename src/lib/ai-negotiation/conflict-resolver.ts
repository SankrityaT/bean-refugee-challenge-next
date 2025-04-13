import { AIAgent, AgentStance } from '@/types/agents';
import { PolicyArea } from '@/types/policies';

// Types for conflict resolution
interface ConflictData {
  agents: AIAgent[];
  policies: PolicyArea[];
  round: number;
  agentResponses: Record<string, { message: string; emotion: string; sentiment: string }>;
}

interface CompromiseProposal {
  description: string;
  proposedBy: string;
  acceptableToAgents: string[];
  policyAdjustments: {
    policyId: string;
    adjustment: string;
  }[];
}

// Detect conflicts between agents
export const detectConflicts = (data: ConflictData): { 
  hasConflict: boolean; 
  conflictingAgents: string[];
  conflictingPolicies: string[];
} => {
  const { agents, policies, agentResponses } = data;
  
  // Count negative sentiments per policy
  const policyConflicts: Record<string, string[]> = {};
  
  // Initialize policy conflicts
  policies.forEach(policy => {
    policyConflicts[policy.id] = [];
  });
  
  // Identify agents with negative sentiments
  const negativeAgents: string[] = [];
  
  agents.forEach(agent => {
    const response = agentResponses[agent.id];
    
    if (response && response.sentiment === 'negative') {
      negativeAgents.push(agent.id);
      
      // Associate agent with all policies (in a real implementation, this would be more specific)
      policies.forEach(policy => {
        policyConflicts[policy.id].push(agent.id);
      });
    }
  });
  
  // Find policies with the most conflicts
  const conflictingPolicies = Object.entries(policyConflicts)
    .filter(([_, conflictingAgents]) => conflictingAgents.length > 0)
    .map(([policyId]) => policyId);
  
  return {
    hasConflict: negativeAgents.length > 0,
    conflictingAgents: negativeAgents,
    conflictingPolicies
  };
};

// Generate compromise proposals
export const generateCompromises = (
  data: ConflictData,
  conflicts: ReturnType<typeof detectConflicts>
): CompromiseProposal[] => {
  const { agents, policies } = data;
  const { conflictingAgents, conflictingPolicies } = conflicts;
  
  if (!conflicts.hasConflict) {
    return [];
  }
  
  const proposals: CompromiseProposal[] = [];
  
  // Find moderate agents to propose compromises
  const moderateAgents = agents.filter(agent => 
    agent.stance === AgentStance.MODERATE && 
    !conflictingAgents.includes(agent.id)
  );
  
  // If no moderate agents, use the first non-conflicting agent
  const proposingAgents = moderateAgents.length > 0 
    ? moderateAgents 
    : agents.filter(agent => !conflictingAgents.includes(agent.id));
  
  if (proposingAgents.length === 0) {
    // If all agents are in conflict, use the first agent
    proposingAgents.push(agents[0]);
  }
  
  // Generate a compromise proposal
  const proposingAgent = proposingAgents[0];
  
  // Find conflicting policies
  const conflictPolicies = policies.filter(policy => 
    conflictingPolicies.includes(policy.id)
  );
  
  if (conflictPolicies.length === 0) {
    return [];
  }
  
  // Generate policy adjustments
  const policyAdjustments = conflictPolicies.map(policy => {
    // In a real implementation, this would be more sophisticated
    return {
      policyId: policy.id,
      adjustment: `Adjust funding allocation for ${policy.title} to address concerns`
    };
  });
  
  // Create compromise proposal
  proposals.push({
    description: `${proposingAgent.name} proposes a compromise on ${conflictPolicies.map(p => p.title).join(', ')}`,
    proposedBy: proposingAgent.id,
    acceptableToAgents: agents
      .filter(agent => !conflictingAgents.includes(agent.id))
      .map(agent => agent.id),
    policyAdjustments
  });
  
  return proposals;
};

// Apply compromise to policies
export const applyCompromise = (
  policies: PolicyArea[],
  compromise: CompromiseProposal
): PolicyArea[] => {
  // In a real implementation, this would actually modify the policies
  // For now, we'll just return the original policies
  return policies;
};