import { Book, Languages, Users, GraduationCap, Heart, Coins, FileCheck } from 'lucide-react';
import { AgentStance } from '@/types/agents';
import { PolicyArea } from '../types/policies';

// Updated to include all 7 refugee-specific domains
export const POLICY_AREAS: PolicyArea[] = [
  {
    id: 'access',
    title: 'Access to Education',
    description: 'Policies related to how refugee students gain entry to the education system.',
    icon: Book,
    policies: [
      {
        id: 'access1',
        title: 'Separate Schools',
        description: 'Create separate schools for refugees with specialized curriculum.',
        impact: 'Exclusionary',
        tier: 1
      },
      {
        id: 'access2',
        title: 'Mainstream Integration',
        description: 'Place refugees in regular schools with some support services.',
        impact: 'Moderate Inclusion',
        tier: 2
      },
      {
        id: 'access3',
        title: 'Full Inclusion Model',
        description: 'Comprehensive integration with individualized support plans.',
        impact: 'Transformative',
        tier: 3
      }
    ]
  },
  {
    id: 'language',
    title: 'Language Instruction',
    description: 'Approaches to language learning for refugee students.',
    icon: Languages,
    policies: [
      {
        id: 'language1',
        title: 'Basic Translation Services',
        description: 'Provide minimal translation support for core subjects only.',
        impact: 'Exclusionary',
        tier: 1
      },
      {
        id: 'language2',
        title: 'Bilingual Education',
        description: 'Teach in both native language and host country language.',
        impact: 'Moderate Inclusion',
        tier: 2
      },
      {
        id: 'language3',
        title: 'Comprehensive Language Program',
        description: 'Intensive language instruction with cultural context and academic support.',
        impact: 'Transformative',
        tier: 3
      }
    ]
  },
  {
    id: 'teacher',
    title: 'Teacher Training',
    description: 'Professional development for educators working with refugee students.',
    icon: Users,
    policies: [
      {
        id: 'teacher1',
        title: 'Basic Cultural Awareness',
        description: 'One-time workshop on cultural differences for teachers.',
        impact: 'Exclusionary',
        tier: 1
      },
      {
        id: 'teacher2',
        title: 'Trauma-Informed Teaching',
        description: 'Regular training on trauma-informed approaches and cultural competence.',
        impact: 'Moderate Inclusion',
        tier: 2
      },
      {
        id: 'teacher3',
        title: 'Specialized Certification Program',
        description: 'Comprehensive certification program for teaching refugee students with ongoing support.',
        impact: 'Transformative',
        tier: 3
      }
    ]
  },
  {
    id: 'curriculum',
    title: 'Curriculum Adaptation',
    description: 'Modifications to educational content to meet refugee student needs.',
    icon: GraduationCap,
    policies: [
      {
        id: 'curriculum1',
        title: 'Standard Curriculum Only',
        description: 'Use existing curriculum with minimal modifications.',
        impact: 'Exclusionary',
        tier: 1
      },
      {
        id: 'curriculum2',
        title: 'Supplemental Materials',
        description: 'Standard curriculum with supplemental culturally relevant materials.',
        impact: 'Moderate Inclusion',
        tier: 2
      },
      {
        id: 'curriculum3',
        title: 'Inclusive Curriculum Redesign',
        description: 'Comprehensive curriculum redesign with refugee perspectives integrated throughout.',
        impact: 'Transformative',
        tier: 3
      }
    ]
  },
  {
    id: 'psychosocial',
    title: 'Psychosocial Support',
    description: 'Mental health and social-emotional support for refugee students.',
    icon: Heart,
    policies: [
      {
        id: 'psychosocial1',
        title: 'Basic Counseling Referrals',
        description: 'Provide referrals to external services when severe issues arise.',
        impact: 'Exclusionary',
        tier: 1
      },
      {
        id: 'psychosocial2',
        title: 'School Counselors',
        description: 'On-site counselors with some training in refugee trauma.',
        impact: 'Moderate Inclusion',
        tier: 2
      },
      {
        id: 'psychosocial3',
        title: 'Comprehensive Wellbeing Program',
        description: 'Integrated trauma-informed support system with specialized staff and family involvement.',
        impact: 'Transformative',
        tier: 3
      }
    ]
  },
  {
    id: 'financial',
    title: 'Financial Support',
    description: 'Economic assistance for refugee students and families.',
    icon: Coins,
    policies: [
      {
        id: 'financial1',
        title: 'Basic School Supplies',
        description: 'Provide essential school supplies only.',
        impact: 'Exclusionary',
        tier: 1
      },
      {
        id: 'financial2',
        title: 'Targeted Scholarships',
        description: 'Scholarships for qualified refugee students and subsidized meals.',
        impact: 'Moderate Inclusion',
        tier: 2
      },
      {
        id: 'financial3',
        title: 'Comprehensive Support Package',
        description: 'Full financial support including transportation, technology, and family stipends.',
        impact: 'Transformative',
        tier: 3
      }
    ]
  },
  {
    id: 'certification',
    title: 'Certification/Accreditation',
    description: 'Recognition of prior learning and qualification frameworks.',
    icon: FileCheck,
    policies: [
      {
        id: 'certification1',
        title: 'Limited Recognition',
        description: 'Minimal recognition of prior education with extensive retesting required.',
        impact: 'Exclusionary',
        tier: 1
      },
      {
        id: 'certification2',
        title: 'Partial Equivalency',
        description: 'Recognize some prior qualifications with bridging courses available.',
        impact: 'Moderate Inclusion',
        tier: 2
      },
      {
        id: 'certification3',
        title: 'Comprehensive Recognition Framework',
        description: 'Flexible qualification recognition system with multiple pathways to certification.',
        impact: 'Transformative',
        tier: 3
      }
    ]
  }
];

