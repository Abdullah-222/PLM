"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BOMItem } from "@/types";
import { ChevronDown, ChevronRight, Download, Network } from "lucide-react";
import { cn } from "@/lib/utils";

interface BomTreeProps {
  items: BOMItem[];
}

function BomTreeRow({
  item,
  depth = 0,
  defaultExpanded = true,
}: {
  item: BOMItem;
  depth?: number;
  defaultExpanded?: boolean;
}) {
  const hasChildren = Boolean(item.children && item.children.length > 0);
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <>
      <tr className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
        <td className="px-4 py-2.5 w-10">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </Button>
          ) : (
            <span className="inline-block w-6" />
          )}
        </td>
        <td className="px-4 py-2.5">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${depth * 20}px` }}
          >
            {hasChildren && <Network className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            <span className="font-mono text-xs font-medium">{item.partNumber}</span>
          </div>
        </td>
        <td className="px-4 py-2.5">
          <span className={cn("text-sm", depth === 0 && "font-semibold")}>
            {item.name}
          </span>
        </td>
        <td className="px-4 py-2.5 text-center">
          <span className="font-mono text-sm">{item.quantity}</span>
        </td>
        <td className="px-4 py-2.5">
          <span className="text-xs text-muted-foreground">{item.unit}</span>
        </td>
      </tr>
      {hasChildren &&
        expanded &&
        item.children?.map((child) => (
          <BomTreeRow key={child.id} item={child} depth={depth + 1} />
        ))}
    </>
  );
}

export function BomTree({ items }: BomTreeProps) {
  const [expandAll, setExpandAll] = useState(true);
  const key = expandAll ? "expanded" : "collapsed";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandAll((v) => !v)}
        >
          {expandAll ? "Collapse All" : "Expand All"}
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export BOM
        </Button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="w-10" />
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Part Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Part Name
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Unit
                </th>
              </tr>
            </thead>
            <tbody key={key}>
              {items.map((item) => (
                <BomTreeRow
                  key={item.id}
                  item={item}
                  defaultExpanded={expandAll}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
