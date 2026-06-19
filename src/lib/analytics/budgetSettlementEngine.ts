/**
 * budgetSettlementEngine — Розрахунки з бюджетом
 *
 * Агрегує податкові платежі (TaxPayment) у показники:
 *  • accrued — нараховано (сума amountToPay усіх платежів періоду)
 *  • paid    — сплачено (сума paidAmount або amountToPay для статусу "paid")
 *  • debt    — поточний борг (нараховано - сплачено по простроченим/відкритим)
 *  • overdueAmount — сума прострочених (deadline < today, не paid)
 *  • upcomingAmount — сума запланованих/не сплачених у межах періоду
 *  • penalty — пеня/штрафи (taxType === "other" з category "penalty"|"fine")
 *
 * Розбивка по типу податку (ВЗ, ЄСВ, ЄП, ПДФО) + накопичувальний ряд для графіка.
 */

import type { TaxPayment, TaxType } from "@/config/paymentsConfig";
import type { PeriodType } from "./periodFilter";

function getRange(period: PeriodType, ref: Date, custom?: { from: Date; to: Date }): { from: Date; to: Date } {
  if (period === "custom" && custom) return custom;
  const y = ref.getFullYear();
  const m = ref.getMonth();
  switch (period) {
    case "month": return { from: new Date(y, m, 1), to: new Date(y, m + 1, 0, 23, 59, 59) };
    case "quarter": {
      const q = Math.floor(m / 3) * 3;
      return { from: new Date(y, q, 1), to: new Date(y, q + 3, 0, 23, 59, 59) };
    }
    case "year": return { from: new Date(y, 0, 1), to: new Date(y, 11, 31, 23, 59, 59) };
    default: return { from: new Date(y, m, 1), to: new Date(y, m + 1, 0, 23, 59, 59) };
  }
}

export interface BudgetSettlementBreakdown {
  taxType: TaxType;
  label: string;
  accrued: number;
  paid: number;
  debt: number;
  overdueAmount: number;
  count: number;
}

export interface BudgetSettlementCumulativePoint {
  date: string; // ISO yyyy-mm-dd
  accruedCum: number;
  paidCum: number;
}

export interface BudgetSettlementUnpaidItem {
  id: string;
  taxType: TaxType;
  label: string;        // коротка людська назва (TAX_TYPE_LABEL)
  period: string;       // період звітування
  amount: number;
  deadline: string;     // ISO
  daysToDeadline: number; // <0 => прострочено
  isOverdue: boolean;
}

export interface BudgetSettlementSummary {
  period: PeriodType;
  accrued: number;
  paid: number;
  debt: number;
  overdueAmount: number;
  upcomingAmount: number;
  penalty: number;
  paymentRatio: number; // 0..1 (paid / accrued)
  byType: BudgetSettlementBreakdown[];
  cumulative: BudgetSettlementCumulativePoint[];
  /** Несплачені (прострочені + до сплати) в межах періоду, відсортовано: спочатку
   *  прострочені (за днями), потім найближчі дедлайни. */
  unpaid: BudgetSettlementUnpaidItem[];
  nextPayment?: {
    label: string;
    amount: number;
    deadline: string; // ISO
  };
  hasDebt: boolean;
}

const TAX_TYPE_LABEL: Record<TaxType, string> = {
  ep: "ЄП",
  esv: "ЄСВ (за себе)",
  pdfo: "ПДФО",
  military: "ВЗ із ЗП",
  "military-fop": "ВЗ ФОП",
  "esv-employer": "ЄСВ роботодавця",
  other: "Інше",
};

function isPaid(p: TaxPayment) {
  return p.status === "paid";
}
function isOverdue(p: TaxPayment, now: Date) {
  if (isPaid(p)) return false;
  if (p.status === "cancelled") return false;
  return new Date(p.deadline).getTime() < now.getTime();
}

