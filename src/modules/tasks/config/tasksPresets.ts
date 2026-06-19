/**
 * Tasks-пресети per cabinet-type.
 * Виводять термінологію, статуси, доступні views, KPI та playbooks.
 */

import type { TasksPreset } from "../types";

// ──────────────────────────── Dev Team (Fintodo, ТОВ-розробка) ────────────────────────────
export const DEV_TEAM_PRESET: TasksPreset = {
  id: "dev_team",
  description: "Команда розробки: спринти, епіки, code review",
  terminology: {
    task: "Завдання",
    taskPlural: "Завдання",
    moduleTitle: "Команда & Завдання",
    moduleSubtitle: "Спринти, епіки, навантаження команди",
    teamLabel: "Команда",
    completeVerb: "Завершити",
  },
  statuses: [
    { id: "backlog",     label: "Бекл",      color: "bg-slate-500"   },
    { id: "in_progress", label: "В роботі",  color: "bg-blue-500",   wipLimit: 8 },
    { id: "review",      label: "На рев'ю",  color: "bg-amber-500",  wipLimit: 5 },
    { id: "done",        label: "Готово",    color: "bg-emerald-500", terminal: "done" },
  ],
  views: ["kanban", "list", "my", "sprint", "timeline", "calendar", "team"],
  kpis: ["total", "in_progress", "done", "overdue", "team_size"],
  showTeamFeatures: true,
  playbooks: [
    {
      id: "new_client_onboarding",
      title: "Онбординг нового клієнта Pro",
      description: "6-крокова процедура для нового платного клієнта",
      trigger: "deal_won",
      steps: [
        { title: "Привітальний дзвінок CSM",         dueOffsetDays: 1, priority: "high", assigneeRole: "csm",   estimateHours: 1 },
        { title: "Налаштувати кабінет та інтеграції", dueOffsetDays: 3, priority: "high", assigneeRole: "csm",  estimateHours: 3 },
        { title: "Перший тренінг команди клієнта",   dueOffsetDays: 7, priority: "med",  assigneeRole: "csm",   estimateHours: 2 },
        { title: "Health-check через 30 днів",       dueOffsetDays: 30, priority: "med", assigneeRole: "csm",   estimateHours: 1 },
        { title: "QBR через 90 днів",                dueOffsetDays: 90, priority: "med", assigneeRole: "csm",   estimateHours: 2 },
        { title: "Звіт по результатах 6 міс",        dueOffsetDays: 180, priority: "low", assigneeRole: "csm",  estimateHours: 2 },
      ],
    },
  ],
};

// ──────────────────────────── Accounting Firm (бюро) ────────────────────────────
export const ACCOUNTING_FIRM_PRESET: TasksPreset = {
  id: "accounting_firm",
  description: "Бухгалтерське бюро: щомісячні закриття, звіти",
  terminology: {
    task: "Робота",
    taskPlural: "Роботи",
    moduleTitle: "Робочий простір бюро",
    moduleSubtitle: "Місячні закриття, звіти, навантаження бухгалтерів",
    teamLabel: "Бухгалтери",
    completeVerb: "Виконати",
  },
  statuses: [
    { id: "todo",        label: "До виконання", color: "bg-slate-500" },
    { id: "in_progress", label: "В роботі",     color: "bg-blue-500"  },
    { id: "review",      label: "На перевірці", color: "bg-amber-500" },
    { id: "done",        label: "Здано",        color: "bg-emerald-500", terminal: "done" },
  ],
  views: ["kanban", "list", "my", "calendar", "team"],
  kpis: ["total", "in_progress", "due_today", "due_this_week", "overdue", "team_size"],
  showTeamFeatures: true,
  playbooks: [
    {
      id: "monthly_close",
      title: "Місячне закриття клієнта",
      description: "Стандартний цикл закриття місяця для одного клієнта",
      trigger: "month_close",
      steps: [
        { title: "Отримати первинку від клієнта",   dueOffsetDays: 2,  priority: "high" },
        { title: "Провести банк та касу",           dueOffsetDays: 5,  priority: "high" },
        { title: "Зарплата та податки з ФОП праці", dueOffsetDays: 10, priority: "high" },
        { title: "ПДВ-декларація",                  dueOffsetDays: 18, priority: "urgent" },
        { title: "Податок на прибуток / ЄП",        dueOffsetDays: 19, priority: "urgent" },
        { title: "Звіт клієнту з результатами",     dueOffsetDays: 22, priority: "med" },
        { title: "Нагадування про оплату гонорару", dueOffsetDays: 25, priority: "low" },
      ],
    },
    {
      id: "new_client_onboarding_bureau",
      title: "Онбординг нового клієнта бюро",
      description: "Стартові кроки після підписання договору",
      trigger: "deal_won",
      steps: [
        { title: "Підписати договір та NDA",          dueOffsetDays: 1, priority: "high", estimateHours: 1 },
        { title: "Зібрати установчі документи",       dueOffsetDays: 3, priority: "high", estimateHours: 2 },
        { title: "Налаштувати кабінет клієнта",       dueOffsetDays: 5, priority: "med",  estimateHours: 2 },
        { title: "Перше місячне закриття",            dueOffsetDays: 25, priority: "med", estimateHours: 6 },
      ],
    },
  ],
};

