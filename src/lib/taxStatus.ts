/**
 * Єдина точка істини для розрахунку «прострочений / до сплати» по податкових платежах.
 *
 * Споживачі: useTaxesKPIs, TaxTypeCard, usePaymentsAttentionItems, TaxPaymentsTab.
 * Якщо потрібно змінити правила (наприклад, грейс-період), правимо лише тут.
 */

import { differenceInDays, parseISO } from "date-fns";
import type { TaxPayment, PaymentStatus } from "@/config/paymentsConfig";

const TERMINAL_STATUSES: ReadonlyArray<PaymentStatus> = ["paid", "cancelled"];
const DUE_STATUSES: ReadonlyArray<PaymentStatus> = [
  "scheduled",
  "created",
  "not-created",
  "sent-to-bank",
];

export function daysToDeadline(payment: TaxPayment, today: Date = new Date()): number {
  try {
    return differenceInDays(parseISO(payment.deadline), today);
  } catch {
    return 0;
  }
}

/** Чи є платіж простроченим (status==='overdue' або deadline у минулому і не закритий). */
export function isOverduePayment(payment: TaxPayment, today: Date = new Date()): boolean {
  if (TERMINAL_STATUSES.includes(payment.status)) return false;
  if (payment.status === "overdue") return true;
  return daysToDeadline(payment, today) < 0;
}

/** Чи в стані «до сплати» (відкритий, але не прострочений). */
export function isDuePayment(payment: TaxPayment, today: Date = new Date()): boolean {
  if (TERMINAL_STATUSES.includes(payment.status)) return false;
  if (isOverduePayment(payment, today)) return false;
  return DUE_STATUSES.includes(payment.status);
}

export type EffectiveTaxStatus = "paid" | "cancelled" | "overdue" | "due" | "open";

export function effectiveTaxStatus(
  payment: TaxPayment,
  today: Date = new Date(),
): EffectiveTaxStatus {
  if (payment.status === "paid") return "paid";
  if (payment.status === "cancelled") return "cancelled";
  if (isOverduePayment(payment, today)) return "overdue";
  if (DUE_STATUSES.includes(payment.status)) return "due";
  return "open";
}

/**
 * Сума, фактично сплачена за цим платежем (Σ paidAmount).
 * Часткові оплати враховуються незалежно від статусу.
 */
export function paidAmountOf(payment: TaxPayment): number {
  if (payment.paidAmount && payment.paidAmount > 0) return payment.paidAmount;
  if (payment.status === "paid") return payment.amountToPay;
  return 0;
}
