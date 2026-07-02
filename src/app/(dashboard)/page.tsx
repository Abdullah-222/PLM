"use client";

import { PageContainer } from "@/components/shared/page-container";
import { SectionHeader } from "@/components/shared/section-header";
import { StatCard } from "@/components/shared/stat-card";
import { AppCard, AppCardHeader, AppCardContent } from "@/components/shared/app-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { Button } from "@/components/ui/button";
import {
  Package,
  GitBranch,
  Clock,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import {
  dashboardStats,
  activities,
  tasks,
  changeRequests,
  products,
} from "@/constants/mock-data";

export default function DashboardPage() {
  return (
    <PageContainer>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Product lifecycle overview — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Products"
          value={dashboardStats.totalProducts.toLocaleString()}
          change="+12 this month"
          changeType="positive"
          icon={Package}
        />
        <StatCard
          title="Active Revisions"
          value={dashboardStats.activeRevisions}
          change="+4 this week"
          changeType="positive"
          icon={GitBranch}
        />
        <StatCard
          title="Pending Approvals"
          value={dashboardStats.pendingApprovals}
          change="3 overdue"
          changeType="negative"
          icon={Clock}
        />
        <StatCard
          title="Open Changes"
          value={dashboardStats.openChanges}
          change="6 in review"
          changeType="neutral"
          icon={ClipboardList}
        />
        <StatCard
          title="Released This Month"
          value={dashboardStats.releasedThisMonth}
          change="+8 vs last month"
          changeType="positive"
          icon={CheckCircle2}
        />
        <StatCard
          title="Overdue Tasks"
          value={dashboardStats.overdueTask}
          change="Action required"
          changeType="negative"
          icon={AlertTriangle}
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Approvals */}
        <AppCard className="lg:col-span-2">
          <AppCardHeader>
            <SectionHeader
              title="Pending Approvals"
              description="Items awaiting your review"
              action={
                <Button variant="ghost" size="sm" className="text-xs">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              }
            />
          </AppCardHeader>
          <AppCardContent>
            <div className="space-y-3">
              {products
                .filter((p) => p.lifecycleState === "In Review")
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.partNumber} · Rev {product.revision} · {product.owner.name}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={product.lifecycleState} />
                  </div>
                ))}
              {changeRequests
                .filter((cr) => cr.status === "Pending" || cr.status === "In Progress")
                .map((cr) => (
                  <div
                    key={cr.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {cr.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cr.id} · {cr.type} · {cr.requestedBy.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={cr.priority} variant="priority" />
                      <StatusBadge status={cr.status} variant="workflow" />
                    </div>
                  </div>
                ))}
            </div>
          </AppCardContent>
        </AppCard>

        {/* Recent Activity */}
        <AppCard>
          <AppCardHeader>
            <SectionHeader
              title="Recent Activity"
              action={
                <Button variant="ghost" size="sm" className="text-xs">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              }
            />
          </AppCardHeader>
          <AppCardContent>
            <ActivityTimeline activities={activities} />
          </AppCardContent>
        </AppCard>
      </div>

      {/* Task Summary */}
      <AppCard>
        <AppCardHeader>
          <SectionHeader
            title="My Tasks"
            description={`${tasks.length} tasks assigned to you`}
            action={
              <Button variant="outline" size="sm" className="text-xs">
                <CalendarDays className="mr-1.5 h-3 w-3" />
                View Calendar
              </Button>
            }
          />
        </AppCardHeader>
        <AppCardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">
                    {task.title}
                  </p>
                  <StatusBadge status={task.priority} variant="priority" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  <StatusBadge status={task.status} variant="workflow" />
                </div>
              </div>
            ))}
          </div>
        </AppCardContent>
      </AppCard>
    </PageContainer>
  );
}
