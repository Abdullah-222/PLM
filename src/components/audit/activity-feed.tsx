"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/product-utils";
import type { ActivityFeedItem } from "@/types/audit";
import { Activity } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const objectHref = (item: ActivityFeedItem) => {
  switch (item.objectType) {
    case "Product":
      return `/products/${item.objectId}`;
    case "Document":
      return `/audit/${item.objectId}`;
    case "BOM":
      return `/bom/${item.objectId}`;
    case "Revision":
      return `/revisions/${item.objectId}`;
    case "Change":
      return `/changes/${item.objectId}`;
    default:
      return `/audit/${item.objectId}`;
  }
};

interface ActivityFeedProps {
  items: ActivityFeedItem[];
  loading?: boolean;
}

export function ActivityFeed({ items, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
        Loading activity feed...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity"
        description="No activities match your current filters."
      />
    );
  }

  return (
    <div className="rounded-xl border border-border divide-y divide-border">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <Avatar className="h-8 w-8 shrink-0 border border-border">
            <AvatarFallback className="text-xs bg-muted">
              {getInitials(item.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                href={`/audit/users/${item.user.id}`}
                className="text-sm font-medium hover:underline"
              >
                {item.user.name}
              </Link>
              <span className="text-sm text-muted-foreground">{item.action}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <Link
                href={objectHref(item)}
                className="text-xs text-primary hover:underline"
              >
                {item.objectLabel}
              </Link>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {item.objectType}
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDate(item.timestamp, { timeStyle: "short", dateStyle: "short" })}
          </span>
        </div>
      ))}
    </div>
  );
}
