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
        title="Settings"
      />
      <div className="flex flex-1 flex-col gap-4 p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-[var(--shadow-surface)]">
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
          <Card className="shadow-[var(--shadow-surface)]">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Configure your dashboard preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Preferences settings coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
