"use client";

import { useRef, useEffect } from "react";
import type { SSEEvent } from "@/hooks/use-event-stream";
import { Card, CardContent } from "@/components/ui/card";
import {
  MagnifyingGlass,
  Globe,
  Brain,
  Robot,
  PencilLine,
  CheckCircle,
  Lightning,
  WarningCircle,
  Article as ArticleIcon,
} from "@phosphor-icons/react/dist/ssr";

function StageEvent({ stage, detail }: { stage: string; detail: string | null }) {
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
    completed: "Complete",
  };

  return (
    <div className="flex items-start gap-3 py-2">
      <Globe className="size-4 text-primary mt-0.5 shrink-0" weight="fill" />
      <div>
        <span className="text-sm font-medium">{STAGE_LABELS[stage] ?? stage}</span>
        {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

function ToolCallEvent({ name, input, output_preview }: { name: string; input: Record<string, unknown>; output_preview: string }) {
  const inputStr = Object.entries(input)
    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(", ")
    .slice(0, 80);

  return (
    <div className="flex items-start gap-3 py-2 pl-4 border-l-2 border-primary/20">
      <MagnifyingGlass className="size-4 text-primary/70 mt-0.5 shrink-0" weight="bold" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{name}</code>
          <span className="text-xs text-muted-foreground truncate">{inputStr}</span>
        </div>
        {output_preview && (
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{output_preview}</p>
        )}
      </div>
    </div>
  );
}

function ThinkingEvent({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 py-2 pl-4 border-l-2 border-amber-300/40">
      <Brain className="size-4 text-amber-500/70 mt-0.5 shrink-0" weight="fill" />
      <p className="text-xs text-muted-foreground italic line-clamp-3">{text}</p>
    </div>
  );
}

function TextEvent({ chunk }: { chunk: string }) {
  if (!chunk.trim()) return null;
  const preview = chunk.length > 200 ? chunk.slice(0, 200) + "..." : chunk;
  return (
    <div className="flex items-start gap-3 py-2 pl-4 border-l-2 border-green-300/40">
      <PencilLine className="size-4 text-green-600/70 mt-0.5 shrink-0" weight="fill" />
      <p className="text-xs text-foreground/80 line-clamp-3">{preview}</p>
    </div>
  );
}

function ArticleEvent({ meta_title, target_keyword, content_type }: { meta_title: string; target_keyword: string; content_type: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <ArticleIcon className="size-4 text-primary mt-0.5 shrink-0" weight="fill" />
      <div>
        <span className="text-sm font-medium">{meta_title || target_keyword}</span>
        {content_type && <span className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{content_type}</span>}
      </div>
    </div>
  );
}

function CompleteEvent({ articles_count }: { articles_count: number }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <CheckCircle className="size-5 text-green-600 shrink-0" weight="fill" />
      <span className="text-sm font-medium text-green-600">Complete — {articles_count} article{articles_count !== 1 ? "s" : ""} generated</span>
    </div>
  );
}

function ErrorEvent({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <WarningCircle className="size-5 text-destructive shrink-0" weight="fill" />
      <span className="text-sm font-medium text-destructive">{message}</span>
    </div>
  );
}

export function EventFeed({ events }: { events: SSEEvent[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  return (
    <Card className="w-full max-w-2xl shadow-[var(--shadow-surface)]">
      <CardContent className="py-4 max-h-[60vh] overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {events.map((evt, i) => {
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
          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
}
