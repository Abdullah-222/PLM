"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { ApprovalQueue, ApprovalTimeline, ParticipantManager, WorkflowStepper } from "@/components/workflows";
import { PageContainer } from "@/components/shared/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkflowStore } from "@/store/workflow-store";
import { Clock3, Info, Users } from "lucide-react";

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    instances,
    approvals,
    timeline,
    participants,
    applyApprovalAction,
    addParticipant,
    removeParticipant,
  } = useWorkflowStore();
  const workflow = instances.find((item) => item.id === id);
  if (!workflow) notFound();

  const relatedApprovals = approvals.filter((item) => item.workflowId === id);
  const relatedEvents = timeline.filter((event) => event.workflowId === id);
  const relatedParticipants = participants.filter((participant) => participant.workflowId === id);

  return (
    <PageContainer>
      <div>
        <h1 className="text-2xl font-bold">{workflow.name}</h1>
        <p className="text-sm text-muted-foreground">Workflow detail page</p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1"><Info className="h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="approvals" className="gap-1"><Clock3 className="h-4 w-4" />Approvals</TabsTrigger>
          <TabsTrigger value="participants" className="gap-1"><Users className="h-4 w-4" />Participants</TabsTrigger>
          <TabsTrigger value="history" className="gap-1"><Clock3 className="h-4 w-4" />History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <WorkflowStepper steps={workflow.steps} currentStepIndex={workflow.currentStepIndex} />
        </TabsContent>
        <TabsContent value="approvals">
          <ApprovalQueue approvals={relatedApprovals} onAction={applyApprovalAction} />
        </TabsContent>
        <TabsContent value="participants">
          <ParticipantManager
            participants={relatedParticipants}
            onAdd={(name, role) => addParticipant(id, name, role)}
            onRemove={removeParticipant}
          />
        </TabsContent>
        <TabsContent value="history">
          <ApprovalTimeline events={relatedEvents} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
