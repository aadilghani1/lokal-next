"use server";

import { db } from "@/db";
import { profiles, audits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/slugify";

export interface ProfileData {
  id: string;
  userId: string;
  url: string;
  name: string | null;
  category: string | null;
  location: string | null;
  rating: number | null;
  reviewCount: number | null;
  tenantSlug: string;
  competitorUrls: string[] | null;
  photoRefs: string[] | null;
  status: string;
}

export async function findOrCreateProfile(
  userId: string,
  gbpUrl: string,
  data: {
    name?: string;
    category?: string;
    location?: string;
    rating?: number;
    reviewCount?: number;
    competitorUrls?: string[];
    photoRefs?: string[];
  }
): Promise<ProfileData> {
  const tenantSlug = slugify(data.name || "business");

  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.url, gbpUrl))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(profiles)
      .set({
        name: data.name ?? existing.name,
        category: data.category ?? existing.category,
        location: data.location ?? existing.location,
        rating: data.rating != null ? Math.round(data.rating * 10) : existing.rating,
        reviewCount: data.reviewCount ?? existing.reviewCount,
        competitorUrls: data.competitorUrls ?? existing.competitorUrls,
        photoRefs: data.photoRefs ?? existing.photoRefs,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, existing.id))
      .returning();

    return rowToProfile(updated);
  }

  const [row] = await db
    .insert(profiles)
    .values({
      userId,
      url: gbpUrl,
      name: data.name,
      category: data.category,
      location: data.location,
      rating: data.rating != null ? Math.round(data.rating * 10) : null,
      reviewCount: data.reviewCount,
      tenantSlug,
      competitorUrls: data.competitorUrls,
      photoRefs: data.photoRefs,
      status: "active",
    })
    .onConflictDoUpdate({
      target: [profiles.tenantSlug],
      set: {
        name: data.name,
        category: data.category,
        location: data.location,
        competitorUrls: data.competitorUrls,
        status: "active" as const,
        updatedAt: new Date(),
      },
    })
    .returning();

  return rowToProfile(row);
}

export async function getProfileById(id: string): Promise<ProfileData | null> {
  const [row] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return row ? rowToProfile(row) : null;
}

export async function getProfileBySlug(slug: string): Promise<ProfileData | null> {
  const [row] = await db.select().from(profiles).where(eq(profiles.tenantSlug, slug)).limit(1);
  return row ? rowToProfile(row) : null;
}

export async function saveAudit(
  profileId: string,
  overallScore: number,
  categories: unknown[],
  competitors: unknown[]
): Promise<string> {
  const [row] = await db
    .insert(audits)
    .values({
      profileId,
      overallScore,
      categories,
      competitors,
    })
    .returning();

  return row.id;
}

function rowToProfile(row: typeof profiles.$inferSelect): ProfileData {
  return {
    id: row.id,
    userId: row.userId,
    url: row.url,
    name: row.name,
    category: row.category ?? null,
    location: row.location ?? null,
    rating: row.rating != null ? row.rating / 10 : null,
    reviewCount: row.reviewCount,
    tenantSlug: row.tenantSlug ?? "business",
    competitorUrls: (row.competitorUrls as string[]) ?? null,
    photoRefs: (row.photoRefs as string[]) ?? null,
    status: row.status,
  };
}
