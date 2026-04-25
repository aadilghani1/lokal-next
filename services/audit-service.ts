"use server";

import type { ProfileAudit, AuditCategory, Competitor } from "@/domains/audit";
import { searchGbpCompetitors } from "@/services/tavily-service";

const MOCK_CATEGORIES: AuditCategory[] = [
  { name: "Reviews", score: 85, maxScore: 100, suggestions: ["Respond to all reviews within 24 hours", "Ask satisfied customers for reviews after each visit"] },
  { name: "Photos", score: 60, maxScore: 100, suggestions: ["Add at least 10 more high-quality interior photos", "Upload photos of your best-selling items weekly"] },
  { name: "Posts", score: 45, maxScore: 100, suggestions: ["Post at least once per week about specials or events", "Include calls-to-action in every post"] },
  { name: "Completeness", score: 90, maxScore: 100, suggestions: ["Add holiday hours for upcoming holidays"] },
  { name: "Keywords", score: 55, maxScore: 100, suggestions: ["Add relevant service keywords to your description", "Include neighborhood and city name variations"] },
];

const MOCK_COMPETITORS: Competitor[] = [
  { rank: 1, name: "Flour & Vine Bakehouse", url: "https://maps.google.com/place/flour-vine", rating: 4.8, reviewCount: 512, overallScore: 91 },
  { rank: 2, name: "Golden Crust Patisserie", url: "https://maps.google.com/place/golden-crust", rating: 4.7, reviewCount: 389, overallScore: 87 },
  { rank: 3, name: "Sunrise Bakery & Cafe", url: "https://maps.google.com/place/sunrise-bakery", rating: 4.6, reviewCount: 248, overallScore: 72 },
  { rank: 4, name: "Urban Crumb Co.", url: "https://maps.google.com/place/urban-crumb", rating: 4.5, reviewCount: 198, overallScore: 65 },
  { rank: 5, name: "Maple & Wheat", url: "https://maps.google.com/place/maple-wheat", rating: 4.3, reviewCount: 156, overallScore: 58 },
];

function buildMockAudit(identifier: string): ProfileAudit {
  return {
    id: crypto.randomUUID(),
    profileId: identifier,
    overallScore: 72,
    categories: MOCK_CATEGORIES,
    competitors: MOCK_COMPETITORS,
    createdAt: new Date(),
  };
}

const auditCache = new Map<string, ProfileAudit>();

export async function getAudit(urlOrId: string): Promise<ProfileAudit> {
  if (!urlOrId || urlOrId === "demo") {
    return buildMockAudit("demo");
  }

  const cached = auditCache.get(urlOrId);
  if (cached) return cached;

  try {
    const competitors = await searchGbpCompetitors(urlOrId);

    if (competitors.length === 0) {
      return buildMockAudit(urlOrId);
    }

    const avgScore = Math.round(
      competitors.reduce((sum, c) => sum + c.overallScore, 0) / competitors.length
    );

    const audit: ProfileAudit = {
      id: crypto.randomUUID(),
      profileId: urlOrId,
      overallScore: Math.min(avgScore, 100),
      categories: MOCK_CATEGORIES,
      competitors,
      createdAt: new Date(),
    };

    auditCache.set(urlOrId, audit);
    return audit;
  } catch (err) {
    console.error("Tavily search failed, falling back to mock:", err);
    return buildMockAudit(urlOrId);
  }
}
