import type {
  ManagedDocument,
  DocumentFolder,
  DocumentFilters,
} from "@/types/documents";
import { users } from "./users";

export const documentFolders: DocumentFolder[] = [
  {
    id: "folder-products",
    name: "Products",
    parentId: null,
    children: [
      { id: "folder-engine", name: "Engine Assembly", parentId: "folder-products" },
      { id: "folder-battery", name: "Battery Module", parentId: "folder-products" },
    ],
  },
  { id: "folder-specs", name: "Specifications", parentId: null },
  { id: "folder-mfg", name: "Manufacturing", parentId: null },
  { id: "folder-testing", name: "Testing", parentId: null },
];

const v = (
  version: string,
  date: string,
  user: (typeof users)[0],
  changeSummary: string
) => ({ version, date, user, changeSummary });

export const managedDocuments: ManagedDocument[] = [
  {
    id: "mdoc-001",
    documentId: "DOC-2001",
    name: "Requirements_Specification.pdf",
    type: "PDF",
    productId: "prod-001",
    productName: "Engine Assembly",
    productPartNumber: "ITEM-1001",
    version: "2.0",
    revision: "C",
    status: "Released",
    owner: users[0],
    updatedAt: "2026-05-20T14:22:00Z",
    createdAt: "2024-06-10T09:00:00Z",
    size: "2.4 MB",
    folderId: "folder-specs",
    checkoutStatus: "Checked In",
    linkedRevision: "C",
    linkedBomId: "bom-root",
    description: "System requirements specification for Engine Assembly X200 propulsion module.",
    versionHistory: [
      v("2.0", "2026-05-20T14:22:00Z", users[0], "Updated thermal requirements per ECR-038"),
      v("1.1", "2025-11-14T10:00:00Z", users[1], "Added interface control requirements"),
      v("1.0", "2024-06-10T09:00:00Z", users[0], "Initial requirements release"),
    ],
  },
  {
    id: "mdoc-002",
    documentId: "DOC-2002",
    name: "Engine_Assembly.step",
    type: "STEP",
    productId: "prod-001",
    productName: "Engine Assembly",
    productPartNumber: "ITEM-1001",
    version: "3.1",
    revision: "C",
    status: "Released",
    owner: users[1],
    updatedAt: "2026-05-18T11:30:00Z",
    createdAt: "2024-08-22T10:15:00Z",
    size: "186.7 MB",
    folderId: "folder-engine",
    checkoutStatus: "Checked Out",
    checkedOutBy: users[3],
    checkedOutAt: "2026-05-24T09:15:00Z",
    linkedRevision: "C",
    linkedBomId: "bom-root",
    description: "3D CAD assembly model — neutral STEP format for supplier exchange.",
    versionHistory: [
      v("3.1", "2026-05-18T11:30:00Z", users[1], "Updated crankshaft interface geometry"),
      v("3.0", "2026-02-10T08:00:00Z", users[1], "Rev C model release"),
      v("2.0", "2025-06-01T14:00:00Z", users[2], "Bearing housing tolerance update"),
    ],
  },
  {
    id: "mdoc-003",
    documentId: "DOC-2003",
    name: "Battery_CAD_Model.sldprt",
    type: "SLDPRT",
    productId: "prod-002",
    productName: "Battery Module",
    productPartNumber: "ITEM-1002",
    version: "1.2",
    revision: "B",
    status: "In Review",
    owner: users[1],
    updatedAt: "2026-05-22T16:45:00Z",
    createdAt: "2025-07-15T13:00:00Z",
    size: "42.8 MB",
    folderId: "folder-battery",
    checkoutStatus: "Checked In",
    linkedRevision: "B",
    description: "SolidWorks part model for battery module enclosure.",
    versionHistory: [
      v("1.2", "2026-05-22T16:45:00Z", users[1], "Revised thermal vent pattern"),
      v("1.1", "2026-01-20T10:30:00Z", users[4], "Connector port relocation"),
      v("1.0", "2025-07-15T13:00:00Z", users[1], "Initial CAD model upload"),
    ],
  },
  {
    id: "mdoc-004",
    documentId: "DOC-2004",
    name: "Testing_Report.pdf",
    type: "PDF",
    productId: "prod-001",
    productName: "Engine Assembly",
    productPartNumber: "ITEM-1001",
    version: "1.3",
    revision: "C",
    status: "In Review",
    owner: users[2],
    updatedAt: "2026-05-19T09:00:00Z",
    createdAt: "2025-12-05T11:00:00Z",
    size: "8.6 MB",
    folderId: "folder-testing",
    checkoutStatus: "Checked In",
    linkedRevision: "C",
    description: "Vibration and thermal cycling test results for Engine Assembly Rev C.",
    versionHistory: [
      v("1.3", "2026-05-19T09:00:00Z", users[2], "Added high-cycle fatigue results"),
      v("1.2", "2026-03-28T15:00:00Z", users[2], "Thermal cycling phase 2 results"),
      v("1.0", "2025-12-05T11:00:00Z", users[2], "Initial test report"),
    ],
  },
  {
    id: "mdoc-005",
    documentId: "DOC-2005",
    name: "Manufacturing_Guide.pdf",
    type: "PDF",
    productId: "prod-001",
    productName: "Engine Assembly",
    productPartNumber: "ITEM-1001",
    version: "2.1",
    revision: "C",
    status: "Released",
    owner: users[3],
    updatedAt: "2026-05-15T08:30:00Z",
    createdAt: "2024-10-01T08:00:00Z",
    size: "5.2 MB",
    folderId: "folder-mfg",
    checkoutStatus: "Checked In",
    linkedRevision: "C",
    linkedBomId: "bom-root",
    description: "Manufacturing process plan and work instructions for final assembly.",
    versionHistory: [
      v("2.1", "2026-05-15T08:30:00Z", users[3], "Updated torque specifications for bearing install"),
      v("2.0", "2026-01-10T09:00:00Z", users[3], "Rev C manufacturing release"),
      v("1.0", "2024-10-01T08:00:00Z", users[3], "Initial manufacturing guide"),
    ],
  },
  {
    id: "mdoc-006",
    documentId: "DOC-2006",
    name: "Battery_Test_Protocol.pdf",
    type: "PDF",
    productId: "prod-002",
    productName: "Battery Module",
    productPartNumber: "ITEM-1002",
    version: "1.0",
    revision: "B",
    status: "Draft",
    owner: users[2],
    updatedAt: "2026-05-23T14:00:00Z",
    createdAt: "2026-05-23T14:00:00Z",
    size: "1.1 MB",
    folderId: "folder-testing",
    checkoutStatus: "Checked Out",
    checkedOutBy: users[2],
    checkedOutAt: "2026-05-25T08:00:00Z",
    linkedRevision: "B",
    description: "Electrical safety and thermal runaway test protocol for Battery Module.",
    versionHistory: [
      v("1.0", "2026-05-23T14:00:00Z", users[2], "Initial draft protocol"),
    ],
  },
  {
    id: "mdoc-007",
    documentId: "DOC-2007",
    name: "Wing_Spar_Analysis.xlsx",
    type: "XLSX",
    productId: "prod-006",
    productName: "Wing Spar Cap",
    productPartNumber: "ITEM-1006",
    version: "1.4",
    revision: "B",
    status: "In Review",
    owner: users[0],
    updatedAt: "2026-05-21T15:00:00Z",
    createdAt: "2025-09-01T10:00:00Z",
    size: "3.8 MB",
    folderId: "folder-specs",
    checkoutStatus: "Checked In",
    linkedRevision: "B",
    description: "FEA stress analysis workbook for composite wing spar cap.",
    versionHistory: [
      v("1.4", "2026-05-21T15:00:00Z", users[0], "Updated load case per flight test data"),
      v("1.0", "2025-09-01T10:00:00Z", users[0], "Initial analysis release"),
    ],
  },
  {
    id: "mdoc-008",
    documentId: "DOC-2008",
    name: "ECU_Firmware_Spec.docx",
    type: "DOCX",
    productId: "prod-004",
    productName: "Avionics Control Module",
    productPartNumber: "ITEM-1004",
    version: "4.0",
    revision: "D",
    status: "Released",
    owner: users[4],
    updatedAt: "2026-04-30T11:15:00Z",
    createdAt: "2023-12-01T09:00:00Z",
    size: "890 KB",
    folderId: "folder-specs",
    checkoutStatus: "Checked In",
    linkedRevision: "D",
    description: "Firmware interface specification for avionics control module.",
    versionHistory: [
      v("4.0", "2026-04-30T11:15:00Z", users[4], "DO-178C compliance updates"),
      v("3.0", "2025-08-15T10:00:00Z", users[4], "ARINC 429 protocol revision"),
    ],
  },
];

