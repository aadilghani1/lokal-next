import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { getArticleById } from "@/services/article-service";
import { markdownToHtml } from "@/lib/markdown";
import { getBlogArticleUrl } from "@/lib/blog-url";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublishButton } from "./publish-button";
import { ArrowSquareOut, LinkSimple } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) notFound();

  const htmlContent = markdownToHtml(article.markdownContent);
  const isDraft = article.status === "draft";
  const blogUrl = getBlogArticleUrl(article.tenantSlug, article.slug);

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Articles", href: "/dashboard/articles" },
          { label: article.title.slice(0, 30) + (article.title.length > 30 ? "..." : "") },
        ]}
      />

      <div className="flex flex-1 flex-col overflow-auto">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <Badge variant={isDraft ? "secondary" : "default"}>
              {article.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDate(article.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isDraft && (
              <span className="mr-2 flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                <LinkSimple className="size-3" weight="bold" />
                {article.tenantSlug}.{process.env.NEXT_PUBLIC_BLOG_DOMAIN ?? "localhost:3000"}
              </span>
            )}
            {isDraft ? (
              <PublishButton articleId={article.id} />
            ) : (
              <a href={blogUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5">
                  View on blog
                  <ArrowSquareOut className="size-3.5" weight="bold" />
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl px-8 pb-16">
          <Card className="shadow-[var(--shadow-surface)]">
            <CardContent className="py-10 px-8">
              <h1 className="font-heading text-2xl font-bold tracking-tight mb-8">
                {article.title}
              </h1>
              <ArticleRenderer htmlContent={htmlContent} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
