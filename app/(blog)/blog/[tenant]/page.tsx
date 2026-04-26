import { getArticlesByTenant } from "@/services/article-service";
import { LogoMark } from "@/components/logo";
import { formatDate } from "@/lib/format-date";

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const articles = await getArticlesByTenant(tenant);

  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-6 text-primary" />
            <span className="text-sm font-semibold">{tenant} Blog</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-heading text-2xl font-bold tracking-tight mb-8">
          Articles
        </h1>
        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No published articles yet.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {articles.map((article) => (
              <a
                key={article.id}
                href={`/blog/${tenant}/${article.slug}`}
                className="group flex flex-col gap-2 rounded-lg border border-border p-5 transition-colors hover:border-primary/30 hover:bg-accent/30"
              >
                <h2 className="text-base font-semibold group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {article.publishedAt && (
                    <time>{formatDate(article.publishedAt)}</time>
                  )}
                  <span>&middot;</span>
                  <span>5 min read</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
