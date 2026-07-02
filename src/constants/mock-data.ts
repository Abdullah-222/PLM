import type {
  Activity,
  Task,
  ChangeRequest,
  Notification,
  Organization,
  Project,
  Document,
  BOMItem,
  Revision,
} from "@/types";

import { users } from "./users";

export { products } from "./products";
export { currentUser, users } from "./users";

export const organizations: Organization[] = [
  { id: "org1", name: "ACME Corp" },
  { id: "org2", name: "ACME Aerospace" },
];

export const projects: Project[] = [
  { id: "p1", name: "Turbine Assembly X200", code: "TAX200" },
  { id: "p2", name: "Landing Gear Gen5", code: "LG-G5" },
  { id: "p3", name: "Hydraulic Actuator R3", code: "HA-R3" },
];

export const activities: Activity[] = [
  {
    id: "a1",
    action: "Revision Released",
    description: "Turbine Blade Assembly Rev C released to production",
    user: users[0],
    timestamp: "2026-05-25T14:30:00Z",
    type: "approve",
  },
  {
    id: "a2",
    action: "Document Uploaded",
    description: "3D Model updated for Landing Gear Strut",
    user: users[1],
    timestamp: "2026-05-25T11:15:00Z",
    type: "upload",
  },
  {
    id: "a3",
    action: "Review Submitted",
    description: "Design review submitted for Wing Spar Cap Rev B",
    user: users[2],
    timestamp: "2026-05-24T16:45:00Z",
    type: "review",
  },
  {
    id: "a4",
    action: "Item Created",
    description: "New part created: Brake Caliper Assembly",
    user: users[3],
    timestamp: "2026-05-24T09:30:00Z",
    type: "create",
  },
  {
    id: "a5",
    action: "Comment Added",
    description: "Comment on ECR-2026-042: Material specification needs update",
    user: users[4],
    timestamp: "2026-05-23T14:00:00Z",
    type: "comment",
  },
  {
    id: "a6",
    action: "BOM Updated",
    description: "Environmental Control Unit BOM revised — 3 items added",
    user: users[1],
    timestamp: "2026-05-23T10:20:00Z",
    type: "update",
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Review Landing Gear Strut Design",
    description: "Complete design review for PN-3291-B Rev B",
    assignee: users[0],
    dueDate: "2026-05-28",
    priority: "High",
    status: "In Progress",
    relatedItem: "PN-3291-B",
  },
  {
    id: "t2",
    title: "Approve Wing Spar Cap Material Change",
    description: "Review and approve material specification change",
    assignee: users[2],
    dueDate: "2026-05-30",
    priority: "Critical",
    status: "Pending",
    relatedItem: "PN-6701-B",
  },
  {
    id: "t3",
    title: "Update Hydraulic Pump Housing Drawings",
    description: "Incorporate tolerance changes per manufacturing feedback",
    assignee: users[3],
    dueDate: "2026-06-02",
    priority: "Medium",
    status: "In Progress",
    relatedItem: "PN-5567-A",
  },
  {
    id: "t4",
    title: "Complete BOM for Brake Caliper",
    description: "Finalize bill of materials for Brake Caliper Assembly",
    assignee: users[3],
    dueDate: "2026-06-05",
    priority: "Medium",
    status: "Pending",
    relatedItem: "PN-4455-A",
  },
  {
    id: "t5",
    title: "ECU Firmware Compatibility Test",
    description: "Validate firmware compatibility with new avionics module",
    assignee: users[4],
    dueDate: "2026-05-27",
    priority: "High",
    status: "Pending",
    relatedItem: "PN-1104-D",
  },
];

export const changeRequests: ChangeRequest[] = [
  {
    id: "ECR-2026-042",
    title: "Update Turbine Blade Coating Specification",
    type: "Engineering Change",
    priority: "High",
    status: "In Progress",
    requestedBy: users[0],
    createdAt: "2026-05-18T09:00:00Z",
    description: "Thermal barrier coating spec needs update for extended service life",
  },
  {
    id: "ECR-2026-043",
    title: "Landing Gear Strut Material Substitution",
    type: "Engineering Change",
    priority: "Critical",
    status: "Pending",
    requestedBy: users[1],
    createdAt: "2026-05-20T14:30:00Z",
    description: "Substitute Ti-6Al-4V with Ti-5Al-5Mo-5V-3Cr for improved fatigue life",
  },
  {
    id: "DCR-2026-015",
    title: "Revise ECU Test Procedure Documentation",
    type: "Document Change",
    priority: "Medium",
    status: "Approved",
    requestedBy: users[4],
    createdAt: "2026-05-15T11:00:00Z",
    description: "Update test procedures to include new environmental test requirements",
  },
];

