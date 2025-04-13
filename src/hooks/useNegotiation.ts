import { useState, useCallback } from 'react';
import { AIAgent } from '@/types/agents';

interface Policy {
  id: string;
  tier: number;
  area: string;
  title: string;
}

interface NegotiationState {
  selectedPolicies: Policy[];
  currentAgent: string | null;
  agentResponses: Record<string, { message: string; emotion: string }>;
  isNegotiating: boolean;
  round: number;
  isComplete: boolean;
}

export const useNegotiation = (agents: AIAgent[]) => {
  const [state, setState] = useState<NegotiationState>({
    selectedPolicies: [],
    currentAgent: null,
    agentResponses: {},
    isNegotiating: false,
    round: 1,
    isComplete: false
  });
  
  // Select policies for negotiation
  const selectPolicies = useCallback((policies: Policy[]) => {
    setState(prev => ({
      ...prev,
      selectedPolicies: policies
    }));
  }, []);
  
  // Start negotiation with a specific agent
  const startNegotiation = useCallback((agentId: string) => {
    setState(prev => ({
      ...prev,
      currentAgent: agentId,
      isNegotiating: true
    }));
  }, []);
  
  // Get agent response
  const getAgentResponse = useCallback(async (agentId: string) => {
    try {
      const response = await fetch('/api/negotiation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId,
          policies: state.selectedPolicies
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get agent response');
      }
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        agentResponses: {
          ...prev.agentResponses,
          [agentId]: {
            message: data.message,
            emotion: data.emotion
          }
        }
      }));
      
      return data;
    } catch (error) {
      console.error('Error getting agent response:', error);
      return null;
    }
  }, [state.selectedPolicies]);
  
  // End current negotiation
  const endNegotiation = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentAgent: null,
      isNegotiating: false,
      round: prev.round + 1
    }));
  }, []);
  
  // Complete the negotiation process
  const completeNegotiation = useCallback(() => {
    setState(prev => ({
      ...prev,
      isComplete: true,
      isNegotiating: false,
      currentAgent: null
    }));
  }, []);
  
  return {
    state,
    selectPolicies,
    startNegotiation,
    getAgentResponse,
    endNegotiation,
    completeNegotiation
  };
};