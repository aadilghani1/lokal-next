import type { BlogArticle } from "@/domains/article";
import { getCanonicalArticleUrl } from "@/lib/blog-url";

interface ProfileInfo {
  name: string | null;
  category: string | null;
  location: string | null;
}

export function buildArticleSchema(
  article: BlogArticle,
  profile: ProfileInfo | null,
  imageUrl?: string,
): Record<string, unknown> {
  const url = getCanonicalArticleUrl(article.tenantSlug, article.slug);
  const authorName = profile?.name ?? article.tenantSlug;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    ...(article.metaDescription && { description: article.metaDescription }),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: (article.publishedAt ?? article.createdAt).toISOString(),
    dateModified: (article.publishedAt ?? article.createdAt).toISOString(),
    author: {
      "@type": "Organization",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Lokal",
      url: "https://lokal.so",
    },
    ...(article.clusterKeywords && { keywords: article.clusterKeywords }),
    ...(imageUrl && { image: imageUrl }),
    inLanguage: "en",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-speakable-headline]", "[data-speakable-summary]"],
    },
  };
}

export function buildLocalBusinessSchema(
  profile: ProfileInfo,
): Record<string, unknown> | null {
  if (!profile.name) return null;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: profile.name,
    ...(profile.category && { additionalType: profile.category }),
    ...(profile.location && {
      address: {
        "@type": "PostalAddress",
        addressLocality: profile.location,
      },
    }),
  };
}

function hasType(
  schemas: Record<string, unknown>[],
  type: string,
): boolean {
  return schemas.some(
    (s) =>
      s["@type"] === type ||
      (Array.isArray(s["@type"]) && (s["@type"] as string[]).includes(type)),
  );
}

/**
 * Merges AI-generated schemas with guaranteed fallbacks.
 * If the AI already produced a BlogPosting, we keep it and supplement.
 * Otherwise we inject our own.
 */
export function mergeSchemaJsonld(
  aiGenerated: Record<string, unknown>[] | null,
  article: BlogArticle,
  profile: ProfileInfo | null,
  imageUrl?: string,
): Record<string, unknown>[] {
  const result: Record<string, unknown>[] = [];

  if (aiGenerated && aiGenerated.length > 0) {
    for (const schema of aiGenerated) {
      if (!schema["@context"]) {
        schema["@context"] = "https://schema.org";
      }
      result.push(schema);
    }
  }

  if (!hasType(result, "BlogPosting") && !hasType(result, "Article")) {
    result.push(buildArticleSchema(article, profile, imageUrl));
  }

  if (profile && !hasType(result, "LocalBusiness")) {
    const biz = buildLocalBusinessSchema(profile);
    if (biz) result.push(biz);
  }

  return result;
}
