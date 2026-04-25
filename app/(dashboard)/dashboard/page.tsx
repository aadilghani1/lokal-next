import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllArticles } from "@/services/article-service";
import { MagnifyingGlass, ArrowRight } from "@phosphor-icons/react/dist/ssr";

export default async function DashboardOverviewPage() {
  const articles = await getAllArticles();
  const recent = articles.slice(0, 5);

  return (
    <>
      <DashboardHeader segments={[{ label: "Overview" }]} />
      <div className="flex flex-1 flex-col gap-6 p-8">
        <Card className="shadow-[var(--shadow-surface)]">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/8">
                <MagnifyingGlass className="size-5 text-primary" weight="duotone" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Run an audit</span>
                <span className="text-xs text-muted-foreground">
                  Paste a Google Business Profile URL to get started.
                </span>
              </div>
            </div>
            <a href="/dashboard/audit">
              <Button size="sm" className="gap-1.5">
                Start
                <ArrowRight className="size-3.5" weight="bold" />
              </Button>
            </a>
          </CardContent>
        </Card>

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
