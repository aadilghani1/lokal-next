import type { AuditContext } from "@/domains/audit";
import type { AuditResult } from "@/services/audit-service";
import { DashboardHeader } from "@/components/dashboard-header";
import { ScoreRing } from "@/components/audit/score-ring";
import { CategoryBar } from "@/components/audit/category-bar";
import { CompetitorTable } from "@/components/audit/competitor-table";
import { RankBetterCta } from "@/components/audit/rank-better-cta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuditViewProps {
  audit: AuditResult;
  context: AuditContext;
}

export function AuditView({ audit, context }: AuditViewProps) {
  const businessName = audit.business?.name ?? "Your Business";

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Audit" },
        ]}
      />

      <div className="relative flex flex-1 flex-col gap-8 overflow-auto px-8 py-6 pb-28">
        <div className="flex items-center gap-6">
          <ScoreRing score={audit.overallScore} />
          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="font-heading text-lg font-semibold tracking-tight truncate">
              {businessName}
            </h2>
            {audit.business?.location && (
              <span className="text-xs text-muted-foreground truncate">
                {audit.business.location}
              </span>
            )}
            {audit.business?.description && (
              <span className="text-xs text-muted-foreground/70 truncate max-w-md">
                {audit.business.description}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-(--shadow-surface)">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {audit.categories.map((cat) => (
                <CategoryBar key={cat.name} category={cat} />
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-(--shadow-surface)">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Competitors
              </CardTitle>
              {audit.business && (
                <span className="text-[11px] text-muted-foreground font-normal">
                  SERP visibility rank
                </span>
              )}
            </CardHeader>
            <CardContent>
              <CompetitorTable
                competitors={audit.competitors}
                userRank={audit.userRank}
              />
            </CardContent>
          </Card>
        </div>

        {audit.categories.some((c) => c.suggestions.length > 0) && (
          <Card className="shadow-(--shadow-surface)">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {audit.categories
                  .flatMap((c) =>
                    c.suggestions.map((s) => ({ category: c.name, suggestion: s })),
                  )
                  .slice(0, 8)
                  .map(({ category, suggestion }) => (
                    <li
                      key={`${category}-${suggestion}`}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="mt-1.5 size-1 rounded-full bg-primary/40 shrink-0" />
                      <span className="text-muted-foreground text-[13px] leading-relaxed">
                        {suggestion}
                      </span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="sticky bottom-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-lg border-t border-border/40 px-8 py-4">
        <RankBetterCta context={context} />
      </div>
    </>
  );
}
