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
 * Detect emotions from text using Hume AI (server-side version)
 * @param text Text to analyze for emotions
 * @returns Detected emotion type
 */
export const detectEmotionWithHumeServer = async (text: string): Promise<EmotionType> => {
  try {
    // Call our Python server's emotion detection endpoint
    // Use IPv4 address explicitly to avoid IPv6 connection issues
    const humeResponse = await fetch('http://127.0.0.1:5001/api/emotion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text
      })
    });
    
    if (!humeResponse.ok) {
      console.error('Hume API error details:', await humeResponse.text());
      return 'Neutral';
    }
    
    const humeData = await humeResponse.json();
    
    // Log the full emotion data for debugging
    console.log('Hume server-side emotion data:', humeData);
    
    // Return the raw emotion from Hume
    return humeData.dominantEmotion;
  } catch (error) {
    console.error('Error detecting emotions with Hume:', error);
    return 'Neutral';
  }
};

/**
 * Generate a response from an AI agent based on their stance, selected policies, and conversation context
 * @param agentName Name of the agent
 * @param agentStance Political stance of the agent
 * @param selectedPolicies Array of selected policies
 * @param previousMessages Previous messages in the conversation for context (optional)
 * @param respondToUserId ID of the specific user message to respond to (optional)
 * @returns Object containing message and emotion
 */
export const generateAgentResponse = async (
  agentName: string,
  agentStance: AgentStance,
  selectedPolicies: PolicyWithArea[],
  previousMessages?: any[],
  respondToUserId?: string
): Promise<{ message: string; emotion: EmotionType }> => {
  // Determine sentiment based on policy selections and agent stance
  const sentiment = determineSentiment(selectedPolicies, agentStance);
  
  // Extract conversation context if available
  const conversationContext = previousMessages ? 
    extractConversationContext(previousMessages, respondToUserId) : '';
  
  try {
    // Generate response using Groq API
    const responseMessage = await generateGroqResponse({
      agentName,
      agentStance,
      selectedPolicies,
      sentiment,
      conversationContext,
      mustRespondToUser: !!respondToUserId
    });
    
    // Detect emotion from the generated response using Hume AI
    let emotion: EmotionType;
    try {
      // Always use Hume's real-time emotion detection
      emotion = await detectEmotionWithHumeServer(responseMessage);
    } catch (emotionError) {
      console.error('Error detecting emotion with Hume, using neutral as fallback:', emotionError);
      // Use neutral as fallback if Hume API fails
      emotion = 'neutral';
    }
    
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
        "Let's focus on policies that provide the most value for our limited resources."
      ],
      [AgentStance.PROGRESSIVE]: [
        "We should prioritize inclusive education that addresses the unique needs of refugee students.",
        "These policies need to be more ambitious in addressing systemic barriers to education.",
        "I believe we need to invest more in comprehensive support systems for refugee students."
      ],
      [AgentStance.MODERATE]: [
        "We need a balanced approach that addresses immediate needs while building long-term solutions.",
        "I see merit in some of these policies, but we should consider a more comprehensive strategy.",
        "Let's find common ground between fiscal responsibility and humanitarian obligations."
      ],
      [AgentStance.HUMANITARIAN]: [
        "The wellbeing of refugee children must be our primary concern in these policies.",
        "We need to ensure these policies address trauma and provide psychological support.",
        "Education is a human right, and our policies must reflect that fundamental principle."
      ]
    };
    
    // Select a random fallback response based on agent stance
    const fallbackOptions = fallbackResponses[agentStance] || fallbackResponses[AgentStance.MODERATE];
    const fallbackMessage = fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
    
    // Use neutral emotion for fallback
    return {
      message: fallbackMessage,
      emotion: 'neutral'
    };
  }
};

/**
 * Extract conversation context from previous messages
 * @param messages Array of previous messages
 * @param respondToUserId ID of the specific user message to respond to (optional)
 * @returns Formatted conversation context string
 */
export const extractConversationContext = (messages: any[], respondToUserId?: string): string => {
  if (!messages || messages.length === 0) {
    return '';
  }
  
  // If respondToUserId is provided, find the specific message and include it prominently
  let targetUserMessage = null;
  if (respondToUserId) {
    targetUserMessage = messages.find(msg => msg.id === respondToUserId);
  }
  
  // Format the conversation history
  const formattedMessages = messages.map(msg => {
    const role = msg.isUser ? 'Policy Advisor' : msg.sender;
    return `${role}: ${msg.content}`;
  }).join('\n');
  
  // Create the final context string
  let contextString = 'Previous conversation:\n' + formattedMessages;
  
  // If there's a specific user message to respond to, highlight it
  if (targetUserMessage) {
    contextString += '\n\nYou MUST respond directly to this message from the Policy Advisor:\n';
    contextString += `"${targetUserMessage.content}"`;
  }
  
  return contextString;
};
