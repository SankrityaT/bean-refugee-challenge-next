import { AgentStance } from '@/types/agents';
import { PolicyWithArea, SentimentType, GroqRequestParams } from './shared-types';

/**
 * Generates a response using the Groq API based on agent, policies, and sentiment
 * @param params Object containing agent details, selected policies, and sentiment
 * @returns Generated response text
 */
export const generateGroqResponse = async (params: GroqRequestParams): Promise<string> => {
  const { 
    agentName, 
    agentStance, 
    selectedPolicies, 
    sentiment, 
    conversationContext = '',
    mustRespondToUser = false,
    temperature = 0.7,
    max_tokens = 500,
    policyAreaContext // New parameter
  } = params;
  
  // Create a prompt for the Groq API
  const prompt = createGroqPrompt(agentName, agentStance, selectedPolicies, sentiment, conversationContext, mustRespondToUser);
  
  try {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      console.warn('Groq API key is not configured');
      return "";
    }
    
    // Make API request to Groq - using the correct endpoint
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Using Llama 3 model
        messages: [
          {
            role: 'system',
            content: 'You are an AI agent in a refugee policy simulation game. Your response should be in first person, as if you are the character speaking directly to the player.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: params.max_tokens || 250,
        temperature: params.temperature || 0.7,
        top_p: 0.9 // Adding top_p for better response quality
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Groq API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = `Groq API error: ${errorData.error?.message || response.statusText}`;
      } catch (e) {
        // If parsing fails, use the raw error text
        errorMessage += ` - ${errorText.substring(0, 100)}`;
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return ""; // Return empty string on error, caller should handle this
  }
};

/**
 * Creates a prompt for the Groq API based on agent details, policies, and conversation context
 * @param agentName Name of the agent
 * @param agentStance Political stance of the agent
 * @param selectedPolicies Array of selected policies
 * @param sentiment Determined sentiment (positive, neutral, negative)
 * @param conversationContext Previous conversation context (optional)
 * @param mustRespondToUser Whether the agent must respond to the user (optional)
 * @returns Formatted prompt string
 */
const createGroqPrompt = (
  agentName: string,
  agentStance: AgentStance,
  selectedPolicies: PolicyWithArea[],
  sentiment: SentimentType,
  conversationContext?: string,
  mustRespondToUser?: boolean
): string => {
  // Get agent personality based on stance
  const agentPersonality = getAgentPersonality(agentStance);
  
  // Format selected policies for the prompt
  const policiesText = selectedPolicies.map(policy => {
    return `- ${policy.title} (${policy.area}): ${policy.description} [Tier ${policy.tier}]`;
  }).join('\n');
  
  // Determine if this is a financial policy or not
  const isFinancialPolicy = selectedPolicies.some(policy => 
    policy.area.toLowerCase().includes('financial') || 
    policy.title.toLowerCase().includes('financial') ||
    policy.title.toLowerCase().includes('finance') ||
    policy.area.toLowerCase().includes('finance')
  );
  
  // Extract the last user message if available
  let lastUserMessage = "";
  let userMessageSection = "";
  let userTitle = "Policy Advisor"; // Default title
  
  if (conversationContext) {
    const contextLines = conversationContext.split('\n');
    // Find the most recent user message
    for (let i = contextLines.length - 1; i >= 0; i--) {
      if (contextLines[i].includes(': ') && !contextLines[i].startsWith('Minister Santos:') && 
          !contextLines[i].startsWith('Dr. Chen:') && !contextLines[i].startsWith('Mayor Okonjo:') && 
          !contextLines[i].startsWith('Community Leader Patel:')) {
        // Extract user title and message
        const parts = contextLines[i].split(': ');
        if (parts.length >= 2) {
          userTitle = parts[0].split(' (')[0]; // Remove emotion part if present
          lastUserMessage = parts.slice(1).join(': '); // Rejoin in case message contains colons
          break;
        }
      }
    }
    
    if (lastUserMessage) {
      userMessageSection = `
      The ${userTitle} has just said: "${lastUserMessage}"
      
      You should directly address the ${userTitle} in your response, addressing their points or questions while expressing your own perspective based on your personality and stance.
      `;
    }
  }
  
  // Add conversation context if available
  const contextSection = conversationContext ? `
    Recent conversation history:
    ${conversationContext}
  ` : '';
  
  // Add policy-specific focus guidance based on whether it's a financial policy
  const policyFocusGuidance = isFinancialPolicy ? 
    `As this is a financial policy, you may discuss budgetary implications, cost-effectiveness, and economic impacts.` : 
    `As this is NOT a financial policy, focus on the educational, social, and humanitarian aspects of the policy rather than financial considerations. Avoid discussing costs, budgets, or financial implications unless directly asked.`;
  
  // Combine all elements into a comprehensive prompt
  return `
    You are ${agentName}, a stakeholder in the Republic of Bean refugee education policy simulation.
    
    Your personality: ${agentPersonality}
    
    Your political stance: ${agentStance}
    
    You are reviewing the following education policies that have been selected:
    ${policiesText}
    
    Based on your political stance and personality, you feel ${sentiment} about these policies.
    
    ${policyFocusGuidance}
    
    ${contextSection}
    
    ${userMessageSection}
    
    ${mustRespondToUser ? 'You must respond directly to the user\'s last comment.' : ''}
    
    Please respond as ${agentName} with your thoughts on these policy selections and directly address what the user has said. Your response should be 2-3 sentences, conversational in tone, and reflect your stance and sentiment.
    
    Important guidelines:
    1. Respond directly to the user's last comment if there is one
    2. Express your opinion on the policies based on your stance
    3. Do not mention your political stance directly
    4. Speak naturally as the character would in a real conversation
    5. Show your personality through your word choice and tone
    6. If the user asked a question, answer it from your character's perspective
    7. If the user expressed an opinion that conflicts with yours, politely disagree and explain why
    ${!isFinancialPolicy ? '8. For this non-financial policy, focus on educational, social, and humanitarian aspects rather than costs or budgets' : ''}
  `;
};

/**
 * Returns a personality description based on agent stance
 * @param stance Political stance of the agent
 * @returns Personality description
 */
const getAgentPersonality = (stance: AgentStance): string => {
  switch (stance) {
    case AgentStance.NEOLIBERAL:
      return 'You prioritize economic efficiency and fiscal responsibility. You prefer market-based solutions and are concerned about the long-term financial sustainability of policies.';
    case AgentStance.PROGRESSIVE:
      return 'You advocate for social justice and equity. You believe in comprehensive support systems and are willing to invest significant resources to ensure equal opportunities for all.';
    case AgentStance.MODERATE:
      return 'You seek balanced approaches that consider multiple perspectives. You value pragmatic solutions that address immediate needs while being mindful of constraints.';
    case AgentStance.HUMANITARIAN:
      return 'You prioritize human welfare above all else. You believe in the moral obligation to provide comprehensive support to vulnerable populations regardless of cost.';
    default:
      return 'You are a thoughtful stakeholder with balanced views on refugee education policy.';
  }
};
