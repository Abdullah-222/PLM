"use client";

import { ProductStatusBadge } from "@/components/product/product-status-badge";
import { VersionTimeline } from "./version-timeline";
import { formatDate, getInitials } from "@/lib/product-utils";
import { useDocumentsStore } from "@/store/documents-store";
import type { ManagedDocument } from "@/types/documents";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  ExternalLink,
  GitBranch,
  Lock,
  LockOpen,
  Network,
  Package,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DocumentViewerDrawerProps {
  document: ManagedDocument | null;
  open: boolean;
  onClose: () => void;
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
        {label}
      </span>
      <span className="text-sm text-right">{value}</span>
    </div>
  );
}

export function DocumentViewerDrawer({
  document,
  open,
  onClose,
}: DocumentViewerDrawerProps) {
  const checkOut = useDocumentsStore((s) => s.checkOut);
  const checkIn = useDocumentsStore((s) => s.checkIn);
  const getCheckoutState = useDocumentsStore((s) => s.getCheckoutState);
  const checkoutOverrides = useDocumentsStore((s) => s.checkoutOverrides);

  if (!document) return null;

  const checkout = getCheckoutState(document);
  const isCheckedOut = checkout.checkoutStatus === "Checked Out";
  void checkoutOverrides;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="space-y-1 min-w-0">
              <SheetTitle className="text-base leading-snug truncate">
                {document.name}
              </SheetTitle>
              <SheetDescription className="font-mono text-xs">
                {document.documentId}
              </SheetDescription>
            </div>
            <ProductStatusBadge status={document.status} />
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm mt-2",
              isCheckedOut
                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                : "border-border bg-muted/40 text-muted-foreground"
            )}
          >
            {isCheckedOut ? (
              <>
                <Lock className="h-4 w-4 shrink-0" />
                <span>
                  Checked out by{" "}
                  <span className="font-medium text-foreground">
                    {checkout.checkedOutBy?.name ?? "Unknown"}
                  </span>
                  {checkout.checkedOutAt && (
                    <span className="text-xs">
                      {" "}
                      · {formatDate(checkout.checkedOutAt)}
                    </span>
                  )}
                </span>
              </>
            ) : (
              <>
                <LockOpen className="h-4 w-4 shrink-0" />
                <span>Checked in — available for edit</span>
              </>
            )}
          </div>
        </SheetHeader>

        <div className="px-6 py-4 flex gap-2">
          {isCheckedOut ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => checkIn(document.id)}
            >
              <LockOpen className="h-3.5 w-3.5" />
              Check In
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => checkOut(document.id)}
            >
              <Lock className="h-3.5 w-3.5" />
              Check Out
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => alert(`Downloading ${document.name}...`)}
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>

        <Tabs defaultValue="metadata" className="px-6 pb-6">
          <TabsList className="w-full">
            <TabsTrigger value="metadata" className="flex-1 text-xs">
              Metadata
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 text-xs">
              Version History
            </TabsTrigger>
            <TabsTrigger value="links" className="flex-1 text-xs">
              Links
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metadata" className="mt-4 space-y-1">
            <MetaRow label="Type" value={<Badge variant="outline">{document.type}</Badge>} />
            <MetaRow label="Version" value={<span className="font-mono">v{document.version}</span>} />
            <MetaRow label="Revision" value={<span className="font-mono">Rev {document.revision}</span>} />
            <MetaRow label="Size" value={document.size} />
            <MetaRow
              label="Owner"
              value={
                <div className="flex items-center gap-2 justify-end">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[9px] bg-muted">
                      {getInitials(document.owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  {document.owner.name}
                </div>
              }
            />
            <MetaRow label="Modified" value={formatDate(document.updatedAt, { dateStyle: "long" })} />
            <MetaRow label="Created" value={formatDate(document.createdAt, { dateStyle: "long" })} />
            {document.description && (
              <div className="pt-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Description
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {document.description}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <VersionTimeline versions={document.versionHistory} />
          </TabsContent>

          <TabsContent value="links" className="mt-4 space-y-3">
            <Link
              href={`/products/${document.productId}`}
              className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              <Package className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Linked Product</p>
                <p className="text-xs text-muted-foreground truncate">
                  {document.productPartNumber} — {document.productName}
                </p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
            </Link>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Linked Revision</p>
                <p className="text-xs text-muted-foreground font-mono">
                  Rev {document.linkedRevision}
                </p>
              </div>
            </div>
            {document.linkedBomId && (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Network className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium">Linked BOM</p>
                  <p className="text-xs text-muted-foreground">
                    {document.productName} Bill of Materials
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
