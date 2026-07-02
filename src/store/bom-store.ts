import { create } from "zustand";
import { persist } from "zustand/middleware";
import { bomAssembliesSeed, bomNodesSeed, bomSnapshotsSeed } from "@/constants/bom-data";
import { compareBomRevisions } from "@/lib/mock-api/bom-api";
import type {
  AssemblyItem,
  BomComparisonResult,
  BomNode,
  BomSnapshot,
  CostAnalysis,
} from "@/types";

interface AddPartInput {
  parentId?: string;
  partNumber: string;
  partName: string;
  description: string;
  quantity: number;
  unit: string;
  cost: number;
  revision: string;
}

interface BomState {
  assemblies: AssemblyItem[];
  selectedAssemblyId: string;
  nodesByAssembly: Record<string, BomNode[]>;
  snapshots: BomSnapshot[];
  comparison: BomComparisonResult | null;
  setSelectedAssembly: (id: string) => void;
  createAssembly: (name: string) => void;
  renameAssembly: (id: string, name: string) => void;
  duplicateAssembly: (id: string) => void;
  deleteAssembly: (id: string) => void;
  addPart: (assemblyId: string, input: AddPartInput) => void;
  updatePart: (assemblyId: string, partId: string, patch: Partial<BomNode>) => void;
  deletePart: (assemblyId: string, partId: string) => void;
  duplicatePart: (assemblyId: string, partId: string) => void;
  reorderPart: (assemblyId: string, sourceId: string, targetId: string) => void;
  createSnapshot: (assemblyId: string, snapshotName: string, user: string) => void;
  restoreSnapshot: (snapshotId: string) => void;
  runComparison: (assemblyId: string, snapshotA: string, snapshotB: string) => Promise<void>;
  getCostAnalysis: (assemblyId: string) => CostAnalysis;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const id = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const mapNodes = (nodes: BomNode[], fn: (node: BomNode) => BomNode): BomNode[] =>
  nodes.map((node) => {
    const next = fn(node);
    return {
      ...next,
      children: mapNodes(next.children, fn),
    };
  });

const deleteNode = (nodes: BomNode[], targetId: string): BomNode[] =>
  nodes
    .filter((node) => node.id !== targetId)
    .map((node) => ({ ...node, children: deleteNode(node.children, targetId) }));

const findNode = (nodes: BomNode[], targetId: string): BomNode | null => {
  for (const node of nodes) {
    if (node.id === targetId) return node;
    const child = findNode(node.children, targetId);
    if (child) return child;
  }
  return null;
};

const duplicateNode = (node: BomNode): BomNode => ({
  ...node,
  id: id("node"),
  partNumber: `${node.partNumber}-COPY`,
  partName: `${node.partName} Copy`,
  children: node.children.map(duplicateNode),
});

const flatten = (nodes: BomNode[], acc: BomNode[] = []) => {
  for (const node of nodes) {
    acc.push(node);
    flatten(node.children, acc);
  }
  return acc;
};

export const useBomStore = create<BomState>()(
  persist(
    (set, get) => ({
      assemblies: clone(bomAssembliesSeed),
      selectedAssemblyId: bomAssembliesSeed[0]?.id ?? "",
      nodesByAssembly: clone(bomNodesSeed),
      snapshots: clone(bomSnapshotsSeed),
      comparison: null,
      setSelectedAssembly: (id) => set({ selectedAssemblyId: id }),
      createAssembly: (name) =>
        set((state) => {
          const assemblyId = id("asm");
          const rootId = id("node");
          const newAssembly: AssemblyItem = {
            id: assemblyId,
            name,
            revision: "A",
            rootNodeId: rootId,
            productFamily: "New Product",
            updatedAt: new Date().toISOString(),
          };
          const rootNode: BomNode = {
            id: rootId,
            partNumber: `ASM-${name.toUpperCase().replace(/\s+/g, "-").slice(0, 8)}`,
            partName: name,
            description: `${name} root assembly`,
            quantity: 1,
            unit: "EA",
            revision: "A",
            lifecycleState: "Draft",
            cost: 0,
            children: [],
          };
          return {
            assemblies: [newAssembly, ...state.assemblies],
            nodesByAssembly: { ...state.nodesByAssembly, [assemblyId]: [rootNode] },
            selectedAssemblyId: assemblyId,
          };
        }),
      renameAssembly: (assemblyId, name) =>
        set((state) => ({
          assemblies: state.assemblies.map((assembly) =>
            assembly.id === assemblyId ? { ...assembly, name, updatedAt: new Date().toISOString() } : assembly
          ),
        })),
      duplicateAssembly: (assemblyId) =>
        set((state) => {
          const source = state.assemblies.find((assembly) => assembly.id === assemblyId);
          if (!source) return state;
          const nextId = id("asm");
          const copiedNodes = clone(state.nodesByAssembly[assemblyId] ?? []).map(duplicateNode);
          return {
            assemblies: [
              {
                ...source,
                id: nextId,
                name: `${source.name} Copy`,
                updatedAt: new Date().toISOString(),
              },
              ...state.assemblies,
            ],
            nodesByAssembly: { ...state.nodesByAssembly, [nextId]: copiedNodes },
          };
        }),
      deleteAssembly: (assemblyId) =>
        set((state) => {
          const remaining = state.assemblies.filter((assembly) => assembly.id !== assemblyId);
          const nextNodes = { ...state.nodesByAssembly };
          delete nextNodes[assemblyId];
          return {
            assemblies: remaining,
            nodesByAssembly: nextNodes,
            selectedAssemblyId: remaining[0]?.id ?? "",
            snapshots: state.snapshots.filter((snap) => snap.assemblyId !== assemblyId),
          };
        }),
      addPart: (assemblyId, input) =>
        set((state) => {
          const part: BomNode = {
            id: id("node"),
            partNumber: input.partNumber,
            partName: input.partName,
            description: input.description,
            quantity: input.quantity,
            unit: input.unit,
            revision: input.revision,
            lifecycleState: "Draft",
            cost: input.cost,
            children: [],
          };
          const tree = clone(state.nodesByAssembly[assemblyId] ?? []);
          if (!input.parentId) {
            tree.push(part);
          } else {
            const target = findNode(tree, input.parentId);
            if (target) target.children.push(part);
          }
          return { nodesByAssembly: { ...state.nodesByAssembly, [assemblyId]: tree } };
        }),
      updatePart: (assemblyId, partId, patch) =>
        set((state) => ({
          nodesByAssembly: {
            ...state.nodesByAssembly,
            [assemblyId]: mapNodes(state.nodesByAssembly[assemblyId] ?? [], (node) =>
              node.id === partId ? { ...node, ...patch } : node
            ),
          },
        })),
      deletePart: (assemblyId, partId) =>
        set((state) => ({
          nodesByAssembly: {
            ...state.nodesByAssembly,
            [assemblyId]: deleteNode(state.nodesByAssembly[assemblyId] ?? [], partId),
          },
        })),
      duplicatePart: (assemblyId, partId) =>
        set((state) => {
          const tree = clone(state.nodesByAssembly[assemblyId] ?? []);
          const source = findNode(tree, partId);
          if (!source) return state;
          tree.push(duplicateNode(source));
          return { nodesByAssembly: { ...state.nodesByAssembly, [assemblyId]: tree } };
        }),
      reorderPart: (assemblyId, sourceId, targetId) =>
        set((state) => {
          const tree = clone(state.nodesByAssembly[assemblyId] ?? []);
          const source = findNode(tree, sourceId);
          const target = findNode(tree, targetId);
          if (!source || !target || source.id === target.id) return state;
          const filtered = deleteNode(tree, sourceId);
          const attach = (nodes: BomNode[]): BomNode[] =>
            nodes.map((node) =>
              node.id === targetId
                ? { ...node, children: [...node.children, source] }
                : { ...node, children: attach(node.children) }
            );
          return {
            nodesByAssembly: { ...state.nodesByAssembly, [assemblyId]: attach(filtered) },
          };
        }),
      createSnapshot: (assemblyId, snapshotName, user) =>
        set((state) => ({
          snapshots: [
            {
              id: id("snap"),
              assemblyId,
              snapshotName,
              date: new Date().toISOString(),
              user,
              revision:
                state.assemblies.find((assembly) => assembly.id === assemblyId)?.revision ?? "A",
              nodes: clone(state.nodesByAssembly[assemblyId] ?? []),
            },
            ...state.snapshots,
          ],
        })),
      restoreSnapshot: (snapshotId) =>
        set((state) => {
          const snapshot = state.snapshots.find((item) => item.id === snapshotId);
          if (!snapshot) return state;
          return {
            nodesByAssembly: {
              ...state.nodesByAssembly,
              [snapshot.assemblyId]: clone(snapshot.nodes),
            },
          };
        }),
      runComparison: async (assemblyId, snapshotA, snapshotB) => {
        const state = get();
        const first = state.snapshots.find((snap) => snap.id === snapshotA && snap.assemblyId === assemblyId);
        const second = state.snapshots.find((snap) => snap.id === snapshotB && snap.assemblyId === assemblyId);
        if (!first || !second) return;
        const comparison = await compareBomRevisions(first.nodes, second.nodes);
        set({ comparison });
      },
      getCostAnalysis: (assemblyId) => {
        const tree = get().nodesByAssembly[assemblyId] ?? [];
        const nodes = flatten(tree);
        const assemblyCost = nodes.reduce((sum, node) => sum + node.cost * node.quantity, 0);
        const subassemblyCost = nodes
          .filter((node) => node.children.length > 0)
          .reduce((sum, node) => sum + node.cost * node.quantity, 0);
        const partCost = assemblyCost - subassemblyCost;
        return { assemblyCost, subassemblyCost, partCost };
      },
    }),
    { name: "plm-bom-store" }
  )
);
