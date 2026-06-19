import { useMemo } from "react";
import { AlertTriangle, Calendar, FileWarning, Wallet } from "lucide-react";
import { differenceInDays } from "date-fns";
import {
  mergeAttentionItems,
  type AttentionItem,
  type AttentionPriority,
} from "@/components/cabinets/shared/attention-inbox";
import type { TaxPayment, SalaryPayment, ContractorPayment } from "@/config/paymentsConfig";
import { calcTaxPenalty } from "@/lib/taxPenaltyCalculator";

interface UsePaymentsAttentionItemsParams {
  taxPayments: TaxPayment[];
  salaryPayments?: SalaryPayment[];
  contractorPayments?: ContractorPayment[];
  onOpenPayment?: (paymentId: string) => void;
  onOpenAllOverdue?: () => void;
  onOpenPending?: () => void;
  onOpenScheduled?: () => void;
}

function deadlinePriority(days: number): AttentionPriority {
  if (days < 0) return "critical";
  if (days <= 7) return "attention";
  return "normal";
}

function relativeLabel(days: number): string {
  if (days < 0) return `Прострочено ${Math.abs(days)} дн.`;
  if (days === 0) return "Сьогодні";
  if (days === 1) return "Завтра";
  return `Через ${days} дн.`;
}

/**
 * Адаптер: перетворює платежі (податки, зарплати, контрагенти) у плоский список AttentionItem.
 * Джерела:
 *   - critical: прострочені податки (status === 'overdue' або deadline у минулому)
 *   - attention: непідтверджені/створені платежі з дедлайном ≤7 днів
 *   - attention: майбутні авто-списання (scheduled) у наступні 7 днів
 *   - normal: запланований розрахунок зарплат у наступні 14 днів
 */
export function usePaymentsAttentionItems({
  taxPayments,
  salaryPayments = [],
  contractorPayments = [],
  onOpenPayment,
  onOpenAllOverdue,
  onOpenPending,
  onOpenScheduled,
}: UsePaymentsAttentionItemsParams): AttentionItem[] {
  return useMemo(() => {
    const today = new Date();
    const items: AttentionItem[] = [];

    // 1. Прострочені податки — critical
    const overdueTax = taxPayments.filter((p) => {
      if (p.status === "overdue") return true;
      if (p.status === "paid" || p.status === "cancelled") return false;
      const days = differenceInDays(new Date(p.deadline), today);
      return days < 0;
    });

    if (overdueTax.length === 1) {
      const p = overdueTax[0];
      const days = differenceInDays(new Date(p.deadline), today);
      const penalty = calcTaxPenalty(p.amountToPay, Math.abs(days));
      const penaltyMeta = penalty.total > 0 ? ` · санкції +₴${penalty.total.toLocaleString("uk-UA")}` : "";
      items.push({
        id: `payment:${p.id}`,
        priority: "critical",
        icon: AlertTriangle,
        title: `${p.taxTypeLabel} — ${p.period}`,
        meta: `${relativeLabel(days)} · ${p.amountToPay.toLocaleString("uk-UA")} ₴${penaltyMeta}`,
        primaryAction: {
          label: "Сплатити",
          onClick: () => onOpenPayment?.(p.id),
        },
      });
    } else if (overdueTax.length > 1) {
      const totalOverdue = overdueTax.reduce((s, p) => s + p.amountToPay, 0);
      const totalPenalty = overdueTax.reduce((s, p) => {
        const days = Math.abs(differenceInDays(new Date(p.deadline), today));
        return s + calcTaxPenalty(p.amountToPay, days).total;
      }, 0);
      const penaltyMeta = totalPenalty > 0 ? ` · санкції +₴${totalPenalty.toLocaleString("uk-UA")}` : "";
      items.push({
        id: "payments:overdue-aggregate",
        priority: "critical",
        icon: AlertTriangle,
        title: `${overdueTax.length} прострочених податків`,
        meta: `Усього: ${totalOverdue.toLocaleString("uk-UA")} ₴${penaltyMeta}`,
        badge: { text: String(overdueTax.length), tone: "count" },
        primaryAction: {
          label: "Переглянути всі",
          onClick: () => onOpenAllOverdue?.(),
        },
      });
    }

    // 2. Платежі з дедлайном ≤7 днів (не прострочені, не сплачені)
    const upcomingTax = taxPayments
      .filter((p) => p.status !== "paid" && p.status !== "cancelled" && p.status !== "overdue")
      .map((p) => ({ p, days: differenceInDays(new Date(p.deadline), today) }))
      .filter(({ days }) => days >= 0 && days <= 7)
      .sort((a, b) => a.days - b.days);

    for (const { p, days } of upcomingTax.slice(0, 3)) {
      items.push({
        id: `payment:${p.id}`,
        priority: deadlinePriority(days),
        icon: Calendar,
        title: `${p.taxTypeLabel} — ${p.period}`,
        meta: `${relativeLabel(days)} · ${p.amountToPay.toLocaleString("uk-UA")} ₴`,
        primaryAction: {
          label: "Відкрити",
          onClick: () => onOpenPayment?.(p.id),
        },
      });
    }

    // 3. Непідтверджені платежі контрагентам (created, не paid)
    const pendingContractor = contractorPayments.filter(
      (p) => p.status === "created" || p.status === "scheduled",
    );
    if (pendingContractor.length >= 2) {
      items.push({
        id: "payments:contractor-pending",
        priority: "attention",
        icon: FileWarning,
        title: `${pendingContractor.length} платежів очікують підтвердження`,
        meta: "Контрагенти",
        badge: { text: String(pendingContractor.length), tone: "count" },
        primaryAction: {
          label: "Переглянути",
          onClick: () => onOpenPending?.(),
        },
      });
    }

    // 4. Заплановані виплати зарплат у наступні 14 днів — normal
    const upcomingSalary = salaryPayments
      .filter((p) => p.status === "scheduled" || p.status === "created")
      .map((p) => ({ p, days: differenceInDays(new Date(p.scheduledDate), today) }))
      .filter(({ days }) => days >= 0 && days <= 14);

    if (upcomingSalary.length >= 1) {
      const total = upcomingSalary.reduce((s, { p }) => s + p.amount, 0);
      items.push({
        id: "payments:salary-scheduled",
        priority: "normal",
        icon: Wallet,
        title: `Зарплати: ${upcomingSalary.length} ${upcomingSalary.length === 1 ? "виплата" : "виплати"}`,
        meta: `Найближчі 14 днів · ${total.toLocaleString("uk-UA")} ₴`,
        primaryAction: {
          label: "Графік",
          onClick: () => onOpenScheduled?.(),
        },
      });
    }

    return mergeAttentionItems(items);
  }, [
    taxPayments,
    salaryPayments,
    contractorPayments,
    onOpenPayment,
    onOpenAllOverdue,
    onOpenPending,
    onOpenScheduled,
  ]);
}
