import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilesLoading() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-4 w-24" />
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </>
  );
}
