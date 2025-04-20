import { NextResponse } from 'next/server';
import { generateGroqResponse } from '@/lib/ai-negotiation/groq-integration';
import { AgentStance } from '@/types/agents';
import { SentimentType } from '@/lib/ai-negotiation/shared-types';

// Function to analyze the quality of a user's reflection response
const analyzeResponseQuality = (response: string): { isQualityResponse: boolean; reason?: string } => {
  // Trim and convert to lowercase for analysis
  const text = response.trim().toLowerCase();
  
  // Check for minimum length (too short responses are likely low quality)
  if (text.length < 20) {
    return { isQualityResponse: false, reason: 'too short' };
  }
  
  // Check for nonsensical or random character strings
  // Enhanced regex to better detect nonsensical input
  const nonsenseRegex = /^[a-z]{1,2}[a-z\s]{10,}$/;
  if (nonsenseRegex.test(text) && !/\s/.test(text.substring(0, 15))) {
    return { isQualityResponse: false, reason: 'random characters' };
  }
  
  // Check for gibberish or nonsensical text (random characters, repeated words)
  const words = text.split(/\s+/);
  
  // Check for repeated words (like "hello hello hello")
  const wordCounts = words.reduce((acc: Record<string, number>, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});
  
  // If any word is repeated more than 3 times and makes up more than 40% of the content
  for (const word of Object.keys(wordCounts)) {
    if (wordCounts[word] > 3 && wordCounts[word] >= words.length * 0.4) {
      return { isQualityResponse: false, reason: 'nonsensical' };
    }
  }
  
  // Check for gibberish (random characters mixed with real words)
  const gibberishRegex = /[a-z]{7,}|[a-z]{1,2}[a-z]{5,}/;
  const commonWords = [
    'about', 'after', 'again', 'all', 'also', 'always', 'and', 'any', 'are', 'because',
    'been', 'before', 'being', 'between', 'both', 'but', 'came', 'can', 'come', 'could',
    'did', 'does', 'doing', 'done', 'during', 'each', 'even', 'every', 'from', 'get',
    'getting', 'give', 'goes', 'going', 'had', 'has', 'have', 'having', 'her', 'here',
    'hers', 'herself', 'him', 'himself', 'his', 'how', 'however', 'into', 'its', 'itself',
    'just', 'like', 'made', 'make', 'making', 'many', 'might', 'more', 'most', 'much',
    'must', 'myself', 'never', 'now', 'often', 'only', 'other', 'others', 'our', 'ours',
    'ourselves', 'out', 'over', 'own', 'said', 'same', 'see', 'seeing', 'seen', 'she',
    'should', 'since', 'some', 'still', 'such', 'take', 'taken', 'taking', 'than', 'that',
    'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
    'this', 'those', 'through', 'thus', 'together', 'too', 'under', 'until', 'upon', 'used',
    'using', 'very', 'was', 'were', 'what', 'when', 'where', 'which', 'while', 'who',
    'whom', 'whose', 'why', 'will', 'with', 'within', 'without', 'would', 'your', 'yours',
    'yourself', 'yourselves'
  ];
  const gibberishWords = words.filter(word => gibberishRegex.test(word) && !commonWords.includes(word));
  if (gibberishWords.length >= words.length * 0.3) {
    return { isQualityResponse: false, reason: 'nonsensical' };
  }
  
  // Check for repetitive patterns (e.g., "blah blah blah")
  const repetitiveWords = ['blah', 'yeah', 'hmm', 'umm', 'like', 'uh', 'uhh'];
  
  // Check if any repetitive words make up more than 30% of the content
  for (const repetitiveWord of repetitiveWords) {
    if (wordCounts[repetitiveWord] && wordCounts[repetitiveWord] >= words.length * 0.3) {
      return { isQualityResponse: false, reason: 'repetitive content' };
    }
  }
  
  // Check for grammatical structure (basic check for sentence structure)
  // A quality response typically has at least one complete sentence
  const hasSentenceStructure = /[a-z].*[.!?]\s*[A-Z]/.test(response) || /[a-z].*[.!?]$/.test(response);
  if (!hasSentenceStructure && words.length < 10) {
    return { isQualityResponse: false, reason: 'incomplete sentences' };
  }
  
  // Check for meaningless filler content
  const fillerPhrases = ['i dont know', 'not sure', 'whatever', 'idk', 'who cares'];
  if (fillerPhrases.some(phrase => text.includes(phrase)) && words.length < 15) {
    return { isQualityResponse: false, reason: 'filler content' };
  }
  
  // If passed all checks, consider it a quality response
  return { isQualityResponse: true };
};

