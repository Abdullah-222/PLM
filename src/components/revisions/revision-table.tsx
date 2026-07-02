"use client";

import { ProductStatusBadge } from "@/components/product/product-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, getInitials } from "@/lib/product-utils";
import type { RevisionRecord } from "@/types/revisions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GitBranch, Package } from "lucide-react";
import Link from "next/link";

interface RevisionTableProps {
  revisions: RevisionRecord[];
  loading?: boolean;
  onClearFilters?: () => void;
}

export function RevisionTable({
  revisions,
  loading = false,
  onClearFilters,
}: RevisionTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border px-4 py-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (revisions.length === 0) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No revisions found"
        description="Try adjusting your search or filter criteria"
        action={
          onClearFilters
            ? { label: "Clear Filters", onClick: onClearFilters }
            : undefined
        }
      />
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {[
                "Object",
                "Revision",
                "State",
                "Owner",
                "Release Date",
                "Created Date",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {revisions.map((rev) => (
              <tr
                key={rev.id}
                className="bg-card hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 min-w-[180px]">
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{rev.objectName}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {rev.objectPartNumber}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="font-mono font-bold">
                    Rev {rev.revision}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <ProductStatusBadge status={rev.state} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-muted">
                        {getInitials(rev.owner.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{rev.owner.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {rev.releaseDate
                    ? formatDate(rev.releaseDate)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(rev.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/revisions/${rev.id}`}
                    className="inline-flex h-7 items-center rounded-lg px-2.5 text-xs font-medium hover:bg-muted transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
