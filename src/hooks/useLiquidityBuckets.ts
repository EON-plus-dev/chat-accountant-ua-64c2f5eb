/**
 * useLiquidityBuckets — поділ Available cash на бакети-резерви.
 *
 * UA-адаптація: Operating / Tax reserve / Payroll reserve / Savings.
 * Резерви рахуються з реальних scheduled-out з ledger'у:
 *   • Tax = сума всіх scheduled tax-платежів у горизонті 30 днів
 *   • Payroll = сума всіх scheduled salary-платежів у горизонті 30 днів
 *   • Savings = умовно 10% Available (Brex sweep-pattern)
 *   • Operating = решта
 */

import { useMemo } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Cabinet } from "@/types/cabinet";
import { useCabinetAllPayments } from "./useCabinetAllPayments";
import { inferCurrency, toUah } from "@/lib/paymentsCurrency";
import type { CabinetCashPosition } from "./useCabinetCashPosition";
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";

const SCHEDULED_STATUSES = new Set(["scheduled", "created", "sent-to-bank", "overdue"]);

/**
 * Фільтрує платежі під конкретний бакет ліквідності.
 * Той самий критерій, що й у розрахунку `useLiquidityBuckets`.
 */
export function filterBucketPayments(
  payments: UnifiedPayment[],
  bucketId: "tax" | "payroll",
): UnifiedPayment[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taxTypes = new Set(["tax", "tax-fop", "tax-salary"]);
  return payments
    .filter((p) => {
      if (p.direction !== "out") return false;
      if (!SCHEDULED_STATUSES.has(String(p.status))) return false;
      let d: Date;
      try {
        d = parseISO(p.date);
      } catch {
        return false;
      }
      const age = differenceInCalendarDays(d, today);
      if (age < 0 || age > 30) return false;
      if (bucketId === "tax") return taxTypes.has(p.paymentType);
      return p.paymentType === "salary";
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export type BucketId = "operating" | "tax" | "payroll" | "savings";

export interface LiquidityBucket {
  id: BucketId;
  label: string;
  amount: number;
  /** Необхідно зарезервувати для покриття зобов'язань у горизонті 30д. */
  needed?: number;
  /** Чи покриває амбер-фічу. */
  isUnderfunded?: boolean;
}

export interface LiquidityBuckets {
  available: number;
  buckets: LiquidityBucket[];
  /** Скільки overall не вистачає (tax + payroll). */
  shortfall: number;
}

const SCHEDULED = SCHEDULED_STATUSES;
const SAVINGS_PERCENT = 0.1;

export function useLiquidityBuckets(
  cabinet: Cabinet,
  position: CabinetCashPosition,
): LiquidityBuckets {
  const payments = useCabinetAllPayments(cabinet);

  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let taxNeeded = 0;
    let payrollNeeded = 0;

    for (const p of payments) {
      if (p.direction !== "out") continue;
      if (!SCHEDULED.has(String(p.status))) continue;
      let d: Date;
      try {
        d = parseISO(p.date);
      } catch {
        continue;
      }
      const ageDays = differenceInCalendarDays(d, today);
      if (ageDays < 0 || ageDays > 30) continue;
      const uah = toUah(p.amount, inferCurrency(p));
      if (
        p.paymentType === "tax" ||
        p.paymentType === "tax-fop" ||
        p.paymentType === "tax-salary"
      ) {
        taxNeeded += uah;
      } else if (p.paymentType === "salary") {
        payrollNeeded += uah;
      }
    }

    const available = position.availableUah;
    const savings = Math.round(available * SAVINGS_PERCENT);

    const taxReserved = Math.min(available, Math.round(taxNeeded));
    const remainingAfterTax = Math.max(0, available - taxReserved);
    const payrollReserved = Math.min(remainingAfterTax, Math.round(payrollNeeded));
    const remainingAfterPayroll = Math.max(0, remainingAfterTax - payrollReserved);
    const savingsReserved = Math.min(remainingAfterPayroll, savings);
    const operating = Math.max(0, remainingAfterPayroll - savingsReserved);

    const shortfall =
      Math.max(0, Math.round(taxNeeded) - taxReserved) +
      Math.max(0, Math.round(payrollNeeded) - payrollReserved);

    const buckets: LiquidityBucket[] = [
      {
        id: "tax",
        label: "Під податки",
        amount: taxReserved,
        needed: Math.round(taxNeeded),
        isUnderfunded: taxReserved < taxNeeded,
      },
      {
        id: "payroll",
        label: "Під зарплату",
        amount: payrollReserved,
        needed: Math.round(payrollNeeded),
        isUnderfunded: payrollReserved < payrollNeeded,
      },
      { id: "savings", label: "Заощадження (10%)", amount: savingsReserved },
      { id: "operating", label: "Оперативно", amount: operating },
    ];

    return { available, buckets, shortfall };
  }, [payments, position.availableUah]);
}
