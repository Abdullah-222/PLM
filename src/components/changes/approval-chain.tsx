"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/product-utils";
import type { ChangeApproval } from "@/types/changes";
import type { ApprovalAction } from "@/types";
import { CheckCircle2, Clock, XCircle, RotateCcw } from "lucide-react";

const statusIcons = {
  Pending: Clock,
  Approved: CheckCircle2,
  Rejected: XCircle,
  Rework: RotateCcw,
};

interface ApprovalChainProps {
  changeId: string;
  approvals: ChangeApproval[];
  onAction: (approvalId: string, action: ApprovalAction, comment?: string) => void;
}

export function ApprovalChain({ approvals, onAction }: ApprovalChainProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    approvalId: string;
    action: ApprovalAction;
  } | null>(null);
  const [comment, setComment] = useState("");

  const openAction = (approvalId: string, action: ApprovalAction) => {
    setPendingAction({ approvalId, action });
    setComment("");
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    onAction(pendingAction.approvalId, pendingAction.action, comment || undefined);
    setDialogOpen(false);
    setPendingAction(null);
  };

  return (
    <div className="space-y-4">
      {approvals.map((approval, index) => {
        const Icon = statusIcons[approval.status];
        const isLast = index === approvals.length - 1;

        return (
          <div key={approval.id} className="relative flex gap-4">
            {!isLast && (
              <div className="absolute left-[19px] top-10 h-[calc(100%-8px)] w-px bg-border" />
            )}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                approval.status === "Approved"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : approval.status === "Rejected"
                    ? "border-red-500 bg-red-500/10"
                    : approval.status === "Rework"
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-border bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{approval.role}</p>
                  <p className="text-sm text-muted-foreground">{approval.approver.name}</p>
                </div>
                <StatusBadge status={approval.status} variant="workflow" />
              </div>
              {approval.actedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(approval.actedAt, { dateStyle: "medium", timeStyle: "short" })}
                </p>
              )}
              {approval.comment && (
                <p className="text-sm mt-2 rounded-lg bg-muted/50 p-2">{approval.comment}</p>
              )}
              {approval.status === "Pending" && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => openAction(approval.id, "Approve")}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAction(approval.id, "Request Rework")}
                  >
                    Request Rework
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openAction(approval.id, "Reject")}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction?.action === "Approve"
                ? "Confirm Approval"
                : pendingAction?.action === "Reject"
                  ? "Confirm Rejection"
                  : "Request Rework"}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment..."
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAction}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
