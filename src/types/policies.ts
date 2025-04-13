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
  area: any;
  tier: any;
  id: string;
  title: string;
  description: string;
  icon: any;
  policies: PolicyOption[];
}

// Policy interface
export interface Policy {
  id: string;
  title: string;
  description?: string;
  tier: number; // 1 = basic, 2 = enhanced, 3 = transformative
  cost: number;
  impact: number;
}

// Policy with area
export interface PolicyWithArea extends Policy {
  area: string;
}

// Policy category
export interface PolicyCategory {
  id: string;
  title: string;
  description: string;
  policies: Policy[];
}