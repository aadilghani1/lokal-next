"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { EventFeed } from "@/components/generating/event-feed";
import { useEventStream, type SSEEvent, type StreamStatus } from "@/hooks/use-event-stream";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { CheckCircle, WarningCircle, Info } from "@phosphor-icons/react/dist/ssr";

const POLL_INTERVAL = 3000;
const COMPLETION_POLL_MAX = 30_000;

interface StagePayload {
  stage: string;
  detail: string | null;
}

function StatusIndicator({ status, pollFallback, savingArticles }: {
  status: StreamStatus;
  pollFallback: boolean;
  savingArticles: boolean;
}) {
  if (savingArticles) {
    return <Shimmer duration={2}>Saving articles...</Shimmer>;
  }

  if (status === "complete") {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="size-4 text-primary" weight="fill" />
        <span className="text-sm text-muted-foreground">Done! Redirecting to results...</span>
      </div>
    );
  }

  if (status === "error" && !pollFallback) {
    return (
      <div className="flex items-center gap-2">
        <WarningCircle className="size-4 text-muted-foreground" weight="fill" />
        <span className="text-sm text-muted-foreground">Connection lost, retrying...</span>
      </div>
    );
  }

  return <Shimmer duration={2.5}>Generating SEO content strategy...</Shimmer>;
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

  const savingArticles = status === "complete";
  const pollFallback = status === "error";

  useEffect(() => {
    if (!jobId || hydrated.current) return;
    hydrated.current = true;

    (async () => {
      try {
        const res = await fetch(
          `/api/rank-better/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`
        );
        if (!res.ok) return;
        const data = await res.json() as {
          status: string;
          articlesCreated?: boolean;
          progress?: { stages?: StagePayload[] };
        };

        if (data.status === "completed" && data.articlesCreated) {
          router.push(
            `/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`
          );
          return;
        }

        if (!data.progress?.stages) return;

        const restored: SSEEvent[] = data.progress.stages.map(
          (s) => ({
            event: "stage" as const,
            data: { stage: s.stage, detail: s.detail },
          })
        );
        setHydratedEvents(restored);
      } catch {}
    })();
  }, [jobId, tenantSlug, router]);

  const sseStageMap = new Map<string, StagePayload>();
  for (const e of sseEvents) {
    if (e.event === "stage") {
      sseStageMap.set(e.data.stage, e.data);
    }
  }

  const mergedHydrated: SSEEvent[] = hydratedEvents.map((e) => {
    if (e.event !== "stage") return e;
    const sseVersion = sseStageMap.get(e.data.stage);
    if (sseVersion) return { event: "stage" as const, data: sseVersion };
    return e;
  });

  const hydratedStages = new Set(
    mergedHydrated
      .filter((e): e is SSEEvent & { event: "stage" } => e.event === "stage")
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
            `/api/rank-better/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`
          );
          if (res.ok) {
            const data = await res.json() as { articlesCreated?: boolean };
            if (data.articlesCreated) {
              router.push(
                `/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`
              );
              return;
            }
          }
        } catch {}
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
      }

      if (!cancelled) {
        router.push(
          `/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`
        );
      }
    }

    pollForArticles();
    return () => { cancelled = true; };
  }, [status, jobId, tenantSlug, router]);

  const poll = useCallback(async () => {
    if (!jobId || !pollFallback) return;
    try {
      const res = await fetch(
        `/api/rank-better/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`
      );
      if (!res.ok) return;
      const data = await res.json() as {
        status: string;
        articlesCreated?: boolean;
        progress?: { stages?: StagePayload[] };
      };

      if (data.progress?.stages) {
        const restored: SSEEvent[] = data.progress.stages.map(
          (s) => ({
            event: "stage" as const,
            data: { stage: s.stage, detail: s.detail },
          })
        );
        setHydratedEvents(restored);
      }

      if (data.status === "completed" && data.articlesCreated) {
        router.push(
          `/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`
        );
      }
    } catch {}
  }, [jobId, tenantSlug, router, pollFallback]);

  useEffect(() => {
    if (!pollFallback) return;
    const timer = setTimeout(poll, 0);
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [pollFallback, poll]);

  const isActive = status === "connecting" || status === "connected" || pollFallback;

  useEffect(() => {
    if (!isActive) return;

    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isActive]);

  const isStreaming = status === "connected" || status === "connecting" || pollFallback;

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Generating" },
        ]}
      />

      <div className="flex flex-1 flex-col items-center gap-8 overflow-auto px-8 py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {businessName}
          </h2>
          <StatusIndicator status={status} pollFallback={pollFallback} savingArticles={savingArticles} />
        </div>

        {isActive && (
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground">
            <Info className="size-3.5 shrink-0" weight="fill" />
            <span>Content generates in the background. You can safely leave - find this job on the <a href="/dashboard" className="underline hover:text-foreground">Overview</a> page.</span>
          </div>
        )}

        <EventFeed events={allEvents} isStreaming={isStreaming} />
      </div>
    </>
  );
}
