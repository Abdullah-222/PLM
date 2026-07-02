"use client";

import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import type { BomComparisonResult, BomSnapshot } from "@/types";

interface BomComparisonViewProps {
  snapshots: BomSnapshot[];
  selectedA: string;
  selectedB: string;
  onSelectA: (id: string) => void;
  onSelectB: (id: string) => void;
  onCompare: () => void;
  comparison: BomComparisonResult | null;
}

export function BomComparisonView({
  snapshots,
  selectedA,
  selectedB,
  onSelectA,
  onSelectB,
  onCompare,
  comparison,
}: BomComparisonViewProps) {
  return (
    <AppCard>
      <AppCardHeader>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">BOM Comparison</h3>
          <button className="text-xs underline" onClick={onCompare}>
            Compare revisions
          </button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select className="h-9 rounded-md border px-2 text-sm" value={selectedA} onChange={(e) => onSelectA(e.target.value)}>
            {snapshots.map((snapshot) => (
              <option key={snapshot.id} value={snapshot.id}>
                {snapshot.snapshotName}
              </option>
            ))}
          </select>
          <select className="h-9 rounded-md border px-2 text-sm" value={selectedB} onChange={(e) => onSelectB(e.target.value)}>
            {snapshots.map((snapshot) => (
              <option key={snapshot.id} value={snapshot.id}>
                {snapshot.snapshotName}
              </option>
            ))}
          </select>
        </div>
      </AppCardHeader>
      <AppCardContent className="space-y-3">
        {comparison ? (
          <>
            <ComparisonCard title="Added Parts" items={comparison.added.map((item) => `${item.partNumber} · ${item.partName}`)} />
            <ComparisonCard title="Removed Parts" items={comparison.removed.map((item) => `${item.partNumber} · ${item.partName}`)} />
            <ComparisonCard
              title="Modified Quantities"
              items={comparison.quantityChanged.map((item) => `${item.partNumber}: ${item.from} -> ${item.to}`)}
            />
            <ComparisonCard
              title="Modified Revisions"
              items={comparison.revisionChanged.map((item) => `${item.partNumber}: ${item.from} -> ${item.to}`)}
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Select snapshots and run comparison.</p>
        )}
      </AppCardContent>
    </AppCard>
  );
}

function ComparisonCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm mt-1">No changes</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
