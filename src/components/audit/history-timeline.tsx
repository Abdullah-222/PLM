"use client";

import Link from "next/link";
import { ActivityFeed } from "./activity-feed";
import type { ActivityFeedItem, ObjectRelationship } from "@/types/audit";
import { GitBranch } from "lucide-react";

interface HistoryTimelineProps {
  timeline: ActivityFeedItem[];
  relationships?: ObjectRelationship[];
}

export function HistoryTimeline({ timeline, relationships }: HistoryTimelineProps) {
  return (
    <div className="space-y-6">
      <ActivityFeed items={timeline} />
      {relationships && relationships.length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Related Objects
          </h4>
          <div className="flex flex-wrap gap-2">
            {relationships.map((rel) => (
              <Link
                key={rel.id}
                href={rel.href}
                className="text-sm rounded-lg border border-border px-3 py-2 hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground mr-1">
                  {rel.direction}:
                </span>
                <span className="font-medium">{rel.label}</span>
                <span className="text-xs bg-muted ml-2 px-1 rounded">{rel.type}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
