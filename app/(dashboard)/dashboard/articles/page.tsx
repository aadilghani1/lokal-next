import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllArticles } from "@/services/article-service";
import { FileText } from "@phosphor-icons/react/dist/ssr";

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Articles" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-8">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">
            Generated Articles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Blog articles generated to improve your local search rankings.
          </p>
        </div>

        {articles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <FileText className="size-10 text-muted-foreground" weight="duotone" />
              <h3 className="font-semibold">No articles yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Run an audit on your Google Business Profile and click
                &quot;Rank Better&quot; to generate your first article.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {articles.map((article) => (
              <a
                key={article.id}
                href={`/blog/${article.tenantSlug}/${article.slug}`}
                className="group"
              >
                <Card className="transition-shadow hover:shadow-[var(--shadow-button-hover)]">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {article.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {article.tenantSlug}/{article.slug} &middot;{" "}
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString()
                          : "Draft"}
                      </span>
                    </div>
                    <Badge
                      variant={
                        article.status === "published"
                          ? "default"
                          : article.status === "generating"
                            ? "secondary"
                            : "destructive"
                      }
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
