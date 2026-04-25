"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, SpinnerGap, WarningCircle } from "@phosphor-icons/react/dist/ssr";

interface RankBetterCtaProps {
  gbpUrl: string;
  tenantSlug: string;
  competitorUrls?: string[];
  businessName?: string;
  businessCategory?: string;
  businessLocation?: string;
}

type CtaState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string };

export function RankBetterCta({ gbpUrl, tenantSlug, competitorUrls, businessName, businessCategory, businessLocation }: RankBetterCtaProps) {
  const [state, setState] = useState<CtaState>({ status: "idle" });
  const router = useRouter();

  async function handleClick() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/rank-better", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gbpUrl, tenantSlug, competitorUrls, businessName, businessCategory, businessLocation }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const data = await res.json();
      router.push(
        `/dashboard/generating?jobId=${data.jobId}&tenantSlug=${tenantSlug}&businessName=${encodeURIComponent(data.businessName ?? "")}`
      );
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
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
          Starting...
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
