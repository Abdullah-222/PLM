import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ecnNoticesSeed,
  engineeringChangesSeed,
} from "@/constants/changes-data";
import { users, currentUser } from "@/constants/users";
import type {
  AffectedObject,
  AffectedObjectType,
  ChangeApproval,
  ChangeStatus,
  ChangeTask,
  ChangeTimelineEvent,
  ChangeWizardInput,
  ECNNotice,
  EngineeringChange,
  EngineeringChangeType,
  ImpactAssessment,
} from "@/types/changes";
import type { ApprovalAction, Priority, WorkflowTaskStatus } from "@/types";

interface ChangesState {
  changes: EngineeringChange[];
  ecnNotices: ECNNotice[];
  createChange: (input: ChangeWizardInput) => string;
  createEcr: () => string;
  createEco: (fromEcrId?: string) => string;
  updateChange: (id: string, patch: Partial<EngineeringChange>) => void;
  transitionStatus: (id: string, status: ChangeStatus) => void;
  linkObject: (
    changeId: string,
    type: AffectedObjectType,
    objectId: string,
    label: string,
    meta?: Partial<AffectedObject>
  ) => void;
  unlinkObject: (changeId: string, affectedObjectId: string) => void;
  updateImpact: (changeId: string, impact: Partial<ImpactAssessment>) => void;
  applyApprovalAction: (
    changeId: string,
    approvalId: string,
    action: ApprovalAction,
    comment?: string
  ) => void;
  createTask: (
    changeId: string,
    title: string,
    description: string,
    assigneeId: string,
    dueDate: string,
    priority: Priority
  ) => void;
  assignTask: (changeId: string, taskId: string, assigneeId: string) => void;
  completeTask: (changeId: string, taskId: string) => void;
  convertEcrToEco: (ecrId: string) => string;
  generateEcn: (ecoId: string) => string;
  exportChanges: () => string;
}

