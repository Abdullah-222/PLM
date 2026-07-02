"use client";

import { useState } from "react";
import { useCadStore } from "@/store/cad-store";
import { CadUploadWizard } from "./cad-upload-wizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Upload,
  FolderPlus,
  Network,
  Columns,
  Download,
  RefreshCw,
  AlertTriangle,
  Scale,
} from "lucide-react";
import type { CadFile } from "@/types/cad";

interface CadToolbarProps {
  onRefresh: () => void;
}

export function CadToolbar({ onRefresh }: CadToolbarProps) {
  const { files, folders, createFolder } = useCadStore();

  // Wizard States
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isAssemblyMode, setIsAssemblyMode] = useState(false);

  // New Folder Dialog States
  const [folderOpen, setFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<string>("none");

  // Compare Models Dialog States
  const [compareOpen, setCompareOpen] = useState(false);
  const [fileAId, setFileAId] = useState("");
  const [fileBId, setFileBId] = useState("");

  const fileA = files.find((f) => f.id === fileAId);
  const fileB = files.find((f) => f.id === fileBId);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const pid = parentFolderId === "none" ? null : parentFolderId;
      createFolder(newFolderName.trim(), pid);
      setNewFolderName("");
      setParentFolderId("none");
      setFolderOpen(false);
    }
  };

  const handleExport = () => {
    // Generate CSV contents
    const headers = "File Name,Part Number,Type,Software,Revision,Status,Owner,Size,Material,Weight,Project\n";
    const rows = files
      .map(
        (f) =>
          `"${f.fileName}","${f.partNumber}","${f.type}","${f.software}","${f.currentRevision}","${f.status}","${f.owner.name}","${f.size}","${f.material}","${f.weight}","${f.project}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PLM_CAD_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-border pb-4">
      {/* Primary CAD Toolbar actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            setIsAssemblyMode(false);
            setUploadOpen(true);
          }}
        >
          <Upload className="h-4 w-4" />
          Upload CAD
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs border-border"
          onClick={() => setFolderOpen(true)}
        >
          <FolderPlus className="h-4 w-4" />
          New Folder
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs border-border"
          onClick={() => {
            setIsAssemblyMode(true);
            setUploadOpen(true);
          }}
        >
          <Network className="h-4 w-4 text-blue-500" />
          Import Assembly
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs border-border"
          onClick={() => setCompareOpen(true)}
        >
          <Columns className="h-4 w-4 text-purple-500" />
          Compare Models
        </Button>
      </div>

      {/* Utility/refresh actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* 1. Upload/Import Wizard */}
      <CadUploadWizard open={uploadOpen} onOpenChange={setUploadOpen} defaultIsAssembly={isAssemblyMode} />

      {/* 2. New Folder Dialog */}
      <Dialog open={folderOpen} onOpenChange={setFolderOpen}>
        <DialogContent className="sm:max-w-[350px] text-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Create Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Folder Name</label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Hydraulic Controls"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Parent Folder</label>
              <select
                value={parentFolderId}
                onChange={(e) => setParentFolderId(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none"
              >
                <option value="none">None (Root level)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setFolderOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateFolder} className="text-xs">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Compare Models Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="sm:max-w-[650px] text-xs max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-purple-600" />
              CAD Model Comparison Tool
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              {/* Selector A */}
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Select Model A</label>
                <select
                  value={fileAId}
                  onChange={(e) => setFileAId(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm"
                >
                  <option value="">-- Choose Model A --</option>
                  {files.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fileName} (Rev {f.currentRevision})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector B */}
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Select Model B</label>
                <select
                  value={fileBId}
                  onChange={(e) => setFileBId(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm"
                >
                  <option value="">-- Choose Model B --</option>
                  {files.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fileName} (Rev {f.currentRevision})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {fileA && fileB ? (
              <div className="border border-border rounded-xl overflow-hidden bg-card mt-3">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border font-semibold text-muted-foreground">
                      <th className="p-2.5">Attribute</th>
                      <th className="p-2.5 border-l border-border bg-blue-50/20">{fileA.fileName}</th>
                      <th className="p-2.5 border-l border-border bg-purple-50/20">{fileB.fileName}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-2.5 font-medium text-muted-foreground">Part Number</td>
                      <td className="p-2.5 border-l border-border">{fileA.partNumber}</td>
                      <td className="p-2.5 border-l border-border">{fileB.partNumber}</td>
                    </tr>
                    <tr className={cn(fileA.currentRevision !== fileB.currentRevision && "bg-amber-50/30")}>
                      <td className="p-2.5 font-medium text-muted-foreground flex items-center gap-1">
                        Revision
                        {fileA.currentRevision !== fileB.currentRevision && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                      </td>
                      <td className="p-2.5 border-l border-border font-mono">{fileA.currentRevision}</td>
                      <td className="p-2.5 border-l border-border font-mono">{fileB.currentRevision}</td>
                    </tr>
                    <tr className={cn(fileA.software !== fileB.software && "bg-amber-50/30")}>
                      <td className="p-2.5 font-medium text-muted-foreground">CAD Software</td>
                      <td className="p-2.5 border-l border-border">{fileA.software}</td>
                      <td className="p-2.5 border-l border-border">{fileB.software}</td>
                    </tr>
                    <tr className={cn(fileA.size !== fileB.size && "bg-amber-50/30")}>
                      <td className="p-2.5 font-medium text-muted-foreground">File Size</td>
                      <td className="p-2.5 border-l border-border">{fileA.size}</td>
                      <td className="p-2.5 border-l border-border">{fileB.size}</td>
                    </tr>
                    <tr className={cn(fileA.material !== fileB.material && "bg-amber-50/30")}>
                      <td className="p-2.5 font-medium text-muted-foreground">Material</td>
                      <td className="p-2.5 border-l border-border">{fileA.material}</td>
                      <td className="p-2.5 border-l border-border">{fileB.material}</td>
                    </tr>
                    <tr className={cn(fileA.weight !== fileB.weight && "bg-amber-50/30")}>
                      <td className="p-2.5 font-medium text-muted-foreground">Weight</td>
                      <td className="p-2.5 border-l border-border">{fileA.weight}</td>
                      <td className="p-2.5 border-l border-border">{fileB.weight}</td>
                    </tr>
                    <tr className={cn(fileA.volume !== fileB.volume && "bg-amber-50/30")}>
                      <td className="p-2.5 font-medium text-muted-foreground">Volume</td>
                      <td className="p-2.5 border-l border-border">{fileA.volume}</td>
                      <td className="p-2.5 border-l border-border">{fileB.volume}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium text-muted-foreground">Project Code</td>
                      <td className="p-2.5 border-l border-border truncate max-w-[140px]">{fileA.project}</td>
                      <td className="p-2.5 border-l border-border truncate max-w-[140px]">{fileB.project}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/10 text-muted-foreground text-center">
                <Columns className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p>Select both model files from the options above to view side-by-side data analysis comparison.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCompareOpen(false)} className="text-xs">
              Close Comparison
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
