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
  organicTraffic?: number | null;
  organicKeywords?: number | null;
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

function parseNameFromMapsUrl(url: string): string | null {
  const decoded = decodeURIComponent(url);
  const m = decoded.match(/\/maps\/place\/([^/@]+)/);
  if (!m) return null;
  return m[1].replace(/\+/g, " ").replace(/_/g, " ").trim() || null;
}

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";

interface PlacesResult {
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  website?: string;
  editorial_summary?: { overview?: string };
}

async function findPlaceFromMapsUrl(mapsUrl: string): Promise<PlacesResult | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn("[places] GOOGLE_PLACES_API_KEY not set");
    return null;
  }

  const name = parseNameFromMapsUrl(mapsUrl);
  if (!name) return null;

  const locationHint = parseLocationFromUrl(mapsUrl);
  const query = locationHint ? `${name} ${locationHint}` : name;

  try {
    const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${GOOGLE_PLACES_API_KEY}`;
    const findRes = await fetch(findUrl);
    const findData = await findRes.json() as { candidates?: { place_id?: string }[] };
    const placeId = findData.candidates?.[0]?.place_id;
    if (!placeId) return null;

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,user_ratings_total,types,website,editorial_summary&key=${GOOGLE_PLACES_API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json() as { result?: PlacesResult };
    return detailsData.result ?? null;
  } catch (err) {
    console.error("[places] API failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

function typesToCategory(types: string[]): string {
  const mapping: Record<string, string> = {
    restaurant: "Restaurant", cafe: "Cafe", bakery: "Bakery", bar: "Bar",
    hotel: "Hotel", gym: "Gym", hair_care: "Salon", beauty_salon: "Salon",
    spa: "Spa", store: "Store", shopping_mall: "Store", dentist: "Dentist",
    doctor: "Doctor", pharmacy: "Pharmacy", supermarket: "Supermarket",
    meal_delivery: "Restaurant", meal_takeaway: "Restaurant",
    lodging: "Hotel", night_club: "Bar", car_wash: "Car Wash",
    laundry: "Laundry", real_estate_agency: "Real Estate",
    insurance_agency: "Insurance", accounting: "Accounting",
    lawyer: "Lawyer", plumber: "Plumber", electrician: "Electrician",
    moving_company: "Moving Company", locksmith: "Locksmith",
    painter: "Painter", roofing_contractor: "Roofing",
    home_goods_store: "Home Goods",
  };
  for (const t of types) {
    if (mapping[t]) return mapping[t];
  }
  return types[0]?.replace(/_/g, " ") ?? "";
}

export async function extractBusinessInfo(
  gbpUrl: string
): Promise<BusinessInfo | null> {
  if (!gbpUrl || gbpUrl.length < 10) {
    console.warn("[biz] Invalid URL:", gbpUrl);
    return null;
  }

  const isGoogleMaps = gbpUrl.includes("google.com/maps") || gbpUrl.includes("maps.google") || gbpUrl.includes("share.google");

  if (isGoogleMaps) {
    console.log("[biz] Google Maps URL detected, using Places API");
    const place = await findPlaceFromMapsUrl(gbpUrl);

    if (place) {
      const category = place.types ? typesToCategory(place.types) : "";
      const location = place.formatted_address ?? "";
      const description = place.editorial_summary?.overview ?? `${place.name} located at ${location}`;

      console.log("[biz] Places API: %s | %s | %s | %.1f ★ | %d reviews",
        place.name, location, category, place.rating ?? 0, place.user_ratings_total ?? 0);

      return {
        name: place.name,
        description,
        location,
        category,
        rating: place.rating ?? null,
        reviewCount: place.user_ratings_total ?? null,
        rawContent: JSON.stringify(place),
      };
    }

    console.warn("[biz] Places API failed, falling back to name parse + Tavily search");
  }

  // Non-Maps URL or Places API fallback: extract with Tavily
  const tvly = getTavily();
  if (!tvly) return null;

  try {
    console.log("[biz] Extracting with Tavily from:", gbpUrl.slice(0, 80));
    const result = await tvly.extract([gbpUrl]);
    const content = result.results?.[0]?.rawContent ?? "";

    if (!content) {
      console.warn("[biz] No content extracted from URL");
      return null;
    }

    const lines = content.split("\n").filter(Boolean);
    const name = lines[0]?.trim().slice(0, 100) ?? "Unknown Business";
    const description = lines.slice(1, 4).join(" ").trim().slice(0, 300);

    const location = parseLocation(content) || parseLocationFromUrl(gbpUrl);
    const category = parseCategory(content);
    const rating = parseRating(content);
    const reviewCount = parseReviewCount(content);

    console.log("[biz] Extracted: %s | %s | %s | %.1f ★ | %d reviews",
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
    console.error("[biz] Extract failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

function parseLocationFromUrl(url: string): string {
  const decoded = decodeURIComponent(url);
  const placeMatch = decoded.match(/\/maps\/place\/([^/@]+)/);
  if (!placeMatch) return "";
  return placeMatch[1].replace(/\+/g, " ").replace(/@.*/, "").trim();
}

const CONTENT_GEN_URL = process.env.CONTENT_GEN_URL ?? "https://content-gen.openhook.dev";
const CONTENT_GEN_TOKEN = process.env.CONTENT_GEN_TOKEN ?? "";

export async function searchCompetitors(
  businessName: string,
  location: string,
  category: string
): Promise<CompetitorHit[]> {
  console.log("[competitors] Discovering via SERP: %s / %s / %s", businessName, location, category);

  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (CONTENT_GEN_TOKEN) headers["Authorization"] = `Bearer ${CONTENT_GEN_TOKEN}`;

    const res = await fetch(`${CONTENT_GEN_URL}/api/v1/discover-competitors`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        business_name: businessName,
        business_category: category,
        business_location: location,
      }),
    });

    if (!res.ok) {
      console.error("[competitors] Backend returned %d", res.status);
      return [];
    }

    const data = await res.json() as {
      competitors: {
        domain: string;
        url: string;
        title: string;
        organic_traffic: number | null;
        organic_keywords: number | null;
        serp_appearances: number;
        best_rank: number;
      }[];
    };

    return data.competitors.map((c) => ({
      name: c.title || c.domain,
      url: c.url,
      rating: null,
      reviewCount: null,
      organicTraffic: c.organic_traffic,
      organicKeywords: c.organic_keywords,
    }));
  } catch (err) {
    console.error("[competitors] Discovery failed:", err instanceof Error ? err.message : err);
    return [];
  }
}
