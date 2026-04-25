import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlesLoading() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-4 w-28" />
      </header>
      <div className="flex flex-1 flex-col gap-6 p-8">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-72 mt-1" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>
      </div>
    </>
  );
}
