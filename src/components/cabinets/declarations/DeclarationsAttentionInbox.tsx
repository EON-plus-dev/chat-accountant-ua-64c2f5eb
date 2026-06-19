// Phase 7.6 — AttentionInbox для модуля декларацій.
// Принцип: ОДНА картка на кейс. Обираємо найгостріший сигнал
// (overdue > deadline ≤7д > заблокований додаток > готова до підпису >
//  потребує уточнень > свіжа AI-чернетка). Жодних дублів типу
// "AI сформував чернетку 2025" + "Дедлайн 2025 прострочено" поруч.

import { Sparkles, AlertTriangle, CalendarClock, FileWarning, ShieldCheck } from "lucide-react";
import { AttentionInbox } from "@/components/cabinets/shared/attention-inbox";
import type { AttentionItem } from "@/components/cabinets/shared/attention-inbox";
import type { DeclarationCase } from "@/config/demoCabinets/declarationCases";
import { buildDeclarationSnapshot } from "@/config/demoCabinets/declarationSnapshot";
import { pluralizeDays } from "@/lib/ukrainian-pluralize";

interface DeclarationsAttentionInboxProps {
  cases: DeclarationCase[];
  onOpenCase: (caseId: string) => void;
}

const daysBetween = (a: Date, b: Date) =>
  Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

const pluralizePositions = (n: number) => {
  const last = n % 10;
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 19) return "позицій потребують";
  if (last === 1) return "позиція потребує";
  if (last >= 2 && last <= 4) return "позиції потребують";
  return "позицій потребують";
};

export function DeclarationsAttentionInbox({ cases, onOpenCase }: DeclarationsAttentionInboxProps) {
  const items: AttentionItem[] = [];
  const now = new Date();

  for (const c of cases) {
    if (c.status === "submitted" || c.status === "accepted") continue;

    const snapshot = buildDeclarationSnapshot(c);
    const errors = snapshot.warnings.filter((w) => w.severity === "error");
    const reviewLines = snapshot.incomes.filter((l) => l.needsReview);
    const blockedAppendices = snapshot.appendices.filter((a) => !a.ready);
    const deadline = new Date(c.reportingYear + 1, 4, 1); // 01.05.YYYY+1
    const daysToDeadline = daysBetween(now, deadline);

    // Збираємо кандидатів і обираємо ОДНОГО найгострішого.
    const candidates: AttentionItem[] = [];

    // 1) Overdue — найгостріший сигнал
    if (daysToDeadline <= 0) {
      const overdueDays = Math.abs(daysToDeadline);
      candidates.push({
        id: `case-${c.id}`,
        priority: "critical",
        icon: CalendarClock,
        title: `Дедлайн декларації ${c.reportingYear} прострочено${overdueDays > 0 ? ` на ${overdueDays} ${pluralizeDays(overdueDays)}` : ""}`,
        meta: `Кожен день затримки — пеня + штраф · ${snapshot.generation.sourceCount} операцій з модулів готові`,
        primaryAction: { label: "Терміново", onClick: () => onOpenCase(c.id) },
      });
    }

    // 2) Заблокований додаток — критично, але не таке гостре як overdue
    if (blockedAppendices.length > 0) {
      candidates.push({
        id: `case-${c.id}`,
        priority: "critical",
        icon: FileWarning,
        title: `Декларація ${c.reportingYear}: додаток ${blockedAppendices[0].label} блокує подання`,
        meta: blockedAppendices[0].blockReason ?? "Потребує доопрацювання",
        primaryAction: { label: "Відкрити", onClick: () => onOpenCase(c.id) },
      });
    }

    // 3) Дедлайн ≤30 днів
    if (daysToDeadline > 0 && daysToDeadline <= 30) {
      candidates.push({
        id: `case-${c.id}`,
        priority: daysToDeadline <= 7 ? "critical" : "attention",
        icon: CalendarClock,
        title: `Дедлайн декларації ${c.reportingYear} — через ${daysToDeadline} ${pluralizeDays(daysToDeadline)}`,
        meta: `01.05.${c.reportingYear + 1} · підпишіть і подайте до цієї дати`,
        primaryAction: { label: "До кейсу", onClick: () => onOpenCase(c.id) },
      });
    }

    // 4) Готова до підпису
    if (c.status === "ready_to_confirm") {
      candidates.push({
        id: `case-${c.id}`,
        priority: "attention",
        icon: ShieldCheck,
        title: `Декларація ${c.reportingYear} готова до підпису`,
        meta: `Усі додатки сформовано, перевірку пройдено`,
        primaryAction: { label: "Підписати", onClick: () => onOpenCase(c.id) },
      });
    }

    // 5) Спірні позиції
    if (reviewLines.length > 0 && c.status !== "in_review") {
      candidates.push({
        id: `case-${c.id}`,
        priority: errors.length > 0 ? "critical" : "attention",
        icon: AlertTriangle,
        title: `Декларація ${c.reportingYear}: ${reviewLines.length} ${pluralizePositions(reviewLines.length)} уточнення`,
        meta: reviewLines.slice(0, 2).map((l) => l.label).join(" · ") || undefined,
        primaryAction: { label: "Відкрити кейс", onClick: () => onOpenCase(c.id) },
      });
    }

    // 6) Свіжа AI-чернетка — найслабший сигнал, лише якщо нічого більш гострого
    if (c.status === "draft" && c.id.startsWith("auto-") && candidates.length === 0) {
      candidates.push({
        id: `case-${c.id}`,
        priority: "normal",
        icon: Sparkles,
        title: `AI сформував чернетку декларації за ${c.reportingYear} рік`,
        meta: `${snapshot.generation.sourceCount} операцій з ваших модулів · ${snapshot.incomes.length} рядків доходу`,
        badge: { text: "AI", tone: "ai" },
        primaryAction: { label: "Переглянути", onClick: () => onOpenCase(c.id) },
      });
    }

    // Обираємо одного найгострішого (mergeAttentionItems зробить це по id)
    if (candidates.length > 0) {
      items.push(...candidates);
    }
  }

  if (items.length === 0) return null;

  return <AttentionInbox sectionKey="declarations" items={items} />;
}
