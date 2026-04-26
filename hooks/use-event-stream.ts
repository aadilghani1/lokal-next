"use client";

import { useEffect, useRef, useState } from "react";

interface StageData {
  stage: string;
  detail: string | null;
}

interface ToolCallData {
  name: string;
  input: Record<string, unknown>;
  output_preview: string;
  output_parsed?: unknown[] | Record<string, unknown> | null;
}

interface ThinkingData {
  text: string;
}

interface TextData {
  chunk: string;
}

interface ArticleData {
  cluster_id: number;
  target_keyword: string;
  meta_title: string;
  content_type: string;
}

interface CompleteData {
  job_id: string;
  articles_count: number;
}

interface ErrorData {
  message: string;
}

export type SSEEvent =
  | { event: "connected"; data: { job_id: string } }
  | { event: "stage"; data: StageData }
  | { event: "tool_call"; data: ToolCallData }
  | { event: "thinking"; data: ThinkingData }
  | { event: "text"; data: TextData }
  | { event: "article"; data: ArticleData }
  | { event: "complete"; data: CompleteData }
  | { event: "error"; data: ErrorData }
  | { event: "heartbeat"; data: Record<string, never> };

export type StreamStatus = "connecting" | "connected" | "complete" | "error";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 10_000;

export function useEventStream(jobId: string | null) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let retryCount = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      if (cancelled) return;

      sourceRef.current?.close();
      const es = new EventSource(`/api/stream/${jobId}`);
      sourceRef.current = es;

      es.onmessage = (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(String(e.data)) as SSEEvent;
          setEvents((prev) => [...prev, parsed]);

          retryCount = 0;

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
        es.close();
        if (cancelled) return;

        if (retryCount >= MAX_RETRIES) {
          setStatus("error");
          return;
        }

        const delay = Math.min(
          BASE_DELAY_MS * 2 ** retryCount,
          MAX_DELAY_MS,
        );
        retryCount += 1;
        setStatus("connecting");

        retryTimer = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      cancelled = true;
      sourceRef.current?.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [jobId]);

  return { events, status } as const;
}
