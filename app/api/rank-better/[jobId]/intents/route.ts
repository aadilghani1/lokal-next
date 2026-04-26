import { NextResponse } from "next/server";
import { CONTENT_GEN_URL, getContentGenHeaders } from "@/lib/content-gen";
import type { BackendResponse } from "@/domains/article";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  const res = await fetch(`${CONTENT_GEN_URL}/api/v1/analyze/${jobId}`, {
    headers: getContentGenHeaders(),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch job data" },
      { status: res.status },
    );
  }

  const data = (await res.json()) as BackendResponse;

  return NextResponse.json({
    keyword_intents: data.keyword_intents ?? null,
    business_name: data.business?.name ?? null,
    total_keywords_found: data.total_keywords_found ?? 0,
  });
}
