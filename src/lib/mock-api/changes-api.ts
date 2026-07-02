import { engineeringChangesSeed } from "@/constants/changes-data";
import { auditLogSeed, activityFeedSeed } from "@/constants/audit-data";
import type { EngineeringChange, ChangeWizardInput } from "@/types/changes";
import type { AuditLogEntry, ActivityFeedItem } from "@/types/audit";

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export async function fetchChanges(): Promise<EngineeringChange[]> {
  await wait();
  return deepClone(engineeringChangesSeed);
}

export async function fetchChangeById(id: string): Promise<EngineeringChange | null> {
  await wait(200);
  const change = engineeringChangesSeed.find((c) => c.id === id);
  return change ? deepClone(change) : null;
}

export async function submitChange(input: ChangeWizardInput): Promise<{ id: string }> {
  await wait(400);
  return { id: `chg-${crypto.randomUUID().slice(0, 8)}` };
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  await wait();
  return deepClone(auditLogSeed);
}

export async function fetchActivityFeed(): Promise<ActivityFeedItem[]> {
  await wait();
  return deepClone(activityFeedSeed);
}
