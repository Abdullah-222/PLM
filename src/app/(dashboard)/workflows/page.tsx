"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApprovalQueue,
  CreateWorkflowTemplateDialog,
  EditWorkflowTemplateDialog,
  WorkflowBuilder,
  WorkflowStepper,
} from "@/components/workflows";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/store/workflow-store";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock3, Loader, Plus, XCircle } from "lucide-react";

export default function WorkflowsPage() {
  const router = useRouter();
  const templates = useWorkflowStore((s) => s.templates);
  const selectedTemplateId = useWorkflowStore((s) => s.selectedTemplateId);
  const instances = useWorkflowStore((s) => s.instances);
  const approvals = useWorkflowStore((s) => s.approvals);
  const setSelectedTemplate = useWorkflowStore((s) => s.setSelectedTemplate);
  const updateTemplate = useWorkflowStore((s) => s.updateTemplate);
  const deleteTemplate = useWorkflowStore((s) => s.deleteTemplate);
  const duplicateTemplate = useWorkflowStore((s) => s.duplicateTemplate);
  const addStep = useWorkflowStore((s) => s.addStep);
  const renameStep = useWorkflowStore((s) => s.renameStep);
  const deleteStep = useWorkflowStore((s) => s.deleteStep);
  const reorderSteps = useWorkflowStore((s) => s.reorderSteps);
  const applyApprovalAction = useWorkflowStore((s) => s.applyApprovalAction);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0],
    [templates, selectedTemplateId]
  );
  const editingTemplate = useMemo(
    () => templates.find((template) => template.id === editTemplateId) ?? null,
    [templates, editTemplateId]
  );
  const selectedInstance = instances[0];

  const stats = useMemo(
    () => ({
      pending: approvals.filter((item) => item.status === "Pending").length,
      completed: approvals.filter((item) => item.status === "Approved").length,
      rejected: approvals.filter((item) => item.status === "Rejected").length,
      inProgress: approvals.filter((item) => item.status === "In Progress").length,
    }),
    [approvals]
  );

  return (
    <PageContainer>
      <SectionHeader
        title="Workflow & Approval Center"
        description="Generic PLM workflow engine"
        action={
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Approvals" value={stats.pending} icon={Clock3} />
        <StatCard title="Completed Approvals" value={stats.completed} icon={CheckCircle2} />
        <StatCard title="Rejected" value={stats.rejected} icon={XCircle} />
        <StatCard title="In Progress" value={stats.inProgress} icon={Loader} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl border border-border p-3 space-y-2">
          <h3 className="text-sm font-semibold">Workflow Template Management</h3>
          {templates.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">No workflow templates yet.</p>
              <Button size="sm" className="mt-3 gap-1.5" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className={cn(
                  "rounded-lg border p-2 transition-colors cursor-pointer",
                  selectedTemplate?.id === template.id && "border-primary bg-primary/5"
                )}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{template.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{template.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={(event) => event.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateTemplate(template.id)}
                    >
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditTemplateId(template.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedTemplate ? (
          <WorkflowBuilder
            key={selectedTemplate.id}
            template={selectedTemplate}
            onAddStep={(step) => addStep(selectedTemplate.id, step)}
            onRenameStep={(index, value) => renameStep(selectedTemplate.id, index, value)}
            onDeleteStep={(index) => deleteStep(selectedTemplate.id, index)}
            onReorderStep={(source, target) => reorderSteps(selectedTemplate.id, source, target)}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Select or create a template to design its workflow steps.
            </p>
          </div>
        )}
      </div>

      {selectedInstance && (
        <WorkflowStepper steps={selectedInstance.steps} currentStepIndex={selectedInstance.currentStepIndex} />
      )}

      <ApprovalQueue approvals={approvals} onAction={applyApprovalAction} />

      <div className="flex justify-end">
        {selectedInstance && (
          <Button variant="outline" onClick={() => router.push(`/workflows/${selectedInstance.id}`)}>
            Open Workflow Detail
          </Button>
        )}
      </div>

      <CreateWorkflowTemplateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditWorkflowTemplateDialog
        template={editingTemplate}
        open={Boolean(editTemplateId)}
        onOpenChange={(open) => {
          if (!open) setEditTemplateId(null);
        }}
      />
    </PageContainer>
  );
}
