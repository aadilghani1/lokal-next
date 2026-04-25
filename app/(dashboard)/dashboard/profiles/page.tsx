import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Storefront } from "@phosphor-icons/react/dist/ssr";

export default function ProfilesPage() {
  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profiles" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Google Business Profiles
          </h1>
        </div>
        <Card>
          <CardHeader className="flex flex-col items-center gap-2 py-12">
            <Storefront className="size-12 text-muted-foreground" weight="duotone" />
            <CardTitle>No profiles yet</CardTitle>
            <CardDescription>
              Connect your first Google Business Profile to get started.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}
