"use client";

import { ProductStatusBadge } from "@/components/product/product-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate, getInitials } from "@/lib/product-utils";
import { useDocumentsStore } from "@/store/documents-store";
import type { ManagedDocument } from "@/types/documents";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  Eye,
  FileText,
  History,
  Lock,
  LockOpen,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentTableProps {
  documents: ManagedDocument[];
  loading?: boolean;
  onSelect: (doc: ManagedDocument) => void;
  onClearFilters?: () => void;
}

const typeIcons: Record<string, string> = {
  PDF: "text-red-600 dark:text-red-400",
  STEP: "text-blue-600 dark:text-blue-400",
  SLDPRT: "text-violet-600 dark:text-violet-400",
  CAD: "text-cyan-600 dark:text-cyan-400",
  DWG: "text-orange-600 dark:text-orange-400",
  DOCX: "text-blue-700 dark:text-blue-300",
  XLSX: "text-emerald-600 dark:text-emerald-400",
};

export function DocumentTable({
  documents,
  loading = false,
  onSelect,
  onClearFilters,
}: DocumentTableProps) {
  const checkOut = useDocumentsStore((s) => s.checkOut);
  const checkIn = useDocumentsStore((s) => s.checkIn);
  const getCheckoutState = useDocumentsStore((s) => s.getCheckoutState);
  const checkoutOverrides = useDocumentsStore((s) => s.checkoutOverrides);

  if (loading) {
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border px-4 py-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents found"
        description="Try adjusting your search or filter criteria"
        action={
          onClearFilters
            ? { label: "Clear Filters", onClick: onClearFilters }
            : undefined
        }
      />
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border sticky top-0">
            <tr>
              {[
                "Name",
                "Type",
                "Product",
                "Version",
                "Revision",
                "Status",
                "Owner",
                "Modified",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.map((doc) => {
              const checkout = getCheckoutState(doc);
              const isCheckedOut = checkout.checkoutStatus === "Checked Out";
              void checkoutOverrides;

              return (
                <tr
                  key={doc.id}
                  onClick={() => onSelect(doc)}
                  className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <FileText
                        className={cn(
                          "h-4 w-4 shrink-0",
                          typeIcons[doc.type] ?? "text-muted-foreground"
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {doc.documentId}
                        </p>
                      </div>
                      {isCheckedOut && (
                        <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs font-mono">
                      {doc.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm">{doc.productName}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {doc.productPartNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm">v{doc.version}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      Rev {doc.revision}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ProductStatusBadge status={doc.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-muted">
                          {getInitials(doc.owner.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{doc.owner.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(doc.updatedAt)}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors outline-none cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onSelect(doc)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => alert(`Downloading ${doc.name}...`)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        {isCheckedOut ? (
                          <DropdownMenuItem onClick={() => checkIn(doc.id)}>
                            <LockOpen className="mr-2 h-4 w-4" />
                            Check In
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => checkOut(doc.id)}>
                            <Lock className="mr-2 h-4 w-4" />
                            Check Out
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onSelect(doc)}>
                          <History className="mr-2 h-4 w-4" />
                          History
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
    </div>
  );
}
