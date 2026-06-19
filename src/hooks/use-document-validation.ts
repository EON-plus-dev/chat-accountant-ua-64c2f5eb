/**
 * useDocumentValidation Hook
 * Provides legal and business validation for documents being created
 */

import { useMemo, useCallback } from "react";
import type { DocumentType } from "@/config/documentFlowConfig";
import type { Cabinet } from "@/types/cabinet";
import type { Contractor } from "@/config/settingsConfig";
import { FOP_INCOME_LIMITS } from "@/config/taxConstantsConfig";

export type ValidationSeverity = "critical" | "warning" | "info";

export interface ValidationAction {
  label: string;
  icon?: string; // Lucide icon name
  onClick?: () => void;
  href?: string; // For external links
}

export interface ValidationWarning {
  id: string;
  type: ValidationSeverity;
  title: string;
  message: string;
  field?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
  actions?: ValidationAction[];
}

export interface UseDocumentValidationProps {
  documentType: DocumentType;
  contractor: Contractor | null;
  cabinet: Cabinet;
  amount?: number;
  yearlyIncome?: number;
  // For duplicate number detection
  documentNumber?: string;
  existingDocuments?: Array<{ number: string; id?: string }>;
}

export interface UseDocumentValidationReturn {
  warnings: ValidationWarning[];
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  hasCritical: boolean;
  hasWarnings: boolean;
  validateField: (fieldKey: string, value: unknown) => ValidationWarning | null;
}

