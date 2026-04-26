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
import { ArticlePreviewPanel } from "@/components/generating/article-preview";
import {
  useEventStream,
  type SSEEvent,
  type StreamStatus,
} from "@/hooks/use-event-stream";

const POLL_INTERVAL = 3000;
const COMPLETION_POLL_MAX = 30_000;

interface StagePayload {
  stage: string;
  detail: string | null;
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
          progress?: { stages?: StagePayload[] };
        };

        if (data.status === "completed" && data.articlesCreated) {
          router.push(
            `/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`,
          );
          return;
        }

        if (!data.progress?.stages) return;

        const restored: SSEEvent[] = data.progress.stages.map((s) => ({
          event: "stage" as const,
          data: { stage: s.stage, detail: s.detail },
        }));
        setHydratedEvents(restored);
      } catch {}
    })();
  }, [jobId, tenantSlug, router]);

  const sseStageMap = new Map<string, StagePayload>();
  for (const e of sseEvents) {
    if (e.event === "stage") sseStageMap.set(e.data.stage, e.data);
  }

  const mergedHydrated: SSEEvent[] = hydratedEvents.map((e) => {
    if (e.event !== "stage") return e;
    const sseVersion = sseStageMap.get(e.data.stage);
    if (sseVersion) return { event: "stage" as const, data: sseVersion };
    return e;
  });

  const hydratedStages = new Set(
    mergedHydrated
      .filter(
        (e): e is SSEEvent & { event: "stage" } => e.event === "stage",
      )
      .map((e) => e.data.stage),
  );

  const deduped = sseEvents.filter((e) => {
    if (e.event !== "stage") return true;
    const stage = (e as SSEEvent & { event: "stage" }).data.stage;
    if (hydratedStages.has(stage)) return false;
    hydratedStages.add(stage);
    return true;
  });

  const allEvents = [...mergedHydrated, ...deduped];

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
            const data = (await res.json()) as {
              articlesCreated?: boolean;
            };
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
        progress?: { stages?: StagePayload[] };
      };

      if (data.progress?.stages) {
        const restored: SSEEvent[] = data.progress.stages.map((s) => ({
          event: "stage" as const,
          data: { stage: s.stage, detail: s.detail },
        }));
        setHydratedEvents(restored);
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

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Generating" },
        ]}
      />

      <ProgressHeader
        businessName={businessName}
        status={status}
        pollFallback={pollFallback}
        completedPhases={completedCount}
        totalPhases={PHASES.length}
        activePhaseLabel={activePhaseLabel}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-[3] overflow-y-auto border-r border-border/50 px-8 py-8 lg:px-12">
          <PhaseTimeline
            events={allEvents}
            statuses={phaseStatuses}
            isStreaming={isStreaming}
          />
        </div>

        <div className="flex-[2] overflow-y-auto px-8 py-8 lg:px-10">
          <ArticlePreviewPanel events={allEvents} isComplete={isComplete} />
        </div>
      </div>
    </>
  );
}
