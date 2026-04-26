"use client";

import { useRef, useEffect } from "react";
import type { SSEEvent } from "@/hooks/use-event-stream";
import {
  Article as ArticleIcon,
  CheckCircle,
  SpinnerGap,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { Shimmer } from "@/components/ai-elements/shimmer";

interface ArticlePreviewPanelProps {
  events: SSEEvent[];
  isComplete: boolean;
  isStreaming: boolean;
}

export function ArticlePreviewPanel({
  events,
  isComplete,
  isStreaming,
}: ArticlePreviewPanelProps) {
  const articleEvents = events.filter(
    (e): e is SSEEvent & { event: "article" } => e.event === "article",
  );
  const completeEvent = events.find(
    (e): e is SSEEvent & { event: "complete" } => e.event === "complete",
  );
  const hasWritingPhase = events.some(
    (e) =>
      e.event === "stage" &&
      (e.data.stage === "agent_researching" || e.data.stage === "agent_writing"),
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [articleEvents.length]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight">Articles</span>
        {articleEvents.length > 0 && (
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {articleEvents.length} generated
          </span>
        )}
      </div>

      {articleEvents.length === 0 ? (
        <EmptyState
          hasWritingPhase={hasWritingPhase}
          isStreaming={isStreaming}
          isComplete={isComplete}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {articleEvents.map((e, i) => (
            <ArticleCard key={i} {...e.data} index={i + 1} />
          ))}

          {isStreaming && !isComplete && (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3">
              <SpinnerGap className="size-3.5 text-primary animate-spin" weight="bold" />
              <Shimmer duration={2} className="text-xs">Writing next article...</Shimmer>
            </div>
          )}

          {isComplete && completeEvent && (
            <div className="flex items-center gap-2.5 rounded-lg bg-primary/5 border border-primary/10 px-4 py-3">
              <CheckCircle className="size-4 text-primary shrink-0" weight="fill" />
              <span className="text-[13px] font-semibold">
                {completeEvent.data.articles_count} article
                {completeEvent.data.articles_count !== 1 ? "s" : ""} ready to review
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

function EmptyState({
  hasWritingPhase,
  isStreaming,
  isComplete,
}: {
  hasWritingPhase: boolean;
  isStreaming: boolean;
  isComplete: boolean;
}) {
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border py-12 px-6 flex-1">
        <CheckCircle className="size-8 text-primary/40" weight="duotone" />
        <span className="text-sm text-muted-foreground">
          Redirecting to results...
        </span>
      </div>
    );
  }

  if (hasWritingPhase) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-primary/10 bg-primary/2 py-12 px-6 flex-1">
        <Sparkle className="size-8 text-primary/40 animate-pulse" weight="duotone" />
        <Shimmer duration={2.5} className="text-sm">AI is writing articles...</Shimmer>
        <span className="text-[11px] text-muted-foreground/40">
          Articles will appear as they are completed
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-12 px-6 flex-1">
      <ArticleIcon className="size-8 text-muted-foreground/20" weight="duotone" />
      {isStreaming ? (
        <>
          <span className="text-sm text-muted-foreground/50">
            Analyzing your market first
          </span>
          <span className="text-[11px] text-muted-foreground/30">
            Articles will appear once the AI starts writing
          </span>
        </>
      ) : (
        <span className="text-sm text-muted-foreground/40">
          Waiting for connection...
        </span>
      )}
    </div>
  );
}

function ArticleCard({
  meta_title,
  target_keyword,
  content_type,
  index,
}: {
  meta_title: string;
  target_keyword: string;
  content_type: string;
  index: number;
}) {
  return (
    <div className="group rounded-lg border border-border bg-card p-4 flex flex-col gap-2 transition-all hover:border-primary/20 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary tabular-nums shrink-0 mt-0.5">
          {index}
        </span>
        <span className="text-[13px] font-semibold tracking-tight leading-snug">
          {meta_title || target_keyword}
        </span>
      </div>
      {(target_keyword || content_type) && (
        <div className="flex items-center gap-2 ml-9 flex-wrap">
          {target_keyword && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground truncate max-w-[200px]">
              {target_keyword}
            </span>
          )}
          {content_type && (
            <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wider">
              {content_type}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
