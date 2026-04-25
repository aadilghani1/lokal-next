import { NextResponse } from "next/server";
import { createArticle } from "@/services/article-service";

const CONTENT_GEN_URL =
  process.env.CONTENT_GEN_URL ?? "https://content-gen.openhook.dev";
const CONTENT_GEN_TOKEN = process.env.CONTENT_GEN_TOKEN ?? "";

function getHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (CONTENT_GEN_TOKEN) h["Authorization"] = `Bearer ${CONTENT_GEN_TOKEN}`;
  return h;
}

function extractTitleFromMarkdown(md: string): string | null {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim().slice(0, 200) : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const res = await fetch(`${CONTENT_GEN_URL}/api/v1/analyze/${jobId}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to check job status" }, { status: 502 });
  }

  const data = await res.json();

  if (data.status === "completed" && data.content?.full_response) {
    const markdown: string = data.content.full_response;
    const title = extractTitleFromMarkdown(markdown) ?? "SEO Strategy";
    const tenantSlug =
      new URL(_request.url).searchParams.get("tenantSlug") ?? "default";

    try {
      const article = await createArticle({
        jobId,
        markdownContent: markdown,
        tenantSlug,
        title,
      });

      return NextResponse.json({
        ...data,
        article: { id: article.id, slug: article.slug },
      });
    } catch (err) {
      return NextResponse.json({
        ...data,
        articleError: String(err),
      });
    }
  }

  return NextResponse.json(data);
}
