/**
 * Phase A2 — Operations regroup redirects (individual cabinet).
 *
 * Source of truth mapping old `individualOperations` sub-tab IDs
 * to the new top-level information architecture (10 sections).
 *
 * Stage 1: documentation + lookup helper only — no forced <Navigate>
 * so existing deep links continue to work and we ship incrementally.
 * Stage 2: CabinetOperationsPage will consume this and render a soft
 *          "Цей розділ переїхав до …" hint without breaking the route.
 */

import type { CabinetTabType } from "@/components/dashboard/WorkspacePanel";

export interface OperationsRedirect {
  /** New top-level cabinet tab. */
  tab: CabinetTabType;
  /** Optional sub-tab inside the new section. */
  subTab?: string;
  /** Short human label for the destination, for hint UI. */
  label: string;
}

/**
 * Old `individualOperations` sub-tab ID → new IA location.
 * Sub-tabs NOT listed here stay in Operations (e.g. diary, finance, documents — those move at later phases).
 */
export const individualOperationsRedirects: Record<string, OperationsRedirect> = {
  investments:     { tab: "savings",   subTab: "investments",   label: "Заощадження → Інвестиції" },
  "tax-discount":  { tab: "operations", subTab: "tax-discount",  label: "Фінанси → Податки → Подат. знижка" },
  "fin-monitoring":{ tab: "operations", subTab: "fin-monitoring",label: "Фінанси → Податки → Фін. моніторинг" },
  declarations:    { tab: "operations", subTab: "declarations",  label: "Фінанси → Податки → Декларації" },
  property:        { tab: "operations", subTab: "property",      label: "Фінанси → Податки → Майно" },
  subscriptions:   { tab: "orders",    subTab: "subscriptions", label: "Замовлення → Підписки" },
  "orders-bookings":{ tab: "orders",   subTab: "bookings",      label: "Замовлення → Бронювання" },
  payments:        { tab: "operations", subTab: "payments",      label: "Фінанси → Платежі" },
  documents:       { tab: "documents", label: "Документи (top-level)" },
};

export function getIndividualOperationsRedirect(subTabId: string): OperationsRedirect | undefined {
  return individualOperationsRedirects[subTabId];
}
