import type {
  ApprovalItem,
  ApprovalTimelineEvent,
  TaskItem,
  WorkflowInstance,
  WorkflowParticipant,
  WorkflowTemplate,
} from "@/types";

const now = new Date().toISOString();

export const workflowTemplatesSeed: WorkflowTemplate[] = [
  {
    id: "tpl-design-approval",
    name: "Design Approval",
    description: "Approvals for CAD and design updates",
    steps: ["Draft", "Review", "Approved", "Released"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "tpl-document-approval",
    name: "Document Approval",
    description: "Routing for controlled documents",
    steps: ["Draft", "Review", "Approved", "Released"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "tpl-revision-approval",
    name: "Revision Approval",
    description: "Revision release approval process",
    steps: ["Draft", "Review", "Approved", "Released"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "tpl-release-workflow",
    name: "Release Workflow",
    description: "Final release readiness checks",
    steps: ["Draft", "Review", "Approved", "Released"],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "tpl-eng-change",
    name: "Engineering Change",
    description: "ECO evaluation and release",
    steps: ["Draft", "Review", "Approved", "Released"],
    createdAt: now,
    updatedAt: now,
  },
];

export const workflowInstancesSeed: WorkflowInstance[] = [
  {
    id: "wf-revision-release",
    name: "Revision Release",
    templateId: "tpl-revision-approval",
    currentStepIndex: 1,
    status: "In Progress",
    steps: ["Draft", "Review", "Approved", "Released"],
    createdAt: now,
  },
  {
    id: "wf-document-approval",
    name: "Document Approval",
    templateId: "tpl-document-approval",
    currentStepIndex: 2,
    status: "Pending",
    steps: ["Draft", "Review", "Approved", "Released"],
    createdAt: now,
  },
  {
    id: "wf-eng-change",
    name: "Engineering Change Approval",
    templateId: "tpl-eng-change",
    currentStepIndex: 1,
    status: "In Progress",
    steps: ["Draft", "Review", "Approved", "Released"],
    createdAt: now,
  },
];

export const approvalQueueSeed: ApprovalItem[] = [
  {
    id: "appr-1",
    item: "Engine Assembly Rev B",
    workflowId: "wf-revision-release",
    workflowName: "Revision Release",
    currentStep: "Review",
    assignedUser: "Fatima Rahman",
    dueDate: now,
    priority: "High",
    status: "Pending",
  },
  {
    id: "appr-2",
    item: "Battery Test Plan",
    workflowId: "wf-document-approval",
    workflowName: "Document Approval",
    currentStep: "Approved",
    assignedUser: "Omar Siddiqui",
    dueDate: now,
    priority: "Medium",
    status: "In Progress",
  },
];

export const approvalTimelineSeed: ApprovalTimelineEvent[] = [
  {
    id: "evt-1",
    workflowId: "wf-revision-release",
    type: "Created",
    user: "System",
    timestamp: now,
  },
  {
    id: "evt-2",
    workflowId: "wf-revision-release",
    type: "Submitted",
    user: "A. Khan",
    timestamp: now,
  },
];

export const workflowParticipantsSeed: WorkflowParticipant[] = [
  { id: "p-1", workflowId: "wf-revision-release", name: "Fatima Rahman", role: "Approver" },
  { id: "p-2", workflowId: "wf-revision-release", name: "Omar Siddiqui", role: "Reviewer" },
  { id: "p-3", workflowId: "wf-revision-release", name: "Sara Ahmed", role: "Observer" },
];

export const taskSeed: TaskItem[] = [
  {
    id: "task-1",
    title: "Review Engine Assembly revision package",
    assignee: "Fatima Rahman",
    dueDate: now,
    priority: "High",
    status: "Pending",
    workflowId: "wf-revision-release",
  },
  {
    id: "task-2",
    title: "Prepare release notes for Battery Module",
    assignee: "A. Khan",
    dueDate: now,
    priority: "Medium",
    status: "In Progress",
    workflowId: "wf-eng-change",
  },
];
