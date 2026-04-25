import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllArticles } from "@/services/article-service";
import { AuditUrlForm } from "@/components/dashboard/audit-url-form";

export default async function DashboardOverviewPage() {
  const articles = await getAllArticles();
  const recent = articles.slice(0, 5);

  return (
    <>
      <DashboardHeader segments={[{ label: "Overview" }]} />
      <div className="flex flex-1 flex-col gap-6 p-8">
        <AuditUrlForm />

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
