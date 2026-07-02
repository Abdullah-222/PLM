"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ProductStatusBadge } from "./product-status-badge";
import { TablePagination } from "./table-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, getInitials } from "@/lib/product-utils";
import type { Product } from "@/types";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Copy,
  Eye,
  MoreHorizontal,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductsStore } from "@/store/products-store";

interface ProductsTableProps {
  data: Product[];
  loading?: boolean;
  onClearFilters?: () => void;
}

function SortHeader({
  label,
  sorted,
}: {
  label: string;
  sorted: false | "asc" | "desc";
}) {
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Icon className={cn("h-3.5 w-3.5", !sorted && "opacity-40")} />
    </span>
  );
}

export function ProductsTable({
  data,
  loading = false,
  onClearFilters,
}: ProductsTableProps) {
  const router = useRouter();
  const archiveProduct = useProductsStore((s) => s.archiveProduct);
  const createdProducts = useProductsStore((s) => s.createdProducts);
  const createdIds = useMemo(
    () => new Set(createdProducts.map((p) => p.id)),
    [createdProducts]
  );
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "partNumber",
        header: ({ column }) => (
          <SortHeader
            label="Product ID"
            sorted={column.getIsSorted() || false}
          />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium">
            {row.original.partNumber}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortHeader label="Product Name" sorted={column.getIsSorted() || false} />
        ),
        cell: ({ row }) => (
          <div className="min-w-[180px]">
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {row.original.category}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "productType",
        header: ({ column }) => (
          <SortHeader label="Type" sorted={column.getIsSorted() || false} />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.productType}
          </span>
        ),
      },
      {
        accessorKey: "revision",
        header: ({ column }) => (
          <SortHeader label="Revision" sorted={column.getIsSorted() || false} />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs">
            Rev {row.original.revision}
          </Badge>
        ),
      },
      {
        accessorKey: "lifecycleState",
        header: ({ column }) => (
          <SortHeader label="State" sorted={column.getIsSorted() || false} />
        ),
        cell: ({ row }) => (
          <ProductStatusBadge status={row.original.lifecycleState} />
        ),
      },
      {
        id: "owner",
        accessorFn: (row) => row.owner.name,
        header: ({ column }) => (
          <SortHeader label="Owner" sorted={column.getIsSorted() || false} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] bg-muted">
                {getInitials(row.original.owner.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{row.original.owner.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <SortHeader
            label="Modified Date"
            sorted={column.getIsSorted() || false}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted transition-colors outline-none cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => router.push(`/products/${row.original.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                {createdIds.has(row.original.id) && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => archiveProduct(row.original.id)}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [router, archiveProduct, createdIds]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="border-b border-border bg-muted/50 px-4 py-3">
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border px-4 py-3 last:border-0">
            {Array.from({ length: 6 }).map((__, j) => (
              <Skeleton key={j} className="h-4 flex-1 max-w-[120px]" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
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
    <div className="space-y-0">
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap",
                        header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/products/${row.original.id}`)}
                  className="bg-card cursor-pointer transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <TablePagination
        pageIndex={table.getState().pagination.pageIndex}
        pageSize={table.getState().pagination.pageSize}
        totalRows={data.length}
        onPageChange={(pageIndex) => table.setPageIndex(pageIndex)}
        onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
      />
    </div>
  );
}
