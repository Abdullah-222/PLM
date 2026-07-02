import type {
  ChangeFilters,
  ChangeTimelineEvent,
  ECNNotice,
  EngineeringChange,
} from "@/types/changes";
import { users } from "./users";

const timeline = (
  changeId: string,
  events: Omit<ChangeTimelineEvent, "id" | "changeId">[]
): ChangeTimelineEvent[] =>
  events.map((e, i) => ({
    id: `tl-${changeId}-${i}`,
    changeId,
    ...e,
  }));

export const engineeringChangesSeed: EngineeringChange[] = [
  {
    id: "chg-ecr-001",
    changeNumber: "ECR-001",
    type: "ECR",
    title: "Engine Assembly Material Upgrade",
    description:
      "Upgrade cylinder head material from 6061-T6 to 7075-T651 for improved fatigue resistance under high thermal cycling.",
    reason:
      "Stress analysis indicates current material margin below 1.2 safety factor at peak operating temperature.",
    priority: "High",
    owner: users[0],
    status: "Review",
    createdAt: "2026-05-10T08:00:00Z",
    updatedAt: "2026-05-22T14:30:00Z",
    dueDate: "2026-06-15",
    affectedObjects: [
      {
        id: "ao-1",
        type: "Product",
        objectId: "prod-001",
        label: "Engine Assembly",
        partNumber: "ITEM-1001",
        revision: "C",
        linkedAt: "2026-05-10T08:15:00Z",
      },
      {
        id: "ao-2",
        type: "BOM",
        objectId: "asm-engine",
        label: "Engine Assembly BOM",
        revision: "B",
        linkedAt: "2026-05-10T08:20:00Z",
      },
      {
        id: "ao-3",
        type: "Revision",
        objectId: "rev-eng-c",
        label: "Engine Assembly Rev C",
        partNumber: "ITEM-1001",
        revision: "C",
        linkedAt: "2026-05-11T09:00:00Z",
      },
    ],
    impact: {
      costImpact: 12500,
      scheduleImpactDays: 14,
      riskLevel: "Medium",
      notes:
        "Supplier lead time for 7075-T651 stock is 6 weeks. Tooling changes required for machining parameters.",
    },
    approvals: [
      {
        id: "ap-ecr-001-1",
        role: "Engineering Manager",
        approver: users[4],
        status: "Approved",
        actedAt: "2026-05-18T10:00:00Z",
        comment: "Technical justification is sound.",
      },
      {
        id: "ap-ecr-001-2",
        role: "QA Manager",
        approver: users[2],
        status: "Pending",
      },
      {
        id: "ap-ecr-001-3",
        role: "Product Owner",
        approver: users[4],
        status: "Pending",
      },
    ],
    tasks: [
      {
        id: "ct-001",
        changeId: "chg-ecr-001",
        title: "Complete FEA validation report",
        description: "Run updated FEA with 7075-T651 material properties",
        assignee: users[1],
        dueDate: "2026-05-28",
        priority: "High",
        status: "In Progress",
        createdAt: "2026-05-10T09:00:00Z",
      },
      {
        id: "ct-002",
        changeId: "chg-ecr-001",
        title: "Update material specification document",
        description: "Revise MS-ENG-001 material callout",
        assignee: users[0],
        dueDate: "2026-06-01",
        priority: "Medium",
        status: "Pending",
        createdAt: "2026-05-10T09:00:00Z",
      },
    ],
    timeline: timeline("chg-ecr-001", [
      { type: "Created", user: users[0], timestamp: "2026-05-10T08:00:00Z" },
      { type: "Submitted", user: users[0], timestamp: "2026-05-12T11:00:00Z", note: "Submitted for engineering review" },
      { type: "Reviewed", user: users[4], timestamp: "2026-05-18T10:00:00Z", note: "Engineering Manager approved" },
    ]),
  },
  {
    id: "chg-ecr-002",
    changeNumber: "ECR-002",
    type: "ECR",
    title: "Battery Module Thermal Interface Change",
    description:
      "Replace thermal pad with phase-change material interface for improved heat dissipation.",
    reason: "Thermal testing showed junction temperatures exceeding design limits by 8°C.",
    priority: "Critical",
    owner: users[1],
    status: "Approved",
    createdAt: "2026-05-05T10:00:00Z",
    updatedAt: "2026-05-20T16:00:00Z",
    dueDate: "2026-06-01",
    affectedObjects: [
      {
        id: "ao-4",
        type: "Product",
        objectId: "prod-002",
        label: "Battery Module",
        partNumber: "ITEM-1002",
        revision: "B",
        linkedAt: "2026-05-05T10:10:00Z",
      },
      {
        id: "ao-5",
        type: "Document",
        objectId: "mdoc-002",
        label: "Thermal_Analysis_Report.xlsx",
        linkedAt: "2026-05-05T10:15:00Z",
      },
    ],
    impact: {
      costImpact: 3200,
      scheduleImpactDays: 7,
      riskLevel: "High",
      notes: "Requires re-qualification of thermal performance per DO-160G Section 4.",
    },
    approvals: [
      {
        id: "ap-ecr-002-1",
        role: "Engineering Manager",
        approver: users[4],
        status: "Approved",
        actedAt: "2026-05-15T09:00:00Z",
      },
      {
        id: "ap-ecr-002-2",
        role: "QA Manager",
        approver: users[2],
        status: "Approved",
        actedAt: "2026-05-18T14:00:00Z",
      },
      {
        id: "ap-ecr-002-3",
        role: "Product Owner",
        approver: users[4],
        status: "Approved",
        actedAt: "2026-05-20T16:00:00Z",
      },
    ],
    tasks: [],
    timeline: timeline("chg-ecr-002", [
      { type: "Created", user: users[1], timestamp: "2026-05-05T10:00:00Z" },
      { type: "Submitted", user: users[1], timestamp: "2026-05-08T09:00:00Z" },
      { type: "Approved", user: users[2], timestamp: "2026-05-20T16:00:00Z" },
    ]),
    convertedEcoId: "chg-eco-101",
  },
  {
    id: "chg-eco-101",
    changeNumber: "ECO-101",
    type: "ECO",
    title: "Implement Battery Thermal Interface Change",
    description:
      "Execute ECR-002 approved changes: update BOM, release new revision, issue ECN to manufacturing.",
    reason: "Approved engineering change request ECR-002 requires implementation.",
    priority: "Critical",
    owner: users[1],
    status: "In Progress",
    createdAt: "2026-05-21T08:00:00Z",
    updatedAt: "2026-05-24T11:00:00Z",
    dueDate: "2026-06-10",
    parentEcrId: "chg-ecr-002",
    affectedObjects: [
      {
        id: "ao-6",
        type: "Product",
        objectId: "prod-002",
        label: "Battery Module",
        partNumber: "ITEM-1002",
        revision: "B",
        linkedAt: "2026-05-21T08:00:00Z",
      },
      {
        id: "ao-7",
        type: "BOM",
        objectId: "asm-battery",
        label: "Battery Module BOM",
        revision: "A",
        linkedAt: "2026-05-21T08:05:00Z",
      },
    ],
    impact: {
      costImpact: 3200,
      scheduleImpactDays: 7,
      riskLevel: "High",
      notes: "Coordinate with manufacturing for cut-over date.",
    },
    approvals: [
      {
        id: "ap-eco-101-1",
        role: "Engineering Manager",
        approver: users[4],
        status: "Approved",
        actedAt: "2026-05-21T10:00:00Z",
      },
      {
        id: "ap-eco-101-2",
        role: "QA Manager",
        approver: users[2],
        status: "Approved",
        actedAt: "2026-05-22T09:00:00Z",
      },
      {
        id: "ap-eco-101-3",
        role: "Product Owner",
        approver: users[4],
        status: "Approved",
        actedAt: "2026-05-22T14:00:00Z",
      },
    ],
    tasks: [
      {
        id: "ct-003",
        changeId: "chg-eco-101",
        title: "Update BOM with new thermal interface part",
        description: "Add PRT-THM-0042 to Battery Module BOM",
        assignee: users[3],
        dueDate: "2026-05-30",
        priority: "Critical",
        status: "In Progress",
        createdAt: "2026-05-21T09:00:00Z",
      },
      {
        id: "ct-004",
        changeId: "chg-eco-101",
        title: "Release updated drawing package",
        description: "Release DWG-BAT-002 Rev C with thermal interface callout",
        assignee: users[1],
        dueDate: "2026-06-05",
        priority: "High",
        status: "Pending",
        createdAt: "2026-05-21T09:00:00Z",
      },
    ],
    timeline: timeline("chg-eco-101", [
      { type: "Created", user: users[1], timestamp: "2026-05-21T08:00:00Z", note: "Converted from ECR-002" },
      { type: "Submitted", user: users[1], timestamp: "2026-05-21T09:00:00Z" },
      { type: "Approved", user: users[4], timestamp: "2026-05-22T14:00:00Z" },
    ]),
  },
  {
    id: "chg-ecr-003",
    changeNumber: "ECR-003",
    type: "ECR",
    title: "Hydraulic Pump Housing Port Redesign",
    description: "Relocate fluid port to improve accessibility during maintenance.",
    reason: "Field service feedback — current port location requires engine removal for access.",
    priority: "Medium",
    owner: users[3],
    status: "Draft",
    createdAt: "2026-05-23T14:00:00Z",
    updatedAt: "2026-05-23T14:00:00Z",
    dueDate: "2026-07-01",
    affectedObjects: [
      {
        id: "ao-8",
        type: "Product",
        objectId: "prod-003",
        label: "Hydraulic Pump Housing",
        partNumber: "ITEM-1003",
        revision: "A",
        linkedAt: "2026-05-23T14:05:00Z",
      },
    ],
    impact: {
      costImpact: 8500,
      scheduleImpactDays: 21,
      riskLevel: "Medium",
      notes: "Requires mold modification for cast housing.",
    },
    approvals: [
      { id: "ap-ecr-003-1", role: "Engineering Manager", approver: users[4], status: "Pending" },
      { id: "ap-ecr-003-2", role: "QA Manager", approver: users[2], status: "Pending" },
      { id: "ap-ecr-003-3", role: "Product Owner", approver: users[4], status: "Pending" },
    ],
    tasks: [],
    timeline: timeline("chg-ecr-003", [
      { type: "Created", user: users[3], timestamp: "2026-05-23T14:00:00Z" },
    ]),
  },
  {
    id: "chg-eco-102",
    changeNumber: "ECO-102",
    type: "ECO",
    title: "Gearbox Assembly Lubrication Spec Update",
    description: "Update lubrication specification from MIL-PRF-23699 to newer synthetic blend.",
    reason: "OEM specification change for extended service interval compliance.",
    priority: "Low",
    owner: users[0],
    status: "Closed",
    createdAt: "2026-04-01T08:00:00Z",
    updatedAt: "2026-05-15T17:00:00Z",
    dueDate: "2026-05-01",
    affectedObjects: [
      {
        id: "ao-9",
        type: "BOM",
        objectId: "asm-gearbox",
        label: "Gearbox Assembly BOM",
        revision: "C",
        linkedAt: "2026-04-01T08:00:00Z",
      },
      {
        id: "ao-10",
        type: "Document",
        objectId: "mdoc-001",
        label: "Requirements_Specification.pdf",
        linkedAt: "2026-04-01T08:05:00Z",
      },
    ],
    impact: {
      costImpact: 500,
      scheduleImpactDays: 3,
      riskLevel: "Low",
      notes: "Minimal impact — lubricant is drop-in replacement.",
    },
    approvals: [
      { id: "ap-eco-102-1", role: "Engineering Manager", approver: users[4], status: "Approved", actedAt: "2026-04-05T10:00:00Z" },
      { id: "ap-eco-102-2", role: "QA Manager", approver: users[2], status: "Approved", actedAt: "2026-04-08T11:00:00Z" },
      { id: "ap-eco-102-3", role: "Product Owner", approver: users[4], status: "Approved", actedAt: "2026-04-10T09:00:00Z" },
    ],
    tasks: [],
    timeline: timeline("chg-eco-102", [
      { type: "Created", user: users[0], timestamp: "2026-04-01T08:00:00Z" },
      { type: "Submitted", user: users[0], timestamp: "2026-04-02T09:00:00Z" },
      { type: "Approved", user: users[4], timestamp: "2026-04-10T09:00:00Z" },
      { type: "Implemented", user: users[3], timestamp: "2026-05-10T14:00:00Z" },
      { type: "Closed", user: users[0], timestamp: "2026-05-15T17:00:00Z" },
    ]),
  },
  {
    id: "chg-ecr-004",
    changeNumber: "ECR-004",
    type: "ECR",
    title: "Wiring Harness Connector Standardization",
    description: "Standardize connector type across electrical subsystems to reduce inventory.",
    reason: "Supply chain consolidation initiative — 4 connector types can be reduced to 2.",
    priority: "Medium",
    owner: users[1],
    status: "Rejected",
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-05-01T11:00:00Z",
    affectedObjects: [
      {
        id: "ao-11",
        type: "Product",
        objectId: "prod-002",
        label: "Battery Module",
        partNumber: "ITEM-1002",
        linkedAt: "2026-04-20T10:05:00Z",
      },
    ],
    impact: {
      costImpact: -15000,
      scheduleImpactDays: 30,
      riskLevel: "High",
      notes: "Retrofit cost exceeds projected savings in first 2 years.",
    },
    approvals: [
      { id: "ap-ecr-004-1", role: "Engineering Manager", approver: users[4], status: "Approved", actedAt: "2026-04-25T10:00:00Z" },
      { id: "ap-ecr-004-2", role: "QA Manager", approver: users[2], status: "Rejected", actedAt: "2026-05-01T11:00:00Z", comment: "EMI re-qualification scope too broad." },
      { id: "ap-ecr-004-3", role: "Product Owner", approver: users[4], status: "Pending" },
    ],
    tasks: [],
    timeline: timeline("chg-ecr-004", [
      { type: "Created", user: users[1], timestamp: "2026-04-20T10:00:00Z" },
      { type: "Submitted", user: users[1], timestamp: "2026-04-22T09:00:00Z" },
      { type: "Rejected", user: users[2], timestamp: "2026-05-01T11:00:00Z", note: "EMI re-qualification scope too broad" },
    ]),
  },
];

