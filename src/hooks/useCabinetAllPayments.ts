/**
 * useCabinetAllPayments
 * Спільне джерело усіх платежів кабінету (taxes + salaries + contractors + income).
 * Вживається і на UnifiedPaymentsPage, і на сторінці Аналітики кабінету (для cash-flow прогнозу),
 * щоб обидві сторінки рахували однакові вхідні дані.
 */

import { useMemo } from "react";
import {
  getTaxPaymentsForCabinet,
  getSalaryPaymentsForCabinet,
  getContractorPaymentsForCabinet,
} from "@/config/paymentsConfig";
import { demoIncomeRecords } from "@/config/incomeBookConfig";
import { normalizePayments, type UnifiedPayment } from "@/config/unifiedPaymentsConfig";
import type { Cabinet } from "@/types/cabinet";

export function useCabinetAllPayments(cabinet: Cabinet): UnifiedPayment[] {
  const isPassive = cabinet.accessMode === "passive";

  return useMemo(() => {
    const taxPayments = getTaxPaymentsForCabinet(cabinet.id);
    const salaryPayments = getSalaryPaymentsForCabinet(cabinet.id);
    const contractorPayments = getContractorPaymentsForCabinet(cabinet.id);
    const incomeRecords = cabinet.id === "2" ? demoIncomeRecords : [];

    let payments = normalizePayments(taxPayments, salaryPayments, contractorPayments, incomeRecords);
    if (isPassive) {
      payments = payments.filter((p) => p.direction === "in");
    }
    return payments;
  }, [cabinet.id, isPassive]);
}
