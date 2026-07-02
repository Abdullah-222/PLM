"use client";

import { use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  AffectedObjectsPanel,
  ApprovalChain,
  ChangeRelationshipGraph,
  ChangeTaskBoard,
  ChangeTimeline,
  EcnPanel,
  ImpactAnalysisCard,
} from "@/components/changes";
import { PageContainer } from "@/components/shared/page-container";
import { AppCard, AppCardContent } from "@/components/shared/app-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/product-utils";
import { useChangesStore } from "@/store/changes-store";
import { useAuditStore } from "@/store/audit-store";
import { currentUser } from "@/constants/users";
import type { ChangeStatus } from "@/types/changes";
import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  ClipboardList,
  GitBranch,
  History,
  Layers,
  ListChecks,
  Send,
  Shield,
  Target,
} from "lucide-react";

const ECR_TRANSITIONS: Record<string, ChangeStatus[]> = {
  Draft: ["Submitted"],
  Submitted: ["Review", "Draft"],
  Review: ["Approved", "Rejected"],
  Approved: ["Converted"],
  Rejected: ["Draft"],
};

const ECO_TRANSITIONS: Record<string, ChangeStatus[]> = {
  Open: ["In Progress"],
  "In Progress": ["Implemented", "Open"],
  Implemented: ["Closed"],
  Closed: [],
};

