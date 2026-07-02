"use client";

import { getFieldDiffs } from "@/constants/audit-data";
import { cn } from "@/lib/utils";

interface FieldComparisonViewProps {
  before: Record<string, string | number | boolean | null>;
  after: Record<string, string | number | boolean | null>;
  className?: string;
}

export function FieldComparisonView({
  before,
  after,
  className,
}: FieldComparisonViewProps) {
  const diffs = getFieldDiffs(before, after);

  if (diffs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No field differences recorded
      </p>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      <div className="grid grid-cols-3 bg-muted/50 border-b border-border text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <div className="px-4 py-2">Field</div>
        <div className="px-4 py-2">Before</div>
        <div className="px-4 py-2">After</div>
      </div>
      {diffs.map((diff) => (
        <div
          key={diff.field}
          className={cn(
            "grid grid-cols-3 border-b border-border last:border-0 text-sm",
            diff.changed && "bg-amber-500/5"
          )}
        >
          <div className="px-4 py-2 font-medium">{diff.field}</div>
          <div
            className={cn(
              "px-4 py-2 text-muted-foreground",
              diff.changed && "line-through decoration-red-400/50"
            )}
          >
            {diff.before}
          </div>
          <div
            className={cn(
              "px-4 py-2",
              diff.changed ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-muted-foreground"
            )}
          >
            {diff.after}
          </div>
        </div>
      ))}
    </div>
  );
}
