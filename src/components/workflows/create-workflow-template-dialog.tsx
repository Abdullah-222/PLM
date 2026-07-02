"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkflowStore } from "@/store/workflow-store";

interface CreateWorkflowTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultForm = {
  name: "",
  description: "",
};

export function CreateWorkflowTemplateDialog({
  open,
  onOpenChange,
}: CreateWorkflowTemplateDialogProps) {
  const templates = useWorkflowStore((s) => s.templates);
  const createTemplate = useWorkflowStore((s) => s.createTemplate);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(defaultForm);
    setError("");
  }, [open]);

  const handleSubmit = () => {
    const name = form.name.trim();
    if (!name) {
      setError("Template name is required.");
      return;
    }
    const duplicate = templates.some(
      (template) => template.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      setError("A template with this name already exists.");
      return;
    }

    createTemplate({
      name,
      description: form.description.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Workflow Template</DialogTitle>
          <DialogDescription>
            Define a reusable approval workflow with default steps.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <div className="space-y-1.5">
            <label htmlFor="template-name" className="text-sm font-medium">
              Template Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="template-name"
              value={form.name}
              onChange={(event) => {
                setForm((current) => ({ ...current, name: event.target.value }));
                if (error) setError("");
              }}
              placeholder="e.g. Design Approval"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="template-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="template-description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Describe when this workflow should be used"
              rows={3}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!form.name.trim()}>
              Create Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
