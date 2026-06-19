/**
 * SSOT для платежів, пов'язаних зі звітом.
 *
 * Раніше логіка `getRelatedPayments` жила локально в `RelatedPaymentsSection`
 * і дублювалась у місцях, де треба було обчислити суму до сплати (PayActionBar,
 * PayDialog). Виносимо в `lib`, щоб усі споживачі бачили однаковий список
 * платежів та однаковий `pendingAmount`.
 */
import type { Report } from "@/config/reportsConfig";
import { resolvePaymentStatusForReport } from "@/lib/paymentResolver";

export type RelatedPaymentType = "ep" | "esv" | "vz";
export type RelatedPaymentStatus = "paid" | "pending" | "overdue";

export interface RelatedPayment {
  id: string;
  type: RelatedPaymentType;
  typeLabel: string;
  amount: number;
  deadline: string;
  status: RelatedPaymentStatus;
  paidDate?: string;
}

/**
 * Збирає список пов'язаних платежів зі звіту, використовуючи централізований
 * резолвер статусу. Один звіт може породити кілька платежів (напр. ЄП + ВЗ).
 */
export function getRelatedPayments(report: Report): RelatedPayment[] {
  const payments: RelatedPayment[] = [];
  const resolved = resolvePaymentStatusForReport(report);
  const status = resolved.status;
  const paidDate = resolved.paidDate ?? report.paymentDate;

  // ЄП payment
  if (report.type === "ep" && report.amountToPay) {
    payments.push({
      id: `ep-${report.id}`,
      type: "ep",
      typeLabel: "Єдиний податок",
      amount: report.amountToPay,
      deadline: report.deadline,
      status,
      paidDate: status === "paid" ? paidDate : undefined,
    });
  }

  // ВЗ payment (для ФОП — нараховується разом з ЄП)
  if (report.militaryTax && report.militaryTax.calculatedVZ > 0) {
    payments.push({
      id: `vz-${report.id}`,
      type: "vz",
      typeLabel: "Військовий збір",
      amount: report.militaryTax.calculatedVZ,
      deadline: report.deadline,
      status,
      paidDate: status === "paid" ? paidDate : undefined,
    });
  }

  // ЄСВ payment
  if (report.type === "esv") {
    payments.push({
      id: `esv-${report.id}`,
      type: "esv",
      typeLabel: "ЄСВ",
      amount: report.amountToPay || 1760,
      deadline: report.deadline,
      status,
      paidDate: status === "paid" ? paidDate : undefined,
    });
  }

  return payments;
}

export interface ReportPaymentTotals {
  total: number;
  paid: number;
  pending: number;
  allPaid: boolean;
  hasAnyPayments: boolean;
}

export function getReportPaymentTotals(report: Report): ReportPaymentTotals {
  const payments = getRelatedPayments(report);
  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const paid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pending = total - paid;
  return {
    total,
    paid,
    pending,
    allPaid: payments.length > 0 && payments.every((p) => p.status === "paid"),
    hasAnyPayments: payments.length > 0,
  };
}
