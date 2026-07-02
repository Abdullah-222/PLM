"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TablePagination } from "@/components/product/table-pagination";
import { formatDate } from "@/lib/product-utils";
import type { EngineeringChange, ChangeSortField } from "@/types/changes";
import type { Priority } from "@/types";
import { ClipboardList, ArrowUpDown } from "lucide-react";

const priorityOrder: Record<Priority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

interface ChangeTableProps {
  changes: EngineeringChange[];
  loading?: boolean;
  onClearFilters?: () => void;
}

export function ChangeTable({ changes, loading, onClearFilters }: ChangeTableProps) {
  const [sortField, setSortField] = useState<ChangeSortField>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const sorted = useMemo(() => {
    const copy = [...changes];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "changeNumber":
          cmp = a.changeNumber.localeCompare(b.changeNumber);
          break;
        case "type":
          cmp = a.type.localeCompare(b.type);
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "priority":
          cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [changes, sortField, sortDir]);

  const paged = sorted.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const toggleSort = (field: ChangeSortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortHeader = ({ field, label }: { field: ChangeSortField; label: string }) => (
    <button
      type="button"
      onClick={() => toggleSort(field)}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
        Loading changes...
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No changes found"
        description="Try adjusting your filters or create a new change request."
        action={
          onClearFilters
            ? { label: "Clear filters", onClick: onClearFilters }
            : undefined
        }
      />
    );
  }

  const affectedLabel = (change: EngineeringChange) => {
    const first = change.affectedObjects[0];
    if (!first) return "—";
    const extra = change.affectedObjects.length > 1 ? ` +${change.affectedObjects.length - 1}` : "";
    return `${first.label}${extra}`;
  };

  return (
    <div className="space-y-0">
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <SortHeader field="changeNumber" label="Change ID" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <SortHeader field="type" label="Type" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <SortHeader field="title" label="Title" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Affected Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <SortHeader field="priority" label="Priority" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <SortHeader field="status" label="Status" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <SortHeader field="createdAt" label="Created Date" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.map((change) => (
                <tr
                  key={change.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/changes/${change.id}`}
                      className="font-mono text-xs bg-muted px-2 py-0.5 rounded hover:underline"
                    >
                      {change.changeNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {change.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/changes/${change.id}`} className="hover:underline">
                      <p className="text-sm font-medium">{change.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {change.description}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {affectedLabel(change)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={change.priority} variant="priority" />
                  </td>
                  <td className="px-4 py-3 text-sm">{change.owner.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={change.status} variant="workflow" />
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
      <TablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalRows={sorted.length}
        onPageChange={setPageIndex}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageIndex(0);
        }}
      />
    </div>
  );
}
