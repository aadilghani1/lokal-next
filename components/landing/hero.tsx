"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { GBP_URL_EXAMPLES } from "@/domains/profile";
import { GrainShader } from "./grain-shader";

export function Hero() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/dashboard/audit?url=${encodeURIComponent(url)}`);
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
        <GrainShader className="absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-container flex-col items-center gap-8 px-4 pb-24 pt-16 text-center sm:pb-32 sm:pt-24 md:pb-40 md:pt-32">
        <div className="flex flex-col gap-5 max-w-2xl">
          <h1 className="font-heading text-3xl font-light tracking-tight text-balance leading-[1.15] text-foreground sm:text-4xl md:text-5xl">
            Know where you stand.
            <br />
            <span className="text-foreground/70">Then <mark className="bg-primary/15 text-primary px-1 -mx-1 rounded-lg decoration-0">outrank them.</mark></span>
          </h1>
          <p className="mx-auto max-w-md text-sm font-light text-foreground/70 leading-relaxed text-balance sm:max-w-lg sm:text-[15px]">
            Paste your Google Maps link. Get an instant audit, see
            your top 5 competitors, and generate blog content to climb the
            local rankings.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-lg flex-col gap-3 sm:flex-row"
        >
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={GBP_URL_EXAMPLES[0]}
            required
            className="flex-1 bg-card/80 backdrop-blur-sm !h-auto"
          />
          <Button type="submit" size="lg" className="gap-2 shrink-0">
            Check
            <ArrowRight className="size-4" weight="bold" />
          </Button>
        </form>

        <p className="text-[11px] font-light text-muted-foreground/50 tracking-wide">
          Free audit &middot; Takes 10 seconds
        </p>
      </div>
    </section>
  );
}
