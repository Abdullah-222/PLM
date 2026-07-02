"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { SectionHeader } from "@/components/shared/section-header";
import { formatDate } from "@/lib/product-utils";
import type { ChangeRequest } from "@/types";

interface ChangesTableProps {
  changes: ChangeRequest[];
}

export function ChangesTable({ changes }: ChangesTableProps) {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Change Requests"
        description="Engineering change requests and orders"
      />
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {changes.map((change) => (
                <tr
                  key={change.id}
                  className="hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                      {change.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{change.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {change.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={change.priority} variant="priority" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={change.status} variant="workflow" />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {change.requestedBy.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(change.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
