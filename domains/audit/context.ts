import type { AuditContext } from "./types";
import { slugify } from "@/lib/slugify";

interface AuditBusiness {
  name: string;
  category: string;
  location: string;
  rating: number | null;
  reviewCount: number | null;
}

interface AuditLike {
  business: AuditBusiness | null;
  competitors: { url: string }[];
}

function buildBusinessContext(
  business: AuditBusiness,
): NonNullable<AuditContext["business"]> {
  return {
    name: business.name,
    category: business.category,
    location: business.location,
    rating: business.rating ?? undefined,
    reviewCount: business.reviewCount ?? undefined,
  };
}

export function buildAuditContext(
  audit: AuditLike,
  gbpUrl: string,
  profileId: string | null = null,
  tenantSlug?: string,
): AuditContext {
  const competitorUrls = audit.competitors
    .filter((c) => c.url && c.url !== "#")
    .map((c) => c.url);

  return {
    gbpUrl,
    profileId,
    tenantSlug: tenantSlug ?? (audit.business ? slugify(audit.business.name) : "demo"),
    business: audit.business ? buildBusinessContext(audit.business) : null,
    competitorUrls,
  };
}
