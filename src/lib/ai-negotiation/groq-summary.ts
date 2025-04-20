import { NegotiationLog } from '@/context/GameContext';
import { generateGroqResponse } from './groq-integration';
import { AgentStance } from '@/types/agents';

// Generate a summary of the negotiation using Groq
export async function generateNegotiationSummary(negotiationLogs: NegotiationLog[]): Promise<string> {
  // Sort logs by timestamp to ensure chronological order
  const sortedLogs = [...negotiationLogs].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Format the conversation as a transcript for the AI
  const transcript = sortedLogs.map(log => {
    const speaker = log.isUser ? 'Policy Advisor' : (log.agent || 'Stakeholder');
    return `${speaker}: ${log.content}`;
  }).join('\n\n');
  
  const prompt = `
You are an expert policy analyst. Below is a transcript of a negotiation between a Policy Advisor and various stakeholders regarding refugee education policies.

Please provide a comprehensive summary of the discussion, highlighting:
1. The key points made by each stakeholder
2. Areas of agreement and disagreement
3. The main concerns raised
4. Any compromises or solutions proposed

Format the summary as a cohesive narrative that captures the essence of the negotiation. Focus on the substantive policy discussions rather than procedural aspects.

TRANSCRIPT:
${transcript}

SUMMARY:
`;

  try {
    // Update the parameters to match GroqRequestParams type
    const response = await generateGroqResponse({
      agentName: "PolicyAnalyst",
      agentStance: AgentStance.MODERATE, // Using proper enum value
      selectedPolicies: [],
      sentiment: "neutral",
      conversationContext: prompt,
      temperature: 0.3,
      max_tokens: 1000
    });
    
    return response;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw new Error('Failed to generate summary with Groq');
  }
}