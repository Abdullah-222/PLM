"use client";

import { use, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { BomComparisonView, BomTree, CostAnalysisPanel, SnapshotHistory } from "@/components/bom";
import { EmptyState } from "@/components/shared/empty-state";
import { PageContainer } from "@/components/shared/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBomStore } from "@/store/bom-store";
import { Clock3, GitCompare, History, Info, Network, Wallet } from "lucide-react";

export default function BomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    assemblies,
    nodesByAssembly,
    snapshots,
    comparison,
    updatePart,
    deletePart,
    duplicatePart,
    addPart,
    reorderPart,
    runComparison,
    restoreSnapshot,
    getCostAnalysis,
  } = useBomStore();
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const assembly = assemblies.find((item) => item.id === id);
  if (!assembly) notFound();

  const nodes = nodesByAssembly[id] ?? [];
  const assemblySnapshots = snapshots.filter((item) => item.assemblyId === id);
  const cost = getCostAnalysis(id);
  const history = useMemo(() => assemblySnapshots.map((snapshot) => `Snapshot ${snapshot.snapshotName} saved by ${snapshot.user}`), [assemblySnapshots]);

  return (
    <PageContainer className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{assembly.name}</h1>
        <p className="text-sm text-muted-foreground">BOM detail workspace · Rev {assembly.revision}</p>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="gap-1"><Info className="h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="structure" className="gap-1"><Network className="h-4 w-4" />Structure</TabsTrigger>
          <TabsTrigger value="cost" className="gap-1"><Wallet className="h-4 w-4" />Cost Analysis</TabsTrigger>
          <TabsTrigger value="comparison" className="gap-1"><GitCompare className="h-4 w-4" />Comparison</TabsTrigger>
          <TabsTrigger value="snapshots" className="gap-1"><Clock3 className="h-4 w-4" />Snapshots</TabsTrigger>
          <TabsTrigger value="history" className="gap-1"><History className="h-4 w-4" />History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <CostAnalysisPanel cost={cost} />
        </TabsContent>
        <TabsContent value="structure">
          <BomTree
            nodes={nodes}
            onAddChild={(parentId) =>
              addPart(id, {
                parentId,
                partNumber: "PRT-NEW",
                partName: "New Child Part",
                description: "Created from detail page",
                quantity: 1,
                unit: "EA",
                cost: 0,
                revision: "A",
              })
            }
            onEdit={(node) => updatePart(id, node.id, node)}
            onDelete={(nodeId) => deletePart(id, nodeId)}
            onDuplicate={(nodeId) => duplicatePart(id, nodeId)}
            onReorder={(sourceId, targetId) => reorderPart(id, sourceId, targetId)}
            onUpdateQuantity={(nodeId, quantity) => updatePart(id, nodeId, { quantity })}
            onUpdateRevision={(nodeId, revision) => updatePart(id, nodeId, { revision })}
          />
        </TabsContent>
        <TabsContent value="cost">
          <CostAnalysisPanel cost={cost} />
        </TabsContent>
        <TabsContent value="comparison">
          <BomComparisonView
            snapshots={assemblySnapshots}
            selectedA={a}
            selectedB={b}
            onSelectA={setA}
            onSelectB={setB}
            onCompare={() => {
              if (a && b) runComparison(id, a, b);
            }}
            comparison={comparison}
          />
        </TabsContent>
        <TabsContent value="snapshots">
          <SnapshotHistory snapshots={assemblySnapshots} onRestore={restoreSnapshot} />
        </TabsContent>
        <TabsContent value="history">
          {history.length === 0 ? (
            <EmptyState title="No history yet" description="Actions in this BOM will appear here." />
          ) : (
            <div className="rounded-xl border border-border p-3 space-y-2">
              {history.map((entry) => (
                <p key={entry} className="text-sm">{entry}</p>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
