import type { Competitor } from "@/domains/audit";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CompetitorTableProps {
  competitors: Competitor[];
  userRank?: number;
}

export function CompetitorTable({
  competitors,
  userRank = 3,
}: CompetitorTableProps) {
  return (
    <div className="overflow-hidden -mx-6 -mb-6">
      {competitors.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No competitors found yet. Click &quot;Rank Better&quot; to discover them.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Competitor</TableHead>
              <TableHead className="w-24 text-right">Traffic</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.map((competitor) => {
              const isUser = competitor.rank === userRank;
              return (
                <TableRow
                  key={competitor.rank}
                  className={isUser ? "bg-accent hover:bg-accent" : ""}
                >
                  <TableCell
                    className={`font-mono text-sm ${
                      isUser ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {String(competitor.rank).padStart(2, "0")}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          isUser ? "text-primary font-semibold" : ""
                        }`}
                      >
                        {competitor.name}
                      </span>
                      {isUser && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-[11px]">
                          YOU
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-sm font-bold ${
                      competitor.rank <= 2
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {competitor.overallScore > 0
                      ? competitor.overallScore.toLocaleString()
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
