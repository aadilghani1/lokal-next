const CONTENT_GEN_URL =
  process.env.CONTENT_GEN_URL ?? "https://content-gen.openhook.dev";
const CONTENT_GEN_TOKEN = process.env.CONTENT_GEN_TOKEN ?? "";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const headers: Record<string, string> = {};
  if (CONTENT_GEN_TOKEN)
    headers["Authorization"] = `Bearer ${CONTENT_GEN_TOKEN}`;

  const backendRes = await fetch(
    `${CONTENT_GEN_URL}/api/v1/analyze/${jobId}/stream`,
    { headers }
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
