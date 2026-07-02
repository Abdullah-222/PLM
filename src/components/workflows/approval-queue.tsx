"use client";

import { Button } from "@/components/ui/button";
import type { ApprovalAction, ApprovalItem } from "@/types";

export function ApprovalQueue({
  approvals,
  onAction,
}: {
  approvals: ApprovalItem[];
  onAction: (id: string, action: ApprovalAction) => void;
}) {
  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full min-w-[940px] text-sm">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {["Item", "Workflow", "Current Step", "Assigned User", "Due Date", "Priority", "Status", "Actions"].map(
              (column) => (
                <th key={column} className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  {column}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {approvals.map((approval) => (
            <tr key={approval.id} className="border-b border-border/70">
              <td className="px-3 py-2">{approval.item}</td>
              <td className="px-3 py-2">{approval.workflowName}</td>
              <td className="px-3 py-2">{approval.currentStep}</td>
              <td className="px-3 py-2">{approval.assignedUser}</td>
              <td className="px-3 py-2">{new Date(approval.dueDate).toLocaleDateString()}</td>
              <td className="px-3 py-2">{approval.priority}</td>
              <td className="px-3 py-2">{approval.status}</td>
              <td className="px-3 py-2">
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => onAction(approval.id, "Approve")}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onAction(approval.id, "Request Rework")}>
                    Rework
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onAction(approval.id, "Reject")}>
                    Reject
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
