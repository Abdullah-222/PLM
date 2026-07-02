"use client";

import Link from "next/link";
import type { EngineeringChange } from "@/types/changes";
import { ArrowRight, ClipboardList, FileText, GitBranch, Network, Package } from "lucide-react";

const typeIcons = {
  Product: Package,
  Document: FileText,
  BOM: Network,
  Revision: GitBranch,
};

const typeColors = {
  Product: "border-blue-500/30 bg-blue-500/5",
  Document: "border-amber-500/30 bg-amber-500/5",
  BOM: "border-violet-500/30 bg-violet-500/5",
  Revision: "border-emerald-500/30 bg-emerald-500/5",
};

const objectHref = (type: string, objectId: string) => {
  switch (type) {
    case "Product":
      return `/products/${objectId}`;
    case "Document":
      return "/documents";
    case "BOM":
      return `/bom/${objectId}`;
    case "Revision":
      return `/revisions/${objectId}`;
    default:
      return "#";
  }
};

interface ChangeRelationshipGraphProps {
  change: EngineeringChange;
}

export function ChangeRelationshipGraph({ change }: ChangeRelationshipGraphProps) {
  const grouped = change.affectedObjects.reduce(
    (acc, obj) => {
      if (!acc[obj.type]) acc[obj.type] = [];
      acc[obj.type].push(obj);
      return acc;
    },
    {} as Record<string, typeof change.affectedObjects>
  );

  return (
    <div className="rounded-xl border border-border p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary/5 px-6 py-4">
          <ClipboardList className="h-6 w-6 text-primary" />
          <div className="text-center">
            <p className="font-mono text-sm font-bold">{change.changeNumber}</p>
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
              {change.title}
            </p>
          </div>
        </div>

        {change.affectedObjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No linked objects</p>
        ) : (
          <div className="grid gap-4 w-full sm:grid-cols-2">
            {(
              Object.entries(grouped) as [
                keyof typeof typeIcons,
                typeof change.affectedObjects,
              ][]
            ).map(([type, items]) => {
              const Icon = typeIcons[type];
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                  </div>
                  {items.map((obj) => (
                    <Link
                      key={obj.id}
                      href={objectHref(type, obj.objectId)}
                      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${typeColors[type]}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{obj.label}</p>
                        <p className="text-xs text-muted-foreground">{type}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
