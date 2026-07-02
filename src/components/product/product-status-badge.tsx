"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatLifecycleLabel } from "@/lib/product-utils";
import type { LifecycleState } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductStatusBadgeProps {
  status: LifecycleState;
  className?: string;
  showFullLabel?: boolean;
}

export function ProductStatusBadge({
  status,
  className,
  showFullLabel = false,
}: ProductStatusBadgeProps) {
  if (showFullLabel) {
    return <StatusBadge status={status} className={className} />;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border px-2 py-0.5",
        status === "Draft" &&
          "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        status === "In Review" &&
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
        status === "Released" &&
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
        status === "Obsolete" &&
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
        status === "Frozen" &&
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
        status === "Archived" &&
          "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
        className
      )}
    >
      {formatLifecycleLabel(status)}
    </Badge>
  );
}
