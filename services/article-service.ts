"use server";

import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { BlogArticle } from "@/domains/article";

interface CreateArticleParams {
  jobId: string;
  markdownContent: string;
  tenantSlug: string;
  title: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function rowToArticle(row: typeof articles.$inferSelect): BlogArticle {
  return {
    id: row.id,
    jobId: row.jobId,
    profileId: row.profileId ?? "",
    tenantSlug: row.tenantSlug,
    slug: row.slug,
    title: row.title,
    markdownContent: row.markdownContent,
    status: row.status as BlogArticle["status"],
    createdAt: row.createdAt,
    publishedAt: row.publishedAt,
  };
}

export async function createArticle(
  params: CreateArticleParams
): Promise<BlogArticle> {
  const slug = slugify(params.title);

  const [row] = await db
    .insert(articles)
    .values({
      jobId: params.jobId,
      tenantSlug: params.tenantSlug,
      slug,
      title: params.title,
      markdownContent: params.markdownContent,
      status: "draft",
    })
    .returning();

  return rowToArticle(row);
}

export async function getArticleById(
  id: string
): Promise<BlogArticle | null> {
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

export async function getAllArticles(): Promise<BlogArticle[]> {
  const rows = await db.select().from(articles);
  return rows.map(rowToArticle);
}
