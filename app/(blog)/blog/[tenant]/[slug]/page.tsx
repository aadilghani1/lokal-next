import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle, getSimilarArticles } from "@/services/article-service";
import { getProfileBySlug } from "@/services/profile-service";
import { markdownToHtml } from "@/lib/markdown";
import { ArticleRenderer } from "@/components/blog/article-renderer";
import { LogoMark } from "@/components/logo";
import { formatDate } from "@/lib/format-date";

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

  const profile = await getProfileBySlug(tenant);
  const photoRefs = (profile?.photoRefs as string[]) ?? [];

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
                {article.publishedAt ? formatDate(article.publishedAt) : "Draft"}
              </span>
            </div>
          </div>
        </div>
        {photoRefs.length > 0 && (
          <div className="mb-10 -mx-2 overflow-hidden rounded-xl">
            <img
              src={`/api/photos?ref=${photoRefs[0]}`}
              alt={article.title}
              className="w-full h-64 object-cover rounded-xl"
              loading="eager"
            />
          </div>
        )}
        <ArticleRenderer htmlContent={htmlContent} />
        {photoRefs.length > 1 && (
          <div className="mt-12 grid grid-cols-2 gap-3">
            {photoRefs.slice(1, 5).map((ref, i) => (
              <img
                key={i}
                src={`/api/photos?ref=${ref}`}
                alt={`${article.title} - Photo ${i + 2}`}
                className="w-full h-40 object-cover rounded-lg"
                loading="lazy"
              />
            ))}
          </div>
        )}
        <RelatedArticles articleId={article.id} tenant={tenant} />
      </main>
    </>
  );
}

async function RelatedArticles({ articleId, tenant }: { articleId: string; tenant: string }) {
  let similar: { id: string; title: string; tenantSlug: string; slug: string; similarity: number }[] = [];
  try {
    similar = await getSimilarArticles(articleId, 3);
  } catch {}

  if (similar.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-border">
      <h3 className="font-heading text-lg font-semibold mb-4">Related Articles</h3>
      <div className="grid gap-3">
        {similar.map((s) => (
          <Link
            key={s.id}
            href={`/blog/${s.tenantSlug}/${s.slug}`}
            className="block rounded-lg border border-border/50 px-4 py-3 hover:bg-muted/30 transition-colors"
          >
            <p className="text-sm font-medium">{s.title}</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5 font-mono">
              {Math.round(s.similarity * 100)}% similar
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
