"use client";

import { useState } from "react";
import { useCadStore } from "@/store/cad-store";
import { products } from "@/constants/products";
import { sampleDocuments } from "@/constants/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Upload,
  FileCode,
  Link2,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import type { CadFileType, CadSoftware, CadFile } from "@/types/cad";

interface CadUploadWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultIsAssembly?: boolean;
}

export function CadUploadWizard({ open, onOpenChange, defaultIsAssembly = false }: CadUploadWizardProps) {
  const { uploadCadFile, folders } = useCadStore();

  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Uploaded Files State
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: string; type: CadFileType }[]>([]);

  // Step 2 Metadata state
  const [fileName, setFileName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Mechanical");
  const [software, setSoftware] = useState<CadSoftware>("SolidWorks");
  const [revision, setRevision] = useState("A");
  const [project, setProject] = useState("Turbine Assembly X200");
  const [tagsText, setTagsText] = useState("cad, model");

  // Step 3 Relationship state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [selectedBomId, setSelectedBomId] = useState("");
  const [linkBom, setLinkBom] = useState(false);

  const resetForm = () => {
    setStep(1);
    setUploading(false);
    setUploadProgress(0);
    setSelectedFiles([]);
    setFileName("");
    setPartNumber("");
    setDescription("");
    setSelectedProductId("");
    setSelectedDocId("");
    setSelectedBomId("");
    setLinkBom(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fileList = Array.from(e.target.files);
    
    // Simulate upload progress
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          const filesData = fileList.map((f) => {
            const ext = f.name.split(".").pop()?.toUpperCase() as CadFileType;
            return {
              name: f.name,
              size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
              type: ext || "STEP",
            };
          });
          
          setSelectedFiles(filesData);
          if (filesData.length > 0) {
            setFileName(filesData[0].name);
            const rawName = filesData[0].name.split(".")[0];
            setPartNumber(`PN-${rawName.toUpperCase().slice(0, 8)}`);
          }
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    if (selectedFiles.length === 0) return;

    const chosenFile = selectedFiles[0];
    const productItem = products.find((p) => p.id === selectedProductId);
    const docItem = sampleDocuments.find((d) => d.id === selectedDocId);

    const newCadFile: Omit<CadFile, "id" | "owner" | "createdAt" | "lastModified" | "lockStatus" | "checkoutStatus" | "versions" | "comments"> = {
      fileName: fileName || chosenFile.name,
      thumbnail: "",
      type: chosenFile.type,
      software: software,
      currentRevision: revision,
      status: "Draft",
      size: chosenFile.size,
      folderId: defaultIsAssembly ? "f-3" : "f-2", // Engine or Mechanical
      description: description || `Uploaded CAD file model ${fileName}.`,
      material: "Aluminum 7075-T6",
      weight: "1.5 kg",
      volume: "350 cm³",
      density: "2.7 g/cm³",
      surfaceArea: "120 cm²",
      units: "mm / kg / sec",
      partNumber: partNumber || "PN-CAD-9999",
      project: project,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      linkedProduct: productItem ? {
        id: productItem.id,
        name: productItem.name,
        partNumber: productItem.partNumber
      } : undefined,
      linkedRevision: `REV-${revision}`,
      linkedDocuments: docItem ? [{
        id: docItem.id,
        name: docItem.name,
        type: docItem.type
      }] : undefined,
      linkedBomId: linkBom ? `bom-lnk-${Date.now()}` : undefined,
    };

    uploadCadFile(newCadFile);
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) resetForm();
    }}>
      <DialogContent className="sm:max-w-[500px] text-xs">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center justify-between">
            <span>{defaultIsAssembly ? "Import Assembly Wizard" : "Upload CAD Model Wizard"}</span>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Step {step} of 4
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1: CHOOSE FILES */}
        {step === 1 && (
          <div className="space-y-4 py-3">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 bg-muted/10 hover:bg-muted/20 transition-colors relative cursor-pointer group">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                  <p className="font-semibold text-foreground">Processing CAD geometry...</p>
                  <div className="w-48 bg-muted h-1.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors mb-2" />
                  <p className="font-semibold text-foreground text-center">Drag and drop CAD file(s) here</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Supports SLDPRT, SLDASM, STEP, STP, IGES, CATPART, DWG, DXF, PDF</p>
                  <Button variant="outline" size="sm" className="mt-4 text-xs">Browse Files</Button>
                </>
              )}
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-foreground">Selected Files ({selectedFiles.length})</p>
                <div className="max-h-24 overflow-y-auto space-y-1.5 border rounded-lg p-2 bg-muted/5">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded border bg-card">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCode className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="font-medium truncate max-w-[240px]">{file.name}</span>
                        <span className="text-[9px] text-muted-foreground shrink-0 bg-muted px-1.5 py-0.5 rounded">{file.type}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground">{file.size}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 text-red-500" onClick={() => setSelectedFiles([])}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: METADATA */}
        {step === 2 && (
          <div className="space-y-3 py-3 grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="text-muted-foreground font-medium">Model File Name</label>
              <Input value={fileName} onChange={(e) => setFileName(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Part Number</label>
              <Input value={partNumber} onChange={(e) => setPartNumber(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-sm focus-visible:outline-none"
              >
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Structures">Structures</option>
                <option value="Propulsion">Propulsion</option>
                <option value="Avionics">Avionics</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">CAD Software</label>
              <select
                value={software}
                onChange={(e) => setSoftware(e.target.value as CadSoftware)}
                className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-sm focus-visible:outline-none"
              >
                <option value="SolidWorks">SolidWorks</option>
                <option value="CATIA">CATIA</option>
                <option value="PTC Creo">PTC Creo</option>
                <option value="Siemens NX">Siemens NX</option>
                <option value="AutoCAD">AutoCAD</option>
                <option value="Neutral">Neutral (STEP/IGES)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Project Code</label>
              <Input value={project} onChange={(e) => setProject(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-muted-foreground font-medium">Tags (comma separated)</label>
              <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-muted-foreground font-medium">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="text-xs" />
            </div>
          </div>
        )}

        {/* STEP 3: RELATIONSHIPS */}
        {step === 3 && (
          <div className="space-y-4 py-3">
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium flex items-center gap-1">
                  <Link2 className="h-3 w-3 text-blue-500" />
                  Link Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-sm focus-visible:outline-none"
                >
                  <option value="">-- None --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.partNumber} · {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium flex items-center gap-1">
                  <Link2 className="h-3 w-3 text-purple-500" />
                  Link Document
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-sm focus-visible:outline-none"
                >
                  <option value="">-- None --</option>
                  {sampleDocuments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id} · {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 border rounded-lg p-3 bg-muted/10">
                <input
                  type="checkbox"
                  id="linkBom"
                  checked={linkBom}
                  onChange={(e) => setLinkBom(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="grid gap-0.5 leading-none">
                  <label htmlFor="linkBom" className="font-semibold text-foreground cursor-pointer">
                    Generate Associated BOM Structure
                  </label>
                  <span className="text-[10px] text-muted-foreground">
                    Automatically initializes a Bill of Materials linked to this CAD file.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FINISH */}
        {step === 4 && (
          <div className="space-y-4 py-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">CAD geometry verified!</h3>
              <p className="text-muted-foreground">The model is ready to be committed to the PLM database.</p>
            </div>
            <div className="border rounded-lg p-3 bg-muted/20 text-left max-w-sm mx-auto space-y-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-muted-foreground">File:</span> <span className="font-medium text-foreground">{fileName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Part Number:</span> <span className="font-medium text-foreground">{partNumber}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Software:</span> <span className="font-medium text-foreground">{software}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Category:</span> <span className="font-medium text-foreground">{category}</span></div>
              {selectedProductId && (
                <div className="flex justify-between"><span className="text-muted-foreground">Linked Product:</span> <span className="font-medium text-foreground truncate max-w-[160px]">{products.find(p => p.id === selectedProductId)?.name}</span></div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 border-t pt-3">
          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={handlePrev} className="text-xs gap-1">
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              size="sm"
              onClick={handleNext}
              disabled={selectedFiles.length === 0}
              className="text-xs ml-auto gap-1"
            >
              Continue <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleFinish} className="text-xs ml-auto bg-emerald-600 hover:bg-emerald-700">
              Finish & Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
