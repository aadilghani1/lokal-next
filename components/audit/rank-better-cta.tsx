"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, SpinnerGap, WarningCircle, CheckCircle } from "@phosphor-icons/react/dist/ssr";

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
      <div className="flex items-center gap-3">
        <a href={state.data.article.url}>
          <Button variant="default" size="lg" className="gap-2">
            <CheckCircle className="size-4" weight="bold" />
            View Article
            <ArrowRight className="size-4" weight="bold" />
          </Button>
        </a>
        <span className="text-xs text-muted-foreground">
          Generated &middot; {state.data.jobId.slice(0, 8)}
        </span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-center gap-3">
        <Button onClick={handleClick} variant="outline" size="lg" className="gap-2">
          <WarningCircle className="size-4 text-destructive" weight="bold" />
          Retry
        </Button>
        <span className="text-xs text-destructive">{state.message}</span>
      </div>
    );
  }

  return (
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
  );
}
