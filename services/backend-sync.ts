"use server";

import { CONTENT_GEN_URL, getContentGenAuthHeaders } from "@/lib/content-gen";
import {
  createArticle,
  createContentJob,
  completeContentJob,
  getContentJobByJobId,
  getArticlesByJobId,
} from "@/services/article-service";
import { backendArticleSchema } from "@/domains/article";
import type {
  ContentJob,
  CompetitorResult,
  TopicClusterResult,
  BackendResponse,
} from "@/domains/article";

export async function ensureDataFromBackend(
  jobId: string,
  tenantSlug: string,
): Promise<ContentJob | null> {
  const res = await fetch(`${CONTENT_GEN_URL}/api/v1/analyze/${jobId}`, {
    headers: getContentGenAuthHeaders(),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as BackendResponse;
  if (data.status !== "completed" || !data.content) return null;

  let contentJob = await getContentJobByJobId(jobId);
  if (!contentJob) {
    contentJob = await createContentJob({
      jobId,
      tenantSlug,
      businessName: data.business?.name,
      businessCategory: data.business?.category,
      businessLocation: data.business?.location,
    });
  }

  if (contentJob.status !== "completed") {
    contentJob = await completeContentJob(jobId, {
      competitors: (data.competitors ?? []) as unknown as CompetitorResult[],
      topicClusters: (data.topic_clusters ?? []) as unknown as TopicClusterResult[],
      totalKeywordsFound: data.total_keywords_found ?? 0,
      totalClusters: data.total_clusters ?? 0,
      agentToolCalls: (data.content.tool_calls ?? []) as Record<string, unknown>[],
      agentInputTokens: data.content.total_input_tokens ?? 0,
      agentOutputTokens: data.content.total_output_tokens ?? 0,
    });
  }

  const existing = await getArticlesByJobId(jobId);
  if (existing.length === 0 && data.content.articles?.length) {
    for (const raw of data.content.articles) {
      const parsed = backendArticleSchema.safeParse(raw);
      if (!parsed.success) continue;

      await createArticle({
        jobId,
        contentJobId: contentJob.id,
        tenantSlug,
        title:
          parsed.data.meta_title ||
          parsed.data.target_keyword ||
          "SEO Article",
        markdownContent: parsed.data.article_markdown,
        clusterKeywords: [
          parsed.data.target_keyword,
          ...parsed.data.supporting_keywords,
        ],
        schemaJsonld: parsed.data.schema_jsonld,
      });
    }
  }

  return contentJob;
}
