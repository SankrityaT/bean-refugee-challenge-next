
import { Book, Languages, Users, GraduationCap, Heart, Coins, FileCheck } from 'lucide-react';

export const POLICY_AREAS = [
  {
    id: 'access',
    title: 'Access to Education',
    description: 'Policies related to how refugee students gain entry to the education system.',
    icon: Book,
    policies: [
      {
        id: 'a1',
        title: 'Separate Schools',
        description: 'Create separate schools for refugees with minimal resources.',
        impact: 'Exclusionary',
        cost: 1,
        tier: 1
      },
      {
        id: 'a2',
        title: 'Partial Integration',
        description: 'Allow refugees to attend local schools with some restrictions.',
        impact: 'Moderate Inclusion',
        cost: 2,
        tier: 2
      },
      {
        id: 'a3',
        title: 'Full Integration',
        description: 'Fully integrate refugees into local schools with comprehensive support.',
        impact: 'Transformative',
        cost: 3,
        tier: 3
      }
    ]
  },
  {
    id: 'language',
    title: 'Language Instruction',
    description: 'Approaches to language education for refugee students.',
    icon: Languages,
    policies: [
      {
        id: 'l1',
        title: 'Monolingual Approach',
        description: 'Teach only in the official language, no mother tongue support.',
        impact: 'Exclusionary',
        cost: 1,
        tier: 1
      },
      {
        id: 'l2',
        title: 'Limited Bilingual Support',
        description: 'Provide basic mother tongue support during transition period.',
        impact: 'Moderate Inclusion',
        cost: 2,
        tier: 2
      },
      {
        id: 'l3',
        title: 'Comprehensive Multilingual Education',
        description: 'Develop full multilingual curriculum and resources.',
        impact: 'Transformative',
        cost: 3,
        tier: 3
      }
    ]
  },
  {
    id: 'teachers',
    title: 'Teacher Training',
    description: 'Professional development for educators working with refugee students.',
    icon: GraduationCap,
    policies: [
      {
        id: 't1',
        title: 'No Additional Training',
        description: 'Rely on existing teacher skills with no refugee-specific training.',
        impact: 'Exclusionary',
        cost: 1,
        tier: 1
      },
      {
        id: 't2',
        title: 'Basic Diversity Workshops',
        description: 'Provide short-term diversity and inclusion training for teachers.',
        impact: 'Moderate Inclusion',
        cost: 2,
        tier: 2
      },
      {
        id: 't3',
        title: 'Comprehensive Refugee Education Certification',
        description: 'Develop specialized certification program for teaching refugee populations.',
        impact: 'Transformative',
        cost: 3,
        tier: 3
      }
    ]
  },
  {
    id: 'curriculum',
    title: 'Curriculum Adaptation',
    description: 'Changes to educational content to reflect refugee experiences.',
    icon: Book,
    policies: [
      {
        id: 'c1',
        title: 'Standard Curriculum Only',
        description: 'No adaptation of existing curriculum for refugee students.',
        impact: 'Exclusionary',
        cost: 1,
        tier: 1
      },
      {
        id: 'c2',
        title: 'Supplemental Materials',
        description: 'Add cultural supplements to existing curriculum.',
        impact: 'Moderate Inclusion',
        cost: 2,
        tier: 2
      },
      {
        id: 'c3',
        title: 'Inclusive Curriculum Redesign',
        description: 'Completely redesign curriculum to be culturally responsive and inclusive.',
        impact: 'Transformative',
        cost: 3,
        tier: 3
      }
    ]
  },
  {
    id: 'psychosocial',
    title: 'Psychosocial Support',
    description: 'Mental health and social-emotional wellbeing initiatives for refugees.',
    icon: Heart,
    policies: [
      {
        id: 'p1',
        title: 'No Dedicated Support',
        description: 'No specialized mental health resources for refugee students.',
        impact: 'Exclusionary',
        cost: 1,
        tier: 1
      },
      {
        id: 'p2',
        title: 'Basic Counseling Services',
        description: 'Limited counseling and group support activities.',
        impact: 'Moderate Inclusion',
        cost: 2,
        tier: 2
      },
      {
        id: 'p3',
        title: 'Comprehensive Trauma-Informed Care',
        description: 'Full trauma-informed ecosystem with specialized personnel and family support.',
        impact: 'Transformative',
        cost: 3,
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
        id: 'f1',
        title: 'No Financial Assistance',
        description: 'No dedicated financial support for refugee education.',
        impact: 'Exclusionary',
        cost: 1,
        tier: 1
      },
      {
        id: 'f2',
        title: 'Basic Needs Stipend',
        description: 'Provide stipends for school supplies and basic materials.',
        impact: 'Moderate Inclusion',
        cost: 2,
        tier: 2
      },
      {
        id: 'f3',
        title: 'Comprehensive Support Package',
        description: 'Full scholarship program including family subsistence support.',
        impact: 'Transformative',
        cost: 3,
        tier: 3
      }
    ]
  },
  {
    id: 'certification',
    title: 'Certification/Accreditation',
    description: 'Recognition of prior learning and qualifications from home countries.',
    icon: FileCheck,
    policies: [
      {
        id: 'cr1',
        title: 'No Recognition',
        description: 'No recognition of prior education or qualifications.',
        impact: 'Exclusionary',
        cost: 1,
        tier: 1
      },
      {
        id: 'cr2',
        title: 'Partial Recognition',
        description: 'Limited recognition of prior learning with extensive verification.',
        impact: 'Moderate Inclusion',
        cost: 2,
        tier: 2
      },
      {
        id: 'cr3',
        title: 'Full Recognition System',
        description: 'Comprehensive system for validating and recognizing prior education.',
        impact: 'Transformative',
        cost: 3,
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
    question: 'How did the budget constraint affect your imagination of what's possible?',
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
    stance: 'neoliberal' as const,
    concerns: 'Economic efficiency and fiscal responsibility'
  },
  {
    id: 'agent2',
    name: 'Imani Okafor',
    role: 'NGO Director',
    age: 34,
    stance: 'socialist' as const,
    concerns: 'Social justice and equal resource distribution'
  },
  {
    id: 'agent3',
    name: 'Mayor Kim',
    role: 'Local Government',
    age: 45,
    stance: 'liberal' as const,
    concerns: 'Community integration and local resources'
  },
  {
    id: 'agent4',
    name: 'Alex Taylor',
    role: 'Teacher',
    age: 29,
    stance: 'moderate' as const,
    concerns: 'Classroom implementation and student wellbeing'
  }
];
