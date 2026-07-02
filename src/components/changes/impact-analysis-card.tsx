"use client";

import { AppCard, AppCardContent } from "@/components/shared/app-card";
import type { EngineeringChange } from "@/types/changes";
import { AlertTriangle, Clock, DollarSign } from "lucide-react";

interface ImpactAnalysisCardProps {
  change: EngineeringChange;
}

const riskColors: Record<string, string> = {
  Low: "text-emerald-600 bg-emerald-500/10",
  Medium: "text-amber-600 bg-amber-500/10",
  High: "text-orange-600 bg-orange-500/10",
  Critical: "text-red-600 bg-red-500/10",
};

export function ImpactAnalysisCard({ change }: ImpactAnalysisCardProps) {
  const { impact, affectedObjects } = change;
  const byType = {
    Product: affectedObjects.filter((o) => o.type === "Product"),
    Document: affectedObjects.filter((o) => o.type === "Document"),
    BOM: affectedObjects.filter((o) => o.type === "BOM"),
    Revision: affectedObjects.filter((o) => o.type === "Revision"),
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <AppCard>
          <AppCardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cost Impact</p>
                <p className="text-xl font-bold">
                  {impact.costImpact >= 0 ? "+" : ""}$
                  {Math.abs(impact.costImpact).toLocaleString()}
                </p>
              </div>
            </div>
          </AppCardContent>
        </AppCard>
        <AppCard>
          <AppCardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <Clock className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time Impact</p>
                <p className="text-xl font-bold">{impact.scheduleImpactDays} days</p>
              </div>
            </div>
          </AppCardContent>
        </AppCard>
        <AppCard>
          <AppCardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${riskColors[impact.riskLevel]}`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Risk Score</p>
                <p className="text-xl font-bold">{impact.riskLevel}</p>
              </div>
            </div>
          </AppCardContent>
        </AppCard>
      </div>

      {impact.notes && (
        <div className="rounded-lg border border-border p-4 text-sm">
          <p className="font-medium mb-1">Assessment Notes</p>
          <p className="text-muted-foreground">{impact.notes}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {(
          Object.entries(byType) as [
            keyof typeof byType,
            (typeof byType)["Product"],
          ][]
        ).map(([type, items]) => (
          <div key={type} className="rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold mb-3">
              Affected {type}s ({items.length})
            </h4>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">None linked</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between text-sm rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <span className="font-medium truncate">{item.label}</span>
                    {item.revision && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        Rev {item.revision}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
