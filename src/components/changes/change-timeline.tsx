"use client";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/product-utils";
import type { ChangeTimelineEvent } from "@/types/changes";
import {
  CheckCircle2,
  FileText,
  Send,
  Eye,
  XCircle,
  Wrench,
  Lock,
  ArrowRightLeft,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const eventConfig: Record<
  ChangeTimelineEvent["type"],
  { icon: React.ElementType; color: string }
> = {
  Created: { icon: FileText, color: "text-cyan-600" },
  Submitted: { icon: Send, color: "text-blue-600" },
  Reviewed: { icon: Eye, color: "text-violet-600" },
  Approved: { icon: CheckCircle2, color: "text-emerald-600" },
  Rejected: { icon: XCircle, color: "text-red-600" },
  Implemented: { icon: Wrench, color: "text-orange-600" },
  Closed: { icon: Lock, color: "text-muted-foreground" },
  Converted: { icon: ArrowRightLeft, color: "text-indigo-600" },
  "ECN Issued": { icon: Send, color: "text-amber-600" },
};

interface ChangeTimelineProps {
  events: ChangeTimelineEvent[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ChangeTimeline({ events }: ChangeTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">No history yet</p>
    );
  }

  return (
    <div className="space-y-0">
      {sorted.map((event, i) => {
        const config = eventConfig[event.type];
        const Icon = config.icon;
        return (
          <div key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
            {i < sorted.length - 1 && (
              <div className="absolute left-[17px] top-10 h-[calc(100%-24px)] w-px bg-border" />
            )}
            <Avatar className="h-9 w-9 shrink-0 border border-border">
              <AvatarFallback className="text-xs bg-muted">
                {getInitials(event.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
                <span className="text-sm font-medium">{event.type}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDate(event.timestamp, { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              {event.note && (
                <p className="text-sm text-muted-foreground">{event.note}</p>
              )}
              <p className="text-xs text-muted-foreground/70">{event.user.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