// ──────────────────────────── Sales Ops (CRM-команда) ────────────────────────────
export const SALES_OPS_PRESET: TasksPreset = {
  id: "sales_ops",
  description: "Sales / CSM: каденції, follow-up, QBR",
  terminology: {
    task: "Активність",
    taskPlural: "Активності",
    moduleTitle: "Sales-операції",
    moduleSubtitle: "Каденції, follow-up, дзвінки",
    teamLabel: "Команда продажів",
    completeVerb: "Виконано",
  },
  statuses: [
    { id: "queued",      label: "У черзі",   color: "bg-slate-500" },
    { id: "in_progress", label: "В роботі",  color: "bg-blue-500"  },
    { id: "waiting",     label: "Чекає",     color: "bg-amber-500" },
    { id: "done",        label: "Виконано",  color: "bg-emerald-500", terminal: "done" },
  ],
  views: ["my", "list", "kanban", "calendar"],
  kpis: ["total", "in_progress", "due_today", "overdue"],
  showTeamFeatures: true,
  playbooks: [
    {
      id: "deal_won_handoff",
      title: "Передача угоди в CSM",
      description: "Швидкий handoff виграної угоди на онбординг",
      trigger: "deal_won",
      steps: [
        { title: "Welcome-лист клієнту",         dueOffsetDays: 0, priority: "high", estimateHours: 0.5 },
        { title: "Передати CSM з контекстом",    dueOffsetDays: 1, priority: "high", estimateHours: 1 },
        { title: "Kick-off зустріч",             dueOffsetDays: 3, priority: "med",  estimateHours: 1 },
      ],
    },
    {
      id: "deal_lost_postmortem",
      title: "Post-mortem втраченої угоди",
      description: "Аналіз причин і повернення в nurture",
      trigger: "deal_lost",
      steps: [
        { title: "Зафіксувати причину втрати",       dueOffsetDays: 1, priority: "med" },
        { title: "Додати клієнта в nurture-сегмент", dueOffsetDays: 3, priority: "low" },
      ],
    },
  ],
};

// ──────────────────────────── Personal (фізособа, ФОП-соло) ────────────────────────────
export const PERSONAL_TASKS_PRESET: TasksPreset = {
  id: "personal",
  description: "Особисті задачі (без команди)",
  terminology: {
    task: "Задача",
    taskPlural: "Задачі",
    moduleTitle: "Мої задачі",
    moduleSubtitle: "Особистий to-do",
    teamLabel: "—",
    completeVerb: "Виконати",
  },
  statuses: [
    { id: "todo",        label: "До виконання", color: "bg-slate-500" },
    { id: "in_progress", label: "В роботі",     color: "bg-blue-500"  },
    { id: "done",        label: "Виконано",     color: "bg-emerald-500", terminal: "done" },
  ],
  views: ["my", "list", "calendar"],
  kpis: ["total", "in_progress", "due_today", "overdue"],
  showTeamFeatures: false,
};

// ──────────────────────────── Registry ────────────────────────────
export const TASKS_PRESETS = {
  dev_team: DEV_TEAM_PRESET,
  accounting_firm: ACCOUNTING_FIRM_PRESET,
  sales_ops: SALES_OPS_PRESET,
  personal: PERSONAL_TASKS_PRESET,
} as const;

export type TasksPresetId = keyof typeof TASKS_PRESETS;

export function getTasksPreset(id: string): TasksPreset {
  return (TASKS_PRESETS as Record<string, TasksPreset>)[id] ?? DEV_TEAM_PRESET;
}
