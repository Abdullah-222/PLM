"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChangeFiltersBar,
  ChangeTable,
} from "@/components/changes";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { filterChanges, getChangeDashboardStats } from "@/constants/changes-data";
import { useChangesStore } from "@/store/changes-store";
import type { ChangeFilters } from "@/types/changes";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  FilePlus,
  Filter,
  Lock,
} from "lucide-react";

const defaultFilters: ChangeFilters = {
  search: "",
  status: "All",
  priority: "All",
  type: "All",
  ownerId: "All",
};

export default function ChangesPage() {
  const router = useRouter();
  const { changes, exportChanges } = useChangesStore();
  const [filters, setFilters] = useState<ChangeFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(
    () => filterChanges(changes, filters),
    [changes, filters]
  );

  const stats = useMemo(() => getChangeDashboardStats(changes), [changes]);

  const handleExport = async () => {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 300));
    const csv = exportChanges();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `engineering_changes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <PageContainer>
      <SectionHeader
        title="Engineering Changes"
        description={`${changes.length} change records across ECR, ECO, and ECN`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : "Export"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => router.push("/changes/create?type=ECR")}
            >
              <FilePlus className="h-4 w-4" />
              Create ECR
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => router.push("/changes/create?type=ECO")}
            >
              <ClipboardList className="h-4 w-4" />
              Create ECO
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Open Changes" value={stats.open} icon={ClipboardList} />
        <StatCard title="Pending Approval" value={stats.pendingApproval} icon={Clock3} />
        <StatCard title="Approved Changes" value={stats.approved} icon={CheckCircle2} />
        <StatCard title="Closed Changes" value={stats.closed} icon={Lock} />
        <StatCard title="High Priority" value={stats.highPriority} icon={AlertTriangle} />
      </div>

      <div className="hidden lg:block">
        <ChangeFiltersBar
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(defaultFilters)}
        />
      </div>

      <div className="mt-6 lg:mt-0">
        <ChangeTable
          changes={filtered}
          loading={loading}
          onClearFilters={() => setFilters(defaultFilters)}
        />
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <ChangeFiltersBar
              filters={filters}
              onChange={setFilters}
              onClear={() => setFilters(defaultFilters)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
