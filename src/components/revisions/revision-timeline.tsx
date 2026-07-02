"use client";

import { formatDate, getInitials } from "@/lib/product-utils";
import type { RevisionTimelineEvent } from "@/types/revisions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CheckCircle2,
  FileText,
  GitBranch,
  Network,
  Plus,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const eventIcons: Record<RevisionTimelineEvent["type"], React.ElementType> = {
  created: Plus,
  approval: CheckCircle2,
  document_change: FileText,
  bom_change: Network,
  release: Rocket,
  obsolete: GitBranch,
};

const eventColors: Record<RevisionTimelineEvent["type"], string> = {
  created: "text-cyan-600 dark:text-cyan-400",
  approval: "text-emerald-600 dark:text-emerald-400",
  document_change: "text-blue-600 dark:text-blue-400",
  bom_change: "text-violet-600 dark:text-violet-400",
  release: "text-amber-600 dark:text-amber-400",
  obsolete: "text-red-600 dark:text-red-400",
};

interface RevisionTimelineProps {
  events: RevisionTimelineEvent[];
  className?: string;
}

export function RevisionTimeline({ events, className }: RevisionTimelineProps) {
  return (
    <div className={cn("relative space-y-0", className)}>
      {events.map((event, index) => {
        const Icon = eventIcons[event.type];
        const isLast = index === events.length - 1;
        return (
          <div key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <div className="absolute left-[17px] top-9 h-[calc(100%-12px)] w-px bg-border" />
            )}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
              <Icon className={cn("h-4 w-4", eventColors[event.type])} />
            </div>
            <div className="flex-1 min-w-0 space-y-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{event.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(event.timestamp, { dateStyle: "medium" })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[9px] bg-muted">
                    {getInitials(event.user.name)}
                  </AvatarFallback>
                </Avatar>
                <span>{event.user.name}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
