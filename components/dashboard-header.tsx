import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface DashboardHeaderProps {
  segments: BreadcrumbSegment[];
  title?: string;
  subtitle?: string;
}

export function DashboardHeader({ segments, title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="shrink-0 px-8 pt-6 pb-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((segment, i) => {
              const isLast = i === segments.length - 1;
              return (
                <BreadcrumbItem key={segment.label}>
                  {isLast ? (
                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink href={segment.href}>
                        {segment.label}
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {title && (
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-light tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
    </header>
  );
}
