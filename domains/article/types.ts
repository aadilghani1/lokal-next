export type ArticleStatus = "draft" | "generating" | "published" | "failed";

export interface BlogArticle {
  id: string;
  jobId: string;
  profileId: string;
  tenantSlug: string;
  slug: string;
  title: string;
  markdownContent: string;
  status: ArticleStatus;
  createdAt: Date;
  publishedAt: Date | null;
}
