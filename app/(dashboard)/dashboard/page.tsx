import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardOverviewPage() {
  return (
    <>
      <DashboardHeader segments={[{ label: "Overview" }]} title="Overview" />
      <div className="flex flex-1 flex-col gap-4 p-8">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-card shadow-[var(--shadow-surface)]" />
          <div className="aspect-video rounded-xl bg-card shadow-[var(--shadow-surface)]" />
          <div className="aspect-video rounded-xl bg-card shadow-[var(--shadow-surface)]" />
        </div>
        <div className="min-h-[300px] flex-1 rounded-xl bg-card shadow-[var(--shadow-surface)]" />
      </div>
    </>
  );
}
