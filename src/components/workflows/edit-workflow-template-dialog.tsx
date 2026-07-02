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
import type { WorkflowTemplate } from "@/types";

interface EditWorkflowTemplateDialogProps {
  template: WorkflowTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditWorkflowTemplateDialog({
  template,
  open,
  onOpenChange,
}: EditWorkflowTemplateDialogProps) {
  const templates = useWorkflowStore((s) => s.templates);
  const updateTemplate = useWorkflowStore((s) => s.updateTemplate);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !template) return;
    setName(template.name);
    setDescription(template.description);
    setError("");
  }, [open, template]);

  const handleSubmit = () => {
    if (!template) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Template name is required.");
      return;
    }
    const duplicate = templates.some(
      (item) =>
        item.id !== template.id && item.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      setError("A template with this name already exists.");
      return;
    }

    updateTemplate(template.id, {
      name: trimmedName,
      description: description.trim() || "Custom workflow template",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Workflow Template</DialogTitle>
          <DialogDescription>Update template name and description.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <div className="space-y-1.5">
            <label htmlFor="edit-template-name" className="text-sm font-medium">
              Template Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="edit-template-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="edit-template-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="edit-template-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
