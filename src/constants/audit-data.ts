import type {
  AuditDashboardStats,
  AuditFilters,
  AuditLogEntry,
  ActivityFeedItem,
  ComplianceReport,
  ObjectHistoryRecord,
  UserActivitySummary,
} from "@/types/audit";
import { users } from "./users";

export const auditLogSeed: AuditLogEntry[] = [
  {
    id: "al-001",
    timestamp: "2026-05-25T14:30:00Z",
    user: users[0],
    objectType: "Revision",
    objectId: "rev-eng-c",
    objectLabel: "Engine Assembly Rev C",
    action: "Release",
    before: { state: "In Review", revision: "C" },
    after: { state: "Released", revision: "C" },
  },
  {
    id: "al-002",
    timestamp: "2026-05-25T11:15:00Z",
    user: users[1],
    objectType: "Document",
    objectId: "mdoc-002",
    objectLabel: "Thermal_Analysis_Report.xlsx",
    action: "Update",
    before: { version: "1.2", status: "Draft" },
    after: { version: "1.3", status: "In Review" },
  },
  {
    id: "al-003",
    timestamp: "2026-05-24T16:45:00Z",
    user: users[2],
    objectType: "Change",
    objectId: "chg-ecr-001",
    objectLabel: "ECR-001",
    action: "Approve",
    before: { status: "Review", approvalStep: "Engineering Manager" },
    after: { status: "Review", approvalStep: "QA Manager" },
  },
  {
    id: "al-004",
    timestamp: "2026-05-24T09:30:00Z",
    user: users[3],
    objectType: "Product",
    objectId: "prod-003",
    objectLabel: "Hydraulic Pump Housing",
    action: "Create",
    before: {},
    after: { partNumber: "ITEM-1003", lifecycleState: "Draft" },
  },
  {
    id: "al-005",
    timestamp: "2026-05-23T14:00:00Z",
    user: users[4],
    objectType: "Change",
    objectId: "chg-ecr-003",
    objectLabel: "ECR-003",
    action: "Create",
    before: {},
    after: { status: "Draft", type: "ECR" },
  },
  {
    id: "al-006",
    timestamp: "2026-05-23T10:20:00Z",
    user: users[1],
    objectType: "BOM",
    objectId: "asm-engine",
    objectLabel: "Engine Assembly BOM",
    action: "Update",
    before: { itemCount: "139", revision: "B" },
    after: { itemCount: "142", revision: "B" },
  },
  {
    id: "al-007",
    timestamp: "2026-05-22T14:00:00Z",
    user: users[4],
    objectType: "Change",
    objectId: "chg-eco-101",
    objectLabel: "ECO-101",
    action: "Approve",
    before: { status: "Open" },
    after: { status: "In Progress" },
  },
  {
    id: "al-008",
    timestamp: "2026-05-21T08:00:00Z",
    user: users[1],
    objectType: "Change",
    objectId: "chg-eco-101",
    objectLabel: "ECO-101",
    action: "Convert",
    before: { sourceEcr: "ECR-002", status: "Approved" },
    after: { type: "ECO", status: "Open" },
  },
  {
    id: "al-009",
    timestamp: "2026-05-20T16:00:00Z",
    user: users[2],
    objectType: "Change",
    objectId: "chg-ecr-002",
    objectLabel: "ECR-002",
    action: "Approve",
    before: { status: "Review" },
    after: { status: "Approved" },
  },
  {
    id: "al-010",
    timestamp: "2026-05-20T14:22:00Z",
    user: users[0],
    objectType: "Document",
    objectId: "mdoc-001",
    objectLabel: "Requirements_Specification.pdf",
    action: "Checkin",
    before: { checkoutStatus: "Checked Out", version: "1.9" },
    after: { checkoutStatus: "Checked In", version: "2.0" },
  },
  {
    id: "al-011",
    timestamp: "2026-05-18T10:00:00Z",
    user: users[4],
    objectType: "Workflow",
    objectId: "wf-inst-001",
    objectLabel: "Engine Release Workflow",
    action: "Submit",
    before: { step: "Draft" },
    after: { step: "Review" },
  },
  {
    id: "al-012",
    timestamp: "2026-05-15T17:00:00Z",
    user: users[0],
    objectType: "Change",
    objectId: "chg-eco-102",
    objectLabel: "ECO-102",
    action: "Close",
    before: { status: "Implemented" },
    after: { status: "Closed" },
  },
];

export const activityFeedSeed: ActivityFeedItem[] = auditLogSeed.map((entry) => ({
  id: `af-${entry.id}`,
  user: entry.user,
  action: `${entry.action} ${entry.objectLabel}`,
  objectType: entry.objectType,
  objectId: entry.objectId,
  objectLabel: entry.objectLabel,
  timestamp: entry.timestamp,
  actionType: entry.action,
}));

const today = new Date("2026-05-25T00:00:00Z");

export function getAuditDashboardStats(logs: AuditLogEntry[]): AuditDashboardStats {
  const isToday = (ts: string) => new Date(ts) >= today;
  return {
    totalActivities: logs.length,
    changesToday: logs.filter(
      (l) => isToday(l.timestamp) && l.objectType === "Change"
    ).length,
    approvalsToday: logs.filter(
      (l) => isToday(l.timestamp) && l.action === "Approve"
    ).length,
    revisionReleases: logs.filter(
      (l) => l.objectType === "Revision" && l.action === "Release"
    ).length,
    documentUpdates: logs.filter(
      (l) => l.objectType === "Document" && ["Update", "Checkin", "Checkout"].includes(l.action)
    ).length,
  };
}

