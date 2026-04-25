import { NextResponse } from "next/server";
import { rankBetterRequestSchema } from "@/domains/article";
import { extractBusinessInfo } from "@/services/tavily-service";

const CONTENT_GEN_URL =
  process.env.CONTENT_GEN_URL ?? "https://content-gen.openhook.dev";
const CONTENT_GEN_TOKEN = process.env.CONTENT_GEN_TOKEN ?? "";

function getHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (CONTENT_GEN_TOKEN) h["Authorization"] = `Bearer ${CONTENT_GEN_TOKEN}`;
  return h;
}

export async function POST(request: Request) {
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

  const { gbpUrl, tenantSlug, competitorUrls, businessName, businessCategory, businessLocation } = parsed.data;

  try {
    const analyzeBody: Record<string, unknown> = {};

    if (businessName) analyzeBody.business_name = businessName;
    if (businessCategory) analyzeBody.business_category = businessCategory;
    if (businessLocation) analyzeBody.business_location = businessLocation;
    if (competitorUrls && competitorUrls.length > 0) {
      analyzeBody.competitor_urls = competitorUrls;
    }

    if (!analyzeBody.business_name) {
      const business = await extractBusinessInfo(gbpUrl);
      if (business) {
        analyzeBody.business_name = business.name;
        if (business.category && !analyzeBody.business_category) analyzeBody.business_category = business.category;
        if (business.location && !analyzeBody.business_location) analyzeBody.business_location = business.location;
      }
    }

    const startRes = await fetch(`${CONTENT_GEN_URL}/api/v1/analyze`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(analyzeBody),
    });

    if (!startRes.ok) {
      const errBody = await startRes.text().catch(() => "");
      console.error("[rank-better] start failed:", startRes.status, errBody);
      return NextResponse.json(
        { error: "Content generation failed to start." },
        { status: 502 }
      );
    }

    const startData = await startRes.json();

    return NextResponse.json({
      jobId: startData.job_id,
      tenantSlug,
      businessName: (analyzeBody.business_name as string) ?? "Your Business",
    });
  } catch (err) {
    console.error("rank-better failed:", err);
    return NextResponse.json(
      { error: "Failed to generate article. Please try again." },
      { status: 500 }
    );
  }
}
