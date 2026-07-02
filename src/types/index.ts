export type LifecycleState =
  | "Draft"
  | "In Review"
  | "Released"
  | "Obsolete"
  | "Frozen"
  | "Archived";

export type ProductType =
  | "Mechanical"
  | "Electrical"
  | "Assembly"
  | "Module"
  | "Part"
  | "Software";

export type WorkflowStepId = "draft" | "review" | "approved" | "released";

export type WorkflowStepStatus = "completed" | "current" | "upcoming";

export type Priority = "Critical" | "High" | "Medium" | "Low";

export type ChangeType =
  | "Engineering Change"
  | "Document Change"
  | "Process Change";

export type WorkflowStatus =
  | "Pending"
  | "In Progress"
  | "Approved"
  | "Rejected"
  | "On Hold";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
}

export interface Product {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  revision: string;
  lifecycleState: LifecycleState;
  owner: User;
  createdAt: string;
  updatedAt: string;
  category: string;
  type: string;
  productType: ProductType;
  weight?: string;
  material?: string;
  documents: number;
  bomItems: number;
  status: LifecycleState;
  tags?: string[];
  department?: string;
}

export interface ProductMetadata {
  productName: string;
  category: string;
  description: string;
  ownerId: string;
  department: string;
  tags: string[];
}

export interface CreateProductInput {
  partNumber: string;
  name: string;
  productType: ProductType;
  category: string;
  description: string;
  revision: string;
  lifecycleState: LifecycleState;
  ownerId: string;
  department: string;
  material?: string;
  weight?: string;
  tags?: string[];
}

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  status: WorkflowStepStatus;
  approvers?: User[];
  completedAt?: string;
}

export interface ProductKPIs {
  documentsCount: number;
  partsCount: number;
  openChanges: number;
  pendingApprovals: number;
}

export interface ProductWorkspace {
  documents: Document[];
  bom: BOMItem[];
  revisions: Revision[];
  changes: ChangeRequest[];
  activities: Activity[];
  workflow: WorkflowStep[];
  metadata: ProductMetadata;
  kpis: ProductKPIs;
}

export interface Revision {
  id: string;
  revision: string;
  description: string;
  author: User;
  createdAt: string;
  status: LifecycleState;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  version: string;
  size: string;
  uploadedBy: User;
  uploadedAt: string;
  status: LifecycleState;
}

export interface BOMItem {
  id: string;
  partNumber: string;
  name: string;
  quantity: number;
  unit: string;
  level: number;
  children?: BOMItem[];
}

export interface Activity {
  id: string;
  action: string;
  description: string;
  user: User;
  timestamp: string;
  type: "create" | "update" | "review" | "approve" | "comment" | "upload";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: User;
  dueDate: string;
  priority: Priority;
  status: WorkflowStatus;
  relatedItem?: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  type: ChangeType;
  priority: Priority;
  status: WorkflowStatus;
  requestedBy: User;
  createdAt: string;
  description: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

export interface Organization {
  id: string;
  name: string;
  logo?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
}

export type BomLifecycleState = "Draft" | "In Review" | "Released" | "Obsolete";

export interface BomNode {
  id: string;
  partNumber: string;
  partName: string;
  description: string;
  quantity: number;
  unit: string;
  revision: string;
  lifecycleState: BomLifecycleState;
  cost: number;
  children: BomNode[];
}

export interface AssemblyItem {
  id: string;
  name: string;
  revision: string;
  rootNodeId: string;
  productFamily: string;
  updatedAt: string;
}

export interface BomSnapshot {
  id: string;
  assemblyId: string;
  snapshotName: string;
  date: string;
  user: string;
  revision: string;
  nodes: BomNode[];
}

export interface BomDiffItem {
  id: string;
  partNumber: string;
  partName: string;
  from?: string | number;
  to?: string | number;
}

export interface BomComparisonResult {
  added: BomDiffItem[];
  removed: BomDiffItem[];
  quantityChanged: BomDiffItem[];
  revisionChanged: BomDiffItem[];
}

export interface CostAnalysis {
  assemblyCost: number;
  subassemblyCost: number;
  partCost: number;
}

export type ApprovalAction = "Approve" | "Reject" | "Request Rework";
export type WorkflowTaskStatus =
  | "Pending"
  | "In Progress"
  | "Approved"
  | "Rejected"
  | "Rework"
  | "Completed"
  | "Blocked";
export type ParticipantRole = "Approver" | "Reviewer" | "Observer";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalItem {
  id: string;
  item: string;
  workflowId: string;
  workflowName: string;
  currentStep: string;
  assignedUser: string;
  dueDate: string;
  priority: Priority;
  status: WorkflowTaskStatus;
}

export interface ApprovalTimelineEvent {
  id: string;
  workflowId: string;
  type: "Created" | "Submitted" | "Reviewed" | "Approved" | "Released" | "Rejected" | "Rework";
  user: string;
  timestamp: string;
  note?: string;
}

export interface WorkflowParticipant {
  id: string;
  workflowId: string;
  name: string;
  role: ParticipantRole;
}

export interface WorkflowInstance {
  id: string;
  name: string;
  templateId: string;
  currentStepIndex: number;
  status: WorkflowTaskStatus;
  steps: string[];
  createdAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: Priority;
  status: WorkflowTaskStatus;
  workflowId?: string;
}
