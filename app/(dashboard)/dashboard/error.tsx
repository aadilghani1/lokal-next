"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <WarningCircle className="size-10 text-destructive" weight="duotone" />
          <h2 className="font-heading text-lg font-semibold">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/50 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <Button onClick={reset} variant="outline" size="sm">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
