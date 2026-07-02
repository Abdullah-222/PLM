"use client";

import { cn } from "@/lib/utils";
import type { Activity } from "@/types";
import {
  CheckCircle2,
  Upload,
  MessageSquare,
  Edit3,
  Plus,
  Eye,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const typeIcons: Record<Activity["type"], React.ElementType> = {
  approve: CheckCircle2,
  upload: Upload,
  comment: MessageSquare,
  update: Edit3,
  create: Plus,
  review: Eye,
};

const typeColors: Record<Activity["type"], string> = {
  approve: "text-emerald-600 dark:text-emerald-400",
  upload: "text-blue-600 dark:text-blue-400",
  comment: "text-amber-600 dark:text-amber-400",
  update: "text-violet-600 dark:text-violet-400",
  create: "text-cyan-600 dark:text-cyan-400",
  review: "text-orange-600 dark:text-orange-400",
};

interface ActivityTimelineProps {
  activities: Activity[];
  className?: string;
}

function formatRelative(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ActivityTimeline({
  activities,
  className,
}: ActivityTimelineProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {activities.map((activity, i) => {
        const Icon = typeIcons[activity.type];
        return (
          <div key={activity.id} className="relative flex gap-3 pb-6 last:pb-0">
            {i < activities.length - 1 && (
              <div className="absolute left-[17px] top-10 h-[calc(100%-24px)] w-px bg-border" />
            )}
            <Avatar className="h-9 w-9 shrink-0 border border-border">
              <AvatarFallback className="text-xs bg-muted">
                {getInitials(activity.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-3.5 w-3.5", typeColors[activity.type])} />
                <span className="text-sm font-medium">{activity.action}</span>
                <span className="text-xs text-muted-foreground ml-auto shrink-0">
                  {formatRelative(activity.timestamp)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activity.description}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {activity.user.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
