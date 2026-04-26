"use server";

import type { ProfileAudit } from "@/domains/audit";
import { scoreAudit, rankCompetitors } from "@/domains/audit";
import {
  extractBusinessInfo,
  searchCompetitors,
  type BusinessInfo,
} from "@/services/tavily-service";
import { db } from "@/db";
import { audits, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type AuditResult = ProfileAudit & {
  business: BusinessInfo | null;
  userRank: number;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const inflight = new Map<string, Promise<AuditResult>>();

export async function getOrCreateAudit(gbpUrl: string): Promise<AuditResult> {
  if (gbpUrl && gbpUrl !== "demo") {
    try {
      const rows = await db
        .select({
          auditId: audits.id,
          profileId: audits.profileId,
          overallScore: audits.overallScore,
          categories: audits.categories,
          competitors: audits.competitors,
          createdAt: audits.createdAt,
          profileUrl: profiles.url,
          profileName: profiles.name,
          profileCategory: profiles.category,
          profileLocation: profiles.location,
          profileRating: profiles.rating,
          profileReviewCount: profiles.reviewCount,
        })
        .from(audits)
        .innerJoin(profiles, eq(profiles.id, audits.profileId))
        .where(eq(profiles.url, gbpUrl))
        .orderBy(desc(audits.createdAt))
        .limit(1);

      const cached = rows[0];
      if (cached && Date.now() - cached.createdAt.getTime() < CACHE_TTL_MS) {
        console.log("[audit] Cache hit for: %s (age: %dmin)",
          gbpUrl.slice(0, 60),
          Math.round((Date.now() - cached.createdAt.getTime()) / 60_000));

        return {
          id: cached.auditId,
          profileId: cached.profileId,
          overallScore: cached.overallScore,
          categories: cached.categories as AuditResult["categories"],
          competitors: cached.competitors as AuditResult["competitors"],
          business: {
            name: cached.profileName ?? "Unknown Business",
            description: "",
            location: cached.profileLocation ?? "",
            category: cached.profileCategory ?? "",
            rating: cached.profileRating != null ? cached.profileRating / 10 : null,
            reviewCount: cached.profileReviewCount,
            photoUrls: [],
            photoRefs: [],
            rawContent: "",
          },
          userRank: (cached.competitors as AuditResult["competitors"]).length + 1,
          createdAt: cached.createdAt,
        };
      }
    } catch (err) {
      console.warn("[audit] Cache lookup failed, computing fresh:", err instanceof Error ? err.message : err);
    }
  }

  const existing = inflight.get(gbpUrl);
  if (existing) {
    console.log("[audit] Dedup: joining in-flight request for:", gbpUrl.slice(0, 60));
    return existing;
  }

  const promise = computeAudit(gbpUrl).finally(() => inflight.delete(gbpUrl));
  inflight.set(gbpUrl, promise);
  return promise;
}

export async function computeAudit(gbpUrl: string): Promise<AuditResult> {
  console.log("[audit] Computing fresh for:", gbpUrl.slice(0, 60));

  let business: BusinessInfo | null = null;
  let competitorHits: Awaited<ReturnType<typeof searchCompetitors>> = [];

  if (gbpUrl && gbpUrl !== "demo") {
    business = await extractBusinessInfo(gbpUrl);

    if (business) {
      competitorHits = await searchCompetitors(
        business.name,
        business.location,
        business.category,
      );
    }
  }

  const categories = scoreAudit(business);
  const overallScore = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
  );
  const { competitors, userRank } = rankCompetitors(business, competitorHits);

  console.log("[audit] Business: %s | score: %d | competitors: %d",
    business?.name ?? "(demo)", overallScore, competitors.length);

  return {
    id: crypto.randomUUID(),
    profileId: gbpUrl,
    overallScore,
    categories,
    competitors,
    business,
    userRank,
    createdAt: new Date(),
  };
}
