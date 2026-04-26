import { getArticlesByTenant } from "@/services/article-service";
import { getProfileBySlug } from "@/services/profile-service";
import { getBlogHomeUrl, getBlogFeedUrl, getBlogArticleUrl } from "@/lib/blog-url";

export const revalidate = 3600;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenant: string }> },
) {
  const { tenant } = await params;
  const articles = await getArticlesByTenant(tenant);
  const profile = await getProfileBySlug(tenant);

  const blogName = profile?.name ?? tenant;
  const homeUrl = getBlogHomeUrl(tenant);
  const feedUrl = getBlogFeedUrl(tenant);

  const items = articles
    .filter((a) => a.publishedAt)
    .map((a) => {
      const url = getBlogArticleUrl(tenant, a.slug);
      const desc =
        a.metaDescription ??
        a.markdownContent
          .replace(/[#*_\[\]()>`~|]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 300);

      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(desc)}</description>
      <pubDate>${a.publishedAt!.toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(blogName)} Blog</title>
    <link>${escapeXml(homeUrl)}</link>
    <description>Local SEO articles and insights from ${escapeXml(blogName)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
