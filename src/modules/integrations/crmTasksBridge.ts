/**
 * crmTasksBridge — pure helpers, що з'єднують CRM ↔ Tasks.
 *
 * Не залежать від React: повертають input-обʼєкти, які можна передати
 * у useUniversalTasksStore.addTask(...).
 *
 * Сценарії:
 *  - playbookToTasks(deal, account, playbook, tasksPreset)
 *      → масив задач за шаблоном (онбординг, місячне закриття тощо)
 *  - quickTaskFromDeal(deal, account, tasksPreset, title?)
 *      → одна manual-задача, привʼязана до угоди
 *  - suggestNextSteps(deal, account, crmPreset)
 *      → 3 евристичні AI-style підказки наступних кроків
 *      (можна замінити на edge function без зміни UI)
 */

import type {
  CrmAccount,
  CrmDeal,
  CrmPreset,
  CrmStage,
} from "@/modules/crm/types";
import type {
  TaskPriority,
  TasksPlaybook,
  TasksPreset,
  UniversalTask,
} from "@/modules/tasks/types";

export type TaskSeed = Omit<UniversalTask, "id" | "createdAt" | "updatedAt">;

export interface CrmTaskSuggestion {
  id: string;
  title: string;
  priority: TaskPriority;
  dueOffsetDays: number;
  reason: string;
  /** Категорія для іконки/візуалу */
  kind: "followup" | "discovery" | "close" | "clarify" | "retention" | "postmortem";
}

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
}

function defaultTodoStatusId(preset: TasksPreset): string {
  // Беремо перший НЕ-термінальний статус
  const first = preset.statuses.find((s) => !s.terminal);
  return first?.id ?? preset.statuses[0]?.id ?? "todo";
}

// ──────────────────────────── Playbook → Tasks ────────────────────────────

export function playbookToTasks(
  deal: CrmDeal,
  account: CrmAccount | undefined,
  playbook: TasksPlaybook,
  tasksPreset: TasksPreset,
  ownerId?: string,
): TaskSeed[] {
  const statusId = defaultTodoStatusId(tasksPreset);
  const accountLabel = account?.name ?? "клієнт";
  return playbook.steps.map<TaskSeed>((step) => ({
    title: `${step.title} — ${accountLabel}`,
    description: `Авто-крок плейбука «${playbook.title}» для угоди «${deal.title}».`,
    statusId,
    priority: step.priority ?? "med",
    deadline: isoDaysFromNow(step.dueOffsetDays),
    estimateHours: step.estimateHours,
    assigneeId: ownerId,
    tags: ["playbook", playbook.id, account?.tier ?? "client"].filter(Boolean) as string[],
    linkedDealId: deal.id,
    linkedAccountId: deal.accountId,
  }));
}

/** Шукає playbook за trigger у tasksPreset; повертає [] якщо нічого. */
export function findPlaybookByTrigger(
  trigger: string,
  tasksPreset: TasksPreset,
): TasksPlaybook | undefined {
  return tasksPreset.playbooks?.find((p) => p.trigger === trigger);
}

// ──────────────────────────── Quick / manual ────────────────────────────

export function quickTaskFromDeal(
  deal: CrmDeal,
  account: CrmAccount | undefined,
  tasksPreset: TasksPreset,
  options: {
    title?: string;
    priority?: TaskPriority;
    dueOffsetDays?: number;
    ownerId?: string;
  } = {},
): TaskSeed {
  const statusId = defaultTodoStatusId(tasksPreset);
  const title =
    options.title ?? `${deal.nextStep ?? "Наступний крок"} — ${account?.name ?? deal.title}`;
  return {
    title,
    description: `Привʼязано до угоди «${deal.title}».`,
    statusId,
    priority: options.priority ?? "med",
    deadline: isoDaysFromNow(options.dueOffsetDays ?? 3),
    assigneeId: options.ownerId,
    tags: ["crm", "manual"],
    linkedDealId: deal.id,
    linkedAccountId: deal.accountId,
  };
}

// ──────────────────────────── AI-style suggestions ────────────────────────────

/**
 * Евристичні підказки наступних кроків.
 * Pure — детерміновано на основі стану угоди. Інтерфейс ідентичний тому,
 * що поверне edge function `ai-crm-suggest` (майбутня заміна).
 */
