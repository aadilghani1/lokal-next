import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuditResultsLoading() {
  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Audit" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-10 px-8 py-6">
        <div className="flex items-center gap-6">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-(--shadow-surface)">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-28 shrink-0" />
                  <Skeleton className="h-1.5 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-(--shadow-surface)">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
