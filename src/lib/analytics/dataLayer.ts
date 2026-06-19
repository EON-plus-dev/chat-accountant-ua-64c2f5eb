/**
 * DATA LAYER — агрегація даних кабінету для аналітики
 * Збирає дані через існуючі getters з demoCabinets
 */

import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import { demoIncomeRecords } from "@/config/incomeBookConfig";
import type { Document } from "@/config/documentFlowConfig";
import { fopDemoDocuments } from "@/config/documentFlowConfig";
import type { TaxPayment, ContractorPayment, SalaryPayment } from "@/config/paymentsConfig";
import { demoTaxPayments, demoSalaryPayments, demoContractorPayments } from "@/config/paymentsConfig";
import type { Employee } from "@/config/employeesConfig";
import { demoEmployees } from "@/config/employeesConfig";
import type { Cabinet } from "@/types/cabinet";
import { isDemoCabinet } from "@/config/demoCabinets/types";
import {
  getDemoIncomeRecordsForCabinet,
  getDemoDocumentsForCabinet,
  getDemoTaxPaymentsForCabinet,
  getDemoContractorPaymentsForCabinet,
  getDemoSalaryPaymentsForCabinet,
  getDemoEmployeesForCabinet,
} from "@/config/demoCabinets/getters";

export interface AnalyticsDataSet {
  incomeRecords: IncomeBookRecord[];
  documents: Document[];
  taxPayments: TaxPayment[];
  contractorPayments: ContractorPayment[];
  salaryPayments: SalaryPayment[];
  employees: Employee[];
  cabinet: Cabinet;
  isDemoData: boolean;
}

/**
 * Агрегує всі дані кабінету для аналітики
 * Для demo-кабінетів використовує реальні демо-дані
 * Для legacy-кабінетів (id: "2") підтягує дані з базових масивів
 * Для звичайних кабінетів повертає порожні масиви (fallback на статичний конфіг)
 */
export function aggregateAnalyticsData(cabinet: Cabinet): AnalyticsDataSet {
  const id = cabinet.id;

  // 1. Спеціалізовані demo-кабінети (consulting, autorepair, it, dealer)
  if (isDemoCabinet(id)) {
    return {
      incomeRecords: getDemoIncomeRecordsForCabinet(id),
      documents: getDemoDocumentsForCabinet(id),
      taxPayments: getDemoTaxPaymentsForCabinet(id),
      contractorPayments: getDemoContractorPaymentsForCabinet(id),
      salaryPayments: getDemoSalaryPaymentsForCabinet(id),
      employees: getDemoEmployeesForCabinet(id),
      cabinet,
      isDemoData: true,
    };
  }

  // 2. Legacy fallback — фільтруємо базові демо-масиви за cabinetId
  // IncomeBookRecord не має cabinetId — legacy записи належать кабінету "2"
  const legacyIncome = id === "2" ? demoIncomeRecords : [];
  const legacyDocs = id === "2" ? fopDemoDocuments : fopDemoDocuments.filter(d => d.cabinetId === id);
  const legacyTax = demoTaxPayments.filter(t => t.cabinetId === id);
  const legacyContractor = demoContractorPayments.filter(c => c.cabinetId === id);
  const legacySalary = demoSalaryPayments.filter(s => s.cabinetId === id);
  const legacyEmployees = demoEmployees.filter(e => e.cabinetId === id);

  const hasLegacyData =
    legacyIncome.length > 0 ||
    legacyTax.length > 0 ||
    legacySalary.length > 0 ||
    legacyEmployees.length > 0;

  if (hasLegacyData) {
    return {
      incomeRecords: legacyIncome,
      documents: legacyDocs,
      taxPayments: legacyTax,
      contractorPayments: legacyContractor,
      salaryPayments: legacySalary,
      employees: legacyEmployees,
      cabinet,
      isDemoData: true,
    };
  }

  // 3. Звичайний кабінет — порожні масиви
  return {
    incomeRecords: [],
    documents: [],
    taxPayments: [],
    contractorPayments: [],
    salaryPayments: [],
    employees: [],
    cabinet,
    isDemoData: false,
  };
}
