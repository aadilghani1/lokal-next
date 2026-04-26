"use client";

import { useCallback, useEffect, useState } from "react";
import { Brain, CircleNotch } from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IntentStatus {
  training_samples: number;
  min_samples_required: number;
  ready_to_train: boolean;
  active_model: string | null;
  base_model: string;
  is_fine_tuned: boolean;
  intent_distribution: Record<string, number>;
  recent_samples: {
    keyword: string;
    intent: string;
  }[];
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

export function IntentModelCard() {
  const [status, setStatus] = useState<IntentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/intent-model");
      if (!res.ok) return;
      setStatus(await res.json());
    } catch {
      /* graceful — card won't render */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  if (loading) {
    return (
      <Card className="shadow-(--shadow-surface)">
        <CardContent className="flex items-center justify-center py-10">
          <CircleNotch
            className="size-5 animate-spin text-muted-foreground"
            weight="bold"
          />
        </CardContent>
      </Card>
    );
  }

  if (!status || status.training_samples === 0) return null;

  const total = Object.values(status.intent_distribution).reduce(
    (a, b) => a + b,
    0,
  );
  const sorted = Object.entries(status.intent_distribution).sort(
    ([, a], [, b]) => b - a,
  );
  const maxCount = sorted[0]?.[1] ?? 1;

  const modelName = status.base_model.split("/").pop() ?? status.base_model;
  const recentSamples = status.recent_samples.slice(0, 5);

  return (
    <Card className="shadow-(--shadow-surface)">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Brain className="size-4" weight="bold" />
          Intent Model
        </CardTitle>
        <CardDescription>
          {total.toLocaleString()} keywords from analyses powering intent
          classification
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Distribution bars */}
        <div className="flex flex-col gap-2">
          {sorted.map(([intent, count]) => {
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={intent} className="flex items-center gap-3">
                <span
                  className={`w-28 shrink-0 text-[13px] font-medium capitalize ${INTENT_TEXT[intent] ?? ""}`}
                >
                  {intent}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${INTENT_COLORS[intent] ?? "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-mono tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Recent classifications */}
        {recentSamples.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Recent classifications
            </span>
            {recentSamples.map((s, i) => (
              <div
                key={`${s.keyword}-${i}`}
                className="flex items-center justify-between text-[13px]"
              >
                <span className="truncate mr-3 font-mono text-xs">
                  {s.keyword}
                </span>
                <Badge
                  variant="secondary"
                  className={`shrink-0 capitalize ${INTENT_TEXT[s.intent] ?? ""}`}
                >
                  {s.intent}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Model status footer */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground border-t pt-3">
          <span>
            Model:{" "}
            <span className="font-medium text-foreground">
              {status.is_fine_tuned
                ? `${modelName} fine-tuned`
                : `${modelName} base`}
            </span>
          </span>
          <span>
            Status:{" "}
            <span className="font-medium text-foreground">
              {status.is_fine_tuned && status.active_model
                ? `Active — trained on ${total.toLocaleString()} samples`
                : status.ready_to_train
                  ? `Ready to fine-tune (${total.toLocaleString()}/${status.min_samples_required} samples)`
                  : `Collecting samples (${total.toLocaleString()}/${status.min_samples_required})`}
            </span>
          </span>
          <a
            href="/dashboard/fine-tuning"
            className="ml-auto text-xs text-primary hover:underline"
          >
            View details
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
