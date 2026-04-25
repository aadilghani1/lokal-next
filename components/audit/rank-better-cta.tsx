"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, SpinnerGap, WarningCircle } from "@phosphor-icons/react/dist/ssr";

interface RankBetterCtaProps {
  profileId: string;
}

interface GenerationResult {
  jobId: string;
  article: { slug: string; url: string };
}

type CtaState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: GenerationResult }
  | { status: "error"; message: string };

export function RankBetterCta({ profileId }: RankBetterCtaProps) {
  const [state, setState] = useState<CtaState>({ status: "idle" });

  async function handleClick() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/rank-better", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, tenantSlug: "tenant1" }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  if (state.status === "success") {
    return (
      <div className="flex items-center justify-between px-7 py-6 bg-foreground rounded-2xl">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-bold text-background">
            Article generated
          </span>
          <span className="text-sm text-muted-foreground">
            Job ID: {state.data.jobId.slice(0, 8)}...
          </span>
        </div>
        <a href={state.data.article.url}>
          <Button variant="default" size="lg" className="gap-2">
            View Article
            <ArrowRight className="size-4" weight="bold" />
          </Button>
        </a>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-center justify-between px-7 py-6 bg-destructive/10 rounded-2xl">
        <div className="flex items-center gap-3">
          <WarningCircle className="size-5 text-destructive shrink-0" weight="duotone" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-destructive">
              Generation failed
            </span>
            <span className="text-xs text-muted-foreground">
              {state.message}
            </span>
          </div>
        </div>
        <Button
          onClick={handleClick}
          variant="outline"
          size="sm"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-7 py-6 bg-foreground rounded-2xl">
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold text-background">
          Outrank your competitors
        </span>
        <span className="text-sm text-background/50">
          Generate SEO-optimized blog articles to boost your local search
          visibility.
        </span>
      </div>
      <Button
        onClick={handleClick}
        disabled={state.status === "loading"}
        size="lg"
        className="gap-2"
      >
        {state.status === "loading" ? (
          <>
            <SpinnerGap className="size-4 animate-spin" weight="bold" />
            Generating...
          </>
        ) : (
          <>
            Rank Better
            <ArrowRight className="size-4" weight="bold" />
          </>
        )}
      </Button>
    </div>
  );
}
