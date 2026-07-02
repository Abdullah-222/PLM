"use client";

import { useState } from "react";
import { useCadStore } from "@/store/cad-store";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CadFolder } from "@/types/cad";

interface CadExplorerProps {
  className?: string;
}

export function CadExplorer({ className }: CadExplorerProps) {
  const {
    folders,
    activeFolderId,
    setActiveFolderId,
    createFolder,
    renameFolder,
    deleteFolder,
    duplicateFolder,
    moveFolder,
  } = useCadStore();

  // Modal Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"create" | "rename" | "move" | null>(null);
  const [targetFolder, setTargetFolder] = useState<CadFolder | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [parentIdVal, setParentIdVal] = useState<string | "none">("none");

  // Helper to build hierarchy tree from flat folders array
  const buildFolderTree = (list: CadFolder[], parentId: string | null = null): (CadFolder & { children?: any[] })[] => {
    return list
      .filter((f) => f.parentId === parentId)
      .map((f) => ({
        ...f,
        children: buildFolderTree(list, f.id),
      }));
  };

  const folderTree = buildFolderTree(folders, null);

  const handleOpenDialog = (type: "create" | "rename" | "move", folder: CadFolder | null) => {
    setTargetFolder(folder);
    setDialogType(type);
    if (type === "create") {
      setInputVal("");
      setParentIdVal(folder ? folder.id : "none");
    } else if (type === "rename") {
      setInputVal(folder ? folder.name : "");
    } else if (type === "move") {
      setParentIdVal(folder?.parentId || "none");
    }
    setDialogOpen(true);
  };

  const handleDialogSubmit = () => {
    if (dialogType === "create" && inputVal.trim()) {
      const pid = parentIdVal === "none" ? null : parentIdVal;
      createFolder(inputVal.trim(), pid);
    } else if (dialogType === "rename" && targetFolder && inputVal.trim()) {
      renameFolder(targetFolder.id, inputVal.trim());
    } else if (dialogType === "move" && targetFolder) {
      const pid = parentIdVal === "none" ? null : parentIdVal;
      moveFolder(targetFolder.id, pid);
    }
    setDialogOpen(false);
    setDialogType(null);
    setTargetFolder(null);
  };

  // Node Component for Folder Tree
  function FolderNode({
    folder,
    depth = 0,
  }: {
    folder: CadFolder & { children?: any[] };
    depth?: number;
  }) {
    const hasChildren = Boolean(folder.children?.length);
    const [expanded, setExpanded] = useState(depth < 2);
    const isSelected = activeFolderId === folder.id;

    return (
      <div className="group/node relative">
        <div
          onClick={() => setActiveFolderId(folder.id)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs cursor-pointer select-none transition-colors",
            isSelected
              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
          style={{ paddingLeft: `${depth * 10 + 6}px` }}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <span
                className="shrink-0 p-0.5 hover:bg-muted rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
              >
                {expanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </span>
            ) : (
              <span className="w-4 shrink-0" />
            )}
            {isSelected ? (
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-blue-500" />
            ) : (
              <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{folder.name}</span>
          </div>

          {/* Action Trigger Ellipsis */}
          <div className="opacity-0 group-hover/node:opacity-100 transition-opacity shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 text-xs">
                <DropdownMenuItem onClick={() => handleOpenDialog("create", folder)}>
                  <FolderPlus className="mr-1.5 h-3.5 w-3.5" />
                  Create Subfolder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenDialog("rename", folder)}>
                  <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                  Rename Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => duplicateFolder(folder.id)}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Duplicate Folder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenDialog("move", folder)}>
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Move Folder
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 hover:text-red-700 focus:text-red-700"
                  onClick={() => deleteFolder(folder.id)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasChildren && expanded && (
          <div className="mt-0.5">
            {folder.children!.map((child) => (
              <FolderNode key={child.id} folder={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1.5 pr-2", className)}>
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          CAD Explorer
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => handleOpenDialog("create", null)}
        >
          <FolderPlus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setActiveFolderId("All")}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors text-left",
          activeFolderId === "All"
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <Folder className="h-3.5 w-3.5 text-blue-500" />
        All CAD Repository
      </button>

      <div className="space-y-0.5">
        {folderTree.map((folder) => (
          <FolderNode key={folder.id} folder={folder} />
        ))}
      </div>

      {/* CRUD dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {dialogType === "create" && "Create New Folder"}
              {dialogType === "rename" && "Rename Folder"}
              {dialogType === "move" && "Move Folder"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {dialogType !== "move" && (
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Folder Name</label>
                <Input
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Enter folder name..."
                  className="h-8 text-xs"
                />
              </div>
            )}

            {dialogType === "create" && (
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Parent Folder</label>
                <select
                  value={parentIdVal}
                  onChange={(e) => setParentIdVal(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="none">None (Root)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {dialogType === "move" && targetFolder && (
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Move "{targetFolder.name}" to:</label>
                <select
                  value={parentIdVal}
                  onChange={(e) => setParentIdVal(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="none">Root</option>
                  {folders
                    .filter((f) => f.id !== targetFolder.id) // Cannot move inside itself
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleDialogSubmit} className="text-xs">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
