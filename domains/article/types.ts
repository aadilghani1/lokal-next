export type ArticleStatus = "draft" | "generating" | "published" | "failed";
export type ContentJobStatus = "processing" | "completed" | "failed";

export interface BlogArticle {
  id: string;
  jobId: string;
  contentJobId: string | null;
  profileId: string;
  tenantSlug: string;
  slug: string;
  title: string;
  markdownContent: string;
  clusterKeywords: string[] | null;
  searchVolume: number | null;
  keywordDifficulty: number | null;
  metaDescription: string | null;
  schemaJsonld: Record<string, unknown>[] | null;
  status: ArticleStatus;
  createdAt: Date;
  publishedAt: Date | null;
}

export interface ContentJob {
  id: string;
  jobId: string;
  tenantSlug: string;
  businessName: string | null;
  businessCategory: string | null;
  businessLocation: string | null;
  competitors: CompetitorResult[];
  topicClusters: TopicClusterResult[];
  totalKeywordsFound: number;
  totalClusters: number;
  status: ContentJobStatus;
  createdAt: Date;
}

export interface CompetitorResult {
  url: string;
  domain: string;
  pages_crawled: number;
  organic_traffic: number | null;
  organic_keywords: number | null;
  ranked_keywords_count: number;
  top_pages: Record<string, unknown>[];
}

export interface TopicClusterResult {
  id: number;
  label: string;
  keywords: string[];
  total_search_volume: number;
  avg_keyword_difficulty: number;
  avg_cpc: number;
  competitor_coverage: Record<string, number>;
  opportunity_score: number;
}

export interface KeywordIntent {
  intent: string;
  weight: number;
  search_volume?: number;
}

export interface BackendResponse {
  status: string;
  business?: { name?: string; category?: string; location?: string };
  competitors?: Record<string, unknown>[];
  topic_clusters?: Record<string, unknown>[];
  total_keywords_found?: number;
  total_clusters?: number;
  keyword_intents?: Record<string, KeywordIntent>;
  progress?: { stages?: { stage: string; detail: string | null }[] };
  content?: {
    articles?: Record<string, unknown>[];
    full_response?: string;
    tool_calls?: Record<string, unknown>[];
    total_input_tokens?: number;
    total_output_tokens?: number;
  };
}
