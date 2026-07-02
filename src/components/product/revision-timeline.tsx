"use client";

import { ProductStatusBadge } from "./product-status-badge";
import { AppCard } from "@/components/shared/app-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/product-utils";
import type { Revision } from "@/types";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevisionTimelineProps {
  revisions: Revision[];
  currentRevision: string;
}

export function RevisionTimeline({
  revisions,
  currentRevision,
}: RevisionTimelineProps) {
  return (
    <div className="relative space-y-0">
      {revisions.map((rev, index) => {
        const isCurrent = rev.revision === currentRevision;
        const isLast = index === revisions.length - 1;

        return (
          <div key={rev.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <div className="absolute left-[19px] top-10 h-[calc(100%-16px)] w-px bg-border" />
            )}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold",
                isCurrent
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                  : "border-border bg-muted text-muted-foreground"
              )}
            >
              {rev.revision}
            </div>
            <AppCard
              className={cn(
                "flex-1 p-4",
                isCurrent && "border-l-2 border-l-emerald-500 dark:border-l-emerald-400"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">
                      Revision {rev.revision}
                    </span>
                    <ProductStatusBadge status={rev.status} />
                    {isCurrent && (
                      <Badge className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rev.description}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Created by {rev.author.name}</span>
                    <span>{formatDate(rev.createdAt, { dateStyle: "medium" })}</span>
                    <span>
                      Release status:{" "}
                      <span className="font-medium text-foreground">
                        {rev.status === "Released" ? "Released" : rev.status}
                      </span>
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </AppCard>
          </div>
        );
      })}
    </div>
  );
}
