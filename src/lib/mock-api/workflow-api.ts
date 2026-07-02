import {
  approvalQueueSeed,
  approvalTimelineSeed,
  taskSeed,
  workflowInstancesSeed,
  workflowParticipantsSeed,
  workflowTemplatesSeed,
} from "@/constants/workflow-data";
import type {
  ApprovalItem,
  ApprovalTimelineEvent,
  TaskItem,
  WorkflowInstance,
  WorkflowParticipant,
  WorkflowTemplate,
} from "@/types";

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export async function fetchWorkflowTemplates(): Promise<WorkflowTemplate[]> {
  await wait();
  return deepClone(workflowTemplatesSeed);
}

export async function fetchWorkflowInstances(): Promise<WorkflowInstance[]> {
  await wait();
  return deepClone(workflowInstancesSeed);
}

export async function fetchApprovals(): Promise<ApprovalItem[]> {
  await wait();
  return deepClone(approvalQueueSeed);
}

export async function fetchWorkflowTimeline(workflowId: string): Promise<ApprovalTimelineEvent[]> {
  await wait();
  return deepClone(approvalTimelineSeed.filter((e) => e.workflowId === workflowId));
}

export async function fetchParticipants(workflowId: string): Promise<WorkflowParticipant[]> {
  await wait();
  return deepClone(workflowParticipantsSeed.filter((p) => p.workflowId === workflowId));
}

export async function fetchTasks(): Promise<TaskItem[]> {
  await wait();
  return deepClone(taskSeed);
}
