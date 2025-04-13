'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Users, MessageSquare } from "lucide-react";
import AIAgent from './AIAgent';
import { useNegotiation } from '@/hooks/useNegotiation';
import { AI_AGENTS } from '@/lib/ai-negotiation/agent-engine';
import { PolicyArea } from '@/types/policies';

interface NegotiationPanelProps {
  selectedPolicies: PolicyArea[];
  onComplete: (outcome: any) => void;
}

const NegotiationPanel: React.FC<NegotiationPanelProps> = ({ 
  selectedPolicies,
  onComplete
}) => {
  const [activeAgentIndex, setActiveAgentIndex] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [negotiationOutcome, setNegotiationOutcome] = useState<Record<string, string>>({});
  
  const { 
    state, 
    selectPolicies, 
    startNegotiation, 
    getAgentResponse, 
    endNegotiation, 
    completeNegotiation 
  } = useNegotiation(AI_AGENTS);
  
  // Initialize negotiation with selected policies
  useEffect(() => {
    selectPolicies(selectedPolicies.map(policy => ({ ...policy, tier: 1, area: policy.id })));
  }, [selectedPolicies, selectPolicies]);
  
  // Handle agent interaction
  const handleAgentInteract = async (agentId: string, index: number) => {
    setActiveAgentIndex(index);
    startNegotiation(agentId);
    
    // Get agent response
    const response = await getAgentResponse(agentId);
    
    // Store response in negotiation outcome
    if (response) {
      setNegotiationOutcome(prev => ({
        ...prev,
        [agentId]: response.message
      }));
    }
  };
  
  // Handle completion of current agent interaction
  const handleAgentComplete = () => {
    endNegotiation();
    setActiveAgentIndex(null);
    
    // Check if all agents have been consulted
    const allAgentsConsulted = AI_AGENTS.every(agent => 
      negotiationOutcome[agent.id] !== undefined
    );
    
    if (allAgentsConsulted) {
      setShowSummary(true);
    }
  };
  
  // Complete the negotiation process
  const handleComplete = () => {
    completeNegotiation();
    onComplete({
      selectedPolicies,
      agentResponses: negotiationOutcome,
      round
    });
  };
  
  // Start a new round of negotiation
  const handleNextRound = () => {
    setRound(prev => prev + 1);
    setShowSummary(false);
    setNegotiationOutcome({});
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Stakeholder Negotiation
          </CardTitle>
          <CardDescription>
            Round {round}: Discuss your selected policies with key stakeholders
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Selected Policies:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedPolicies.map((policy) => (
                <Badge key={policy.id} variant="outline" className="bg-gray-100">
                  {policy.title}
                </Badge>
              ))}
            </div>
          </div>
          
          {showSummary ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Negotiation Summary</h3>
              <p className="text-sm text-gray-600">
                You've consulted with all stakeholders. Here's a summary of their perspectives:
              </p>
              
              {AI_AGENTS.map((agent) => (
                <div key={agent.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{agent.name}:</p>
                  <p className="text-sm">{negotiationOutcome[agent.id] || "No response recorded"}</p>
                </div>
              ))}
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleNextRound}>
                  Start New Round
                </Button>
                <Button onClick={handleComplete}>
                  Complete Negotiation
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AI_AGENTS.map((agent, index) => (
                <div 
                  key={agent.id} 
                  className={activeAgentIndex !== null && activeAgentIndex !== index ? "opacity-50" : ""}
                >
                  <AIAgent
                    id={agent.id}
                    name={agent.name}
                    role={agent.role}
                    age={agent.age}
                    stance={agent.stance}
                    concerns={agent.concerns}
                    onInteract={() => {
                      if (activeAgentIndex === null || activeAgentIndex === index) {
                        handleAgentInteract(agent.id, index);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
        
        {activeAgentIndex !== null && !showSummary && (
          <CardFooter className="justify-end">
            <Button 
              variant="outline" 
              onClick={handleAgentComplete}
              className="flex items-center"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Continue Negotiation
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default NegotiationPanel;