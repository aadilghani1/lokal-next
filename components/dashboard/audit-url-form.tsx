"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MagnifyingGlass, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function AuditUrlForm() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    router.push(`/dashboard/audit?url=${encodeURIComponent(url.trim())}`);
  }

  return (
    <Card className="shadow-[var(--shadow-surface)]">
      <CardContent className="py-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/8">
            <MagnifyingGlass className="size-5 text-primary" weight="duotone" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Run an audit</span>
            <span className="text-xs text-muted-foreground">
              Paste a Google Business Profile URL to get started.
            </span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.google.com/maps/place/Your+Business..."
            required
            className="flex-1"
          />
          <Button type="submit" size="sm" className="gap-1.5 shrink-0">
            Audit
            <ArrowRight className="size-3.5" weight="bold" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
