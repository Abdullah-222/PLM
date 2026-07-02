"use client";

import { useForm } from "react-hook-form";
import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProductMetadata } from "@/types";
import type { User } from "@/types";
import { Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface MetadataFormProps {
  metadata: ProductMetadata;
  owners: User[];
  onSave?: (data: ProductMetadata) => void;
}

export function MetadataForm({ metadata, owners, onSave }: MetadataFormProps) {
  const [tagInput, setTagInput] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<ProductMetadata>({
    defaultValues: metadata,
  });

  const tags = watch("tags");

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) return;
    setValue("tags", [...tags, value], { shouldDirty: true });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag),
      { shouldDirty: true }
    );
  };

  return (
    <AppCard>
      <AppCardHeader>
        <SectionHeader
          title="Item Metadata"
          description="Editable product attributes (frontend only)"
        />
      </AppCardHeader>
      <AppCardContent>
        <form
          onSubmit={handleSubmit((data) => onSave?.(data))}
          className="space-y-6 max-w-2xl"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input {...register("productName", { required: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input {...register("category", { required: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner</label>
              <select
                {...register("ownerId")}
                className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
              >
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Department</label>
              <Input {...register("department", { required: true })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...register("description")}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="rounded-sm hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" className="gap-1.5" disabled={!isDirty}>
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </Button>
            {isDirty && (
              <span className="text-xs text-muted-foreground">
                Unsaved changes
              </span>
            )}
          </div>
        </form>
      </AppCardContent>
    </AppCard>
  );
}
