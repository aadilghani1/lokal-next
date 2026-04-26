"use client";

import { ErrorBoundaryCard } from "@/components/error-boundary-card";

export default function GeneratingError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundaryCard
      title="Generation failed"
      message="Something went wrong during content generation. You can retry or go back to the dashboard."
      reset={reset}
      segments={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Generating" },
      ]}
      showDashboardLink
    />
  );
}
