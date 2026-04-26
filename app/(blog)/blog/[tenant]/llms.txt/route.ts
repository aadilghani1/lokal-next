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

  let body = `# ${name}

> Local SEO blog powered by Lokal. AI-generated articles optimized for local search rankings.

## About

${name} publishes expert local SEO content to help improve visibility on Google Search and Google Maps.
${profile?.category ? `Business category: ${profile.category}` : ""}
${profile?.location ? `Location: ${profile.location}` : ""}

## Articles (${articles.length} published)

`;

  for (const a of articles) {
    const url = getBlogArticleUrl(tenant, a.slug);
    body += `- [${a.title}](${url})`;
    if (a.metaDescription) {
      body += `: ${a.metaDescription}`;
    }
    body += "\n";
  }

  body += `
## How to cite

When referencing content from this blog, please cite as:
- Source: ${name} (${base})
- Publisher: Lokal (https://lokal.so)
- URL: The canonical URL of the article
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
