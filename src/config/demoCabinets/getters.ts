/**
 * GETTER FUNCTIONS
 * Helper functions to retrieve data for specific demo cabinets
 */

import type { Document } from "@/config/documentFlowConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import type { TaxPayment, ContractorPayment, SalaryPayment } from "@/config/paymentsConfig";
import type { Contractor } from "@/config/settingsConfig";
import type { Employee } from "@/config/employeesConfig";
import type { Report } from "@/config/reportsConfig";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";

import {
  consultingDocuments,
  consultingIncomeRecords,
  consultingContractors,
  consultingEmployees,
  consultingTaxPayments,
  consultingContractorPayments,
  consultingSalaryPayments,
  consultingReports,
} from "./consultingData";

import {
  autorepairDocuments,
  autorepairIncomeRecords,
  autorepairContractors,
  autorepairEmployees,
  autorepairTaxPayments,
  autorepairContractorPayments,
  autorepairSalaryPayments,
  autorepairReports,
} from "./autorepairData";

import {
  itDocuments,
  itIncomeRecords,
  itContractors,
  itTaxPayments,
  itContractorPayments,
  itReports,
} from "./itData";

import {
  dealerDocuments,
  dealerIncomeRecords,
  dealerContractors,
  dealerEmployees,
  dealerTaxPayments,
  dealerContractorPayments,
  dealerSalaryPayments,
  dealerReports,
} from "./dealerData";

import {
  consultingNomenclature,
  autorepairNomenclature,
  itNomenclature,
  dealerNomenclature,
} from "./nomenclature";

import {
  individualDocuments,
  individualIncomeRecords,
  individualContractors,
  individualTaxPayments,
  individualContractorPayments,
  individualReports,
} from "./individualData";

import {
  salonDocuments,
  salonIncomeRecords,
  salonContractors,
  salonEmployees,
  salonTaxPayments,
  salonContractorPayments,
  salonSalaryPayments,
  salonReports,
} from "./salonData";

import {
  tennisDocuments,
  tennisIncomeRecords,
  tennisContractors,
  tennisEmployees,
  tennisTaxPayments,
  tennisContractorPayments,
  tennisSalaryPayments,
  tennisReports,
} from "./tennisData";
import { tennisNomenclature } from "./nomenclature/tennisNomenclature";

import {
  restaurantDocuments,
  restaurantIncomeRecords,
  restaurantContractors,
  restaurantEmployees,
  restaurantTaxPayments,
  restaurantContractorPayments,
  restaurantSalaryPayments,
  restaurantReports,
} from "./restaurantData";
import { restaurantNomenclature } from "./nomenclature/restaurantNomenclature";

import {
  hotelDocuments,
  hotelIncomeRecords,
  hotelContractors,
  hotelEmployees,
  hotelTaxPayments,
  hotelContractorPayments,
  hotelSalaryPayments,
  hotelReports,
} from "./hotelData";
import { hotelNomenclature } from "./nomenclature/hotelNomenclature";

import { individualFinMonitoringRecords } from "./finMonitoringData";
import type { FinMonitoringRecord } from "@/config/finMonitoringConfig";
import { generateTimeline, hasSyntheticProfile } from "./syntheticTimeline";

// ============================================
// DOCUMENT GETTERS
// ============================================

export const getDemoDocumentsForCabinet = (cabinetId: string): Document[] => {
  let curated: Document[] = [];
  switch (cabinetId) {
    case "demo-consulting-3": curated = consultingDocuments; break;
    case "demo-autorepair-2": curated = autorepairDocuments; break;
    case "demo-it-3": curated = itDocuments; break;
    case "demo-dealer-2": curated = dealerDocuments; break;
    case "demo-individual-declarant": curated = individualDocuments; break;
    case "demo-salon-3": curated = salonDocuments; break;
    case "demo-tennis-3": curated = tennisDocuments; break;
    case "demo-restaurant-3": curated = restaurantDocuments; break;
    case "demo-hotel-3": curated = hotelDocuments; break;
  }
  if (!hasSyntheticProfile(cabinetId)) return curated;
  const employees = getDemoEmployeesForCabinet(cabinetId);
  const synth = generateTimeline(cabinetId, employees);
  return [...curated, ...synth.documents].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
};

