/**
 * Seed demo Universal Tasks per preset. Детерміністичні id для стабільності.
 */

import type { TasksPreset, UniversalTask, TaskPriority } from "../types";

function isoDaysOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

interface Template {
  title: string;
  description?: string;
  statusIdx: number;
  priority: TaskPriority;
  dueOffsetDays?: number;
  assigneeName?: string;
  estimateHours?: number;
  tags?: string[];
}

const TEMPLATES: Record<string, Template[]> = {
  accounting_firm: [
    { title: "Отримати первинку від ТОВ «ПромБуд»",         statusIdx: 0, priority: "high",   dueOffsetDays: 2,  assigneeName: "Олена Шевченко", estimateHours: 1,  tags: ["prombud"] },
    { title: "Провести банк ФОП Петренко за лютий",          statusIdx: 1, priority: "high",   dueOffsetDays: 5,  assigneeName: "Ірина Петренко",  estimateHours: 2,  tags: ["bank"] },
    { title: "Підготувати ПДВ-декларацію «Кафе Лісове»",     statusIdx: 1, priority: "urgent", dueOffsetDays: 3,  assigneeName: "Олена Шевченко", estimateHours: 4,  tags: ["pdv", "lisove"] },
    { title: "Перевірити зарплату «Медіа-Стар»",             statusIdx: 2, priority: "med",    dueOffsetDays: 7,  assigneeName: "Юлія Білик",      estimateHours: 1,  tags: ["zp"] },
    { title: "Закриття місяця «АвтоСервіс-Центр»",           statusIdx: 0, priority: "high",   dueOffsetDays: 8,  assigneeName: "Сергій Гончар",   estimateHours: 6,  tags: ["close"] },
    { title: "Нагадати про оплату гонорару (3 клієнти)",     statusIdx: 0, priority: "low",    dueOffsetDays: 1,  estimateHours: 0.5 },
    { title: "Звіт ЄСВ Q1 2026",                              statusIdx: 1, priority: "urgent", dueOffsetDays: -1, assigneeName: "Ірина Петренко",  estimateHours: 2,  tags: ["esv", "q1"] },
    { title: "Архів первинки 2024 → передати клієнту",       statusIdx: 3, priority: "low",    dueOffsetDays: -5, assigneeName: "Олена Шевченко", estimateHours: 1 },
    { title: "Консультація: перехід ФОП 2→3 групу",          statusIdx: 0, priority: "med",    dueOffsetDays: 4,  assigneeName: "Юлія Білик",      estimateHours: 1 },
  ],
  sales_ops: [
    { title: "Дзвінок: ТОВ «Метал-Південь» (специфікація)", statusIdx: 0, priority: "high",   dueOffsetDays: 1, assigneeName: "Олег Маркетол.", estimateHours: 0.5, tags: ["follow-up"] },
    { title: "Лист: котирування «Агро-Степ»",               statusIdx: 1, priority: "high",   dueOffsetDays: 2, assigneeName: "Олег Маркетол.", estimateHours: 1,   tags: ["email"] },
    { title: "Демо для «БудМаркет»",                         statusIdx: 1, priority: "urgent", dueOffsetDays: 0, assigneeName: "Андрій Сейлз",  estimateHours: 1,   tags: ["demo"] },
    { title: "Очікуємо рішення «Енерго-Захід»",              statusIdx: 2, priority: "med",    dueOffsetDays: 5, assigneeName: "Олег Маркетол.", estimateHours: 0.25 },
    { title: "QBR з «Сонячна Енергія»",                      statusIdx: 0, priority: "high",   dueOffsetDays: 6, assigneeName: "Андрій Сейлз",  estimateHours: 1.5, tags: ["qbr"] },
    { title: "Каденція: 5 follow-up листів за тиждень",      statusIdx: 1, priority: "med",    dueOffsetDays: 3, assigneeName: "Олег Маркетол.", estimateHours: 2,   tags: ["cadence"] },
    { title: "WhatsApp ФОП Кравчук — підтвердження оплати",  statusIdx: 3, priority: "low",    dueOffsetDays: -1, assigneeName: "Андрій Сейлз",  estimateHours: 0.25 },
    { title: "Підготовка комерційної пропозиції (template)", statusIdx: 0, priority: "med",    dueOffsetDays: 4, estimateHours: 2,  tags: ["template"] },
  ],
};

export function seedUniversalTasks(preset: TasksPreset): UniversalTask[] {
  const templates = TEMPLATES[preset.id] ?? [];
  if (templates.length === 0) return [];

  // Не сидимо у термінальні статуси крім кількох done
  const now = new Date().toISOString();

  return templates.map((t, idx) => {
    const status = preset.statuses[Math.min(t.statusIdx, preset.statuses.length - 1)] ?? preset.statuses[0];
    const isDone = status.terminal === "done";
    return {
      id: `utask-${preset.id}-${idx}`,
      title: t.title,
      description: t.description,
      statusId: status.id,
      priority: t.priority,
      deadline: t.dueOffsetDays !== undefined ? isoDaysOffset(t.dueOffsetDays) : undefined,
      assigneeId: t.assigneeName ? `member-${preset.id}-${t.assigneeName.replace(/\s+/g, "-")}` : undefined,
      estimateHours: t.estimateHours,
      tags: t.tags,
      createdAt: now,
      updatedAt: now,
      completedAt: isDone ? now : undefined,
    } satisfies UniversalTask;
  });
}

/** Допоміжна функція: побудувати список «членів команди» з імен у seed */
export function deriveSeedMembers(tasks: UniversalTask[]): Array<{ id: string; name: string }> {
  const map = new Map<string, string>();
  tasks.forEach((t) => {
    if (!t.assigneeId) return;
    const name = t.assigneeId.replace(/^member-[^-]+-/, "").replace(/-/g, " ");
    map.set(t.assigneeId, name);
  });
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
}
