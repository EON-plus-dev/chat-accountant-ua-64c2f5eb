/**
 * Mock-дані для Work Center (individual cabinet, demo).
 * Read-only, без нових таблиць.
 */

import {
  FileText,
  GraduationCap,
  Receipt,
  Bot,
  Plane,
  CheckCircle2,
  Calculator,
  RefreshCcw,
  FileSignature,
  Scale,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type WcModule =
  | "Податкова знижка"
  | "Фінансовий контроль"
  | "Документи"
  | "Фінанси"
  | "Подорож"
  | "Декларація";

export type WcTone = "orange" | "blue" | "green" | "violet" | "rose";

export interface WcCardBase {
  id: string;
  title: string;
  module: WcModule;
  icon: LucideIcon;
  /** isoDate */
  dueAt?: string;
  priority?: "urgent" | "high" | "normal";
  /** Per-module accent color for the icon chip */
  tone?: WcTone;
}

export interface AttentionCard extends WcCardBase {
  kind: "attention";
}

export interface DecisionCard extends WcCardBase {
  kind: "decision";
  status: string;
  amount?: string;
  meta?: string;
  /** Дозволити кнопку «Відхилити» */
  allowReject?: boolean;
}

export interface InProgressCard extends WcCardBase {
  kind: "progress";
  progressPct: number;
  nextStep: string;
}

export interface DoneCard extends WcCardBase {
  kind: "done";
  doneAt: string; // dd.MM.yyyy
}

export type WcCard = AttentionCard | DecisionCard | InProgressCard | DoneCard;

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  title: string;
  whenLabel: string;
  tone?: WcTone;
}

export interface WorkCenterData {
  attention: AttentionCard[];
  decision: DecisionCard[];
  progress: InProgressCard[];
  done: DoneCard[];
  /** Загальна кількість завершених за останній період (для лічильника) */
  doneTotal: number;
  activity: ActivityItem[];
  completedTodayCount: number;
  /** Стат-плитки для mobile focus-card */
  focusStats: {
    needsAttention: number;
    awaitingDecision: number;
    risk: number;
  };
  dailyPlan: {
    items: string[];
    estimateMinutes: number;
  };
}

export function getWorkCenterMockData(): WorkCenterData {
  return {
    attention: [
      { id: "a1", kind: "attention", title: "Завантажити довідку з ВНЗ", module: "Податкова знижка", icon: GraduationCap, dueAt: "2026-05-01", priority: "urgent", tone: "orange" },
      { id: "a2", kind: "attention", title: "Перевірити виписку за Q2", module: "Фінансовий контроль", icon: FileText, dueAt: "2026-06-30", priority: "high", tone: "blue" },
      { id: "a3", kind: "attention", title: "Оновити дані в Дії", module: "Документи", icon: RefreshCcw, dueAt: "2026-05-05", priority: "high", tone: "green" },
      { id: "a4", kind: "attention", title: "Підписати договір оренди", module: "Документи", icon: FileSignature, dueAt: "2026-05-12", priority: "normal", tone: "violet" },
    ],
    decision: [
      { id: "d1", kind: "decision", title: "AI підготував декларацію", module: "Декларація", icon: Bot, status: "готово до перевірки", meta: "Документів: 5 з 5", tone: "violet", allowReject: true },
      { id: "d2", kind: "decision", title: "AI підготував платіж", module: "Фінанси", icon: Bot, status: "готово до підтвердження", amount: "4 200 грн", meta: "ПДФО за продаж нерухомості", tone: "violet" },
    ],
    progress: [
      { id: "p1", kind: "progress", title: "Підготовка декларації", module: "Декларація", icon: Scale, progressPct: 80, nextStep: "Перевірити доходи", tone: "blue" },
      { id: "p2", kind: "progress", title: "Податкова знижка", module: "Податкова знижка", icon: Calculator, progressPct: 67, nextStep: "Завантажити довідку з ВНЗ", tone: "blue" },
      { id: "p3", kind: "progress", title: "Подорож до Японії", module: "Подорож", icon: Plane, progressPct: 45, nextStep: "Підтвердити бронювання", tone: "blue" },
    ],
    done: [
      { id: "x1", kind: "done", title: "Подано декларацію", module: "Фінанси", icon: CheckCircle2, doneAt: "01.05.2026", tone: "green" },
      { id: "x2", kind: "done", title: "Сплачено ПДФО", module: "Фінанси", icon: CheckCircle2, doneAt: "28.04.2026", tone: "green" },
      { id: "x3", kind: "done", title: "Розраховано податкову знижку", module: "Фінанси", icon: CheckCircle2, doneAt: "20.04.2026", tone: "green" },
      { id: "x4", kind: "done", title: "Оновлено дані в Дії", module: "Документи", icon: CheckCircle2, doneAt: "18.04.2026", tone: "green" },
      { id: "x5", kind: "done", title: "Отримано довідку про доходи", module: "Документи", icon: CheckCircle2, doneAt: "16.04.2026", tone: "green" },
    ],
    doneTotal: 12,
    activity: [
      { id: "e1", icon: Bot, title: "AI оновив декларацію", whenLabel: "3 години тому", tone: "orange" },
      { id: "e2", icon: Scale, title: "Отримано довідку про доходи", whenLabel: "Вчора", tone: "blue" },
      { id: "e3", icon: Scale, title: "Подано декларацію", whenLabel: "5 днів тому", tone: "violet" },
      { id: "e4", icon: Receipt, title: "Сплачено ПДФО", whenLabel: "2 тижні тому", tone: "green" },
      { id: "e5", icon: FileText, title: "Створено задачу «Перевірити виписку за Q2»", whenLabel: "2 тижні тому", tone: "orange" },
      { id: "e6", icon: Wallet, title: "Інтеграція з Дією синхронізована", whenLabel: "3 тижні тому", tone: "blue" },
    ],
    completedTodayCount: 7,
    focusStats: {
      needsAttention: 4,
      awaitingDecision: 2,
      risk: 1,
    },
    dailyPlan: {
      items: ["Завантажити довідку з ВНЗ", "Погодити декларацію", "Перевірити виписку за Q2"],
      estimateMinutes: 8,
    },
  };
}

export function fmtDueShort(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}.${mm}.${yy}`;
}

export function isUrgentDue(iso?: string): boolean {
  if (!iso) return false;
  const diff = (new Date(iso).getTime() - Date.now()) / 86_400_000;
  return diff <= 7;
}

export const TONE_ICON_CLASS: Record<WcTone, string> = {
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
};
