"use server";

import { tavily } from "@tavily/core";

export interface BusinessInfo {
  name: string;
  description: string;
  location: string;
  category: string;
  rating: number | null;
  reviewCount: number | null;
  rawContent: string;
}

export interface CompetitorHit {
  name: string;
  url: string;
  rating: number | null;
  reviewCount: number | null;
}

function getTavily() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("[tavily] TAVILY_API_KEY not set");
    return null;
  }
  return tavily({ apiKey });
}

function parseRating(text: string): number | null {
  const m = text.match(/(\d[.,]\d)\s*(?:stars?|★|⭐|out of|\/\s*5)/i)
    ?? text.match(/(?:rating|rated)[:\s]*(\d[.,]\d)/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  return n >= 1 && n <= 5 ? Math.round(n * 10) / 10 : null;
}

function parseReviewCount(text: string): number | null {
  const m = text.match(/([\d,. ]+)\s*(?:reviews?|ratings?|Google reviews?)/i)
    ?? text.match(/(?:reviews?|ratings?)[:\s]*([\d,. ]+)/i);
  if (!m) return null;
  const n = parseInt(m[1].replace(/[,.\s]/g, ""), 10);
  return n > 0 && n < 100_000 ? n : null;
}

function parseLocation(text: string): string {
  const addressLine = text.match(
    /(?:address|located|location|situated)[:\s]*([^\n]{5,80})/i
  );
  if (addressLine) return addressLine[1].trim();

  const cityCountry = text.match(
    /(?:in|at)\s+([A-Z][a-zA-ZäöüÄÖÜß\s-]+,\s*[A-Z][a-zA-ZäöüÄÖÜß\s-]+)/
  );
  if (cityCountry) return cityCountry[1].trim();

  const fromUrl = text.match(/(?:Berlin|Munich|Hamburg|Cologne|Frankfurt|Stuttgart|Düsseldorf|Leipzig|Dresden|Dortmund|Amsterdam|London|Paris|Madrid|Rome|Vienna|Zürich|Prague|Warsaw|Barcelona|Milan|Brussels|Budapest|Copenhagen|Oslo|Stockholm|Helsinki|Lisbon|Athens|Dublin|New York|Los Angeles|Chicago|Houston|Phoenix|San Francisco|Seattle|Boston|Austin|Denver|Portland)/i);
  if (fromUrl) return fromUrl[0];

  return "";
}

function parseCategory(text: string): string {
  const m = text.match(
    /(?:category|type|business type|listed as)[:\s]*([^\n]{3,60})/i
  );
  if (m) return m[1].trim();

  const common = [
    "Restaurant", "Cafe", "Bakery", "Bar", "Hotel", "Gym", "Salon",
    "Spa", "Market", "Store", "Shop", "Clinic", "Dentist", "Doctor",
    "Pharmacy", "Supermarket", "Fitness", "Yoga", "Pilates",
    "Markthalle", "Bäckerei", "Friseur",
  ];
  for (const cat of common) {
    if (text.toLowerCase().includes(cat.toLowerCase())) return cat;
  }
  return "";
}

export async function extractBusinessInfo(
  gbpUrl: string
): Promise<BusinessInfo | null> {
  const tvly = getTavily();
  if (!tvly) return null;

  if (!gbpUrl || gbpUrl.length < 10) {
    console.warn("[tavily] Invalid URL:", gbpUrl);
    return null;
  }

  try {
    console.log("[tavily] Extracting business info from:", gbpUrl.slice(0, 80));
    const result = await tvly.extract([gbpUrl]);
    const content = result.results?.[0]?.rawContent ?? "";

    if (!content) {
      console.warn("[tavily] No content extracted from URL");
      return null;
    }

    const lines = content.split("\n").filter(Boolean);
    const name = lines[0]?.trim().slice(0, 100) ?? "Unknown Business";
    const description = lines.slice(1, 4).join(" ").trim().slice(0, 300);

    const location = parseLocation(content) || parseLocationFromUrl(gbpUrl);
    const category = parseCategory(content);
    const rating = parseRating(content);
    const reviewCount = parseReviewCount(content);

    console.log("[tavily] Extracted: %s | %s | %s | %.1f ★ | %d reviews",
      name, location || "?", category || "?", rating ?? 0, reviewCount ?? 0);

    return {
      name,
      description,
      location,
      category,
      rating,
      reviewCount,
      rawContent: content.slice(0, 3000),
    };
  } catch (err) {
    console.error("[tavily] Extract failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

function parseLocationFromUrl(url: string): string {
  const decoded = decodeURIComponent(url);
  const placeMatch = decoded.match(/\/maps\/place\/([^/@]+)/);
  if (!placeMatch) return "";
  return placeMatch[1].replace(/\+/g, " ").replace(/@.*/, "").trim();
}

export async function searchCompetitors(
  businessName: string,
  location: string,
  category: string
): Promise<CompetitorHit[]> {
  const tvly = getTavily();
  if (!tvly) return [];

  const query = category && location
    ? `best ${category} in ${location} Google Maps`
    : location
      ? `top rated businesses near ${location} Google Maps`
      : `businesses similar to ${businessName} Google Maps`;

  console.log("[tavily] Searching competitors:", query);

  try {
    const result = await tvly.search(query, {
      maxResults: 10,
      searchDepth: "basic",
      includeAnswer: false,
    });

    const competitors: CompetitorHit[] = [];
    const seenNames = new Set<string>();
    const lowerBizName = businessName.toLowerCase();

    for (const r of result.results ?? []) {
      const text = `${r.title ?? ""} ${r.content ?? ""}`;
      const entryName = extractNameFromResult(r.title ?? "", businessName);

      if (!entryName) continue;
      if (entryName.toLowerCase() === lowerBizName) continue;
      if (seenNames.has(entryName.toLowerCase())) continue;
      seenNames.add(entryName.toLowerCase());

      competitors.push({
        name: entryName,
        url: r.url ?? "#",
        rating: parseRating(text),
        reviewCount: parseReviewCount(text),
      });

      if (competitors.length >= 5) break;
    }

    console.log("[tavily] Found %d competitors", competitors.length);
    return competitors;
  } catch (err) {
    console.error("[tavily] Search failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

function extractNameFromResult(title: string, selfName: string): string | null {
  const cleaned = title
    .replace(/\s*[-–|·•:]\s*Google Maps.*/i, "")
    .replace(/\s*[-–|·•:]\s*Yelp.*/i, "")
    .replace(/\s*[-–|·•:]\s*TripAdvisor.*/i, "")
    .replace(/^\d+\.\s*/, "")
    .replace(/\s*\(.*?\)\s*$/, "")
    .trim();

  if (cleaned.length < 2 || cleaned.length > 80) return null;
  if (cleaned.toLowerCase().includes("best ")) return null;
  if (cleaned.toLowerCase().includes("top ")) return null;
  if (cleaned.toLowerCase() === selfName.toLowerCase()) return null;

  return cleaned;
}
