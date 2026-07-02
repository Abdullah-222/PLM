"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FieldComparisonView,
  HistoryTimeline,
} from "@/components/audit";
import { PageContainer } from "@/components/shared/page-container";
import { AppCard, AppCardContent } from "@/components/shared/app-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getObjectHistory } from "@/constants/audit-data";
import { useAuditStore } from "@/store/audit-store";
import { useChangesStore } from "@/store/changes-store";
import { ArrowLeft, GitBranch, History, Info, Network } from "lucide-react";

export default function ObjectHistoryPage({
  params,
}: {
  params: Promise<{ objectId: string }>;
}) {
  const { objectId } = use(params);
  const auditLogs = useAuditStore((s) => s.auditLogs);
  const change = useChangesStore((s) => s.changes.find((c) => c.id === objectId));

  const history = useMemo(() => {
    const fromConstants = getObjectHistory(objectId);
    if (fromConstants) return fromConstants;

    const logs = auditLogs.filter((l) => l.objectId === objectId);
    if (logs.length === 0 && !change) return undefined;

    if (change) {
      return {
        objectId,
        objectType: "Change" as const,
        objectLabel: change.changeNumber,
        currentState: {
          status: change.status,
          type: change.type,
          title: change.title,
        },
        changes: logs,
        relationships: change.affectedObjects.map((obj, i) => ({
          id: `rel-${i}`,
          type: obj.type,
          label: obj.label,
          href:
            obj.type === "Product"
              ? `/products/${obj.objectId}`
              : obj.type === "BOM"
                ? `/bom/${obj.objectId}`
                : obj.type === "Revision"
                  ? `/revisions/${obj.objectId}`
                  : "/documents",
          direction: "related" as const,
        })),
        timeline: logs.map((l) => ({
          id: `tl-${l.id}`,
          user: l.user,
          action: `${l.action} ${l.objectLabel}`,
          objectType: l.objectType,
          objectId: l.objectId,
          objectLabel: l.objectLabel,
          timestamp: l.timestamp,
          actionType: l.action,
        })),
      };
    }

    const first = logs[0];
    return {
      objectId,
      objectType: first.objectType,
      objectLabel: first.objectLabel,
      currentState: Object.fromEntries(
        Object.entries(first.after).map(([k, v]) => [k, String(v)])
      ),
      changes: logs,
      relationships: [],
      timeline: logs.map((l) => ({
        id: `tl-${l.id}`,
        user: l.user,
        action: `${l.action} ${l.objectLabel}`,
        objectType: l.objectType,
        objectId: l.objectId,
        objectLabel: l.objectLabel,
        timestamp: l.timestamp,
        actionType: l.action,
      })),
    };
  }, [objectId, auditLogs, change]);

  if (!history) notFound();

  const latestChange = history.changes[0];

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
          <h1 className="text-xl font-bold">{history.objectLabel}</h1>
          <p className="text-sm text-muted-foreground">
            {history.objectType} · {history.changes.length} audit entries
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1">
            <Info className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="changes" className="gap-1">
            <History className="h-4 w-4" />
            Changes
          </TabsTrigger>
          <TabsTrigger value="relationships" className="gap-1">
            <Network className="h-4 w-4" />
            Relationships
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1">
            <GitBranch className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <AppCard>
            <AppCardContent className="pt-4">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                {Object.entries(history.currentState).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-muted-foreground capitalize">{key}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </AppCardContent>
          </AppCard>
        </TabsContent>

        <TabsContent value="changes" className="mt-4 space-y-4">
          {history.changes.map((log) => (
            <AppCard key={log.id}>
              <AppCardContent className="pt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-muted-foreground">by {log.user.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <FieldComparisonView before={log.before} after={log.after} />
              </AppCardContent>
            </AppCard>
          ))}
          {history.changes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No change records for this object
            </p>
          )}
        </TabsContent>

        <TabsContent value="relationships" className="mt-4">
          {history.relationships.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No relationships recorded
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {history.relationships.map((rel) => (
                <Link
                  key={rel.id}
                  href={rel.href}
                  className="rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors"
                >
                  <p className="text-xs text-muted-foreground mb-1">{rel.type}</p>
                  <p className="font-medium">{rel.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rel.direction} relationship
                  </p>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <HistoryTimeline
            timeline={history.timeline}
            relationships={history.relationships}
          />
          {latestChange && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">Latest Change Comparison</h3>
              <FieldComparisonView
                before={latestChange.before}
                after={latestChange.after}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
