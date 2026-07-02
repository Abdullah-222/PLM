"use client";

import type { AuditObjectType, AuditActionType } from "@/types/audit";
import { SearchInput } from "@/components/shared/search-input";
import { users } from "@/constants/users";
import type { AuditFilters } from "@/types/audit";

const selectClass =
  "h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 min-w-[140px]";

const OBJECT_TYPES: AuditObjectType[] = [
  "Product",
  "Document",
  "BOM",
  "Revision",
  "Change",
  "Workflow",
  "Task",
];

const ACTION_TYPES: AuditActionType[] = [
  "Create",
  "Update",
  "Delete",
  "Approve",
  "Reject",
  "Submit",
  "Release",
  "Link",
  "Unlink",
  "Checkout",
  "Checkin",
  "Convert",
  "Implement",
  "Close",
];

interface AuditFiltersBarProps {
  filters: AuditFilters;
  onChange: (filters: AuditFilters) => void;
  onClear: () => void;
}

export function AuditFiltersBar({ filters, onChange, onClear }: AuditFiltersBarProps) {
  return (
    <div className="sticky top-14 z-10 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-background/95 backdrop-blur-sm border-b border-border space-y-3">
      <SearchInput
        placeholder="Search activity by user, object, or action..."
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
        className="w-full max-w-md"
      />
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filters.userId}
          onChange={(e) => onChange({ ...filters, userId: e.target.value })}
          className={selectClass}
        >
          <option value="All">All Users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <select
          value={filters.objectType}
          onChange={(e) =>
            onChange({
              ...filters,
              objectType: e.target.value as AuditFilters["objectType"],
            })
          }
          className={selectClass}
        >
          <option value="All">All Object Types</option>
          {OBJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={filters.actionType}
          onChange={(e) =>
            onChange({
              ...filters,
              actionType: e.target.value as AuditFilters["actionType"],
            })
          }
          className={selectClass}
        >
          <option value="All">All Actions</option>
          {ACTION_TYPES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          className={selectClass}
          title="From date"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          className={selectClass}
          title="To date"
        />
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
