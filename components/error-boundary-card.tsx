"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { WarningCircle, ArrowCounterClockwise, House } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

interface Segment {
  label: string;
  href?: string;
}

interface ErrorBoundaryCardProps {
  title: string;
  message: string;
  reset: () => void;
  segments?: Segment[];
  showDashboardLink?: boolean;
}

export function ErrorBoundaryCard({
  title,
  message,
  reset,
  segments,
  showDashboardLink = false,
}: ErrorBoundaryCardProps) {
  return (
    <>
      {segments && <DashboardHeader segments={segments} />}

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-12">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <WarningCircle className="size-6 text-destructive" weight="duotone" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {message}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Button onClick={reset} variant="outline" className="gap-2">
            <ArrowCounterClockwise className="size-4" weight="bold" />
            Try again
          </Button>
          {showDashboardLink && (
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <House className="size-4" weight="bold" />
                Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
