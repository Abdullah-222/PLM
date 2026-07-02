"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { AssemblyItem } from "@/types";
import { Copy, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";

interface AssemblyExplorerProps {
  assemblies: AssemblyItem[];
  selectedAssemblyId: string;
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AssemblyExplorer({
  assemblies,
  selectedAssemblyId,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
}: AssemblyExplorerProps) {
  const [query, setQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const filtered = useMemo(
    () => assemblies.filter((assembly) => assembly.name.toLowerCase().includes(query.toLowerCase())),
    [assemblies, query]
  );

  return (
    <div className="rounded-xl border border-border p-3 space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Assembly Explorer</h3>
        <p className="text-xs text-muted-foreground">Products</p>
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search assemblies"
          className="pl-8 h-9"
        />
      </div>
      <div className="space-y-1">
        {filtered.map((assembly) => {
          const selected = selectedAssemblyId === assembly.id;
          const editing = renamingId === assembly.id;
          return (
            <div
              key={assembly.id}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 ${selected ? "bg-muted" : "hover:bg-muted/50"}`}
            >
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => onSelect(assembly.id)}
              >
                {editing ? (
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    onBlur={() => {
                      if (renameValue.trim()) onRename(assembly.id, renameValue.trim());
                      setRenamingId(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        if (renameValue.trim()) onRename(assembly.id, renameValue.trim());
                        setRenamingId(null);
                      }
                    }}
                    className="h-8"
                  />
                ) : (
                  <div>
                    <p className="text-sm font-medium truncate">{assembly.name}</p>
                    <p className="text-xs text-muted-foreground">Rev {assembly.revision}</p>
                  </div>
                )}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setRenamingId(assembly.id);
                      setRenameValue(assembly.name);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(assembly.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(assembly.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}
