"use client";

import Link from "next/link";
import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import { ActivityFeed } from "./activity-feed";
import type { UserActivitySummary } from "@/types/audit";
import { FileText, GitBranch, ClipboardList, CheckCircle2, Plus } from "lucide-react";

interface UserActivityPanelProps {
  activity: UserActivitySummary;
}

export function UserActivityPanel({ activity }: UserActivityPanelProps) {
  const sections = [
    {
      title: "Created Items",
      icon: Plus,
      items: activity.createdItems,
    },
    {
      title: "Approvals",
      icon: CheckCircle2,
      items: activity.approvals,
    },
    {
      title: "Revisions",
      icon: GitBranch,
      items: activity.revisions,
    },
    {
      title: "Changes",
      icon: ClipboardList,
      items: activity.changes,
    },
    {
      title: "Documents",
      icon: FileText,
      items: activity.documents,
    },
  ];

  return (
    <div className="space-y-6">
      <AppCard>
        <AppCardHeader>
          <div>
            <h3 className="font-semibold">{activity.user.name}</h3>
            <p className="text-sm text-muted-foreground">
              {activity.user.role} — {activity.user.department}
            </p>
          </div>
        </AppCardHeader>
        <AppCardContent>
          <p className="text-sm text-muted-foreground">{activity.user.email}</p>
        </AppCardContent>
      </AppCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {section.title}
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full font-normal">
                  {section.items.length}
                </span>
              </h3>
              {section.items.length === 0 ? (
                <p className="text-sm text-muted-foreground pl-6">No activity</p>
              ) : (
                <ActivityFeed items={section.items.slice(0, 5)} />
              )}
              {section.items.length > 5 && (
                <Link
                  href="/audit"
                  className="text-xs text-primary hover:underline pl-6"
                >
                  View all in audit log
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
