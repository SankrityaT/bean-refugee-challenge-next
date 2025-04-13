import { NextRequest, NextResponse } from 'next/server';
import { ENHANCED_AI_AGENTS } from '@/lib/ai-negotiation/agent-engine';
import { AgentStance } from '@/types/agents';
import { mapPolicyToEmotion } from '@/lib/emotion-mapping';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { agentId, policies } = data;
    
    // Find the agent
    const agent = ENHANCED_AI_AGENTS.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Generate response based on policies
    const policyAreas = policies.map((p: any) => p.area);
    const policyTiers = policies.map((p: any) => p.tier);
    
    // Calculate average policy tier
    const avgTier = policyTiers.reduce((sum: number, tier: number) => sum + tier, 0) / policyTiers.length;
    
    // Determine sentiment based on agent stance and policy tiers
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    
    switch (agent.stance) {
      case AgentStance.NEOLIBERAL:
        // Neoliberals prefer lower tier (cost-effective) policies
        sentiment = avgTier < 2 ? 'positive' : avgTier > 2.5 ? 'negative' : 'neutral';
        break;
      case AgentStance.PROGRESSIVE:
        // Progressives prefer higher tier (transformative) policies
        sentiment = avgTier > 2.5 ? 'positive' : avgTier < 1.5 ? 'negative' : 'neutral';
        break;
      case AgentStance.MODERATE:
        // Moderates prefer balanced approaches
        sentiment = avgTier >= 1.8 && avgTier <= 2.2 ? 'positive' : 'neutral';
        break;
      case AgentStance.HUMANITARIAN:
        // Humanitarians strongly prefer higher tier policies
        sentiment = avgTier > 2 ? 'positive' : 'negative';
        break;
    }
    
    // Get response patterns for the sentiment
    const patterns = agent.responsePatterns[sentiment] || agent.responsePatterns.neutral;
    const message = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Determine emotion based on policies and agent stance
    const mainPolicy = policies[0] || { area: '', tier: 2 };
    const emotion = mapPolicyToEmotion({
      stance: agent.stance,
      policyTier: mainPolicy.tier,
      policyArea: mainPolicy.area
    });
    
    return NextResponse.json({
      agentId,
      message: message
        .replace('{POLICY_COUNT}', policies.length.toString())
        .replace('{POLICY_AREAS}', policyAreas.join(', '))
        .replace('{AGENT_CONCERN}', agent.concerns[0] || 'education'),
      emotion,
      sentiment
    });
  } catch (error) {
    console.error('Error in negotiation API:', error);
    return NextResponse.json(
      { error: 'Failed to process negotiation' },
      { status: 500 }
    );
  }
}