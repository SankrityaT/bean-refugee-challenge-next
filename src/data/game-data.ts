
import { Home, GraduationCap, HeartPulse, Briefcase, Users } from 'lucide-react';

export const POLICY_AREAS = [
  {
    id: 'housing',
    title: 'Housing',
    description: 'Policies related to refugee accommodation, shelter, and housing infrastructure.',
    icon: Home,
    policies: [
      {
        id: 'h1',
        title: 'Urban Integration Housing',
        description: 'Provide subsidized apartments in urban areas to facilitate integration into local communities.',
        impact: 'High Integration',
        cost: 80
      },
      {
        id: 'h2',
        title: 'Temporary Camp Expansion',
        description: 'Expand existing refugee camps with improved infrastructure and security.',
        impact: 'Medium Security',
        cost: 45
      },
      {
        id: 'h3',
        title: 'Host Family Subsidy Program',
        description: 'Financial incentives for local families to host refugees temporarily.',
        impact: 'High Community',
        cost: 30
      }
    ]
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Educational initiatives for refugees of all ages.',
    icon: GraduationCap,
    policies: [
      {
        id: 'e1',
        title: 'Language Training Programs',
        description: 'Intensive language courses to enable rapid social and economic integration.',
        impact: 'High Integration',
        cost: 25
      },
      {
        id: 'e2',
        title: 'School Integration Support',
        description: 'Resources and support staff to help refugee children integrate into local schools.',
        impact: 'Medium Growth',
        cost: 40
      },
      {
        id: 'e3',
        title: 'Vocational Training Centers',
        description: 'Specialized centers offering practical skills training for employment.',
        impact: 'High Economic',
        cost: 55
      }
    ]
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    description: 'Medical services and health initiatives for refugees.',
    icon: HeartPulse,
    policies: [
      {
        id: 'hc1',
        title: 'Emergency Medical Response',
        description: 'Mobile clinics and emergency medical services in refugee areas.',
        impact: 'Critical Care',
        cost: 60
      },
      {
        id: 'hc2',
        title: 'Mental Health Services',
        description: 'Psychological support and trauma counseling for refugees.',
        impact: 'High Wellbeing',
        cost: 35
      },
      {
        id: 'hc3',
        title: 'Preventive Health Programs',
        description: 'Vaccination, nutrition, and preventive healthcare education.',
        impact: 'Medium Health',
        cost: 30
      }
    ]
  },
  {
    id: 'employment',
    title: 'Employment',
    description: 'Job creation and economic opportunity initiatives.',
    icon: Briefcase,
    policies: [
      {
        id: 'emp1',
        title: 'Entrepreneurship Grants',
        description: 'Small business grants and mentorship for refugee entrepreneurs.',
        impact: 'High Growth',
        cost: 50
      },
      {
        id: 'emp2',
        title: 'Public Works Employment',
        description: 'Government-funded infrastructure projects employing refugees.',
        impact: 'Medium Economic',
        cost: 70
      },
      {
        id: 'emp3',
        title: 'Corporate Partnership Program',
        description: 'Incentives for businesses to hire and train refugees.',
        impact: 'High Integration',
        cost: 40
      }
    ]
  },
  {
    id: 'integration',
    title: 'Integration',
    description: 'Cultural and social integration initiatives.',
    icon: Users,
    policies: [
      {
        id: 'int1',
        title: 'Community Dialog Programs',
        description: 'Facilitated discussions between locals and refugees to build understanding.',
        impact: 'High Social',
        cost: 20
      },
      {
        id: 'int2',
        title: 'Cultural Orientation Courses',
        description: 'Programs to help refugees understand local customs, laws, and practices.',
        impact: 'Medium Integration',
        cost: 25
      },
      {
        id: 'int3',
        title: 'Integration Counselors',
        description: 'Personal advisors to help refugees navigate social systems and integration.',
        impact: 'High Support',
        cost: 45
      }
    ]
  }
];

export const REFLECTION_QUESTIONS = [
  {
    id: 'r1',
    question: 'How does your policy approach balance immediate humanitarian needs with long-term integration goals?',
    category: 'Policy Design'
  },
  {
    id: 'r2',
    question: 'What ethical considerations influenced your budget allocation decisions?',
    category: 'Ethics'
  },
  {
    id: 'r3',
    question: 'How might your policies be perceived differently by various stakeholder groups?',
    category: 'Stakeholder Analysis'
  },
  {
    id: 'r4',
    question: 'What unintended consequences might arise from your chosen policy mix?',
    category: 'Impact Assessment'
  },
  {
    id: 'r5',
    question: 'How do your policies address the tension between refugee autonomy and host country security concerns?',
    category: 'Rights & Security'
  }
];

export const AI_AGENTS = [
  {
    id: 'agent1',
    name: 'Minister Santos',
    role: 'Interior Minister',
    stance: 'opposing' as const,
    concerns: 'Security and national resources'
  },
  {
    id: 'agent2',
    name: 'Dr. Chen',
    role: 'NGO Representative',
    stance: 'favorable' as const,
    concerns: 'Refugee rights and wellbeing'
  },
  {
    id: 'agent3',
    name: 'Mayor Okonjo',
    role: 'Local Government',
    stance: 'neutral' as const,
    concerns: 'Community impact and integration'
  }
];