export function computeBudgetSettlement(
  taxPayments: TaxPayment[],
  period: PeriodType,
  customRange?: { from: Date; to: Date },
): BudgetSettlementSummary {
  const now = new Date();
  const range = getRange(period, now, customRange);

  // Фільтр: податки з deadline у періоді
  const inPeriod = taxPayments.filter((p) => {
    const d = new Date(p.deadline);
    return d >= range.from && d <= range.to;
  });

  let accrued = 0;
  let paid = 0;
  let overdueAmount = 0;
  let upcomingAmount = 0;
  let penalty = 0;

  const typeMap = new Map<TaxType, BudgetSettlementBreakdown>();

  for (const p of inPeriod) {
    if (p.status === "cancelled") continue;
    accrued += p.amountToPay;

    if (isPaid(p)) {
      paid += p.paidAmount ?? p.amountToPay;
    } else if (isOverdue(p, now)) {
      overdueAmount += p.amountToPay;
    } else {
      upcomingAmount += p.amountToPay;
    }

    // Penalty/fine helper (за наявності опційного category)
    const cat = (p as TaxPayment & { category?: string }).category;
    if (cat === "penalty" || cat === "fine") {
      penalty += p.amountToPay;
    }

    const cur = typeMap.get(p.taxType) ?? {
      taxType: p.taxType,
      label: TAX_TYPE_LABEL[p.taxType] ?? p.taxTypeLabel ?? p.taxType,
      accrued: 0,
      paid: 0,
      debt: 0,
      overdueAmount: 0,
      count: 0,
    };
    cur.accrued += p.amountToPay;
    if (isPaid(p)) cur.paid += p.paidAmount ?? p.amountToPay;
    if (isOverdue(p, now)) cur.overdueAmount += p.amountToPay;
    cur.count += 1;
    typeMap.set(p.taxType, cur);
  }

  for (const v of typeMap.values()) {
    v.debt = Math.max(0, v.accrued - v.paid);
  }

  const debt = Math.max(0, accrued - paid);
  const paymentRatio = accrued > 0 ? paid / accrued : 1;

  // Накопичувальний ряд (по даті deadline для accrued, paidDate для paid)
  const sorted = [...inPeriod].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  );
  const cumulative: BudgetSettlementCumulativePoint[] = [];
  let aCum = 0;
  let pCum = 0;
  for (const p of sorted) {
    if (p.status === "cancelled") continue;
    aCum += p.amountToPay;
    if (isPaid(p)) pCum += p.paidAmount ?? p.amountToPay;
    const date = (isPaid(p) && p.paidDate ? p.paidDate : p.deadline).slice(0, 10);
    cumulative.push({ date, accruedCum: aCum, paidCum: pCum });
  }

  // Несплачені позиції (для UI-списку в Огляді) + наступний платіж
  const MS_DAY = 86_400_000;
  const unpaid: BudgetSettlementUnpaidItem[] = inPeriod
    .filter((p) => !isPaid(p) && p.status !== "cancelled")
    .map((p) => {
      const deadlineMs = new Date(p.deadline).getTime();
      const daysToDeadline = Math.round((deadlineMs - now.getTime()) / MS_DAY);
      return {
        id: p.id,
        taxType: p.taxType,
        label: TAX_TYPE_LABEL[p.taxType] ?? p.taxTypeLabel ?? p.taxType,
        period: p.period,
        amount: p.amountToPay,
        deadline: p.deadline,
        daysToDeadline,
        isOverdue: daysToDeadline < 0,
      };
    })
    .sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      // Серед прострочених — найдавніші вгорі; серед майбутніх — найближчі вгорі
      return a.daysToDeadline - b.daysToDeadline;
    });

  const upcoming = inPeriod
    .filter((p) => !isPaid(p) && p.status !== "cancelled")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

  return {
    period,
    accrued,
    paid,
    debt,
    overdueAmount,
    upcomingAmount,
    penalty,
    paymentRatio,
    byType: Array.from(typeMap.values()).sort((a, b) => b.accrued - a.accrued),
    cumulative,
    unpaid,
    nextPayment: upcoming
      ? {
          label: `${TAX_TYPE_LABEL[upcoming.taxType] ?? upcoming.taxType} · ${upcoming.period}`,
          amount: upcoming.amountToPay,
          deadline: upcoming.deadline,
        }
      : undefined,
    hasDebt: debt > 0 || overdueAmount > 0,
  };
}
