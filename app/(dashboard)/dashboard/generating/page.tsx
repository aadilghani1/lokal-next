"use client";

import { useEffect, useCallback, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { EventFeed } from "@/components/generating/event-feed";
import { useEventStream, type SSEEvent } from "@/hooks/use-event-stream";
import { CircleNotch } from "@phosphor-icons/react/dist/ssr";

const POLL_INTERVAL = 3000;

export default function GeneratingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("jobId") ?? "";
  const tenantSlug = searchParams.get("tenantSlug") ?? "default";
  const businessName = searchParams.get("businessName") ?? "Your Business";

  const { events, status } = useEventStream(jobId || null);
  const [pollFallback, setPollFallback] = useState(false);

  // If SSE fails, fall back to polling
  useEffect(() => {
    if (status === "error" && events.length <= 1) {
      setPollFallback(true);
    }
  }, [status, events.length]);

  // Redirect on complete
  useEffect(() => {
    if (status === "complete") {
      const timer = setTimeout(() => {
        router.push(
          `/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, jobId, tenantSlug, router]);

  // Poll fallback
  const poll = useCallback(async () => {
    if (!jobId || !pollFallback) return;
    try {
      const res = await fetch(
        `/api/rank-better/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "completed" && data.articlesCreated) {
        router.push(
          `/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`
        );
      }
    } catch {}
  }, [jobId, tenantSlug, router, pollFallback]);

  useEffect(() => {
    if (!pollFallback) return;
    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [pollFallback, poll]);

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Generating" },
        ]}
      />

      <div className="flex flex-1 flex-col items-center gap-6 overflow-auto px-8 py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold">{businessName}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            {status !== "complete" && status !== "error" && (
              <CircleNotch className="size-3.5 text-primary animate-spin" weight="bold" />
            )}
            <p className="text-sm text-muted-foreground">
              {status === "complete"
                ? "Done! Redirecting to results..."
                : status === "error" && !pollFallback
                ? "Connection lost, retrying..."
                : "Generating SEO content strategy..."}
            </p>
          </div>
        </div>

        <EventFeed events={events} />
      </div>
    </>
  );
}
