"use client";

import { ProductStatusBadge } from "@/components/product/product-status-badge";
import { formatDate, getInitials } from "@/lib/product-utils";
import type { DocumentVersionEntry } from "@/types/documents";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface VersionTimelineProps {
  versions: DocumentVersionEntry[];
  className?: string;
}

export function VersionTimeline({ versions, className }: VersionTimelineProps) {
  return (
    <div className={cn("relative space-y-0", className)}>
      {versions.map((entry, index) => {
        const isLatest = index === 0;
        const isLast = index === versions.length - 1;
        return (
          <div key={entry.version} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <div className="absolute left-[15px] top-8 h-[calc(100%-12px)] w-px bg-border" />
            )}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-mono font-bold",
                isLatest
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "border-border bg-muted text-muted-foreground"
              )}
            >
              {entry.version.replace("v", "")}
            </div>
            <div className="flex-1 min-w-0 space-y-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold font-mono">
                  v{entry.version}
                </span>
                {isLatest && (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Current
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {entry.changeSummary}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[9px] bg-muted">
                    {getInitials(entry.user.name)}
                  </AvatarFallback>
                </Avatar>
                <span>{entry.user.name}</span>
                <span>·</span>
                <span>{formatDate(entry.date, { dateStyle: "medium" })}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
