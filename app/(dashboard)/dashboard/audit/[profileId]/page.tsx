import { DashboardHeader } from "@/components/dashboard-header";
import { ScoreRing } from "@/components/audit/score-ring";
import { CategoryBar } from "@/components/audit/category-bar";
import { CompetitorTable } from "@/components/audit/competitor-table";
import { RankBetterCta } from "@/components/audit/rank-better-cta";
import { getAudit } from "@/services/audit-service";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
        title="Profile Audit"
        subtitle={`${userCompetitor?.name ?? "Your Business"} · Austin, TX`}
      />
      <div className="relative flex flex-1 flex-col gap-8 overflow-auto p-8 pb-24">
        {/* Score strip */}
        <div className="flex items-center gap-8">
          <ScoreRing score={audit.overallScore} size={64} strokeWidth={5} />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Overall Score
            </span>
            <span className="text-[11px] text-muted-foreground/60">
              out of 100
            </span>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {userCompetitor?.rating ?? "4.6"} ★
            </Badge>
            <Badge variant="secondary">
              {userCompetitor?.reviewCount ?? 248} reviews
            </Badge>
            <Badge variant="secondary">Bakery</Badge>
          </div>
        </div>

        {/* Two-column: breakdown + competitors */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5 rounded-2xl bg-card p-6 shadow-[var(--shadow-surface)]">
            <h2 className="font-heading text-sm font-medium tracking-tight">
              Breakdown
            </h2>
            <div className="flex flex-col gap-3.5">
              {audit.categories.map((cat) => (
                <CategoryBar key={cat.name} category={cat} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5 rounded-2xl bg-card p-6 shadow-[var(--shadow-surface)]">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-medium tracking-tight">
                Competitors
              </h2>
              <span className="text-[11px] text-muted-foreground">
                Local visibility rank
              </span>
            </div>
            <CompetitorTable competitors={audit.competitors} userRank={3} />
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-lg px-8 py-4">
        <RankBetterCta profileId={profileId} />
      </div>
    </>
  );
}