export function filterAuditLogs(
  logs: AuditLogEntry[],
  filters: AuditFilters
): AuditLogEntry[] {
  return logs.filter((entry) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = [
        entry.objectLabel,
        entry.user.name,
        entry.action,
        entry.objectType,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.userId !== "All" && entry.user.id !== filters.userId) return false;
    if (filters.objectType !== "All" && entry.objectType !== filters.objectType)
      return false;
    if (filters.actionType !== "All" && entry.action !== filters.actionType) return false;
    if (filters.dateFrom && entry.timestamp < filters.dateFrom) return false;
    if (filters.dateTo && entry.timestamp > `${filters.dateTo}T23:59:59Z`) return false;
    return true;
  });
}

export function filterActivityFeed(
  items: ActivityFeedItem[],
  filters: AuditFilters
): ActivityFeedItem[] {
  return items.filter((item) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        ![
          item.action,
          item.objectLabel,
          item.user.name,
          item.objectType,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
        return false;
    }
    if (filters.userId !== "All" && item.user.id !== filters.userId) return false;
    if (filters.objectType !== "All" && item.objectType !== filters.objectType)
      return false;
    if (filters.actionType !== "All" && item.actionType !== filters.actionType)
      return false;
    if (filters.dateFrom && item.timestamp < filters.dateFrom) return false;
    if (filters.dateTo && item.timestamp > `${filters.dateTo}T23:59:59Z`) return false;
    return true;
  });
}

export function getObjectHistory(objectId: string): ObjectHistoryRecord | undefined {
  const changes = auditLogSeed.filter((l) => l.objectId === objectId);
  if (changes.length === 0) return undefined;

  const first = changes[0];
  const timeline = activityFeedSeed.filter((a) => a.objectId === objectId);

  const relationships = getObjectRelationships(first.objectType, objectId);

  return {
    objectId,
    objectType: first.objectType,
    objectLabel: first.objectLabel,
    partNumber: first.objectType === "Product" ? "ITEM-1001" : undefined,
    currentState: Object.fromEntries(
      Object.entries(changes[0].after).map(([k, v]) => [k, String(v)])
    ),
    changes,
    relationships,
    timeline,
  };
}

function getObjectRelationships(
  objectType: ObjectHistoryRecord["objectType"],
  objectId: string
) {
  const rels: ObjectHistoryRecord["relationships"] = [];
  if (objectType === "Product" || objectId === "prod-001") {
    rels.push(
      { id: "rel-1", type: "BOM", label: "Engine Assembly BOM", href: "/bom/asm-engine", direction: "child" },
      { id: "rel-2", type: "Document", label: "Requirements_Specification.pdf", href: "/documents", direction: "child" },
      { id: "rel-3", type: "Revision", label: "Engine Assembly Rev C", href: "/revisions/rev-eng-c", direction: "child" },
      { id: "rel-4", type: "Change", label: "ECR-001", href: "/changes/chg-ecr-001", direction: "related" }
    );
  } else if (objectType === "Change") {
    rels.push(
      { id: "rel-5", type: "Product", label: "Engine Assembly", href: "/products/prod-001", direction: "related" },
      { id: "rel-6", type: "BOM", label: "Engine Assembly BOM", href: "/bom/asm-engine", direction: "related" }
    );
  } else if (objectType === "Document") {
    rels.push(
      { id: "rel-7", type: "Product", label: "Engine Assembly", href: "/products/prod-001", direction: "parent" },
      { id: "rel-8", type: "Revision", label: "Engine Assembly Rev C", href: "/revisions/rev-eng-c", direction: "related" }
    );
  }
  return rels;
}

export function getUserActivity(userId: string): UserActivitySummary | undefined {
  const user = users.find((u) => u.id === userId);
  if (!user) return undefined;

  const userItems = activityFeedSeed.filter((a) => a.user.id === userId);

  return {
    userId,
    user,
    createdItems: userItems.filter((a) => a.actionType === "Create"),
    approvals: userItems.filter((a) => a.actionType === "Approve"),
    revisions: userItems.filter((a) => a.objectType === "Revision"),
    changes: userItems.filter((a) => a.objectType === "Change"),
    documents: userItems.filter((a) => a.objectType === "Document"),
  };
}

export function generateComplianceReport(
  type: ComplianceReport["type"],
  logs: AuditLogEntry[],
  from: string,
  to: string,
  generatedBy: (typeof users)[0]
): ComplianceReport {
  const filtered = logs.filter(
    (l) => l.timestamp >= from && l.timestamp <= `${to}T23:59:59Z`
  );

  let rows = filtered;
  if (type === "Change History") {
    rows = filtered.filter((l) => l.objectType === "Change");
  } else if (type === "Approval History") {
    rows = filtered.filter((l) => l.action === "Approve" || l.action === "Reject");
  } else if (type === "Revision History") {
    rows = filtered.filter((l) => l.objectType === "Revision");
  }

  return {
    id: `report-${crypto.randomUUID().slice(0, 8)}`,
    type,
    generatedAt: new Date().toISOString(),
    generatedBy,
    dateRange: { from, to },
    recordCount: rows.length,
    rows: rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      user: r.user.name,
      object: r.objectLabel,
      action: r.action,
      details: Object.entries(r.after)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", "),
    })),
  };
}

export function getFieldDiffs(
  before: Record<string, string | number | boolean | null>,
  after: Record<string, string | number | boolean | null>
) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return Array.from(keys).map((field) => ({
    field,
    before: before[field] != null ? String(before[field]) : "—",
    after: after[field] != null ? String(after[field]) : "—",
    changed: before[field] !== after[field],
  }));
}
