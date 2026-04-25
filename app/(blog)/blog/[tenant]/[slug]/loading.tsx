import { Skeleton } from "@/components/ui/skeleton";

export default function BlogArticleLoading() {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-6 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-5">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="flex flex-col gap-5 pb-8 border-b border-border mb-10">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <div className="flex items-center gap-2.5 pt-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full mt-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </main>
    </>
  );
}
