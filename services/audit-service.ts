"use server";

import type { ProfileAudit } from "@/domains/profile";

// TODO: replace with DB
const auditCache = new Map<string, ProfileAudit>();

export async function getAudit(profileId: string): Promise<ProfileAudit> {
  const cached = auditCache.get(profileId);
  if (cached) return cached;

  const audit: ProfileAudit = {
    id: crypto.randomUUID(),
    profileId,
    overallScore: 72,
    categories: [
      {
        name: "Reviews",
        score: 85,
        maxScore: 100,
        suggestions: [
          "Respond to all reviews within 24 hours",
          "Ask satisfied customers for reviews after each visit",
        ],
      },
      {
        name: "Photos",
        score: 60,
        maxScore: 100,
        suggestions: [
          "Add at least 10 more high-quality interior photos",
          "Upload photos of your best-selling items weekly",
        ],
      },
      {
        name: "Posts",
        score: 45,
        maxScore: 100,
        suggestions: [
          "Post at least once per week about specials or events",
          "Include calls-to-action in every post",
        ],
      },
      {
        name: "Info Completeness",
        score: 90,
        maxScore: 100,
        suggestions: [
          "Add holiday hours for upcoming holidays",
        ],
      },
      {
        name: "Keywords",
        score: 55,
        maxScore: 100,
        suggestions: [
          "Add relevant service keywords to your description",
          "Include neighborhood and city name variations",
        ],
      },
    ],
    competitors: [
      {
        rank: 1,
        name: "Flour & Vine Bakehouse",
        url: "https://maps.google.com/place/flour-vine",
        rating: 4.8,
        reviewCount: 512,
        overallScore: 91,
      },
      {
        rank: 2,
        name: "Golden Crust Patisserie",
        url: "https://maps.google.com/place/golden-crust",
        rating: 4.7,
        reviewCount: 389,
        overallScore: 87,
      },
      {
        rank: 3,
        name: "Sunrise Bakery & Cafe",
        url: "https://maps.google.com/place/sunrise-bakery",
        rating: 4.6,
        reviewCount: 248,
        overallScore: 72,
      },
      {
        rank: 4,
        name: "Urban Crumb Co.",
        url: "https://maps.google.com/place/urban-crumb",
        rating: 4.5,
        reviewCount: 198,
        overallScore: 65,
      },
      {
        rank: 5,
        name: "Maple & Wheat",
        url: "https://maps.google.com/place/maple-wheat",
        rating: 4.3,
        reviewCount: 156,
        overallScore: 58,
      },
    ],
    createdAt: new Date(),
  };

  auditCache.set(profileId, audit);
  return audit;
}
