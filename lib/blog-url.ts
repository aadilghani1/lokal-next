const BLOG_DOMAIN =
  process.env.NEXT_PUBLIC_BLOG_DOMAIN ?? "localhost:3000";

export function getBlogArticleUrl(tenantSlug: string, articleSlug: string) {
  const proto = BLOG_DOMAIN.startsWith("localhost") ? "http" : "https";
  return `${proto}://${tenantSlug}.${BLOG_DOMAIN}/article/${articleSlug}`;
}

export function getBlogHomeUrl(tenantSlug: string) {
  const proto = BLOG_DOMAIN.startsWith("localhost") ? "http" : "https";
  return `${proto}://${tenantSlug}.${BLOG_DOMAIN}`;
}

export function getCanonicalArticleUrl(tenantSlug: string, articleSlug: string) {
  return getBlogArticleUrl(tenantSlug, articleSlug);
}
