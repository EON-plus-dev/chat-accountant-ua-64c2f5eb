/**
 * Generate tax payment orders from confirmed Financial Monitoring records.
 * Groups by category and creates PDFO + VZ line items.
 */

import type { FinMonitoringRecord, FinCategory } from "@/config/finMonitoringConfig";
import { finCategoryConfig } from "@/config/finMonitoringConfig";

export type PaymentStatus = "not-created" | "created" | "paid";

export interface GeneratedPayment {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  taxType: "pdfo" | "vz";
  status: PaymentStatus;
  sourceCategory: FinCategory;
  sourceRecordIds: string[];
}

export function generatePaymentOrders(records: FinMonitoringRecord[]): GeneratedPayment[] {
  // Only confirmed income with tax implications where tax > 0
  const taxable = records.filter(
    (r) => r.direction === "income" && r.status === "confirmed" && r.taxImplication
  );

  // Group by category
  const grouped = new Map<FinCategory, { pdfo: number; vz: number; ids: string[] }>();
  for (const r of taxable) {
    const tax = r.taxImplication!;
    const existing = grouped.get(r.category);
    if (existing) {
      existing.pdfo += tax.pdfo;
      existing.vz += tax.vz;
      existing.ids.push(r.id);
    } else {
      grouped.set(r.category, { pdfo: tax.pdfo, vz: tax.vz, ids: [r.id] });
    }
  }

  const payments: GeneratedPayment[] = [];
  let idx = 0;

  // Determine status based on category for demo purposes
  const getDemoStatus = (category: FinCategory): PaymentStatus => {
    // Rental — already paid for demo
    if (category === "rent") return "paid";
    return "not-created";
  };

  // Due dates based on tax type for 2024 declaration year
  const getDueDate = (category: FinCategory, taxType: "pdfo" | "vz"): string => {
    if (category === "rent") return "30.04.2025";
    return "31.07.2025";
  };

  for (const [category, data] of grouped) {
    const label = finCategoryConfig[category].label;
    const status = getDemoStatus(category);

    if (data.pdfo > 0) {
      payments.push({
        id: `pay-gen-${++idx}`,
        name: `ПДФО (${label.toLowerCase()})`,
        amount: data.pdfo,
        dueDate: getDueDate(category, "pdfo"),
        taxType: "pdfo",
        status,
        sourceCategory: category,
        sourceRecordIds: data.ids,
      });
    }

    if (data.vz > 0) {
      payments.push({
        id: `pay-gen-${++idx}`,
        name: `ВЗ (${label.toLowerCase()})`,
        amount: data.vz,
        dueDate: getDueDate(category, "vz"),
        taxType: "vz",
        status,
        sourceCategory: category,
        sourceRecordIds: data.ids,
      });
    }
  }

  // Sort: not-created first, then by amount descending
  return payments.sort((a, b) => {
    const statusOrder: Record<PaymentStatus, number> = { "not-created": 0, created: 1, paid: 2 };
    const sd = statusOrder[a.status] - statusOrder[b.status];
    if (sd !== 0) return sd;
    return b.amount - a.amount;
  });
}
