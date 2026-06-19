/**
 * Уніфікований селектор декларацій фізособи.
 *
 * Поверх двох джерел даних:
 * 1) DeclarationCase (майнова декларація + amendments) — через getDeclarationCasesWithAutoDrafts
 * 2) Report[] фізособи (податкова знижка, КІК, ВЗ) — через getDemoReportsForCabinet
 *
 * Жодних змін у вихідних структурах — лише обгортка для уніфікованого списку.
 */

import {
  REPORTING_YEARS,
  type DeclarationCase,
} from "@/config/demoCabinets/declarationCases";
import { getDeclarationCasesWithAutoDrafts } from "@/lib/declarations/declarationAutoCreate";
import { getDemoReportsForCabinet } from "@/config/demoCabinets/getters";
import type { Report } from "@/config/reportsConfig";

export type DeclarationKind =
  | "property_income"
  | "amendment"
  | "tax_credit"
  | "kik"
  | "vz_monthly";

export type UnifiedStatus =
  | "draft"
  | "in_review"
  | "ready"
  | "submitted"
  | "accepted"
  | "scheduled";

export type DeclarationUrgency = "overdue" | "urgent" | "warning" | "normal";

export interface UnifiedDeclaration {
  id: string;
  kind: DeclarationKind;
  title: string;
  reportingYear: number;
  period: string;
  status: UnifiedStatus;
  statusLabel: string;
  deadline: string; // ISO
  totalAmount: number; // дохід або база
  taxAmount: number; // > 0 = до сплати; < 0 = до повернення; 0 = немає
  source: "case" | "report";
  refId: string;
  /** Computed з deadline + status. Для submitted/accepted завжди "normal". */
  urgency: DeclarationUrgency;
}

/** Розрахунок терміновості для рядка списку. */
function computeUrgency(deadlineIso: string, status: UnifiedStatus): DeclarationUrgency {
  if (status === "submitted" || status === "accepted") return "normal";
  const now = Date.now();
  const dl = new Date(deadlineIso).getTime();
  const daysLeft = Math.ceil((dl - now) / (24 * 60 * 60 * 1000));
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 7) return "urgent";
  if (daysLeft <= 30) return "warning";
  return "normal";
}

export const KIND_LABELS: Record<DeclarationKind, string> = {
  property_income: "Майновий стан і доходи",
  amendment: "Уточнююча декларація",
  tax_credit: "Податкова знижка",
  kik: "Звіт про КІК",
  vz_monthly: "Військовий збір",
};

export const KIND_SHORT: Record<DeclarationKind, string> = {
  property_income: "ПДФО",
  amendment: "Уточнююча",
  tax_credit: "Знижка",
  kik: "КІК",
  vz_monthly: "ВЗ",
};

const CASE_STATUS_TO_UNIFIED: Record<DeclarationCase["status"], UnifiedStatus> = {
  draft: "draft",
  in_review: "in_review",
  reviewed: "in_review",
  pending_user_input: "draft",
  ready_to_confirm: "ready",
  confirmed: "ready",
  submitted: "submitted",
  accepted: "accepted",
};

const CASE_STATUS_LABELS: Record<DeclarationCase["status"], string> = {
  draft: "Чернетка",
  in_review: "На перевірці",
  reviewed: "Перевірено",
  pending_user_input: "Очікує уточнень",
  ready_to_confirm: "Готова до підпису",
  confirmed: "Підписана",
  submitted: "Подано",
  accepted: "Прийнято ДПС",
};

function mapCase(c: DeclarationCase): UnifiedDeclaration {
  const status = CASE_STATUS_TO_UNIFIED[c.status];
  const deadline = `${c.reportingYear + 1}-05-01`;
  return {
    id: `case:${c.id}`,
    kind: c.amendmentOf ? "amendment" : "property_income",
    title: c.amendmentOf
      ? `Уточнююча декларація ${c.reportingYear}`
      : `Декларація ${c.reportingYear}`,
    reportingYear: c.reportingYear,
    period: `${c.reportingYear} рік`,
    status,
    statusLabel: CASE_STATUS_LABELS[c.status],
    deadline,
    totalAmount: c.totalIncome ?? 0,
    taxAmount: (c.totalRefund ?? 0) > 0
      ? -(c.totalRefund ?? 0)
      : (c.totalTax ?? 0),
    source: "case",
    refId: c.id,
    urgency: computeUrgency(deadline, status),
  };
}

