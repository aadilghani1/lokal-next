import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLoading() {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 px-8">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-4 w-32" />
      </header>
      <div className="flex flex-1 flex-col gap-10 px-8 py-6">
        <div className="flex items-center gap-6">
          <Skeleton className="size-20 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </>
  );
}
