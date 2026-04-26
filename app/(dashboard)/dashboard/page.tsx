import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllArticles, getProcessingJobs } from "@/services/article-service";
import { getCurrentUser } from "@/services/user-service";
import { AuditUrlForm } from "@/components/dashboard/audit-url-form";
import { IntentModelCard } from "@/components/dashboard/intent-model-card";
import { CircleNotch, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export default async function DashboardOverviewPage() {
  const [articles, user] = await Promise.all([
    getAllArticles(),
    getCurrentUser(),
  ]);
  const processingJobs = user ? await getProcessingJobs(user.id) : [];
  const recent = articles.slice(0, 5);

  return (
    <>
      <DashboardHeader segments={[{ label: "Overview" }]} />
      <div className="flex flex-1 flex-col gap-6 p-8">
        <AuditUrlForm />

        <IntentModelCard />

        {processingJobs.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">In progress</span>
            {processingJobs.map((job) => (
              <a
                key={job.jobId}
                href={`/dashboard/generating?jobId=${encodeURIComponent(job.jobId)}&tenantSlug=${encodeURIComponent(job.tenantSlug)}&businessName=${encodeURIComponent(job.businessName ?? "Your Business")}`}
                className="group"
              >
                <Card className="shadow-[var(--shadow-surface)] transition-shadow hover:shadow-[var(--shadow-button-hover)] border-primary/20">
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <CircleNotch className="size-4 animate-spin text-primary" weight="bold" />
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {job.businessName ?? "Generating content"}
                      </span>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}

        {recent.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recent articles</span>
              <a
                href="/dashboard/articles"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                View all
              </a>
            </div>
            {recent.map((article) => (
              <a
                key={article.id}
                href={`/dashboard/articles/${article.id}`}
                className="group"
              >
                <Card className="shadow-[var(--shadow-surface)] transition-shadow hover:shadow-[var(--shadow-button-hover)]">
                  <CardContent className="flex items-center justify-between py-3">
                    <span className="text-sm group-hover:text-primary transition-colors">
                      {article.title}
                    </span>
                    <Badge
                      variant={article.status === "published" ? "default" : "secondary"}
                    >
                      {article.status}
                    </Badge>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
