"use client";

import type { StreamStatus } from "@/hooks/use-event-stream";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { CheckCircle, WarningCircle, WifiSlash } from "@phosphor-icons/react/dist/ssr";

interface ProgressHeaderProps {
  businessName: string;
  status: StreamStatus;
  completedPhases: number;
  totalPhases: number;
  activePhaseLabel: string | null;
  isError: boolean;
}

export function ProgressHeader({
  businessName,
  status,
  completedPhases,
  totalPhases,
  activePhaseLabel,
  isError,
}: ProgressHeaderProps) {
  const isDone = status === "complete";

  return (
    <div className="flex flex-col gap-3 px-6 py-5 sm:px-8 lg:px-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 className="font-heading text-lg font-bold tracking-tight truncate sm:text-xl">
            {businessName}
          </h2>
          <StatusLabel
            status={status}
            activePhaseLabel={activePhaseLabel}
            isDone={isDone}
            isError={isError}
          />
        </div>
        {!isDone && (
          <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 self-start sm:self-auto shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-muted-foreground">
              Safe to leave
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-1 h-[3px]">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-500 ${
              isDone
                ? "bg-primary"
                : i < completedPhases
                  ? "bg-primary"
                  : i === completedPhases
                    ? "bg-primary/40"
                    : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function StatusLabel({
  status,
  activePhaseLabel,
  isDone,
  isError,
}: {
  status: StreamStatus;
  activePhaseLabel: string | null;
  isDone: boolean;
  isError: boolean;
}) {
  if (isDone) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckCircle className="size-3.5 text-primary shrink-0" weight="fill" />
        Complete — redirecting to results
      </span>
    );
  }

  if (isError) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <WifiSlash className="size-3.5 text-muted-foreground shrink-0" weight="bold" />
        Connection lost — polling for updates
      </span>
    );
  }

  if (status === "connecting") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <WarningCircle className="size-3.5 text-muted-foreground/50 shrink-0 animate-pulse" weight="fill" />
        Connecting to generation service...
      </span>
    );
  }

  if (activePhaseLabel) {
    return (
      <Shimmer duration={2.5} className="text-xs">
        {`${activePhaseLabel}...`}
      </Shimmer>
    );
  }

  return (
    <Shimmer duration={2.5} className="text-xs">
      Starting generation...
    </Shimmer>
  );
}
