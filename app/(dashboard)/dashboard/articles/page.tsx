import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getArticlesPaginated } from "@/services/article-service";
import {
  FileText,
  ArrowSquareOut,
  Globe,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";

const PER_PAGE = 20;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const { articles, total } = await getArticlesPaginated(page, PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Articles" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-8">
        {total === 0 ? (
          <Card className="shadow-[var(--shadow-surface)]">
            <CardContent className="flex flex-col items-center gap-3 py-12">
              <FileText
                className="size-10 text-muted-foreground"
                weight="duotone"
              />
              <h3 className="font-medium">No articles yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Run an audit on your Google Maps listing and click
                &quot;Rank Better&quot; to generate your first article.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {total} article{total !== 1 && "s"}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {articles.map((article) => {
                const isPublished = article.status === "published";
                return (
                  <Link
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
                            <Globe
                              className="size-3 shrink-0"
                              weight="bold"
                            />
                            {article.tenantSlug}.
                            {process.env.NEXT_PUBLIC_BLOG_DOMAIN ??
                              "localhost:3000"}
                            /{article.slug}
                            {article.publishedAt && (
                              <>
                                {" "}
                                &middot;{" "}
                                {new Date(
                                  article.publishedAt,
                                ).toLocaleDateString()}
                              </>
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
                            <ArrowSquareOut
                              className="size-3.5 text-muted-foreground"
                              weight="bold"
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {page > 1 ? (
                  <Link
                    href={`/dashboard/articles?page=${page - 1}`}
                    className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <CaretLeft className="size-3.5" weight="bold" />
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium opacity-50 cursor-not-allowed">
                    <CaretLeft className="size-3.5" weight="bold" />
                    Previous
                  </span>
                )}
                <span className="text-xs text-muted-foreground px-3">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={`/dashboard/articles?page=${page + 1}`}
                    className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Next
                    <CaretRight className="size-3.5" weight="bold" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium opacity-50 cursor-not-allowed">
                    Next
                    <CaretRight className="size-3.5" weight="bold" />
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
