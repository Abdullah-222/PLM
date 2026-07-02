"use client";

import { Fragment, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { TablePagination } from "@/components/product/table-pagination";
import { FieldComparisonView } from "./field-comparison-view";
import { formatDate } from "@/lib/product-utils";
import type { AuditLogEntry } from "@/types/audit";
import { Shield, ChevronDown, ChevronRight } from "lucide-react";

interface AuditTableProps {
  logs: AuditLogEntry[];
  loading?: boolean;
}

export function AuditTable({ logs, loading }: AuditTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const paged = logs.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  if (loading) {
    return (
      <div className="rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
        Loading audit logs...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={Shield}
        title="No audit entries"
        description="No log entries match your filters."
      />
    );
  }

  return (
    <div className="space-y-0">
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-8 px-2" />
              {["Timestamp", "User", "Object", "Action", "Before", "After"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.map((log) => {
              const isOpen = expanded.has(log.id);
              const beforeSummary = Object.entries(log.before)
                .slice(0, 1)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ") || "—";
              const afterSummary = Object.entries(log.after)
                .slice(0, 1)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ") || "—";

              return (
                <Fragment key={log.id}>
                  <tr
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => toggle(log.id)}
                  >
                    <td className="px-2 py-2 text-muted-foreground">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                      {formatDate(log.timestamp, { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-3 py-2">{log.user.name}</td>
                    <td className="px-3 py-2">
                      <span className="font-medium">{log.objectLabel}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({log.objectType})
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs max-w-[140px] truncate">
                      {beforeSummary}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs max-w-[140px] truncate">
                      {afterSummary}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-muted/20">
                        <FieldComparisonView before={log.before} after={log.after} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <TablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalRows={logs.length}
        onPageChange={setPageIndex}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageIndex(0);
        }}
      />
    </div>
  );
}
