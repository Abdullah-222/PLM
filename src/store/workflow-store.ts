import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  approvalQueueSeed,
  approvalTimelineSeed,
  taskSeed,
  workflowInstancesSeed,
  workflowParticipantsSeed,
  workflowTemplatesSeed,
} from "@/constants/workflow-data";
import type {
  ApprovalAction,
  ApprovalItem,
  ApprovalTimelineEvent,
  ParticipantRole,
  TaskItem,
  WorkflowInstance,
  WorkflowParticipant,
  WorkflowTaskStatus,
  WorkflowTemplate,
} from "@/types";

export interface CreateWorkflowTemplateInput {
  name: string;
  description?: string;
}

interface WorkflowState {
  templates: WorkflowTemplate[];
  selectedTemplateId: string;
  instances: WorkflowInstance[];
  approvals: ApprovalItem[];
  timeline: ApprovalTimelineEvent[];
  participants: WorkflowParticipant[];
  tasks: TaskItem[];
  setSelectedTemplate: (id: string) => void;
  createTemplate: (input: CreateWorkflowTemplateInput) => string;
  updateTemplate: (id: string, patch: Partial<WorkflowTemplate>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  addStep: (templateId: string, step: string) => void;
  renameStep: (templateId: string, index: number, value: string) => void;
  deleteStep: (templateId: string, index: number) => void;
  reorderSteps: (templateId: string, source: number, target: number) => void;
  applyApprovalAction: (approvalId: string, action: ApprovalAction) => void;
  addParticipant: (workflowId: string, name: string, role: ParticipantRole) => void;
  removeParticipant: (participantId: string) => void;
  updateTaskStatus: (taskId: string, status: WorkflowTaskStatus) => void;
  reassignTask: (taskId: string, assignee: string) => void;
}

const id = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const appendTimelineEvent = (
  timeline: ApprovalTimelineEvent[],
  workflowId: string,
  type: ApprovalTimelineEvent["type"],
  user: string
) => [{ id: id("evt"), workflowId, type, user, timestamp: new Date().toISOString() }, ...timeline];

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      templates: workflowTemplatesSeed,
      selectedTemplateId: workflowTemplatesSeed[0]?.id ?? "",
      instances: workflowInstancesSeed,
      approvals: approvalQueueSeed,
      timeline: approvalTimelineSeed,
      participants: workflowParticipantsSeed,
      tasks: taskSeed,
      setSelectedTemplate: (idValue) => set({ selectedTemplateId: idValue }),
      createTemplate: (input) => {
        const templateId = id("tpl");
        const template: WorkflowTemplate = {
          id: templateId,
          name: input.name.trim(),
          description: input.description?.trim() || "Custom workflow template",
          steps: ["Draft", "Review", "Approved", "Released"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          templates: [template, ...state.templates],
          selectedTemplateId: templateId,
        }));
        return templateId;
      },
      updateTemplate: (idValue, patch) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === idValue
              ? { ...template, ...patch, updatedAt: new Date().toISOString() }
              : template
          ),
        })),
      deleteTemplate: (idValue) =>
        set((state) => {
          const templates = state.templates.filter((template) => template.id !== idValue);
          const selectedTemplateId =
            state.selectedTemplateId === idValue
              ? templates[0]?.id ?? ""
              : state.selectedTemplateId;
          return { templates, selectedTemplateId };
        }),
      duplicateTemplate: (idValue) =>
        set((state) => {
          const source = state.templates.find((template) => template.id === idValue);
          if (!source) return state;
          const duplicateId = id("tpl");
          return {
            templates: [
              {
                ...source,
                id: duplicateId,
                name: `${source.name} Copy`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              ...state.templates,
            ],
            selectedTemplateId: duplicateId,
          };
        }),
      addStep: (templateId, step) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId
              ? { ...template, steps: [...template.steps, step], updatedAt: new Date().toISOString() }
              : template
          ),
        })),
      renameStep: (templateId, index, value) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId
              ? {
                  ...template,
                  steps: template.steps.map((step, stepIndex) => (stepIndex === index ? value : step)),
                  updatedAt: new Date().toISOString(),
                }
              : template
          ),
        })),
      deleteStep: (templateId, index) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === templateId
              ? {
                  ...template,
                  steps: template.steps.filter((_, stepIndex) => stepIndex !== index),
                  updatedAt: new Date().toISOString(),
                }
              : template
          ),
        })),
      reorderSteps: (templateId, source, target) =>
        set((state) => ({
          templates: state.templates.map((template) => {
            if (template.id !== templateId) return template;
            const steps = [...template.steps];
            const [moved] = steps.splice(source, 1);
            steps.splice(target, 0, moved);
            return { ...template, steps, updatedAt: new Date().toISOString() };
          }),
        })),
      applyApprovalAction: (approvalId, action) =>
        set((state) => {
          const approval = state.approvals.find((item) => item.id === approvalId);
          if (!approval) return state;
          const mappedStatus: Record<ApprovalAction, WorkflowTaskStatus> = {
            Approve: "Approved",
            Reject: "Rejected",
            "Request Rework": "Rework",
          };
          return {
            approvals: state.approvals.map((item) =>
              item.id === approvalId ? { ...item, status: mappedStatus[action] } : item
            ),
            timeline: appendTimelineEvent(
              state.timeline,
              approval.workflowId,
              action === "Approve" ? "Approved" : action === "Reject" ? "Rejected" : "Rework",
              "Current User"
            ),
          };
        }),
      addParticipant: (workflowId, name, role) =>
        set((state) => ({
          participants: [...state.participants, { id: id("participant"), workflowId, name, role }],
        })),
      removeParticipant: (participantId) =>
        set((state) => ({
          participants: state.participants.filter((participant) => participant.id !== participantId),
        })),
      updateTaskStatus: (taskId, status) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
        })),
      reassignTask: (taskId, assignee) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, assignee } : task)),
        })),
    }),
    { name: "plm-workflow-store" }
  )
);
