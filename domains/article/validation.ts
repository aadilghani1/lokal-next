import { z } from "zod/v4";

const TENANT_SLUG_REGEX = /^[a-z0-9-]+$/;

export const createArticleSchema = z.object({
  jobId: z.string().min(1),
  tenantSlug: z.string().min(1).max(50).regex(TENANT_SLUG_REGEX),
  title: z.string().min(1).max(200),
  markdownContent: z.string().min(1),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;

export const rankBetterRequestSchema = z.object({
  gbpUrl: z.string().min(1).url(),
  tenantSlug: z
    .string()
    .max(50)
    .regex(/^[a-z0-9-]*$/)
    .default("business"),
  profileId: z.string().uuid().optional(),
  competitorUrls: z.array(z.string().url()).optional(),
  businessName: z.string().max(200).optional(),
  businessCategory: z.string().max(100).optional(),
  businessLocation: z.string().max(200).optional(),
  businessRating: z.number().min(0).max(5).optional(),
  businessReviewCount: z.number().int().min(0).optional(),
});

export type RankBetterRequest = z.infer<typeof rankBetterRequestSchema>;

export const competitorResultSchema = z.object({
  url: z.string(),
  domain: z.string(),
  pages_crawled: z.number().int(),
  organic_traffic: z.number().nullable(),
  organic_keywords: z.number().nullable(),
  ranked_keywords_count: z.number().int(),
  top_pages: z.array(z.record(z.string(), z.unknown())),
});

export const topicClusterResultSchema = z.object({
  id: z.number().int(),
  label: z.string(),
  keywords: z.array(z.string()),
  total_search_volume: z.number(),
  avg_keyword_difficulty: z.number(),
  avg_cpc: z.number(),
  competitor_coverage: z.record(z.string(), z.number()),
  opportunity_score: z.number(),
});

export const contentJobCompletionSchema = z.object({
  competitors: z.array(competitorResultSchema),
  topicClusters: z.array(topicClusterResultSchema),
  totalKeywordsFound: z.number().int().min(0),
  totalClusters: z.number().int().min(0),
  agentToolCalls: z.array(z.record(z.string(), z.unknown())),
  agentInputTokens: z.number().int().min(0),
  agentOutputTokens: z.number().int().min(0),
});

export type ContentJobCompletion = z.infer<typeof contentJobCompletionSchema>;

export const backendArticleSchema = z.object({
  cluster_id: z.number().int().optional(),
  target_keyword: z.string(),
  supporting_keywords: z.array(z.string()).default([]),
  search_intent: z.string().default(""),
  meta_title: z.string().default(""),
  meta_description: z.string().default(""),
  content_type: z.string().default(""),
  competitive_angle: z.string().default(""),
  article_markdown: z.string().min(1),
  schema_jsonld: z.array(z.record(z.string(), z.unknown())).optional(),
  embedding: z.array(z.number()).optional(),
});

export type BackendArticle = z.infer<typeof backendArticleSchema>;
