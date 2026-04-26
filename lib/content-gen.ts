export const CONTENT_GEN_URL =
  process.env.CONTENT_GEN_URL ?? "https://content-gen.openhook.dev";

export const CONTENT_GEN_TOKEN = process.env.CONTENT_GEN_TOKEN ?? "";

export function getContentGenHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (CONTENT_GEN_TOKEN) h["Authorization"] = `Bearer ${CONTENT_GEN_TOKEN}`;
  return h;
}

export function getContentGenAuthHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  if (CONTENT_GEN_TOKEN) h["Authorization"] = `Bearer ${CONTENT_GEN_TOKEN}`;
  return h;
}
