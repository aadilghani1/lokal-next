import type { MetadataRoute } from "next";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getBaseUrl,
  getTenantBaseUrl,
  getBlogArticleUrl,
} from "@/lib/blog-url";

export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const published = await db
    .select({
      tenantSlug: articles.tenantSlug,
      slug: articles.slug,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(eq(articles.status, "published"));

  const tenants = await db
    .selectDistinct({ tenantSlug: articles.tenantSlug })
    .from(articles)
    .where(eq(articles.status, "published"));

  const tenantEntries: MetadataRoute.Sitemap = tenants.map((t) => ({
    url: getTenantBaseUrl(t.tenantSlug),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const articleEntries: MetadataRoute.Sitemap = published.map((a) => ({
    url: getBlogArticleUrl(a.tenantSlug, a.slug),
    lastModified: a.publishedAt ?? undefined,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: base,
      changeFrequency: "daily",
      priority: 1,
    },
    ...tenantEntries,
    ...articleEntries,
  ];
}