export function useDocumentValidation({
  documentType,
  contractor,
  cabinet,
  amount = 0,
  yearlyIncome = 0,
  documentNumber = "",
  existingDocuments = [],
}: UseDocumentValidationProps): UseDocumentValidationReturn {
  
  const warnings = useMemo(() => {
    const result: ValidationWarning[] = [];
    
    // 1. Contractor status check (mock EDR verification)
    if (contractor) {
      // Check if contractor is blocked
      if (contractor.status === "blocked" || contractor.status === "inactive") {
        const edrCode = contractor.code && contractor.code !== "—" ? contractor.code : "";
        result.push({
          id: "contractor-suspended",
          type: "critical",
          title: "Діяльність контрагента призупинено",
          message: `${contractor.name} має статус "призупинено" в ЄДР`,
          field: "contractor",
          actions: [
            ...(edrCode ? [{
              label: "Перевірити в ЄДР",
              icon: "ExternalLink",
              href: `https://usr.minjust.gov.ua/ua/freesearch?code=${edrCode}`,
            }] : []),
            {
              label: "Змінити контрагента",
              icon: "UserRoundX",
            },
          ],
        });
      }
      
      // Check if contractor has valid code
      if (!contractor.code || contractor.code === "—") {
        result.push({
          id: "contractor-no-code",
          type: "warning",
          title: "Код контрагента відсутній",
          message: "Документ може бути недійсним без коду ЄДРПОУ/ІПН",
          field: "contractor",
        });
      }
    }
    
    // 2. VAT mismatch warning
    // TOV is typically a VAT payer
    const isCabinetVatPayer = cabinet.type === "tov";
    // Check contractor's taxStatus for VAT
    const isContractorVatPayer = contractor?.taxStatus?.includes("ПДВ") ?? false;
    
    if (isCabinetVatPayer && contractor && !isContractorVatPayer) {
      result.push({
        id: "vat-mismatch-buyer",
        type: "info",
        title: "Контрагент не є платником ПДВ",
        message: "Податковий кредит з цієї операції неможливий",
        field: "contractor",
      });
    }
    
    if (!isCabinetVatPayer && contractor && isContractorVatPayer) {
      result.push({
        id: "vat-mismatch-supplier",
        type: "info",
        title: "Ви не є платником ПДВ",
        message: "Контрагент може очікувати документи з ПДВ",
        field: "contractor",
      });
    }
    
    // 3. FOP income limit check
    if (cabinet.type === "fop" || cabinet.type === "fop-group") {
      const taxGroup = cabinet.fopGroup || 3;
      const limit = FOP_INCOME_LIMITS[taxGroup as 1 | 2 | 3];
      const projectedTotal = yearlyIncome + amount;
      const usagePercent = (projectedTotal / limit) * 100;
      
      if (usagePercent > 100) {
        result.push({
          id: "fop-limit-exceeded",
          type: "critical",
          title: "Перевищення ліміту доходу ФОП",
          message: `Сума ${amount.toLocaleString("uk-UA")} ₴ перевищить річний ліміт ${(limit / 1000000).toFixed(1)} млн грн`,
          field: "amount",
        });
      } else if (usagePercent > 80) {
        result.push({
          id: "fop-limit-warning",
          type: "warning",
          title: `Використано ${usagePercent.toFixed(0)}% ліміту доходу`,
          message: `Залишок ліміту: ${((limit - projectedTotal) / 1000).toFixed(0)} тис. грн`,
          field: "amount",
        });
      }
    }
    
    // 4. Document type specific warnings
    if (documentType === "tax-invoice" && !isCabinetVatPayer) {
      result.push({
        id: "tax-invoice-no-vat",
        type: "critical",
        title: "Неможливо створити податкову накладну",
        message: "Ви не є платником ПДВ",
        field: "type",
      });
    }
    
    // 5. Amount validation
    if (amount < 0) {
      result.push({
        id: "negative-amount",
        type: "critical",
        title: "Некоректна сума",
        message: "Сума документа не може бути від'ємною",
        field: "amount",
      });
    }
    
    if (documentType === "tax-invoice" && amount > 0 && amount < 100) {
      result.push({
        id: "small-tax-invoice",
        type: "info",
        title: "Мала сума для ПН",
        message: "Для сум до 100 грн реєстрація ПН не обов'язкова",
        field: "amount",
      });
    }
    
    // 6. Duplicate document number check
    if (documentNumber && existingDocuments.length > 0) {
      const normalizedNumber = documentNumber.trim().toLowerCase();
      const duplicate = existingDocuments.find(
        doc => doc.number.trim().toLowerCase() === normalizedNumber
      );
      
      if (duplicate) {
        result.push({
          id: "duplicate-document-number",
          type: "warning",
          title: "Номер документа вже існує",
          message: `Документ з номером "${documentNumber}" вже є у цьому кабінеті`,
          field: "documentNumber",
          actions: [
            {
              label: "Змінити номер",
              icon: "Edit",
            },
          ],
        });
      }
    }
    
    return result;
  }, [documentType, contractor, cabinet, amount, yearlyIncome, documentNumber, existingDocuments]);
  
  const criticalCount = useMemo(() => 
    warnings.filter(w => w.type === "critical").length, 
    [warnings]
  );
  
  const warningCount = useMemo(() => 
    warnings.filter(w => w.type === "warning").length, 
    [warnings]
  );
  
  const infoCount = useMemo(() => 
    warnings.filter(w => w.type === "info").length, 
    [warnings]
  );
  
  const validateField = useCallback((fieldKey: string, value: unknown): ValidationWarning | null => {
    // Field-specific validation
    switch (fieldKey) {
      case "documentNumber":
        if (!value || String(value).length < 3) {
          return {
            id: "invalid-doc-number",
            type: "warning",
            title: "Короткий номер документа",
            message: "Номер документа занадто короткий",
            field: fieldKey,
          };
        }
        break;
      
      case "dueDate":
        if (value) {
          const dueDate = new Date(String(value));
          const today = new Date();
          if (dueDate < today) {
            return {
              id: "past-due-date",
              type: "warning",
              title: "Дата в минулому",
              message: "Термін оплати вже минув",
              field: fieldKey,
            };
          }
        }
        break;
      
      case "buyerCode":
      case "supplierCode":
        if (value && String(value).length !== 8 && String(value).length !== 10) {
          return {
            id: "invalid-code-length",
            type: "warning",
            title: "Некоректний код",
            message: "ЄДРПОУ має бути 8 цифр, ІПН — 10 цифр",
            field: fieldKey,
          };
        }
        break;
    }
    
    return null;
  }, []);
  
  return {
    warnings,
    criticalCount,
    warningCount,
    infoCount,
    hasCritical: criticalCount > 0,
    hasWarnings: warningCount > 0,
    validateField,
  };
}
