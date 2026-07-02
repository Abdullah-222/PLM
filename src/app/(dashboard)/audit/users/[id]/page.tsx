"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserActivityPanel } from "@/components/audit";
import { PageContainer } from "@/components/shared/page-container";
import { getUserActivity } from "@/constants/audit-data";
import { useAuditStore } from "@/store/audit-store";
import { users } from "@/constants/users";
import { ArrowLeft } from "lucide-react";

export default function UserActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const activityFeed = useAuditStore((s) => s.activityFeed);

  const baseActivity = getUserActivity(id);
  const user = users.find((u) => u.id === id);

  if (!user) notFound();

  const userItems = activityFeed.filter((a) => a.user.id === id);

  const activity = baseActivity ?? {
    userId: id,
    user,
    createdItems: userItems.filter((a) => a.actionType === "Create"),
    approvals: userItems.filter((a) => a.actionType === "Approve"),
    revisions: userItems.filter((a) => a.objectType === "Revision"),
    changes: userItems.filter((a) => a.objectType === "Change"),
    documents: userItems.filter((a) => a.objectType === "Document"),
  };

  return (
    <PageContainer>
      <div className="flex items-start gap-4 mb-6">
        <Link
          href="/audit"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">User Activity</h1>
          <p className="text-sm text-muted-foreground">
            Activity history for {user.name}
          </p>
        </div>
      </div>
      <UserActivityPanel activity={activity} />
    </PageContainer>
  );
}
