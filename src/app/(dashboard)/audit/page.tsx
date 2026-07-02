"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActivityFeed,
  AuditFiltersBar,
  AuditTable,
  ComplianceReportViewer,
} from "@/components/audit";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  filterActivityFeed,
  filterAuditLogs,
  getAuditDashboardStats,
} from "@/constants/audit-data";
import { useAuditStore } from "@/store/audit-store";
import type { AuditFilters } from "@/types/audit";
import {
  Activity,
  CheckCircle2,
  FileText,
  Filter,
  GitBranch,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const defaultFilters: AuditFilters = {
  search: "",
  userId: "All",
  objectType: "All",
  actionType: "All",
  dateFrom: "",
  dateTo: "",
};

export default function AuditPage() {
  const { auditLogs, activityFeed, reports, generateReport } = useAuditStore();
  const [filters, setFilters] = useState<AuditFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const stats = useMemo(() => getAuditDashboardStats(auditLogs), [auditLogs]);

  const filteredLogs = useMemo(
    () => filterAuditLogs(auditLogs, filters),
    [auditLogs, filters]
  );

  const filteredFeed = useMemo(
    () => filterActivityFeed(activityFeed, filters),
    [activityFeed, filters]
  );

  return (
    <PageContainer>
      <SectionHeader
        title="Audit & Traceability Center"
        description="Enterprise traceability across all PLM objects"
        action={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 lg:hidden"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Activities" value={stats.totalActivities} icon={Activity} />
        <StatCard title="Changes Today" value={stats.changesToday} icon={Shield} />
        <StatCard title="Approvals Today" value={stats.approvalsToday} icon={CheckCircle2} />
        <StatCard title="Revision Releases" value={stats.revisionReleases} icon={GitBranch} />
        <StatCard title="Document Updates" value={stats.documentUpdates} icon={FileText} />
      </div>

      <div className="hidden lg:block">
        <AuditFiltersBar
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(defaultFilters)}
        />
      </div>

      <div className="space-y-6 mt-6 lg:mt-0">
        <div>
          <h2 className="text-lg font-semibold mb-3">Global Activity Feed</h2>
          <ActivityFeed items={filteredFeed} loading={loading} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Audit Log</h2>
          <AuditTable logs={filteredLogs} loading={loading} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Compliance Reports</h2>
          <ComplianceReportViewer reports={reports} onGenerate={generateReport} />
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <AuditFiltersBar
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
