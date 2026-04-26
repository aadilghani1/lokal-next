const BLOG_DOMAIN =
  process.env.NEXT_PUBLIC_BLOG_DOMAIN ?? "localhost:3000";

function getProto() {
  return BLOG_DOMAIN.startsWith("localhost") ? "http" : "https";
}

export function getBaseUrl() {
  return `${getProto()}://${BLOG_DOMAIN}`;
}

export function getTenantBaseUrl(tenantSlug: string) {
  return `${getProto()}://${tenantSlug}.${BLOG_DOMAIN}`;
}

export function getBlogArticleUrl(tenantSlug: string, articleSlug: string) {
  return `${getTenantBaseUrl(tenantSlug)}/article/${articleSlug}`;
}

export function getBlogHomeUrl(tenantSlug: string) {
  return getTenantBaseUrl(tenantSlug);
}

export function getCanonicalArticleUrl(tenantSlug: string, articleSlug: string) {
  return getBlogArticleUrl(tenantSlug, articleSlug);
}

export function getBlogFeedUrl(tenantSlug: string) {
  return `${getTenantBaseUrl(tenantSlug)}/feed.xml`;
}
