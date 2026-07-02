"use client";

import { useCadStore } from "@/store/cad-store";
import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CadFilters } from "@/types/cad";

interface CadSearchProps {
  filters: CadFilters;
  onChange: (filters: CadFilters) => void;
  onClear: () => void;
}

export function CadSearch({ filters, onChange, onClear }: CadSearchProps) {
  const { files, folders } = useCadStore();

  // Get unique software values
  const softwareOptions = ["All", ...Array.from(new Set(files.map((f) => f.software)))];
  // Get unique file types
  const fileTypes = ["All", ...Array.from(new Set(files.map((f) => f.type)))];
  // Get unique owners
  const owners = Array.from(new Map(files.map((f) => [f.owner.id, f.owner])).values());
  // Get unique statuses
  const statuses = ["All", "Draft", "In Review", "Released", "Obsolete", "Frozen", "Archived"];
  // Get unique revisions
  const revisions = ["All", ...Array.from(new Set(files.map((f) => f.currentRevision))).sort()];

  const handleFilterChange = (key: keyof CadFilters, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 text-xs space-y-3 shadow-sm">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Search CAD models by file name, part number, project, tags..."
            className="pl-8 h-8 text-xs bg-muted/20"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange("search", "")}
              className="absolute right-2.5 top-2 h-4 w-4 flex items-center justify-center rounded hover:bg-muted text-muted-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-3 w-3" />
          Reset Filters
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* File Type Filter */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">File Type</label>
          <select
            value={filters.fileType}
            onChange={(e) => handleFilterChange("fileType", e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {fileTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Software Filter */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Software</label>
          <select
            value={filters.software}
            onChange={(e) => handleFilterChange("software", e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {softwareOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Lifecycle Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Revision Filter */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Revision</label>
          <select
            value={filters.revision}
            onChange={(e) => handleFilterChange("revision", e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {revisions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Owner Filter */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Owner</label>
          <select
            value={filters.ownerId}
            onChange={(e) => handleFilterChange("ownerId", e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="All">All Owners</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
