"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type SSEEvent =
  | { event: "connected"; data: { job_id: string } }
  | { event: "stage"; data: { stage: string; detail: string | null } }
  | { event: "tool_call"; data: { name: string; input: Record<string, unknown>; output_preview: string } }
  | { event: "thinking"; data: { text: string } }
  | { event: "text"; data: { chunk: string } }
  | { event: "article"; data: { cluster_id: number; target_keyword: string; meta_title: string; content_type: string } }
  | { event: "complete"; data: { job_id: string; articles_count: number } }
  | { event: "error"; data: { message: string } }
  | { event: "heartbeat"; data: Record<string, never> };

export function useEventStream(jobId: string | null) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "complete" | "error">("connecting");
  const sourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!jobId) return;

    const es = new EventSource(`/api/stream/${jobId}`);
    sourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data) as SSEEvent;
        setEvents((prev) => [...prev, parsed]);

        if (parsed.event === "connected") setStatus("connected");
        if (parsed.event === "complete") {
          setStatus("complete");
          es.close();
        }
        if (parsed.event === "error") {
          setStatus("error");
          es.close();
        }
      } catch {}
    };

    es.onerror = () => {
      setStatus("error");
      es.close();
    };
  }, [jobId]);

  useEffect(() => {
    connect();
    return () => {
      sourceRef.current?.close();
    };
  }, [connect]);

  return { events, status };
}
