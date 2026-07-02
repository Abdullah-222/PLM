import type {
  RevisionRecord,
  RevisionTimelineEvent,
  ReleasePackage,
  RevisionComparison,
  RevisionFilters,
} from "@/types/revisions";
import { users } from "./users";

export const revisionRecords: RevisionRecord[] = [
  {
    id: "rev-eng-a",
    objectId: "prod-001",
    objectName: "Engine Assembly",
    objectPartNumber: "ITEM-1001",
    revision: "A",
    state: "Obsolete",
    owner: users[1],
    releaseDate: "2024-06-15T10:00:00Z",
    createdAt: "2024-03-12T09:00:00Z",
    description: "Initial engineering release of Engine Assembly",
  },
  {
    id: "rev-eng-b",
    objectId: "prod-001",
    objectName: "Engine Assembly",
    objectPartNumber: "ITEM-1001",
    revision: "B",
    state: "Obsolete",
    owner: users[0],
    releaseDate: "2025-02-14T10:00:00Z",
    createdAt: "2024-11-01T08:00:00Z",
    description: "Incorporated stress analysis feedback — revised fillet radii",
  },
  {
    id: "rev-eng-c",
    objectId: "prod-001",
    objectName: "Engine Assembly",
    objectPartNumber: "ITEM-1001",
    revision: "C",
    state: "Released",
    owner: users[0],
    releaseDate: "2026-05-20T14:22:00Z",
    createdAt: "2025-10-01T09:00:00Z",
    description: "Production release — final tolerance stack-up and coating spec",
  },
  {
    id: "rev-bat-a",
    objectId: "prod-002",
    objectName: "Battery Module",
    objectPartNumber: "ITEM-1002",
    revision: "A",
    state: "Obsolete",
    owner: users[1],
    releaseDate: "2025-08-01T10:00:00Z",
    createdAt: "2025-06-18T10:15:00Z",
    description: "Initial release of Battery Module design",
  },
  {
    id: "rev-bat-b",
    objectId: "prod-002",
    objectName: "Battery Module",
    objectPartNumber: "ITEM-1002",
    revision: "B",
    state: "In Review",
    owner: users[1],
    createdAt: "2026-01-15T11:00:00Z",
    description: "Thermal management redesign and connector relocation",
  },
  {
    id: "rev-wing-b",
    objectId: "prod-006",
    objectName: "Wing Spar Cap",
    objectPartNumber: "ITEM-1006",
    revision: "B",
    state: "In Review",
    owner: users[0],
    createdAt: "2025-08-22T07:30:00Z",
    description: "Composite layup schedule update per test results",
  },
  {
    id: "rev-ecu-d",
    objectId: "prod-004",
    objectName: "Avionics Control Module",
    objectPartNumber: "ITEM-1004",
    revision: "D",
    state: "Released",
    owner: users[4],
    releaseDate: "2026-04-30T11:15:00Z",
    createdAt: "2025-12-01T09:00:00Z",
    description: "Firmware v4.0 release with DO-178C compliance",
  },
  {
    id: "rev-hyd-a",
    objectId: "prod-003",
    objectName: "Hydraulic Pump Housing",
    objectPartNumber: "ITEM-1003",
    revision: "A",
    state: "Draft",
    owner: users[3],
    createdAt: "2026-03-10T14:20:00Z",
    description: "Initial draft release for manufacturing review",
  },
];

const revisionTimelines: Record<string, RevisionTimelineEvent[]> = {
  "rev-eng-c": [
    {
      id: "evt-1",
      type: "created",
      title: "Revision Created",
      description: "Rev C branch created from Rev B baseline",
      user: users[0],
      timestamp: "2025-10-01T09:00:00Z",
    },
    {
      id: "evt-2",
      type: "document_change",
      title: "Documents Updated",
      description: "Requirements_Specification.pdf updated to v2.0, Engine_Assembly.step to v3.1",
      user: users[1],
      timestamp: "2026-05-18T11:30:00Z",
    },
    {
      id: "evt-3",
      type: "bom_change",
      title: "BOM Modified",
      description: "3 items added to Engine Assembly BOM — bearing kit and seal ring",
      user: users[3],
      timestamp: "2026-05-19T14:00:00Z",
    },
    {
      id: "evt-4",
      type: "approval",
      title: "Design Review Approved",
      description: "Quality engineering sign-off completed",
      user: users[2],
      timestamp: "2026-05-20T10:00:00Z",
    },
    {
      id: "evt-5",
      type: "release",
      title: "Revision Released",
      description: "Rev C released to production",
      user: users[0],
      timestamp: "2026-05-20T14:22:00Z",
    },
  ],
  "rev-bat-b": [
    {
      id: "evt-b1",
      type: "created",
      title: "Revision Created",
      description: "Rev B created for thermal management redesign",
      user: users[1],
      timestamp: "2026-01-15T11:00:00Z",
    },
    {
      id: "evt-b2",
      type: "document_change",
      title: "CAD Model Updated",
      description: "Battery_CAD_Model.sldprt revised to v1.2",
      user: users[1],
      timestamp: "2026-05-22T16:45:00Z",
    },
    {
      id: "evt-b3",
      type: "approval",
      title: "Pending Review",
      description: "Awaiting quality engineering approval",
      user: users[2],
      timestamp: "2026-05-24T09:00:00Z",
    },
  ],
};

