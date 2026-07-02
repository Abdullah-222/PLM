"use client";

import { use, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/shared/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ActivityFeed,
  BomTree,
  ChangesTable,
  DocumentsTable,
  MetadataForm,
  ProductHeader,
  ProductOverview,
  RevisionTimeline,
  WorkflowStepper,
} from "@/components/product";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProductById, getProductWorkspace } from "@/constants/products";
import { users } from "@/constants/users";
import { useProductsStore } from "@/store/products-store";
import type { Document, ProductMetadata } from "@/types";
import {
  ClipboardList,
  FileText,
  GitBranch,
  Info,
  MessageSquare,
  Network,
  Package,
  Workflow,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const createdProducts = useProductsStore((s) => s.createdProducts);
  const product = useMemo(
    () => getProductById(id),
    [id, createdProducts]
  );

  if (!product) {
    notFound();
  }

  const workspace = useMemo(
    () => getProductWorkspace(product.id),
    [product.id, product.updatedAt, createdProducts]
  );
  const [metadata, setMetadata] = useState<ProductMetadata>(workspace.metadata);

  const handlePreview = (doc: Document) => {
    window.alert(`Preview: ${doc.name} (v${doc.version})`);
  };

  const handleDownload = (doc: Document) => {
    window.alert(`Downloading ${doc.name}...`);
  };

  return (
    <PageContainer className="space-y-0">
      <ProductHeader product={product} />

      <Tabs defaultValue="overview" className="mt-6">
        <div className="sticky top-[calc(3.5rem+88px)] z-10 -mx-6 lg:-mx-8 px-6 lg:px-8 py-2 bg-background/95 backdrop-blur-sm border-b border-border">
          <TabsList className="h-10 bg-muted/50 p-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="gap-1.5 text-xs shrink-0">
              <Info className="h-3.5 w-3.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="metadata" className="gap-1.5 text-xs shrink-0">
              <Package className="h-3.5 w-3.5" />
              Metadata
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5 text-xs shrink-0">
              <FileText className="h-3.5 w-3.5" />
              Documents
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {workspace.documents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="bom" className="gap-1.5 text-xs shrink-0">
              <Network className="h-3.5 w-3.5" />
              BOM
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {product.bomItems}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="revisions" className="gap-1.5 text-xs shrink-0">
              <GitBranch className="h-3.5 w-3.5" />
              Revisions
            </TabsTrigger>
            <TabsTrigger value="workflow" className="gap-1.5 text-xs shrink-0">
              <Workflow className="h-3.5 w-3.5" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="changes" className="gap-1.5 text-xs shrink-0">
              <ClipboardList className="h-3.5 w-3.5" />
              Changes
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5 text-xs shrink-0">
              <MessageSquare className="h-3.5 w-3.5" />
              Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <ProductOverview product={product} kpis={workspace.kpis} />
        </TabsContent>

        <TabsContent value="metadata" className="mt-6">
          <MetadataForm
            metadata={metadata}
            owners={users}
            onSave={(data) => setMetadata(data)}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          {workspace.documents.length > 0 ? (
            <DocumentsTable
              documents={workspace.documents}
              onPreview={handlePreview}
              onDownload={handleDownload}
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="No documents attached"
              description="Upload requirements, CAD models, or test reports"
            />
          )}
        </TabsContent>

        <TabsContent value="bom" className="mt-6">
          {workspace.bom.length > 0 ? (
            <BomTree items={workspace.bom} />
          ) : (
            <EmptyState
              icon={Network}
              title="No BOM structure"
              description="This item has no bill of materials defined"
            />
          )}
        </TabsContent>

        <TabsContent value="revisions" className="mt-6">
          <RevisionTimeline
            revisions={workspace.revisions}
            currentRevision={product.revision}
          />
        </TabsContent>

        <TabsContent value="workflow" className="mt-6">
          <WorkflowStepper steps={workspace.workflow} />
        </TabsContent>

        <TabsContent value="changes" className="mt-6">
          {workspace.changes.length > 0 ? (
            <ChangesTable changes={workspace.changes} />
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="No change requests"
              description="No engineering changes are linked to this item"
            />
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityFeed activities={workspace.activities} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
