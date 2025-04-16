import { NextResponse } from 'next/server';
import { generateGroqResponse } from '@/lib/ai-negotiation/groq-integration';
import { AgentStance } from '@/types/agents';
import { SentimentType } from '@/lib/ai-negotiation/shared-types';

export async function POST(request: Request) {
  try {
    const { questionText, userResponse, selectedPolicies } = await request.json();
    
    // Format policies for the prompt
    const policiesText = selectedPolicies.map(policy => {
      return `- ${policy.title} (${policy.area}): ${policy.description} [Tier ${policy.tier}, Impact: ${policy.impact}]`;
    }).join('\n');
    
    // Create parameters for the Groq API call
    // We'll use a neutral "Reflection Advisor" as the agent
    const params = {
      agentName: "Reflection Advisor",
      agentStance: AgentStance.MODERATE, // Using a moderate stance for balanced feedback
      selectedPolicies: selectedPolicies,
      sentiment: 'neutral' as SentimentType, // Explicitly cast to SentimentType
      conversationContext: `
        Question: "${questionText}"
        
        User's Response: "${userResponse}"
        
        Selected Policies:
        ${policiesText}
        
        Please provide a brief, constructive feedback on the user's reflection (2-3 sentences).
        Focus on how their reflection relates to the policies they chose and principles of educational equity.
        Be encouraging but also suggest ways they could deepen their analysis.
      `,
      temperature: 0.7,
      max_tokens: 150
    };
    
    // Use your existing Groq integration to generate the feedback
    const feedback = await generateGroqResponse(params);
    
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error generating reflection feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}