"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useCadStore } from "@/store/cad-store";
import {
  Rotate3d,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Minimize2,
  RefreshCcw,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { CadFile, CadModelNode } from "@/types/cad";

interface CadPreviewProps {
  file: CadFile;
}

export function CadPreview({ file }: CadPreviewProps) {
  const { togglePartVisibility } = useCadStore();
  
  // Camera & viewport transform states
  const [rotX, setRotX] = useState(-20);
  const [rotY, setRotY] = useState(35);
  const [scale, setScale] = useState(1.1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Interaction tracking (mouse drag rotation)
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const activeMode = useRef<"rotate" | "pan">("rotate");
  const [interactionMode, setInteractionMode] = useState<"rotate" | "pan">("rotate");

  // Selected Model Tree Node
  const [selectedNode, setSelectedNode] = useState<CadModelNode | null>(file.modelTree?.[0] || null);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    dragStart.current = { x: e.clientX, y: e.clientY };

    if (interactionMode === "rotate") {
      setRotY((prev) => (prev + deltaX * 0.5) % 360);
      setRotX((prev) => Math.max(-85, Math.min(85, prev - deltaY * 0.5)));
    } else {
      setPanX((prev) => prev + deltaX * 0.5);
      setPanY((prev) => prev + deltaY * 0.5);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleResetCamera = () => {
    setRotX(-20);
    setRotY(35);
    setScale(1.1);
    setPanX(0);
    setPanY(0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewportRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // View Cube snap angles
  const snapToOrientation = (face: "top" | "front" | "right" | "isometric") => {
    if (face === "top") {
      setRotX(-90);
      setRotY(0);
    } else if (face === "front") {
      setRotX(0);
      setRotY(0);
    } else if (face === "right") {
      setRotX(0);
      setRotY(90);
    } else {
      setRotX(-20);
      setRotY(35);
    }
  };

  // Recursive render for model tree items
  const renderModelTreeNode = (node: CadModelNode, depth = 0) => {
    const hasChildren = Boolean(node.children?.length);
    const [expanded, setExpanded] = useState(true);
    const isSelected = selectedNode?.id === node.id;
    const isVisible = node.visibility !== false;

    return (
      <div key={node.id} className="text-[11px]">
        <div
          onClick={() => setSelectedNode(node)}
          className={cn(
            "flex items-center justify-between py-1 px-2 rounded cursor-pointer hover:bg-muted/40 transition-colors",
            isSelected ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
          )}
          style={{ paddingLeft: `${depth * 10 + 6}px` }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren ? (
              <span
                className="p-0.5 hover:bg-muted rounded shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
              >
                {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </span>
            ) : (
              <span className="w-4 shrink-0" />
            )}
            <div
              className="h-2 w-2 rounded-full shrink-0 border"
              style={{ backgroundColor: node.color || "#94a3b8" }}
            />
            <span className="truncate max-w-[120px]">{node.name.split(" (")[0]}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePartVisibility(file.id, node.id);
            }}
            className="text-muted-foreground hover:text-foreground shrink-0 p-0.5"
          >
            {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 text-red-500" />}
          </button>
        </div>
        {hasChildren && expanded && (
          <div className="mt-0.5">
            {node.children!.map((child) => renderModelTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 lg:grid-cols-4 border border-border rounded-xl overflow-hidden bg-card h-[480px] shadow-sm">
        {/* Left Side: Model Tree */}
        <div className="lg:col-span-1 border-r border-border flex flex-col bg-muted/10 h-full overflow-hidden">
          <div className="p-2.5 border-b border-border bg-muted/30">
            <h4 className="text-xs font-bold text-foreground">Model Assembly Tree</h4>
            <p className="text-[10px] text-muted-foreground">Select parts to inspect properties</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {file.modelTree ? (
              file.modelTree.map((node) => renderModelTreeNode(node))
            ) : (
              <p className="text-[10px] text-muted-foreground p-3 text-center">No tree data loaded</p>
            )}
          </div>
        </div>

        {/* Middle: 3D Viewport */}
        <div
          ref={viewportRef}
          className="lg:col-span-2 relative flex flex-col h-full bg-slate-950 border-r border-border overflow-hidden select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Viewport Header HUD */}
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1 pointer-events-none">
            <span className="text-[11px] font-bold text-slate-200 tracking-wider font-mono">
              CAD VIEWER v1.2
            </span>
            <span className="text-[9px] text-slate-400 font-mono">
              Renderer: Mock WebGL Engine Core
            </span>
          </div>

          {/* View Cube HUD */}
          <div className="absolute right-3 top-3 z-10 flex flex-col items-center gap-1.5">
            <div className="grid grid-cols-2 gap-1 bg-slate-900/80 backdrop-blur border border-slate-700 p-1 rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[8px] font-semibold text-slate-300 hover:text-white"
                onClick={() => snapToOrientation("top")}
              >
                TOP
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[8px] font-semibold text-slate-300 hover:text-white"
                onClick={() => snapToOrientation("front")}
              >
                FRNT
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[8px] font-semibold text-slate-300 hover:text-white"
                onClick={() => snapToOrientation("right")}
              >
                RGHT
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[8px] font-semibold text-slate-300 hover:text-white"
                onClick={() => snapToOrientation("isometric")}
              >
                ISO
              </Button>
            </div>
          </div>

          {/* Premium 3D Render SVG Canvas */}
          <div className="flex-1 flex items-center justify-center relative perspective-800">
            <div
              className="transition-transform duration-100 ease-out"
              style={{
                transform: `translate3d(${panX}px, ${panY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Stylized Engine Core SVG */}
              <svg width="220" height="220" viewBox="0 0 200 200" fill="none" className="drop-shadow-2xl">
                {/* Outer casing */}
                <path
                  d="M20 100 L50 40 L150 40 L180 100 L150 160 L50 160 Z"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  fill="rgba(59, 130, 246, 0.05)"
                  opacity={selectedNode?.type === "assembly" ? 0.9 : 0.4}
                />

                {/* Compressor blades */}
                <circle
                  cx="70"
                  cy="100"
                  r="45"
                  stroke={selectedNode?.name.includes("Compressor") ? "#60a5fa" : "#475569"}
                  strokeWidth="3.5"
                  fill="rgba(148, 163, 184, 0.1)"
                  className="animate-[spin_10s_linear_infinite]"
                  style={{ transformOrigin: "70px 100px" }}
                />

                {/* Turbine rotor discs */}
                <circle
                  cx="120"
                  cy="100"
                  r="35"
                  stroke={selectedNode?.name.includes("Turbine") ? "#a78bfa" : "#475569"}
                  strokeWidth="3.5"
                  fill="rgba(148, 163, 184, 0.1)"
                  className="animate-[spin_8s_linear_infinite]"
                  style={{ transformOrigin: "120px 100px" }}
                />

                {/* Combustor lines */}
                <rect
                  x="90"
                  y="75"
                  width="25"
                  height="50"
                  rx="4"
                  stroke={selectedNode?.name.includes("Combustor") ? "#fb923c" : "#64748b"}
                  strokeWidth="2"
                  fill="rgba(251, 146, 60, 0.1)"
                />

                {/* Core Shaft */}
                <line
                  x1="35"
                  y1="100"
                  x2="165"
                  y2="100"
                  stroke="#cbd5e1"
                  strokeWidth="6"
                  strokeLinecap="round"
                  opacity={selectedNode?.name.includes("Shaft") ? 0.9 : 0.6}
                />
              </svg>
            </div>
          </div>

          {/* bottom Viewport toolbar HUD */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-slate-900/90 border border-slate-700 p-1 rounded-full shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7 rounded-full text-slate-300 hover:text-white", interactionMode === "rotate" && "bg-slate-700")}
              onClick={() => setInteractionMode("rotate")}
            >
              <Rotate3d className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7 rounded-full text-slate-300 hover:text-white", interactionMode === "pan" && "bg-slate-700")}
              onClick={() => setInteractionMode("pan")}
            >
              <Move className="h-4 w-4" />
            </Button>
            <div className="h-4 w-[1px] bg-slate-700 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-slate-300 hover:text-white"
              onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-slate-300 hover:text-white"
              onClick={() => setScale((s) => Math.max(0.4, s - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-slate-300 hover:text-white"
              onClick={handleResetCamera}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-slate-300 hover:text-white"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Badges for functions */}
          <div className="absolute left-3 bottom-3 z-10 flex gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded px-2 py-0.5 text-[9px] text-slate-500 font-semibold cursor-not-allowed">
                  Section View
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-[10px]" side="top">Requires active WebGL graphics acceleration</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded px-2 py-0.5 text-[9px] text-slate-500 font-semibold cursor-not-allowed">
                  Measurement
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-[10px]" side="top">Calibrating physical dimensions...</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded px-2 py-0.5 text-[9px] text-slate-500 font-semibold cursor-not-allowed">
                  Exploded View
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-[10px]" side="top">Requires fully matched kinematic constraints</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Right Side: Selection Details Panel */}
        <div className="lg:col-span-1 border-t lg:border-t-0 flex flex-col bg-muted/10 h-full overflow-hidden">
          <div className="p-2.5 border-b border-border bg-muted/30 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-blue-500" />
            <h4 className="text-xs font-bold text-foreground">Selection Properties</h4>
          </div>
          {selectedNode ? (
            <div className="flex-1 p-3 space-y-3.5 text-xs overflow-y-auto">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase">Part Name</span>
                <p className="font-semibold text-foreground break-all">{selectedNode.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase">Node Type</span>
                <p className="font-semibold capitalize text-foreground">{selectedNode.type}</p>
              </div>

              {selectedNode.material && (
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Material</span>
                  <p className="font-semibold text-foreground">{selectedNode.material}</p>
                </div>
              )}

              {selectedNode.weight && (
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Calculated Weight</span>
                  <p className="font-semibold text-foreground">{selectedNode.weight}</p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase">Visibility State</span>
                <p className="font-semibold text-foreground">
                  {selectedNode.visibility !== false ? "Visible" : "Hidden"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 text-center text-muted-foreground">
              Select any subpart in the tree to view its engineering properties.
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
