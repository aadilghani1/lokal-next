import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLoading() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-4 w-32" />
      </header>
      <div className="flex flex-1 flex-col gap-7 p-8">
        {/* Score hero skeleton */}
        <div className="flex items-center gap-10 rounded-2xl bg-card p-8 shadow-[var(--shadow-surface)]">
          <Skeleton className="size-[140px] rounded-full" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        </div>

        {/* Category bars skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-40" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-[130px]" />
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* Competitor table skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-[280px] rounded-xl" />
        </div>

        {/* CTA skeleton */}
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    </>
  );
}
