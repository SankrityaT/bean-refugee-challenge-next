import { PolicyArea } from '@/types/policies';

// Calculate equity score for selected policies
export const calculateEquityScore = (policies: PolicyArea[]): {
  score: number;
  breakdown: Record<string, number>;
  areas: Record<string, number>;
} => {
  // Base score starts at 50 (neutral)
  let baseScore = 50;
  
  // Count policies by tier
  const tierCounts = policies.reduce((counts, policy) => {
    counts[policy.tier] = (counts[policy.tier] || 0) + 1;
    return counts;
  }, {} as Record<number, number>);
  
  // Count policies by area
  const areaCounts = policies.reduce((counts, policy) => {
    counts[policy.area] = (counts[policy.area] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  // Calculate tier score
  // Higher tiers contribute more to equity
  const tierScore = (
    (tierCounts[1] || 0) * 5 +  // Tier 1: +5 points each
    (tierCounts[2] || 0) * 10 + // Tier 2: +10 points each
    (tierCounts[3] || 0) * 15   // Tier 3: +15 points each
  );
  
  // Calculate area diversity score
  // More diverse areas = higher score
  const uniqueAreas = Object.keys(areaCounts).length;
  const areaDiversityScore = uniqueAreas * 5; // +5 points per unique area
  
  // Calculate area balance score
  // More balanced distribution = higher score
  const areaValues = Object.values(areaCounts);
  const maxAreaCount = Math.max(...areaValues);
  const minAreaCount = Math.min(...areaValues);
  const areaBalanceScore = maxAreaCount === minAreaCount ? 10 : 0; // +10 if perfectly balanced
  
  // Calculate final score
  const finalScore = Math.min(100, Math.max(0, 
    baseScore + tierScore + areaDiversityScore + areaBalanceScore
  ));
  
  return {
    score: finalScore,
    breakdown: {
      base: baseScore,
      tierScore,
      areaDiversity: areaDiversityScore,
      areaBalance: areaBalanceScore
    },
    areas: areaCounts
  };
};

// Get equity rating based on score
export const getEquityRating = (score: number): {
  rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  description: string;
} => {
  if (score < 40) {
    return {
      rating: 'Poor',
      description: 'These policies may not adequately address equity concerns for refugee education.'
    };
  } else if (score < 60) {
    return {
      rating: 'Fair',
      description: 'These policies provide a basic level of equity, but there is room for improvement.'
    };
  } else if (score < 80) {
    return {
      rating: 'Good',
      description: 'These policies demonstrate a strong commitment to equity in refugee education.'
    };
  } else {
    return {
      rating: 'Excellent',
      description: 'These policies represent an exceptional approach to equity in refugee education.'
    };
  }
};

// Generate recommendations to improve equity
export const generateEquityRecommendations = (
  policies: PolicyArea[],
  equityScore: ReturnType<typeof calculateEquityScore>
): string[] => {
  const recommendations: string[] = [];
  
  // Check tier distribution
  const tierCounts = policies.reduce((counts, policy) => {
    counts[policy.tier] = (counts[policy.tier] || 0) + 1;
    return counts;
  }, {} as Record<number, number>);
  
  if ((tierCounts[1] || 0) > (tierCounts[3] || 0) * 2) {
    recommendations.push(
      'Consider including more transformative (Tier 3) policies to better address systemic barriers.'
    );
  }
  
  if ((tierCounts[3] || 0) > (tierCounts[1] || 0) * 2) {
    recommendations.push(
      'Consider balancing your approach with some cost-effective (Tier 1) policies to ensure sustainability.'
    );
  }
  
  // Check area coverage
  const areas = Object.keys(equityScore.areas);
  const missingAreas = ['Education', 'Housing', 'Healthcare', 'Employment', 'Integration']
    .filter(area => !areas.some(a => a.includes(area)));
  
  if (missingAreas.length > 0) {
    recommendations.push(
      `Consider adding policies in these areas: ${missingAreas.join(', ')}.`
    );
  }
  
  // Check for balance
  const areaValues = Object.values(equityScore.areas);
  const maxAreaCount = Math.max(...areaValues);
  const minAreaCount = Math.min(...areaValues);
  
  if (maxAreaCount > minAreaCount + 1) {
    recommendations.push(
      'Your policy selection is heavily weighted toward certain areas. Consider a more balanced approach.'
    );
  }
  
  // If score is already high, acknowledge it
  if (equityScore.score >= 80 && recommendations.length === 0) {
    recommendations.push(
      'Your policy selection demonstrates a strong commitment to equity. Continue with this approach.'
    );
  }
  
  return recommendations;
};