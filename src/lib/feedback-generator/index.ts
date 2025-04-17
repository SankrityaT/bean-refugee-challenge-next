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
  const prompt = `You are an educational policy expert focusing on refugee education and social justice. Provide a VERY CONCISE analysis of this policy package. Selected policies: ${policiesText} Equity score: ${reflectionData.equityScore}/5

In your response, format it as follows WITHOUT using bullet points or list markers:

STRENGTHS: [Key strengths of the policy package in relation to equity and inclusion]

CONCERNS: [Areas where the policy package falls short or could improve for better equity]

RECOMMENDATIONS: [1-2 specific recommendations for strengthening the policy package]

Keep your entire analysis under 250 words total, with concise, direct language. Do not use bullet points or list markers.`;

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
            content: 'You are an educational policy expert providing extremely concise, actionable feedback. Keep your response under 250 words total.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 350
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