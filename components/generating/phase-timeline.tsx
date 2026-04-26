"use client";

import { useState } from "react";
import type { SSEEvent } from "@/hooks/use-event-stream";
import { ToolUI } from "./tool-registry";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  CheckCircle,
  CaretDown,
  CaretRight,
  MagnifyingGlass,
  ChartBar,
  TreeStructure,
  PencilLine,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

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

export interface PhaseDefinition {
  id: string;
  label: string;
  icon: Icon;
  stages: string[];
}

export const PHASES: PhaseDefinition[] = [
  {
    id: "discovery",
    label: "Discovery",
    icon: MagnifyingGlass,
    stages: ["discovering_competitors", "crawling", "gathering_seo_data"],
  },
  {
    id: "analysis",
    label: "Analysis",
    icon: ChartBar,
    stages: ["extracting_keywords", "enriching_keywords", "classifying_intent"],
  },
  {
    id: "strategy",
    label: "Strategy",
    icon: TreeStructure,
    stages: ["embedding_keywords", "clustering"],
  },
  {
    id: "writing",
    label: "Content",
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
    const phaseStagesPresent = phase.stages.filter((s) => seenStages.has(s));
    if (phaseStagesPresent.length === 0) return "pending";

    if (isComplete) return "done";

    const nextPhase = PHASES[i + 1];
    if (nextPhase && nextPhase.stages.some((s) => seenStages.has(s)))
      return "done";

    return "active";
  });
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
  return (
    <div className="flex flex-col">
      {PHASES.map((phase, i) => (
        <PhaseItem
          key={phase.id}
          phase={phase}
          status={statuses[i]}
          events={events}
          isLast={i === PHASES.length - 1}
          isStreaming={isStreaming}
        />
      ))}
    </div>
  );
}

function PhaseItem({
  phase,
  status,
  events,
  isLast,
  isStreaming,
}: {
  phase: PhaseDefinition;
  status: PhaseStatus;
  events: SSEEvent[];
  isLast: boolean;
  isStreaming: boolean;
}) {
  const [expanded, setExpanded] = useState(status === "active");

  const phaseEvents = events.filter((e) => {
    if (e.event === "stage") return phase.stages.includes(e.data.stage);
    if (e.event === "tool_call" || e.event === "thinking" || e.event === "text") {
      const lastStageIdx = events.findLastIndex(
        (pe) => pe.event === "stage" && phase.stages.includes(pe.data.stage),
      );
      if (lastStageIdx === -1) return false;
      const thisIdx = events.indexOf(e);
      const nextPhaseStageIdx = events.findIndex(
        (pe, pi) =>
          pi > lastStageIdx &&
          pe.event === "stage" &&
          !phase.stages.includes(pe.data.stage),
      );
      return (
        thisIdx > lastStageIdx &&
        (nextPhaseStageIdx === -1 || thisIdx < nextPhaseStageIdx)
      );
    }
    return false;
  });

  const hasDetails =
    phaseEvents.length > 0 && (status === "active" || status === "done");

  const isActive = status === "active";

  if (status === "active" && !expanded) setExpanded(true);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <PhaseIndicator status={status} Icon={phase.icon} />
        {!isLast && (
          <div
            className={`w-px flex-1 min-h-6 ${
              status === "done" ? "bg-primary" : "bg-border"
            }`}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5 flex-1 pb-7 min-w-0">
        <button
          onClick={() => hasDetails && setExpanded((p) => !p)}
          className="flex items-center gap-2 text-left group"
          disabled={!hasDetails}
        >
          <span
            className={`text-[13px] font-semibold tracking-tight ${
              status === "pending"
                ? "text-muted-foreground/40"
                : isActive
                  ? "text-primary"
                  : "text-foreground"
            }`}
          >
            {phase.label}
          </span>
          {hasDetails && (
            <span className="text-muted-foreground/50">
              {expanded ? (
                <CaretDown className="size-3" weight="bold" />
              ) : (
                <CaretRight className="size-3" weight="bold" />
              )}
            </span>
          )}
        </button>

        {status === "active" && isStreaming && (
          <PhaseDetail events={phaseEvents} />
        )}

        {expanded && status === "done" && <PhaseDetail events={phaseEvents} />}

        {isActive && isStreaming && (
          <div className="mt-1">
            <Shimmer duration={2}>Working...</Shimmer>
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseIndicator({
  status,
  Icon,
}: {
  status: PhaseStatus;
  Icon: Icon;
}) {
  if (status === "done") {
    return (
      <div className="flex size-7 items-center justify-center rounded-full bg-primary">
        <CheckCircle className="size-4 text-primary-foreground" weight="fill" />
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="flex size-7 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
        <Icon className="size-3.5 text-primary" weight="bold" />
      </div>
    );
  }

  return (
    <div className="flex size-7 items-center justify-center rounded-full bg-muted">
      <div className="size-2 rounded-full bg-muted-foreground/30" />
    </div>
  );
}

function PhaseDetail({ events }: { events: SSEEvent[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {events.map((e, i) => {
        if (e.event === "stage") {
          const label = STAGE_LABELS[e.data.stage] ?? e.data.stage;
          const detail = cleanDetail(e.data.detail);
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 size-1 rounded-full bg-muted-foreground/30 shrink-0" />
              <span className="text-xs text-muted-foreground">
                {label}
                {detail && (
                  <span className="text-muted-foreground/50"> — {detail}</span>
                )}
              </span>
            </div>
          );
        }
        if (e.event === "tool_call") {
          return (
            <div key={i} className="ml-3">
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
            <div key={i} className="ml-3 border-l-2 border-muted pl-3">
              <p className="text-[11px] text-muted-foreground/50 italic line-clamp-2">
                {e.data.text}
              </p>
            </div>
          );
        }
        if (e.event === "text") {
          const chunk = e.data.chunk;
          if (!chunk?.trim()) return null;
          return (
            <div key={i} className="ml-3 border-l-2 border-muted pl-3">
              <p className="text-[11px] text-foreground/50 line-clamp-2">
                {chunk.length > 300 ? chunk.slice(0, 300) + "..." : chunk}
              </p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
