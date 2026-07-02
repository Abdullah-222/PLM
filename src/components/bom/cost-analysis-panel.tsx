"use client";

import { StatCard } from "@/components/shared/stat-card";
import type { CostAnalysis } from "@/types";
import { Boxes, Layers, Wallet } from "lucide-react";

export function CostAnalysisPanel({ cost }: { cost: CostAnalysis }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard title="Assembly Cost" value={`$${cost.assemblyCost.toLocaleString()}`} icon={Wallet} />
      <StatCard title="Subassembly Cost" value={`$${cost.subassemblyCost.toLocaleString()}`} icon={Layers} />
      <StatCard title="Part Cost" value={`$${cost.partCost.toLocaleString()}`} icon={Boxes} />
    </div>
  );
}
