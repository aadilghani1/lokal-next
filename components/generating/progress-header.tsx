"use client";

import type { StreamStatus } from "@/hooks/use-event-stream";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

interface ProgressHeaderProps {
  businessName: string;
  status: StreamStatus;
  pollFallback: boolean;
  completedPhases: number;
  totalPhases: number;
  activePhaseLabel: string | null;
}

export function ProgressHeader({
  businessName,
  status,
  pollFallback,
  completedPhases,
  totalPhases,
  activePhaseLabel,
}: ProgressHeaderProps) {
  const isDone = status === "complete";

  return (
    <div className="flex flex-col gap-4 border-b border-border px-8 py-6 lg:px-12">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-xl font-bold tracking-tight">
            {businessName}
          </h2>
          <div className="text-xs text-muted-foreground">
            {isDone ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle className="size-3.5 text-primary" weight="fill" />
                Done — redirecting to results
              </span>
            ) : activePhaseLabel ? (
              <Shimmer duration={2.5}>{`${activePhaseLabel}...`}</Shimmer>
            ) : (
              <Shimmer duration={2.5}>Connecting to generation service...</Shimmer>
            )}
          </div>
        </div>
        {!isDone && (
          <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-muted-foreground">
              Safe to leave
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-1 h-[3px]">
        {Array.from({ length: totalPhases }).map((_, i) => {
          let colorClass = "bg-border";
          if (i < completedPhases) colorClass = "bg-primary";
          else if (i === completedPhases && !isDone)
            colorClass = "bg-primary/40";

          return (
            <div key={i} className={`flex-1 rounded-full ${colorClass}`} />
          );
        })}
      </div>
    </div>
  );
}
