declare module '@/types/policies' {
  export type PolicyImpact = 'Exclusionary' | 'Moderate Inclusion' | 'Transformative';

  export interface PolicyOption {
    id: string;
    title: string;
    description: string;
    impact: PolicyImpact;
    tier: number;
    cost?: number;
  }

  export interface PolicyArea {
    id: string;
    title: string;
    description: string;
    icon: any;
    policies: PolicyOption[];
  }
}