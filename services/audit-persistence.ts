"use server";

import type { AuditResult } from "@/services/audit-service";
import type { AuditContext } from "@/domains/audit";
import { buildAuditContext } from "@/domains/audit/context";
import { getCurrentUser } from "@/services/user-service";
import { findOrCreateProfile, saveAudit } from "@/services/profile-service";

export async function persistAuditResult(
  audit: AuditResult,
  gbpUrl: string,
): Promise<AuditContext> {
  if (!audit.business || gbpUrl === "demo") {
    return buildAuditContext(audit, gbpUrl, null, "demo");
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return buildAuditContext(audit, gbpUrl);
    }

    const competitorUrls = audit.competitors
      .filter((c) => c.url && c.url !== "#")
      .map((c) => c.url);

    const profile = await findOrCreateProfile(user.id, gbpUrl, {
      name: audit.business.name,
      category: audit.business.category,
      location: audit.business.location,
      rating: audit.business.rating ?? undefined,
      reviewCount: audit.business.reviewCount ?? undefined,
      competitorUrls,
      photoRefs: audit.business.photoRefs,
    });

    await saveAudit(
      profile.id,
      audit.overallScore,
      audit.categories,
      audit.competitors,
    );

    return buildAuditContext(audit, gbpUrl, profile.id, profile.tenantSlug);
  } catch (err) {
    console.error("[audit] Failed to persist profile:", err);
    return buildAuditContext(audit, gbpUrl);
  }
}
