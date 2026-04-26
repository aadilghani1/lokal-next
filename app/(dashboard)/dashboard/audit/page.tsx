import { after } from "next/server";
import { getOrCreateAudit } from "@/services/audit-service";
import { persistAuditResult } from "@/services/audit-persistence";
import { buildAuditContext } from "@/domains/audit/context";
import { AuditView } from "@/components/audit/audit-view";
import { DashboardHeader } from "@/components/dashboard-header";
import { AuditUrlForm } from "@/components/dashboard/audit-url-form";

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
          <h2 className="font-heading text-lg font-medium">
            Paste your Google Maps URL
          </h2>
          <p className="text-sm text-muted-foreground max-w-md text-center">
            Enter your Google Maps business link to get your SEO audit and
            discover competitors.
          </p>
          <div className="w-full max-w-lg mt-4">
            <AuditUrlForm />
          </div>
        </div>
      </>
    );
  }

  const audit = await getOrCreateAudit(url);
  const context = buildAuditContext(audit, url);

  after(() => persistAuditResult(audit, url));

  return <AuditView audit={audit} context={context} />;
}
