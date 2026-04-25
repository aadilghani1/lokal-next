import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  getContentJobByJobId,
  getArticlesByJobId,
  completeContentJob,
  createArticle,
  createContentJob,
} from "@/services/article-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  Globe,
  Target,
  TrendUp,
  Article as ArticleIcon,
} from "@phosphor-icons/react/dist/ssr";

const CONTENT_GEN_URL = process.env.CONTENT_GEN_URL ?? "https://content-gen.openhook.dev";
const CONTENT_GEN_TOKEN = process.env.CONTENT_GEN_TOKEN ?? "";

async function ensureDataFromBackend(jobId: string, tenantSlug: string) {
  const headers: Record<string, string> = {};
  if (CONTENT_GEN_TOKEN) headers["Authorization"] = `Bearer ${CONTENT_GEN_TOKEN}`;

  const res = await fetch(`${CONTENT_GEN_URL}/api/v1/analyze/${jobId}`, { headers });
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== "completed" || !data.content) return null;

  // Ensure content job exists
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
      competitors: data.competitors ?? [],
      topicClusters: data.topic_clusters ?? [],
      totalKeywordsFound: data.total_keywords_found ?? 0,
      totalClusters: data.total_clusters ?? 0,
      agentToolCalls: data.content.tool_calls ?? [],
      agentInputTokens: data.content.total_input_tokens ?? 0,
      agentOutputTokens: data.content.total_output_tokens ?? 0,
    });
  }

  // Create articles if none exist
  const existing = await getArticlesByJobId(jobId);
  if (existing.length === 0 && data.content.articles?.length > 0) {
    for (const ba of data.content.articles) {
      await createArticle({
        jobId,
        contentJobId: contentJob.id,
        tenantSlug,
        title: ba.meta_title || ba.target_keyword || "SEO Article",
        markdownContent: ba.article_markdown,
        clusterKeywords: [ba.target_keyword, ...(ba.supporting_keywords ?? [])],
        schemaJsonld: ba.schema_jsonld,
      });
    }
  }

  return contentJob;
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ tenantSlug?: string }>;
}) {
  const { jobId } = await params;
  const { tenantSlug = "default" } = await searchParams;

  let contentJob = await getContentJobByJobId(jobId);

  // If content job is missing or incomplete, hydrate from backend
  if (!contentJob || contentJob.status !== "completed") {
    const hydrated = await ensureDataFromBackend(jobId, tenantSlug);
    if (hydrated) {
      contentJob = hydrated;
    } else if (!contentJob) {
      notFound();
    }
  }

  const articles = await getArticlesByJobId(jobId);

  return (
    <>
      <DashboardHeader
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Results" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-8 overflow-auto px-8 py-6 pb-16">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold">
            {contentJob.businessName ?? "Content Strategy"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {contentJob.totalKeywordsFound} keywords analyzed
            {" · "}
            {contentJob.totalClusters} topic clusters
            {" · "}
            {articles.length} articles generated
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Target className="size-8 text-primary" weight="duotone" />
              <div>
                <div className="text-2xl font-bold">{contentJob.totalKeywordsFound}</div>
                <div className="text-xs text-muted-foreground">Keywords Found</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <TrendUp className="size-8 text-primary" weight="duotone" />
              <div>
                <div className="text-2xl font-bold">{contentJob.totalClusters}</div>
                <div className="text-xs text-muted-foreground">Topic Clusters</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <ArticleIcon className="size-8 text-primary" weight="duotone" />
              <div>
                <div className="text-2xl font-bold">{articles.length}</div>
                <div className="text-xs text-muted-foreground">Articles Ready</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competitors */}
        {contentJob.competitors.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="size-4" weight="bold" />
                Competitors Analyzed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead className="text-right">Traffic</TableHead>
                    <TableHead className="text-right">Keywords</TableHead>
                    <TableHead className="text-right">Pages</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentJob.competitors.map((c) => (
                    <TableRow key={c.domain}>
                      <TableCell className="font-medium">{c.domain}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {c.organic_traffic?.toLocaleString() ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {c.organic_keywords?.toLocaleString() ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {c.pages_crawled}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Articles */}
        <div>
          <h3 className="text-sm font-medium mb-3">Generated Articles</h3>
          <div className="grid gap-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/dashboard/articles/${article.id}`}
                className="block"
              >
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {article.title}
                        </span>
                        <Badge variant="secondary" className="text-[11px] shrink-0">
                          {article.status}
                        </Badge>
                      </div>
                      {article.clusterKeywords && article.clusterKeywords.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {article.clusterKeywords.slice(0, 5).map((kw) => (
                            <span
                              key={kw}
                              className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground shrink-0 ml-4" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Topic Clusters */}
        {contentJob.topicClusters.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="size-4" weight="bold" />
                Topic Clusters by Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keywords</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Difficulty</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentJob.topicClusters.slice(0, 10).map((cluster) => (
                    <TableRow key={cluster.id}>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {cluster.keywords.slice(0, 3).map((kw) => (
                            <span key={kw} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {kw}
                            </span>
                          ))}
                          {cluster.keywords.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{cluster.keywords.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {cluster.total_search_volume.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {cluster.avg_keyword_difficulty.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-bold text-primary">
                        {cluster.opportunity_score.toFixed(0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
