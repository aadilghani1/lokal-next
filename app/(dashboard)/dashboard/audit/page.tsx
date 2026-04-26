import { after } from "next/server";
import { getOrCreateAudit } from "@/services/audit-service";
import { persistAuditResult } from "@/services/audit-persistence";
import { buildAuditContext } from "@/domains/audit/context";
import { AuditView } from "@/components/audit/audit-view";
import { DashboardHeader } from "@/components/dashboard-header";
import { AuditUrlForm } from "@/components/dashboard/audit-url-form";
import { getCurrentUser } from "@/services/user-service";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;

  if (!url) {
    return (
      <>
        <DashboardHeader
          segments={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Audit" },
          ]}
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12">
          <div className="w-full max-w-lg mt-4">
            <AuditUrlForm />
          </div>
        </div>
      </>
    );
  }

  const [audit, user] = await Promise.all([
    getOrCreateAudit(url),
    getCurrentUser().catch(() => null),
  ]);
  const context = buildAuditContext(audit, url);

  after(() => persistAuditResult(audit, url, user));

  return <AuditView audit={audit} context={context} />;
}
