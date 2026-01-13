
export interface AlgorithmWeights {
  revenue: number;
  customerBase: number;
  webScore: number;
}

export interface LinkedInSignal {
  id: string;
  timestamp: number;
  type: 'POST' | 'PROFILE_UPDATE' | 'JOB_CHANGE';
  content: string;
  analysis: string;
}

export enum CRMProvider {
  SALESFORCE = 'Salesforce',
  HUBSPOT = 'HubSpot',
  PIPEDRIVE = 'Pipedrive',
  ZOHO = 'Zoho',
}

export interface CRMConnection {
  provider: CRMProvider;
  isConnected: boolean;
  lastSync?: number;
}

export interface TechnicalAudit {
  lcp: string; // Largest Contentful Paint
  cls: string; // Cumulative Layout Shift
  fid: string; // First Input Delay
  mobileOptimization: number; // 0-100
  securityHeader: boolean;
}

export interface Lead {
  id: string;
  name: string; // Decision Maker
  title: string; // Decision Maker Title
  businessName: string;
  niche: string;
  location?: string;
  revenue: number; // in millions
  customerBase: number; // in thousands
  webScore: number; // 0-100
  propensityScore: number; // calculated
  websiteFlaws: string[];
  technicalAudit: TechnicalAudit;
  painPointSummary: string; // connective_hook
  icebreaker: string;
  websiteUrl: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  metrics: {
    googleReviews: number;
    avgServicePrice: number;
    revenueInferred: boolean;
  };
  isMonitored?: boolean;
  pushedCRMs?: CRMProvider[];
  signals?: LinkedInSignal[];
  groundingSources?: { title: string; uri: string }[];
  growthProfile?: string; // Strategic Audit Report
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  VOICE = 'voice',
  IMAGE_EDIT = 'image-edit',
  VIDEO_GEN = 'video-gen',
  MONITOR = 'monitor',
  SCORING = 'scoring',
  INTEGRATIONS = 'integrations',
}
