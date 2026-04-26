export interface ProfileAudit {
  id: string;
  profileId: string;
  overallScore: number;
  categories: AuditCategory[];
  competitors: Competitor[];
  createdAt: Date;
}

export interface AuditCategory {
  name: string;
  score: number;
  maxScore: number;
  suggestions: string[];
}

export interface Competitor {
  rank: number;
  name: string;
  url: string;
  rating: number;
  reviewCount: number;
  overallScore: number;
  organicTraffic: number | null;
  organicKeywords: number | null;
  serpRank: number | null;
}

export interface AuditContext {
  gbpUrl: string;
  profileId: string | null;
  tenantSlug: string;
  business: {
    name?: string;
    category?: string;
    location?: string;
    rating?: number;
    reviewCount?: number;
  } | null;
  competitorUrls: string[];
}
