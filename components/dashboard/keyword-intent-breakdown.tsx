"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Brain,
  CircleNotch,
  TrendUp,
} from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KeywordIntent {
  intent: string;
  weight: number;
  search_volume?: number;
}

interface IntentsResponse {
  keyword_intents: Record<string, KeywordIntent> | null;
  business_name: string | null;
  total_keywords_found: number;
}

const INTENT_COLORS: Record<string, string> = {
  commercial: "bg-amber-500",
  transactional: "bg-emerald-500",
  informational: "bg-sky-500",
  navigational: "bg-violet-500",
};

const INTENT_TEXT: Record<string, string> = {
  commercial: "text-amber-600 dark:text-amber-400",
  transactional: "text-emerald-600 dark:text-emerald-400",
  informational: "text-sky-600 dark:text-sky-400",
  navigational: "text-violet-600 dark:text-violet-400",
};

export function KeywordIntentBreakdown({ jobId }: { jobId: string }) {
  const [data, setData] = useState<IntentsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIntents = useCallback(async () => {
    try {
      const res = await fetch(`/api/rank-better/${jobId}/intents`);
      if (!res.ok) return;
      setData(await res.json());
    } catch {
      /* graceful fallback — section simply won't render */
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchIntents();
  }, [fetchIntents]);

  if (loading) {
    return (
      <Card className="shadow-(--shadow-surface)">
        <CardContent className="flex items-center justify-center py-12">
          <CircleNotch
            className="size-5 animate-spin text-muted-foreground"
            weight="bold"
          />
        </CardContent>
      </Card>
    );
  }

  if (!data?.keyword_intents || Object.keys(data.keyword_intents).length === 0) {
    return null;
  }

  const intents = data.keyword_intents;
  const total = Object.keys(intents).length;

  const distribution: Record<string, string[]> = {};
  for (const [kw, info] of Object.entries(intents)) {
    const intent = info.intent;
    if (!distribution[intent]) distribution[intent] = [];
    distribution[intent].push(kw);
  }

  const sorted = Object.entries(distribution).sort(
    ([, a], [, b]) => b.length - a.length,
  );
  const maxCount = sorted[0]?.[1].length ?? 1;

  const topByIntent = sorted.map(([intent, keywords]) => {
    const withVolume = keywords
      .map((kw) => ({ keyword: kw, volume: intents[kw].search_volume ?? 0 }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3);
    return { intent, keywords: withVolume };
  });

  const businessLabel = data.business_name ?? "Your Business";

  return (
    <Card className="shadow-(--shadow-surface)">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Brain className="size-4" weight="bold" />
          Keywords Analyzed for {businessLabel}
        </CardTitle>
        <CardDescription>
          {total} keywords classified by search intent
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Distribution bars */}
        <div className="flex flex-col gap-2.5">
          {sorted.map(([intent, keywords]) => {
            const count = keywords.length;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={intent} className="flex items-center gap-3">
                <span
                  className={`w-28 shrink-0 text-[13px] font-medium capitalize ${INTENT_TEXT[intent] ?? ""}`}
                >
                  {intent}
                </span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${INTENT_COLORS[intent] ?? "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[13px] font-mono tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Top keywords per intent */}
        <div className="grid gap-4 sm:grid-cols-2">
          {topByIntent.map(({ intent, keywords }) => (
            <div key={intent} className="flex flex-col gap-1.5">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${INTENT_TEXT[intent] ?? ""}`}
              >
                {intent}
              </span>
              {keywords.map(({ keyword, volume }) => (
                <div
                  key={keyword}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
                >
                  <span className="text-[13px] font-medium truncate mr-3">
                    {keyword}
                  </span>
                  {volume > 0 && (
                    <span className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground tabular-nums">
                      <TrendUp className="size-3" />
                      {volume.toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer message */}
        <div className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-3">
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            These {total} keywords are now training the Lokal intent model. The
            more businesses use Lokal, the better it understands local search.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
