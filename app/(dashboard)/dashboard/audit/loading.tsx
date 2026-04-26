import { DashboardHeader } from "@/components/dashboard-header";
import {
  MagnifyingGlass,
  Buildings,
  ChartBar,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";

const steps = [
  { icon: MagnifyingGlass, label: "Looking up business details" },
  { icon: Buildings, label: "Discovering competitors" },
  { icon: ChartBar, label: "Scoring your profile" },
  { icon: UsersThree, label: "Ranking against competitors" },
];

export default function AuditResultsLoading() {
  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Audit" },
        ]}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 py-16">
        <div className="relative size-24">
          <svg
            width={96}
            height={96}
            viewBox="0 0 96 96"
            className="animate-spin"
            style={{ animationDuration: "3s" }}
          >
            <circle
              cx={48}
              cy={48}
              r={42}
              fill="none"
              stroke="currentColor"
              strokeWidth={5}
              className="text-muted"
            />
            <circle
              cx={48}
              cy={48}
              r={42}
              fill="none"
              stroke="currentColor"
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={264}
              strokeDashoffset={198}
              className="text-primary"
              transform="rotate(-90 48 48)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <MagnifyingGlass
              className="size-7 text-primary animate-pulse"
              weight="duotone"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Running audit
          </h2>
          <p className="text-sm text-muted-foreground">
            This usually takes 5–10 seconds
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className="flex items-center gap-3 animate-pulse"
              style={{ animationDelay: `${i * 400}ms` }}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/8">
                <step.icon
                  className="size-4 text-primary"
                  weight="duotone"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
