"use client";

import { useState } from "react";
import { useCadStore } from "@/store/cad-store";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  History,
  RotateCcw,
  Copy,
  Scale,
  Award,
  Calendar,
  User,
  AlertTriangle,
} from "lucide-react";
import type { CadFile, CadVersion } from "@/types/cad";

interface CadVersionTimelineProps {
  file: CadFile;
}

export function CadVersionTimeline({ file }: CadVersionTimelineProps) {
  const { restoreVersion, duplicateFile, releaseModel } = useCadStore();

  // Compare version modal states
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedVer, setSelectedVer] = useState<CadVersion | null>(null);

  const handleCompare = (ver: CadVersion) => {
    setSelectedVer(ver);
    setCompareOpen(true);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="border border-border rounded-xl p-4 bg-card shadow-sm">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-foreground font-semibold">Revision History Timeline</h4>
          <p className="text-[10px] text-muted-foreground">Track changes, sign-offs, and design releases over time.</p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-6">
          {file.versions.map((ver, idx) => {
            const isCurrent = ver.revision === file.currentRevision;

            return (
              <div key={idx} className="relative">
                {/* Timeline node icon dot */}
                <div
                  className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 bg-white dark:bg-slate-950 flex items-center justify-center ${
                    isCurrent ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-400"
                  }`}
                >
                  <div className={`h-1.5 w-1.5 rounded-full ${isCurrent ? "bg-blue-500" : "bg-slate-400"}`} />
                </div>

                <div className="space-y-2 bg-muted/20 border border-border rounded-xl p-3.5 hover:bg-muted/40 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-foreground font-mono">Revision {ver.revision}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                            Current Revision
                          </span>
                        )}
                        <StatusBadge status={ver.status} />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(ver.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ver.author.name}
                        </span>
                        <span>Size: {ver.size}</span>
                      </div>
                    </div>

                    {/* Version actions */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] gap-1 px-2 border border-border"
                        onClick={() => handleCompare(ver)}
                      >
                        <Scale className="h-3.5 w-3.5" />
                        Compare
                      </Button>
                      {!isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] gap-1 px-2 border border-border"
                          onClick={() => restoreVersion(file.id, ver.version)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Restore
                        </Button>
                      )}
                      {ver.status !== "Released" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] gap-1 px-2 border border-border"
                          onClick={() => releaseModel(file.id)}
                        >
                          <Award className="h-3.5 w-3.5 text-emerald-500" />
                          Release
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] gap-1 px-2 border border-border"
                        onClick={() => duplicateFile(file.id)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Duplicate
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground pl-1.5 border-l border-border mt-1">
                    {ver.changeSummary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Modal */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="sm:max-w-[450px] text-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-blue-600" />
              Compare Revision {selectedVer?.revision} with Current
            </DialogTitle>
          </DialogHeader>

          {selectedVer && (
            <div className="space-y-4 py-2">
              <div className="border rounded-xl overflow-hidden bg-card">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-muted border-b border-border font-semibold text-muted-foreground">
                      <th className="p-2.5">Attribute</th>
                      <th className="p-2.5 border-l">Revision {selectedVer.revision} (Selected)</th>
                      <th className="p-2.5 border-l">Revision {file.currentRevision} (Current)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-2.5 font-medium text-muted-foreground">Author</td>
                      <td className="p-2.5 border-l">{selectedVer.author.name}</td>
                      <td className="p-2.5 border-l">{file.owner.name}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-muted-foreground">Release Date</td>
                      <td className="p-2.5 border-l">{new Date(selectedVer.date).toLocaleDateString()}</td>
                      <td className="p-2.5 border-l">{new Date(file.lastModified).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-muted-foreground">Status</td>
                      <td className="p-2.5 border-l">
                        <StatusBadge status={selectedVer.status} />
                      </td>
                      <td className="p-2.5 border-l">
                        <StatusBadge status={file.status} />
                      </td>
                    </tr>
                    <tr className={selectedVer.size !== file.size ? "bg-amber-50/20" : ""}>
                      <td className="p-2.5 font-medium text-muted-foreground flex items-center gap-1">
                        File Size
                        {selectedVer.size !== file.size && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                      </td>
                      <td className="p-2.5 border-l">{selectedVer.size}</td>
                      <td className="p-2.5 border-l">{file.size}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-muted-foreground">Change Log</td>
                      <td className="p-2.5 border-l italic">{selectedVer.changeSummary}</td>
                      <td className="p-2.5 border-l italic">Latest parameters updated in geometry.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setCompareOpen(false)} className="text-xs">
              Close Comparison
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