export default function ChangeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const change = useChangesStore((s) => s.changes.find((c) => c.id === id));
  const ecnNotices = useChangesStore((s) => s.ecnNotices);
  const {
    linkObject,
    unlinkObject,
    applyApprovalAction,
    createTask,
    assignTask,
    completeTask,
    transitionStatus,
    convertEcrToEco,
    generateEcn,
    updateChange,
  } = useChangesStore();
  const appendLog = useAuditStore((s) => s.appendLog);

  if (!change) notFound();

  const transitions =
    change.type === "ECR"
      ? ECR_TRANSITIONS[change.status] ?? []
      : change.type === "ECO"
        ? ECO_TRANSITIONS[change.status] ?? []
        : [];

  const handleTransition = (status: ChangeStatus) => {
    transitionStatus(id, status);
    appendLog({
      user: currentUser,
      objectType: "Change",
      objectId: id,
      objectLabel: change.changeNumber,
      action: status === "Submitted" ? "Submit" : status === "Approved" ? "Approve" : "Update",
      before: { status: change.status },
      after: { status },
    });
  };

  const handleConvert = () => {
    const ecoId = convertEcrToEco(id);
    if (ecoId) {
      appendLog({
        user: currentUser,
        objectType: "Change",
        objectId: id,
        objectLabel: change.changeNumber,
        action: "Convert",
        before: { status: change.status },
        after: { status: "Converted", ecoId },
      });
      router.push(`/changes/${ecoId}`);
    }
  };

  return (
    <PageContainer className="space-y-0">
      <div className="sticky top-14 z-20 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-start gap-4">
          <Link
            href="/changes"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">{change.title}</h1>
              <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded font-bold">
                {change.changeNumber}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                {change.type}
              </span>
              <StatusBadge status={change.status} variant="workflow" />
              <StatusBadge status={change.priority} variant="priority" />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{change.owner.name}</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Created {formatDate(change.createdAt, { dateStyle: "long" })}</span>
              {change.dueDate && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>Due {formatDate(change.dueDate, { dateStyle: "long" })}</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {transitions.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant="outline"
                  onClick={() => handleTransition(status)}
                >
                  → {status}
                </Button>
              ))}
              {change.type === "ECR" &&
                change.status === "Approved" &&
                !change.convertedEcoId && (
                  <Button size="sm" className="gap-1.5" onClick={handleConvert}>
                    <ArrowRightLeft className="h-4 w-4" />
                    Convert to ECO
                  </Button>
                )}
              {change.convertedEcoId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/changes/${change.convertedEcoId}`)}
                >
                  View ECO
                </Button>
              )}
              {change.parentEcrId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/changes/${change.parentEcrId}`)}
                >
                  View Parent ECR
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => router.push(`/changes/create?type=${change.type}`)}
              >
                <Send className="h-4 w-4" />
                New via Wizard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] mt-6">
        <div>
          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="overview" className="gap-1">
                <ClipboardList className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="objects" className="gap-1">
                <Layers className="h-4 w-4" />
                Affected Objects
              </TabsTrigger>
              <TabsTrigger value="impact" className="gap-1">
                <Target className="h-4 w-4" />
                Impact Analysis
              </TabsTrigger>
              <TabsTrigger value="approvals" className="gap-1">
                <Shield className="h-4 w-4" />
                Approvals
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-1">
                <ListChecks className="h-4 w-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              {(change.type === "ECO" || change.type === "ECR") && (
                <TabsTrigger value="ecn" className="gap-1">
                  <GitBranch className="h-4 w-4" />
                  ECN
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <AppCard>
                <AppCardContent className="pt-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Change Number</p>
                      <p className="font-mono font-medium">{change.changeNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{change.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <StatusBadge status={change.status} variant="workflow" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Priority</p>
                      <StatusBadge status={change.priority} variant="priority" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Owner</p>
                      <p className="font-medium">{change.owner.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created Date</p>
                      <p>{formatDate(change.createdAt, { dateStyle: "long" })}</p>
                    </div>
                    {change.dueDate && (
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p>{formatDate(change.dueDate, { dateStyle: "long" })}</p>
                      </div>
                    )}
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Description</p>
                      <p className="text-sm text-muted-foreground">
                        {change.description || "No description"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Reason</p>
                      <p className="text-sm text-muted-foreground">
                        {change.reason || "No reason provided"}
                      </p>
                    </div>
                  </div>
                </AppCardContent>
              </AppCard>
            </TabsContent>

            <TabsContent value="objects" className="mt-4">
              <AffectedObjectsPanel
                changeId={id}
                objects={change.affectedObjects}
                onLink={(type, objectId, label, meta) => {
                  linkObject(id, type, objectId, label, meta);
                  appendLog({
                    user: currentUser,
                    objectType: "Change",
                    objectId: id,
                    objectLabel: change.changeNumber,
                    action: "Link",
                    before: {},
                    after: { linked: label, type },
                  });
                }}
                onUnlink={(affectedObjectId) => {
                  const obj = change.affectedObjects.find((o) => o.id === affectedObjectId);
                  unlinkObject(id, affectedObjectId);
                  if (obj) {
                    appendLog({
                      user: currentUser,
                      objectType: "Change",
                      objectId: id,
                      objectLabel: change.changeNumber,
                      action: "Unlink",
                      before: { linked: obj.label },
                      after: {},
                    });
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="impact" className="mt-4">
              <ImpactAnalysisCard change={change} />
            </TabsContent>

            <TabsContent value="approvals" className="mt-4">
              <ApprovalChain
                changeId={id}
                approvals={change.approvals}
                onAction={(approvalId, action, comment) => {
                  applyApprovalAction(id, approvalId, action, comment);
                  appendLog({
                    user: currentUser,
                    objectType: "Change",
                    objectId: id,
                    objectLabel: change.changeNumber,
                    action: action === "Approve" ? "Approve" : action === "Reject" ? "Reject" : "Update",
                    before: { status: change.status },
                    after: { action, comment: comment ?? "" },
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <ChangeTaskBoard
                changeId={id}
                tasks={change.tasks}
                onCreateTask={(title, description, assigneeId, dueDate, priority) =>
                  createTask(id, title, description, assigneeId, dueDate, priority)
                }
                onAssignTask={(taskId, assigneeId) => assignTask(id, taskId, assigneeId)}
                onCompleteTask={(taskId) => {
                  completeTask(id, taskId);
                  appendLog({
                    user: currentUser,
                    objectType: "Change",
                    objectId: id,
                    objectLabel: change.changeNumber,
                    action: "Implement",
                    before: {},
                    after: { taskCompleted: taskId },
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <AppCard>
                <AppCardContent className="pt-4">
                  <ChangeTimeline events={change.timeline} />
                </AppCardContent>
              </AppCard>
            </TabsContent>

            <TabsContent value="ecn" className="mt-4">
              <EcnPanel
                change={change}
                ecnNotices={ecnNotices}
                onGenerateEcn={(ecoId) => {
                  generateEcn(ecoId);
                  appendLog({
                    user: currentUser,
                    objectType: "Change",
                    objectId: ecoId,
                    objectLabel: change.changeNumber,
                    action: "Create",
                    before: {},
                    after: { ecnGenerated: true },
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-4">
          <ChangeRelationshipGraph change={change} />
          <AppCard>
            <AppCardContent className="pt-4 space-y-2 text-sm">
              <p className="font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                Quick Actions
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() =>
                  updateChange(id, {
                    description: change.description,
                  })
                }
              >
                Refresh Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => router.push(`/audit/${id}`)}
              >
                View Audit Trail
              </Button>
            </AppCardContent>
          </AppCard>
        </aside>
      </div>
    </PageContainer>
  );
}