const id = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const nextNumber = (type: EngineeringChangeType, existing: EngineeringChange[]) => {
  const prefix = type;
  const nums = existing
    .filter((c) => c.type === type)
    .map((c) => parseInt(c.changeNumber.split("-")[1] ?? "0", 10))
    .filter((n) => !Number.isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${String(next).padStart(type === "ECN" ? 3 : 3, "0")}`;
};

const defaultApprovals = (): ChangeApproval[] => [
  { id: id("ap"), role: "Engineering Manager", approver: users[4], status: "Pending" },
  { id: id("ap"), role: "QA Manager", approver: users[2], status: "Pending" },
  { id: id("ap"), role: "Product Owner", approver: users[4], status: "Pending" },
];

const appendTimeline = (
  timeline: ChangeTimelineEvent[],
  changeId: string,
  type: ChangeTimelineEvent["type"],
  user = currentUser,
  note?: string
): ChangeTimelineEvent[] => [
  {
    id: id("tl"),
    changeId,
    type,
    user,
    timestamp: new Date().toISOString(),
    note,
  },
  ...timeline,
];

const getInitialStatus = (type: EngineeringChangeType): ChangeStatus => {
  if (type === "ECO") return "Open";
  if (type === "ECN") return "Draft";
  return "Draft";
};

export const useChangesStore = create<ChangesState>()(
  persist(
    (set, get) => ({
      changes: engineeringChangesSeed,
      ecnNotices: ecnNoticesSeed,

      createChange: (input) => {
        const changeId = id("chg");
        const changeNumber = nextNumber(input.type, get().changes);
        const owner = users.find((u) => u.id === input.ownerId) ?? currentUser;
        const now = new Date().toISOString();

        const newChange: EngineeringChange = {
          id: changeId,
          changeNumber,
          type: input.type,
          title: input.title,
          description: input.description,
          reason: input.reason,
          priority: input.priority,
          owner,
          status: getInitialStatus(input.type),
          createdAt: now,
          updatedAt: now,
          dueDate: input.dueDate,
          affectedObjects: input.affectedObjects.map((ao) => ({
            ...ao,
            id: id("ao"),
            linkedAt: now,
          })),
          impact: input.impact,
          approvals: defaultApprovals(),
          tasks: [],
          timeline: [
            {
              id: id("tl"),
              changeId,
              type: "Created",
              user: owner,
              timestamp: now,
            },
          ],
        };

        set((state) => ({ changes: [newChange, ...state.changes] }));
        return changeId;
      },

      createEcr: () => {
        return get().createChange({
          type: "ECR",
          title: "New Engineering Change Request",
          description: "",
          reason: "",
          priority: "Medium",
          ownerId: currentUser.id,
          affectedObjects: [],
          impact: {
            costImpact: 0,
            scheduleImpactDays: 0,
            riskLevel: "Low",
            notes: "",
          },
        });
      },

      createEco: (fromEcrId) => {
        if (fromEcrId) {
          return get().convertEcrToEco(fromEcrId);
        }
        return get().createChange({
          type: "ECO",
          title: "New Engineering Change Order",
          description: "",
          reason: "",
          priority: "Medium",
          ownerId: currentUser.id,
          affectedObjects: [],
          impact: {
            costImpact: 0,
            scheduleImpactDays: 0,
            riskLevel: "Low",
            notes: "",
          },
        });
      },

      updateChange: (idValue, patch) =>
        set((state) => ({
          changes: state.changes.map((c) =>
            c.id === idValue
              ? { ...c, ...patch, updatedAt: new Date().toISOString() }
              : c
          ),
        })),

      transitionStatus: (idValue, status) =>
        set((state) => ({
          changes: state.changes.map((c) => {
            if (c.id !== idValue) return c;
            const timelineType: ChangeTimelineEvent["type"] | null =
              status === "Submitted"
                ? "Submitted"
                : status === "Approved"
                  ? "Approved"
                  : status === "Rejected"
                    ? "Rejected"
                    : status === "Implemented"
                      ? "Implemented"
                      : status === "Closed"
                        ? "Closed"
                        : status === "Converted"
                          ? "Converted"
                          : status === "Review"
                            ? "Reviewed"
                            : null;
            return {
              ...c,
              status,
              updatedAt: new Date().toISOString(),
              timeline: timelineType
                ? appendTimeline(c.timeline, c.id, timelineType)
                : c.timeline,
            };
          }),
        })),

      linkObject: (changeId, type, objectId, label, meta) =>
        set((state) => ({
          changes: state.changes.map((c) => {
            if (c.id !== changeId) return c;
            if (c.affectedObjects.some((o) => o.objectId === objectId && o.type === type))
              return c;
            const newObj: AffectedObject = {
              id: id("ao"),
              type,
              objectId,
              label,
              linkedAt: new Date().toISOString(),
              ...meta,
            };
            return {
              ...c,
              affectedObjects: [...c.affectedObjects, newObj],
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      unlinkObject: (changeId, affectedObjectId) =>
        set((state) => ({
          changes: state.changes.map((c) =>
            c.id === changeId
              ? {
                  ...c,
                  affectedObjects: c.affectedObjects.filter(
                    (o) => o.id !== affectedObjectId
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        })),

      updateImpact: (changeId, impact) =>
        set((state) => ({
          changes: state.changes.map((c) =>
            c.id === changeId
              ? {
                  ...c,
                  impact: { ...c.impact, ...impact },
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        })),

      applyApprovalAction: (changeId, approvalId, action, comment) =>
        set((state) => ({
          changes: state.changes.map((c) => {
            if (c.id !== changeId) return c;
            const approvals: ChangeApproval[] = c.approvals.map((a) => {
              if (a.id !== approvalId) return a;
              const status: ChangeApproval["status"] =
                action === "Approve"
                  ? "Approved"
                  : action === "Reject"
                    ? "Rejected"
                    : "Rework";
              return {
                ...a,
                status,
                actedAt: new Date().toISOString(),
                comment,
              };
            });

            const allApproved = approvals.every((a) => a.status === "Approved");
            const anyRejected = approvals.some((a) => a.status === "Rejected");
            let newStatus = c.status;
            let timeline = c.timeline;

            if (anyRejected) {
              newStatus = "Rejected";
              timeline = appendTimeline(timeline, c.id, "Rejected", currentUser, comment);
            } else if (allApproved) {
              newStatus = c.type === "ECO" ? "In Progress" : "Approved";
              timeline = appendTimeline(timeline, c.id, "Approved");
            } else if (action === "Request Rework") {
              newStatus = c.type === "ECR" ? "Review" : c.status;
              timeline = appendTimeline(
                timeline,
                c.id,
                "Reviewed",
                currentUser,
                "Rework requested"
              );
            }

            return {
              ...c,
              approvals,
              status: newStatus,
              timeline,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      createTask: (changeId, title, description, assigneeId, dueDate, priority) =>
        set((state) => ({
          changes: state.changes.map((c) => {
            if (c.id !== changeId) return c;
            const assignee = users.find((u) => u.id === assigneeId) ?? currentUser;
            const task: ChangeTask = {
              id: id("ct"),
              changeId,
              title,
              description,
              assignee,
              dueDate,
              priority,
              status: "Pending",
              createdAt: new Date().toISOString(),
            };
            return { ...c, tasks: [...c.tasks, task], updatedAt: new Date().toISOString() };
          }),
        })),

      assignTask: (changeId, taskId, assigneeId) =>
        set((state) => ({
          changes: state.changes.map((c) => {
            if (c.id !== changeId) return c;
            const assignee = users.find((u) => u.id === assigneeId) ?? currentUser;
            return {
              ...c,
              tasks: c.tasks.map((t) =>
                t.id === taskId ? { ...t, assignee, status: "In Progress" as WorkflowTaskStatus } : t
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      completeTask: (changeId, taskId) =>
        set((state) => ({
          changes: state.changes.map((c) => {
            if (c.id !== changeId) return c;
            return {
              ...c,
              tasks: c.tasks.map((t) =>
                t.id === taskId ? { ...t, status: "Completed" as WorkflowTaskStatus } : t
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      convertEcrToEco: (ecrId) => {
        const ecr = get().changes.find((c) => c.id === ecrId);
        if (!ecr || ecr.type !== "ECR" || ecr.status !== "Approved") return "";

        const ecoId = get().createChange({
          type: "ECO",
          title: `Implement: ${ecr.title}`,
          description: ecr.description,
          reason: `Converted from ${ecr.changeNumber}`,
          priority: ecr.priority,
          ownerId: ecr.owner.id,
          dueDate: ecr.dueDate,
          affectedObjects: ecr.affectedObjects.map(({ type, objectId, label, partNumber, revision }) => ({
            type,
            objectId,
            label,
            partNumber,
            revision,
          })),
          impact: { ...ecr.impact },
        });

        set((state) => ({
          changes: state.changes.map((c) => {
            if (c.id === ecrId) {
              return {
                ...c,
                status: "Converted" as ChangeStatus,
                convertedEcoId: ecoId,
                timeline: appendTimeline(
                  c.timeline,
                  c.id,
                  "Converted",
                  currentUser,
                  `Converted to ${state.changes.find((x) => x.id === ecoId)?.changeNumber ?? "ECO"}`
                ),
              };
            }
            if (c.id === ecoId) {
              return {
                ...c,
                parentEcrId: ecrId,
                timeline: appendTimeline(
                  c.timeline,
                  c.id,
                  "Created",
                  currentUser,
                  `Converted from ${ecr.changeNumber}`
                ),
              };
            }
            return c;
          }),
        }));

        return ecoId;
      },

      generateEcn: (ecoId) => {
        const eco = get().changes.find((c) => c.id === ecoId);
        if (!eco || eco.type !== "ECO") return "";

        const ecnNumber = nextNumber("ECN", get().changes as EngineeringChange[]);
        const ecnId = id("ecn");
        const notice: ECNNotice = {
          id: ecnId,
          ecnNumber: ecnNumber.replace("ECN", "ECN"),
          ecoId,
          ecoNumber: eco.changeNumber,
          title: `Change Notice: ${eco.title}`,
          recipients: [users[3], users[4], users[2]],
          issuedAt: new Date().toISOString(),
          affectedItems: eco.affectedObjects,
          status: "Issued",
          message: `Engineering Change Notice for ${eco.changeNumber}. ${eco.description}`,
        };

        set((state) => ({
          ecnNotices: [notice, ...state.ecnNotices],
          changes: state.changes.map((c) =>
            c.id === ecoId
              ? {
                  ...c,
                  timeline: appendTimeline(c.timeline, c.id, "ECN Issued", currentUser, ecnNumber),
                }
              : c
          ),
        }));

        return ecnId;
      },

      exportChanges: () => {
        const data = get().changes;
        const headers = [
          "Change ID",
          "Type",
          "Title",
          "Priority",
          "Owner",
          "Status",
          "Created Date",
        ];
        const rows = data.map((c) =>
          [
            c.changeNumber,
            c.type,
            c.title,
            c.priority,
            c.owner.name,
            c.status,
            c.createdAt,
          ].join(",")
        );
        return [headers.join(","), ...rows].join("\n");
      },
    }),
    { name: "plm-changes-store" }
  )
);

export function getAllChanges(): EngineeringChange[] {
  return useChangesStore.getState().changes;
}
