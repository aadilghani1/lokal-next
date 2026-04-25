"use client";

import { useRef, useEffect } from "react";
import type { SSEEvent } from "@/hooks/use-event-stream";
import { Card, CardContent } from "@/components/ui/card";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { ToolUI } from "./tool-registry";

function StageEvent({ stage, detail }: { stage: string; detail: string | null }) {
  const LABELS: Record<string, string> = {
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

  return (
    <div className="flex items-baseline gap-3 py-1.5">
      <span className="size-1.5 rounded-full bg-foreground/20 shrink-0 mt-1.5" />
      <div>
        <span className="text-[13px] font-medium">{LABELS[stage] ?? stage}</span>
        {detail && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

function ToolCallEvent({ name, input, output_preview }: { name: string; input: Record<string, unknown>; output_preview: string }) {
  return (
    <div className="ml-4">
      <ToolUI name={name} input={input} output_preview={output_preview} />
    </div>
  );
}

function ThinkingEvent({ text }: { text: string }) {
  return (
    <div className="ml-4 py-1.5 pl-3 border-l border-border/40">
      <p className="text-[12px] text-muted-foreground/50 italic leading-relaxed line-clamp-3">{text}</p>
    </div>
  );
}

function TextEvent({ chunk }: { chunk: string }) {
  if (!chunk.trim()) return null;
  const preview = chunk.length > 400 ? chunk.slice(0, 400) + "..." : chunk;
  return (
    <div className="ml-4 py-1.5 pl-3 border-l border-foreground/10">
      <p className="text-[12px] text-foreground/60 leading-relaxed line-clamp-4">{preview}</p>
    </div>
  );
}

function ArticleEvent({ meta_title, target_keyword, content_type }: { meta_title: string; target_keyword: string; content_type: string }) {
  return (
    <div className="ml-4 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-heading text-[14px] font-semibold tracking-tight">{meta_title || target_keyword}</span>
        {content_type && (
          <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider shrink-0">{content_type}</span>
        )}
      </div>
    </div>
  );
}

function CompleteEvent({ articles_count }: { articles_count: number }) {
  return (
    <div className="flex items-baseline gap-3 py-3 mt-2 border-t border-border/30">
      <span className="size-2 rounded-full bg-foreground shrink-0 mt-1" />
      <span className="text-[13px] font-semibold">
        {articles_count} article{articles_count !== 1 ? "s" : ""} generated
      </span>
    </div>
  );
}

function ErrorEvent({ message }: { message: string }) {
  return (
    <div className="py-3 mt-2 border-t border-border/30">
      <p className="text-[13px] font-medium text-destructive">{message}</p>
    </div>
  );
}

export function EventFeed({ events, isStreaming }: { events: SSEEvent[]; isStreaming: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  const visibleEvents = events.filter(
    (e) => e.event !== "connected" && e.event !== "heartbeat"
  );

  return (
    <Card className="w-full max-w-2xl shadow-[var(--shadow-surface)]">
      <CardContent className="py-5 px-5 max-h-[65vh] overflow-y-auto">
        <div className="flex flex-col gap-2">
          {visibleEvents.map((evt, i) => {
            switch (evt.event) {
              case "stage":
                return <StageEvent key={i} {...evt.data} />;
              case "tool_call":
                return <ToolCallEvent key={i} {...evt.data} />;
              case "thinking":
                return <ThinkingEvent key={i} {...evt.data} />;
              case "text":
                return <TextEvent key={i} {...evt.data} />;
              case "article":
                return <ArticleEvent key={i} {...evt.data} />;
              case "complete":
                return <CompleteEvent key={i} {...evt.data} />;
              case "error":
                return <ErrorEvent key={i} {...evt.data} />;
              default:
                return null;
            }
          })}
          {isStreaming && visibleEvents.length > 0 && (
            <div className="py-2 ml-4">
              <Shimmer duration={2}>Working...</Shimmer>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
}
