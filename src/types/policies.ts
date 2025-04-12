export type PolicyImpact = 'Exclusionary' | 'Moderate Inclusion' | 'Transformative';

export interface PolicyOption {
  id: string;
  title: string;
  description: string;
  impact: string;
  tier: number;
  area?: string; // Make area an optional property
}

export interface PolicyArea {
  id: string;
  title: string;
  description: string;
  icon: any;
  policies: PolicyOption[];
}