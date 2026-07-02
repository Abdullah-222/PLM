"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import { seedProducts } from "@/constants/seed-products";
import { managedDocuments } from "@/constants/documents-data";
import { bomAssembliesSeed } from "@/constants/bom-data";
import { revisionRecords } from "@/constants/revisions-data";
import { users } from "@/constants/users";
import { useChangesStore } from "@/store/changes-store";
import type { ChangeWizardInput } from "@/types/changes";
import type { Priority } from "@/types";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const selectClass =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";

const STEPS = [
  "Basic Information",
  "Affected Objects",
  "Impact Assessment",
  "Review & Submit",
];

interface WizardState {
  type: ChangeWizardInput["type"];
  title: string;
  description: string;
  reason: string;
  priority: Priority;
  ownerId: string;
  dueDate: string;
  selectedProducts: string[];
  selectedDocuments: string[];
  selectedBoms: string[];
  selectedRevisions: string[];
  costImpact: number;
  scheduleImpactDays: number;
  riskLevel: ChangeWizardInput["impact"]["riskLevel"];
  impactNotes: string;
}

const initialState: WizardState = {
  type: "ECR",
  title: "",
  description: "",
  reason: "",
  priority: "Medium",
  ownerId: users[0].id,
  dueDate: "",
  selectedProducts: [],
  selectedDocuments: [],
  selectedBoms: [],
  selectedRevisions: [],
  costImpact: 0,
  scheduleImpactDays: 0,
  riskLevel: "Low",
  impactNotes: "",
};

interface ChangeWizardProps {
  initialType?: ChangeWizardInput["type"];
}

