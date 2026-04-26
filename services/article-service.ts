"use server";

import { db } from "@/db";
import { articles, contentJobs } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import type { BlogArticle, ContentJob } from "@/domains/article";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function rowToArticle(row: typeof articles.$inferSelect): BlogArticle {
  return {
    id: row.id,
    jobId: row.jobId,
    contentJobId: row.contentJobId ?? null,
    profileId: row.profileId ?? "",
    tenantSlug: row.tenantSlug,
    slug: row.slug,
    title: row.title,
    markdownContent: row.markdownContent,
    clusterKeywords: row.clusterKeywords as string[] | null,
    searchVolume: row.searchVolume,
    keywordDifficulty: row.keywordDifficulty,
    schemaJsonld: row.schemaJsonld as Record<string, unknown>[] | null,
    status: row.status as BlogArticle["status"],
    createdAt: row.createdAt,
    publishedAt: row.publishedAt,
  };
}

// --- Content Jobs ---

export async function createContentJob(data: {
  jobId: string;
  tenantSlug: string;
  businessName?: string;
  businessCategory?: string;
  businessLocation?: string;
}): Promise<ContentJob> {
  const [row] = await db
    .insert(contentJobs)
    .values({
      jobId: data.jobId,
      tenantSlug: data.tenantSlug,
      businessName: data.businessName,
      businessCategory: data.businessCategory,
      businessLocation: data.businessLocation,
      status: "processing",
    })
    .onConflictDoUpdate({
      target: [contentJobs.jobId],
      set: { status: "processing" as const },
    })
    .returning();

  return rowToContentJob(row);
}

export async function completeContentJob(
  jobId: string,
  data: {
    competitors: unknown[];
    topicClusters: unknown[];
    totalKeywordsFound: number;
    totalClusters: number;
    agentToolCalls: unknown[];
    agentInputTokens: number;
    agentOutputTokens: number;
  }
): Promise<ContentJob> {
  const [row] = await db
    .update(contentJobs)
    .set({
      competitors: data.competitors,
      topicClusters: data.topicClusters,
      totalKeywordsFound: data.totalKeywordsFound,
      totalClusters: data.totalClusters,
      agentToolCalls: data.agentToolCalls,
      agentInputTokens: data.agentInputTokens,
      agentOutputTokens: data.agentOutputTokens,
      status: "completed" as const,
    })
    .where(eq(contentJobs.jobId, jobId))
    .returning();

  if (!row) throw new Error("Content job not found");
  return rowToContentJob(row);
}

export async function getContentJobByJobId(jobId: string): Promise<ContentJob | null> {
  const [row] = await db
    .select()
    .from(contentJobs)
    .where(eq(contentJobs.jobId, jobId))
    .limit(1);

  return row ? rowToContentJob(row) : null;
}

function rowToContentJob(row: typeof contentJobs.$inferSelect): ContentJob {
  return {
    id: row.id,
    jobId: row.jobId,
    tenantSlug: row.tenantSlug,
    businessName: row.businessName,
    businessCategory: row.businessCategory,
    businessLocation: row.businessLocation,
    competitors: (row.competitors as ContentJob["competitors"]) ?? [],
    topicClusters: (row.topicClusters as ContentJob["topicClusters"]) ?? [],
    totalKeywordsFound: row.totalKeywordsFound ?? 0,
    totalClusters: row.totalClusters ?? 0,
    status: row.status,
    createdAt: row.createdAt,
  };
}

// --- Articles ---

export async function createArticle(input: {
  jobId: string;
  contentJobId?: string;
  tenantSlug: string;
  title: string;
  markdownContent: string;
  clusterKeywords?: string[];
  searchVolume?: number;
  keywordDifficulty?: number;
  schemaJsonld?: unknown[];
  embedding?: number[];
}): Promise<BlogArticle> {
  const slug = slugify(input.title);

  const [row] = await db
    .insert(articles)
    .values({
      jobId: input.jobId,
      contentJobId: input.contentJobId,
      tenantSlug: input.tenantSlug,
      slug,
      title: input.title,
      markdownContent: input.markdownContent,
      clusterKeywords: input.clusterKeywords,
      searchVolume: input.searchVolume,
      keywordDifficulty: input.keywordDifficulty,
      schemaJsonld: input.schemaJsonld,
      status: "draft",
    })
    .onConflictDoUpdate({
      target: [articles.tenantSlug, articles.slug],
      set: {
        markdownContent: input.markdownContent,
        jobId: input.jobId,
        contentJobId: input.contentJobId,
        clusterKeywords: input.clusterKeywords,
        searchVolume: input.searchVolume,
        keywordDifficulty: input.keywordDifficulty,
        schemaJsonld: input.schemaJsonld,
        status: "draft" as const,
      },
    })
    .returning();

  // Store embedding via raw SQL (drizzle doesn't support vector type)
  if (input.embedding && input.embedding.length > 0) {
    const vectorStr = `[${input.embedding.join(",")}]`;
    await db.execute(
      sql`UPDATE articles SET embedding = ${vectorStr}::vector WHERE id = ${row.id}`
    );
  }

  return rowToArticle(row);
}

export async function getArticleById(id: string): Promise<BlogArticle | null> {
  const [row] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  return row ? rowToArticle(row) : null;
}

export async function publishArticle(id: string): Promise<BlogArticle> {
  const [row] = await db
    .update(articles)
    .set({ status: "published", publishedAt: new Date() })
    .where(eq(articles.id, id))
    .returning();

  if (!row) throw new Error("Article not found");
  return rowToArticle(row);
}

export async function getArticle(
  tenant: string,
  slug: string
): Promise<BlogArticle | null> {
  const [row] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.tenantSlug, tenant), eq(articles.slug, slug)))
    .limit(1);

  return row ? rowToArticle(row) : null;
}

export async function getArticlesByTenant(
  tenantSlug: string
): Promise<BlogArticle[]> {
  const rows = await db
    .select()
    .from(articles)
    .where(
      and(
        eq(articles.tenantSlug, tenantSlug),
        eq(articles.status, "published")
      )
    );
  return rows.map(rowToArticle);
}

export async function getArticlesByJobId(jobId: string): Promise<BlogArticle[]> {
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.jobId, jobId))
    .orderBy(desc(articles.createdAt));
  return rows.map(rowToArticle);
}

export async function getAllArticles(): Promise<BlogArticle[]> {
  const rows = await db.select().from(articles).orderBy(desc(articles.createdAt));
  return rows.map(rowToArticle);
}

export async function getSimilarArticles(
  articleId: string,
  limit: number = 3
): Promise<{ id: string; title: string; tenantSlug: string; slug: string; similarity: number }[]> {
  const rows = await db.execute(sql`
    SELECT
      b.id, b.title, b.tenant_slug, b.slug,
      1 - (a.embedding <=> b.embedding) as similarity
    FROM articles a, articles b
    WHERE a.id = ${articleId}
      AND b.id != ${articleId}
      AND a.embedding IS NOT NULL
      AND b.embedding IS NOT NULL
    ORDER BY a.embedding <=> b.embedding
    LIMIT ${limit}
  `);

  return (rows.rows as { id: string; title: string; tenant_slug: string; slug: string; similarity: number }[]).map((r) => ({
    id: r.id,
    title: r.title,
    tenantSlug: r.tenant_slug,
    slug: r.slug,
    similarity: Math.round(r.similarity * 100) / 100,
  }));
}