export function suggestNextSteps(
  deal: CrmDeal,
  account: CrmAccount | undefined,
  crmPreset: CrmPreset,
): CrmTaskSuggestion[] {
  const stages = crmPreset.pipelines.find((p) => p.id === deal.pipelineId)?.stages ?? [];
  const stage: CrmStage | undefined = stages.find((s) => s.id === deal.stageId);
  const now = Date.now();
  const stageAgeDays = Math.floor((now - new Date(deal.stageEnteredAt).getTime()) / 86_400_000);
  const daysToClose = Math.ceil((new Date(deal.expectedCloseAt).getTime() - now) / 86_400_000);
  const accountLabel = account?.name ?? "клієнта";

  const out: CrmTaskSuggestion[] = [];

  if (stage?.terminal === "won") {
    out.push({
      id: "onboard-kickoff",
      title: `Kick-off дзвінок з ${accountLabel}`,
      priority: "high",
      dueOffsetDays: 1,
      reason: "Угоду виграно — стартуємо онбординг протягом 24 год.",
      kind: "retention",
    });
    out.push({
      id: "onboard-setup",
      title: `Налаштувати акаунт ${accountLabel}`,
      priority: "high",
      dueOffsetDays: 3,
      reason: "Перші 7 днів критичні для time-to-value.",
      kind: "retention",
    });
    out.push({
      id: "onboard-check",
      title: `Health-check ${accountLabel} +30 днів`,
      priority: "med",
      dueOffsetDays: 30,
      reason: "Контрольна точка адаптації після першого місяця.",
      kind: "retention",
    });
    return out;
  }

  if (stage?.terminal === "lost") {
    out.push({
      id: "lost-postmortem",
      title: `Post-mortem: чому програли ${accountLabel}`,
      priority: "med",
      dueOffsetDays: 3,
      reason: deal.lostReason
        ? `Причина: ${deal.lostReason}. Перевірити паттерн втрат.`
        : "Зафіксувати причину для аналізу воронки.",
      kind: "postmortem",
    });
    out.push({
      id: "lost-nurture",
      title: `Додати ${accountLabel} в nurture-кампанію`,
      priority: "low",
      dueOffsetDays: 7,
      reason: "Втрачені угоди повертаються через 6–12 міс.",
      kind: "followup",
    });
    return out;
  }

  // Active deal — підказки залежно від стану
  if (stageAgeDays >= 7) {
    out.push({
      id: "stale-followup",
      title: `Follow-up ${accountLabel} — стадія «${stage?.label ?? "?"}»`,
      priority: stageAgeDays >= 14 ? "high" : "med",
      dueOffsetDays: 1,
      reason: `Угода висить у поточній стадії ${stageAgeDays} дн. — потрібен пуш.`,
      kind: "followup",
    });
  }

  if (deal.probability < 30) {
    out.push({
      id: "low-prob-discovery",
      title: `Discovery-дзвінок з ${accountLabel}`,
      priority: "high",
      dueOffsetDays: 2,
      reason: `Імовірність лише ${deal.probability}% — треба валідувати потребу.`,
      kind: "discovery",
    });
  }

  if (daysToClose <= 7 && daysToClose >= 0 && stage?.terminal === undefined) {
    out.push({
      id: "close-push",
      title: `Закриваюча зустріч з ${accountLabel}`,
      priority: "urgent",
      dueOffsetDays: Math.max(0, daysToClose - 1),
      reason: `Очікуване закриття через ${daysToClose} дн. — фіналізувати умови.`,
      kind: "close",
    });
  } else if (daysToClose < 0 && stage?.terminal === undefined) {
    out.push({
      id: "overdue-close",
      title: `Переглянути дату закриття ${accountLabel}`,
      priority: "high",
      dueOffsetDays: 0,
      reason: `Дата закриття пройшла ${Math.abs(daysToClose)} дн. тому.`,
      kind: "close",
    });
  }

  if (!deal.nextStep) {
    out.push({
      id: "no-next-step",
      title: `Уточнити наступний крок з ${accountLabel}`,
      priority: "med",
      dueOffsetDays: 1,
      reason: "У карті угоди не зафіксовано Next Step.",
      kind: "clarify",
    });
  }

  // Fallback — як мінімум одна порада
  if (out.length === 0) {
    out.push({
      id: "default-touchpoint",
      title: `Touchpoint з ${accountLabel}`,
      priority: "low",
      dueOffsetDays: 5,
      reason: "Підтримати регулярний контакт у воронці.",
      kind: "followup",
    });
  }

  return out.slice(0, 3);
}

// ──────────────────────────── Suggestion → TaskSeed ────────────────────────────

export function suggestionToTask(
  suggestion: CrmTaskSuggestion,
  deal: CrmDeal,
  tasksPreset: TasksPreset,
  ownerId?: string,
): TaskSeed {
  return {
    title: suggestion.title,
    description: `AI-підказка: ${suggestion.reason}`,
    statusId: defaultTodoStatusId(tasksPreset),
    priority: suggestion.priority,
    deadline: isoDaysFromNow(suggestion.dueOffsetDays),
    assigneeId: ownerId,
    tags: ["ai-suggest", suggestion.kind],
    linkedDealId: deal.id,
    linkedAccountId: deal.accountId,
  };
}
