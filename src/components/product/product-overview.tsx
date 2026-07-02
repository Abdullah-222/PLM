"use client";

import { StatCard } from "@/components/shared/stat-card";
import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import { SectionHeader } from "@/components/shared/section-header";
import { ProductStatusBadge } from "./product-status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getInitials } from "@/lib/product-utils";
import type { Product, ProductKPIs } from "@/types";
import {
  ClipboardList,
  Clock,
  FileText,
  Network,
} from "lucide-react";

interface ProductOverviewProps {
  product: Product;
  kpis: ProductKPIs;
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

export function ProductOverview({ product, kpis }: ProductOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Documents"
          value={kpis.documentsCount}
          icon={FileText}
        />
        <StatCard title="Parts" value={kpis.partsCount} icon={Network} />
        <StatCard
          title="Open Changes"
          value={kpis.openChanges}
          icon={ClipboardList}
        />
        <StatCard
          title="Approvals Pending"
          value={kpis.pendingApprovals}
          icon={Clock}
          changeType={kpis.pendingApprovals > 0 ? "negative" : "neutral"}
          change={kpis.pendingApprovals > 0 ? "Action required" : "None pending"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AppCard className="lg:col-span-2">
          <AppCardHeader>
            <SectionHeader title="Product Information" />
          </AppCardHeader>
          <AppCardContent>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Product Name" value={product.name} />
              <InfoRow label="Product ID" value={product.partNumber} mono />
              <InfoRow label="Current Revision" value={`Rev ${product.revision}`} />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Lifecycle State
                </p>
                <ProductStatusBadge status={product.lifecycleState} />
              </div>
              <InfoRow label="Product Type" value={product.productType} />
              <InfoRow label="Category" value={product.category} />
              <InfoRow
                label="Created Date"
                value={formatDate(product.createdAt, { dateStyle: "long" })}
              />
              <InfoRow
                label="Last Modified"
                value={formatDate(product.updatedAt, { dateStyle: "long" })}
              />
            </div>
          </AppCardContent>
        </AppCard>

        <AppCard>
          <AppCardHeader>
            <SectionHeader title="Owner" />
          </AppCardHeader>
          <AppCardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted text-sm">
                  {getInitials(product.owner.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{product.owner.name}</p>
                <p className="text-xs text-muted-foreground">{product.owner.role}</p>
                <p className="text-xs text-muted-foreground">
                  {product.department ?? product.owner.department}
                </p>
              </div>
            </div>
          </AppCardContent>
        </AppCard>
      </div>
    </div>
  );
}
