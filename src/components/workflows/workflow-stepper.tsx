"use client";

interface WorkflowStepperProps {
  steps: string[];
  currentStepIndex: number;
}

export function WorkflowStepper({ steps, currentStepIndex }: WorkflowStepperProps) {
  return (
    <div className="rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold mb-3">Workflow Stepper</h3>
      <div className="grid gap-2 sm:grid-cols-4">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-lg border p-3 text-sm ${index <= currentStepIndex ? "bg-muted border-foreground/20" : "border-border"}`}
          >
            <p className="font-medium">{step}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {index < currentStepIndex ? "Completed" : index === currentStepIndex ? "Current" : "Upcoming"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
