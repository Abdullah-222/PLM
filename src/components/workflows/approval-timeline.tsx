"use client";

import type { ApprovalTimelineEvent } from "@/types";

export function ApprovalTimeline({ events }: { events: ApprovalTimelineEvent[] }) {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h3 className="text-sm font-semibold">Approval Timeline</h3>
      {events.map((event) => (
        <div key={event.id} className="border-l-2 border-border pl-3">
          <p className="text-sm font-medium">{event.type}</p>
          <p className="text-xs text-muted-foreground">
            {event.user} · {new Date(event.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
