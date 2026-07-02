"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkflowTemplate } from "@/types";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface WorkflowBuilderProps {
  template: WorkflowTemplate;
  onAddStep: (step: string) => void;
  onRenameStep: (index: number, value: string) => void;
  onDeleteStep: (index: number) => void;
  onReorderStep: (source: number, target: number) => void;
}

export function WorkflowBuilder({
  template,
  onAddStep,
  onRenameStep,
  onDeleteStep,
  onReorderStep,
}: WorkflowBuilderProps) {
  const [newStep, setNewStep] = useState("");
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h3 className="text-sm font-semibold">Workflow Designer</h3>
      <div className="space-y-2">
        {template.steps.map((step, index) => (
          <div key={`${step}-${index}`} className="flex items-center gap-2 rounded-md border p-2">
            <Input value={step} onChange={(event) => onRenameStep(index, event.target.value)} />
            <Button variant="outline" size="icon-sm" onClick={() => onReorderStep(index, Math.max(0, index - 1))}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onReorderStep(index, Math.min(template.steps.length - 1, index + 1))}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => onDeleteStep(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newStep} onChange={(event) => setNewStep(event.target.value)} placeholder="Add step" />
        <Button
          onClick={() => {
            if (!newStep.trim()) return;
            onAddStep(newStep.trim());
            setNewStep("");
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Step
        </Button>
      </div>
    </div>
  );
}
