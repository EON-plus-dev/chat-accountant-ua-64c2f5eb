/**
 * Drill Stack — Stacked Sheet Navigation
 *
 * Системне правило для крос-сутністних переходів:
 * замість navigate() на іншу сторінку — push нового рівня в drill-стек,
 * що рендериться як Sheet поверх поточного екрана.
 *
 * Див. mem://navigation/drill-stack-pattern-uk.
 */

export type DrillKind =
  | "income-record"
  | "contractor"
  | "document"
  | "declaration"
  | "payment"
  | "report"
  | "audit"
  | "workstation"
  | "salon-master"
  | "salon-service"
  | "booking"
  | "client"
  | "order"
  // Personal Core (Замовлення)
  | "personal-order"
  | "subscription"
  | "loyalty-program"
  | "personal-offer";

/**
 * Опціональні preview-метадані, що передаються з ініціюючого місця.
 * НЕ серіалізуються в URL — використовуються лише поки рівень у пам'яті.
 * Коли URL відновлюється з історії, drill-view сам тягне дані за id.
 */
export interface DrillMeta {
  title?: string;
  statusLabel?: string;
  deadline?: string;
  amount?: number;
  taxAmount?: number;
  totalAmount?: number;
  currency?: string;
  date?: string;
  contractor?: string;
  purpose?: string;
  period?: string;
  /** Зворотній зв'язок з ППР для платежу-донарахування */
  relatedPprId?: string;
}

export interface DrillLevel {
  /** Тип сутності, що відкривається у drill-sheet */
  kind: DrillKind;
  /** ID конкретного запису */
  id: string;
  /** Підпис «звідки» — для breadcrumb («Платіж №…») */
  sourceLabel?: string;
  /** Опц. дисплейне ім'я (напр. назва контрагента) — не серіалізується в URL */
  displayName?: string;
  /** Опц. preview-метадані для миттєвого рендеру без додаткового запиту */
  meta?: DrillMeta;
}
