import { getArticlesByTenant } from "@/services/article-service";
import { getTenantBaseUrl, getBlogArticleUrl } from "@/lib/blog-url";

export const revalidate = 3600;

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenant: string }> },
) {
  const { tenant } = await params;
  const articles = await getArticlesByTenant(tenant);
  const tenantUrl = getTenantBaseUrl(tenant);

  const urls = [
    `  <url>
    <loc>${escapeXml(tenantUrl)}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
    ...articles
      .filter((a) => a.publishedAt)
      .map(
        (a) => `  <url>
    <loc>${escapeXml(getBlogArticleUrl(tenant, a.slug))}</loc>
    <lastmod>${a.publishedAt!.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`,
      ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
