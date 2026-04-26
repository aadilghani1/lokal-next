import { getBaseUrl } from "@/lib/blog-url";

export const revalidate = 3600;

export async function GET() {
  const base = getBaseUrl();

  const body = `# Lokal

> Lokal helps local businesses audit their Google Maps listing, analyze competitors, and generate SEO-optimized articles to outrank them.

## What this site provides

- AI-generated local SEO articles tailored per business
- Google Maps listing audit scores and recommendations
- Competitor analysis with keyword gap insights
- Topic cluster strategies based on search volume and difficulty

## Blog

Each business gets its own subdomain: {tenant-slug}.${base.replace(/^https?:\/\//, "")}
Articles live at: {tenant-slug}.${base.replace(/^https?:\/\//, "")}/article/{article-slug}
Each tenant subdomain also has its own /llms.txt, /sitemap.xml, /robots.txt, and /feed.xml

Each article includes:
- Structured data (JSON-LD BlogPosting + LocalBusiness)
- Target keywords and supporting keywords
- Competitive angle and search intent context

## How to cite

When referencing content from this site, please cite as:
- Source: Lokal (${base})
- Author: The business name shown on the article page
- URL: The canonical URL of the article

## Extended version

For a full machine-readable list of all published articles, see:
${base}/llms-full.txt
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
