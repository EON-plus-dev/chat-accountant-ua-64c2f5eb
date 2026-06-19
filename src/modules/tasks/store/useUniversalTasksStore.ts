/**
 * useUniversalTasksStore — універсальний CRUD-стор для UniversalTask[],
 * з localStorage-персистенцією per (cabinetId × presetId).
 *
 * Не плутати з існуючим useTasksStore — той тримає легку Task-структуру для
 * вкладок документів. Universal-стор працює з повноцінним UniversalTask
 * (статуси per preset, deadline, оцінки, dependencies, comments).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TasksPreset, UniversalTask, TaskPriority } from "../types";
import { seedUniversalTasks } from "../demo/seedTasks";

interface Options {
  cabinetId: string;
  preset: TasksPreset;
  persist?: boolean;
}

interface PersistedShape {
  v: 1;
  tasks: UniversalTask[];
}

const KEY_PREFIX = "tasks-universal-v1-";

function loadFromStorage(key: string): PersistedShape | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedShape;
    return parsed?.v === 1 && Array.isArray(parsed.tasks) ? parsed : null;
  } catch {
    return null;
  }
}

const PRIORITY_ORDER: Record<TaskPriority, number> = { urgent: 0, high: 1, med: 2, low: 3 };

export function useUniversalTasksStore({ cabinetId, preset, persist = true }: Options) {
  const storageKey = `${KEY_PREFIX}${cabinetId}-${preset.id}`;

  const [tasks, setTasks] = useState<UniversalTask[]>(() => {
    if (persist) {
      const loaded = loadFromStorage(storageKey);
      if (loaded) return loaded.tasks;
    }
    return seedUniversalTasks(preset);
  });

  useEffect(() => {
    if (!persist) return;
    const loaded = loadFromStorage(storageKey);
    if (!loaded) setTasks(seedUniversalTasks(preset));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ v: 1, tasks } satisfies PersistedShape));
    } catch { /* ignore */ }
  }, [tasks, storageKey, persist]);

  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aTerm = preset.statuses.find((s) => s.id === a.statusId)?.terminal ? 1 : 0;
      const bTerm = preset.statuses.find((s) => s.id === b.statusId)?.terminal ? 1 : 0;
      if (aTerm !== bTerm) return aTerm - bTerm;
      if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tasks, preset]);

  const moveToStatus = useCallback((id: string, statusId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id || t.statusId === statusId) return t;
        const terminal = preset.statuses.find((s) => s.id === statusId)?.terminal;
        return {
          ...t,
          statusId,
          updatedAt: new Date().toISOString(),
          completedAt: terminal === "done" ? new Date().toISOString() : undefined,
        };
      }),
    );
  }, [preset]);

  const updateTask = useCallback((id: string, patch: Partial<UniversalTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)));
  }, []);

  const addTask = useCallback((input: Omit<UniversalTask, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const task: UniversalTask = {
      ...input,
      id: `utask-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    setTasks((prev) => [task, ...prev]);
    return task;
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const reset = useCallback(() => {
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    setTasks(seedUniversalTasks(preset));
  }, [preset, storageKey]);

  return { tasks: sorted, moveToStatus, updateTask, addTask, deleteTask, reset };
}
