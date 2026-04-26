import { CONTENT_GEN_URL, getContentGenAuthHeaders } from "@/lib/content-gen";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  const backendRes = await fetch(
    `${CONTENT_GEN_URL}/api/v1/analyze/${jobId}/stream`,
    { headers: getContentGenAuthHeaders() },
  );

  if (!backendRes.ok || !backendRes.body) {
    return new Response("Stream not available", { status: 502 });
  }

  return new Response(backendRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
