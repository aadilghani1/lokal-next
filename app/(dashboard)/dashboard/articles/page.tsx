import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllArticles } from "@/services/article-service";
import { FileText, ArrowSquareOut, Globe } from "@phosphor-icons/react/dist/ssr";

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
      <div className="flex flex-1 flex-col gap-4 p-8">
        {articles.length === 0 ? (
          <Card className="shadow-[var(--shadow-surface)]">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <FileText className="size-10 text-muted-foreground" weight="duotone" />
              <h3 className="font-medium">No articles yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Run an audit on your Google Business Profile and click
                &quot;Rank Better&quot; to generate your first article.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {articles.map((article) => {
              const isPublished = article.status === "published";
              return (
                <a
                  key={article.id}
                  href={`/dashboard/articles/${article.id}`}
                  className="group"
                >
                  <Card className="shadow-[var(--shadow-surface)] transition-shadow hover:shadow-[var(--shadow-button-hover)]">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          {article.title}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="size-3 shrink-0" weight="bold" />
                          {article.tenantSlug}.{process.env.NEXT_PUBLIC_BLOG_DOMAIN ?? "localhost:3000"}/{article.slug}
                          {article.publishedAt && (
                            <> &middot; {new Date(article.publishedAt).toLocaleDateString()}</>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isPublished ? "default" : "secondary"}
                        >
                          {article.status}
                        </Badge>
                        {isPublished && (
                          <ArrowSquareOut className="size-3.5 text-muted-foreground" weight="bold" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
