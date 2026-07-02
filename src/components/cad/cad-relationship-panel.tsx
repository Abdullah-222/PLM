"use client";

import Link from "next/link";
import {
  Package,
  Network,
  FileText,
  ClipboardList,
  Workflow,
  GitBranch,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CadFile } from "@/types/cad";

interface CadRelationshipPanelProps {
  file: CadFile;
}

export function CadRelationshipPanel({ file }: CadRelationshipPanelProps) {
  return (
    <div className="space-y-4 text-xs">
      <div className="border border-border rounded-xl p-4 bg-card shadow-sm space-y-4">
        <div>
          <h4 className="text-sm font-bold text-foreground font-semibold">Active Object Relationships</h4>
          <p className="text-[10px] text-muted-foreground">Related artifacts and change orders inside the PLM Suite.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Linked Product */}
          <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Package className="h-4 w-4 text-blue-500" />
                <span>Linked Product Item</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                {file.linkedProduct ? `${file.linkedProduct.partNumber} · ${file.linkedProduct.name}` : "No item linked."}
              </p>
            </div>
            {file.linkedProduct && (
              <Link href={`/products?id=${file.linkedProduct.id}`} className="w-full">
                <Button variant="outline" size="sm" className="w-full h-7 text-[10px] gap-1 border-border">
                  <ExternalLink className="h-3 w-3" />
                  View Product Workspace
                </Button>
              </Link>
            )}
          </div>

          {/* Linked BOM */}
          <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Network className="h-4 w-4 text-teal-500" />
                <span>Associated BOM Structure</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                {file.linkedBomId ? `BOM-SNAP-${file.partNumber}` : "No BOM associated."}
              </p>
            </div>
            {file.linkedBomId && (
              <Link href={`/bom`} className="w-full">
                <Button variant="outline" size="sm" className="w-full h-7 text-[10px] gap-1 border-border">
                  <ExternalLink className="h-3 w-3" />
                  Inspect Bill of Materials
                </Button>
              </Link>
            )}
          </div>

          {/* Linked Revision */}
          <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <GitBranch className="h-4 w-4 text-purple-500" />
                <span>Lifecycle Release Revision</span>
              </div>
              <p className="text-muted-foreground text-[11px]">
                {file.linkedRevision ? `${file.linkedRevision}` : "No revision tagged."}
              </p>
            </div>
            <Link href={`/revisions`} className="w-full">
              <Button variant="outline" size="sm" className="w-full h-7 text-[10px] gap-1 border-border">
                <ExternalLink className="h-3 w-3" />
                Verify Revision Log
              </Button>
            </Link>
          </div>

          {/* Linked Engineering Changes */}
          <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/5 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <ClipboardList className="h-4 w-4 text-orange-500" />
                <span>Engineering Change Requests</span>
              </div>
              <div className="space-y-1">
                {file.linkedChanges && file.linkedChanges.length > 0 ? (
                  file.linkedChanges.map((ecr) => (
                    <p key={ecr.id} className="text-muted-foreground text-[11px] font-medium">
                      {ecr.id}: {ecr.title} ({ecr.status})
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground text-[11px]">No active ECR/ECO records.</p>
                )}
              </div>
            </div>
            <Link href={`/changes`} className="w-full">
              <Button variant="outline" size="sm" className="w-full h-7 text-[10px] gap-1 border-border">
                <ExternalLink className="h-3 w-3" />
                View Change Orders
              </Button>
            </Link>
          </div>

          {/* Linked Workflows */}
          <div className="border border-border rounded-lg p-3 space-y-2 bg-muted/5 flex flex-col justify-between col-span-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Workflow className="h-4 w-4 text-emerald-500" />
                <span>Approval Sign-off Workflows</span>
              </div>
              <div className="space-y-1">
                {file.linkedWorkflows && file.linkedWorkflows.length > 0 ? (
                  file.linkedWorkflows.map((wf) => (
                    <p key={wf.id} className="text-muted-foreground text-[11px] font-medium">
                      {wf.id}: {wf.name} ({wf.status})
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground text-[11px]">No pending release routes.</p>
                )}
              </div>
            </div>
            <Link href={`/workflows`} className="w-full">
              <Button variant="outline" size="sm" className="w-full h-7 text-[10px] gap-1 border-border">
                <ExternalLink className="h-3 w-3" />
                Manage Approval Workflows
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Linked Documents Table */}
      <div className="border border-border rounded-xl p-4 bg-card shadow-sm space-y-3">
        <div className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-blue-500" />
          <h4 className="text-sm font-bold text-foreground font-semibold">Linked Technical Documents</h4>
        </div>
        {file.linkedDocuments && file.linkedDocuments.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/40 border-b text-muted-foreground font-semibold">
                  <th className="p-2">Doc ID / Name</th>
                  <th className="p-2 w-20">Type</th>
                  <th className="p-2 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {file.linkedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30">
                    <td className="p-2 font-medium text-foreground">{doc.name}</td>
                    <td className="p-2 text-muted-foreground font-mono">{doc.type}</td>
                    <td className="p-2 text-center">
                      <Link href={`/documents`}>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground p-3 text-center border border-dashed rounded-lg">
            No specification documents linked.
          </p>
        )}
      </div>
    </div>
  );
}
