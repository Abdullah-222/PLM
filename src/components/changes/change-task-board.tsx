"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/product-utils";
import { users } from "@/constants/users";
import type { ChangeTask } from "@/types/changes";
import type { Priority } from "@/types";
import { CheckSquare, Plus, UserCheck } from "lucide-react";

const selectClass =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50";

interface ChangeTaskBoardProps {
  changeId: string;
  tasks: ChangeTask[];
  onCreateTask: (
    title: string,
    description: string,
    assigneeId: string,
    dueDate: string,
    priority: Priority
  ) => void;
  onAssignTask: (taskId: string, assigneeId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export function ChangeTaskBoard({
  tasks,
  onCreateTask,
  onAssignTask,
  onCompleteTask,
}: ChangeTaskBoardProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState(users[0].id);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [reassignId, setReassignId] = useState(users[0].id);

  const handleCreate = () => {
    if (!title.trim() || !dueDate) return;
    onCreateTask(title, description, assigneeId, dueDate, priority);
    setCreateOpen(false);
    setTitle("");
    setDescription("");
    setDueDate("");
  };

  const handleAssign = () => {
    if (!assignOpen) return;
    onAssignTask(assignOpen, reassignId);
    setAssignOpen(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks"
          description="Create tasks to track implementation work for this change."
          action={{ label: "Create Task", onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {["Task", "Assignee", "Due Date", "Priority", "Status", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-2 text-left text-xs uppercase tracking-wide text-muted-foreground font-medium"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {task.description}
                    </p>
                  </td>
                  <td className="px-4 py-3">{task.assignee.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.priority} variant="priority" />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.status} variant="workflow" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAssignOpen(task.id);
                          setReassignId(task.assignee.id);
                        }}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                      </Button>
                      {task.status !== "Completed" && (
                        <Button size="sm" onClick={() => onCompleteTask(task.id)}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className={selectClass}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={selectClass}
            >
              {(["Critical", "High", "Medium", "Low"] as const).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim() || !dueDate}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignOpen} onOpenChange={() => setAssignOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
          </DialogHeader>
          <select
            value={reassignId}
            onChange={(e) => setReassignId(e.target.value)}
            className={selectClass}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(null)}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
