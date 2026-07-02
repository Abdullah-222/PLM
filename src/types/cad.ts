import type { User, LifecycleState } from "@/types";

export type CadFileType =
  | "SLDPRT"
  | "SLDASM"
  | "STEP"
  | "STP"
  | "IGES"
  | "CATPART"
  | "CATPRODUCT"
  | "PRT"
  | "DWG"
  | "DXF"
  | "PDF";

export type CadSoftware =
  | "SolidWorks"
  | "PTC Creo"
  | "Siemens NX"
  | "CATIA"
  | "AutoCAD"
  | "Autodesk Inventor"
  | "Neutral";

export interface LockStatus {
  locked: boolean;
  lockedBy?: User;
  lockedAt?: string;
}

export interface CheckoutStatus {
  checkedOut: boolean;
  checkedOutBy?: User;
  checkedOutAt?: string;
  reason?: string;
}

export interface CadVersion {
  version: number;
  revision: string;
  date: string;
  author: User;
  changeSummary: string;
  status: LifecycleState;
  size: string;
}

export interface CadModelNode {
  id: string;
  name: string;
  type: "assembly" | "part";
  material?: string;
  weight?: string;
  children?: CadModelNode[];
  color?: string;
  visibility?: boolean;
}

export interface CadComment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  replies?: CadComment[];
  resolved?: boolean;
  resolvedBy?: User;
  resolvedAt?: string;
}

export interface LinkedProduct {
  id: string;
  name: string;
  partNumber: string;
}

export interface LinkedDocument {
  id: string;
  name: string;
  type: string;
}

export interface LinkedChange {
  id: string;
  title: string;
  status: string;
}

export interface LinkedWorkflow {
  id: string;
  name: string;
  status: string;
}

export interface CadFile {
  id: string;
  fileName: string;
  thumbnail: string;
  type: CadFileType;
  software: CadSoftware;
  currentRevision: string;
  status: LifecycleState;
  owner: User;
  lastModified: string;
  createdAt: string;
  size: string;
  lockStatus: LockStatus;
  checkoutStatus: CheckoutStatus;
  folderId: string;
  description: string;
  material: string;
  weight: string;
  volume: string;
  density: string;
  surfaceArea: string;
  units: string;
  partNumber: string;
  project: string;
  tags: string[];
  linkedProduct?: LinkedProduct;
  linkedRevision?: string;
  linkedDocuments?: LinkedDocument[];
  linkedBomId?: string;
  linkedChanges?: LinkedChange[];
  linkedWorkflows?: LinkedWorkflow[];
  versions: CadVersion[];
  modelTree?: CadModelNode[];
  comments: CadComment[];
}

export interface CadFolder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface CadFilters {
  search: string;
  fileType: string | "All";
  software: string | "All";
  ownerId: string | "All";
  status: string | "All";
  revision: string | "All";
  folderId: string | "All";
}