export async function POST(request: Request) {
  console.log('Reflection feedback API endpoint called');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { questionText, userResponse, selectedPolicies } = body;
    
    if (!questionText || !userResponse) {
      console.error('Missing required fields in request');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Analyze the quality of the user's response
    const qualityAnalysis = analyzeResponseQuality(userResponse);
    console.log('Quality analysis:', qualityAnalysis);
    
    // Create appropriate feedback based on quality analysis
    let feedback;
    
    // Check if API key is available - if not, use fallback feedback
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      console.warn('Groq API key is not configured, using fallback feedback');
      feedback = getFallbackFeedback(qualityAnalysis, questionText, userResponse);
    } else {
      try {
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
          conversationContext: qualityAnalysis.isQualityResponse 
            ? `
              Question: "${questionText}"
              
              User's Response: "${userResponse}"
              
              Selected Policies:
              ${policiesText}
              
              Please provide a brief, constructive feedback on the user's reflection (2-3 sentences).
              Focus on how their reflection relates to the policies they chose and principles of educational equity.
              Be encouraging but also suggest ways they could deepen their analysis.
              Acknowledge any ethical dilemmas they've identified and build upon them.
              Evaluate their reflection in terms of inclusion, long-term impact, and alignment with justice.
              Keep your tone pedagogically sound - educational and growth-oriented.
            `
            : `
              Question: "${questionText}"
              
              User's Response: "${userResponse}"
              
              The user has provided a response that appears to be ${qualityAnalysis.reason || 'low quality'}.
              
              Instead of providing positive or misleading praise, give constructive feedback that:
              1. Acknowledges that their reflection needs more development
              2. Encourages them to provide a more thoughtful, clear response
              3. Offers a specific suggestion related to the question about how they might approach their reflection
              4. Maintains a supportive, educational tone
              
              Do NOT praise the response or pretend it was adequate. Be honest but kind.
            `,
          temperature: qualityAnalysis.isQualityResponse ? 0.7 : 0.5, // Lower temperature for more predictable responses to low-quality input
          max_tokens: 150
        };
        
        // Use your existing Groq integration to generate the feedback
        console.log('Calling Groq API with params:', { ...params, conversationContext: '(truncated)' });
        feedback = await generateGroqResponse(params);
        console.log('Received feedback from Groq API:', feedback);
      } catch (apiError) {
        console.error('Error calling Groq API:', apiError);
        // If API call fails, use fallback feedback
        feedback = getFallbackFeedback(qualityAnalysis, questionText, userResponse);
      }
    }
    
    // Return the feedback
    return NextResponse.json({ feedback, qualityAnalysis });
  } catch (error) {
    console.error('Error generating reflection feedback:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate feedback',
        feedback: "I'm having trouble analyzing your reflection right now. Please try again later."
      },
      { status: 500 }
    );
  }
}

// Function to generate fallback feedback when API is not available
function getFallbackFeedback(qualityAnalysis: { isQualityResponse: boolean; reason?: string }, questionText: string, userResponse: string): string {
  if (!qualityAnalysis.isQualityResponse) {
    // Provide constructive feedback for low-quality responses
    switch(qualityAnalysis.reason) {
      case 'too short':
        return "Your response is quite brief. Consider expanding on your thoughts and connecting them to the implications of your policy choices.";
      case 'random characters':
        return "I notice your response contains unusual text. Please provide a thoughtful reflection on the ethical dimensions of your policy decisions.";
      case 'repetitive content':
        return "Your response seems to repeat similar points. Try to explore different ethical perspectives and consider various stakeholders affected by your policies.";
      case 'incomplete sentences':
        return "Your reflection contains incomplete thoughts. Try to fully articulate your ideas and connect them to principles of justice and equity.";
      case 'filler content':
        return "Your response could be more substantive. Consider the long-term impacts of your policies and how they align with principles of fairness and inclusion.";
      case 'nonsensical':
        return "Your response appears to be nonsensical. Please provide a clear and thoughtful reflection on the ethical dimensions of your policy decisions.";
      default:
        return "I'd encourage you to develop your reflection further. Consider how your policies impact different communities and whether they promote equitable outcomes.";
    }
  }
  
  // For quality responses, provide general positive feedback with suggestions for deeper thinking
  return "Thank you for your thoughtful reflection. Your insights show consideration of the ethical dimensions at play. Consider how your policy choices might impact different stakeholders in both the short and long term, and how principles of equity and justice are reflected in your approach.";
}