import { bomAssembliesSeed, bomNodesSeed, bomSnapshotsSeed } from "@/constants/bom-data";
import type { AssemblyItem, BomComparisonResult, BomNode, BomSnapshot } from "@/types";

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const flatten = (nodes: BomNode[], acc: BomNode[] = []) => {
  for (const node of nodes) {
    acc.push(node);
    flatten(node.children, acc);
  }
  return acc;
};

export async function fetchAssemblies(): Promise<AssemblyItem[]> {
  await wait();
  return deepClone(bomAssembliesSeed);
}

export async function fetchAssemblyNodes(assemblyId: string): Promise<BomNode[]> {
  await wait();
  return deepClone(bomNodesSeed[assemblyId] ?? []);
}

export async function fetchSnapshots(assemblyId: string): Promise<BomSnapshot[]> {
  await wait();
  return deepClone(bomSnapshotsSeed.filter((s) => s.assemblyId === assemblyId));
}

export async function compareBomRevisions(
  revA: BomNode[],
  revB: BomNode[]
): Promise<BomComparisonResult> {
  await wait(250);
  const aMap = new Map(flatten(revA).map((node) => [node.partNumber, node]));
  const bMap = new Map(flatten(revB).map((node) => [node.partNumber, node]));

  const added = [...bMap.entries()]
    .filter(([partNumber]) => !aMap.has(partNumber))
    .map(([, node]) => ({
      id: node.id,
      partNumber: node.partNumber,
      partName: node.partName,
    }));

  const removed = [...aMap.entries()]
    .filter(([partNumber]) => !bMap.has(partNumber))
    .map(([, node]) => ({
      id: node.id,
      partNumber: node.partNumber,
      partName: node.partName,
    }));

  const quantityChanged = [...aMap.entries()]
    .filter(([partNumber, aNode]) => {
      const bNode = bMap.get(partNumber);
      return bNode && aNode.quantity !== bNode.quantity;
    })
    .map(([, node]) => {
      const target = bMap.get(node.partNumber)!;
      return {
        id: node.id,
        partNumber: node.partNumber,
        partName: node.partName,
        from: node.quantity,
        to: target.quantity,
      };
    });

  const revisionChanged = [...aMap.entries()]
    .filter(([partNumber, aNode]) => {
      const bNode = bMap.get(partNumber);
      return bNode && aNode.revision !== bNode.revision;
    })
    .map(([, node]) => {
      const target = bMap.get(node.partNumber)!;
      return {
        id: node.id,
        partNumber: node.partNumber,
        partName: node.partName,
        from: node.revision,
        to: target.revision,
      };
    });

  return { added, removed, quantityChanged, revisionChanged };
}
