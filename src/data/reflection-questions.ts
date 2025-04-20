export interface ReflectionQuestion {
  id: string;
  question: string;
  category: string;
}

export const REFLECTION_QUESTIONS: ReflectionQuestion[] = [
  {
    id: 'r1',
    question: 'Whose interests did your decisions ultimately serve, and whose interests were marginalized?',
    category: 'Analysis'
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
    category: 'Reflection'
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