"use client";

import { useRouter } from "next/navigation";
import { ProductStatusBadge } from "./product-status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Product } from "@/types";
import { ArrowLeft, Copy, Edit3, GitBranch } from "lucide-react";

interface ProductHeaderProps {
  product: Product;
}

export function ProductHeader({ product }: ProductHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-14 z-20 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mt-0.5 shrink-0"
            onClick={() => router.push("/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight truncate">
                {product.name}
              </h1>
              <ProductStatusBadge status={product.lifecycleState} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                {product.partNumber}
              </span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span className="flex items-center gap-1">
                <GitBranch className="h-3.5 w-3.5" />
                Rev {product.revision}
              </span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span>{product.productType}</span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span>{product.category}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 pl-12 sm:pl-0">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button size="sm" className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            New Revision
          </Button>
        </div>
      </div>
    </div>
  );
}
