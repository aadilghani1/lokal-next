"use client";

import { useRef, useEffect } from "react";
import type { SSEEvent } from "@/hooks/use-event-stream";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  CheckCircleIcon,
  BrainIcon,
  PenLineIcon,
  SearchIcon,
  AlertCircleIcon,
  FileTextIcon,
  GlobeIcon,
  WrenchIcon,
} from "lucide-react";

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
    <div className="flex items-start gap-3 py-2">
      <CheckCircleIcon className="size-4 text-primary mt-0.5 shrink-0" />
      <div>
        <span className="text-sm font-medium">{LABELS[stage] ?? stage}</span>
        {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

function ToolCallEvent({ name, input, output_preview }: { name: string; input: Record<string, unknown>; output_preview: string }) {
  const inputStr = Object.entries(input)
    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(", ")
    .slice(0, 100);

  return (
    <div className="group mb-2 w-full rounded-md border bg-card">
      <div className="flex items-center gap-2 px-3 py-2">
        <WrenchIcon className="size-3.5 text-muted-foreground" />
        <Badge variant="secondary" className="font-mono text-[11px]">{name}</Badge>
        <span className="text-xs text-muted-foreground truncate flex-1">{inputStr}</span>
        {output_preview && (
          <Badge variant="outline" className="text-[10px] text-green-600 border-green-200">done</Badge>
        )}
      </div>
      {output_preview && (
        <div className="px-3 pb-2 border-t border-border/50">
          <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 font-mono">{output_preview}</p>
        </div>
      )}
    </div>
  );
}

function ThinkingEvent({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5 pl-2 border-l-2 border-amber-300/40 ml-2">
      <BrainIcon className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
      <p className="text-xs text-muted-foreground italic line-clamp-2">{text}</p>
    </div>
  );
}

function TextEvent({ chunk }: { chunk: string }) {
  if (!chunk.trim()) return null;
  const preview = chunk.length > 300 ? chunk.slice(0, 300) + "..." : chunk;
  return (
    <div className="flex items-start gap-2.5 py-1.5 pl-2 border-l-2 border-green-300/40 ml-2">
      <PenLineIcon className="size-3.5 text-green-600 mt-0.5 shrink-0" />
      <p className="text-xs text-foreground/70 line-clamp-3">{preview}</p>
    </div>
  );
}

function ArticleEvent({ meta_title, target_keyword, content_type }: { meta_title: string; target_keyword: string; content_type: string }) {
  return (
    <div className="flex items-center gap-2.5 py-2 px-3 rounded-md bg-primary/5 border border-primary/10">
      <FileTextIcon className="size-4 text-primary shrink-0" />
      <span className="text-sm font-medium flex-1">{meta_title || target_keyword}</span>
      {content_type && (
        <Badge variant="secondary" className="text-[10px]">{content_type}</Badge>
      )}
    </div>
  );
}

function CompleteEvent({ articles_count }: { articles_count: number }) {
  return (
    <div className="flex items-center gap-2.5 py-3 px-3 rounded-md bg-green-50 border border-green-200">
      <CheckCircleIcon className="size-5 text-green-600 shrink-0" />
      <span className="text-sm font-medium text-green-700">
        Complete — {articles_count} article{articles_count !== 1 ? "s" : ""} generated
      </span>
    </div>
  );
}

function ErrorEvent({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2.5 py-3 px-3 rounded-md bg-red-50 border border-red-200">
      <AlertCircleIcon className="size-5 text-destructive shrink-0" />
      <span className="text-sm font-medium text-destructive">{message}</span>
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
      <CardContent className="py-4 max-h-[65vh] overflow-y-auto">
        <div className="flex flex-col gap-1.5">
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
            <div className="py-2 pl-2">
              <Shimmer duration={1.5}>Processing...</Shimmer>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
}
