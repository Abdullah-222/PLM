"use client";

import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { SearchInput } from "@/components/shared/search-input";
import {
  RevisionCompareCard,
  RevisionTable,
} from "@/components/revisions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  filterRevisions,
  getRevisionComparison,
  getUniqueRevisionObjects,
  getUniqueRevisionOwners,
  revisionRecords,
} from "@/constants/revisions-data";
import type { RevisionFilters } from "@/types/revisions";
import type { LifecycleState } from "@/types";
import { GitBranch, GitCompareArrows, Plus } from "lucide-react";

const defaultFilters: RevisionFilters = {
  search: "",
  state: "All",
  ownerId: "All",
  objectId: "All",
};

const selectClass =
  "h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 min-w-[140px]";

export default function RevisionsPage() {
  const [filters, setFilters] = useState<RevisionFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  const objects = useMemo(() => getUniqueRevisionObjects(), []);
  const owners = useMemo(() => getUniqueRevisionOwners(), []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(
    () => filterRevisions(revisionRecords, filters),
    [filters]
  );

  const comparison = useMemo(() => {
    if (!compareA || !compareB || compareA === compareB) return null;
    return getRevisionComparison(compareA, compareB);
  }, [compareA, compareB]);

  const objectRevisions = (objectId: string) =>
    revisionRecords.filter((r) => r.objectId === objectId);

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <PageContainer>
      <SectionHeader
        title="Revision Management"
        description={`${revisionRecords.length} revision records across product catalog`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setCompareOpen(true)}
            >
              <GitCompareArrows className="h-4 w-4" />
              Compare Revisions
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Revision
            </Button>
          </div>
        }
      />

      <div className="sticky top-14 z-10 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-background/95 backdrop-blur-sm border-b border-border space-y-3">
        <SearchInput
          placeholder="Search by object, part number, or revision..."
          value={filters.search}
          onChange={(search) => setFilters((f) => ({ ...f, search }))}
          className="w-full max-w-md"
        />
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.objectId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, objectId: e.target.value }))
            }
            className={selectClass}
          >
            <option value="All">All Objects</option>
            {objects.map((o) => (
              <option key={o.id} value={o.id}>
                {o.partNumber} — {o.name}
              </option>
            ))}
          </select>
          <select
            value={filters.state}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                state: e.target.value as LifecycleState | "All",
              }))
            }
            className={selectClass}
          >
            <option value="All">All States</option>
            {(["Draft", "In Review", "Released", "Obsolete"] as const).map(
              (s) => (
                <option key={s} value={s}>
                  {s === "In Review" ? "Review" : s}
                </option>
              )
            )}
          </select>
          <select
            value={filters.ownerId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, ownerId: e.target.value }))
            }
            className={selectClass}
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

      <div className="mt-6">
        <RevisionTable
          revisions={filtered}
          loading={loading}
          onClearFilters={clearFilters}
        />
      </div>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompareArrows className="h-4 w-4" />
              Compare Revisions
            </DialogTitle>
            <DialogDescription>
              Select two revisions of the same object to view differences
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Revision A</label>
              <select
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                className={selectClass + " w-full"}
              >
                <option value="">Select revision...</option>
                {revisionRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.objectPartNumber} Rev {r.revision} ({r.state})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Revision B</label>
              <select
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                className={selectClass + " w-full"}
              >
                <option value="">Select revision...</option>
                {compareA
                  ? objectRevisions(
                      revisionRecords.find((r) => r.id === compareA)
                        ?.objectId ?? ""
                    ).map((r) => (
                      <option key={r.id} value={r.id}>
                        Rev {r.revision} ({r.state})
                      </option>
                    ))
                  : revisionRecords.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.objectPartNumber} Rev {r.revision}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          {comparison ? (
            <RevisionCompareCard comparison={comparison} />
          ) : compareA && compareB ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Revisions must belong to the same object to compare
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
