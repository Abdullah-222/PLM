"use client";

import { Button } from "@/components/ui/button";
import type { TaskItem, WorkflowTaskStatus } from "@/types";

interface TaskBoardProps {
  tasks: TaskItem[];
  onStatusChange: (taskId: string, status: WorkflowTaskStatus) => void;
  onReassign: (taskId: string, assignee: string) => void;
}

export function TaskBoard({ tasks, onStatusChange, onReassign }: TaskBoardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <TaskSection title="My Tasks" tasks={tasks.filter((task) => task.status !== "Completed")} onStatusChange={onStatusChange} onReassign={onReassign} />
      <TaskSection title="Assigned Tasks" tasks={tasks} onStatusChange={onStatusChange} onReassign={onReassign} />
      <div className="rounded-xl border border-border p-3 space-y-3">
        <h3 className="font-semibold text-sm">Completed Tasks</h3>
        {tasks
          .filter((task) => task.status === "Completed")
          .map((task) => (
            <div key={task.id} className="rounded border p-2 text-sm">
              <p className="font-medium">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.assignee}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

function TaskSection({
  title,
  tasks,
  onStatusChange,
}: {
  title: string;
  tasks: TaskItem[];
  onStatusChange: (taskId: string, status: WorkflowTaskStatus) => void;
  onReassign: (taskId: string, assignee: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border p-3 space-y-3">
      <h3 className="font-semibold text-sm">{title}</h3>
      {tasks.map((task) => (
        <div key={task.id} className="rounded border p-2">
          <p className="text-sm font-medium">{task.title}</p>
          <p className="text-xs text-muted-foreground">
            {task.assignee} · Due {new Date(task.dueDate).toLocaleDateString()}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            <Button size="sm" variant="outline" onClick={() => onStatusChange(task.id, "In Progress")}>
              Start
            </Button>
            <Button size="sm" onClick={() => onStatusChange(task.id, "Completed")}>
              Complete
            </Button>
            <Button size="sm" variant="outline" onClick={() => onStatusChange(task.id, "Blocked")}>
              Mark Blocked
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const next = window.prompt("Reassign task to:", task.assignee);
                if (next?.trim()) onReassign(task.id, next.trim());
              }}
            >
              Reassign
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
