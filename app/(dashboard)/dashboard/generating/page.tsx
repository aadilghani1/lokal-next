"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  MagnifyingGlass,
  Globe,
  ChartBar,
  Tag,
  Brain,
  GridFour,
  Robot,
  PencilLine,
  CheckCircle,
  CircleNotch,
  Circle,
  Lightning,
} from "@phosphor-icons/react/dist/ssr";

const STAGES = [
  { key: "discovering_competitors", label: "Discovering Competitors", icon: MagnifyingGlass },
  { key: "crawling", label: "Crawling Websites", icon: Globe },
  { key: "gathering_seo_data", label: "Gathering SEO Data", icon: ChartBar },
  { key: "extracting_keywords", label: "Extracting Keywords", icon: Tag },
  { key: "enriching_keywords", label: "Enriching Keywords", icon: ChartBar },
  { key: "classifying_intent", label: "Classifying Intent", icon: Lightning },
  { key: "embedding_keywords", label: "Embedding Keywords", icon: Brain },
  { key: "clustering", label: "Building Topic Clusters", icon: GridFour },
  { key: "agent_researching", label: "Agent Researching", icon: Robot },
  { key: "agent_writing", label: "Agent Writing Content", icon: PencilLine },
  { key: "completed", label: "Complete", icon: CheckCircle },
];

interface Progress {
  current_stage: string | null;
  current_detail: string | null;
  stage_index: number;
  total_stages: number;
  stages: { name: string; started_at: string; detail: string | null }[];
}

interface PollResponse {
  status: string;
  progress: Progress | null;
  article?: { id: string; slug: string };
  error?: string;
}

const POLL_INTERVAL = 3000;

export default function GeneratingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("jobId") ?? "";
  const tenantSlug = searchParams.get("tenantSlug") ?? "default";
  const businessName = searchParams.get("businessName") ?? "Your Business";

  const [progress, setProgress] = useState<Progress | null>(null);
  const [status, setStatus] = useState<string>("processing");
  const [error, setError] = useState<string | null>(null);

  const poll = useCallback(async () => {
    if (!jobId) return;
    try {
      const res = await fetch(
        `/api/rank-better/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`
      );
      if (!res.ok) return;
      const data: PollResponse = await res.json();

      setStatus(data.status);
      if (data.progress) setProgress(data.progress);

      if (data.status === "completed" && data.articlesCreated) {
        router.push(`/dashboard/results/${jobId}?tenantSlug=${encodeURIComponent(tenantSlug)}`);
      }

      if (data.status === "failed") {
        setError(data.error ?? "Generation failed");
      }
    } catch {}
  }, [jobId, tenantSlug, router]);

  useEffect(() => {
    if (!jobId || status === "completed" || status === "failed") return;
    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [jobId, status, poll]);

  const completedStages = new Set(
    progress?.stages.map((s) => s.key ?? s.name) ?? []
  );
  const currentStageKey = progress?.current_stage ?? null;
  const currentDetail = progress?.current_detail ?? null;

  function getStageStatus(key: string) {
    if (completedStages.has(key) && key !== currentStageKey) return "done";
    if (key === currentStageKey) return "active";
    return "pending";
  }

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Generating" },
        ]}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold">{businessName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generating SEO content strategy...
          </p>
        </div>

        <Card className="w-full max-w-lg shadow-[var(--shadow-surface)]">
          <CardContent className="flex flex-col gap-1 py-6">
            {STAGES.map((stage) => {
              const stageStatus = getStageStatus(stage.key);
              const Icon = stage.icon;
              const detail =
                stage.key === currentStageKey ? currentDetail : null;

              return (
                <div
                  key={stage.key}
                  className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    stageStatus === "active"
                      ? "bg-primary/5"
                      : ""
                  }`}
                >
                  <div className="mt-0.5">
                    {stageStatus === "done" ? (
                      <CheckCircle
                        className="size-5 text-primary"
                        weight="fill"
                      />
                    ) : stageStatus === "active" ? (
                      <CircleNotch
                        className="size-5 text-primary animate-spin"
                        weight="bold"
                      />
                    ) : (
                      <Circle
                        className="size-5 text-muted-foreground/30"
                        weight="regular"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium ${
                        stageStatus === "pending"
                          ? "text-muted-foreground/40"
                          : stageStatus === "active"
                          ? "text-foreground"
                          : "text-foreground"
                      }`}
                    >
                      <Icon
                        className="size-4 inline-block mr-1.5 -mt-0.5"
                        weight={stageStatus === "active" ? "fill" : "regular"}
                      />
                      {stage.label}
                    </div>
                    {detail && stageStatus === "active" && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {error && (
          <div className="text-sm text-destructive text-center max-w-md">
            {error}
          </div>
        )}
      </div>
    </>
  );
}
