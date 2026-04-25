import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Settings
        </h1>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Manage your organization settings and team members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the organization switcher in the sidebar to manage your
                organizations.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your personal account settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click your avatar in the sidebar to manage your account.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
