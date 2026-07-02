import type { ApprovalAction, Priority, User, WorkflowTaskStatus } from "@/types";

export type EngineeringChangeType = "ECR" | "ECO" | "ECN";

export type ECRStatus =
  | "Draft"
  | "Submitted"
  | "Review"
  | "Approved"
  | "Rejected"
  | "Converted";

export type ECOStatus = "Open" | "In Progress" | "Implemented" | "Closed";

export type ECNStatus = "Draft" | "Issued" | "Acknowledged";

export type ChangeStatus = ECRStatus | ECOStatus | ECNStatus;

export type AffectedObjectType = "Product" | "Document" | "BOM" | "Revision";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface AffectedObject {
  id: string;
  type: AffectedObjectType;
  objectId: string;
  label: string;
  partNumber?: string;
  revision?: string;
  linkedAt: string;
}

export interface ImpactAssessment {
  costImpact: number;
  scheduleImpactDays: number;
  riskLevel: RiskLevel;
  notes: string;
}

export interface ChangeApproval {
  id: string;
  role: string;
  approver: User;
  status: "Pending" | "Approved" | "Rejected" | "Rework";
  actedAt?: string;
  comment?: string;
}

export interface ChangeTask {
  id: string;
  changeId: string;
  title: string;
  description: string;
  assignee: User;
  dueDate: string;
  priority: Priority;
  status: WorkflowTaskStatus;
  createdAt: string;
}

export type ChangeTimelineEventType =
  | "Created"
  | "Submitted"
  | "Reviewed"
  | "Approved"
  | "Rejected"
  | "Implemented"
  | "Closed"
  | "Converted"
  | "ECN Issued";

export interface ChangeTimelineEvent {
  id: string;
  changeId: string;
  type: ChangeTimelineEventType;
  user: User;
  timestamp: string;
  note?: string;
}

export interface EngineeringChange {
  id: string;
  changeNumber: string;
  type: EngineeringChangeType;
  title: string;
  description: string;
  reason: string;
  priority: Priority;
  owner: User;
  status: ChangeStatus;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  affectedObjects: AffectedObject[];
  impact: ImpactAssessment;
  approvals: ChangeApproval[];
  tasks: ChangeTask[];
  timeline: ChangeTimelineEvent[];
  parentEcrId?: string;
  convertedEcoId?: string;
}

export interface ECNNotice {
  id: string;
  ecnNumber: string;
  ecoId: string;
  ecoNumber: string;
  title: string;
  recipients: User[];
  issuedAt: string;
  affectedItems: AffectedObject[];
  status: ECNStatus;
  message: string;
}

export interface ChangeFilters {
  search: string;
  status: ChangeStatus | "All";
  priority: Priority | "All";
  type: EngineeringChangeType | "All";
  ownerId: string | "All";
}

export type ChangeSortField =
  | "changeNumber"
  | "type"
  | "title"
  | "priority"
  | "status"
  | "createdAt";

export interface ChangeWizardInput {
  type: EngineeringChangeType;
  title: string;
  description: string;
  reason: string;
  priority: Priority;
  ownerId: string;
  dueDate?: string;
  affectedObjects: Omit<AffectedObject, "id" | "linkedAt">[];
  impact: ImpactAssessment;
}

export interface ChangeApprovalAction {
  approvalId: string;
  action: ApprovalAction;
  comment?: string;
}
