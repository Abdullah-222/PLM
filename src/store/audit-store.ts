import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  activityFeedSeed,
  auditLogSeed,
  generateComplianceReport,
} from "@/constants/audit-data";
import { currentUser } from "@/constants/users";
import type {
  ActivityFeedItem,
  AuditLogEntry,
  ComplianceReport,
  ComplianceReportType,
} from "@/types/audit";

interface AuditState {
  auditLogs: AuditLogEntry[];
  activityFeed: ActivityFeedItem[];
  reports: ComplianceReport[];
  appendLog: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  appendActivity: (item: Omit<ActivityFeedItem, "id" | "timestamp">) => void;
  generateReport: (type: ComplianceReportType, from: string, to: string) => ComplianceReport;
}

const id = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      auditLogs: auditLogSeed,
      activityFeed: activityFeedSeed,
      reports: [],

      appendLog: (entry) => {
        const log: AuditLogEntry = {
          ...entry,
          id: id("al"),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ auditLogs: [log, ...state.auditLogs] }));
        get().appendActivity({
          user: entry.user,
          action: `${entry.action} ${entry.objectLabel}`,
          objectType: entry.objectType,
          objectId: entry.objectId,
          objectLabel: entry.objectLabel,
          actionType: entry.action,
        });
      },

      appendActivity: (item) => {
        const activity: ActivityFeedItem = {
          ...item,
          id: id("af"),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ activityFeed: [activity, ...state.activityFeed] }));
      },

      generateReport: (type, from, to) => {
        const report = generateComplianceReport(
          type,
          get().auditLogs,
          from,
          to,
          currentUser
        );
        set((state) => ({ reports: [report, ...state.reports] }));
        return report;
      },
    }),
    { name: "plm-audit-store" }
  )
);
