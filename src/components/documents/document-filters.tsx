"use client";

import { SearchInput } from "@/components/shared/search-input";
import type { DocumentFilters } from "@/types/documents";
import type { DocumentFileType } from "@/types/documents";
import type { LifecycleState } from "@/types";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

const FILE_TYPES: (DocumentFileType | "All")[] = [
  "All",
  "PDF",
  "CAD",
  "STEP",
  "SLDPRT",
  "DWG",
  "DOCX",
  "XLSX",
];

const STATUS_OPTIONS: (LifecycleState | "All")[] = [
  "All",
  "Draft",
  "In Review",
  "Released",
  "Obsolete",
];

interface DocumentFiltersBarProps {
  filters: DocumentFilters;
  products: { id: string; name: string; partNumber: string }[];
  owners: User[];
  onChange: (filters: DocumentFilters) => void;
  className?: string;
}

const selectClass =
  "h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 min-w-[130px]";

export function DocumentFiltersBar({
  filters,
  products,
  owners,
  onChange,
  className,
}: DocumentFiltersBarProps) {
  return (
    <div
      className={cn(
        "sticky top-14 z-10 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-background/95 backdrop-blur-sm border-b border-border space-y-3",
        className
      )}
    >
      <SearchInput
        placeholder="Search documents by name, ID, or product..."
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
        className="w-full max-w-md"
      />
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.productId}
          onChange={(e) =>
            onChange({ ...filters, productId: e.target.value })
          }
          className={selectClass}
        >
          <option value="All">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.partNumber} — {p.name}
            </option>
          ))}
        </select>
        <select
          value={filters.fileType}
          onChange={(e) =>
            onChange({
              ...filters,
              fileType: e.target.value as DocumentFilters["fileType"],
            })
          }
          className={selectClass}
        >
          {FILE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "All" ? "All Types" : t}
            </option>
          ))}
        </select>
        <select
          value={filters.ownerId}
          onChange={(e) => onChange({ ...filters, ownerId: e.target.value })}
          className={selectClass}
        >
          <option value="All">All Owners</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value as DocumentFilters["status"],
            })
          }
          className={selectClass}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "In Review" ? "Review" : s === "All" ? "All Status" : s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
