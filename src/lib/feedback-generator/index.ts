import { PolicyWithArea } from '@/lib/ai-negotiation/shared-types';
import { ReflectionData } from '@/lib/reflection-engine';
import { policyInteractions, ethicalDilemmas, transformativeSuggestions } from './feedback-data';

/**
 * Generates personalized, justice-oriented feedback on the user's policy choices
 * @param policies Selected policy options
 * @param reflectionData The reflection data including equity score
 * @returns AI-generated feedback text
 */
export const generatePolicyFeedback = async (
  policies: PolicyWithArea[],
  reflectionData: ReflectionData
): Promise<string> => {
  // Format policies for the prompt
  const policiesText = policies.map(policy => {
    return `- ${policy.title} (${policy.area}): ${policy.description} [Tier ${policy.tier}, Impact: ${policy.impact}]`;
  }).join('\n');
  
  // Identify policy combinations and tensions
  const policyIds = policies.map(p => p.id);
  const policyAreas = Array.from(new Set(policies.map(p => p.area)));
  
  // Find relevant policy interactions
  const relevantInteractions = policyInteractions
    .filter(interaction => 
      interaction.policies.every(id => policyIds.includes(id)) || 
      interaction.areas.some(area => policyAreas.includes(area))
    )
    .map(interaction => interaction.description)
    .slice(0, 3)
    .join('\n');
    
  // Find relevant ethical dilemmas
  const relevantDilemmas = ethicalDilemmas
    .filter(dilemma => 
      dilemma.relevantAreas.some(area => policyAreas.includes(area)) ||
      dilemma.relevantPolicies.some(id => policyIds.includes(id))
    )
    .map(dilemma => dilemma.description)
    .slice(0, 2)
    .join('\n');
    
  // Find transformative suggestions
  const relevantSuggestions = transformativeSuggestions
    .filter(suggestion => 
      suggestion.forAreas.some(area => policyAreas.includes(area)) ||
      (suggestion.forEquityScore && reflectionData.equityScore <= suggestion.forEquityScore)
    )
    .map(suggestion => suggestion.description)
    .slice(0, 2)
    .join('\n');

  // Create an enhanced prompt for the Groq API
  const prompt = `
You are an educational policy expert with a focus on refugee education and social justice. 
You're providing feedback on a policy package created by a participant in a simulation game about refugee education policy.

The participant has selected the following policies:
${policiesText}

Their policy package received an equity score of ${reflectionData.equityScore}/5 based on UNESCO inclusion metrics.

I've identified some specific policy interactions in their choices:
${relevantInteractions || "No specific interactions identified."}

I've also identified these potential ethical tensions:
${relevantDilemmas || "No specific ethical dilemmas identified."}

Please provide a 4-5 paragraph analysis of their policy choices that:
1. Evaluates the overall coherence and justice-orientation of their policy package
2. Discusses the specific policy interactions and tensions noted above
3. Analyzes long-term implications for refugee inclusion and educational equity
4. Offers these concrete transformative suggestions:
${relevantSuggestions || "Suggestions for more transformative approaches."}

Your feedback must be personalized to their specific policy choices, educational in tone, and grounded in principles of social justice and refugee rights. Reference specific policies by name and discuss their interactions. Avoid generic responses.
`;

  try {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      return "Policy analysis unavailable. Please contact the administrator to configure the feedback system.";
    }
    
    // Make API request to Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an educational policy expert specializing in refugee education and social justice. Your feedback should be deeply personalized, ethics-focused, and provide concrete examples and actionable suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating policy feedback:', error);
    return "We couldn't generate personalized feedback at this time. Please try again later.";
  }
};