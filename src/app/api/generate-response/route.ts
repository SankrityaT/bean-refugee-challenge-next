import { NextRequest, NextResponse } from 'next/server';
import { generateAgentResponse } from '@/lib/ai-negotiation/agent-engine';
import { AgentStance } from '@/types/agents';
import { PolicyWithArea } from '@/lib/ai-negotiation/shared-types';

export async function POST(request: NextRequest) {
  try {
    const { agentName, agentStance, selectedPolicies, previousMessages, respondToUserId } = await request.json();
    
    // Validate required parameters
    if (!agentName || !agentStance || !selectedPolicies) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Generate response using the agent engine
    const response = await generateAgentResponse(
      agentName,
      agentStance as AgentStance,
      selectedPolicies as PolicyWithArea[],
      previousMessages, // Pass conversation context
      respondToUserId // Pass the ID of the user message to respond to
    );
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating agent response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
