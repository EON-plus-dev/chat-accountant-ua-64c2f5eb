import type { Report } from "@/config/reportsConfig";
import type { TaxPayment } from "@/config/paymentsConfig";
import { demoTaxPayments, getRuntimeExtraTaxPayments } from "@/config/paymentsConfig";
import { getDemoTaxPaymentsForCabinet } from "@/config/demoCabinets/getters";

export type ResolvedPaymentStatus = "paid" | "pending" | "overdue";

export interface ResolvedPayment {
  status: ResolvedPaymentStatus;
  paidDate?: string;
  source: "payments-store" | "report-field" | "computed-overdue" | "default";
}

/**
 * Резолвить статус сплати податку за звітом.
 * Пріоритет:
 * 1. Записи в сторі платежів (TaxPayment) із relatedReportId === report.id
 *    зі статусом "paid" → paid
 * 2. report.paymentStatus (явно встановлений у мок-даних або через handleMarkPaid)
 * 3. Якщо deadline < today і статус не submitted/accepted → overdue
 * 4. pending за замовчуванням
 */
export function resolvePaymentStatusForReport(
  report: Report,
  paymentsStore?: TaxPayment[]
): ResolvedPayment {
  // 1. Шукаємо реальні платежі (включно з runtime-доданими через handleMarkPaid)
  const runtimeExtras = report.cabinetId
    ? getRuntimeExtraTaxPayments(report.cabinetId)
    : [];
  const store =
    paymentsStore ??
    (report.cabinetId
      ? [
          ...demoTaxPayments,
          ...getDemoTaxPaymentsForCabinet(report.cabinetId),
          ...runtimeExtras,
        ]
      : [...demoTaxPayments, ...runtimeExtras]);

  const linked = store.filter((p) => p.relatedReportId === report.id);
  const paid = linked.find((p) => p.status === "paid");
  if (paid) {
    return { status: "paid", paidDate: paid.paidDate, source: "payments-store" };
  }
  const pendingStatuses: Array<TaxPayment["status"]> = [
    "created",
    "sent-to-bank",
    "scheduled",
    "not-created",
  ];
  const pending = linked.find((p) => pendingStatuses.includes(p.status));
  if (pending) {
    return { status: "pending", source: "payments-store" };
  }
  const overdue = linked.find((p) => p.status === "overdue");
  if (overdue) {
    return { status: "overdue", source: "payments-store" };
  }

  // 2. Поле звіту
  if (report.paymentStatus === "paid") {
    return { status: "paid", paidDate: report.paymentDate, source: "report-field" };
  }
  if (report.paymentStatus === "overdue") {
    return { status: "overdue", source: "report-field" };
  }
  if (report.paymentStatus === "pending") {
    return { status: "pending", source: "report-field" };
  }

  // 3. Computed overdue
  const today = new Date();
  if (new Date(report.deadline) < today) {
    return { status: "overdue", source: "computed-overdue" };
  }

  // 4. Default
  return { status: "pending", source: "default" };
}
