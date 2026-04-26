import { NextResponse } from "next/server";
import { CONTENT_GEN_URL, getContentGenHeaders } from "@/lib/content-gen";

export async function GET() {
  const res = await fetch(
    `${CONTENT_GEN_URL}/api/v1/intent-model/status`,
    { headers: getContentGenHeaders(), cache: "no-store" },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch intent model status" },
      { status: res.status },
    );
  }

  return NextResponse.json(await res.json());
}

export async function POST() {
  const res = await fetch(
    `${CONTENT_GEN_URL}/api/v1/intent-model/train`,
    { method: "POST", headers: getContentGenHeaders() },
  );

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json(
      { error: body || "Failed to start training" },
      { status: res.status },
    );
  }

  return NextResponse.json(await res.json());
}
