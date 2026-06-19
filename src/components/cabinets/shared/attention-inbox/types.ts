import type { LucideIcon } from "lucide-react";

/**
 * AttentionInbox — універсальна модель «вхідних дій» для будь-якого розділу кабінету.
 *
 * 3 рівні пріоритету (Linear/Stripe pattern):
 *   - critical:  прострочено / блокує роботу (червоний, sticky header, auto-expand)
 *   - attention: ≤7 днів / потребує дії цього тижня (амбер, collapsed by default)
 *   - normal:    планове, є час (нейтральний, collapsed by default)
 *
 * Дедуплікація: одна сутність (id) може потрапити в кілька джерел (next deadline + review).
 * Адаптери розділу мусять викликати mergeAttentionItems() перед передачею в UI.
 */
export type AttentionPriority = "critical" | "attention" | "normal";

export type AttentionBadgeTone = "ai" | "new" | "count";

export interface AttentionAction {
  label: string;
  onClick: () => void;
}

export interface AttentionItem {
  id: string;
  priority: AttentionPriority;
  icon: LucideIcon;
  /** Головний акцент — ЩО (назва сутності). */
  title: string;
  /** Subline — КОЛИ + контекст. */
  meta?: string;
  badge?: { text: string; tone: AttentionBadgeTone };
  primaryAction: AttentionAction;
  secondaryActions?: AttentionAction[];
  /** Якщо задано — tap по item на mobile веде сюди (інакше викликається primaryAction). */
  href?: string;
}

const PRIORITY_RANK: Record<AttentionPriority, number> = {
  critical: 0,
  attention: 1,
  normal: 2,
};

/** Дедуплікація по id — обираємо item з найвищим пріоритетом. */
export function mergeAttentionItems(items: AttentionItem[]): AttentionItem[] {
  const map = new Map<string, AttentionItem>();
  for (const item of items) {
    const existing = map.get(item.id);
    if (!existing || PRIORITY_RANK[item.priority] < PRIORITY_RANK[existing.priority]) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}

/** Сортування: critical → attention → normal (стабільне всередині групи). */
export function sortByPriority(items: AttentionItem[]): AttentionItem[] {
  return [...items].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  );
}

export function getHighestPriority(
  items: AttentionItem[],
): AttentionPriority | null {
  if (items.length === 0) return null;
  let best: AttentionPriority = "normal";
  for (const item of items) {
    if (PRIORITY_RANK[item.priority] < PRIORITY_RANK[best]) {
      best = item.priority;
    }
    if (best === "critical") break;
  }
  return best;
}

export function countByPriority(items: AttentionItem[]) {
  let critical = 0;
  let attention = 0;
  let normal = 0;
  for (const item of items) {
    if (item.priority === "critical") critical += 1;
    else if (item.priority === "attention") attention += 1;
    else normal += 1;
  }
  return { critical, attention, normal };
}
