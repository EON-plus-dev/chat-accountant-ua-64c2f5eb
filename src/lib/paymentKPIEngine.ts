/**
 * Contextual KPI Engine for Unified Payments
 * Calculates adaptive KPIs based on current filters
 */

import type { UnifiedPayment, PaymentDirection, UnifiedPaymentType } from "@/config/unifiedPaymentsConfig";

export interface PaymentFilters {
  direction?: PaymentDirection | "all";
  type?: UnifiedPaymentType | "all";
  status?: string;
  period?: string;
  searchQuery?: string;
}

export interface ContextualKPI {
  id: string;
  label: string;
  value: string | number;
  subLabel?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color: "default" | "success" | "warning" | "error" | "info";
  onClick?: () => void;
  filterToApply?: Partial<PaymentFilters>;
}

/**
 * Format currency in compact form
 */
function formatCompactAmount(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toLocaleString("uk-UA");
}

/**
 * Calculate contextual KPIs based on payments and active filters
 */
export function calculateContextualKPIs(
  payments: UnifiedPayment[],
  filters: PaymentFilters
): ContextualKPI[] {
  const kpis: ContextualKPI[] = [];
  
  // Calculate base metrics
  const incoming = payments.filter(p => p.direction === "in");
  const outgoing = payments.filter(p => p.direction === "out");
  
  const totalIn = incoming.reduce((sum, p) => sum + p.amount, 0);
  const totalOut = outgoing.reduce((sum, p) => sum + p.amount, 0);
  const netCashFlow = totalIn - totalOut;
  
  const overduePayments = payments.filter(p => p.status === "overdue");
  const scheduledPayments = payments.filter(p => p.status === "scheduled" || p.status === "created");
  const paidPayments = payments.filter(p => p.status === "paid" || p.status === "income");
  const needsAttention = payments.filter(p => p.status === "needs-clarification" || p.status === "overdue");
  
  // Determine which KPIs to show based on active filters
  const isFilteredByDirection = filters.direction && filters.direction !== "all";
  const isFilteredByType = filters.type && filters.type !== "all";
  
  // === CONTEXTUAL KPI LOGIC ===
  
  if (!isFilteredByDirection && !isFilteredByType) {
    // No filters: Show overview KPIs
    kpis.push({
      id: "net-flow",
      label: "Чистий потік",
      value: `${netCashFlow >= 0 ? "+" : ""}₴${formatCompactAmount(netCashFlow)}`,
      color: netCashFlow >= 0 ? "success" : "error",
      filterToApply: {},
    });
    
    if (scheduledPayments.length > 0) {
      const scheduledTotal = scheduledPayments.reduce((sum, p) => sum + p.amount, 0);
      kpis.push({
        id: "scheduled",
        label: "До сплати",
        value: `₴${formatCompactAmount(scheduledTotal)}`,
        subLabel: `${scheduledPayments.length} платежів`,
        color: "warning",
        filterToApply: { status: "scheduled" },
      });
    }
    
    if (overduePayments.length > 0) {
      kpis.push({
        id: "overdue",
        label: "Прострочено",
        value: overduePayments.length,
        subLabel: `₴${formatCompactAmount(overduePayments.reduce((s, p) => s + p.amount, 0))}`,
        color: "error",
        filterToApply: { status: "overdue" },
      });
    }
    
    if (paidPayments.length > 0) {
      kpis.push({
        id: "completed",
        label: "Виконано",
        value: paidPayments.length,
        color: "success",
        filterToApply: { status: "paid" },
      });
    }
  } else if (filters.direction === "in") {
    // Incoming filter: Show income-specific KPIs
    kpis.push({
      id: "total-income",
      label: "Всього надійшло",
      value: `₴${formatCompactAmount(totalIn)}`,
      color: "success",
    });
    
    const confirmedIncome = incoming.filter(p => p.status === "income");
    if (confirmedIncome.length > 0) {
      kpis.push({
        id: "confirmed",
        label: "Підтверджено",
        value: confirmedIncome.length,
        subLabel: `₴${formatCompactAmount(confirmedIncome.reduce((s, p) => s + p.amount, 0))}`,
        color: "success",
      });
    }
    
    const clarificationNeeded = incoming.filter(p => p.status === "needs-clarification");
    if (clarificationNeeded.length > 0) {
      kpis.push({
        id: "needs-clarification",
        label: "Потребує уточнення",
        value: clarificationNeeded.length,
        color: "warning",
        filterToApply: { status: "needs-clarification" },
      });
    }
  } else if (filters.direction === "out") {
    // Outgoing filter: Show expense-specific KPIs
    kpis.push({
      id: "total-expenses",
      label: "Всього витрат",
      value: `₴${formatCompactAmount(totalOut)}`,
      color: "info",
    });
    
    // Group by type (with tax subcategories)
    const byType = {
      taxFop: outgoing.filter(p => p.paymentType === "tax-fop"),
      taxSalary: outgoing.filter(p => p.paymentType === "tax-salary"),
      salary: outgoing.filter(p => p.paymentType === "salary"),
      contractor: outgoing.filter(p => p.paymentType === "contractor"),
    };
    
    const allTaxes = [...byType.taxFop, ...byType.taxSalary];
    
    if (allTaxes.length > 0) {
      // Show breakdown if both categories exist
      if (byType.taxFop.length > 0 && byType.taxSalary.length > 0) {
        kpis.push({
          id: "taxes-fop",
          label: "ФОП",
          value: `₴${formatCompactAmount(byType.taxFop.reduce((s, p) => s + p.amount, 0))}`,
          color: "default",
          filterToApply: { type: "tax-fop" as any },
        });
        kpis.push({
          id: "taxes-salary",
          label: "ЗП",
          value: `₴${formatCompactAmount(byType.taxSalary.reduce((s, p) => s + p.amount, 0))}`,
          color: "default",
          filterToApply: { type: "tax-salary" as any },
        });
      } else {
        // Just show combined taxes
        kpis.push({
          id: "taxes",
          label: "Податки",
          value: `₴${formatCompactAmount(allTaxes.reduce((s, p) => s + p.amount, 0))}`,
          color: "default",
          filterToApply: { type: "tax" },
        });
      }
    }
    
    if (byType.salary.length > 0) {
      kpis.push({
        id: "salaries",
        label: "Зарплати",
        value: `₴${formatCompactAmount(byType.salary.reduce((s, p) => s + p.amount, 0))}`,
        color: "default",
        filterToApply: { type: "salary" },
      });
    }
    
    if (byType.contractor.length > 0) {
      kpis.push({
        id: "contractors",
        label: "Контрагенти",
        value: `₴${formatCompactAmount(byType.contractor.reduce((s, p) => s + p.amount, 0))}`,
        color: "default",
        filterToApply: { type: "contractor" },
      });
    }
  } else if (isFilteredByType) {
    // Type-specific KPIs
    const typePayments = payments;
    const typeTotal = typePayments.reduce((sum, p) => sum + p.amount, 0);
    
    kpis.push({
      id: "type-total",
      label: "Всього",
      value: `₴${formatCompactAmount(typeTotal)}`,
      subLabel: `${typePayments.length} операцій`,
      color: "default",
    });
    
    const typePaid = typePayments.filter(p => p.status === "paid" || p.status === "income");
    const typeScheduled = typePayments.filter(p => p.status === "scheduled" || p.status === "created");
    
    if (typePaid.length > 0) {
      kpis.push({
        id: "type-paid",
        label: "Виконано",
        value: typePaid.length,
        subLabel: `₴${formatCompactAmount(typePaid.reduce((s, p) => s + p.amount, 0))}`,
        color: "success",
      });
    }
    
    if (typeScheduled.length > 0) {
      kpis.push({
        id: "type-scheduled",
        label: "Очікується",
        value: typeScheduled.length,
        subLabel: `₴${formatCompactAmount(typeScheduled.reduce((s, p) => s + p.amount, 0))}`,
        color: "warning",
      });
    }
  }
  
  // Always show attention badge if there are issues
  if (needsAttention.length > 0 && !kpis.find(k => k.id === "overdue" || k.id === "needs-clarification")) {
    // Determine primary issue type for filtering
    const overdueCount = payments.filter(p => p.status === "overdue").length;
    
    kpis.push({
      id: "attention",
      label: "Потребує уваги",
      value: needsAttention.length,
      color: "warning",
      filterToApply: overdueCount > 0 
        ? { status: "overdue" }
        : { status: "needs-clarification" },
    });
  }
  
  return kpis.slice(0, 4); // Max 4 KPIs for clean UI
}

/**
 * Get summary stats for the header
 */
export function getPaymentsSummary(payments: UnifiedPayment[]): {
  totalCount: number;
  inCount: number;
  outCount: number;
  totalIn: number;
  totalOut: number;
  netFlow: number;
} {
  const incoming = payments.filter(p => p.direction === "in");
  const outgoing = payments.filter(p => p.direction === "out");
  
  const totalIn = incoming.reduce((sum, p) => sum + p.amount, 0);
  const totalOut = outgoing.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    totalCount: payments.length,
    inCount: incoming.length,
    outCount: outgoing.length,
    totalIn,
    totalOut,
    netFlow: totalIn - totalOut,
  };
}