const releasePackages: Record<string, ReleasePackage> = {
  "rev-eng-c": {
    revisionNotes:
      "Production release incorporating ECR-038 coating specification update, revised bearing interface tolerances, and updated manufacturing guide torque values.",
    documents: [
      { id: "d1", name: "Requirements_Specification.pdf", version: "2.0", type: "PDF" },
      { id: "d2", name: "Engine_Assembly.step", version: "3.1", type: "STEP" },
      { id: "d3", name: "Manufacturing_Guide.pdf", version: "2.1", type: "PDF" },
      { id: "d4", name: "Testing_Report.pdf", version: "1.3", type: "PDF" },
    ],
    bomSummary: "Engine Assembly BOM — 142 items at top level",
    bomItemCount: 142,
    approvals: [
      { id: "a1", approver: users[0], role: "Lead Engineer", status: "Approved", date: "2026-05-20T10:00:00Z" },
      { id: "a2", approver: users[2], role: "Quality Engineer", status: "Approved", date: "2026-05-20T12:00:00Z" },
      { id: "a3", approver: users[4], role: "Program Manager", status: "Approved", date: "2026-05-20T14:22:00Z" },
    ],
  },
  "rev-bat-b": {
    revisionNotes:
      "Thermal management redesign with relocated connector ports and revised vent pattern. Pending final QA approval.",
    documents: [
      { id: "d5", name: "Battery_CAD_Model.sldprt", version: "1.2", type: "SLDPRT" },
      { id: "d6", name: "Battery_Test_Protocol.pdf", version: "1.0", type: "PDF" },
    ],
    bomSummary: "Battery Module BOM — 36 items",
    bomItemCount: 36,
    approvals: [
      { id: "a4", approver: users[1], role: "Design Engineer", status: "Approved", date: "2026-05-22T16:00:00Z" },
      { id: "a5", approver: users[2], role: "Quality Engineer", status: "Pending" },
    ],
  },
};

export function filterRevisions(
  records: RevisionRecord[],
  filters: RevisionFilters
): RevisionRecord[] {
  const q = filters.search.trim().toLowerCase();
  return records.filter((r) => {
    const matchesSearch =
      !q ||
      r.objectName.toLowerCase().includes(q) ||
      r.objectPartNumber.toLowerCase().includes(q) ||
      r.revision.toLowerCase().includes(q);
    const matchesState = filters.state === "All" || r.state === filters.state;
    const matchesOwner =
      filters.ownerId === "All" || r.owner.id === filters.ownerId;
    const matchesObject =
      filters.objectId === "All" || r.objectId === filters.objectId;
    return matchesSearch && matchesState && matchesOwner && matchesObject;
  });
}

export function getRevisionById(id: string): RevisionRecord | undefined {
  return revisionRecords.find((r) => r.id === id);
}

export function getRevisionTimeline(id: string): RevisionTimelineEvent[] {
  return revisionTimelines[id] ?? [
    {
      id: "default-1",
      type: "created",
      title: "Revision Created",
      description: "Revision record created in PLM system",
      user: users[0],
      timestamp: new Date().toISOString(),
    },
  ];
}

export function getReleasePackage(id: string): ReleasePackage {
  return (
    releasePackages[id] ?? {
      revisionNotes: "No release package notes available.",
      documents: [],
      bomSummary: "No BOM data",
      bomItemCount: 0,
      approvals: [],
    }
  );
}

export function getRevisionComparison(
  idA: string,
  idB: string
): RevisionComparison | null {
  const revisionA = getRevisionById(idA);
  const revisionB = getRevisionById(idB);
  if (!revisionA || !revisionB) return null;
  if (revisionA.objectId !== revisionB.objectId) return null;

  return {
    revisionA,
    revisionB,
    metadataChanges: [
      {
        field: "Revision",
        before: revisionA.revision,
        after: revisionB.revision,
        changeType: "modified",
      },
      {
        field: "Lifecycle State",
        before: revisionA.state,
        after: revisionB.state,
        changeType: "modified",
      },
      {
        field: "Description",
        before: revisionA.description,
        after: revisionB.description,
        changeType: "modified",
      },
      {
        field: "Material",
        before: "Ti-6Al-4V",
        after: "Inconel 718",
        changeType: "modified",
      },
    ],
    documentChanges: [
      {
        field: "Requirements_Specification.pdf",
        before: "v1.1",
        after: "v2.0",
        changeType: "modified",
      },
      {
        field: "Engine_Assembly.step",
        before: "v2.0",
        after: "v3.1",
        changeType: "modified",
      },
      {
        field: "Manufacturing_Guide.pdf",
        before: "—",
        after: "v2.1",
        changeType: "added",
      },
    ],
    bomChanges: [
      {
        field: "PN-7842-C01 Thermal Barrier Coating Kit",
        before: "—",
        after: "1 KIT",
        changeType: "added",
      },
      {
        field: "PN-7842-S01 Blade-to-Disk Seal Ring",
        before: "—",
        after: "1 EA",
        changeType: "added",
      },
      {
        field: "PN-7842-F01 Retention Pin qty",
        before: "2 EA",
        after: "4 EA",
        changeType: "modified",
      },
    ],
  };
}

export function getUniqueRevisionObjects() {
  const seen = new Map<string, { id: string; name: string; partNumber: string }>();
  for (const r of revisionRecords) {
    seen.set(r.objectId, {
      id: r.objectId,
      name: r.objectName,
      partNumber: r.objectPartNumber,
    });
  }
  return Array.from(seen.values());
}

export function getUniqueRevisionOwners() {
  const seen = new Map<string, (typeof users)[0]>();
  for (const r of revisionRecords) {
    seen.set(r.owner.id, r.owner);
  }
  return Array.from(seen.values());
}
