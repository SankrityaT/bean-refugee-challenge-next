import { AIAgent, AgentStance } from '@/types/agents';
import { PolicyWithArea } from '@/types/policies';
import { mapPolicyToEmotion } from '@/lib/emotion-mapping';

// Define AI agents
export const AI_AGENTS: AIAgent[] = [
  {
    id: 'minister-santos',
    name: 'Minister Santos',
    role: 'Education Minister',
    age: 52,
    stance: AgentStance.NEOLIBERAL,
    concerns: ['Budget constraints', 'Educational standards', 'Efficiency'],
    responsePatterns: {
      positive: [
        "I support these policies for {POLICY_AREAS}. They represent a fiscally responsible approach.",
        "These {POLICY_COUNT} policies align with our goal of efficient resource allocation.",
        "I'm pleased with this cost-effective approach to {AGENT_CONCERN}."
      ],
      neutral: [
        "I have mixed feelings about these policies for {POLICY_AREAS}. We need to consider the fiscal implications.",
        "These {POLICY_COUNT} policies have potential, but I'm concerned about their cost-effectiveness.",
        "I'm neither opposed nor enthusiastic about this approach to {AGENT_CONCERN}. We need more data on outcomes."
      ],
      negative: [
        "I cannot support these policies for {POLICY_AREAS}. They're fiscally irresponsible.",
        "These {POLICY_COUNT} policies don't align with our budget constraints.",
        "I'm concerned about this approach to {AGENT_CONCERN}. It lacks efficiency and cost-effectiveness."
      ]
    }
  },
  {
    id: 'dr-chen',
    name: 'Dr. Chen',
    role: 'Education Researcher',
    age: 45,
    stance: AgentStance.PROGRESSIVE,
    concerns: ['Educational equity', 'Inclusive practices', 'Systemic barriers'],
    responsePatterns: {
      positive: [
        "I strongly support these policies for {POLICY_AREAS}. They address systemic barriers in education.",
        "These {POLICY_COUNT} policies represent a transformative approach to educational equity.",
        "I'm enthusiastic about this approach to {AGENT_CONCERN}. It centers the needs of marginalized students."
      ],
      neutral: [
        "I see potential in these policies for {POLICY_AREAS}, but they don't go far enough in addressing root causes.",
        "These {POLICY_COUNT} policies are a start, but we need more transformative approaches.",
        "I have reservations about this approach to {AGENT_CONCERN}. It doesn't fully address systemic inequities."
      ],
      negative: [
        "I must oppose these policies for {POLICY_AREAS}. They perpetuate existing inequities.",
        "These {POLICY_COUNT} policies fail to address the systemic barriers facing refugee students.",
        "I'm disappointed with this approach to {AGENT_CONCERN}. It maintains the status quo rather than transforming it."
      ]
    }
  },
  {
    id: 'mayor-okonjo',
    name: 'Mayor Okonjo',
    role: 'City Mayor',
    age: 58,
    stance: AgentStance.MODERATE,
    concerns: ['Community integration', 'Public perception', 'Balanced approach'],
    responsePatterns: {
      positive: [
        "I can work with these policies for {POLICY_AREAS}. They strike a reasonable balance.",
        "These {POLICY_COUNT} policies represent a pragmatic approach that our community can support.",
        "I appreciate this balanced approach to {AGENT_CONCERN}. It considers multiple perspectives."
      ],
      neutral: [
        "I'm considering these policies for {POLICY_AREAS}, but I need to consult with community stakeholders.",
        "These {POLICY_COUNT} policies have merits, but I'm not fully convinced they'll gain broad support.",
        "I'm reserving judgment on this approach to {AGENT_CONCERN}. We need to find common ground."
      ],
      negative: [
        "I have concerns about these policies for {POLICY_AREAS}. They may divide our community.",
        "These {POLICY_COUNT} policies lack the balance needed to gain broad community support.",
        "I'm worried about this approach to {AGENT_CONCERN}. We need solutions that bring people together."
      ]
    }
  },
  {
    id: 'ms-patel',
    name: 'Ms. Patel',
    role: 'Refugee Advocate',
    age: 39,
    stance: AgentStance.HUMANITARIAN,
    concerns: ['Refugee wellbeing', 'Trauma-informed approaches', 'Cultural sensitivity'],
    responsePatterns: {
      positive: [
        "I wholeheartedly support these policies for {POLICY_AREAS}. They center refugee wellbeing.",
        "These {POLICY_COUNT} policies demonstrate a genuine commitment to supporting refugee students.",
        "I'm moved by this compassionate approach to {AGENT_CONCERN}. It recognizes the trauma many refugees have experienced."
      ],
      neutral: [
        "I see good intentions in these policies for {POLICY_AREAS}, but they need stronger trauma-informed components.",
        "These {POLICY_COUNT} policies show promise, but I worry about implementation challenges.",
        "I have mixed feelings about this approach to {AGENT_CONCERN}. It needs more input from refugee communities."
      ],
      negative: [
        "I must speak against these policies for {POLICY_AREAS}. They fail to center refugee wellbeing.",
        "These {POLICY_COUNT} policies lack the trauma-informed approach that refugee students desperately need.",
        "I'm deeply concerned about this approach to {AGENT_CONCERN}. It doesn't reflect the lived experiences of refugees."
      ]
    }
  }
];

// Enhanced AI agents with more detailed response patterns
export const ENHANCED_AI_AGENTS = AI_AGENTS;

// Generate a response from an AI agent
export const generateAgentResponse = (
  agentId: string,
  policies: PolicyWithArea[],
  sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
): { message: string; emotion: string } => {
  // Find the agent
  const agent = AI_AGENTS.find(a => a.id === agentId);
  
  if (!agent) {
    return {
      message: "I don't have a perspective on these policies.",
      emotion: 'neutral'
    };
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
  
  // Replace placeholders
  const policyAreas = policies.map(p => p.area).join(', ');
  
  return {
    message: message
      .replace('{POLICY_COUNT}', policies.length.toString())
      .replace('{POLICY_AREAS}', policyAreas)
      .replace('{AGENT_CONCERN}', agent.concerns[0] || 'education'),
    emotion
  };
};