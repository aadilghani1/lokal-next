"use client";

import { ErrorBoundaryCard } from "@/components/error-boundary-card";

export default function ResultsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundaryCard
      title="Failed to load results"
      message="The content generation results couldn't be loaded. The job may still be processing."
      reset={reset}
      segments={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Results" },
      ]}
      showDashboardLink
    />
  );
}
