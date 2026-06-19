/**
 * Побудова стрічки операцій по особовому рахунку платника (ОКП/ІКП).
 *
 * Кожна операція має 3 «бакети»: основний платіж / штраф / пеня.
 * Для кожного бакета окремо ведеться наростаюче сальдо (Дт+ / Кт−).
 *
 * Демо-логіка: нарахування — з `TaxPayment.deadline`,
 * сплати — з `Settlement[]`, штрафи — з `Ppr[]` зі статусом != cancelled,
 * пеня — для прострочених платежів станом на сьогодні (через `calcTaxPenalty`).
 */

import type { TaxPayment, TaxType } from "@/config/paymentsConfig";
import type { Ppr, Settlement } from "@/config/taxOkpConfig";
import { calcTaxPenalty } from "@/lib/taxPenaltyCalculator";
import { effectiveTaxStatus, daysToDeadline } from "@/lib/taxStatus";

export type OkpBucket = "main" | "fine" | "penalty";

export type OkpDocumentType =
  | "declaration"
  | "amendment"
  | "ppr"
  | "payment"
  | "refund"
  | "writeoff"
  | "deferral"
  | "court";

export type OkpKind =
  | "accrual"
  | "payment"
  | "fine"
  | "penalty"
  | "correction"
  | "refund"
  | "writeoff"
  | "transfer";

export interface OkpOperation {
  id: string;
  taxType: TaxType;
  date: string; // ISO yyyy-mm-dd
  documentDate: string;
  documentType: OkpDocumentType;
  documentNumber: string;
  documentRef?: string; // FK → payment.id / ppr.id / report.id
  kind: OkpKind;
  amount: number; // знак: + Дт (нарах./штраф/пеня), − Кт (сплата/повернення)
  bucket: OkpBucket;
  budgetPeriod: string; // напр. "2026-Q1" / "2026-03" / "2026"
  runningBalance: number; // сальдо за bucket після цієї операції
}

export const okpKindLabel: Record<OkpKind, string> = {
  accrual: "Нараховано",
  payment: "Сплачено",
  fine: "Штраф",
  penalty: "Пеня",
  correction: "Коригування",
  refund: "Повернено",
  writeoff: "Списано",
  transfer: "Зараховано",
};

export const okpDocumentTypeLabel: Record<OkpDocumentType, string> = {
  declaration: "Декларація",
  amendment: "Уточнюючий розрахунок",
  ppr: "ППР",
  payment: "Платіжна інструкція",
  refund: "Заява про повернення",
  writeoff: "Рішення про списання",
  deferral: "Розстрочення",
  court: "Судове рішення",
};

export const okpBucketLabel: Record<OkpBucket, string> = {
  main: "Основний",
  fine: "Штраф",
  penalty: "Пеня",
};

interface BuildArgs {
  taxType: TaxType;
  year: number;
  payments: TaxPayment[]; // нарахування цього типу за цей рік
  settlements: Settlement[];
  pprs: Ppr[];
  /** Урахувати мораторій на пеню (якщо діяв) */
  moratoriumActive?: boolean;
  asOf?: Date;
}

function periodLabel(p: TaxPayment): string {
  if (p.month) return `${p.year}-${String(p.month).padStart(2, "0")}`;
  if (p.quarter) return `${p.year}-Q${p.quarter}`;
  return `${p.year}`;
}

export function buildOkpOperations(args: BuildArgs): OkpOperation[] {
  const today = args.asOf ?? new Date();
  const raw: Omit<OkpOperation, "runningBalance">[] = [];

  // 1) Нарахування — за дедлайном (як у ДПС: проводиться на дату декларації)
  for (const p of args.payments) {
    if (effectiveTaxStatus(p, today) === "cancelled") continue;
    raw.push({
      id: `accr-${p.id}`,
      taxType: args.taxType,
      date: p.deadline,
      documentDate: p.deadline,
      documentType: p.relatedReportId ? "declaration" : "declaration",
      documentNumber: p.relatedReportName ?? `Нарах. ${p.period}`,
      documentRef: p.relatedReportId ?? p.id,
      kind: "accrual",
      amount: p.amountToPay,
      bucket: "main",
      budgetPeriod: periodLabel(p),
    });
  }

  // 2) Сплати — з settlements
  for (const s of args.settlements) {
    const linked = args.payments.find((p) => p.id === s.paymentId);
    raw.push({
      id: `pay-${s.id}`,
      taxType: args.taxType,
      date: s.creditedAt,
      documentDate: s.paidAt,
      documentType: "payment",
      documentNumber: `№ ${s.paymentInstructionNo}`,
      documentRef: s.paymentId,
      kind: "payment",
      amount: -s.amount,
      bucket: "main",
      budgetPeriod: linked ? periodLabel(linked) : `${args.year}`,
    });
  }

  // 3) ППР — штрафи
  for (const ppr of args.pprs) {
    if (ppr.status === "cancelled") continue;
    raw.push({
      id: `ppr-${ppr.id}`,
      taxType: args.taxType,
      date: ppr.date,
      documentDate: ppr.date,
      documentType: "ppr",
      documentNumber: `ППР ${ppr.number}`,
      documentRef: ppr.id,
      kind: "fine",
      amount: ppr.amount,
      bucket: "fine",
      budgetPeriod: ppr.date.slice(0, 7),
    });
  }

  // 4) Пеня — нарахована станом на сьогодні для прострочених без сплати
  if (!args.moratoriumActive) {
    for (const p of args.payments) {
      const eff = effectiveTaxStatus(p, today);
      if (eff !== "overdue") continue;
      const days = Math.abs(daysToDeadline(p, today));
      const penalty = calcTaxPenalty(p.amountToPay, days);
      if (penalty.penalty > 0) {
        raw.push({
          id: `pen-${p.id}`,
          taxType: args.taxType,
          date: today.toISOString().slice(0, 10),
          documentDate: p.deadline,
          documentType: "writeoff",
          documentNumber: `Пеня (ст. 129 ПКУ) · ${days} дн.`,
          documentRef: p.id,
          kind: "penalty",
          amount: penalty.penalty,
          bucket: "penalty",
          budgetPeriod: periodLabel(p),
        });
      }
    }
  }

  // Сортуємо: дата ASC, нарахування → штраф → платіж (тай-брейкер за kind)
  const kindOrder: Record<OkpKind, number> = {
    accrual: 0,
    fine: 1,
    penalty: 2,
    correction: 3,
    payment: 4,
    refund: 5,
    writeoff: 6,
    transfer: 7,
  };
  const sorted = raw.sort((a, b) => {
    const t = a.date.localeCompare(b.date);
    if (t !== 0) return t;
    return kindOrder[a.kind] - kindOrder[b.kind];
  });

  // Наростаюче сальдо за bucket
  const balances: Record<OkpBucket, number> = { main: 0, fine: 0, penalty: 0 };
  return sorted.map((op) => {
    balances[op.bucket] += op.amount;
    return { ...op, runningBalance: balances[op.bucket] };
  });
}
