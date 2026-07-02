"use client";

import { useState } from "react";
import { useCadStore } from "@/store/cad-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Check } from "lucide-react";
import type { CadFile } from "@/types/cad";

interface CadMetadataPanelProps {
  file: CadFile;
}

export function CadMetadataPanel({ file }: CadMetadataPanelProps) {
  const { updateMetadata } = useCadStore();
  const [saved, setSaved] = useState(false);

  // Form states
  const [material, setMaterial] = useState(file.material);
  const [weight, setWeight] = useState(file.weight);
  const [volume, setVolume] = useState(file.volume);
  const [density, setDensity] = useState(file.density);
  const [surfaceArea, setSurfaceArea] = useState(file.surfaceArea);
  const [units, setUnits] = useState(file.units);
  const [partNumber, setPartNumber] = useState(file.partNumber);
  const [project, setProject] = useState(file.project);
  const [description, setDescription] = useState(file.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMetadata(file.id, {
      material,
      weight,
      volume,
      density,
      surfaceArea,
      units,
      partNumber,
      project,
      description,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-xl p-4 bg-card text-xs space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h4 className="text-sm font-bold text-foreground">CAD Physical & Project Metadata</h4>
          <p className="text-[10px] text-muted-foreground">Modify geometry calculations and lifecycle attributes.</p>
        </div>
        <Button
          type="submit"
          size="sm"
          className="h-8 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700"
          disabled={saved}
        >
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Changes Saved
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Save Parameters
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {/* Part Number */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Part Number</label>
          <Input
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Project */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Associated Project</label>
          <Input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Units */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Measurement Units</label>
          <Input
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Material */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Material</label>
          <Input
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Weight */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Calculated Mass / Weight</label>
          <Input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Volume */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Calculated Volume</label>
          <Input
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Density */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Density</label>
          <Input
            value={density}
            onChange={(e) => setDensity(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        {/* Surface Area */}
        <div className="space-y-1">
          <label className="text-muted-foreground font-medium">Surface Area</label>
          <Input
            value={surfaceArea}
            onChange={(e) => setSurfaceArea(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="space-y-1 border-t pt-3">
        <label className="text-muted-foreground font-medium">Model Description Summary</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="text-xs"
        />
      </div>
    </form>
  );
}
