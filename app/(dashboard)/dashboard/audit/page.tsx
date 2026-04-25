import { DashboardHeader } from "@/components/dashboard-header";
import { ScoreRing } from "@/components/audit/score-ring";
import { CategoryBar } from "@/components/audit/category-bar";
import { CompetitorTable } from "@/components/audit/competitor-table";
import { RankBetterCta } from "@/components/audit/rank-better-cta";
import { getAudit } from "@/services/audit-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function slugifyTenant(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const audit = await getAudit(url ?? "demo");
  const businessName = audit.business?.name ?? "Your Business";
  const tenantSlug = audit.business
    ? slugifyTenant(audit.business.name)
    : "demo";

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Audit" },
        ]}
      />

      <div className="relative flex flex-1 flex-col gap-10 overflow-auto px-8 py-6 pb-28">
        <div className="flex items-center gap-6">
          <ScoreRing score={audit.overallScore} />
          <Separator orientation="vertical" className="h-10" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{businessName}</span>
            {audit.business?.description && (
              <span className="text-xs text-muted-foreground max-w-md truncate">
                {audit.business.description}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-[var(--shadow-surface)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {audit.categories.map((cat) => (
                <CategoryBar key={cat.name} category={cat} />
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-surface)]">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Competitors
              </CardTitle>
              <span className="text-[11px] text-muted-foreground font-normal">
                {audit.business ? "Local visibility rank" : "Demo data"}
              </span>
            </CardHeader>
            <CardContent>
              <CompetitorTable
                competitors={audit.competitors}
                userRank={audit.userRank}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-lg px-8 py-4">
        <RankBetterCta
          gbpUrl={url ?? ""}
          tenantSlug={tenantSlug}
          competitorUrls={audit.competitors
            .filter((c) => c.url && c.url !== "#")
            .map((c) => c.url)}
          businessName={audit.business?.name}
          businessCategory={audit.business?.category}
          businessLocation={audit.business?.location}
        />
      </div>
    </>
  );
}
