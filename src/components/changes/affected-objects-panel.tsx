"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { seedProducts } from "@/constants/seed-products";
import { managedDocuments } from "@/constants/documents-data";
import { bomAssembliesSeed } from "@/constants/bom-data";
import { revisionRecords } from "@/constants/revisions-data";
import type { AffectedObject, AffectedObjectType } from "@/types/changes";
import { Link2, Package, Unlink } from "lucide-react";

const selectClass =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";

const objectHref = (obj: AffectedObject) => {
  switch (obj.type) {
    case "Product":
      return `/products/${obj.objectId}`;
    case "Document":
      return "/documents";
    case "BOM":
      return `/bom/${obj.objectId}`;
    case "Revision":
      return `/revisions/${obj.objectId}`;
  }
};

interface AffectedObjectsPanelProps {
  changeId: string;
  objects: AffectedObject[];
  onLink: (
    type: AffectedObjectType,
    objectId: string,
    label: string,
    meta?: Partial<AffectedObject>
  ) => void;
  onUnlink: (affectedObjectId: string) => void;
}

export function AffectedObjectsPanel({
  objects,
  onLink,
  onUnlink,
}: AffectedObjectsPanelProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkType, setLinkType] = useState<AffectedObjectType>("Product");
  const [selectedId, setSelectedId] = useState("");

  const catalog = () => {
    switch (linkType) {
      case "Product":
        return seedProducts.map((p) => ({
          id: p.id,
          label: `${p.partNumber} — ${p.name}`,
          meta: { partNumber: p.partNumber, revision: p.revision },
        }));
      case "Document":
        return managedDocuments.map((d) => ({
          id: d.id,
          label: d.name,
          meta: {},
        }));
      case "BOM":
        return bomAssembliesSeed.map((b) => ({
          id: b.id,
          label: `${b.name} BOM`,
          meta: { revision: b.revision },
        }));
      case "Revision":
        return revisionRecords.map((r) => ({
          id: r.id,
          label: `${r.objectPartNumber} Rev ${r.revision}`,
          meta: { partNumber: r.objectPartNumber, revision: r.revision },
        }));
    }
  };

  const handleLink = () => {
    const item = catalog().find((x) => x.id === selectedId);
    if (!item) return;
    if (objects.some((o) => o.objectId === selectedId && o.type === linkType)) {
      setLinkOpen(false);
      return;
    }
    onLink(linkType, selectedId, item.label, item.meta);
    setLinkOpen(false);
    setSelectedId("");
  };

  const grouped = {
    Product: objects.filter((o) => o.type === "Product"),
    Document: objects.filter((o) => o.type === "Document"),
    BOM: objects.filter((o) => o.type === "BOM"),
    Revision: objects.filter((o) => o.type === "Revision"),
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => setLinkOpen(true)}>
          <Link2 className="h-4 w-4" />
          Link Object
        </Button>
      </div>

      {objects.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No affected objects"
          description="Link products, documents, BOMs, or revisions to this change."
          action={{ label: "Link Object", onClick: () => setLinkOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            Object.entries(grouped) as [AffectedObjectType, AffectedObject[]][]
          ).map(([type, items]) => (
            <div key={type} className="rounded-xl border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b border-border">
                <h4 className="text-sm font-semibold">
                  {type}s ({items.length})
                </h4>
              </div>
              {items.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">None</p>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((obj) => (
                    <li
                      key={obj.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/30"
                    >
                      <div className="min-w-0">
                        <Link
                          href={objectHref(obj)}
                          className="text-sm font-medium hover:underline truncate block"
                        >
                          {obj.label}
                        </Link>
                        {obj.partNumber && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {obj.partNumber}
                            {obj.revision ? ` Rev ${obj.revision}` : ""}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() => onUnlink(obj.id)}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Affected Object</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Object Type</label>
              <select
                value={linkType}
                onChange={(e) => {
                  setLinkType(e.target.value as AffectedObjectType);
                  setSelectedId("");
                }}
                className={selectClass}
              >
                <option value="Product">Product</option>
                <option value="Document">Document</option>
                <option value="BOM">BOM</option>
                <option value="Revision">Revision</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Object</label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className={selectClass}
              >
                <option value="">Choose...</option>
                {catalog().map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLink} disabled={!selectedId}>
              Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
