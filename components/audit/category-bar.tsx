"use client";

import type { AuditCategory } from "@/domains/profile";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";

interface CategoryBarProps {
  category: AuditCategory;
}

export function CategoryBar({ category }: CategoryBarProps) {
  return (
    <Progress value={category.score} max={category.maxScore}>
      <ProgressLabel className="w-28 shrink-0 text-[13px] text-muted-foreground">
        {category.name}
      </ProgressLabel>
      <ProgressValue className="font-mono text-xs tabular-nums">
        {(formatted) => formatted}
      </ProgressValue>
    </Progress>
  );
}
