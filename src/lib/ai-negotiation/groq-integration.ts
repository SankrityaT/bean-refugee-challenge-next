'use client';

import { AIAgent } from '@/types/agents';
import { PolicyWithArea } from '@/types/policies';
import { detectEmotion } from '@/lib/voice-engine/voice-utils';
import { ChatGroq } from '@langchain/groq';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

// Groq API configuration
interface GroqConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

// Standard model to use across all Groq integrations
const STANDARD_GROQ_MODEL = 'llama3-70b-8192';

// Default configuration
const defaultConfig: GroqConfig = {
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
  baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
  model: STANDARD_GROQ_MODEL
};

// Check if API key is available and provide a helpful error message
const isGroqApiKeyAvailable = (): boolean => {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  return typeof apiKey === 'string' && apiKey.length > 0;
};

// Generate response using Groq
export const generateGroqResponse = async (
  agent: AIAgent,
  policies: PolicyWithArea[],
  sentiment: 'positive' | 'neutral' | 'negative',
  config: Partial<GroqConfig> = {}
): Promise<{ message: string; emotion: string }> => {
  // Merge with default config
  const fullConfig: GroqConfig = {
    ...defaultConfig,
    ...config
  };
  
  if (!isGroqApiKeyAvailable()) {
    throw new Error('Groq API key is not available. Please set the NEXT_PUBLIC_GROQ_API_KEY environment variable.');
  }
  
  try {
    // Create policy description
    const policyDescription = policies.map(p => 
      `${p.title} (Tier ${p.tier}) in the area of ${p.area}`
    ).join(', ');
    
    // Create agent description
    const agentDescription = `
      Name: ${agent.name}
      Role: ${agent.role}
      Age: ${agent.age}
      Political stance: ${agent.stance}
      Main concerns: ${agent.concerns.join(', ')}
      Current sentiment: ${sentiment}
    `;
    
    // Create prompt
    const prompt = `
      You are ${agent.name}, a ${agent.role} with a ${agent.stance.toLowerCase()} political stance.
      You are ${agent.age} years old and your main concerns are: ${agent.concerns.join(', ')}.
      
      You are reviewing the following policies:
      ${policyDescription}
      
      Based on your political stance and concerns, your sentiment towards these policies is: ${sentiment}.
      
      Please provide a response that:
      1. Expresses your opinion on these policies
      2. Reflects your ${sentiment} sentiment
      3. Mentions at least one of your concerns
      4. Is written in first person
      5. Is between 2-4 sentences
      6. Conveys an appropriate emotion (neutral, anger, compassion, frustration, enthusiasm, or concern)
      
      Format your response as a JSON object with two fields:
      {
        "message": "Your response here",
        "emotion": "one of: neutral, anger, compassion, frustration, enthusiasm, concern"
      }
    `;
    
    // Make API request
    const response = await fetch(fullConfig.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fullConfig.apiKey}`
      },
      body: JSON.stringify({
        model: fullConfig.model,
        messages: [
          {
            role: 'system',
            content: agentDescription
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });
    
    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    try {
      // First try to extract JSON if it's wrapped in markdown code blocks
      let jsonContent = content;
      const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1];
      }
      
      // Now try to parse the JSON
      const parsedResponse = JSON.parse(jsonContent);
      
      // Validate the response has the required fields
      if (!parsedResponse.message || !parsedResponse.emotion) {
        throw new Error('Invalid response format: missing required fields');
      }
      
      // Validate the emotion is one of the expected values
      const validEmotions = ['neutral', 'anger', 'compassion', 'frustration', 'enthusiasm', 'concern'];
      if (!validEmotions.includes(parsedResponse.emotion)) {
        parsedResponse.emotion = 'neutral';
      }
      
      return {
        message: parsedResponse.message,
        emotion: parsedResponse.emotion
      };
    } catch (error) {
      console.warn('Failed to parse Groq response as JSON:', error);
      // If JSON parsing fails, extract message and detect emotion
      const message = content.replace(/```json|```/g, '').trim();
      const emotion = detectEmotion(message);
      return { message, emotion };
    }
  } catch (error) {
    console.error('Error generating Groq response:', error);
    throw error;
  }
};


export class GroqAgent {
  private model: ChatGroq;
  private context: string;

  constructor(agentId: string, role: string, stance: string) {
    this.model = new ChatGroq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
      model: STANDARD_GROQ_MODEL, // Using standard Groq model
    });

    this.context = `You are ${role} with a ${stance} stance. 
    Respond to policy proposals considering this perspective.`;
  }

  async generateResponse(policies: any[]): Promise<string> {
    const messages = [
      new SystemMessage(this.context),
      new HumanMessage(`Consider these policies: ${JSON.stringify(policies)}
        How do you respond to these proposals based on your role and stance?`)
    ];

    const response = await this.model.call(messages);
    return response.content as string;
  }
}