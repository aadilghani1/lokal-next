import { getArticlesByTenant } from "@/services/article-service";
import { getProfileBySlug } from "@/services/profile-service";
import { getTenantBaseUrl, getBlogArticleUrl } from "@/lib/blog-url";

export const revalidate = 3600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenant: string }> },
) {
  const { tenant } = await params;
  const profile = await getProfileBySlug(tenant);
  const articles = await getArticlesByTenant(tenant);
  const base = getTenantBaseUrl(tenant);
  const name = profile?.name ?? tenant;

  let body = `# ${name} — Full Article Index

> Machine-readable index of all published articles.
> Last generated: ${new Date().toISOString()}

## Articles (${articles.length} total)

`;

  for (const a of articles) {
    const url = getBlogArticleUrl(tenant, a.slug);
    body += `### ${a.title}\n`;
    body += `- URL: ${url}\n`;
    if (a.metaDescription) {
      body += `- Description: ${a.metaDescription}\n`;
    }
    if (a.clusterKeywords && a.clusterKeywords.length > 0) {
      body += `- Keywords: ${a.clusterKeywords.join(", ")}\n`;
    }
    if (a.publishedAt) {
      body += `- Published: ${a.publishedAt.toISOString().split("T")[0]}\n`;
    }
    body += "\n";
  }

  body += `## Site info

- Name: ${name}
- URL: ${base}
- Publisher: Lokal (https://lokal.so)
${profile?.category ? `- Category: ${profile.category}` : ""}
${profile?.location ? `- Location: ${profile.location}` : ""}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
