"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import { formatDate } from "@/lib/product-utils";
import type { ComplianceReport, ComplianceReportType } from "@/types/audit";
import { Download, FileBarChart } from "lucide-react";

const selectClass =
  "h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";

interface ComplianceReportViewerProps {
  reports: ComplianceReport[];
  onGenerate: (type: ComplianceReportType, from: string, to: string) => ComplianceReport;
}

export function ComplianceReportViewer({
  reports,
  onGenerate,
}: ComplianceReportViewerProps) {
  const [type, setType] = useState<ComplianceReportType>("Change History");
  const [from, setFrom] = useState("2026-05-01");
  const [to, setTo] = useState("2026-05-25");
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 500));
    const report = onGenerate(type, from, to);
    setSelectedReport(report);
    setGenerating(false);
  };

  const downloadReport = (report: ComplianceReport) => {
    const headers = ["Timestamp", "User", "Object", "Action", "Details"];
    const rows = report.rows.map((r) =>
      [r.timestamp, r.user, r.object, r.action, r.details].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.type.replace(/\s/g, "_")}_${report.generatedAt.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <AppCard>
        <AppCardHeader>
          <div>
            <h3 className="font-semibold">Generate Compliance Report</h3>
            <p className="text-sm text-muted-foreground">
              Frontend-generated reports from audit log data
            </p>
          </div>
        </AppCardHeader>
        <AppCardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Report Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ComplianceReportType)}
                className={selectClass}
              >
                <option value="Change History">Change History</option>
                <option value="Approval History">Approval History</option>
                <option value="Revision History">Revision History</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={selectClass}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={selectClass}
              />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="gap-1.5">
              <FileBarChart className="h-4 w-4" />
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </AppCardContent>
      </AppCard>

      {selectedReport && (
        <AppCard>
          <AppCardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">{selectedReport.type}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedReport.recordCount} records · Generated{" "}
                  {formatDate(selectedReport.generatedAt)} by{" "}
                  {selectedReport.generatedBy.name}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 shrink-0"
                onClick={() => downloadReport(selectedReport)}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </AppCardHeader>
          <AppCardContent>
            <div className="rounded-lg border border-border overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    {["Timestamp", "User", "Object", "Action", "Details"].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs uppercase text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedReport.rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                        {formatDate(row.timestamp, { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-3 py-2">{row.user}</td>
                      <td className="px-3 py-2">{row.object}</td>
                      <td className="px-3 py-2">
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {row.action}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {row.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AppCardContent>
        </AppCard>
      )}

      {reports.length > 0 && !selectedReport && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Previous Reports</p>
          {reports.slice(0, 3).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedReport(r)}
              className="w-full text-left rounded-lg border border-border px-4 py-3 hover:bg-muted/50 text-sm"
            >
              {r.type} — {r.recordCount} records — {formatDate(r.generatedAt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
