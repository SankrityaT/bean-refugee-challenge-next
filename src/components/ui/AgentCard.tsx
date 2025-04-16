import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PolicyWithArea } from '@/lib/ai-negotiation/shared-types';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    role: string;
    stance: string;
    concerns: string;
  };
  policies: PolicyWithArea[];
  isActive: boolean;
  onInteract: () => void;
  interactionCount: number;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  policies,
  isActive,
  onInteract,
  interactionCount
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getStanceColor = (stance: string) => {
    switch(stance) {
      case 'NEOLIBERAL':
        return 'bg-blue-100 text-blue-800';
      case 'PROGRESSIVE':
        return 'bg-green-100 text-green-800';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'HUMANITARIAN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`transition-all ${isActive ? 'border-policy-maroon' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-policy-maroon text-white">
                {getInitials(agent.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <p className="text-sm text-gray-600">{agent.role}</p>
            </div>
          </div>
          <Badge className={getStanceColor(agent.stance)}>
            {agent.stance.charAt(0) + agent.stance.slice(1).toLowerCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">
          <span className="font-semibold">Concerns:</span> {agent.concerns}
        </p>
        {interactionCount > 0 && (
          <Badge variant="outline" className="mt-2">
            Consulted {interactionCount} {interactionCount === 1 ? 'time' : 'times'}
          </Badge>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onInteract}
          className="w-full bg-policy-maroon hover:bg-policy-maroon/90"
          disabled={isActive}
        >
          {isActive ? 'Currently Consulting' : interactionCount > 0 ? 'Consult Again' : 'Consult Stakeholder'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgentCard;