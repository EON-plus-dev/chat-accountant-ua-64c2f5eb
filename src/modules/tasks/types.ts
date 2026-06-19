/**
 * Universal Tasks/Team module types (cabinet-agnostic).
 *
 * Працює в будь-якому кабінеті: команда розробки, бухгалтерське бюро,
 * sales-ops, ФОП-послуги, особисті задачі фізособи.
 * Конкретна термінологія/статуси/views підбираються через `TasksPreset`.
 */

import type { LucideIcon } from "lucide-react";

// ──────────────────────────── Базові типи ────────────────────────────

export type TaskStatusId = string;
export type TaskPriority = "low" | "med" | "high" | "urgent";

export interface TaskStatusColumn {
  id: TaskStatusId;
  label: string;
  /** tailwind bg-* */
  color: string;
  /** WIP-ліміт (для команд із Kanban-методологією) */
  wipLimit?: number;
  /** «термінальний» статус — done/cancelled */
  terminal?: "done" | "cancelled";
}

export interface TasksTeam {
  id: string;
  label: string;
  icon?: LucideIcon;
  color: string;
}

export interface TasksMember {
  id: string;
  name: string;
  role: string;
  teamId?: string;
  contract?: "штат" | "ФОП" | "контракт";
  email?: string;
  capacityHoursPerWeek: number;
  avatarUrl?: string;
}

export interface TasksEpic {
  id: string;
  title: string;
  color: string;
  ownerId?: string;
}

export interface TasksSprint {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
  isCurrent?: boolean;
}

export interface TaskSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface TaskComment {
  id: string;
  authorId: string;
  at: string;
  body: string;
  mentions?: string[];
}

export interface TaskHistoryEntry {
  id: string;
  at: string;
  authorId: string;
  /** «status_changed», «assigned», «priority_changed» */
  kind: string;
  from?: string;
  to?: string;
}

export interface TaskDependency {
  blocks: string[];
  blockedBy: string[];
}

export type TaskRecurringFreq = "daily" | "weekly" | "monthly" | "yearly";

export interface TaskRecurringRule {
  freq: TaskRecurringFreq;
  /** наступний планований запуск (ISO date) */
  nextRun: string;
}

export interface UniversalTask {
  id: string;
  title: string;
  description?: string;
  statusId: TaskStatusId;
  teamId?: string;
  assigneeId?: string;
  priority: TaskPriority;
  deadline?: string;
  epicId?: string;
  sprintId?: string;
  tags?: string[];
  estimateHours?: number;
  actualHours?: number;
  storyPoints?: number;
  subtasks?: TaskSubtask[];
  dependencies?: TaskDependency;
  comments?: TaskComment[];
  history?: TaskHistoryEntry[];
  recurring?: TaskRecurringRule;
  templateId?: string;
  /** Cross-module links */
  linkedDealId?: string;
  linkedAccountId?: string;
  linkedDocumentId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ──────────────────────────── Preset (per cabinet-type) ────────────────────────────

export type TasksViewId =
  | "kanban"
  | "list"
  | "my"
  | "sprint"
  | "timeline"
  | "calendar"
  | "team";

export type TasksKpiId =
  | "total"
  | "in_progress"
  | "done"
  | "overdue"
  | "team_size"
  | "due_today"
  | "due_this_week"
  | "blocked";

export interface TasksTerminology {
  task: string;
  taskPlural: string;
  moduleTitle: string;
  moduleSubtitle: string;
  /** «Команда» / «Бюро» / «Учасники» */
  teamLabel: string;
  /** «Завершити» / «Виконати» */
  completeVerb: string;
}

export interface TasksPlaybookStep {
  title: string;
  /** offset в днях від trigger-дати */
  dueOffsetDays: number;
  priority?: TaskPriority;
  assigneeRole?: string;
  estimateHours?: number;
}

export interface TasksPlaybook {
  id: string;
  title: string;
  description: string;
  /** trigger: «deal_won», «client_onboarded», «month_close» тощо */
  trigger: string;
  steps: TasksPlaybookStep[];
}

export interface TasksPreset {
  id: string;
  description: string;
  terminology: TasksTerminology;
  statuses: TaskStatusColumn[];
  /** Які views показувати у таб-перемикачі */
  views: TasksViewId[];
  /** KPI у стрічці зверху */
  kpis: TasksKpiId[];
  /** Чи показувати swimlanes/team-load (false для соло-кабінетів) */
  showTeamFeatures: boolean;
  /** Шаблони процесів */
  playbooks?: TasksPlaybook[];
}

// ──────────────────────────── Capability ────────────────────────────

export interface TasksCapability {
  enabled: boolean;
  presetId: string;
  reason?: "employees" | "multi_member" | "solo_personal" | "default";
}