// ============================================
// INCOME GETTERS
// ============================================

export const getDemoIncomeRecordsForCabinet = (cabinetId: string): IncomeBookRecord[] => {
  let curated: IncomeBookRecord[] = [];
  switch (cabinetId) {
    case "demo-consulting-3": curated = consultingIncomeRecords; break;
    case "demo-autorepair-2": curated = autorepairIncomeRecords; break;
    case "demo-it-3": curated = itIncomeRecords; break;
    case "demo-dealer-2": curated = dealerIncomeRecords; break;
    case "demo-individual-declarant": curated = individualIncomeRecords; break;
    case "demo-salon-3": curated = salonIncomeRecords; break;
    case "demo-tennis-3": curated = tennisIncomeRecords; break;
    case "demo-restaurant-3": curated = restaurantIncomeRecords; break;
    case "demo-hotel-3": curated = hotelIncomeRecords; break;
  }
  if (!hasSyntheticProfile(cabinetId)) return curated;
  const employees = getDemoEmployeesForCabinet(cabinetId);
  const synth = generateTimeline(cabinetId, employees);
  return [...curated, ...synth.income].sort((a, b) => b.date.localeCompare(a.date));
};

// ============================================
// CONTRACTOR GETTERS
// ============================================

export const getDemoContractorsForCabinet = (cabinetId: string): Contractor[] => {
  switch (cabinetId) {
    case "demo-consulting-3":
      return consultingContractors;
    case "demo-autorepair-2":
      return autorepairContractors;
    case "demo-it-3":
      return itContractors;
    case "demo-dealer-2":
      return dealerContractors;
    case "demo-individual-declarant":
      return individualContractors;
    case "demo-salon-3":
      return salonContractors;
    case "demo-tennis-3":
      return tennisContractors;
    case "demo-restaurant-3":
      return restaurantContractors;
    case "demo-hotel-3":
      return hotelContractors;
    default:
      return [];
  }
};

// ============================================
// EMPLOYEE GETTERS
// ============================================

export const getDemoEmployeesForCabinet = (cabinetId: string): Employee[] => {
  switch (cabinetId) {
    case "demo-consulting-3":
      return consultingEmployees;
    case "demo-autorepair-2":
      return autorepairEmployees;
    case "demo-dealer-2":
      return dealerEmployees;
    case "demo-salon-3":
      return salonEmployees;
    case "demo-tennis-3":
      return tennisEmployees;
    case "demo-restaurant-3":
      return restaurantEmployees;
    case "demo-hotel-3":
      return hotelEmployees;
    default:
      return [];
  }
};

// ============================================
// TAX PAYMENT GETTERS
// ============================================

export const getDemoTaxPaymentsForCabinet = (cabinetId: string): TaxPayment[] => {
  let curated: TaxPayment[] = [];
  switch (cabinetId) {
    case "demo-consulting-3": curated = consultingTaxPayments; break;
    case "demo-autorepair-2": curated = autorepairTaxPayments; break;
    case "demo-it-3": curated = itTaxPayments; break;
    case "demo-dealer-2": curated = dealerTaxPayments; break;
    case "demo-individual-declarant": curated = individualTaxPayments; break;
    case "demo-salon-3": curated = salonTaxPayments; break;
    case "demo-tennis-3": curated = tennisTaxPayments; break;
    case "demo-restaurant-3": curated = restaurantTaxPayments; break;
    case "demo-hotel-3": curated = hotelTaxPayments; break;
  }
  if (!hasSyntheticProfile(cabinetId)) return curated;
  const employees = getDemoEmployeesForCabinet(cabinetId);
  const synth = generateTimeline(cabinetId, employees);
  return [...curated, ...synth.taxes].sort((a, b) => b.deadline.localeCompare(a.deadline));
};

