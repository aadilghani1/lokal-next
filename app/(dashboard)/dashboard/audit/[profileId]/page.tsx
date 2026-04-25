import { DashboardHeader } from "@/components/dashboard-header";
import { ScoreRing } from "@/components/audit/score-ring";
import { CategoryBar } from "@/components/audit/category-bar";
import { CompetitorTable } from "@/components/audit/competitor-table";
import { RankBetterCta } from "@/components/audit/rank-better-cta";
import { getAudit } from "@/services/audit-service";
import { Badge } from "@/components/ui/badge";

export default async function AuditPage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const audit = await getAudit(profileId);
  const userCompetitor = audit.competitors.find((c) => c.rank === 3);

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Audit" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-7 p-8">
        <div className="flex items-center gap-10 rounded-2xl bg-card p-8 shadow-[var(--shadow-surface)]">
          <ScoreRing score={audit.overallScore} />
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              Profile Audit
            </span>
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {userCompetitor?.name ?? "Your Business"}
            </h1>
            <p className="text-sm text-muted-foreground">
              123 Main Street, Austin, TX 78701
            </p>
            <div className="flex gap-2 pt-1">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {userCompetitor?.rating ?? "4.6"} ★
              </Badge>
              <Badge variant="secondary">
                {userCompetitor?.reviewCount ?? 248} reviews
              </Badge>
              <Badge variant="secondary">Bakery</Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold">Category Breakdown</h2>
          <div className="flex flex-col gap-3">
            {audit.categories.map((cat) => (
              <CategoryBar key={cat.name} category={cat} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Top 5 Competitors</h2>
            <span className="text-xs text-muted-foreground">
              Ranked by local visibility
            </span>
          </div>
          <CompetitorTable competitors={audit.competitors} userRank={3} />
        </div>

        <RankBetterCta profileId={profileId} />
      </div>
    </>
  );
}
