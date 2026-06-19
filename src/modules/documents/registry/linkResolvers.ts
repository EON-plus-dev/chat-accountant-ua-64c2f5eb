/**
 * Resolves DocumentLink → human-readable label + drill target.
 * Pure mapping; the actual data fetch happens in drill-stack consumers.
 */
import type { DocumentLink, DocumentLinkKind } from "../types";
import type { DrillKind } from "@/components/shared/drill-stack/types";

const LINK_TO_DRILL: Partial<Record<DocumentLinkKind, DrillKind>> = {
  deal: "client", // CRM deals open via account/client drill for now
  account: "client",
  order: "order",
  payment: "payment",
  audit: "audit",
  declaration: "declaration",
  contractor: "contractor",
  booking: "booking",
  income_record: "income-record",
  // fulfillment / task / personal_property — no drill yet
};

export function resolveLinkDrillKind(link: DocumentLink): DrillKind | null {
  return LINK_TO_DRILL[link.kind] ?? null;
}

export function describeLink(link: DocumentLink): string {
  if (link.label) return link.label;
  const labels: Record<DocumentLinkKind, string> = {
    deal: "Угода",
    account: "Клієнт",
    order: "Замовлення",
    fulfillment: "Виконання",
    payment: "Платіж",
    audit: "Перевірка",
    declaration: "Декларація",
    task: "Задача",
    contractor: "Контрагент",
    booking: "Запис",
    personal_property: "Майно",
    income_record: "Дохід",
  };
  return `${labels[link.kind]} #${link.entityId.slice(0, 6)}`;
}
