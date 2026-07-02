"use client";

import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import { SectionHeader } from "@/components/shared/section-header";
import type { RevisionComparison } from "@/types/revisions";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevisionCompareCardProps {
  comparison: RevisionComparison;
}

function DiffSection({
  title,
  items,
}: {
  title: string;
  items: RevisionComparison["metadataChanges"];
}) {
  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No changes detected
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.field}
          className={cn(
            "rounded-lg border p-3 text-sm",
            item.changeType === "added" &&
              "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20",
            item.changeType === "removed" &&
              "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
            item.changeType === "modified" &&
              "border-border bg-muted/30"
          )}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {item.changeType === "added" && (
              <Plus className="h-3.5 w-3.5 text-emerald-600" />
            )}
            {item.changeType === "removed" && (
              <Minus className="h-3.5 w-3.5 text-red-600" />
            )}
            {item.changeType === "modified" && (
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="font-medium">{item.field}</span>
            <Badge variant="outline" className="text-[10px] ml-auto capitalize">
              {item.changeType}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
            <span className={item.changeType === "removed" ? "line-through" : ""}>
              {item.before || "—"}
            </span>
            {item.changeType === "modified" && (
              <>
                <ArrowRight className="h-3 w-3 shrink-0" />
                <span className="text-foreground font-medium">{item.after}</span>
              </>
            )}
            {item.changeType === "added" && (
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                {item.after}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RevisionCompareCard({ comparison }: RevisionCompareCardProps) {
  const { revisionA, revisionB } = comparison;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="text-center">
          <Badge variant="outline" className="font-mono text-base px-3 py-1">
            Rev {revisionA.revision}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">{revisionA.state}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <div className="text-center">
          <Badge variant="outline" className="font-mono text-base px-3 py-1">
            Rev {revisionB.revision}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">{revisionB.state}</p>
        </div>
      </div>

      <AppCard>
        <AppCardHeader>
          <SectionHeader title="Metadata Changes" />
        </AppCardHeader>
        <AppCardContent>
          <DiffSection title="Metadata" items={comparison.metadataChanges} />
        </AppCardContent>
      </AppCard>

      <AppCard>
        <AppCardHeader>
          <SectionHeader title="Document Changes" />
        </AppCardHeader>
        <AppCardContent>
          <DiffSection title="Documents" items={comparison.documentChanges} />
        </AppCardContent>
      </AppCard>

      <AppCard>
        <AppCardHeader>
          <SectionHeader title="BOM Changes" />
        </AppCardHeader>
        <AppCardContent>
          <DiffSection title="BOM" items={comparison.bomChanges} />
        </AppCardContent>
      </AppCard>
    </div>
  );
}
