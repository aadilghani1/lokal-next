import { db } from "@/db";
import { articles, contentJobs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getBlogArticleUrl } from "@/lib/blog-url";

export const revalidate = 3600;

export async function GET() {

  const published = await db
    .select({
      title: articles.title,
      slug: articles.slug,
      tenantSlug: articles.tenantSlug,
      metaDescription: articles.metaDescription,
      clusterKeywords: articles.clusterKeywords,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt));

  const clusters = await db
    .select({
      tenantSlug: contentJobs.tenantSlug,
      topicClusters: contentJobs.topicClusters,
    })
    .from(contentJobs)
    .where(eq(contentJobs.status, "completed"));

  let body = `# Lokal — Full Article Index

> Machine-readable index of all published articles.
> Last generated: ${new Date().toISOString()}

## Articles (${published.length} total)

`;

  for (const a of published) {
    const url = getBlogArticleUrl(a.tenantSlug, a.slug);
    body += `### ${a.title}\n`;
    body += `- URL: ${url}\n`;
    if (a.metaDescription) {
      body += `- Description: ${a.metaDescription}\n`;
    }
    if (a.clusterKeywords) {
      const kw = a.clusterKeywords as string[];
      if (kw.length > 0) {
        body += `- Keywords: ${kw.join(", ")}\n`;
      }
    }
    if (a.publishedAt) {
      body += `- Published: ${a.publishedAt.toISOString().split("T")[0]}\n`;
    }
    body += "\n";
  }

  if (clusters.length > 0) {
    body += `## Topic Clusters\n\n`;
    for (const job of clusters) {
      const tc = job.topicClusters as {
        label: string;
        keywords: string[];
        total_search_volume: number;
        opportunity_score: number;
      }[] | null;
      if (!tc) continue;
      body += `### ${job.tenantSlug}\n\n`;
      for (const c of tc) {
        body += `- **${c.label}** (volume: ${c.total_search_volume}, opportunity: ${c.opportunity_score})\n`;
        body += `  Keywords: ${c.keywords.join(", ")}\n`;
      }
      body += "\n";
    }
  }

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