export const ecnNoticesSeed: ECNNotice[] = [
  {
    id: "ecn-501",
    ecnNumber: "ECN-501",
    ecoId: "chg-eco-102",
    ecoNumber: "ECO-102",
    title: "Gearbox Lubrication Specification Change Notice",
    recipients: [users[3], users[4], users[2]],
    issuedAt: "2026-05-12T09:00:00Z",
    affectedItems: [
      {
        id: "ao-ecn-1",
        type: "BOM",
        objectId: "asm-gearbox",
        label: "Gearbox Assembly BOM",
        revision: "C",
        linkedAt: "2026-05-12T09:00:00Z",
      },
      {
        id: "ao-ecn-2",
        type: "Document",
        objectId: "mdoc-001",
        label: "Requirements_Specification.pdf",
        linkedAt: "2026-05-12T09:00:00Z",
      },
    ],
    status: "Issued",
    message:
      "Effective immediately: Gearbox Assembly lubrication specification updated. All new builds must use synthetic blend per MS-LUB-042 Rev B.",
  },
];

export function filterChanges(
  changes: EngineeringChange[],
  filters: ChangeFilters
): EngineeringChange[] {
  return changes.filter((change) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = [
        change.changeNumber,
        change.title,
        change.description,
        change.affectedObjects.map((o) => o.label).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.status !== "All" && change.status !== filters.status) return false;
    if (filters.priority !== "All" && change.priority !== filters.priority) return false;
    if (filters.type !== "All" && change.type !== filters.type) return false;
    if (filters.ownerId !== "All" && change.owner.id !== filters.ownerId) return false;
    return true;
  });
}

export function getChangeById(id: string): EngineeringChange | undefined {
  return engineeringChangesSeed.find((c) => c.id === id);
}

export function getUniqueChangeOwners() {
  const map = new Map<string, (typeof users)[0]>();
  engineeringChangesSeed.forEach((c) => map.set(c.owner.id, c.owner));
  return Array.from(map.values());
}

export function getChangeDashboardStats(changes: EngineeringChange[]) {
  const openStatuses = new Set(["Draft", "Submitted", "Review", "Open", "In Progress"]);
  const pendingApproval = changes.filter((c) =>
    c.approvals.some((a) => a.status === "Pending")
  );
  const approved = changes.filter((c) =>
    ["Approved", "Implemented"].includes(c.status)
  );
  const closed = changes.filter((c) => c.status === "Closed" || c.status === "Converted");
  const highPriority = changes.filter(
    (c) => c.priority === "High" || c.priority === "Critical"
  );

  return {
    open: changes.filter((c) => openStatuses.has(c.status)).length,
    pendingApproval: pendingApproval.length,
    approved: approved.length,
    closed: closed.length,
    highPriority: highPriority.length,
  };
}
