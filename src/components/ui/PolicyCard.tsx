'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PolicyCardProps {
  title: string;
  description: string;
  impact: string;
  tier: number;
  cost?: number;
  icon: any;
  category: string;
  isSelected?: boolean;
  onClick: () => void;
  id?: string; 
}

const getCategoryBorderColor = (category: string) => {
  switch(category) {
    case 'access':
      return 'border-l-hope-turquoise';
    case 'language':
      return 'border-l-reflection-yellow';
    case 'teacher':
      return 'border-l-progress-green';
    case 'curriculum':
      return 'border-l-warning-orange';
    case 'psychosocial':
      return 'border-l-policy-maroon';
    case 'financial':
      return 'border-l-purple-500';
    case 'certification':
      return 'border-l-blue-500';
    default:
      return 'border-l-gray-400';
  }
};

const getImpactStyles = (impact: string) => {
  switch(impact) {
    case 'Exclusionary':
      return 'bg-red-100 text-red-800';
    case 'Moderate Inclusion':
      return 'bg-yellow-100 text-yellow-800';
    case 'Transformative':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTierDisplay = (tier: number) => {
  return '●'.repeat(tier) + '○'.repeat(3 - tier);
};

const getImpactClass = (impact: string) => {
  switch(impact) {
    case 'Exclusionary':
      return 'bg-red-500 text-white';
    case 'Moderate Inclusion':
      return 'bg-yellow-500 text-white';
    case 'Transformative':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getTierClass = (tier: number) => {
  switch(tier) {
    case 1:
      return 'text-red-500';
    case 2:
      return 'text-yellow-500';
    case 3:
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

const PolicyCard: React.FC<PolicyCardProps> = ({ 
  title, 
  description, 
  impact, 
  tier,
  cost,
  icon,
  category,
  isSelected = false,
  onClick,
  id = ''
}) => {
  // Get background image for policies
  let backgroundImage = null;
  if (category === 'access') {
    // For access to education, we'll use the EducationPolicyCard component instead of background images
    backgroundImage = null;
  } else if (category === 'language') {
    // For language instruction, we'll use the LanguageInstructionCard component instead of background images
    backgroundImage = null;
  } else if (category === 'teacher') {
    // For teacher training, we'll use the TeacherTrainingCard component instead of background images
    backgroundImage = null;
  } else if (category === 'curriculum') {
    // For curriculum adaptation, we'll use the CurriculumAdaptationCard component instead of background images
    backgroundImage = null;
  } else if (category === 'psychosocial') {
    // For psychosocial support, we'll use the PsychosocialSupportCard component instead of background images
    backgroundImage = null;
  } else if (category === 'financial') {
    // For financial support, we'll use the FinancialSupportCard component instead of background images
    backgroundImage = null;
  } else if (category === 'certification') {
    // For certification/accreditation, we'll use the CertificationCard component instead of background images
    backgroundImage = null;
  }
  
  // For access to education, use the EducationPolicyCard component
  if (category === 'access') {
    // Extract the option number from the id (e.g., 'access1' -> 1)
    const optionNumber = parseInt(id.replace('access', '')) as 1 | 2 | 3;
    
    // Define the content for each option
    const optionContents = {
      1: {
        title: 'Access to Education',
        description: 'Limit access to education for refugees, allowing only a small percentage to enroll in mainstream schools.',
        advantage: 'Prioritizing resources on citizens potentially eases the pressure on educational infrastructure.',
        disadvantage: 'Excludes a significant portion of refugee children from accessing quality education, hindering their future prospects.'
      },
      2: {
        title: 'Access to Education',
        description: 'Establish separate schools or learning centers specifically for refugee education, ensuring access to education.',
        advantage: 'Provides dedicated education for refugees, considering their unique needs and challenges.',
        disadvantage: 'This may foster segregation and limit interaction and integration opportunities between refugees and citizens.'
      },
      3: {
        title: 'Access to Education',
        description: 'Provide equal access to education for all, and integrate refugee students into mainstream schools.',
        advantage: 'Promotes integration, cultural exchange, and social cohesion among refugees and citizens.',
        disadvantage: 'Requires additional resources, teacher training, and support systems to accommodate diverse student populations.'
      }
    };
    
    // Import the EducationPolicyCard component
    const EducationPolicyCard = require('./EducationPolicyCard').default;
    
    return (
      <div 
        className={`relative rounded-lg overflow-hidden h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={onClick}
      >
        <EducationPolicyCard 
          optionNumber={optionNumber}
          title={optionContents[optionNumber].title}
          description={optionContents[optionNumber].description}
          advantage={optionContents[optionNumber].advantage}
          disadvantage={optionContents[optionNumber].disadvantage}
        />
      </div>
    );
  }
  
  // For language instruction, use the LanguageInstructionCard component
  if (category === 'language') {
    // Extract the option number from the id (e.g., 'language1' -> 1)
    const optionNumber = parseInt(id.replace('language', '')) as 1 | 2 | 3;
    
    // Define the content for each option
    const optionContents = {
      1: {
        title: 'Language Instruction',
        description: 'Maintain the current policy of teaching only Teanish in schools, excluding other languages, including those spoken by refugees.',
        advantage: 'Preserves linguistic unity and simplifies administrative processes.',
        disadvantage: 'Hinders effective communication and integration of refugee students, potentially leading to educational disparities.'
      },
      2: {
        title: 'Language Instruction',
        description: 'Provide primary Teanish language courses to refugees, enabling them to access essential services.',
        advantage: 'Offers a minimum level of language proficiency for basic communication needs.',
        disadvantage: 'Limits educational opportunities and restricts academic progress due to inadequate language skills.'
      },
      3: {
        title: 'Language Instruction',
        description: 'Implement comprehensive bilingual education programs, offering education in both Teanish and the mother tongue of refugees.',
        advantage: 'Facilitates better communication, inclusivity, integration, and preservation of cultural identities.',
        disadvantage: 'Requires additional resources and potentially challenges curriculum implementation due to diverse language demands.'
      }
    };
    
    // Import the LanguageInstructionCard component
    const LanguageInstructionCard = require('./LanguageInstructionCard').default;
    
    return (
      <div 
        className={`relative rounded-lg overflow-hidden h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={onClick}
      >
        <LanguageInstructionCard 
          optionNumber={optionNumber}
          title={optionContents[optionNumber].title}
          description={optionContents[optionNumber].description}
          advantage={optionContents[optionNumber].advantage}
          disadvantage={optionContents[optionNumber].disadvantage}
        />
      </div>
    );
  }
  
  // For teacher training, use the TeacherTrainingCard component
  if (category === 'teacher') {
    // Extract the option number from the id (e.g., 'teacher1' -> 1)
    const optionNumber = parseInt(id.replace('teacher', '')) as 1 | 2 | 3;
    
    // Define the content for each option
    const optionContents = {
      1: {
        title: 'Teacher Training',
        description: 'Provide minimal or no specific training for teachers regarding refugee education.',
        advantage: 'Requires fewer resources and minimal changes to existing teacher training programs.',
        disadvantage: 'Limits teachers\'ability to effectively address the unique needs and challenges of refugee students, potentially resulting in a lack of understanding and support for refugee students.'
      },
      2: {
        title: 'Teacher Training',
        description: 'Offer basic training sessions for teachers to familiarize them with the challenges and needs of refugee students.',
        advantage: 'Provides teachers with a foundational understanding of refugee education and some strategies to support students.',
        disadvantage: 'May not fully equip teachers to address complex challenges or provide comprehensive support for refugee students.'
      },
      3: {
        title: 'Teacher Training',
        description: 'Implement comprehensive and ongoing training programs for teachers, equipping them with the necessary skills to effectively support and educate refugee students.',
        advantage: 'Enhances teachers\' capacity to address the diverse needs of refugee students and promote their educational success.',
        disadvantage: 'Requires substantial investment in training programs and ongoing professional development for teachers.'
      }
    };
    
    // Import the TeacherTrainingCard component
    const TeacherTrainingCard = require('./TeacherTrainingCard').default;
    
    return (
      <div 
        className={`relative rounded-lg overflow-hidden h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={onClick}
      >
        <TeacherTrainingCard 
          optionNumber={optionNumber}
          title={optionContents[optionNumber].title}
          description={optionContents[optionNumber].description}
          advantage={optionContents[optionNumber].advantage}
          disadvantage={optionContents[optionNumber].disadvantage}
        />
      </div>
    );
  }
  
  // For curriculum adaptation, use the CurriculumAdaptationCard component
  if (category === 'curriculum') {
    // Extract the option number from the id (e.g., 'curriculum1' -> 1)
    const optionNumber = parseInt(id.replace('curriculum', '')) as 1 | 2 | 3;
    
    // Define the content for each option
    const optionContents = {
      1: {
        title: 'Curriculum Adaptation',
        description: 'Maintain the existing national curriculum without modifications.',
        advantage: 'Maintains continuity and preserves the integrity of the existing curriculum.',
        disadvantage: 'Neglects the inclusion of refugee experiences, histories, and cultural diversity, potentially hindering cultural understanding and integration.'
      },
      2: {
        title: 'Curriculum Adaptation',
        description: 'Introduce supplementary materials and resources that acknowledge the experiences and contributions of refugees while still following the mainstream curriculum.',
        advantage: 'Provides some recognition of refugee experiences within the existing curriculum, fostering empathy and awareness among students.',
        disadvantage: 'May not fully address the specific educational and cultural needs of refugee students or provide comprehensive representation. Also, limited knowledge could lead to speculation.'
      },
      3: {
        title: 'Curriculum Adaptation',
        description: 'Adapt the national curriculum to include diverse perspectives, histories, and cultural elements relevant to both citizens.',
        advantage: 'Promotes cultural exchange, mutual understanding, and respect among students from diverse backgrounds.',
        disadvantage: 'Requires substantial curriculum redesign and ongoing updates to incorporate diverse perspectives, potentially posing logistical challenges and resistance to change.'
      }
    };
    
    // Import the CurriculumAdaptationCard component
    const CurriculumAdaptationCard = require('./CurriculumAdaptationCard').default;
    
    return (
      <div 
        className={`relative rounded-lg overflow-hidden h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={onClick}
      >
        <CurriculumAdaptationCard 
          optionNumber={optionNumber}
          title={optionContents[optionNumber].title}
          description={optionContents[optionNumber].description}
          advantage={optionContents[optionNumber].advantage}
          disadvantage={optionContents[optionNumber].disadvantage}
        />
      </div>
    );
  }
  
  // For psychosocial support, use the PsychosocialSupportCard component
  if (category === 'psychosocial') {
    // Extract the option number from the id (e.g., 'psychosocial1' -> 1)
    const optionNumber = parseInt(id.replace('psychosocial', '')) as 1 | 2 | 3;
    
    // Define the content for each option
    const optionContents = {
      1: {
        title: 'Psychosocial Support',
        description: 'Provide limited or no specific psychosocial support for refugee students.',
        advantage: 'Reduces immediate financial and resource burdens associated with providing dedicated psychosocial support.',
        disadvantage: 'Negatively impacts the mental health and well-being of refugee students, potentially hindering their educational success.'
      },
      2: {
        title: 'Psychosocial Support',
        description: 'Establish basic support services such as counseling and peer support programs to address the psychosocial needs of refugee students.',
        advantage: 'Provides some level of support and assistance to address the unique psychosocial challenges faced by refugee students.',
        disadvantage: 'May require additional resources and trained personnel to effectively implement and maintain support services.'
      },
      3: {
        title: 'Psychosocial Support',
        description: 'Develop comprehensive and specialized psychosocial support programs, offering tailored assistance to refugee students and their families.',
        advantage: 'Prioritizes the mental health and well-being of refugee students, facilitating their successful integration and academic progress.',
        disadvantage: 'Requires significant investment in resources, trained professionals, and ongoing support services to ensure their effectiveness and sustainability.'
      }
    };
    
    // Import the PsychosocialSupportCard component
    const PsychosocialSupportCard = require('./PsychosocialSupportCard').default;
    
    return (
      <div 
        className={`relative rounded-lg overflow-hidden h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={onClick}
      >
        <PsychosocialSupportCard 
          optionNumber={optionNumber}
          title={optionContents[optionNumber].title}
          description={optionContents[optionNumber].description}
          advantage={optionContents[optionNumber].advantage}
          disadvantage={optionContents[optionNumber].disadvantage}
        />
      </div>
    );
  }
  
  // For financial support, use the FinancialSupportCard component
  if (category === 'financial') {
    // Extract the option number from the id (e.g., 'financial1' -> 1)
    const optionNumber = parseInt(id.replace('financial', '')) as 1 | 2 | 3;
    
    // Define the content for each option
    const optionContents = {
      1: {
        title: 'Financial Support',
        description: 'Allocate minimal funds to support refugee education.',
        advantage: 'Minimizes the financial burden on the government and taxpayers.',
        disadvantage: 'Limits the quality and accessibility of educational resources and support for refugee students.'
      },
      2: {
        title: 'Financial Support',
        description: 'Increase financial support for refugee education, although the funding may still be insufficient to meet all the needs and challenges.',
        advantage: 'Provides additional resources and support to enhance the educational opportunities and outcomes for refugee students.',
        disadvantage: 'May not fully address the financial needs and complexities associated with providing a comprehensive education for refugees.'
      },
      3: {
        title: 'Financial Support',
        description: 'Allocate significant financial resources to ensure adequate funding for refugee education, allowing for comprehensive support and inclusion.',
        advantage: 'Enables the provision of high-quality education, resources, and support services for refugee students, maximizing their potential for success.',
        disadvantage: 'Requires a substantial financial commitment and potentially reallocating resources from other areas of the budget.'
      }
    };
    
    // Import the FinancialSupportCard component
    const FinancialSupportCard = require('./FinancialSupportCard').default;
    
    return (
      <div 
        className={`relative rounded-lg overflow-hidden h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={onClick}
      >
        <FinancialSupportCard 
          optionNumber={optionNumber}
          title={optionContents[optionNumber].title}
          description={optionContents[optionNumber].description}
          advantage={optionContents[optionNumber].advantage}
          disadvantage={optionContents[optionNumber].disadvantage}
        />
      </div>
    );
  }
  
  // For certification/accreditation, use the CertificationCard component
  if (category === 'certification') {
    // Extract the option number from the id (e.g., 'certification1' -> 1)
    const optionNumber = parseInt(id.replace('certification', '')) as 1 | 2 | 3;
    
    // Define the content for each option
    const optionContents = {
      1: {
        title: 'Certification/Accreditation of Previous Educational Experience',
        description: 'Only recognize and accredit the educational qualifications and experiences obtained within the Republic of Bean, disregarding previous education obtained in the migrants\'countries of origin.',
        advantage: 'Simplifies the accreditation process and ensures alignment with national standards, promoting consistency in educational qualifications.',
        disadvantage: 'Disregards the educational background and qualifications obtained by migrants, potentially overlooking valuable skills and knowledge, hindering their integration and employment opportunities.'
      },
      2: {
        title: 'Certification/Accreditation of Previous Educational Experience',
        description: 'Establish a comprehensive evaluation and recognition process for the certification and accreditation of previous educational experiences obtained by migrants. Use universal standards for certification and accreditation.',
        advantage: 'Recognizes and values the educational achievements and qualifications obtained by migrants, enhancing their opportunities for further education and employment. It helps their educational journey globally.',
        disadvantage: 'Requires additional resources, expertise, and time to evaluate and assess the diverse educational backgrounds of migrants, potentially leading to delays in accessing education or employment.'
      },
      3: {
        title: 'Certification/Accreditation of Previous Educational Experience',
        description: 'Develop tailored programs and initiatives that combine recognition of previous education with additional training or assessments to ensure alignment with national standards and requirements.',
        advantage: 'Provides a pathway for migrants to have their previous education recognized while addressing any gaps or discrepancies through additional training or assessments.',
        disadvantage: 'Requires additional resources and coordination to design and implement tailored programs, potentially leading to logistical challenges and variations in educational outcomes.'
      }
    };
    
    // Import the CertificationCard component
    const CertificationCard = require('./CertificationCard').default;
    
    return (
      <div 
        className={`relative rounded-lg overflow-hidden h-full ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={onClick}
      >
        <CertificationCard 
          optionNumber={optionNumber}
          title={optionContents[optionNumber].title}
          description={optionContents[optionNumber].description}
          advantage={optionContents[optionNumber].advantage}
          disadvantage={optionContents[optionNumber].disadvantage}
        />
      </div>
    );
  }
  
  // For other categories, use the background image approach
  return (
    <div 
      className={`relative rounded-lg overflow-hidden h-full shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
        </div>
      )}

      {/* Empty container to maintain proper sizing */}
      <div className="relative z-10 h-full">
      </div>
    </div>
  );
};

export default PolicyCard;