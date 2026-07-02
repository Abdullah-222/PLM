"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCadStore } from "@/store/cad-store";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import {
  FileCode,
  Lock,
  Unlock,
  Key,
  MoreHorizontal,
  Eye,
  ArrowRight,
  Edit2,
  Copy,
  FolderInput,
  History,
  Trash2,
  UserCheck,
  CheckSquare,
  XSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CadFile } from "@/types/cad";

interface CadTableProps {
  files: CadFile[];
  loading?: boolean;
  onClearFilters?: () => void;
}

export function CadTable({ files, loading = false, onClearFilters }: CadTableProps) {
  const router = useRouter();
  const {
    folders,
    checkOutFile,
    checkInFile,
    cancelCheckout,
    lockFile,
    unlockFile,
    duplicateFile,
    deleteFile,
    moveFile,
    updateMetadata,
  } = useCadStore();

  // Selected file for quick preview sheet
  const [previewFile, setPreviewFile] = useState<CadFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Modal actions states
  const [actionFile, setActionFile] = useState<CadFile | null>(null);
  const [actionType, setActionType] = useState<"rename" | "move" | "checkout" | null>(null);
  const [inputText, setInputText] = useState("");
  const [selectFolderId, setSelectFolderId] = useState("");

  const handleOpenAction = (type: "rename" | "move" | "checkout", file: CadFile) => {
    setActionFile(file);
    setActionType(type);
    if (type === "rename") {
      setInputText(file.fileName.split(".")[0]);
    } else if (type === "move") {
      setSelectFolderId(file.folderId);
    } else if (type === "checkout") {
      setInputText("");
    }
  };

  const handleActionSubmit = () => {
    if (!actionFile || !actionType) return;

    if (actionType === "rename" && inputText.trim()) {
      const ext = actionFile.fileName.split(".").pop();
      updateMetadata(actionFile.id, { fileName: `${inputText.trim()}.${ext}` });
    } else if (actionType === "move") {
      moveFile(actionFile.id, selectFolderId);
    } else if (actionType === "checkout") {
      checkOutFile(actionFile.id, inputText.trim() || "Modifying parameters per engineering change.");
    }

    setActionFile(null);
    setActionType(null);
  };

  // Render file type visual thumbnail badge
  const renderThumbnail = (type: string) => {
    const bgColors: Record<string, string> = {
      SLDASM: "bg-blue-600 text-white",
      SLDPRT: "bg-blue-500 text-white",
      STEP: "bg-amber-600 text-white",
      STP: "bg-amber-500 text-white",
      IGES: "bg-orange-500 text-white",
      CATPRODUCT: "bg-purple-600 text-white",
      CATPART: "bg-purple-500 text-white",
      PRT: "bg-teal-600 text-white",
      DWG: "bg-red-600 text-white",
      DXF: "bg-red-500 text-white",
      PDF: "bg-emerald-600 text-white",
    };

    const colorClass = bgColors[type] || "bg-slate-600 text-white";

    return (
      <div className={cn("flex h-8 w-8 items-center justify-center rounded text-[8px] font-extrabold shadow-sm shrink-0", colorClass)}>
        {type}
      </div>
    );
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-16 text-center">
        <FileCode className="h-10 w-10 text-muted-foreground/60 mb-3" />
        <h3 className="text-sm font-semibold text-foreground">No CAD files found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
          Try expanding your search query or selecting a different folder in the sidebar.
        </p>
        {onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-4 text-xs">
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
              <th className="p-3 w-12 text-center">Thumbnail</th>
              <th className="p-3">File Name</th>
              <th className="p-3 w-16">Type</th>
              <th className="p-3 w-24">Software</th>
              <th className="p-3 w-16 text-center">Revision</th>
              <th className="p-3 w-20 text-center">Status</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Last Modified</th>
              <th className="p-3 w-24 text-center">Lock Status</th>
              <th className="p-3 w-12 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {files.map((file) => {
              const isLocked = file.lockStatus?.locked;
              const isCheckedOut = file.checkoutStatus?.checkedOut;

              return (
                <tr
                  key={file.id}
                  className="hover:bg-muted/40 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/cad/${file.id}`)}
                >
                  <td className="p-3 flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
                    {renderThumbnail(file.type)}
                  </td>
                  <td className="p-3 font-medium text-foreground max-w-[180px] truncate">
                    {file.fileName}
                  </td>
                  <td className="p-3 text-muted-foreground font-semibold">{file.type}</td>
                  <td className="p-3 text-muted-foreground">{file.software}</td>
                  <td className="p-3 text-center text-muted-foreground font-mono">{file.currentRevision}</td>
                  <td className="p-3 text-center">
                    <StatusBadge status={file.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-700">
                        {file.owner.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="truncate">{file.owner.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(file.lastModified).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    {isCheckedOut ? (
                      <div className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
                        <Key className="h-3 w-3" />
                        Out: {file.checkoutStatus.checkedOutBy?.name.split(" ")[0]}
                      </div>
                    ) : isLocked ? (
                      <div className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 border border-red-200">
                        <Lock className="h-3 w-3" />
                        Locked
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                        <Unlock className="h-3 w-3" />
                        Available
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        <DropdownMenuItem onClick={() => router.push(`/cad/${file.id}`)}>
                          <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                          Open Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setPreviewFile(file);
                            setPreviewOpen(true);
                          }}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Preview Info
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!isCheckedOut && (
                          <DropdownMenuItem onClick={() => handleOpenAction("checkout", file)}>
                            <CheckSquare className="mr-1.5 h-3.5 w-3.5" />
                            Check Out File
                          </DropdownMenuItem>
                        )}
                        {isCheckedOut && (
                          <>
                            <DropdownMenuItem onClick={() => checkInFile(file.id)}>
                              <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                              Check In File
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => cancelCheckout(file.id)}>
                              <XSquare className="mr-1.5 h-3.5 w-3.5" />
                              Cancel Checkout
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        {!isLocked && (
                          <DropdownMenuItem onClick={() => lockFile(file.id)}>
                            <Lock className="mr-1.5 h-3.5 w-3.5" />
                            Lock Model
                          </DropdownMenuItem>
                        )}
                        {isLocked && (
                          <DropdownMenuItem onClick={() => unlockFile(file.id)}>
                            <Unlock className="mr-1.5 h-3.5 w-3.5" />
                            Unlock Model
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenAction("rename", file)}>
                          <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                          Rename File
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenAction("move", file)}>
                          <FolderInput className="mr-1.5 h-3.5 w-3.5" />
                          Move File
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateFile(file.id)}>
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Duplicate File
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 hover:text-red-700 focus:text-red-700"
                          onClick={() => deleteFile(file.id)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Delete File
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Preview Drawer Sheet */}
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent className="sm:max-w-md">
          {previewFile && (
            <div className="space-y-6 text-xs h-full flex flex-col justify-between py-4">
              <div>
                <SheetHeader className="mb-4">
                  <div className="flex items-center gap-2">
                    {renderThumbnail(previewFile.type)}
                    <div>
                      <SheetTitle className="text-sm font-semibold">{previewFile.fileName}</SheetTitle>
                      <p className="text-[10px] text-muted-foreground">{previewFile.partNumber} · Rev {previewFile.currentRevision}</p>
                    </div>
                  </div>
                </SheetHeader>

                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/20">
                    <p className="font-semibold text-foreground">File Summary</p>
                    <p className="text-muted-foreground">{previewFile.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">Software</p>
                      <p className="font-semibold text-foreground">{previewFile.software}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">Size</p>
                      <p className="font-semibold text-foreground">{previewFile.size}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">Material</p>
                      <p className="font-semibold text-foreground">{previewFile.material}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground font-medium">Weight</p>
                      <p className="font-semibold text-foreground">{previewFile.weight}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="font-semibold text-foreground">Relationships</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 border rounded border-border">
                        <p className="text-muted-foreground font-medium">Linked Product</p>
                        <p className="font-semibold truncate">{previewFile.linkedProduct?.name || "None"}</p>
                      </div>
                      <div className="p-2 border rounded border-border">
                        <p className="text-muted-foreground font-medium">Linked BOM</p>
                        <p className="font-semibold truncate">{previewFile.linkedBomId ? "BOM-ACTIVE" : "None"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 text-xs"
                  onClick={() => {
                    setPreviewOpen(false);
                    router.push(`/cad/${previewFile.id}`);
                  }}
                >
                  View Details & 3D Model
                </Button>
                <Button variant="outline" onClick={() => setPreviewOpen(false)} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* CRUD dialogs */}
      <Dialog open={actionFile !== null} onOpenChange={() => setActionFile(null)}>
        <DialogContent className="sm:max-w-[350px] text-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {actionType === "rename" && "Rename CAD File"}
              {actionType === "move" && "Move CAD File"}
              {actionType === "checkout" && "Check Out File"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {actionType === "rename" && (
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">File Base Name</label>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            )}

            {actionType === "checkout" && (
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Checkout Reason / Description</label>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="e.g. updating model interface bolt pattern"
                  className="h-8 text-xs"
                />
              </div>
            )}

            {actionType === "move" && (
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Select Target Folder</label>
                <select
                  value={selectFolderId}
                  onChange={(e) => setSelectFolderId(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setActionFile(null)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleActionSubmit} className="text-xs">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
