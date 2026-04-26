"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { ProgressHeader } from "@/components/generating/progress-header";
import {
  PhaseTimeline,
  PHASES,
  getPhaseStatuses,
} from "@/components/generating/phase-timeline";
import { useEventStream, type SSEEvent } from "@/hooks/use-event-stream";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

const POLL_INTERVAL = 3000;
const COMPLETION_POLL_MAX = 30_000;

interface BackendStage {
  name: string;
  stage?: string;
  detail: string | null;
  started_at?: string;
}

export default function GeneratingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("jobId") ?? "";
  const tenantSlug = searchParams.get("tenantSlug") ?? "default";
  const businessName = searchParams.get("businessName") ?? "Your Business";

  const { events: sseEvents, status } = useEventStream(jobId || null);
  const [hydratedEvents, setHydratedEvents] = useState<SSEEvent[]>([]);
  const hydrated = useRef(false);

  const pollFallback = status === "error";

  useEffect(() => {
    if (!jobId || hydrated.current) return;
    hydrated.current = true;

    (async () => {
      try {
        const res = await fetch(
          `/api/rank-better/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`,
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          status: string;
          articlesCreated?: boolean;
          progress?: {
            stages?: BackendStage[];
            current_stage?: string;
            current_detail?: string | null;
          };
        };

        if (data.status === "completed" && data.articlesCreated) {
          router.push(
            `/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`,
          );
          return;
        }

        if (!data.progress?.stages) return;
        setHydratedEvents(
          data.progress.stages.map((s) => ({
            event: "stage" as const,
            data: { stage: s.name ?? s.stage ?? "", detail: s.detail },
          })),
        );
      } catch {}
    })();
  }, [jobId, tenantSlug, router]);

  const allEvents = useMergedEvents(hydratedEvents, sseEvents);

  useEffect(() => {
    if (status !== "complete" || !jobId) return;
    const started = Date.now();
    let cancelled = false;

    async function pollForArticles() {
      while (!cancelled && Date.now() - started < COMPLETION_POLL_MAX) {
        try {
          const res = await fetch(
            `/api/rank-better/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`,
          );
          if (res.ok) {
            const data = (await res.json()) as { articlesCreated?: boolean };
            if (data.articlesCreated) {
              router.push(
                `/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`,
              );
              return;
            }
          }
        } catch {}
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
      }
      if (!cancelled) {
        router.push(
          `/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`,
        );
      }
    }

    pollForArticles();
    return () => {
      cancelled = true;
    };
  }, [status, jobId, tenantSlug, router]);

  const poll = useCallback(async () => {
    if (!jobId || !pollFallback) return;
    try {
      const res = await fetch(
        `/api/rank-better/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        status: string;
        articlesCreated?: boolean;
        progress?: { stages?: BackendStage[] };
      };

      if (data.progress?.stages) {
        setHydratedEvents(
          data.progress.stages.map((s) => ({
            event: "stage" as const,
            data: { stage: s.name ?? s.stage ?? "", detail: s.detail },
          })),
        );
      }

      if (data.status === "completed" && data.articlesCreated) {
        router.push(
          `/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`,
        );
      }
    } catch {}
  }, [jobId, tenantSlug, router, pollFallback]);

  useEffect(() => {
    if (!pollFallback) return;
    const timer = setTimeout(poll, 0);
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [pollFallback, poll]);

  const isActive =
    status === "connecting" || status === "connected" || pollFallback;

  useEffect(() => {
    if (!isActive) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isActive]);

  const isStreaming =
    status === "connected" || status === "connecting" || pollFallback;
  const isComplete = status === "complete";
  const phaseStatuses = getPhaseStatuses(allEvents);
  const completedCount = phaseStatuses.filter((s) => s === "done").length;
  const activeIdx = phaseStatuses.findIndex((s) => s === "active");
  const activePhaseLabel = activeIdx >= 0 ? PHASES[activeIdx].label : null;

  const articleCount = allEvents.filter((e) => e.event === "article").length;
  const completeEvent = allEvents.find((e) => e.event === "complete");
  const totalArticles =
    completeEvent?.event === "complete"
      ? completeEvent.data.articles_count
      : articleCount;

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Generating" },
        ]}
      />

      <div className="flex flex-1 flex-col overflow-y-auto bg-muted/30">
        <ProgressHeader
          businessName={businessName}
          status={status}
          completedPhases={isComplete ? PHASES.length : completedCount}
          totalPhases={PHASES.length}
          activePhaseLabel={activePhaseLabel}
          isError={pollFallback}
        />

        <div className="flex flex-1 justify-center px-6 py-8 sm:px-8 sm:py-10">
          <div className="w-full max-w-xl">
            <div className="rounded-xl border border-border bg-background p-6 sm:p-8 shadow-sm">
              <PhaseTimeline
                events={allEvents}
                statuses={phaseStatuses}
                isStreaming={isStreaming}
              />
            </div>

            {(articleCount > 0 || isComplete) && (
              <div className="mt-4 rounded-xl border border-primary/10 bg-background p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold tracking-tight">
                    Articles
                  </span>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {totalArticles} generated
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {allEvents
                    .filter(
                      (e): e is SSEEvent & { event: "article" } =>
                        e.event === "article",
                    )
                    .map((e, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
                      >
                        <span className="flex size-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary tabular-nums shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[13px] font-medium leading-snug line-clamp-2">
                            {e.data.meta_title || e.data.target_keyword}
                          </span>
                          {e.data.target_keyword && (
                            <span className="mt-1 inline-block rounded bg-muted px-1.5 py-px text-[10px] text-muted-foreground">
                              {e.data.target_keyword}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                  {isComplete && (
                    <div className="flex items-center gap-2 mt-1 text-[13px] font-medium text-primary">
                      <CheckCircle className="size-4 shrink-0" weight="fill" />
                      {totalArticles} article
                      {totalArticles !== 1 ? "s" : ""} ready to review
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function useMergedEvents(
  hydratedEvents: SSEEvent[],
  sseEvents: SSEEvent[],
): SSEEvent[] {
  const sseStageMap = new Map<
    string,
    { stage: string; detail: string | null }
  >();
  for (const e of sseEvents) {
    if (e.event === "stage") sseStageMap.set(e.data.stage, e.data);
  }

  const mergedHydrated: SSEEvent[] = hydratedEvents.map((e) => {
    if (e.event !== "stage") return e;
    return {
      event: "stage" as const,
      data: sseStageMap.get(e.data.stage) ?? e.data,
    };
  });

  const hydratedStages = new Set(
    mergedHydrated
      .filter((e): e is SSEEvent & { event: "stage" } => e.event === "stage")
      .map((e) => e.data.stage),
  );

  const deduped = sseEvents.filter((e) => {
    if (e.event !== "stage") return true;
    if (hydratedStages.has(e.data.stage)) return false;
    hydratedStages.add(e.data.stage);
    return true;
  });

  return [...mergedHydrated, ...deduped];
}