export const REFLECTION_QUESTIONS = [
  {
    id: 'r1',
    question: 'Whose interests did your decisions ultimately serve, and whose interests were marginalized?',
    category: 'Ethical Analysis'
  },
  {
    id: 'r2',
    question: 'What compromises did you make for consensus, and were they justified?',
    category: 'Group Dynamics'
  },
  {
    id: 'r3',
    question: 'How did the budget constraint affect your imagination of what\'s possible?',
    category: 'Resource Allocation'
  },
  {
    id: 'r4',
    question: 'What assumptions about refugees and education were challenged or reinforced through your decisions?',
    category: 'Critical Reflection'
  },
  {
    id: 'r5',
    question: 'How do your policies address the tension between assimilation and cultural preservation?',
    category: 'Cultural Integration'
  },
  {
    id: 'r6',
    question: 'What might be the unintended consequences of your policy package in five years?',
    category: 'Long-term Impact'
  },
  {
    id: 'r7',
    question: 'What voices or perspectives were absent from your decision-making process?',
    category: 'Representation'
  },
  {
    id: 'r8',
    question: 'How did power dynamics influence the final policy decisions your group made?',
    category: 'Power Analysis'
  },
  {
    id: 'r9',
    question: 'What would true justice require beyond what the game structure allowed?',
    category: 'Transformative Justice'
  },
  {
    id: 'r10',
    question: 'If you could add an eighth policy area, what would it be and why?',
    category: 'System Innovation'
  }
];

export const AI_AGENTS = [
  {
    id: 'agent1',
    name: 'Dr. Rodriguez',
    role: 'Economist',
    age: 52,
    stance: 'neoliberal' as AgentStance,
    concerns: 'Economic efficiency and fiscal responsibility',
    educationalLevel: 'PhD in Economics',
    socioeconomicStatus: 'Upper Middle Class'
  },
  {
    id: 'agent2',
    name: 'Imani Okafor',
    role: 'NGO Director',
    age: 34,
    stance: 'socialist' as AgentStance,
    concerns: 'Social justice and equal resource distribution',
    educationalLevel: 'Master\'s in International Development',
    socioeconomicStatus: 'Middle Class'
  },
  {
    id: 'agent3',
    name: 'Mayor Kim',
    role: 'Local Government',
    age: 45,
    stance: 'liberal' as AgentStance,
    concerns: 'Community integration and local resources',
    educationalLevel: 'Master\'s in Public Administration',
    socioeconomicStatus: 'Upper Middle Class'
  },
  {
    id: 'agent4',
    name: 'Alex Taylor',
    role: 'Teacher',
    age: 29,
    stance: 'moderate' as AgentStance,
    concerns: 'Classroom implementation and student wellbeing',
    educationalLevel: 'Bachelor\'s in Education',
    socioeconomicStatus: 'Middle Class'
  }
];
