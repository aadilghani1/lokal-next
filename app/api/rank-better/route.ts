import { NextResponse } from "next/server";
import { createArticle } from "@/services/article-service";
import { rankBetterRequestSchema } from "@/domains/article";
import { extractBusinessInfo } from "@/services/tavily-service";

interface RankBetterResponse {
  jobId: string;
  article: { id: string; slug: string };
}

const CONTENT_GEN_URL =
  process.env.CONTENT_GEN_URL ?? "https://content-gen.openhook.dev";
const CONTENT_GEN_TOKEN = process.env.CONTENT_GEN_TOKEN ?? "";

export async function POST(
  request: Request
): Promise<NextResponse<RankBetterResponse | { error: string }>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = rankBetterRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { gbpUrl, tenantSlug } = parsed.data;

  try {
    // Extract business info from Google Business Profile
    const business = await extractBusinessInfo(gbpUrl);

    // Call content-gen API
    const analyzeBody: Record<string, unknown> = {};
    if (business) {
      analyzeBody.business_name = business.name;
      if (business.category) analyzeBody.business_category = business.category;
      if (business.location) analyzeBody.business_location = business.location;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (CONTENT_GEN_TOKEN) {
      headers["Authorization"] = `Bearer ${CONTENT_GEN_TOKEN}`;
    }

    const res = await fetch(`${CONTENT_GEN_URL}/api/v1/analyze`, {
      method: "POST",
      headers,
      body: JSON.stringify(analyzeBody),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[rank-better] content-gen error:", res.status, errBody);
      return NextResponse.json(
        { error: "Content generation failed. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const markdown: string = data.content?.full_response ?? "";
    const title =
      extractTitleFromMarkdown(markdown) ??
      `SEO Strategy for ${business?.name ?? "Your Business"}`;

    const jobId = crypto.randomUUID();
    const article = await createArticle({
      jobId,
      markdownContent: markdown,
      tenantSlug,
      title,
    });

    return NextResponse.json({
      jobId,
      article: { id: article.id, slug: article.slug },
    });
  } catch (err) {
    console.error("rank-better failed:", err);
    return NextResponse.json(
      { error: "Failed to generate article. Please try again." },
      { status: 500 }
    );
  }
}

function extractTitleFromMarkdown(md: string): string | null {
  const match = md.match(/^#\s+(.+)$/m);
  return match ? match[1].trim().slice(0, 200) : null;
}
