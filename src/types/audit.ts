import type { User } from "@/types";

export type AuditObjectType =
  | "Product"
  | "Document"
  | "BOM"
  | "Revision"
  | "Change"
  | "Workflow"
  | "Task";

export type AuditActionType =
  | "Create"
  | "Update"
  | "Delete"
  | "Approve"
  | "Reject"
  | "Submit"
  | "Release"
  | "Link"
  | "Unlink"
  | "Checkout"
  | "Checkin"
  | "Convert"
  | "Implement"
  | "Close";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: User;
  objectType: AuditObjectType;
  objectId: string;
  objectLabel: string;
  action: AuditActionType;
  before: Record<string, string | number | boolean | null>;
  after: Record<string, string | number | boolean | null>;
}

export interface ActivityFeedItem {
  id: string;
  user: User;
  action: string;
  objectType: AuditObjectType;
  objectId: string;
  objectLabel: string;
  timestamp: string;
  actionType: AuditActionType;
}

export interface FieldDiff {
  field: string;
  before: string;
  after: string;
  changed: boolean;
}

export interface ObjectHistoryRecord {
  objectId: string;
  objectType: AuditObjectType;
  objectLabel: string;
  partNumber?: string;
  currentState: Record<string, string>;
  changes: AuditLogEntry[];
  relationships: ObjectRelationship[];
  timeline: ActivityFeedItem[];
}

export interface ObjectRelationship {
  id: string;
  type: AuditObjectType;
  label: string;
  href: string;
  direction: "parent" | "child" | "related";
}

export interface UserActivitySummary {
  userId: string;
  user: User;
  createdItems: ActivityFeedItem[];
  approvals: ActivityFeedItem[];
  revisions: ActivityFeedItem[];
  changes: ActivityFeedItem[];
  documents: ActivityFeedItem[];
}

export type ComplianceReportType =
  | "Change History"
  | "Approval History"
  | "Revision History";

export interface ComplianceReport {
  id: string;
  type: ComplianceReportType;
  generatedAt: string;
  generatedBy: User;
  dateRange: { from: string; to: string };
  recordCount: number;
  rows: ComplianceReportRow[];
}

export interface ComplianceReportRow {
  id: string;
  timestamp: string;
  user: string;
  object: string;
  action: string;
  details: string;
}

export interface AuditFilters {
  search: string;
  userId: string | "All";
  objectType: AuditObjectType | "All";
  actionType: AuditActionType | "All";
  dateFrom: string;
  dateTo: string;
}

export interface AuditDashboardStats {
  totalActivities: number;
  changesToday: number;
  approvalsToday: number;
  revisionReleases: number;
  documentUpdates: number;
}
