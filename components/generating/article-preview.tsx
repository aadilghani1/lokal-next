"use client";

import type { SSEEvent } from "@/hooks/use-event-stream";
import { Article as ArticleIcon, CheckCircle } from "@phosphor-icons/react/dist/ssr";

interface ArticlePreviewPanelProps {
  events: SSEEvent[];
  isComplete: boolean;
}

export function ArticlePreviewPanel({
  events,
  isComplete,
}: ArticlePreviewPanelProps) {
  const articleEvents = events.filter(
    (e): e is SSEEvent & { event: "article" } => e.event === "article",
  );

  const completeEvent = events.find(
    (e): e is SSEEvent & { event: "complete" } => e.event === "complete",
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold tracking-tight">
          Articles
        </span>
        {completeEvent && (
          <span className="text-[11px] text-muted-foreground">
            {completeEvent.data.articles_count} generated
          </span>
        )}
      </div>

      {articleEvents.length === 0 && !isComplete ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 px-6">
          <ArticleIcon
            className="size-8 text-muted-foreground/30"
            weight="duotone"
          />
          <span className="text-[13px] text-muted-foreground/60">
            Waiting for articles...
          </span>
          <span className="text-[11px] text-muted-foreground/40">
            Articles appear here as the AI writes them
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {articleEvents.map((e, i) => (
            <ArticleCard key={i} {...e.data} index={i + 1} />
          ))}

          {isComplete && completeEvent && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-4 py-3 mt-1">
              <CheckCircle
                className="size-4 text-primary shrink-0"
                weight="fill"
              />
              <span className="text-[13px] font-semibold">
                {completeEvent.data.articles_count} article
                {completeEvent.data.articles_count !== 1 ? "s" : ""} ready
              </span>
            </div>
          )}
        </div>
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
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2.5 transition-colors hover:border-primary/20">
      <div className="flex items-start gap-3">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary shrink-0">
          {index}
        </span>
        <span className="text-[13px] font-semibold tracking-tight leading-snug">
          {meta_title || target_keyword}
        </span>
      </div>
      <div className="flex items-center gap-2 ml-9">
        {target_keyword && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {target_keyword}
          </span>
        )}
        {content_type && (
          <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
            {content_type}
          </span>
        )}
      </div>
    </div>
  );
}
