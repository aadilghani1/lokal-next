"use client";

import { useRef, useEffect } from "react";
import type { SSEEvent } from "@/hooks/use-event-stream";
import { ToolUI } from "./tool-registry";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Check,
  MagnifyingGlass,
  ChartBar,
  TreeStructure,
  PencilLine,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

const STAGE_LABELS: Record<string, string> = {
  discovering_competitors: "Discovering competitors",
  crawling: "Crawling websites",
  gathering_seo_data: "Gathering SEO data",
  extracting_keywords: "Extracting keywords",
  enriching_keywords: "Enriching keywords",
  classifying_intent: "Classifying intent",
  embedding_keywords: "Embedding keywords",
  clustering: "Building topic clusters",
  agent_researching: "Researching topics",
  agent_writing: "Writing articles",
};

export interface PhaseDefinition {
  id: string;
  label: string;
  description: string;
  icon: Icon;
  stages: string[];
}

export const PHASES: PhaseDefinition[] = [
  {
    id: "discovery",
    label: "Discovery",
    description: "Finding competitors and crawling their sites",
    icon: MagnifyingGlass,
    stages: ["discovering_competitors", "crawling", "gathering_seo_data"],
  },
  {
    id: "analysis",
    label: "Analysis",
    description: "Extracting and enriching keyword data",
    icon: ChartBar,
    stages: ["extracting_keywords", "enriching_keywords", "classifying_intent"],
  },
  {
    id: "strategy",
    label: "Strategy",
    description: "Clustering keywords into topic groups",
    icon: TreeStructure,
    stages: ["embedding_keywords", "clustering"],
  },
  {
    id: "writing",
    label: "Content",
    description: "AI agent researching and writing articles",
    icon: PencilLine,
    stages: ["agent_researching", "agent_writing"],
  },
];

export type PhaseStatus = "pending" | "active" | "done";

export function getPhaseStatuses(events: SSEEvent[]): PhaseStatus[] {
  const seenStages = new Set<string>();
  for (const e of events) {
    if (e.event === "stage") seenStages.add(e.data.stage);
  }
  const isComplete = events.some((e) => e.event === "complete");

  return PHASES.map((phase, i) => {
    const hasAny = phase.stages.some((s) => seenStages.has(s));
    if (!hasAny) return "pending";
    if (isComplete) return "done";
    const nextPhase = PHASES[i + 1];
    if (nextPhase && nextPhase.stages.some((s) => seenStages.has(s)))
      return "done";
    return "active";
  });
}

function getPhaseEvents(events: SSEEvent[], phase: PhaseDefinition): SSEEvent[] {
  const result: SSEEvent[] = [];
  let inPhase = false;

  for (const e of events) {
    if (e.event === "stage") {
      if (phase.stages.includes(e.data.stage)) {
        inPhase = true;
        result.push(e);
      } else {
        inPhase = false;
      }
    } else if (inPhase && (e.event === "tool_call" || e.event === "thinking" || e.event === "text")) {
      result.push(e);
    }
  }

  return result;
}

function cleanDetail(detail: string | null): string | null {
  if (!detail) return null;
  if (/\b0\s+(keywords?|items?|pages?|competitors?)\b/i.test(detail))
    return null;
  return detail;
}

interface PhaseTimelineProps {
  events: SSEEvent[];
  statuses: PhaseStatus[];
  isStreaming: boolean;
}

export function PhaseTimeline({
  events,
  statuses,
  isStreaming,
}: PhaseTimelineProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [statuses]);

  return (
    <div className="flex flex-col">
      {PHASES.map((phase, i) => (
        <PhaseItem
          key={phase.id}
          ref={statuses[i] === "active" ? activeRef : null}
          phase={phase}
          status={statuses[i]}
          events={getPhaseEvents(events, phase)}
          isLast={i === PHASES.length - 1}
          isStreaming={isStreaming && statuses[i] === "active"}
        />
      ))}
    </div>
  );
}

import { forwardRef } from "react";

const PhaseItem = forwardRef<
  HTMLDivElement,
  {
    phase: PhaseDefinition;
    status: PhaseStatus;
    events: SSEEvent[];
    isLast: boolean;
    isStreaming: boolean;
  }
