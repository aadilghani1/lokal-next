import { after } from "next/server";
import { getOrCreateAudit } from "@/services/audit-service";
import { persistAuditResult } from "@/services/audit-persistence";
import { buildAuditContext } from "@/domains/audit/context";
import { AuditView } from "@/components/audit/audit-view";

export default async function AuditResultsPage({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const { url } = await params;
  const decodedUrl = decodeURIComponent(url);
  const audit = await getOrCreateAudit(decodedUrl);
  const context = buildAuditContext(audit, decodedUrl);

  after(() => persistAuditResult(audit, decodedUrl));

  return <AuditView audit={audit} context={context} />;
}
