"use client";

import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import {
  DocumentFiltersBar,
  DocumentFolderTree,
  DocumentTable,
  DocumentViewerDrawer,
} from "@/components/documents";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  documentFolders,
  filterDocuments,
  getUniqueDocumentOwners,
  getUniqueDocumentProducts,
  managedDocuments,
} from "@/constants/documents-data";
import type { DocumentFilters } from "@/types/documents";
import type { ManagedDocument } from "@/types/documents";
import { Download, FolderPlus, Upload } from "lucide-react";

const defaultFilters: DocumentFilters = {
  search: "",
  productId: "All",
  fileType: "All",
  ownerId: "All",
  status: "All",
  folderId: "All",
};

export default function DocumentsPage() {
  const [filters, setFilters] = useState<DocumentFilters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<ManagedDocument | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const products = useMemo(() => getUniqueDocumentProducts(), []);
  const owners = useMemo(() => getUniqueDocumentOwners(), []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(
    () => filterDocuments(managedDocuments, filters),
    [filters]
  );

  const handleSelect = (doc: ManagedDocument) => {
    setSelectedDoc(doc);
    setDrawerOpen(true);
  };

  const clearFilters = () => setFilters(defaultFilters);

  return (
    <>
      <PageContainer className="space-y-0">
        <SectionHeader
          title="Documents"
          description={`${managedDocuments.length} engineering documents in repository`}
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <FolderPlus className="h-4 w-4" />
                Create Folder
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button size="sm" className="gap-1.5">
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </div>
          }
        />

        <DocumentFiltersBar
          filters={filters}
          products={products}
          owners={owners}
          onChange={setFilters}
        />

        <div className="flex gap-6 mt-6">
          <aside className="hidden lg:block w-52 shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
              Folders
            </p>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <DocumentFolderTree
                folders={documentFolders}
                selectedId={filters.folderId}
                onSelect={(folderId) =>
                  setFilters((f) => ({ ...f, folderId }))
                }
              />
            </ScrollArea>
          </aside>

          <div className="flex-1 min-w-0">
            <DocumentTable
              documents={filtered}
              loading={loading}
              onSelect={handleSelect}
              onClearFilters={clearFilters}
            />
          </div>
        </div>
      </PageContainer>

      <DocumentViewerDrawer
        document={selectedDoc}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedDoc(null);
        }}
      />
    </>
  );
}
