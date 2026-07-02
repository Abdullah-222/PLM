"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { users } from "@/constants/users";
import {
  CadPreview,
  CadMetadataPanel,
  CadRelationshipPanel,
  CadVersionTimeline,
  CadComments,
} from "@/components/cad";
import { useCadStore } from "@/store/cad-store";
import {
  ArrowLeft,
  Lock,
  Unlock,
  Key,
  Trash2,
  FileCode,
  Calendar,
  Layers,
  User,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle,
} from "lucide-react";

interface CadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CadDetailPage({ params }: CadDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const fileId = resolvedParams.id;

  const {
    files,
    checkOutFile,
    checkInFile,
    cancelCheckout,
    lockFile,
    unlockFile,
    transferLock,
    deleteFile,
  } = useCadStore();

  const file = files.find((f) => f.id === fileId);

  // Dialog states
  const [checkoutReason, setCheckoutReason] = useState("");
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState("");

  const handleCheckoutSubmit = () => {
    checkOutFile(fileId, checkoutReason || "Updating parameters per engineering change.");
    setCheckoutDialogOpen(false);
    setCheckoutReason("");
  };

  const handleTransferSubmit = () => {
    if (transferTargetId) {
      transferLock(fileId, transferTargetId);
      setTransferDialogOpen(false);
    }
  };

  if (!file) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center p-24 text-center">
          <FileCode className="h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <h2 className="text-base font-bold text-foreground">CAD File Not Found</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            The requested CAD model does not exist or has been removed from the repository.
          </p>
          <Link href="/cad" className="mt-6">
            <Button size="sm" className="text-xs">
              Back to CAD Management
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isLocked = file.lockStatus?.locked;
  const isCheckedOut = file.checkoutStatus?.checkedOut;

  return (
    <PageContainer className="space-y-4">
      {/* Breadcrumbs HUD */}
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
        <Link href="/cad" className="hover:text-foreground">CAD MANAGEMENT</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground uppercase truncate max-w-[150px]">{file.fileName}</span>
      </div>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 bg-muted/5 p-4 rounded-xl border">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-extrabold text-white shrink-0 shadow-sm">
            {file.type}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-foreground truncate max-w-[280px]">
                {file.fileName}
              </h2>
              <StatusBadge status={file.status} />
              {isCheckedOut && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                  <Key className="h-3 w-3" />
                  Checked Out: {file.checkoutStatus.checkedOutBy?.name}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Part No: {file.partNumber} · Revision: <span className="font-mono font-bold text-foreground">{file.currentRevision}</span> · Software: {file.software}
            </p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!isCheckedOut ? (
            <Button
              size="sm"
              className="text-xs bg-blue-600 hover:bg-blue-700"
              onClick={() => setCheckoutDialogOpen(true)}
            >
              Check Out
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                className="text-xs bg-emerald-600 hover:bg-emerald-700"
                onClick={() => checkInFile(file.id)}
              >
                Check In
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border"
                onClick={() => cancelCheckout(file.id)}
              >
                Cancel Checkout
              </Button>
            </>
          )}

          {!isLocked ? (
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-border gap-1"
              onClick={() => lockFile(file.id)}
            >
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Lock
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border gap-1"
                onClick={() => unlockFile(file.id)}
              >
                <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                Unlock
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border gap-1"
                onClick={() => setTransferDialogOpen(true)}
              >
                <Shield className="h-3.5 w-3.5 text-purple-600" />
                Transfer Lock
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:bg-red-50"
            onClick={() => {
              deleteFile(file.id);
              router.push("/cad");
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs Menu */}
      <Tabs defaultValue="overview" className="w-full text-xs">
        <TabsList className="mb-4 h-9 bg-muted/60 p-0.5 border-b border-border w-full justify-start rounded-none">
          <TabsTrigger value="overview" className="h-8 text-xs px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Overview</TabsTrigger>
          <TabsTrigger value="preview" className="h-8 text-xs px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">3D Preview</TabsTrigger>
          <TabsTrigger value="metadata" className="h-8 text-xs px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Metadata</TabsTrigger>
          <TabsTrigger value="relationships" className="h-8 text-xs px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Relationships</TabsTrigger>
          <TabsTrigger value="versions" className="h-8 text-xs px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Versions</TabsTrigger>
          <TabsTrigger value="comments" className="h-8 text-xs px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Comments</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4 focus:outline-none">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Properties summary card */}
            <div className="md:col-span-2 border border-border rounded-xl p-4 bg-card shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground font-semibold">CAD File Overview Specifications</h3>
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Software Engine</span>
                  <p className="font-semibold text-foreground">{file.software}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Extension Type</span>
                  <p className="font-semibold text-foreground">{file.type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">CAD Release Revision</span>
                  <p className="font-semibold text-foreground font-mono">REV-{file.currentRevision}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Owner Engineer</span>
                  <p className="font-semibold text-foreground">{file.owner.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Lifecycle State</span>
                  <p className="font-semibold text-foreground">{file.status}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">File Size</span>
                  <p className="font-semibold text-foreground">{file.size}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Date Created</span>
                  <p className="font-semibold text-foreground">{new Date(file.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Last Modified</span>
                  <p className="font-semibold text-foreground">{new Date(file.lastModified).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-1.5">
                <span className="text-muted-foreground font-medium">Description</span>
                <p className="text-muted-foreground leading-relaxed">
                  {file.description}
                </p>
              </div>
            </div>

            {/* Thumbnail Mock Card */}
            <div className="border border-border rounded-xl p-4 bg-slate-900 flex flex-col justify-between items-center text-center h-[280px]">
              <div className="flex-1 flex items-center justify-center">
                <FileCode className="h-16 w-16 text-blue-500/80 animate-pulse" />
              </div>
              <div className="space-y-1 text-slate-400">
                <p className="font-bold text-white text-xs">{file.fileName}</p>
                <p className="text-[10px]">Rasterized preview not loaded</p>
                <p className="text-[9px] text-slate-500">Go to 3D Preview tab to load interactively</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 3D PREVIEW TAB */}
        <TabsContent value="preview" className="focus:outline-none">
          <CadPreview file={file} />
        </TabsContent>

        {/* METADATA TAB */}
        <TabsContent value="metadata" className="focus:outline-none">
          <CadMetadataPanel file={file} />
        </TabsContent>

        {/* RELATIONSHIPS TAB */}
        <TabsContent value="relationships" className="focus:outline-none">
          <CadRelationshipPanel file={file} />
        </TabsContent>

        {/* VERSIONS TAB */}
        <TabsContent value="versions" className="focus:outline-none">
          <CadVersionTimeline file={file} />
        </TabsContent>

        {/* COMMENTS TAB */}
        <TabsContent value="comments" className="focus:outline-none">
          <CadComments file={file} />
        </TabsContent>
      </Tabs>

      {/* CHECK OUT DIALOG */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-[350px] text-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Check Out CAD Geometry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Checkout Reason</label>
              <Input
                value={checkoutReason}
                onChange={(e) => setCheckoutReason(e.target.value)}
                placeholder="e.g. Updating bore depth clearance..."
                className="h-8 text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setCheckoutDialogOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleCheckoutSubmit} className="text-xs">
              Confirm Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TRANSFER LOCK DIALOG */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-[350px] text-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Transfer Lock Ownership</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Select Design Engineer</label>
              <select
                value={transferTargetId}
                onChange={(e) => setTransferTargetId(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-sm focus-visible:outline-none"
              >
                <option value="">-- Choose User --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setTransferDialogOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleTransferSubmit} className="text-xs">
              Transfer Lock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
