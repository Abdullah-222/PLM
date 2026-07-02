"use client";

import { TaskBoard } from "@/components/tasks";
import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { useWorkflowStore } from "@/store/workflow-store";

export default function TasksPage() {
  const { tasks, updateTaskStatus, reassignTask } = useWorkflowStore();
  return (
    <PageContainer>
      <SectionHeader title="Task Center" description="My tasks, assigned tasks, and completed tasks" />
      <TaskBoard tasks={tasks} onStatusChange={updateTaskStatus} onReassign={reassignTask} />
    </PageContainer>
  );
}
