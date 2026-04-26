"use client";

import { useRef, useEffect } from "react";
import type { SSEEvent } from "@/hooks/use-event-stream";
import { Card, CardContent } from "@/components/ui/card";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { ToolUI } from "./tool-registry";
import { CheckCircle, WarningOctagon, Article as ArticleIcon } from "@phosphor-icons/react/dist/ssr";

const STAGE_LABELS: Record<string, string> = {
  discovering_competitors: "Discovering Competitors",
  crawling: "Crawling Websites",
  gathering_seo_data: "Gathering SEO Data",
  extracting_keywords: "Extracting Keywords",
  enriching_keywords: "Enriching Keywords",
  classifying_intent: "Classifying Intent",
  embedding_keywords: "Embedding Keywords",
  clustering: "Building Topic Clusters",
  agent_researching: "Agent Researching",
  agent_writing: "Agent Writing",
};

function cleanDetail(detail: string | null): string | null {
  if (!detail) return null;
  if (/\b0\s+(keywords?|items?|pages?|competitors?)\b/i.test(detail)) return null;
  return detail;
}

function StageEvent({ stage, detail }: { stage: string; detail: string | null }) {
  const cleaned = cleanDetail(detail);
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-2 size-1.5 rounded-full bg-primary/50 shrink-0" />
      <div>
        <span className="text-[13px] font-medium">
          {STAGE_LABELS[stage] ?? stage}
        </span>
        {cleaned && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{cleaned}</p>
        )}
      </div>
    </div>
  );
}

function ToolCallEvent({
  name,
  input,
  output_preview,
  output_parsed,
}: {
  name: string;
  input: Record<string, unknown>;
  output_preview: string;
  output_parsed?: unknown[] | Record<string, unknown> | null;
}) {
  return (
    <div className="ml-4">
      <ToolUI
        name={name}
        input={input}
        output_preview={output_preview}
        output_parsed={output_parsed}
      />
    </div>
  );
}

function ThinkingEvent({ text }: { text: string }) {
  return (
    <div className="ml-4 py-1.5 pl-3 border-l-2 border-muted">
      <p className="text-[12px] text-muted-foreground/60 italic leading-relaxed line-clamp-3">
        {text}
      </p>
    </div>
  );
}

function TextEvent({ chunk }: { chunk: string }) {
  if (!chunk.trim()) return null;
  const preview = chunk.length > 400 ? chunk.slice(0, 400) + "..." : chunk;
  return (
    <div className="ml-4 py-1.5 pl-3 border-l-2 border-muted">
      <p className="text-[12px] text-foreground/60 leading-relaxed line-clamp-4">
        {preview}
      </p>
    </div>
  );
}

function ArticleEvent({
  meta_title,
  target_keyword,
  content_type,
}: {
  meta_title: string;
  target_keyword: string;
  content_type: string;
}) {
  return (
    <div className="ml-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-2">
        <ArticleIcon className="size-4 text-primary shrink-0" weight="duotone" />
        <span className="font-heading text-[13px] font-semibold tracking-tight truncate">
          {meta_title || target_keyword}
        </span>
        {content_type && (
          <span className="ml-auto text-[10px] font-mono text-muted-foreground uppercase tracking-wider shrink-0">
            {content_type}
          </span>
        )}
      </div>
    </div>
  );
}

function CompleteEvent({ articles_count }: { articles_count: number }) {
  return (
    <div className="flex items-center gap-3 py-3 mt-2 border-t border-border/40">
      <CheckCircle className="size-4 text-primary shrink-0" weight="fill" />
      <span className="text-[13px] font-semibold">
        {articles_count} article{articles_count !== 1 ? "s" : ""} generated
      </span>
    </div>
  );
}

function ErrorEvent({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 py-3 mt-2 border-t border-border/40">
      <WarningOctagon className="size-4 text-destructive shrink-0" weight="fill" />
      <p className="text-[13px] font-medium text-destructive">{message}</p>
    </div>
  );
}

function renderEvent(evt: SSEEvent, index: number) {
  switch (evt.event) {
    case "stage":
      return <StageEvent key={index} {...evt.data} />;
    case "tool_call":
      return <ToolCallEvent key={index} {...evt.data} />;
    case "thinking":
      return <ThinkingEvent key={index} {...evt.data} />;
    case "text":
      return <TextEvent key={index} {...evt.data} />;
    case "article":
      return <ArticleEvent key={index} {...evt.data} />;
    case "complete":
      return <CompleteEvent key={index} {...evt.data} />;
    case "error":
      return <ErrorEvent key={index} {...evt.data} />;
    default:
      return null;
  }
}

export function EventFeed({
  events,
  isStreaming,
}: {
  events: SSEEvent[];
  isStreaming: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  const visibleEvents = events.filter(
    (e) => e.event !== "connected" && e.event !== "heartbeat"
  );

  return (
    <Card className="w-full max-w-2xl shadow-(--shadow-surface)">
      <CardContent className="py-5 px-5 max-h-[65vh] overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          {visibleEvents.map(renderEvent)}
          {isStreaming && visibleEvents.length > 0 && (
            <div className="py-2 ml-4">
              <Shimmer duration={2}>Working...</Shimmer>
            </div>
          )}
          {isStreaming && visibleEvents.length === 0 && (
            <div className="py-8 flex justify-center">
              <Shimmer duration={2}>Connecting to generation service...</Shimmer>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
}