const REPORT_STATUS_TO_UNIFIED: Record<string, UnifiedStatus> = {
  draft: "draft",
  review: "in_review",
  scheduled: "scheduled",
  ready: "ready",
  submitted: "submitted",
  accepted: "accepted",
};

function classifyReport(r: Report): DeclarationKind | null {
  // Уточнюючі — мапимо як amendment лише якщо це не майнова (вона вже з case-ів)
  if (r.type === "vz") return "vz_monthly";
  if (r.typeLabel === "КІК" || /КІК/i.test(r.name)) return "kik";
  if (r.typeLabel === "Податкова знижка" || /податков\w* знижк/i.test(r.name))
    return "tax_credit";
  // Майнові декларації — пропускаємо: вони вже представлені через DeclarationCase.
  if (r.type === "pdfo") return null;
  return null;
}

function mapReport(r: Report): UnifiedDeclaration | null {
  const kind = classifyReport(r);
  if (!kind) return null;
  const status: UnifiedStatus = REPORT_STATUS_TO_UNIFIED[r.status] ?? "draft";
  return {
    id: `report:${r.id}`,
    kind,
    title: r.name,
    reportingYear: r.year ?? new Date(r.deadline).getFullYear(),
    period: r.periodLabel ?? `${r.year} рік`,
    status,
    statusLabel: r.statusLabel,
    deadline: r.deadline,
    totalAmount: 0,
    taxAmount: r.amountToPay ?? 0,
    source: "report",
    refId: r.id,
    urgency: computeUrgency(r.deadline, status),
  };
}

export function getAllDeclarationsForCabinet(
  cabinetId: string,
): UnifiedDeclaration[] {
  const cases = getDeclarationCasesWithAutoDrafts(cabinetId, REPORTING_YEARS);
  const reports = getDemoReportsForCabinet(cabinetId);

  const unified: UnifiedDeclaration[] = [
    ...cases.map(mapCase),
    ...reports.map(mapReport).filter((x): x is UnifiedDeclaration => !!x),
  ];

  // Сортування: за роком ↓, потім подані/прийняті в кінець, чернетки/планові — згори
  const statusWeight: Record<UnifiedStatus, number> = {
    in_review: 0,
    draft: 1,
    ready: 2,
    scheduled: 3,
    submitted: 4,
    accepted: 5,
  };

  return unified.sort((a, b) => {
    if (b.reportingYear !== a.reportingYear) return b.reportingYear - a.reportingYear;
    return statusWeight[a.status] - statusWeight[b.status];
  });
}

export interface DeclarationsKpis {
  currentYear: number;
  countCurrentYear: number;
  totalToPay: number;
  totalRefund: number;
  inReview: number;
  submittedFraction: { submitted: number; total: number };
}

export function computeDeclarationsKpis(
  items: UnifiedDeclaration[],
): DeclarationsKpis {
  const currentYear = items.length
    ? Math.max(...items.map((i) => i.reportingYear))
    : new Date().getFullYear() - 1;

  const countCurrentYear = items.filter((i) => i.reportingYear === currentYear).length;

  const totalToPay = items
    .filter((i) => i.status !== "accepted" && i.status !== "submitted" && i.taxAmount > 0)
    .reduce((s, i) => s + i.taxAmount, 0);

  const totalRefund = items
    .filter((i) => i.status !== "accepted" && i.taxAmount < 0)
    .reduce((s, i) => s + Math.abs(i.taxAmount), 0);

  const inReview = items.filter((i) => i.status === "in_review").length;

  const submitted = items.filter((i) => i.status === "submitted" || i.status === "accepted").length;

  return {
    currentYear,
    countCurrentYear,
    totalToPay,
    totalRefund,
    inReview,
    submittedFraction: { submitted, total: items.length },
  };
}
