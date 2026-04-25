import { notFound } from "next/navigation";
import { getArticle } from "@/services/article-service";
import { markdownToHtml } from "@/lib/markdown";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { LogoMark } from "@/components/logo";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>;
}) {
  const { tenant, slug } = await params;
  const article = await getArticle(tenant, slug);

  if (!article) {
    notFound();
  }

  const htmlContent = markdownToHtml(article.markdownContent);

  return (
    <>
      {article.schemaJsonld && article.schemaJsonld.length > 0 && (
        <>
          {article.schemaJsonld.map((schema, i) => (
            <script
              key={i}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
          ))}
        </>
      )}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-6 text-primary" />
            <span className="text-sm font-semibold">{tenant} Blog</span>
          </div>
          <nav className="flex items-center gap-5">
            <a
              href={`/blog/${tenant}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Home
            </a>
            <span className="text-sm text-muted-foreground">Articles</span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="flex flex-col gap-5 pb-8 border-b border-border mb-10">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-primary">
              Local SEO
            </span>
            <span className="text-muted-foreground">&middot;</span>
            <span className="text-muted-foreground">5 min read</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight leading-tight sm:text-4xl">
            {article.title}
          </h1>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-xs font-semibold text-accent-foreground">
                {tenant.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{tenant}</span>
              <span className="text-xs text-muted-foreground">
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Draft"}
              </span>
            </div>
          </div>
        </div>
        <ArticleRenderer htmlContent={htmlContent} />
      </main>
    </>
  );
}
