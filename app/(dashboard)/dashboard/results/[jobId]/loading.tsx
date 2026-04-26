import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResultsLoading() {
  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Results" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-8 px-8 py-6">
        <div>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="shadow-(--shadow-surface)">
              <CardContent className="flex items-center gap-3 py-4">
                <Skeleton className="size-8 rounded" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-(--shadow-surface)">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
