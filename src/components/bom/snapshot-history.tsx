"use client";

import { Button } from "@/components/ui/button";
import type { BomSnapshot } from "@/types";
import { RotateCcw } from "lucide-react";

interface SnapshotHistoryProps {
  snapshots: BomSnapshot[];
  onRestore: (snapshotId: string) => void;
}

export function SnapshotHistory({ snapshots, onRestore }: SnapshotHistoryProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {["Snapshot Name", "Date", "User", "Revision", ""].map((column) => (
              <th key={column} className="px-3 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {snapshots.map((snapshot) => (
            <tr key={snapshot.id} className="border-b border-border/70">
              <td className="px-3 py-2">{snapshot.snapshotName}</td>
              <td className="px-3 py-2">{new Date(snapshot.date).toLocaleString()}</td>
              <td className="px-3 py-2">{snapshot.user}</td>
              <td className="px-3 py-2">{snapshot.revision}</td>
              <td className="px-3 py-2 text-right">
                <Button variant="outline" size="sm" onClick={() => onRestore(snapshot.id)}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
