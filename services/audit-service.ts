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

  return [
    {
      name: "Reviews",
      score: Math.round((ratingScore + reviewScore) / 2),
      maxScore: 100,
      suggestions: reviewScore < 70
        ? ["Encourage happy customers to leave Google reviews", "Respond to all reviews within 24 hours"]
        : ["Keep responding to reviews promptly"],
    },
    {
      name: "Photos",
      score: 55 + Math.floor(Math.random() * 20),
      maxScore: 100,
      suggestions: ["Add high-quality interior and product photos weekly"],
    },
    {
      name: "Posts",
      score: 35 + Math.floor(Math.random() * 25),
      maxScore: 100,
      suggestions: ["Post weekly about specials, events, or updates"],
    },
    {
      name: "Completeness",
      score: business.description.length > 50 ? 85 : 65,
      maxScore: 100,
      suggestions: business.description.length > 50
        ? ["Add holiday hours and service areas"]
        : ["Fill out your full business description", "Add service areas and attributes"],
    },
    {
      name: "Keywords",
      score: business.category ? 60 : 40,
      maxScore: 100,
      suggestions: ["Add service keywords to your business description", "Use location-specific terms"],
    },
  ];
}

function buildCompetitors(
  business: BusinessInfo | null,
  hits: CompetitorHit[]
): { competitors: Competitor[]; userRank: number } {
  if (!business || hits.length === 0) {
    return { competitors: DEFAULT_COMPETITORS, userRank: 3 };
  }

  const all: { name: string; url: string; rating: number; reviewCount: number; score: number; isSelf: boolean }[] = [];

  for (const hit of hits) {
    const rating = hit.rating ?? (3.5 + Math.random() * 1.3);
    const reviews = hit.reviewCount ?? Math.floor(50 + Math.random() * 200);
    all.push({
      name: hit.name,
      url: hit.url,
      rating: Math.round(rating * 10) / 10,
      reviewCount: reviews,
      score: Math.round(rating * 12 + Math.min(reviews, 500) / 10),
      isSelf: false,
    });
  }

  const selfRating = business.rating ?? 4.0;
  const selfReviews = business.reviewCount ?? 100;
  all.push({
    name: business.name,
    url: "#",
    rating: Math.round(selfRating * 10) / 10,
    reviewCount: selfReviews,
    score: Math.round(selfRating * 12 + Math.min(selfReviews, 500) / 10),
    isSelf: true,
  });

  all.sort((a, b) => b.score - a.score);

  const top5 = all.slice(0, 5);
  let userRank = top5.findIndex((c) => c.isSelf) + 1;

  if (userRank === 0) {
    if (top5.length >= 5) top5.pop();
    top5.push(all.find((c) => c.isSelf)!);
    top5.sort((a, b) => b.score - a.score);
    userRank = top5.findIndex((c) => c.isSelf) + 1;
  }

  const competitors: Competitor[] = top5.map((c, i) => ({
    rank: i + 1,
    name: c.name,
    url: c.url,
    rating: c.rating,
    reviewCount: c.reviewCount,
    overallScore: c.score,
  }));

  return { competitors, userRank };
}

const DEFAULT_CATEGORIES: AuditCategory[] = [
  { name: "Reviews", score: 72, maxScore: 100, suggestions: ["Respond to all reviews within 24 hours"] },
  { name: "Photos", score: 60, maxScore: 100, suggestions: ["Add high-quality interior and product photos"] },
  { name: "Posts", score: 45, maxScore: 100, suggestions: ["Post weekly about specials or events"] },
  { name: "Completeness", score: 80, maxScore: 100, suggestions: ["Add holiday hours"] },
  { name: "Keywords", score: 55, maxScore: 100, suggestions: ["Add service keywords to your description"] },
];

const DEFAULT_COMPETITORS: Competitor[] = [
  { rank: 1, name: "Top Local Business", url: "#", rating: 4.8, reviewCount: 512, overallScore: 91 },
  { rank: 2, name: "Runner Up Business", url: "#", rating: 4.7, reviewCount: 389, overallScore: 87 },
  { rank: 3, name: "Your Business", url: "#", rating: 4.6, reviewCount: 248, overallScore: 72 },
  { rank: 4, name: "Nearby Competitor", url: "#", rating: 4.5, reviewCount: 198, overallScore: 65 },
  { rank: 5, name: "Another Competitor", url: "#", rating: 4.3, reviewCount: 156, overallScore: 58 },
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