>(function PhaseItem({ phase, status, events, isLast, isStreaming }, ref) {
  const hasDetails = events.length > 0;
  const isActive = status === "active";
  const showDetails = isActive || (status === "done" && hasDetails);

  return (
    <div ref={ref} className="flex gap-3 sm:gap-4">
      <div className="flex flex-col items-center">
        <PhaseIndicator status={status} Icon={phase.icon} />
        {!isLast && (
          <div
            className={`w-px flex-1 min-h-4 transition-colors duration-500 ${
              status === "done" ? "bg-primary/60" : "bg-border"
            }`}
          />
        )}
      </div>

      <div className="flex flex-col flex-1 pb-8 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span
              className={`text-sm font-semibold tracking-tight transition-colors ${
                status === "pending"
                  ? "text-muted-foreground/30"
                  : isActive
                    ? "text-foreground"
                    : "text-foreground"
              }`}
            >
              {phase.label}
            </span>
            <span
              className={`text-xs transition-colors ${
                status === "pending"
                  ? "text-muted-foreground/20"
                  : "text-muted-foreground"
              }`}
            >
              {phase.description}
            </span>
          </div>
          {status === "done" && hasDetails && (
            <CollapsibleToggle events={events} />
          )}
        </div>

        {showDetails && (
          <div className="mt-3 flex flex-col gap-2">
            {isActive && <ActivePhaseEvents events={events} />}
            {status === "done" && <DonePhaseEvents events={events} />}
          </div>
        )}

        {isStreaming && (
          <div className="mt-2">
            <Shimmer duration={2} className="text-xs">Working...</Shimmer>
          </div>
        )}
      </div>
    </div>
  );
});

function CollapsibleToggle({ events }: { events: SSEEvent[] }) {
  const stageCount = events.filter((e) => e.event === "stage").length;
  const toolCount = events.filter((e) => e.event === "tool_call").length;

  const parts: string[] = [];
  if (stageCount > 0) parts.push(`${stageCount} step${stageCount > 1 ? "s" : ""}`);
  if (toolCount > 0) parts.push(`${toolCount} tool call${toolCount > 1 ? "s" : ""}`);

  return (
    <span className="text-[10px] text-muted-foreground/40 shrink-0 pt-1">
      {parts.join(" · ")}
    </span>
  );
}

function ActivePhaseEvents({ events }: { events: SSEEvent[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [events.length]);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/10 bg-primary/2 p-3">
      {events.map((e, i) => (
        <EventItem key={i} event={e} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function DonePhaseEvents({ events }: { events: SSEEvent[] }) {
  const stages = events.filter((e) => e.event === "stage");
  if (stages.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {stages.map((e, i) => {
        if (e.event !== "stage") return null;
        const detail = cleanDetail(e.data.detail);
        return (
          <div key={i} className="flex items-center gap-2">
            <Check className="size-3 text-primary/50 shrink-0" weight="bold" />
            <span className="text-xs text-muted-foreground">
              {STAGE_LABELS[e.data.stage] ?? e.data.stage}
              {detail && (
                <span className="text-muted-foreground/40"> — {detail}</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function EventItem({ event: e }: { event: SSEEvent }) {
  if (e.event === "stage") {
    const label = STAGE_LABELS[e.data.stage] ?? e.data.stage;
    const detail = cleanDetail(e.data.detail);
    return (
      <div className="flex items-start gap-2.5">
        <span className="mt-[7px] size-1.5 rounded-full bg-primary/60 shrink-0" />
        <div className="min-w-0">
          <span className="text-xs font-medium text-foreground">{label}</span>
          {detail && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{detail}</p>
          )}
        </div>
      </div>
    );
  }

  if (e.event === "tool_call") {
    return (
      <div className="ml-4">
        <ToolUI
          name={e.data.name}
          input={e.data.input}
          output_preview={e.data.output_preview}
          output_parsed={e.data.output_parsed}
        />
      </div>
    );
  }

  if (e.event === "thinking") {
    return (
      <div className="ml-4 border-l-2 border-primary/10 pl-3 py-0.5">
        <p className="text-[11px] text-muted-foreground/50 italic leading-relaxed line-clamp-3">
          {e.data.text}
        </p>
      </div>
    );
  }

  if (e.event === "text") {
    const chunk = e.data.chunk;
    if (!chunk?.trim()) return null;
    return (
      <div className="ml-4 border-l-2 border-primary/10 pl-3 py-0.5">
        <p className="text-[11px] text-foreground/50 leading-relaxed line-clamp-3">
          {chunk.length > 400 ? chunk.slice(0, 400) + "..." : chunk}
        </p>
      </div>
    );
  }

  return null;
}

function PhaseIndicator({ status, Icon }: { status: PhaseStatus; Icon: Icon }) {
  if (status === "done") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-4" weight="bold" />
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="relative flex size-8 items-center justify-center rounded-full border-2 border-primary bg-primary/5">
        <Icon className="size-3.5 text-primary" weight="duotone" />
        <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
      </div>
    );
  }

  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-muted/80">
      <Icon className="size-3.5 text-muted-foreground/25" weight="regular" />
    </div>
  );
}
