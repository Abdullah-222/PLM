"use client";

import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import { SectionHeader } from "@/components/shared/section-header";
import { formatDate, getInitials } from "@/lib/product-utils";
import type { ReleasePackage } from "@/types/revisions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, FileText, Network, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReleasePackageCardProps {
  releasePackage: ReleasePackage;
}

export function ReleasePackageCard({ releasePackage }: ReleasePackageCardProps) {
  return (
    <div className="space-y-4">
      <AppCard>
        <AppCardHeader>
          <SectionHeader title="Revision Notes" />
        </AppCardHeader>
        <AppCardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {releasePackage.revisionNotes}
          </p>
        </AppCardContent>
      </AppCard>

      <AppCard>
        <AppCardHeader>
          <SectionHeader
            title="Released Documents"
            description={`${releasePackage.documents.length} documents in release package`}
          />
        </AppCardHeader>
        <AppCardContent>
          <div className="space-y-2">
            {releasePackage.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.type}</p>
                </div>
                <Badge variant="outline" className="font-mono text-xs shrink-0">
                  v{doc.version}
                </Badge>
              </div>
            ))}
          </div>
        </AppCardContent>
      </AppCard>

      <AppCard>
        <AppCardHeader>
          <SectionHeader title="Released BOM" />
        </AppCardHeader>
        <AppCardContent>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Network className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{releasePackage.bomSummary}</p>
              <p className="text-xs text-muted-foreground">
                {releasePackage.bomItemCount} total items
              </p>
            </div>
          </div>
        </AppCardContent>
      </AppCard>

      <AppCard>
        <AppCardHeader>
          <SectionHeader title="Approvals" />
        </AppCardHeader>
        <AppCardContent>
          <div className="space-y-2">
            {releasePackage.approvals.map((approval) => (
              <div
                key={approval.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-muted">
                    {getInitials(approval.approver.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{approval.approver.name}</p>
                  <p className="text-xs text-muted-foreground">{approval.role}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {approval.status === "Approved" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {approval.status === "Pending" && (
                    <Clock className="h-4 w-4 text-amber-600" />
                  )}
                  {approval.status === "Rejected" && (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      approval.status === "Approved" &&
                        "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300",
                      approval.status === "Pending" &&
                        "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300"
                    )}
                  >
                    {approval.status}
                  </Badge>
                </div>
                {approval.date && (
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {formatDate(approval.date)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </AppCardContent>
      </AppCard>
    </div>
  );
}
