import { NextResponse } from "next/server";
import {
  createArticle,
  createContentJob,
  completeContentJob,
  getContentJobByJobId,
} from "@/services/article-service";

const CONTENT_GEN_URL =
  process.env.CONTENT_GEN_URL ?? "https://content-gen.openhook.dev";
const CONTENT_GEN_TOKEN = process.env.CONTENT_GEN_TOKEN ?? "";

function getHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (CONTENT_GEN_TOKEN) h["Authorization"] = `Bearer ${CONTENT_GEN_TOKEN}`;
  return h;
}

interface BackendArticle {
  cluster_id: number;
  target_keyword: string;
  supporting_keywords: string[];
  search_intent: string;
  meta_title: string;
  meta_description: string;
  content_type: string;
  competitive_angle: string;
  article_markdown: string;
  schema_jsonld?: Record<string, unknown>[];
  embedding?: number[];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const tenantSlug =
    new URL(_request.url).searchParams.get("tenantSlug") ?? "default";

  const res = await fetch(`${CONTENT_GEN_URL}/api/v1/analyze/${jobId}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to check job status" },
      { status: 502 }
    );
  }

  const data = await res.json();

  if (data.status === "completed" && data.content) {
    // Check if we already processed this job
    const existingJob = await getContentJobByJobId(jobId);
    if (existingJob && existingJob.status === "completed") {
      return NextResponse.json({
        ...data,
        contentJobId: existingJob.id,
        articlesCreated: true,
      });
    }

    try {
      // Ensure content job exists
      let contentJob = existingJob;
      if (!contentJob) {
        contentJob = await createContentJob({
          jobId,
          tenantSlug,
          businessName: data.business?.name,
          businessCategory: data.business?.category,
          businessLocation: data.business?.location,
        });
      }

      // Store the full result data
      contentJob = await completeContentJob(jobId, {
        competitors: data.competitors ?? [],
        topicClusters: data.topic_clusters ?? [],
        totalKeywordsFound: data.total_keywords_found ?? 0,
        totalClusters: data.total_clusters ?? 0,
        agentToolCalls: data.content.tool_calls ?? [],
        agentInputTokens: data.content.total_input_tokens ?? 0,
        agentOutputTokens: data.content.total_output_tokens ?? 0,
      });

      // Create individual articles from structured output
      const backendArticles: BackendArticle[] =
        data.content.articles ?? [];

      const createdArticles = [];

      if (backendArticles.length > 0) {
        for (const ba of backendArticles) {
          const title =
            ba.meta_title || ba.target_keyword || "SEO Article";
          const article = await createArticle({
            jobId,
            contentJobId: contentJob.id,
            tenantSlug,
            title,
            markdownContent: ba.article_markdown,
            clusterKeywords: [
              ba.target_keyword,
              ...ba.supporting_keywords,
            ],
            searchVolume: undefined,
            keywordDifficulty: undefined,
            schemaJsonld: ba.schema_jsonld,
            embedding: ba.embedding,
          });
          createdArticles.push({
            id: article.id,
            slug: article.slug,
            title: article.title,
            targetKeyword: ba.target_keyword,
            searchIntent: ba.search_intent,
            contentType: ba.content_type,
          });
        }
      } else if (data.content.full_response) {
        // Fallback: single article from raw markdown
        const md: string = data.content.full_response;
        const match = md.match(/^#\s+(.+)$/m);
        const title = match ? match[1].trim().slice(0, 200) : "SEO Strategy";
        const article = await createArticle({
          jobId,
          contentJobId: contentJob.id,
          tenantSlug,
          title,
          markdownContent: md,
        });
        createdArticles.push({
          id: article.id,
          slug: article.slug,
          title: article.title,
        });
      }

      return NextResponse.json({
        ...data,
        contentJobId: contentJob.id,
        articlesCreated: true,
        articles: createdArticles,
      });
    } catch (err) {
      console.error("[rank-better] article creation failed:", err);
      return NextResponse.json({
        ...data,
        articleError: String(err),
      });
    }
  }

  return NextResponse.json(data);
}
