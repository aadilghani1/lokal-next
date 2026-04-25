import type { Competitor } from "@/domains/profile";
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
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12">#</TableHead>
            <TableHead>Business</TableHead>
            <TableHead className="w-16 text-center">Rating</TableHead>
            <TableHead className="w-20 text-center">Reviews</TableHead>
            <TableHead className="w-16 text-right">Score</TableHead>
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
                <TableCell className="text-center font-mono text-sm">
                  {competitor.rating}
                </TableCell>
                <TableCell className="text-center font-mono text-sm text-muted-foreground">
                  {competitor.reviewCount}
                </TableCell>
                <TableCell
                  className={`text-right font-mono text-sm font-bold ${
                    isUser || competitor.rank <= 2
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {competitor.overallScore}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
