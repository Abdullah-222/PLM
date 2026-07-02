"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AssemblyExplorer, BomComparisonView, BomTree, CostAnalysisPanel, SnapshotHistory } from "@/components/bom";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useBomStore } from "@/store/bom-store";
import type { BomNode } from "@/types";
import { Download, Plus, Upload } from "lucide-react";

const emptyForm = {
  partNumber: "",
  partName: "",
  description: "",
  quantity: 1,
  unit: "EA",
  cost: 0,
  revision: "A",
};

export default function BomPage() {
  const router = useRouter();
  const {
    assemblies,
    selectedAssemblyId,
    nodesByAssembly,
    snapshots,
    comparison,
    setSelectedAssembly,
    createAssembly,
    renameAssembly,
    duplicateAssembly,
    deleteAssembly,
    addPart,
    updatePart,
    deletePart,
    duplicatePart,
    reorderPart,
    createSnapshot,
    restoreSnapshot,
    runComparison,
    getCostAnalysis,
  } = useBomStore();
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editNode, setEditNode] = useState<BomNode | null>(null);
  const [createAssemblyOpen, setCreateAssemblyOpen] = useState(false);
  const [newAssemblyName, setNewAssemblyName] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [targetParentId, setTargetParentId] = useState<string | undefined>(undefined);
  const [snapshotName, setSnapshotName] = useState("");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const selectedAssembly = assemblies.find((item) => item.id === selectedAssemblyId);
  const nodes = useMemo(() => nodesByAssembly[selectedAssemblyId] ?? [], [nodesByAssembly, selectedAssemblyId]);
  const assemblySnapshots = snapshots.filter((item) => item.assemblyId === selectedAssemblyId);
  const cost = getCostAnalysis(selectedAssemblyId);

  const activeCompareA = compareA || assemblySnapshots[0]?.id || "";
  const activeCompareB = compareB || assemblySnapshots[1]?.id || "";

  const handleAddPart = () => {
    addPart(selectedAssemblyId, { ...form, parentId: targetParentId });
    setAddOpen(false);
    setForm(emptyForm);
    setTargetParentId(undefined);
  };

  const headerActions = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setCreateAssemblyOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Create Assembly
        </Button>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          Add Part
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            addPart(selectedAssemblyId, {
              partNumber: `IMP-${Math.floor(Math.random() * 1000)}`,
              partName: "Imported Part",
              description: "Imported from BOM file",
              quantity: 1,
              unit: "EA",
              cost: 50,
              revision: "A",
            })
          }
        >
          <Upload className="h-4 w-4 mr-1" />
          Import BOM
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            const payload = JSON.stringify(nodes, null, 2);
            const blob = new Blob([payload], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${selectedAssembly?.name ?? "bom"}-export.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="h-4 w-4 mr-1" />
          Export BOM
        </Button>
      </div>
    ),
    [addPart, nodes, selectedAssembly?.name, selectedAssemblyId]
  );

  if (loading) {
    return <PageContainer><div className="h-40 rounded-xl border animate-pulse bg-muted/40" /></PageContainer>;
  }

  return (
    <PageContainer>
      <SectionHeader title="BOM Management" description="Teamcenter-style BOM Management Center" action={headerActions} />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <AssemblyExplorer
          assemblies={assemblies}
          selectedAssemblyId={selectedAssemblyId}
          onSelect={setSelectedAssembly}
          onRename={renameAssembly}
          onDuplicate={duplicateAssembly}
          onDelete={deleteAssembly}
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{selectedAssembly?.name ?? "No assembly selected"}</h3>
            {selectedAssembly && (
              <Button size="sm" variant="outline" onClick={() => router.push(`/bom/${selectedAssembly.id}`)}>
                Open Detail Page
              </Button>
            )}
          </div>
          <BomTree
            nodes={nodes}
            onAddChild={(parentId) => {
              setTargetParentId(parentId);
              setAddOpen(true);
            }}
            onEdit={(node) => setEditNode(node)}
            onDelete={(nodeId) => deletePart(selectedAssemblyId, nodeId)}
            onDuplicate={(nodeId) => duplicatePart(selectedAssemblyId, nodeId)}
            onReorder={(sourceId, targetId) => reorderPart(selectedAssemblyId, sourceId, targetId)}
            onUpdateQuantity={(nodeId, quantity) => updatePart(selectedAssemblyId, nodeId, { quantity })}
            onUpdateRevision={(nodeId, revision) => updatePart(selectedAssemblyId, nodeId, { revision })}
          />
          <CostAnalysisPanel cost={cost} />
          <div className="grid gap-4 lg:grid-cols-2">
            <BomComparisonView
              snapshots={assemblySnapshots}
              selectedA={activeCompareA}
              selectedB={activeCompareB}
              onSelectA={setCompareA}
              onSelectB={setCompareB}
              onCompare={() => {
                if (activeCompareA && activeCompareB) {
                  runComparison(selectedAssemblyId, activeCompareA, activeCompareB);
                }
              }}
              comparison={comparison}
            />
            <div className="space-y-3">
              <div className="rounded-xl border border-border p-3">
                <h3 className="text-sm font-semibold mb-2">Release Snapshots</h3>
                <div className="flex gap-2">
                  <Input
                    value={snapshotName}
                    onChange={(event) => setSnapshotName(event.target.value)}
                    placeholder="Snapshot name"
                  />
                  <Button
                    onClick={() => {
                      if (!snapshotName.trim()) return;
                      createSnapshot(selectedAssemblyId, snapshotName.trim(), "Current User");
                      setSnapshotName("");
                    }}
                  >
                    Create Snapshot
                  </Button>
                </div>
              </div>
              <SnapshotHistory snapshots={assemblySnapshots} onRestore={restoreSnapshot} />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={createAssemblyOpen} onOpenChange={setCreateAssemblyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Assembly</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Assembly name"
            value={newAssemblyName}
            onChange={(event) => setNewAssemblyName(event.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateAssemblyOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newAssemblyName.trim()) return;
                createAssembly(newAssemblyName.trim());
                setNewAssemblyName("");
                setCreateAssemblyOpen(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Part</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Part Number" value={form.partNumber} onChange={(e) => setForm((s) => ({ ...s, partNumber: e.target.value }))} />
            <Input placeholder="Part Name" value={form.partName} onChange={(e) => setForm((s) => ({ ...s, partName: e.target.value }))} />
            <Input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm((s) => ({ ...s, quantity: Number(e.target.value) || 0 }))} />
            <Input placeholder="Unit" value={form.unit} onChange={(e) => setForm((s) => ({ ...s, unit: e.target.value }))} />
            <Input type="number" placeholder="Cost" value={form.cost} onChange={(e) => setForm((s) => ({ ...s, cost: Number(e.target.value) || 0 }))} />
            <Input placeholder="Revision" value={form.revision} onChange={(e) => setForm((s) => ({ ...s, revision: e.target.value }))} />
          </div>
          <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPart}>Create Part</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={Boolean(editNode)} onOpenChange={(open) => !open && setEditNode(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Part</SheetTitle>
            <SheetDescription>Update quantity, cost, revision and description.</SheetDescription>
          </SheetHeader>
          {editNode && (
            <div className="p-4 space-y-3">
              <Input
                type="number"
                value={editNode.quantity}
                onChange={(event) => {
                  const quantity = Number(event.target.value) || 0;
                  setEditNode({ ...editNode, quantity });
                  updatePart(selectedAssemblyId, editNode.id, { quantity });
                }}
              />
              <Input
                type="number"
                value={editNode.cost}
                onChange={(event) => {
                  const costValue = Number(event.target.value) || 0;
                  setEditNode({ ...editNode, cost: costValue });
                  updatePart(selectedAssemblyId, editNode.id, { cost: costValue });
                }}
              />
              <Input
                value={editNode.revision}
                onChange={(event) => {
                  setEditNode({ ...editNode, revision: event.target.value });
                  updatePart(selectedAssemblyId, editNode.id, { revision: event.target.value });
                }}
              />
              <Textarea
                value={editNode.description}
                onChange={(event) => {
                  setEditNode({ ...editNode, description: event.target.value });
                  updatePart(selectedAssemblyId, editNode.id, { description: event.target.value });
                }}
              />
            </div>
          )}
          <SheetFooter>
            <Button variant="outline" onClick={() => setEditNode(null)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}
