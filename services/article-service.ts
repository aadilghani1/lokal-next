"use server";

import type { BlogArticle } from "@/domains/article";

// TODO: replace with DB
const articles = new Map<string, BlogArticle>();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface CreateArticleParams {
  jobId: string;
  markdownContent: string;
  profileId: string;
  tenantSlug: string;
  title: string;
}

export async function createArticle(
  params: CreateArticleParams
): Promise<BlogArticle> {
  const slug = slugify(params.title);
  const article: BlogArticle = {
    id: crypto.randomUUID(),
    jobId: params.jobId,
    profileId: params.profileId,
    tenantSlug: params.tenantSlug,
    slug,
    title: params.title,
    markdownContent: params.markdownContent,
    status: "published",
    createdAt: new Date(),
    publishedAt: new Date(),
  };

  articles.set(`${params.tenantSlug}/${slug}`, article);
  return article;
}

export async function getArticle(
  tenant: string,
  slug: string
): Promise<BlogArticle | null> {
  return articles.get(`${tenant}/${slug}`) ?? null;
}

export async function getArticlesByProfile(
  profileId: string
): Promise<BlogArticle[]> {
  return Array.from(articles.values()).filter(
    (a) => a.profileId === profileId
  );
}

export async function getAllArticles(): Promise<BlogArticle[]> {
  return Array.from(articles.values());
}
