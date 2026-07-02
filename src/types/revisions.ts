import type { LifecycleState, User } from "@/types";

export type RevisionEventType =
  | "created"
  | "approval"
  | "document_change"
  | "bom_change"
  | "release"
  | "obsolete";

export interface RevisionRecord {
  id: string;
  objectId: string;
  objectName: string;
  objectPartNumber: string;
  revision: string;
  state: LifecycleState;
  owner: User;
  releaseDate?: string;
  createdAt: string;
  description: string;
}

export interface RevisionTimelineEvent {
  id: string;
  type: RevisionEventType;
  title: string;
  description: string;
  user: User;
  timestamp: string;
}

export interface ReleasePackageDocument {
  id: string;
  name: string;
  version: string;
  type: string;
}

export interface ReleasePackageApproval {
  id: string;
  approver: User;
  role: string;
  status: "Approved" | "Pending" | "Rejected";
  date?: string;
}

export interface ReleasePackage {
  revisionNotes: string;
  documents: ReleasePackageDocument[];
  bomSummary: string;
  bomItemCount: number;
  approvals: ReleasePackageApproval[];
}

export interface RevisionDiffItem {
  field: string;
  before: string;
  after: string;
  changeType: "added" | "removed" | "modified";
}

export interface RevisionComparison {
  revisionA: RevisionRecord;
  revisionB: RevisionRecord;
  metadataChanges: RevisionDiffItem[];
  documentChanges: RevisionDiffItem[];
  bomChanges: RevisionDiffItem[];
}

export interface RevisionFilters {
  search: string;
  state: LifecycleState | "All";
  ownerId: string | "All";
  objectId: string | "All";
}
