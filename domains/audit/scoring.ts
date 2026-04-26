import type { AuditCategory, Competitor } from "./types";
import type { BusinessInfo, CompetitorHit } from "@/services/tavily-service";

interface ScoringRule {
  name: string;
  compute: (b: BusinessInfo) => number;
  suggest: (score: number, b: BusinessInfo) => string[];
}

const SCORING_RULES: ScoringRule[] = [
  {
    name: "Reviews",
    compute: (b) => {
      const reviewScore = b.reviewCount
        ? Math.min(100, Math.round((b.reviewCount / 500) * 100))
        : 40;
      const ratingScore =
        b.rating !== null ? Math.round((b.rating / 5) * 100) : 50;
      return Math.round((ratingScore + reviewScore) / 2);
    },
    suggest: (score) =>
      score < 70
        ? [
            "Encourage happy customers to leave Google reviews",
            "Respond to all reviews within 24 hours",
          ]
        : ["Keep responding to reviews promptly"],
  },
  {
    name: "Rating",
    compute: (b) =>
      b.rating !== null ? Math.round((b.rating / 5) * 100) : 50,
    suggest: (_score, b) =>
      b.rating !== null && b.rating < 4.5
        ? [
            "Focus on service quality to improve rating",
            "Address negative review feedback",
          ]
        : ["Maintain your high rating with consistent service"],
  },
  {
    name: "Completeness",
    compute: (b) =>
      b.description.length > 50 ? 85 : b.description.length > 0 ? 55 : 30,
    suggest: (_score, b) =>
      b.description.length > 50
        ? ["Add holiday hours and service areas"]
        : [
            "Fill out your full business description",
            "Add service areas and attributes",
          ],
  },
  {
    name: "Category",
    compute: (b) => (b.category ? 80 : 20),
    suggest: (_score, b) =>
      b.category
        ? ["Consider adding secondary categories"]
        : ["Set your primary business category on Google"],
  },
  {
    name: "Website",
    compute: (b) => {
      try {
        const parsed = JSON.parse(b.rawContent);
        return parsed.website ? 80 : 20;
      } catch {
        return /https?:\/\/[^\s"]+/.test(b.rawContent) ? 80 : 20;
      }
    },
    suggest: () => [
      "Add your website URL to your Google Business Profile",
      "A website helps you rank in local search",
    ],
  },
];

const DEFAULT_CATEGORIES: AuditCategory[] = [
  {
    name: "Reviews",
    score: 0,
    maxScore: 100,
    suggestions: ["Add your Google Business Profile to get started"],
  },
  {
    name: "Rating",
    score: 0,
    maxScore: 100,
    suggestions: ["Encourage customers to leave reviews"],
  },
  {
    name: "Completeness",
    score: 0,
    maxScore: 100,
    suggestions: ["Fill out your business description"],
  },
  {
    name: "Category",
    score: 0,
    maxScore: 100,
    suggestions: ["Set your primary business category"],
  },
  {
    name: "Website",
    score: 0,
    maxScore: 100,
    suggestions: ["Add a website to your profile"],
  },
];

export function scoreAudit(
  business: BusinessInfo | null,
): AuditCategory[] {
  if (!business) return DEFAULT_CATEGORIES;

  return SCORING_RULES.map((rule) => {
    const score = rule.compute(business);
    return {
      name: rule.name,
      score,
      maxScore: 100,
      suggestions: rule.suggest(score, business),
    };
  });
}

export function rankCompetitors(
  business: BusinessInfo | null,
  hits: CompetitorHit[],
): { competitors: Competitor[]; userRank: number } {
  if (!business || hits.length === 0) {
    return { competitors: [], userRank: 0 };
  }

  const competitors: Competitor[] = hits.slice(0, 5).map((hit, i) => ({
    rank: i + 1,
    name: hit.name,
    url: hit.url,
    rating: hit.rating ?? 0,
    reviewCount: hit.reviewCount ?? 0,
    overallScore: hit.serpRank ?? 99,
    organicTraffic: hit.organicTraffic ?? null,
    organicKeywords: hit.organicKeywords ?? null,
    serpRank: hit.serpRank ?? null,
  }));

  return { competitors, userRank: competitors.length + 1 };
}
