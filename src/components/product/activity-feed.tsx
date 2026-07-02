"use client";

import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import { SectionHeader } from "@/components/shared/section-header";
import type { Activity } from "@/types";

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  description?: string;
}

export function ActivityFeed({
  activities,
  title = "Activity Log",
  description = "User actions, releases, uploads, and workflow events",
}: ActivityFeedProps) {
  return (
    <AppCard>
      <AppCardHeader>
        <SectionHeader title={title} description={description} />
      </AppCardHeader>
      <AppCardContent>
        <ActivityTimeline activities={activities} />
      </AppCardContent>
    </AppCard>
  );
}
