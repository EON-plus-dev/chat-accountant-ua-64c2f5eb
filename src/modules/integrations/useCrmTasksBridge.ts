/**
 * useCrmTasksBridge — React-обгортка над двома сторами (CRM + Tasks)
 * з готовими операціями інтеграції.
 *
 * Використовується у CrmPipelineBoard / CrmDealSheet, щоб без додаткового
 * prop-drilling викликати:
 *   - linkedTasks(dealId)
 *   - createTaskFromSuggestion(deal, suggestion)
 *   - runPlaybookForDeal(deal, trigger)
 *   - addManualTaskForDeal(deal, overrides?)
 */

import { useCallback, useMemo } from "react";
import { useCrmStore } from "@/modules/crm/store/useCrmStore";
import { useUniversalTasksStore } from "@/modules/tasks/store/useUniversalTasksStore";
import type { CrmPreset, CrmDeal } from "@/modules/crm/types";
import type { TasksPreset, UniversalTask } from "@/modules/tasks/types";
import {
  findPlaybookByTrigger,
  playbookToTasks,
  quickTaskFromDeal,
  suggestionToTask,
  suggestNextSteps,
  type CrmTaskSuggestion,
} from "./crmTasksBridge";

interface Options {
  cabinetId: string;
  crmPreset: CrmPreset;
  tasksPreset: TasksPreset;
}

export function useCrmTasksBridge({ cabinetId, crmPreset, tasksPreset }: Options) {
  const crm = useCrmStore({ cabinetId, preset: crmPreset });
  const tasks = useUniversalTasksStore({ cabinetId, preset: tasksPreset });

  const linkedByDeal = useMemo(() => {
    const map = new Map<string, UniversalTask[]>();
    for (const t of tasks.tasks) {
      if (!t.linkedDealId) continue;
      const arr = map.get(t.linkedDealId) ?? [];
      arr.push(t);
      map.set(t.linkedDealId, arr);
    }
    return map;
  }, [tasks.tasks]);

  const linkedTasks = useCallback(
    (dealId: string): UniversalTask[] => linkedByDeal.get(dealId) ?? [],
    [linkedByDeal],
  );

  const getSuggestions = useCallback(
    (deal: CrmDeal): CrmTaskSuggestion[] => {
      const account = crm.getAccount(deal.accountId);
      return suggestNextSteps(deal, account, crmPreset);
    },
    [crm, crmPreset],
  );

  const createTaskFromSuggestion = useCallback(
    (deal: CrmDeal, suggestion: CrmTaskSuggestion) => {
      const seed = suggestionToTask(suggestion, deal, tasksPreset, deal.ownerId);
      return tasks.addTask(seed);
    },
    [tasks, tasksPreset],
  );

  const addManualTaskForDeal = useCallback(
    (deal: CrmDeal, title?: string) => {
      const account = crm.getAccount(deal.accountId);
      const seed = quickTaskFromDeal(deal, account, tasksPreset, { title, ownerId: deal.ownerId });
      return tasks.addTask(seed);
    },
    [crm, tasks, tasksPreset],
  );

  const runPlaybookForDeal = useCallback(
    (deal: CrmDeal, trigger: string): UniversalTask[] => {
      const playbook = findPlaybookByTrigger(trigger, tasksPreset);
      if (!playbook) return [];
      const account = crm.getAccount(deal.accountId);
      const seeds = playbookToTasks(deal, account, playbook, tasksPreset, deal.ownerId);
      return seeds.map((s) => tasks.addTask(s));
    },
    [crm, tasks, tasksPreset],
  );

  return {
    crm,
    tasks,
    linkedTasks,
    getSuggestions,
    createTaskFromSuggestion,
    addManualTaskForDeal,
    runPlaybookForDeal,
  };
}
