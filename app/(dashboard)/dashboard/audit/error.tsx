"use client";

import { ErrorBoundaryCard } from "@/components/error-boundary-card";

export default function AuditResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error.message.includes("Unauthorized")
    ? "Please sign in to run an audit."
    : "We couldn't complete the audit. The URL may be invalid or the service is temporarily unavailable.";

  return (
    <ErrorBoundaryCard
      title="Audit failed"
      message={message}
      reset={reset}
      segments={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Audit" },
      ]}
    />
  );
}
