import { AgentStance } from '@/types/agents';
import { PolicyWithArea, EmotionType, SentimentType, GroqRequestParams } from './shared-types';
import { generateGroqResponse } from './groq-integration';

/**
 * Maps policy tiers and agent stances to determine sentiment
 * @param selectedPolicies Array of selected policies with their tiers
 * @param stance The political stance of the agent
 * @returns Sentiment (positive, neutral, or negative)
 */
export const determineSentiment = (selectedPolicies: PolicyWithArea[], stance: AgentStance): SentimentType => {
  // Calculate average tier of selected policies
  const avgTier = selectedPolicies.reduce((sum, p) => sum + p.tier, 0) / selectedPolicies.length;
  
  let sentiment: SentimentType = 'neutral';
  
  switch (stance) {
    case AgentStance.NEOLIBERAL:
      // Neoliberals prefer lower tier (cost-effective) policies
      sentiment = avgTier < 2 ? 'positive' : avgTier > 2.5 ? 'negative' : 'neutral';
      break;
    case AgentStance.PROGRESSIVE:
      // Progressives prefer higher tier (more comprehensive) policies
      sentiment = avgTier > 2.5 ? 'positive' : avgTier < 1.5 ? 'negative' : 'neutral';
      break;
    case AgentStance.MODERATE:
      // Moderates prefer balanced approaches (middle tier)
      sentiment = avgTier > 1.7 && avgTier < 2.3 ? 'positive' : 'neutral';
      break;
    case AgentStance.HUMANITARIAN:
      // Humanitarians strongly prefer higher tier policies
      sentiment = avgTier > 2.3 ? 'positive' : avgTier < 2 ? 'negative' : 'neutral';
      break;
    default:
      sentiment = 'neutral';
  }
  
  return sentiment;
};

/**
 * Maps sentiment to emotion for voice synthesis
 * @param sentiment The determined sentiment
 * @param stance The political stance of the agent
 * @returns Emotion for voice synthesis
 */
export const mapSentimentToEmotion = (sentiment: SentimentType, stance: AgentStance): EmotionType => {
  // Default emotion mapping based on sentiment and stance
  const emotionMap = {
    [AgentStance.NEOLIBERAL]: {
      positive: 'enthusiasm',
      neutral: 'neutral',
      negative: 'frustration'
    },
    [AgentStance.PROGRESSIVE]: {
      positive: 'enthusiasm',
      neutral: 'compassion',
      negative: 'concern'
    },
    [AgentStance.MODERATE]: {
      positive: 'neutral',
      neutral: 'neutral',
      negative: 'concern'
    },
    [AgentStance.HUMANITARIAN]: {
      positive: 'compassion',
      neutral: 'concern',
      negative: 'frustration'
    }
  };
  
  return emotionMap[stance]?.[sentiment] as EmotionType || 'neutral';
};

/**
 * Generate a response from an AI agent based on their stance, selected policies, and conversation context
 * @param agentName Name of the agent
 * @param agentStance Political stance of the agent
 * @param selectedPolicies Array of selected policies
 * @param previousMessages Previous messages in the conversation for context (optional)
 * @returns Object containing message and emotion
 */
export const generateAgentResponse = async (
  agentName: string,
  agentStance: AgentStance,
  selectedPolicies: PolicyWithArea[],
  previousMessages?: any[]
): Promise<{ message: string; emotion: EmotionType }> => {
  // Determine sentiment based on policy selections and agent stance
  const sentiment = determineSentiment(selectedPolicies, agentStance);
  const emotion = mapSentimentToEmotion(sentiment, agentStance);
  
  // Extract conversation context if available
  const conversationContext = previousMessages ? extractConversationContext(previousMessages) : '';
  
  try {
    // Generate response using Groq API
    const responseMessage = await generateGroqResponse({
      agentName,
      agentStance,
      selectedPolicies,
      sentiment,
      conversationContext
    });
    
    return {
      message: responseMessage,
      emotion
    };
  } catch (error) {
    console.error('Error generating response:', error);
    
    // Fallback responses if API fails
    const fallbackResponses = {
      [AgentStance.NEOLIBERAL]: [
        "I'm concerned about the economic implications of these policies. We need to consider cost-effectiveness.",
        "While I understand the humanitarian aspect, we must ensure fiscal responsibility in our approach.",
        "These policies may put strain on our already limited resources. We should prioritize sustainable solutions."
      ],
      [AgentStance.PROGRESSIVE]: [
        "These policies don't go far enough to address the systemic inequalities refugees face in education.",
        "We need to center refugee voices and experiences in our policy decisions.",
        "I'd like to see more emphasis on cultural inclusion and anti-racist pedagogy in these selections."
      ],
      [AgentStance.MODERATE]: [
        "We need to balance humanitarian needs with practical implementation concerns.",
        "There are some good ideas here, but I wonder about the timeline and resource allocation.",
        "I appreciate the thoughtfulness of these selections, though we may need to adjust some details."
      ],
      [AgentStance.HUMANITARIAN]: [
        "The wellbeing of refugee children must be our top priority in every policy decision.",
        "These policies should focus more on trauma-informed approaches and healing-centered engagement.",
        "I want to ensure that every refugee child feels welcomed, supported, and valued in our education system."
      ]
    };
    
    const responses = fallbackResponses[agentStance] || fallbackResponses[AgentStance.MODERATE];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      message: randomResponse,
      emotion
    };
  }
};

/**
 * Extract conversation context from previous messages
 * @param messages Array of previous messages
 * @returns Formatted conversation context string
 */
const extractConversationContext = (messages: any[]): string => {
  if (!messages || messages.length === 0) return '';
  
  // Format the last few messages (up to 5) for context
  const contextMessages = messages.slice(-5);
  
  return contextMessages.map(msg => {
    const sender = msg.isUser ? 'User' : msg.sender;
    return `${sender}: ${msg.content}`;
  }).join('\n');
};