export function ChangeWizard({ initialType = "ECR" }: ChangeWizardProps) {
  const router = useRouter();
  const createChange = useChangesStore((s) => s.createChange);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<WizardState>({ ...initialState, type: initialType });

  const toggleSelection = (
    key: "selectedProducts" | "selectedDocuments" | "selectedBoms" | "selectedRevisions",
    id: string
  ) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(id)
        ? f[key].filter((x) => x !== id)
        : [...f[key], id],
    }));
  };

  const canProceed = () => {
    if (step === 0) return form.title.trim().length > 0 && form.reason.trim().length > 0;
    return true;
  };

  const buildInput = (): ChangeWizardInput => {
    const affectedObjects = [
      ...form.selectedProducts.map((id) => {
        const p = seedProducts.find((x) => x.id === id)!;
        return {
          type: "Product" as const,
          objectId: id,
          label: p.name,
          partNumber: p.partNumber,
          revision: p.revision,
        };
      }),
      ...form.selectedDocuments.map((id) => {
        const d = managedDocuments.find((x) => x.id === id)!;
        return { type: "Document" as const, objectId: id, label: d.name };
      }),
      ...form.selectedBoms.map((id) => {
        const b = bomAssembliesSeed.find((x) => x.id === id)!;
        return {
          type: "BOM" as const,
          objectId: id,
          label: `${b.name} BOM`,
          revision: b.revision,
        };
      }),
      ...form.selectedRevisions.map((id) => {
        const r = revisionRecords.find((x) => x.id === id)!;
        return {
          type: "Revision" as const,
          objectId: id,
          label: `${r.objectName} Rev ${r.revision}`,
          partNumber: r.objectPartNumber,
          revision: r.revision,
        };
      }),
    ];

    return {
      type: form.type,
      title: form.title,
      description: form.description,
      reason: form.reason,
      priority: form.priority,
      ownerId: form.ownerId,
      dueDate: form.dueDate || undefined,
      affectedObjects,
      impact: {
        costImpact: form.costImpact,
        scheduleImpactDays: form.scheduleImpactDays,
        riskLevel: form.riskLevel,
        notes: form.impactNotes,
      },
    };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    const changeId = createChange(buildInput());
    setSubmitting(false);
    router.push(`/changes/${changeId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? "font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <AppCard>
        <AppCardHeader>
          <h3 className="font-semibold">{STEPS[step]}</h3>
        </AppCardHeader>
        <AppCardContent className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Change Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as ChangeWizardInput["type"],
                    }))
                  }
                  className={selectClass}
                >
                  <option value="ECR">ECR — Engineering Change Request</option>
                  <option value="ECO">ECO — Engineering Change Order</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Brief title for the change"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Detailed description of the proposed change"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason *</label>
                <Textarea
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder="Business or technical justification"
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priority: e.target.value as Priority }))
                    }
                    className={selectClass}
                  >
                    {(["Critical", "High", "Medium", "Low"] as const).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner</label>
                  <select
                    value={form.ownerId}
                    onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
                    className={selectClass}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                {
                  title: "Products",
                  items: seedProducts.map((p) => ({
                    id: p.id,
                    label: `${p.partNumber} — ${p.name}`,
                  })),
                  key: "selectedProducts" as const,
                },
                {
                  title: "Documents",
                  items: managedDocuments.slice(0, 8).map((d) => ({
                    id: d.id,
                    label: d.name,
                  })),
                  key: "selectedDocuments" as const,
                },
                {
                  title: "BOMs",
                  items: bomAssembliesSeed.map((b) => ({
                    id: b.id,
                    label: `${b.name} (Rev ${b.revision})`,
                  })),
                  key: "selectedBoms" as const,
                },
                {
                  title: "Revisions",
                  items: revisionRecords.slice(0, 10).map((r) => ({
                    id: r.id,
                    label: `${r.objectPartNumber} Rev ${r.revision}`,
                  })),
                  key: "selectedRevisions" as const,
                },
              ].map((section) => (
                <div key={section.title} className="space-y-2">
                  <h4 className="text-sm font-semibold">{section.title}</h4>
                  <div className="rounded-lg border border-border max-h-48 overflow-y-auto divide-y divide-border">
                    {section.items.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={form[section.key].includes(item.id)}
                          onChange={() => toggleSelection(section.key, item.id)}
                          className="rounded"
                        />
                        <span className="truncate">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cost Impact ($)</label>
                  <Input
                    type="number"
                    value={form.costImpact}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, costImpact: Number(e.target.value) }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Schedule Impact (days)</label>
                  <Input
                    type="number"
                    value={form.scheduleImpactDays}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        scheduleImpactDays: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Risk Level</label>
                  <select
                    value={form.riskLevel}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        riskLevel: e.target.value as WizardState["riskLevel"],
                      }))
                    }
                    className={selectClass}
                  >
                    {(["Low", "Medium", "High", "Critical"] as const).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={form.impactNotes}
                  onChange={(e) => setForm((f) => ({ ...f, impactNotes: e.target.value }))}
                  placeholder="Additional impact assessment notes"
                  rows={4}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <span className="font-medium">{form.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority:</span>{" "}
                  <span className="font-medium">{form.priority}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Title:</span>{" "}
                  <span className="font-medium">{form.title}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Reason:</span>{" "}
                  <span>{form.reason}</span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Affected Objects:</p>
                <p>
                  {form.selectedProducts.length +
                    form.selectedDocuments.length +
                    form.selectedBoms.length +
                    form.selectedRevisions.length}{" "}
                  selected
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="text-muted-foreground">Cost Impact</p>
                  <p className="text-lg font-semibold">
                    ${form.costImpact.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Schedule Impact</p>
                  <p className="text-lg font-semibold">{form.scheduleImpactDays} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Risk Level</p>
                  <p className="text-lg font-semibold">{form.riskLevel}</p>
                </div>
              </div>
            </div>
          )}
        </AppCardContent>
      </AppCard>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => (step === 0 ? router.push("/changes") : setStep((s) => s - 1))}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting || !canProceed()}>
            {submitting ? "Submitting..." : "Submit Change"}
          </Button>
        )}
      </div>
    </div>
  );
}
