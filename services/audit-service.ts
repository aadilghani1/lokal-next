"use server";

import type { ProfileAudit, AuditCategory, Competitor } from "@/domains/audit";
import {
  extractBusinessInfo,
  searchCompetitors,
  type BusinessInfo,
  type CompetitorHit,
} from "@/services/tavily-service";

function buildCategories(business: BusinessInfo | null): AuditCategory[] {
  if (!business) return DEFAULT_CATEGORIES;

  const hasRating = business.rating !== null;
  const reviewScore = business.reviewCount
    ? Math.min(100, Math.round((business.reviewCount / 500) * 100))
    : 40;
  const ratingScore = hasRating
    ? Math.round((business.rating! / 5) * 100)
    : 50;

  const categories: AuditCategory[] = [
    {
      name: "Reviews",
      score: Math.round((ratingScore + reviewScore) / 2),
      maxScore: 100,
      suggestions: reviewScore < 70
        ? ["Encourage happy customers to leave Google reviews", "Respond to all reviews within 24 hours"]
        : ["Keep responding to reviews promptly"],
    },
    {
      name: "Rating",
      score: ratingScore,
      maxScore: 100,
      suggestions: hasRating && business.rating! < 4.5
        ? ["Focus on service quality to improve rating", "Address negative review feedback"]
        : ["Maintain your high rating with consistent service"],
    },
    {
      name: "Completeness",
      score: business.description.length > 50 ? 85 : business.description.length > 0 ? 55 : 30,
      maxScore: 100,
      suggestions: business.description.length > 50
        ? ["Add holiday hours and service areas"]
        : ["Fill out your full business description", "Add service areas and attributes"],
    },
    {
      name: "Category",
      score: business.category ? 80 : 20,
      maxScore: 100,
      suggestions: business.category
        ? ["Consider adding secondary categories"]
        : ["Set your primary business category on Google"],
    },
    {
      name: "Website",
      score: business.rawContent.includes("website") ? 80 : 20,
      maxScore: 100,
      suggestions: ["Add your website URL to your Google Business Profile", "A website helps you rank in local search"],
    },
  ];

  return categories;
}

function buildCompetitors(
  business: BusinessInfo | null,
  hits: CompetitorHit[]
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

const DEFAULT_CATEGORIES: AuditCategory[] = [
  { name: "Reviews", score: 0, maxScore: 100, suggestions: ["Add your Google Business Profile to get started"] },
  { name: "Rating", score: 0, maxScore: 100, suggestions: ["Encourage customers to leave reviews"] },
  { name: "Completeness", score: 0, maxScore: 100, suggestions: ["Fill out your business description"] },
  { name: "Category", score: 0, maxScore: 100, suggestions: ["Set your primary business category"] },
  { name: "Website", score: 0, maxScore: 100, suggestions: ["Add a website to your profile"] },
];

export async function getAudit(urlOrId: string): Promise<
  ProfileAudit & { business: BusinessInfo | null; userRank: number }
> {
  console.log("[audit] Fetching for:", urlOrId.slice(0, 60));

  let business: BusinessInfo | null = null;
  let competitorHits: CompetitorHit[] = [];

  if (urlOrId && urlOrId !== "demo") {
    business = await extractBusinessInfo(urlOrId);

    if (business) {
      competitorHits = await searchCompetitors(
        business.name,
        business.location,
        business.category
      );
    }
  }

  const categories = buildCategories(business);
  const overallScore = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length
  );
  const { competitors, userRank } = buildCompetitors(business, competitorHits);

  console.log("[audit] Business: %s | score: %d | competitors: %d",
    business?.name ?? "(demo)", overallScore, competitors.length);

  return {
    id: crypto.randomUUID(),
    profileId: urlOrId,
    overallScore,
    categories,
    competitors,
    business,
    userRank,
    createdAt: new Date(),
  };
}
