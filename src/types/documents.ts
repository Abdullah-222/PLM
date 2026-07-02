import type { LifecycleState, User } from "@/types";

export type DocumentFileType =
  | "PDF"
  | "CAD"
  | "STEP"
  | "SLDPRT"
  | "DWG"
  | "DOCX"
  | "XLSX";

export type CheckoutStatus = "Checked In" | "Checked Out";

export interface DocumentVersionEntry {
  version: string;
  date: string;
  user: User;
  changeSummary: string;
}

export interface ManagedDocument {
  id: string;
  documentId: string;
  name: string;
  type: DocumentFileType;
  productId: string;
  productName: string;
  productPartNumber: string;
  version: string;
  revision: string;
  status: LifecycleState;
  owner: User;
  updatedAt: string;
  createdAt: string;
  size: string;
  folderId: string;
  checkoutStatus: CheckoutStatus;
  checkedOutBy?: User;
  checkedOutAt?: string;
  linkedRevision: string;
  linkedBomId?: string;
  description?: string;
  versionHistory: DocumentVersionEntry[];
}

export interface DocumentFolder {
  id: string;
  name: string;
  parentId: string | null;
  children?: DocumentFolder[];
}

export interface DocumentFilters {
  search: string;
  productId: string | "All";
  fileType: DocumentFileType | "All";
  ownerId: string | "All";
  status: LifecycleState | "All";
  folderId: string | "All";
}
