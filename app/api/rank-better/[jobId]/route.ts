import { NextResponse } from "next/server";
import {
  createArticle,
  createContentJob,
  completeContentJob,
  getContentJobByJobId,
} from "@/services/article-service";
import {
  backendArticleSchema,
  type BackendArticle,
  type BackendResponse,
} from "@/domains/article";
import { CONTENT_GEN_URL, getContentGenHeaders } from "@/lib/content-gen";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const tenantSlug =
    new URL(_request.url).searchParams.get("tenantSlug") ?? "default";

  const res = await fetch(`${CONTENT_GEN_URL}/api/v1/analyze/${jobId}`, {
    headers: getContentGenHeaders(),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to check job status" },
      { status: 502 },
    );
  }

  const data = (await res.json()) as BackendResponse;

  if (data.status === "completed" && data.content) {
    const existingJob = await getContentJobByJobId(jobId);
    if (existingJob && existingJob.status === "completed") {
      return NextResponse.json({
        ...data,
        contentJobId: existingJob.id,
        articlesCreated: true,
      });
    }

    try {
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

      contentJob = await completeContentJob(jobId, {
        competitors: (data.competitors ?? []) as unknown as Parameters<typeof completeContentJob>[1]["competitors"],
        topicClusters: (data.topic_clusters ?? []) as unknown as Parameters<typeof completeContentJob>[1]["topicClusters"],
        totalKeywordsFound: data.total_keywords_found ?? 0,
        totalClusters: data.total_clusters ?? 0,
        agentToolCalls: (data.content.tool_calls ?? []) as Record<string, unknown>[],
        agentInputTokens: data.content.total_input_tokens ?? 0,
        agentOutputTokens: data.content.total_output_tokens ?? 0,
      });

      const rawArticles = data.content.articles ?? [];
      const createdArticles: { id: string; slug: string; title: string; targetKeyword?: string }[] = [];

      if (rawArticles.length > 0) {
        for (const raw of rawArticles) {
          const parsed = backendArticleSchema.safeParse(raw);
          if (!parsed.success) {
            console.warn("[rank-better] Skipping invalid article:", parsed.error.message);
            continue;
          }
          const ba: BackendArticle = parsed.data;
          const title = ba.meta_title || ba.target_keyword || "SEO Article";

          const article = await createArticle({
            jobId,
            contentJobId: contentJob.id,
            tenantSlug,
            title,
            markdownContent: ba.article_markdown,
            clusterKeywords: [ba.target_keyword, ...ba.supporting_keywords],
            metaDescription: ba.meta_description || undefined,
            schemaJsonld: ba.schema_jsonld ?? undefined,
            embedding: ba.embedding ?? undefined,
          });

          createdArticles.push({
            id: article.id,
            slug: article.slug,
            title: article.title,
            targetKeyword: ba.target_keyword,
          });
        }
      } else if (data.content.full_response) {
        const md = data.content.full_response;
        const match = md.match(/^#\s+(.+)$/m);
        const title = match
          ? match[1].trim().slice(0, 200)
          : "SEO Strategy";

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
        articleError:
          err instanceof Error ? err.message : "Unknown article creation error",
      });
    }
  }

  return NextResponse.json(data);
}
