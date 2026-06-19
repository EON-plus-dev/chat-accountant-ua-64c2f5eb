import { differenceInCalendarDays } from "date-fns";
import type { Report } from "@/config/reportsConfig";
import { resolvePaymentStatusForReport } from "@/lib/paymentResolver";

export type DisciplineKind = "early" | "on-time" | "late";

export interface PaymentDiscipline {
  kind: DisciplineKind;
  daysDiff: number;
}

/**
 * Класифікує дату сплати відносно дедлайну:
 * - diff < -3  → early
 * - -3 ≤ diff ≤ 0 → on-time
 * - diff > 0   → late
 */
export function getPaymentDiscipline(
  paidDate: string | Date,
  deadline: string | Date,
): PaymentDiscipline {
  const diff = differenceInCalendarDays(new Date(paidDate), new Date(deadline));
  if (diff < -3) return { kind: "early", daysDiff: diff };
  if (diff <= 0) return { kind: "on-time", daysDiff: diff };
  return { kind: "late", daysDiff: diff };
}

export interface CabinetPaymentDisciplineStats {
  totalPaid: number;
  earlyCount: number;
  onTimeCount: number;
  lateCount: number;
  /** Відсоток вчасних/дострокових сплат (0-100). 0 якщо totalPaid === 0. */
  onTimeRate: number;
}

/**
 * Агрегує статистику платіжної дисципліни по всіх звітах кабінету за рік.
 * Враховує лише звіти з резолвленим статусом "paid" та відомою датою сплати.
 */
export function getCabinetPaymentDisciplineStats(
  reports: Report[],
  year: number,
): CabinetPaymentDisciplineStats {
  let earlyCount = 0;
  let onTimeCount = 0;
  let lateCount = 0;

  for (const report of reports) {
    if (report.year !== year) continue;
    const resolved = resolvePaymentStatusForReport(report);
    if (resolved.status !== "paid") continue;
    const paidDate = resolved.paidDate ?? report.paymentDate;
    if (!paidDate) continue;

    const { kind } = getPaymentDiscipline(paidDate, report.deadline);
    if (kind === "early") earlyCount++;
    else if (kind === "on-time") onTimeCount++;
    else lateCount++;
  }

  const totalPaid = earlyCount + onTimeCount + lateCount;
  const onTimeRate = totalPaid > 0
    ? Math.round(((earlyCount + onTimeCount) / totalPaid) * 100)
    : 0;

  return { totalPaid, earlyCount, onTimeCount, lateCount, onTimeRate };
}
