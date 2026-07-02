"use client";

import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { StatCard } from "@/components/shared/stat-card";
import { AppCard, AppCardHeader, AppCardContent } from "@/components/shared/app-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CadExplorer,
  CadTable,
  CadSearch,
  CadToolbar,
} from "@/components/cad";
import { useCadStore } from "@/store/cad-store";
import {
  FileCode,
  Layers,
  Cpu,
  Lock,
  Award,
  Clock,
  Pin,
  Star,
  Flame,
} from "lucide-react";
import type { CadFilters } from "@/types/cad";

const defaultFilters: CadFilters = {
  search: "",
  fileType: "All",
  software: "All",
  ownerId: "All",
  status: "All",
  revision: "All",
  folderId: "All",
};

export default function CadPage() {
  const { files, activeFolderId, setActiveFolderId } = useCadStore();
  const [filters, setFilters] = useState<CadFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);

  // Pin/Favorite state (local for UX demonstration)
  const [pinnedIds, setPinnedIds] = useState<string[]>(["cad-file-1", "cad-file-3"]);

  const handleTogglePin = (id: string) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 400);
  };

  // Sync active folder with filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      folderId: activeFolderId,
    }));
  }, [activeFolderId]);

  // Handle Explorer selecting folder
  const handleSelectFolder = (folderId: string | "All") => {
    setActiveFolderId(folderId);
  };

  // Filtering Logic
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Folder Match
      if (filters.folderId !== "All" && file.folderId !== filters.folderId) {
        return false;
      }
      // Search text match
      if (filters.search) {
        const text = filters.search.toLowerCase();
        const matchesName = file.fileName.toLowerCase().includes(text);
        const matchesPN = file.partNumber.toLowerCase().includes(text);
        const matchesProj = file.project.toLowerCase().includes(text);
        const matchesTags = file.tags.some((t) => t.toLowerCase().includes(text));
        if (!matchesName && !matchesPN && !matchesProj && !matchesTags) {
          return false;
        }
      }
      // File Type Match
      if (filters.fileType !== "All" && file.type !== filters.fileType) {
        return false;
      }
      // Software Match
      if (filters.software !== "All" && file.software !== filters.software) {
        return false;
      }
      // Status Match
      if (filters.status !== "All" && file.status !== filters.status) {
        return false;
      }
      // Revision Match
      if (filters.revision !== "All" && file.currentRevision !== filters.revision) {
        return false;
      }
      // Owner Match
      if (filters.ownerId !== "All" && file.owner.id !== filters.ownerId) {
        return false;
      }
      return true;
    });
  }, [files, filters]);

  // Dashboard Stats Calculations
  const stats = useMemo(() => {
    const total = files.length;
    // count assemblies (SLDASM, CATPRODUCT, STP/STEP assemblies)
    const assembliesCount = files.filter(
      (f) => f.type === "SLDASM" || f.type === "CATPRODUCT" || f.fileName.includes("Assembly")
    ).length;
    // Parts = Total standalone parts + mock 120 parts
    const partsCount = files.filter(
      (f) => f.type !== "SLDASM" && f.type !== "CATPRODUCT" && !f.fileName.includes("Assembly")
    ).length + 120;

    const checkedOutCount = files.filter((f) => f.checkoutStatus?.checkedOut).length;
    const releasedCount = files.filter((f) => f.status === "Released").length;
    const pendingReviewsCount = files.filter((f) => f.status === "In Review").length;

    return {
      total,
      assemblies: assembliesCount,
      parts: partsCount,
      checkedOut: checkedOutCount,
      released: releasedCount,
      pendingReviews: pendingReviewsCount,
    };
  }, [files]);

  // Recent/Pinned tabs filters
  const recentlyUploaded = useMemo(() => {
    return [...files].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [files]);

  const recentlyReleased = useMemo(() => {
    return files.filter((f) => f.status === "Released").slice(0, 5);
  }, [files]);

  const pinnedFiles = useMemo(() => {
    return files.filter((f) => pinnedIds.includes(f.id));
  }, [files, pinnedIds]);

  return (
    <PageContainer>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CAD Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage, verify, and inspect 3D engineering models and assembly drawings.
        </p>
      </div>

      {/* Toolbar */}
      <CadToolbar onRefresh={handleRefresh} />

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total CAD Files"
          value={stats.total.toString()}
          change={`+${files.filter(f => new Date(f.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length} this week`}
          changeType="positive"
          icon={FileCode}
        />
        <StatCard
          title="Assemblies"
          value={stats.assemblies.toString()}
          change="Hierarchical trees"
          changeType="neutral"
          icon={Layers}
        />
        <StatCard
          title="Parts"
          value={stats.parts.toString()}
          change="120 subparts mapped"
          changeType="positive"
          icon={Cpu}
        />
        <StatCard
          title="Checked Out Files"
          value={stats.checkedOut.toString()}
          change={`${stats.checkedOut > 3 ? "Action required" : "Under control"}`}
          changeType={stats.checkedOut > 3 ? "negative" : "neutral"}
          icon={Lock}
        />
        <StatCard
          title="Released Models"
          value={stats.released.toString()}
          change={`${((stats.released / stats.total) * 100).toFixed(0)}% of catalog`}
          changeType="positive"
          icon={Award}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews.toString()}
          change="Awaiting approvals"
          changeType="neutral"
          icon={Clock}
        />
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mt-2">
        {/* Left Sidebar Explorer */}
        <aside className="w-full lg:w-52 shrink-0 border-r border-border lg:pr-4">
          <ScrollArea className="h-auto lg:h-[calc(100vh-280px)]">
            <CadExplorer />
          </ScrollArea>
        </aside>

        {/* Right Pane: Search + Table + Recent Panel */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Search panel */}
          <CadSearch
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters({ ...defaultFilters, folderId: activeFolderId })}
          />

          {/* Main Table view */}
          {loading ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <CadTable
              files={filteredFiles}
              onClearFilters={() => setFilters({ ...defaultFilters, folderId: activeFolderId })}
            />
          )}

          {/* Recent, Pinned, Favorites Tabs Layout */}
          <AppCard>
            <AppCardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                <h3 className="text-sm font-bold text-foreground font-semibold">CAD Shortcuts & Activity</h3>
              </div>
            </AppCardHeader>
            <AppCardContent>
              <Tabs defaultValue="recent" className="w-full text-xs">
                <TabsList className="mb-3 h-8 bg-muted/60 p-0.5">
                  <TabsTrigger value="recent" className="h-7 text-xs px-3">Recently Uploaded</TabsTrigger>
                  <TabsTrigger value="released" className="h-7 text-xs px-3">Recently Released</TabsTrigger>
                  <TabsTrigger value="pinned" className="h-7 text-xs px-3 gap-1">
                    <Pin className="h-3 w-3" /> Pinned / Favorites
                  </TabsTrigger>
                </TabsList>

                {/* Recently Uploaded */}
                <TabsContent value="recent" className="space-y-2 mt-0">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {recentlyUploaded.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => handleTogglePin(file.id)}
                        className="flex items-center justify-between rounded-lg border border-border p-2.5 hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{file.fileName}</p>
                          <p className="text-[10px] text-muted-foreground">{file.partNumber} · Rev {file.currentRevision}</p>
                        </div>
                        <button className="text-muted-foreground hover:text-orange-500">
                          {pinnedIds.includes(file.id) ? (
                            <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                          ) : (
                            <Star className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Recently Released */}
                <TabsContent value="released" className="space-y-2 mt-0">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {recentlyReleased.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => handleTogglePin(file.id)}
                        className="flex items-center justify-between rounded-lg border border-border p-2.5 hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{file.fileName}</p>
                          <p className="text-[10px] text-muted-foreground">{file.partNumber} · Rev {file.currentRevision}</p>
                        </div>
                        <button className="text-muted-foreground hover:text-orange-500">
                          {pinnedIds.includes(file.id) ? (
                            <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                          ) : (
                            <Star className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Pinned Files */}
                <TabsContent value="pinned" className="space-y-2 mt-0">
                  {pinnedFiles.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {pinnedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between rounded-lg border border-border p-2.5 hover:bg-muted/30 cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{file.fileName}</p>
                            <p className="text-[10px] text-muted-foreground">{file.partNumber} · Rev {file.currentRevision}</p>
                          </div>
                          <button
                            onClick={() => handleTogglePin(file.id)}
                            className="text-orange-400 hover:text-muted-foreground"
                          >
                            <Star className="h-3.5 w-3.5 fill-orange-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No favorited or pinned models.</p>
                  )}
                </TabsContent>
              </Tabs>
            </AppCardContent>
          </AppCard>
        </div>
      </div>
    </PageContainer>
  );
}
