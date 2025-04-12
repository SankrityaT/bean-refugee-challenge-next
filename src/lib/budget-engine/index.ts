import { PolicyOption } from '../../types/policies';

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  totalUnits: number;
  tierDiversity: boolean;
}

/**
 * Validates policy selections based on the 14-unit tier system
 * and ensures tier diversity as per AI-CHALLENGE Rule 4
 */
export const validateSelections = (selections: PolicyOption[]): ValidationResult => {
  const totalUnits = selections.reduce((sum, opt) => sum + opt.tier, 0);
  
  // Check if at least 2 different tier levels are selected
  const tiers = selections.map(opt => opt.tier);
  const tierDiversity = new Set(tiers).size >= 2;
  
  return {
    isValid: totalUnits <= 14 && tierDiversity,
    warnings: [
      ...(totalUnits > 12 ? ["Budget nearly exhausted"] : []),
      ...(!tierDiversity ? ["Need diversity in policy tiers"] : [])
    ],
    totalUnits,
    tierDiversity
  };
};

/**
 * Calculates remaining budget units from selected policies
 */
export const calculateRemainingUnits = (selections: PolicyOption[]): number => {
  const totalUnits = selections.reduce((sum, opt) => sum + opt.tier, 0);
  return 14 - totalUnits;
};