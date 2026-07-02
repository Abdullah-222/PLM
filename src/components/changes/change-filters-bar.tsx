"use client";

import type { ChangeFilters } from "@/types/changes";
import type { Priority } from "@/types";
import { SearchInput } from "@/components/shared/search-input";
import { users } from "@/constants/users";

const selectClass =
  "h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 min-w-[140px]";

const ECR_STATUSES = ["Draft", "Submitted", "Review", "Approved", "Rejected", "Converted"] as const;
const ECO_STATUSES = ["Open", "In Progress", "Implemented", "Closed"] as const;
const ALL_STATUSES = [...ECR_STATUSES, ...ECO_STATUSES];

interface ChangeFiltersBarProps {
  filters: ChangeFilters;
  onChange: (filters: ChangeFilters) => void;
  onClear: () => void;
}

export function ChangeFiltersBar({ filters, onChange, onClear }: ChangeFiltersBarProps) {
  return (
    <div className="sticky top-14 z-10 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-background/95 backdrop-blur-sm border-b border-border space-y-3">
      <SearchInput
        placeholder="Search changes by ID, title, or affected item..."
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
        className="w-full max-w-md"
      />
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as ChangeFilters["status"] })
          }
          className={selectClass}
        >
          <option value="All">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) =>
            onChange({ ...filters, priority: e.target.value as Priority | "All" })
          }
          className={selectClass}
        >
          <option value="All">All Priorities</option>
          {(["Critical", "High", "Medium", "Low"] as const).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={filters.type}
          onChange={(e) =>
            onChange({
              ...filters,
              type: e.target.value as ChangeFilters["type"],
            })
          }
          className={selectClass}
        >
          <option value="All">All Types</option>
          <option value="ECR">ECR</option>
          <option value="ECO">ECO</option>
          <option value="ECN">ECN</option>
        </select>
        <select
          value={filters.ownerId}
          onChange={(e) => onChange({ ...filters, ownerId: e.target.value })}
          className={selectClass}
        >
          <option value="All">All Owners</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
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
