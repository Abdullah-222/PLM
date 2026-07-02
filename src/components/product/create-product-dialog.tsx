"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  generatePartNumber,
  isPartNumberTaken,
  PLM_CATEGORIES,
} from "@/lib/products-catalog";
import { useProductsStore } from "@/store/products-store";
import { users } from "@/constants/users";
import type { CreateProductInput, LifecycleState, ProductType } from "@/types";
import { Loader2, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PRODUCT_TYPES: ProductType[] = [
  "Mechanical",
  "Electrical",
  "Assembly",
  "Module",
  "Part",
  "Software",
];

const LIFECYCLE_OPTIONS: LifecycleState[] = ["Draft", "In Review"];

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = CreateProductInput & { tagInput?: string };

const defaultValues: FormValues = {
  partNumber: "",
  name: "",
  productType: "Mechanical",
  category: "Propulsion",
  description: "",
  revision: "A",
  lifecycleState: "Draft",
  ownerId: users[0].id,
  department: users[0].department,
  material: "",
  weight: "",
  tags: [],
};

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

const selectClassName =
  "flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";

export function CreateProductDialog({
  open,
  onOpenChange,
}: CreateProductDialogProps) {
  const router = useRouter();
  const addProduct = useProductsStore((s) => s.addProduct);
  const [tagInput, setTagInput] = useState("");
  const [customCategory, setCustomCategory] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues });

  const tags = watch("tags") ?? [];
  const ownerId = watch("ownerId");
  const category = watch("category");

  useEffect(() => {
    if (!open) return;
    const suggested = generatePartNumber();
    reset({ ...defaultValues, partNumber: suggested });
    setTagInput("");
    setCustomCategory(false);
  }, [open, reset]);

  useEffect(() => {
    const owner = users.find((u) => u.id === ownerId);
    if (owner) {
      setValue("department", owner.department);
    }
  }, [ownerId, setValue]);

  const addTag = () => {
    const value = tagInput.trim().toLowerCase();
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

  const regeneratePartNumber = () => {
    setValue("partNumber", generatePartNumber(), { shouldDirty: true });
    clearErrors("partNumber");
  };

  const onSubmit = handleSubmit((data) => {
    const normalizedPartNumber = data.partNumber.trim().toUpperCase();

    if (!normalizedPartNumber) {
      setError("partNumber", { message: "Product ID is required" });
      return;
    }

    if (isPartNumberTaken(normalizedPartNumber)) {
      setError("partNumber", { message: "This Product ID already exists" });
      return;
    }

    const product = addProduct({
      ...data,
      partNumber: normalizedPartNumber,
      revision: data.revision.trim().toUpperCase() || "A",
      tags: data.tags ?? [],
      material: data.material || undefined,
      weight: data.weight || undefined,
    });

    onOpenChange(false);
    router.push(`/products/${product.id}`);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Register a new item in the product catalog. New items start at Rev A
            in Draft lifecycle unless specified otherwise.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="px-6 pb-2 space-y-6">
          {/* Identification */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Identification
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel required>Product ID</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    {...register("partNumber", { required: "Product ID is required" })}
                    placeholder="ITEM-1013"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={regeneratePartNumber}
                    title="Generate next ID"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <FieldError message={errors.partNumber?.message} />
                <p className="text-xs text-muted-foreground">
                  Unique item number (e.g. ITEM-1013)
                </p>
              </div>
              <div className="space-y-2">
                <FieldLabel required>Initial Revision</FieldLabel>
                <Input
                  {...register("revision", { required: true })}
                  placeholder="A"
                  className="font-mono uppercase"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <FieldLabel required>Product Name</FieldLabel>
                <Input
                  {...register("name", {
                    required: "Product name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                  })}
                  placeholder="e.g. Engine Assembly"
                />
                <FieldError message={errors.name?.message} />
              </div>
            </div>
          </section>

          <Separator />

          {/* Classification */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Classification
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel required>Product Type</FieldLabel>
                <select {...register("productType")} className={selectClassName}>
                  {PRODUCT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <FieldLabel required>Category</FieldLabel>
                {customCategory ? (
                  <Input
                    {...register("category", { required: "Category is required" })}
                    placeholder="Enter category"
                  />
                ) : (
                  <select
                    {...register("category")}
                    className={selectClassName}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setCustomCategory(true);
                        setValue("category", "");
                      } else {
                        setValue("category", e.target.value);
                      }
                    }}
                    value={customCategory ? "__custom__" : category}
                  >
                    {PLM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__custom__">Custom category...</option>
                  </select>
                )}
                <FieldError message={errors.category?.message} />
              </div>
              <div className="space-y-2">
                <FieldLabel>Lifecycle State</FieldLabel>
                <select {...register("lifecycleState")} className={selectClassName}>
                  {LIFECYCLE_OPTIONS.map((state) => (
                    <option key={state} value={state}>
                      {state === "In Review" ? "Review" : state}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  New items are typically created in Draft
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Ownership */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ownership
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel required>Owner</FieldLabel>
                <select {...register("ownerId")} className={selectClassName}>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} — {user.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <FieldLabel required>Department</FieldLabel>
                <Input {...register("department", { required: true })} />
              </div>
            </div>
          </section>

          <Separator />

          {/* Technical */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Technical Attributes
            </h3>
            <div className="space-y-2">
              <FieldLabel>Description</FieldLabel>
              <Textarea
                {...register("description")}
                rows={3}
                placeholder="Engineering description, intended use, and key specifications..."
                className="resize-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Material</FieldLabel>
                <Input {...register("material")} placeholder="e.g. Ti-6Al-4V" />
              </div>
              <div className="space-y-2">
                <FieldLabel>Weight</FieldLabel>
                <Input {...register("weight")} placeholder="e.g. 4.2 kg" />
              </div>
            </div>
            <div className="space-y-2">
              <FieldLabel>Tags</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add classification tag..."
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
              {tags.length > 0 && (
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
              )}
            </div>
          </section>
        </form>

        <DialogFooter className="px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn("gap-1.5", isSubmitting && "opacity-80")}
            onClick={onSubmit}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
