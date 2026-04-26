import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <DashboardHeader segments={[{ label: "Overview" }]} />
      <div className="flex flex-1 flex-col gap-6 p-8">
        <Card className="shadow-(--shadow-surface)">
          <CardContent className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="shadow-(--shadow-surface)">
              <CardContent className="flex items-center justify-between py-3">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
