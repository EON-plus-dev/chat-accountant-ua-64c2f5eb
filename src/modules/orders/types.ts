/**
 * Orders domain — єдина модель для Sales (direction=sale) і Purchase
 * (direction=purchase) замовлень. Замість двох паралельних модулів,
 * патерн з ERP-світу (SAP/NetSuite/Odoo): один Order + Fulfillment.
 *
 * Fulfillment — єдиний легітимний writer для warehouse.
 * Returns моделюються як OrderLine.isReturn=true з negative qty.
 */

import type { CabinetRole } from "@/types/cabinet";

// ───────────────────────── Core ─────────────────────────

export type OrderDirection = "sale" | "purchase";

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "partial"
  | "fulfilled"
  | "invoiced"
  | "paid"
  | "closed"
  | "cancelled";

export type OrderChannel =
  | "retail_prro"
  | "b2b"
  | "online"
  | "upsell_visit"
  | "marketplace";

export interface OrderLine {
  id: string;
  /** Посилання на товар/SKU (salonProducts або nomenclature). */
  productId: string;
  /** Назва на момент виставлення (snapshot, не міняється після цін у каталозі). */
  productName: string;
  qty: number;
  /** Ціна за одиницю у валюті ордера. */
  price: number;
  /** % знижки (0–100). */
  discount?: number;
  /** % ПДВ (для майбутньої інтеграції з Книгою доходів). */
  taxRate?: number;
  /** RMA — позиція повернення (qty інтерпретується як від'ємне списання). */
  isReturn?: boolean;
  /** Скільки одиниць уже виконано (по сумі Fulfillment'ів). */
  fulfilled: number;
  /** Розрахункова собівартість (з landed cost, для маржі). */
  costBasis?: number;
}

export interface ApprovalRecord {
  policyId: string;
  status: "pending" | "approved" | "rejected";
  approverRole?: CabinetRole;
  requestedAt: string;
  decidedAt?: string;
  note?: string;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  /** Маржа лише для sale (sum of (price - costBasis) * qty). */
  margin?: number;
}

export interface Order {
  id: string;
  cabinetId: string;
  direction: OrderDirection;
  number: string;
  /** ID контрагента: client (sale) | supplier (purchase). */
  counterpartyId: string;
  /** Snapshot імені контрагента. */
  counterpartyName: string;
  currency: "UAH" | "USD" | "EUR";
  /** Курс НБУ на confirmedAt (для KPI у грн). 1 для UAH. */
  fxRate: number;
  status: OrderStatus;
  channel?: OrderChannel;
  lines: OrderLine[];
  totals: OrderTotals;
  policyApprovals?: ApprovalRecord[];
  /** Зв'язок з CRM/Booking — для bridge'ів. */
  linkedDealId?: string;
  linkedBookingId?: string;
  /** Майстер/менеджер, який оформив (для permissions own_shift/own_clients). */
  ownerUserId?: string;
  /** Очікувана дата відвантаження/поставки. */
  expectedAt?: string;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
  closedAt?: string;
}

// ───────────────────────── Fulfillment ─────────────────────────

export type FulfillmentKind = "shipment" | "receipt";

export interface LandedCostItem {
  type: "freight" | "duty" | "insurance" | "other";
  amount: number;
  currency: "UAH" | "USD" | "EUR";
  note?: string;
}

export interface FulfillmentLine {
  lineId: string;
  qty: number;
  /** Розбіжність з очікуваним (для GRN): qty_expected - qty_actual. */
  discrepancy?: number;
}

export interface Fulfillment {
  id: string;
  orderId: string;
  kind: FulfillmentKind;
  date: string;
  lines: FulfillmentLine[];
  landedCosts?: LandedCostItem[];
  /** ID руху на складі (через warehouse-модуль). */
  warehouseMoveId?: string;
  discrepancyNote?: string;
  createdBy?: string;
}

// ───────────────────────── Policy Engine ─────────────────────────

export type PolicyScope = "sale" | "purchase" | "both";

export type PolicyType =
  | "approval"           // дозвіл при умові (X грн → owner approval)
  | "discount_limit"     // макс знижка ролі
  | "supplier_default"   // дефолтний постачальник для категорії
  | "stock_threshold";   // мін залишок для авторекомендацій

export interface OrderPolicy {
  id: string;
  scope: PolicyScope;
  type: PolicyType;
  label: string;
  enabled: boolean;
  condition: {
    field: "total" | "lineDiscount" | "category" | "stockQty";
    op: ">" | ">=" | "<" | "<=" | "=" | "in";
    value: number | string | string[];
  };
  action: {
    approverRole?: CabinetRole;
    maxDiscountPct?: number;
    defaultSupplierId?: string;
    reorderToQty?: number;
  };
  slaHours?: number;
}

// ───────────────────────── KPI ─────────────────────────

export interface SalesKpis {
  revenueToday: number;
  revenue7d: number;
  revenue30d: number;
  prev30d: number;
  avgCheck: number;
  upsellConversion: number;
  topSkus: { productId: string; name: string; revenue: number; margin: number }[];
}

export interface PurchasesKpis {
  inProgress: number;
  overdue: number;
  monthSpend: number;
  monthBudget: number;
  daysOfStockAvg: number;
  topSuppliers: { supplierId: string; name: string; turnover: number; ordersCount: number }[];
}