export function filterDocuments(
  docs: ManagedDocument[],
  filters: DocumentFilters
): ManagedDocument[] {
  const q = filters.search.trim().toLowerCase();
  return docs.filter((doc) => {
    const matchesSearch =
      !q ||
      doc.name.toLowerCase().includes(q) ||
      doc.documentId.toLowerCase().includes(q) ||
      doc.productName.toLowerCase().includes(q) ||
      doc.productPartNumber.toLowerCase().includes(q);
    const matchesProduct =
      filters.productId === "All" || doc.productId === filters.productId;
    const matchesType =
      filters.fileType === "All" || doc.type === filters.fileType;
    const matchesOwner =
      filters.ownerId === "All" || doc.owner.id === filters.ownerId;
    const matchesStatus =
      filters.status === "All" || doc.status === filters.status;
    const matchesFolder =
      filters.folderId === "All" ||
      doc.folderId === filters.folderId ||
      isInFolder(doc.folderId, filters.folderId);
    return (
      matchesSearch &&
      matchesProduct &&
      matchesType &&
      matchesOwner &&
      matchesStatus &&
      matchesFolder
    );
  });
}

function isInFolder(docFolderId: string, selectedFolderId: string): boolean {
  if (selectedFolderId === "folder-products") {
    return (
      docFolderId === "folder-engine" || docFolderId === "folder-battery"
    );
  }
  return false;
}

export function getDocumentById(id: string): ManagedDocument | undefined {
  return managedDocuments.find((d) => d.id === id);
}

export function getUniqueDocumentProducts() {
  const seen = new Map<string, { id: string; name: string; partNumber: string }>();
  for (const doc of managedDocuments) {
    seen.set(doc.productId, {
      id: doc.productId,
      name: doc.productName,
      partNumber: doc.productPartNumber,
    });
  }
  return Array.from(seen.values());
}

export function getUniqueDocumentOwners() {
  const seen = new Map<string, (typeof users)[0]>();
  for (const doc of managedDocuments) {
    seen.set(doc.owner.id, doc.owner);
  }
  return Array.from(seen.values());
}