export const notifications: Notification[] = [
  {
    id: "n1",
    title: "Review Required",
    message: "Landing Gear Strut Rev B is awaiting your review",
    timestamp: "2026-05-25T14:30:00Z",
    read: false,
    type: "warning",
  },
  {
    id: "n2",
    title: "Approval Complete",
    message: "Turbine Blade Assembly Rev C has been approved",
    timestamp: "2026-05-25T11:00:00Z",
    read: false,
    type: "success",
  },
  {
    id: "n3",
    title: "Task Due Soon",
    message: "ECU Firmware Compatibility Test is due in 2 days",
    timestamp: "2026-05-25T08:00:00Z",
    read: true,
    type: "info",
  },
  {
    id: "n4",
    title: "Change Request Updated",
    message: "ECR-2026-042 has been moved to In Progress",
    timestamp: "2026-05-24T16:00:00Z",
    read: true,
    type: "info",
  },
];

export const sampleDocuments: Document[] = [
  {
    id: "doc-001",
    name: "3D CAD Model — Turbine Blade",
    type: "CAD",
    version: "3.2",
    size: "45.2 MB",
    uploadedBy: users[0],
    uploadedAt: "2026-05-20T14:22:00Z",
    status: "Released",
  },
  {
    id: "doc-002",
    name: "Material Specification Report",
    type: "PDF",
    version: "2.0",
    size: "2.1 MB",
    uploadedBy: users[2],
    uploadedAt: "2026-05-18T09:45:00Z",
    status: "Released",
  },
  {
    id: "doc-003",
    name: "Stress Analysis Report",
    type: "PDF",
    version: "1.4",
    size: "8.7 MB",
    uploadedBy: users[1],
    uploadedAt: "2026-05-15T11:30:00Z",
    status: "In Review",
  },
  {
    id: "doc-004",
    name: "Assembly Drawing — PN-7842-A",
    type: "DWG",
    version: "3.0",
    size: "12.4 MB",
    uploadedBy: users[0],
    uploadedAt: "2026-05-12T08:15:00Z",
    status: "Released",
  },
  {
    id: "doc-005",
    name: "Manufacturing Process Plan",
    type: "PDF",
    version: "1.1",
    size: "3.3 MB",
    uploadedBy: users[3],
    uploadedAt: "2026-05-10T15:00:00Z",
    status: "Draft",
  },
];

export const sampleBOMItems: BOMItem[] = [
  {
    id: "bom-001",
    partNumber: "PN-7842-A1",
    name: "Blade Root Section",
    quantity: 1,
    unit: "EA",
    level: 1,
  },
  {
    id: "bom-002",
    partNumber: "PN-7842-A2",
    name: "Blade Airfoil Section",
    quantity: 1,
    unit: "EA",
    level: 1,
  },
  {
    id: "bom-003",
    partNumber: "PN-7842-A3",
    name: "Blade Tip Cap",
    quantity: 1,
    unit: "EA",
    level: 1,
  },
  {
    id: "bom-004",
    partNumber: "PN-7842-F01",
    name: "Retention Pin — Titanium",
    quantity: 4,
    unit: "EA",
    level: 1,
  },
  {
    id: "bom-005",
    partNumber: "PN-7842-F02",
    name: "Locking Washer",
    quantity: 4,
    unit: "EA",
    level: 1,
  },
  {
    id: "bom-006",
    partNumber: "PN-7842-C01",
    name: "Thermal Barrier Coating Kit",
    quantity: 1,
    unit: "KIT",
    level: 1,
  },
  {
    id: "bom-007",
    partNumber: "PN-7842-S01",
    name: "Blade-to-Disk Seal Ring",
    quantity: 1,
    unit: "EA",
    level: 1,
  },
];

export const sampleRevisions: Revision[] = [
  {
    id: "rev-001",
    revision: "C",
    description: "Updated coating specification per ECR-2026-038",
    author: users[0],
    createdAt: "2026-05-20T14:22:00Z",
    status: "Released",
  },
  {
    id: "rev-002",
    revision: "B",
    description: "Incorporated stress analysis feedback — revised fillet radii",
    author: users[0],
    createdAt: "2026-02-14T10:00:00Z",
    status: "Obsolete",
  },
  {
    id: "rev-003",
    revision: "A",
    description: "Initial release",
    author: users[1],
    createdAt: "2025-09-14T08:30:00Z",
    status: "Obsolete",
  },
];

export const dashboardStats = {
  totalProducts: 1247,
  activeRevisions: 89,
  pendingApprovals: 14,
  openChanges: 23,
  releasedThisMonth: 31,
  overdueTask: 3,
};