// ============================================
// CONTRACTOR PAYMENT GETTERS
// ============================================

export const getDemoContractorPaymentsForCabinet = (cabinetId: string): ContractorPayment[] => {
  let curated: ContractorPayment[] = [];
  switch (cabinetId) {
    case "demo-consulting-3": curated = consultingContractorPayments; break;
    case "demo-autorepair-2": curated = autorepairContractorPayments; break;
    case "demo-it-3": curated = itContractorPayments; break;
    case "demo-dealer-2": curated = dealerContractorPayments; break;
    case "demo-individual-declarant": curated = individualContractorPayments; break;
    case "demo-salon-3": curated = salonContractorPayments; break;
    case "demo-tennis-3": curated = tennisContractorPayments; break;
    case "demo-restaurant-3": curated = restaurantContractorPayments; break;
    case "demo-hotel-3": curated = hotelContractorPayments; break;
  }
  if (!hasSyntheticProfile(cabinetId)) return curated;
  const employees = getDemoEmployeesForCabinet(cabinetId);
  const synth = generateTimeline(cabinetId, employees);
  return [...curated, ...synth.contractorPayments].sort((a, b) => b.date.localeCompare(a.date));
};

// ============================================
// SALARY PAYMENT GETTERS
// ============================================

export const getDemoSalaryPaymentsForCabinet = (cabinetId: string): SalaryPayment[] => {
  let curated: SalaryPayment[] = [];
  switch (cabinetId) {
    case "demo-consulting-3": curated = consultingSalaryPayments; break;
    case "demo-autorepair-2": curated = autorepairSalaryPayments; break;
    case "demo-dealer-2": curated = dealerSalaryPayments; break;
    case "demo-salon-3": curated = salonSalaryPayments; break;
    case "demo-tennis-3": curated = tennisSalaryPayments; break;
    case "demo-restaurant-3": curated = restaurantSalaryPayments; break;
    case "demo-hotel-3": curated = hotelSalaryPayments; break;
  }
  if (!hasSyntheticProfile(cabinetId)) return curated;
  const employees = getDemoEmployeesForCabinet(cabinetId);
  if (employees.length === 0) return curated;
  const synth = generateTimeline(cabinetId, employees);
  return [...curated, ...synth.salaries].sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
};

// ============================================
// REPORT GETTERS
// ============================================

export const getDemoReportsForCabinet = (cabinetId: string): Report[] => {
  switch (cabinetId) {
    case "demo-consulting-3":
      return consultingReports;
    case "demo-autorepair-2":
      return autorepairReports;
    case "demo-it-3":
      return itReports;
    case "demo-dealer-2":
      return dealerReports;
    case "demo-individual-declarant":
      return individualReports;
    case "demo-salon-3":
      return salonReports;
    case "demo-tennis-3":
      return tennisReports;
    case "demo-restaurant-3":
      return restaurantReports;
    case "demo-hotel-3":
      return hotelReports;
    default:
      return [];
  }
};

// ============================================
// NOMENCLATURE V2 GETTERS
// ============================================

export const getDemoNomenclatureV2ForCabinet = (cabinetId: string): NomenclatureItemV2[] => {
  switch (cabinetId) {
    case "demo-consulting-3":
      return consultingNomenclature;
    case "demo-autorepair-2":
      return autorepairNomenclature;
    case "demo-it-3":
      return itNomenclature;
    case "demo-dealer-2":
      return dealerNomenclature;
    case "demo-tennis-3":
      return tennisNomenclature;
    case "demo-restaurant-3":
      return restaurantNomenclature;
    case "demo-hotel-3":
      return hotelNomenclature;
    default:
      return [];
  }
};

// ============================================
// FIN MONITORING GETTERS
// ============================================

export const getDemoFinMonitoringForCabinet = (cabinetId: string): FinMonitoringRecord[] => {
  switch (cabinetId) {
    case "demo-individual-declarant":
      return individualFinMonitoringRecords;
    default:
      return [];
  }
};
