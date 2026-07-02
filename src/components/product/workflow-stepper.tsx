"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppCard, AppCardContent, AppCardHeader } from "@/components/shared/app-card";
import { SectionHeader } from "@/components/shared/section-header";
import { getInitials } from "@/lib/product-utils";
import type { WorkflowStep } from "@/types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStepperProps {
  steps: WorkflowStep[];
}

export function WorkflowStepper({ steps }: WorkflowStepperProps) {
  return (
    <div className="space-y-6">
      <AppCard>
        <AppCardHeader>
          <SectionHeader
            title="Approval Workflow"
            description="Release lifecycle progression for this item"
          />
        </AppCardHeader>
        <AppCardContent>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-start gap-3 lg:flex-col lg:items-center lg:text-center">
                <div className="flex items-center gap-3 lg:flex-col">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                      step.status === "completed" &&
                        "border-emerald-500 bg-emerald-500 text-white",
                      step.status === "current" &&
                        "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-400",
                      step.status === "upcoming" &&
                        "border-border bg-muted text-muted-foreground"
                    )}
                  >
                    {step.status === "completed" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "hidden lg:block h-0.5 flex-1 w-full min-w-[40px] mt-5 -mx-2",
                        step.status === "completed" ? "bg-emerald-500" : "bg-border"
                      )}
                    />
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.status === "current" && "text-blue-700 dark:text-blue-300"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.status === "current" && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Current step
                    </p>
                  )}
                  {step.completedAt && step.status === "completed" && (
                    <p className="text-xs text-muted-foreground">
                      Completed {new Date(step.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AppCardContent>
      </AppCard>

      <AppCard>
        <AppCardHeader>
          <SectionHeader title="Approvers" description="Assigned reviewers for current workflow" />
        </AppCardHeader>
        <AppCardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {steps
              .filter((step) => step.approvers && step.approvers.length > 0)
              .map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    "rounded-lg border p-4 space-y-3",
                    step.status === "current"
                      ? "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30"
                      : "border-border"
                  )}
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {step.label}
                  </p>
                  <div className="space-y-2">
                    {step.approvers?.map((approver) => (
                      <div key={approver.id} className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-muted">
                            {getInitials(approver.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{approver.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {approver.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </AppCardContent>
      </AppCard>
    </div>
  );
}
