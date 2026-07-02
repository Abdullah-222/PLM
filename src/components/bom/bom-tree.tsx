"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BomNode } from "@/types";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";

interface BomTreeProps {
  nodes: BomNode[];
  onAddChild: (parentId: string) => void;
  onEdit: (node: BomNode) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onReorder: (sourceId: string, targetId: string) => void;
  onUpdateQuantity: (nodeId: string, quantity: number) => void;
  onUpdateRevision: (nodeId: string, revision: string) => void;
}

const collectNodeIds = (nodes: BomNode[], acc: string[] = []) => {
  for (const node of nodes) {
    acc.push(node.id);
    collectNodeIds(node.children, acc);
  }
  return acc;
};

const flatten = (nodes: BomNode[], depth = 0, acc: Array<{ node: BomNode; depth: number }> = []) => {
  for (const node of nodes) {
    acc.push({ node, depth });
    flatten(node.children, depth + 1, acc);
  }
  return acc;
};

export function BomTree({
  nodes,
  onAddChild,
  onEdit,
  onDelete,
  onDuplicate,
  onReorder,
  onUpdateQuantity,
  onUpdateRevision,
}: BomTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(collectNodeIds(nodes)));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const flat = flatten(nodes);
    return flat.filter(({ depth }) => {
      if (depth === 0) return true;
      return flat
        .filter((candidate) => candidate.depth < depth)
        .every((candidate) => candidate.depth !== depth - 1 || expanded.has(candidate.node.id));
    });
  }, [nodes, expanded]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {["Part Number", "Part Name", "Quantity", "Unit", "Revision", "Lifecycle State", "Cost", ""].map(
              (column) => (
                <th
                  key={column}
                  className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium"
                >
                  {column}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ node, depth }) => {
            const isSelected = selected.has(node.id);
            return (
              <tr
                key={node.id}
                className={cn("border-b border-border/70", isSelected && "bg-muted")}
                draggable
                onDragStart={() => setDragId(node.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragId) onReorder(dragId, node.id);
                  setDragId(null);
                }}
                onClick={(event) => {
                  const ctrl = event.metaKey || event.ctrlKey;
                  setSelected((prev) => {
                    const next = new Set(prev);
                    if (!ctrl) return new Set([node.id]);
                    if (next.has(node.id)) next.delete(node.id);
                    else next.add(node.id);
                    return next;
                  });
                }}
              >
                <td className="px-3 py-2 font-mono text-xs">{node.partNumber}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 16}px` }}>
                    <button
                      className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggle(node.id);
                      }}
                      disabled={node.children.length === 0}
                    >
                      {node.children.length > 0 ? (
                        expanded.has(node.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )
                      ) : null}
                    </button>
                    <span className="font-medium">{node.partName}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={node.quantity}
                    onChange={(event) => onUpdateQuantity(node.id, Number(event.target.value) || 0)}
                    className="h-8 w-20"
                    type="number"
                    onClick={(event) => event.stopPropagation()}
                  />
                </td>
                <td className="px-3 py-2">{node.unit}</td>
                <td className="px-3 py-2">
                  <Input
                    value={node.revision}
                    onChange={(event) => onUpdateRevision(node.id, event.target.value)}
                    className="h-8 w-20"
                    onClick={(event) => event.stopPropagation()}
                  />
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline">{node.lifecycleState}</Badge>
                </td>
                <td className="px-3 py-2">${(node.cost * node.quantity).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" onClick={(event) => event.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onAddChild(node.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add child part
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(node)}>Edit part</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(node.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(node.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
