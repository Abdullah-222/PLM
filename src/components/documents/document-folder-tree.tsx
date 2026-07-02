"use client";

import { cn } from "@/lib/utils";
import type { DocumentFolder } from "@/types/documents";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";

interface DocumentFolderTreeProps {
  folders: DocumentFolder[];
  selectedId: string | "All";
  onSelect: (folderId: string | "All") => void;
  className?: string;
}

function FolderNode({
  folder,
  selectedId,
  onSelect,
  depth = 0,
}: {
  folder: DocumentFolder;
  selectedId: string | "All";
  onSelect: (id: string | "All") => void;
  depth?: number;
}) {
  const hasChildren = Boolean(folder.children?.length);
  const [expanded, setExpanded] = useState(depth === 0);
  const isSelected = selectedId === folder.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(folder.id)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors text-left",
          isSelected
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (
          <span
            className="shrink-0 p-0.5"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        {isSelected ? (
          <FolderOpen className="h-4 w-4 shrink-0" />
        ) : (
          <Folder className="h-4 w-4 shrink-0" />
        )}
        <span className="truncate">{folder.name}</span>
      </button>
      {hasChildren && expanded && (
        <div>
          {folder.children!.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DocumentFolderTree({
  folders,
  selectedId,
  onSelect,
  className,
}: DocumentFolderTreeProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <button
        type="button"
        onClick={() => onSelect("All")}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
          selectedId === "All"
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <Folder className="h-4 w-4" />
        All Documents
      </button>
      {folders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
