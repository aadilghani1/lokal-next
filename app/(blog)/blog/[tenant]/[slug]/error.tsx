"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BlogArticleError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Blog article error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <WarningCircle className="size-10 text-destructive" weight="duotone" />
        <h2 className="font-heading text-lg font-semibold">
          Failed to load article
        </h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "This article couldn't be rendered. It may be corrupted or temporarily unavailable."}
        </p>
        <Button onClick={reset} variant="outline" size="sm">
          Try again
        </Button>
      </div>
    </div>
  );
}
