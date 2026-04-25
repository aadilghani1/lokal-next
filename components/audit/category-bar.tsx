import type { AuditCategory } from "@/domains/profile";

interface CategoryBarProps {
  category: AuditCategory;
}

export function CategoryBar({ category }: CategoryBarProps) {
  const percentage = (category.score / category.maxScore) * 100;

  return (
    <div className="flex items-center gap-4">
      <span className="w-[130px] shrink-0 text-sm font-medium text-muted-foreground">
        {category.name}
      </span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-sm font-medium text-foreground">
        {category.score}/{category.maxScore}
      </span>
    </div>
  );
}
