import { DashboardHeader } from "@/components/dashboard-header";
import { ScoreRing } from "@/components/audit/score-ring";
import { CategoryBar } from "@/components/audit/category-bar";
import { CompetitorTable } from "@/components/audit/competitor-table";
import { RankBetterCta } from "@/components/audit/rank-better-cta";
import { getAudit } from "@/services/audit-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const audit = await getAudit(url ?? "demo");
  const userCompetitor = audit.competitors.find((c) => c.rank === 3);

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
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {userCompetitor?.rating ?? "4.6"} ★
            </Badge>
            <Badge variant="secondary">
              {userCompetitor?.reviewCount ?? 248} reviews
            </Badge>
            <Badge variant="secondary">Bakery</Badge>
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
                Local visibility rank
              </span>
            </CardHeader>
            <CardContent>
              <CompetitorTable
                competitors={audit.competitors}
                userRank={3}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-lg px-8 py-4">
        <RankBetterCta gbpUrl={url ?? ""} />
      </div>
    </>
  );
}
