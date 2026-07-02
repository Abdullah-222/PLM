"use client";

import { Button } from "@/components/ui/button";
import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import { formatDate } from "@/lib/product-utils";
import type { ECNNotice, EngineeringChange } from "@/types/changes";
import { FileText, Send, Users } from "lucide-react";

interface EcnPanelProps {
  change: EngineeringChange;
  ecnNotices: ECNNotice[];
  onGenerateEcn: (ecoId: string) => void;
}

export function EcnPanel({ change, ecnNotices, onGenerateEcn }: EcnPanelProps) {
  const relatedNotices = ecnNotices.filter((n) => n.ecoId === change.id);
  const canGenerate =
    change.type === "ECO" &&
    (change.status === "Implemented" || change.status === "In Progress") &&
    relatedNotices.length === 0;

  return (
    <div className="space-y-4">
      {change.type === "ECR" && (
        <div className="rounded-lg border border-border p-4 text-sm space-y-2">
          <p className="font-medium">ECR Status Transitions</p>
          <p className="text-muted-foreground">
            Current: <span className="font-medium text-foreground">{change.status}</span>
          </p>
          {change.status === "Approved" && !change.convertedEcoId && (
            <p className="text-xs text-muted-foreground">
              This ECR is approved and ready for conversion to an ECO from the detail page
              actions.
            </p>
          )}
          {change.convertedEcoId && (
            <p className="text-xs text-emerald-600">
              Converted to ECO — see linked change order.
            </p>
          )}
        </div>
      )}

      {change.type === "ECO" && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              ECO statuses: Open → In Progress → Implemented → Closed
            </p>
            {canGenerate && (
              <Button size="sm" className="gap-1.5" onClick={() => onGenerateEcn(change.id)}>
                <Send className="h-4 w-4" />
                Generate ECN
              </Button>
            )}
          </div>

          {relatedNotices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No ECN issued yet. Generate a notice from an approved ECO.
            </div>
          ) : (
            relatedNotices.map((notice) => (
              <AppCard key={notice.id}>
                <AppCardHeader>
                  <div>
                    <h3 className="font-semibold">{notice.ecnNumber}</h3>
                    <p className="text-sm text-muted-foreground">{notice.title}</p>
                  </div>
                </AppCardHeader>
                <AppCardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{notice.status}</span>
                    <span className="text-muted-foreground ml-4">Issued:</span>
                    <span>{formatDate(notice.issuedAt, { dateStyle: "long" })}</span>
                  </div>
                  <p className="text-sm">{notice.message}</p>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Recipients</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {notice.recipients.map((r) => (
                        <span
                          key={r.id}
                          className="text-xs bg-muted px-2 py-1 rounded-full"
                        >
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Affected Items</p>
                    <ul className="space-y-1">
                      {notice.affectedItems.map((item) => (
                        <li
                          key={item.id}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            {item.type}
                          </span>
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AppCardContent>
              </AppCard>
            ))
          )}
        </>
      )}
    </div>
  );
}
