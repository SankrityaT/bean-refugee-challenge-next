// Policy interactions describe how specific policies or policy areas interact with each other
export const policyInteractions = [
  {
    policies: ['access3', 'language3'],
    areas: ['access', 'language'],
    description: "Your combination of full educational access with comprehensive language support creates a powerful foundation for inclusion. These policies mutually reinforce each other, as language acquisition enables meaningful participation in mainstream education."
  },
  {
    policies: ['access1', 'language1'],
    areas: [],
    description: "Your selection of limited educational access combined with minimal language support creates a concerning pattern of exclusion. These policies together may create significant barriers to refugee integration and educational success."
  },
  {
    policies: ['teacher3', 'curriculum3'],
    areas: ['teacher', 'curriculum'],
    description: "Your investment in both teacher training and culturally responsive curriculum demonstrates a holistic approach to creating inclusive learning environments. These policies work together to transform classroom experiences for refugee students."
  },
  {
    policies: ['financial3', 'certification3'],
    areas: ['financial', 'certification'],
    description: "Your combination of comprehensive financial support with flexible certification pathways addresses both immediate needs and long-term educational outcomes. This approach recognizes the complex barriers refugees face in educational continuity."
  },
  {
    policies: ['psychosocial3'],
    areas: ['psychosocial'],
    description: "Your emphasis on comprehensive psychosocial support acknowledges the trauma-informed approach necessary for refugee education. This policy creates a foundation for learning by addressing mental health needs."
  },
  {
    policies: ['access2', 'language1'],
    areas: [],
    description: "Your policy package includes partial educational access but minimal language support, creating a potential mismatch. Students may gain access to schools but struggle to participate meaningfully without adequate language assistance."
  },
  {
    policies: ['curriculum1', 'teacher1'],
    areas: [],
    description: "Your selection of standardized curriculum with minimal teacher training may perpetuate educational approaches that fail to address refugee students' unique needs and experiences."
  },
  {
    areas: ['financial', 'certification'],
    policies: [],
    description: "Your attention to both financial support and certification pathways shows recognition of the practical barriers refugees face in accessing and validating education."
  }
];

// Ethical dilemmas highlight tensions and ethical considerations in policy choices
export const ethicalDilemmas = [
  {
    relevantAreas: ['access', 'language'],
    relevantPolicies: ['access1', 'access2', 'language1', 'language2'],
    description: "Your policy choices raise an ethical tension between assimilation and cultural preservation. Lower-tier access and language policies often prioritize rapid assimilation over cultural identity maintenance, potentially undermining refugees' sense of belonging and identity."
  },
  {
    relevantAreas: ['curriculum'],
    relevantPolicies: ['curriculum1', 'curriculum2'],
    description: "Your curriculum choices highlight the dilemma between standardization and cultural responsiveness. Standardized curricula may ensure consistent educational outcomes but risk erasing refugee experiences and knowledge systems from the classroom."
  },
  {
    relevantAreas: ['financial'],
    relevantPolicies: ['financial1', 'financial2'],
    description: "Your approach to financial support reveals tensions between short-term resource allocation and long-term equity. Limited financial support may address immediate budgetary constraints but perpetuates systemic inequities that prevent refugee students from fully participating in education."
  },
  {
    relevantAreas: ['teacher', 'psychosocial'],
    relevantPolicies: ['teacher1', 'psychosocial1'],
    description: "Your policies on teacher training and psychosocial support raise questions about responsibility for refugee wellbeing. Minimal investment in these areas may reflect an ethical stance that places responsibility on refugees to adapt, rather than on systems to accommodate their needs."
  },
  {
    relevantAreas: ['certification'],
    relevantPolicies: ['certification1', 'certification2'],
    description: "Your certification policies highlight tensions between maintaining educational standards and recognizing refugee experiences. Strict equivalency requirements may uphold academic rigor but invalidate refugees' prior learning and create insurmountable barriers to educational advancement."
  }
];

// Transformative suggestions offer concrete ways to improve policy approaches
export const transformativeSuggestions = [
  {
    forAreas: ['access', 'language'],
    forEquityScore: 3,
    description: "Consider implementing a two-way language integration program where both refugee and host community students learn each other's languages, transforming language from a barrier to a bridge for intercultural understanding."
  },
  {
    forAreas: ['curriculum', 'teacher'],
    forEquityScore: 3.5,
    description: "Develop a co-creation model where refugee community members collaborate with educators to design curriculum materials that authentically represent refugee experiences and knowledge systems."
  },
  {
    forAreas: ['financial', 'certification'],
    forEquityScore: 3,
    description: "Establish a refugee education trust that combines immediate financial support with long-term investment in refugee-led educational initiatives and alternative certification pathways."
  },
  {
    forAreas: ['psychosocial'],
    forEquityScore: 4,
    description: "Create community healing spaces that integrate traditional and cultural healing practices with evidence-based trauma support, acknowledging refugees' own resilience strategies."
  },
  {
    forAreas: ['teacher'],
    forEquityScore: 3.5,
    description: "Implement a mentorship program where experienced refugee educators guide local teachers in culturally responsive practices, inverting traditional power dynamics in professional development."
  },
  {
    forAreas: ['access'],
    forEquityScore: 2.5,
    description: "Redesign school enrollment policies to prioritize keeping refugee families together in the same schools and creating educational continuity across transitions."
  },
  {
    forAreas: ['curriculum'],
    forEquityScore: 3,
    description: "Develop a critical pedagogy approach that explicitly addresses power, colonialism, and forced migration in the curriculum, empowering refugee students to analyze and transform their circumstances."
  }
];