"use client";

import { useEffect, useReducer, useState } from "react";
import {
  Brain,
  CircleNotch,
  Lightning,
  Database,
  CheckCircle,
  Clock,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IntentStatus {
  training_samples: number;
  min_samples_required: number;
  samples_remaining: number;
  progress_pct: number;
  ready_to_train: boolean;
  active_model: string | null;
  base_model: string;
  is_fine_tuned: boolean;
  intent_distribution: Record<string, number>;
  recent_samples: {
    keyword: string;
    intent: string;
    source: string;
    created_at: string;
  }[];
  timeline: { date: string; count: number }[];
}

const INTENT_COLORS: Record<string, string> = {
  commercial: "bg-amber-500",
  transactional: "bg-emerald-500",
  informational: "bg-sky-500",
  navigational: "bg-violet-500",
};

const INTENT_TEXT_COLORS: Record<string, string> = {
  commercial: "text-amber-600 dark:text-amber-400",
  transactional: "text-emerald-600 dark:text-emerald-400",
  informational: "text-sky-600 dark:text-sky-400",
  navigational: "text-violet-600 dark:text-violet-400",
};

export default function FineTuningPage() {
  const [status, setStatus] = useState<IntentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, refetch] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const controller = new AbortController();

    async function poll() {
      try {
        const res = await fetch("/api/intent-model", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch status");
        setStatus(await res.json());
        setError(null);
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    poll();
    const interval = setInterval(poll, 30_000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [tick]);

  const totalSamples = status
    ? Object.values(status.intent_distribution).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Fine Tuning" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-8">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <CircleNotch
              className="size-8 animate-spin text-muted-foreground"
              weight="bold"
            />
          </div>
        ) : error && !status ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch}>
                <ArrowClockwise className="size-4" weight="bold" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : status ? (
          <>
            {/* Top stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card size="sm">
                <CardHeader>
                  <CardDescription>Training Samples</CardDescription>
                  <CardAction>
                    <Database className="size-4 text-muted-foreground" />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-semibold tabular-nums">
                    {status.training_samples.toLocaleString()}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {status.min_samples_required} minimum required
                  </p>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardDescription>Collection Progress</CardDescription>
                  <CardAction>
                    <Lightning className="size-4 text-muted-foreground" />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-semibold tabular-nums">
                    {status.progress_pct}%
                  </span>
                  <Progress value={status.progress_pct} className="mt-2">
                    <ProgressLabel className="sr-only">Progress</ProgressLabel>
                    <ProgressValue className="sr-only" />
                  </Progress>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardDescription>Base Model</CardDescription>
                  <CardAction>
                    <Brain className="size-4 text-muted-foreground" />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-default truncate text-left text-sm font-medium">
                        {status.base_model.split("/").pop()}
                      </TooltipTrigger>
                      <TooltipContent>{status.base_model}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {status.is_fine_tuned ? (
                      <Badge variant="default">Fine-tuned</Badge>
                    ) : (
                      <Badge variant="secondary">Base</Badge>
                    )}
                    {status.active_model && (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardDescription>Ready to Train</CardDescription>
                  <CardAction>
                    <CheckCircle
                      className={`size-4 ${status.ready_to_train ? "text-emerald-500" : "text-muted-foreground"}`}
                      weight={status.ready_to_train ? "fill" : "regular"}
                    />
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <span
                    className={`text-2xl font-semibold ${status.ready_to_train ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                  >
                    {status.ready_to_train ? "Yes" : "No"}
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {status.samples_remaining > 0
                      ? `${status.samples_remaining} more samples needed`
                      : "Sufficient samples collected"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Intent distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Intent Distribution</CardTitle>
                <CardDescription>
                  Breakdown of {totalSamples.toLocaleString()} classified
                  samples
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {Object.entries(status.intent_distribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([intent, count]) => {
                      const pct =
                        totalSamples > 0
                          ? Math.round((count / totalSamples) * 100)
                          : 0;
                      return (
                        <div key={intent} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span
                              className={`font-medium capitalize ${INTENT_TEXT_COLORS[intent] ?? ""}`}
                            >
                              {intent}
                            </span>
                            <span className="tabular-nums text-muted-foreground">
                              {count.toLocaleString()}{" "}
                              <span className="text-xs">({pct}%)</span>
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${INTENT_COLORS[intent] ?? "bg-primary"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Timeline + Recent samples */}
            <div className="grid gap-4 lg:grid-cols-3">
              {status.timeline.length > 0 && (
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Collection Timeline</CardTitle>
                    <CardDescription>Samples per day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {status.timeline
                        .slice(-7)
                        .reverse()
                        .map((entry) => {
                          const date = new Date(entry.date);
                          const maxCount = Math.max(
                            ...status.timeline.map((t) => t.count),
                          );
                          const pct =
                            maxCount > 0
                              ? Math.max(
                                  4,
                                  Math.round((entry.count / maxCount) * 100),
                                )
                              : 0;
                          return (
                            <div
                              key={entry.date}
                              className="flex items-center gap-3"
                            >
                              <span className="w-16 shrink-0 text-xs tabular-nums text-muted-foreground">
                                {date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <div className="h-5 flex-1 overflow-hidden rounded bg-muted">
                                <div
                                  className="flex h-full items-center rounded bg-primary/20"
                                  style={{ width: `${pct}%` }}
                                >
                                  <span className="px-2 text-[10px] font-medium tabular-nums text-foreground">
                                    {entry.count.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card
                className={
                  status.timeline.length > 0 ? "lg:col-span-2" : "lg:col-span-3"
                }
              >
                <CardHeader>
                  <CardTitle>Recent Samples</CardTitle>
                  <CardDescription>
                    Latest intent classification training data
                  </CardDescription>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={refetch}
                    >
                      <ArrowClockwise className="size-3.5" weight="bold" />
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  {status.recent_samples.length > 0 ? (
                    <div className="overflow-x-auto **:data-[slot=table-container]:border-0 **:data-[slot=table-container]:shadow-none **:data-[slot=table-container]:rounded-none">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Keyword</TableHead>
                            <TableHead className="w-32">Intent</TableHead>
                            <TableHead className="w-24">Source</TableHead>
                            <TableHead className="w-36 text-right">
                              Date
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {status.recent_samples.map((sample, i) => (
                            <TableRow key={`${sample.keyword}-${i}`}>
                              <TableCell className="max-w-xs truncate font-mono text-xs">
                                {sample.keyword}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={`capitalize ${INTENT_TEXT_COLORS[sample.intent] ?? ""}`}
                                >
                                  {sample.intent}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {sample.source}
                              </TableCell>
                              <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                                <span className="flex items-center justify-end gap-1">
                                  <Clock className="size-3" />
                                  {new Date(
                                    sample.created_at,
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No samples collected yet. Run an analysis to start
                      collecting training data.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
