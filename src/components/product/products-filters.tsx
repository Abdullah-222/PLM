"use client";

import { SearchInput } from "@/components/shared/search-input";
import {
  LIFECYCLE_FILTER_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  type ProductFilters,
} from "@/lib/product-utils";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface ProductsFiltersProps {
  filters: ProductFilters;
  owners: User[];
  onChange: (filters: ProductFilters) => void;
  className?: string;
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 min-w-[140px]"
      >
        {children}
      </select>
    </div>
  );
}

export function ProductsFilters({
  filters,
  owners,
  onChange,
  className,
}: ProductsFiltersProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <SearchInput
        placeholder="Search products by ID, name, type, or owner..."
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
        className="w-full max-w-md"
      />
      <div className="flex flex-wrap gap-3">
        <FilterSelect
          label="Lifecycle State"
          value={filters.lifecycleState}
          onChange={(lifecycleState) =>
            onChange({
              ...filters,
              lifecycleState: lifecycleState as ProductFilters["lifecycleState"],
            })
          }
        >
          {LIFECYCLE_FILTER_OPTIONS.map((state) => (
            <option key={state} value={state}>
              {state === "In Review" ? "Review" : state}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="Product Type"
          value={filters.productType}
          onChange={(productType) =>
            onChange({
              ...filters,
              productType: productType as ProductFilters["productType"],
            })
          }
        >
          {PRODUCT_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="Owner"
          value={filters.ownerId}
          onChange={(ownerId) => onChange({ ...filters, ownerId })}
        >
          <option value="All">All Owners</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name}
            </option>
          ))}
        </FilterSelect>
      </div>
    </div>
  );
}
