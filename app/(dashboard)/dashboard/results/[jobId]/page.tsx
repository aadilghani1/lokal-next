import { notFound } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  getContentJobByJobId,
  getArticlesByJobId,
} from "@/services/article-service";
import { ensureDataFromBackend } from "@/services/backend-sync";
import type { ContentJob } from "@/domains/article";
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

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<React.ComponentProps<typeof Target>>;
  value: number;
  label: string;
}) {
  return (
    <Card className="shadow-(--shadow-surface)">
      <CardContent className="flex items-center gap-3 py-4">
        <Icon className="size-8 text-primary" weight="duotone" />
        <div>
          <div className="text-2xl font-bold font-mono">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
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

  let contentJob: ContentJob | null = await getContentJobByJobId(jobId);

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
        <div>
          <h2 className="font-heading text-xl font-semibold tracking-tight">
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

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Target} value={contentJob.totalKeywordsFound} label="Keywords Found" />
          <StatCard icon={TrendUp} value={contentJob.totalClusters} label="Topic Clusters" />
          <StatCard icon={ArticleIcon} value={articles.length} label="Articles Ready" />
        </div>

        {contentJob.competitors.length > 0 && (
          <Card className="shadow-(--shadow-surface)">
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
                        {c.organic_traffic?.toLocaleString() ?? "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {c.organic_keywords?.toLocaleString() ?? "-"}
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

        {articles.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Generated Articles</h3>
            <div className="grid gap-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/dashboard/articles/${article.id}`}
                  className="block"
                >
                  <Card className="shadow-(--shadow-surface) hover:shadow-(--shadow-button-hover) transition-shadow">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {article.title}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[11px] shrink-0"
                          >
                            {article.status}
                          </Badge>
                        </div>
                        {article.clusterKeywords &&
                          article.clusterKeywords.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap">
                              {article.clusterKeywords
                                .slice(0, 5)
                                .map((kw) => (
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
        )}

        {contentJob.topicClusters.length > 0 && (
          <Card className="shadow-(--shadow-surface)">
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
                            <span
                              key={kw}
                              className="text-xs bg-muted px-1.5 py-0.5 rounded"
                            >
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
