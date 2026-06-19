/**
 * Auto-categorization utility
 * Uses findMatchingRule to automatically assign categories to income book records.
 * Also detects internal transfers between cabinet's own connected IBANs.
 */

import { findMatchingRule } from "@/config/bankCategorizationRulesConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";

export interface CategorizationResult {
  records: IncomeBookRecord[];
  categorizedCount: number;
  autoConfirmedCount: number;
  totalUncategorized: number;
  internalTransferCount: number;
}

/**
 * Demo: known IBANs of cabinets — used to detect internal transfers between
 * the user's own accounts. In a real app this comes from connected sources.
 * Keys are cabinet ids; values are sets of IBANs that belong to that cabinet.
 */
const CABINET_OWN_IBANS: Record<string, string[]> = {
  "demo-it-3": [
    "UA213223130000026007233566001",
    "UA713052990000026009235671234",
  ],
  "demo-autorepair-2": [
    "UA873052990000026009235671888",
    "UA523052990000026009235678901",
  ],
  "demo-dealer-2": [
    "UA823052990000026009235679012",
    "UA423052990000026009235671523",
  ],
};

const isInternalTransfer = (
  record: IncomeBookRecord,
  cabinetId?: string,
): boolean => {
  if (!cabinetId || !record.contractorIban) return false;
  const ownIbans = CABINET_OWN_IBANS[cabinetId];
  if (!ownIbans || ownIbans.length === 0) return false;
  return ownIbans.includes(record.contractorIban);
};

/**
 * Auto-categorize income book records using bank categorization rules.
 * Also auto-marks transfers between cabinet-owned IBANs as `not-income`.
 */
export function autoCategorizeRecords(
  records: IncomeBookRecord[],
  cabinetId?: string
): CategorizationResult {
  let categorizedCount = 0;
  let autoConfirmedCount = 0;
  let internalTransferCount = 0;

  const updatedRecords = records.map((record) => {
    // Step 1: detect internal transfer (highest priority, overrides categorization).
    if (
      record.status !== "not-income" &&
      isInternalTransfer(record, cabinetId)
    ) {
      internalTransferCount++;
      return {
        ...record,
        status: "not-income" as const,
        inIncomeBook: 0,
        categorySource: "auto-internal-transfer" as const,
        categoryConfirmed: true,
        aiNote:
          record.aiNote ||
          "Авто-розпізнано: переказ між власними рахунками — не є доходом.",
      };
    }

    // Skip already categorized records
    if (record.categoryCode) return record;

    // Determine transaction type based on status
    const transactionType: "income" | "expense" =
      record.status === "return" || record.status === "not-income"
        ? "expense"
        : "income";

    const matchedRule = findMatchingRule(
      record.description,
      record.amount,
      transactionType,
      cabinetId
    );

    if (matchedRule) {
      categorizedCount++;
      if (matchedRule.action.autoConfirm) autoConfirmedCount++;

      return {
        ...record,
        categoryCode: matchedRule.action.categoryCode,
        matchedRuleId: matchedRule.id,
        categorySource: "rule" as const,
        categoryConfirmed: matchedRule.action.autoConfirm,
      };
    }

    return record;
  });

  const totalUncategorized = updatedRecords.filter(
    (r) => !r.categoryCode
  ).length;

  return {
    records: updatedRecords,
    categorizedCount,
    autoConfirmedCount,
    totalUncategorized,
    internalTransferCount,
  };
}

/**
 * Get categorization statistics for a set of records
 */
export function getCategorizationStats(records: IncomeBookRecord[]) {
  const total = records.length;
  const categorized = records.filter((r) => r.categoryCode).length;
  const confirmed = records.filter((r) => r.categoryConfirmed).length;
  const unconfirmed = categorized - confirmed;
  const uncategorized = total - categorized;
  const percent = total > 0 ? Math.round((categorized / total) * 100) : 0;

  return { total, categorized, confirmed, unconfirmed, uncategorized, percent };
}

/**
 * Count records that would match the given rule's conditions retroactively.
 */
export function countMatchingRecords(
  records: IncomeBookRecord[],
  conditions: {
    descriptionContains?: string[];
    amountMin?: number;
    amountMax?: number;
    transactionType?: "income" | "expense";
  },
): IncomeBookRecord[] {
  return records.filter((r) => {
    if (r.categoryCode) return false; // skip already categorized
    if (conditions.transactionType) {
      const recType: "income" | "expense" =
        r.status === "return" || r.status === "not-income" ? "expense" : "income";
      if (recType !== conditions.transactionType) return false;
    }
    if (conditions.amountMin !== undefined && r.amount < conditions.amountMin) return false;
    if (conditions.amountMax !== undefined && r.amount > conditions.amountMax) return false;
    if (conditions.descriptionContains && conditions.descriptionContains.length > 0) {
      const desc = r.description.toUpperCase();
      const matches = conditions.descriptionContains.some((kw) =>
        desc.includes(kw.toUpperCase()),
      );
      if (!matches) return false;
    }
    return true;
  });
}
