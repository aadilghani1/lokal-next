"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuditError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Audit error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <WarningCircle className="size-10 text-destructive" weight="duotone" />
          <h2 className="font-heading text-lg font-semibold">
            Audit failed
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            {error.message || "We couldn't load the audit data. The profile may not exist or the service is temporarily unavailable."}
          </p>
          <div className="flex gap-2">
            <Button onClick={reset} variant="outline" size="sm">
              Retry
            </Button>
            <a href="/dashboard">
              <Button variant="ghost" size="sm">
                Back to dashboard
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
