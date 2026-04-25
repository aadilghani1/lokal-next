export interface GoogleBusinessProfile {
  id: string;
  userId: string;
  url: string;
  name: string | null;
  placeId: string | null;
  status: ProfileStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ProfileStatus = "pending" | "active" | "error";

export interface ProfileSubmission {
  url: string;
}

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
}
