/**
 * Salon Orders demo data — продукти (ритейл/професійні), постачальники,
 * 60–90 днів продажів (різні канали) + 25+ закупівель з multi-currency,
 * landed cost, returns і partial fulfillment.
 *
 * Окремий файл від `salonData.ts` — щоб не роздувати основний.
 */

import type { Order, Fulfillment, OrderChannel } from "@/modules/orders/types";
import { getDateInPast } from "./helpers";
import { salonClients, salonMasters } from "./salonData";

// ───────────────────────── Catalog ─────────────────────────

export interface SalonProduct {
  id: string;
  sku: string;
  name: string;
  category: "hair_care" | "color" | "nails" | "skin" | "tools";
  /** Каналу збуту. retail — продаж клієнту на касі. */
  retailPrice: number;
  /** Очікувана собівартість для маржі. */
  baseCost: number;
  defaultSupplierId: string;
  /** Чи продаємо роздрібно клієнтам (на касі). */
  isRetail: boolean;
  /** Чи витрачаємо в процедурах. */
  isProfessional: boolean;
  stockQty: number;
  minStock: number;
  unit: "шт" | "мл";
}

export const SALON_PRODUCTS: SalonProduct[] = [
  // Hair care (retail)
  { id: "p-1", sku: "OLA-PER-100", name: "Olaplex No.3 (100 мл)", category: "hair_care", retailPrice: 980, baseCost: 540, defaultSupplierId: "sup-1", isRetail: true, isProfessional: true, stockQty: 18, minStock: 6, unit: "шт" },
  { id: "p-2", sku: "KER-NUT-200", name: "Kerastase Nutritive шампунь 250 мл", category: "hair_care", retailPrice: 680, baseCost: 320, defaultSupplierId: "sup-1", isRetail: true, isProfessional: false, stockQty: 24, minStock: 8, unit: "шт" },
  { id: "p-3", sku: "KER-NUT-MSK", name: "Kerastase Nutritive маска 200 мл", category: "hair_care", retailPrice: 780, baseCost: 380, defaultSupplierId: "sup-1", isRetail: true, isProfessional: false, stockQty: 12, minStock: 6, unit: "шт" },
  { id: "p-4", sku: "LP-ABS-100", name: "L'Oréal Pro Absolut Repair олія 90 мл", category: "hair_care", retailPrice: 560, baseCost: 260, defaultSupplierId: "sup-2", isRetail: true, isProfessional: true, stockQty: 9, minStock: 5, unit: "шт" },
  { id: "p-5", sku: "DAVI-LOV-1L", name: "Davines LOVE кондиціонер 1 л", category: "hair_care", retailPrice: 1450, baseCost: 720, defaultSupplierId: "sup-3", isRetail: true, isProfessional: true, stockQty: 4, minStock: 3, unit: "шт" },
  // Color (professional)
  { id: "p-6", sku: "LP-MAJ-50", name: "Majirel Cool Cover фарба 50 мл", category: "color", retailPrice: 420, baseCost: 180, defaultSupplierId: "sup-2", isRetail: false, isProfessional: true, stockQty: 36, minStock: 12, unit: "шт" },
  { id: "p-7", sku: "WEL-BLON-30", name: "Wella BlondorPlex освітлювач 30 мл", category: "color", retailPrice: 580, baseCost: 250, defaultSupplierId: "sup-2", isRetail: false, isProfessional: true, stockQty: 14, minStock: 8, unit: "шт" },
  // Nails (retail/pro)
  { id: "p-8", sku: "OPI-INF-15", name: "OPI Infinite Shine лак 15 мл", category: "nails", retailPrice: 420, baseCost: 190, defaultSupplierId: "sup-4", isRetail: true, isProfessional: true, stockQty: 22, minStock: 10, unit: "шт" },
  { id: "p-9", sku: "ESS-EXT-10", name: "Essie Expressie швидкий лак 10 мл", category: "nails", retailPrice: 380, baseCost: 170, defaultSupplierId: "sup-4", isRetail: true, isProfessional: false, stockQty: 16, minStock: 8, unit: "шт" },
  { id: "p-10", sku: "CND-SHE-7", name: "CND Shellac гель-лак 7,3 мл", category: "nails", retailPrice: 520, baseCost: 230, defaultSupplierId: "sup-4", isRetail: false, isProfessional: true, stockQty: 11, minStock: 6, unit: "шт" },
  // Skin / brows
  { id: "p-11", sku: "REF-HEN-15", name: "RefectoCil фарба для брів 15 мл", category: "skin", retailPrice: 240, baseCost: 110, defaultSupplierId: "sup-2", isRetail: false, isProfessional: true, stockQty: 8, minStock: 5, unit: "шт" },
  { id: "p-12", sku: "CSP-AGE-50", name: "CosPharm Age Defense крем 50 мл", category: "skin", retailPrice: 1240, baseCost: 580, defaultSupplierId: "sup-3", isRetail: true, isProfessional: false, stockQty: 5, minStock: 4, unit: "шт" },
  // Dead stock
  { id: "p-13", sku: "GIFT-2025", name: "Подарунковий сертифікат 1000 ₴", category: "tools", retailPrice: 1000, baseCost: 0, defaultSupplierId: "sup-1", isRetail: true, isProfessional: false, stockQty: 30, minStock: 0, unit: "шт" },
];

// ───────────────────────── Suppliers (additions to contractors) ─────────────────────────

export interface SalonSupplier {
  id: string;
  name: string;
  taxId: string;
  country: "UA" | "PL" | "DE";
  currency: "UAH" | "USD" | "EUR";
  onTimePct: number;
  qualityScore: number;
  defaultLeadDays: number;
}

export const SALON_SUPPLIERS: SalonSupplier[] = [
  { id: "sup-1", name: "ТОВ «Бьюті Дістриб»", taxId: "39847512", country: "UA", currency: "UAH", onTimePct: 92, qualityScore: 4.7, defaultLeadDays: 3 },
  { id: "sup-2", name: "L'Oréal Україна", taxId: "21662207", country: "UA", currency: "UAH", onTimePct: 96, qualityScore: 4.9, defaultLeadDays: 5 },
  { id: "sup-3", name: "Davines Italia SRL", taxId: "IT04261830378", country: "DE", currency: "EUR", onTimePct: 88, qualityScore: 4.8, defaultLeadDays: 14 },
  { id: "sup-4", name: "Nail Pro PL", taxId: "PL5252345678", country: "PL", currency: "EUR", onTimePct: 91, qualityScore: 4.6, defaultLeadDays: 10 },
];

// ───────────────────────── Generators ─────────────────────────

const CABINET_ID = "demo-salon-3";

function num(n: number, padding = 3): string {
  return String(n).padStart(padding, "0");
}

function pickClient(i: number): { id: string; name: string } {
  const c = salonClients[i % salonClients.length];
  return { id: c.id, name: c.fullName };
}

function pickMaster(i: number): string {
  return salonMasters[i % salonMasters.length].id;
}

function makeSale(
  i: number,
  daysAgo: number,
  channel: OrderChannel,
  productIds: { id: string; qty: number; discountPct?: number }[],
  opts: { linkedBookingId?: string; isReturn?: boolean } = {},
): Order {
  const client = pickClient(i);
  const dateIso = getDateInPast(daysAgo);
  const createdAt = `${dateIso}T${10 + (i % 9)}:${15 + (i % 4) * 10}:00`;
  const lines = productIds.map((p, idx) => {
    const prod = SALON_PRODUCTS.find((x) => x.id === p.id)!;
    const qty = opts.isReturn ? -Math.abs(p.qty) : p.qty;
    const discount = p.discountPct ?? 0;
    return {
      id: `line-s-${i}-${idx}`,
      productId: prod.id,
      productName: prod.name,
      qty,
      price: prod.retailPrice,
      discount,
      taxRate: 0,
      isReturn: !!opts.isReturn,
      fulfilled: Math.abs(qty),
      costBasis: prod.baseCost,
    };
  });
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const discountSum = lines.reduce(
    (s, l) => s + (l.discount ? (l.price * l.qty * l.discount) / 100 : 0),
    0,
  );
  const total = subtotal - discountSum;
  const margin = lines.reduce(
    (s, l) => s + (l.price - (l.costBasis ?? l.price * 0.55)) * l.qty,
    0,
  );
  return {
    id: `so-${num(i)}`,
    cabinetId: CABINET_ID,
    direction: "sale",
    number: `SO-2026-${num(i)}`,
    counterpartyId: client.id,
    counterpartyName: client.name,
    currency: "UAH",
    fxRate: 1,
    status: opts.isReturn ? "closed" : "closed",
    channel,
    lines,
    totals: { subtotal, discount: discountSum, tax: 0, total, margin },
    linkedBookingId: opts.linkedBookingId,
    ownerUserId: pickMaster(i),
    createdAt,
    confirmedAt: createdAt,
    closedAt: createdAt,
  };
}

function makePurchase(
  i: number,
  daysAgo: number,
  supplierId: string,
  lines: { id: string; qty: number; unitCost?: number }[],
  opts: { currency?: "UAH" | "USD" | "EUR"; status?: Order["status"]; expectedAhead?: number; landed?: number } = {},
): Order {
  const sup = SALON_SUPPLIERS.find((s) => s.id === supplierId)!;
  const dateIso = getDateInPast(daysAgo);
  const currency = opts.currency ?? sup.currency;
  const fxRate = currency === "USD" ? 41.5 : currency === "EUR" ? 44.2 : 1;
  const lns = lines.map((p, idx) => {
    const prod = SALON_PRODUCTS.find((x) => x.id === p.id)!;
    const unitCost = p.unitCost ?? prod.baseCost / fxRate;
    return {
      id: `line-p-${i}-${idx}`,
      productId: prod.id,
      productName: prod.name,
      qty: p.qty,
      price: Math.round(unitCost * 100) / 100,
      discount: 0,
      isReturn: false,
      fulfilled: opts.status === "partial" ? Math.floor(p.qty * 0.6) : opts.status === "confirmed" ? 0 : p.qty,
      costBasis: unitCost,
    };
  });
  const subtotal = lns.reduce((s, l) => s + l.price * l.qty, 0);
  const expectedDate = opts.expectedAhead
    ? getDateInPast(-opts.expectedAhead)
    : getDateInPast(daysAgo - sup.defaultLeadDays);
  const status = opts.status ?? "fulfilled";
  return {
    id: `po-${num(i)}`,
    cabinetId: CABINET_ID,
    direction: "purchase",
    number: `PO-2026-${num(i)}`,
    counterpartyId: sup.id,
    counterpartyName: sup.name,
    currency,
    fxRate,
    status,
    lines: lns,
    totals: { subtotal, discount: 0, tax: 0, total: subtotal },
    expectedAt: expectedDate,
    createdAt: `${dateIso}T10:00:00`,
    confirmedAt: status !== "draft" ? `${dateIso}T10:30:00` : undefined,
    closedAt: status === "closed" || status === "fulfilled" || status === "paid" ? `${getDateInPast(Math.max(0, daysAgo - sup.defaultLeadDays))}T15:00:00` : undefined,
    notes: opts.landed ? `Landed cost ${opts.landed} ${currency}` : undefined,
  };
}

// ───────────────────────── Sales (90 днів) ─────────────────────────

function generateSales(): Order[] {
  const out: Order[] = [];
  let i = 1;
  // Retail-channel: ~1.5 продажі/день, 90 днів = ~135
  for (let d = 90; d >= 0; d--) {
    if (d % 7 === 1) continue; // понеділок
    const perDay = d < 30 ? 2 : 1;
    for (let k = 0; k < perDay; k++) {
      const productPool = [["p-1"], ["p-2", "p-3"], ["p-4"], ["p-8"], ["p-2"], ["p-12"], ["p-13"], ["p-9"]];
      const pids = productPool[i % productPool.length].map((id) => ({ id, qty: 1, discountPct: i % 11 === 0 ? 10 : undefined }));
      out.push(makeSale(i++, d, d % 5 === 0 ? "upsell_visit" : "retail_prro", pids, d % 5 === 0 ? { linkedBookingId: `b-demo-salon-3-${d}` } : {}));
    }
  }
  // 3 B2B: салон-партнер купує оптом
  out.push(makeSale(i++, 21, "b2b", [{ id: "p-2", qty: 12 }, { id: "p-3", qty: 8 }]));
  out.push(makeSale(i++, 45, "b2b", [{ id: "p-6", qty: 24 }]));
  out.push(makeSale(i++, 8, "online", [{ id: "p-1", qty: 2 }, { id: "p-5", qty: 1 }]));
  // 2 returns
  out.push(makeSale(i++, 12, "retail_prro", [{ id: "p-12", qty: 1 }], { isReturn: true }));
  out.push(makeSale(i++, 35, "retail_prro", [{ id: "p-4", qty: 1 }], { isReturn: true }));
  return out;
}

// ───────────────────────── Purchases (~25) ─────────────────────────

function generatePurchases(): Order[] {
  const out: Order[] = [];
  let i = 1;
  // Регулярні UAH-закупки у L'Oréal та Бьюті Дістриб
  out.push(makePurchase(i++, 75, "sup-2", [{ id: "p-6", qty: 30 }, { id: "p-7", qty: 12 }]));
  out.push(makePurchase(i++, 60, "sup-1", [{ id: "p-1", qty: 20 }, { id: "p-2", qty: 24 }]));
  out.push(makePurchase(i++, 52, "sup-2", [{ id: "p-6", qty: 24 }, { id: "p-11", qty: 10 }]));
  out.push(makePurchase(i++, 45, "sup-4", [{ id: "p-8", qty: 30 }, { id: "p-9", qty: 18 }], { currency: "EUR" }));
  out.push(makePurchase(i++, 40, "sup-3", [{ id: "p-5", qty: 12 }, { id: "p-12", qty: 8 }], { currency: "EUR", landed: 180 }));
  out.push(makePurchase(i++, 38, "sup-1", [{ id: "p-3", qty: 18 }]));
  out.push(makePurchase(i++, 30, "sup-2", [{ id: "p-6", qty: 24 }, { id: "p-7", qty: 12 }]));
  out.push(makePurchase(i++, 28, "sup-1", [{ id: "p-1", qty: 18 }, { id: "p-4", qty: 15 }]));
  out.push(makePurchase(i++, 22, "sup-4", [{ id: "p-10", qty: 24 }, { id: "p-8", qty: 18 }], { currency: "EUR" }));
  // Partial (60% прийнято)
  out.push(makePurchase(i++, 18, "sup-3", [{ id: "p-5", qty: 10 }], { currency: "EUR", status: "partial", landed: 120 }));
  out.push(makePurchase(i++, 14, "sup-2", [{ id: "p-6", qty: 36 }, { id: "p-11", qty: 10 }]));
  out.push(makePurchase(i++, 10, "sup-1", [{ id: "p-2", qty: 24 }]));
  out.push(makePurchase(i++, 7, "sup-4", [{ id: "p-8", qty: 24 }], { currency: "EUR" }));
  // Overdue (status=confirmed з expectedAt у минулому)
  out.push({
    ...makePurchase(i++, 12, "sup-3", [{ id: "p-12", qty: 6 }], { currency: "EUR" }),
    status: "confirmed",
    expectedAt: getDateInPast(2),
  });
  // In progress
  out.push(makePurchase(i++, 4, "sup-1", [{ id: "p-1", qty: 18 }], { status: "confirmed", expectedAhead: 3 }));
  out.push(makePurchase(i++, 2, "sup-2", [{ id: "p-6", qty: 30 }], { status: "confirmed", expectedAhead: 5 }));
  // Drafts
  out.push({
    ...makePurchase(i++, 1, "sup-4", [{ id: "p-9", qty: 12 }], { currency: "EUR", status: "draft" }),
    confirmedAt: undefined,
    closedAt: undefined,
  });
  return out;
}

// ───────────────────────── Fulfillments ─────────────────────────

function generateFulfillments(orders: Order[]): Fulfillment[] {
  const out: Fulfillment[] = [];
  let i = 1;
  for (const o of orders) {
    if (o.direction !== "purchase") continue;
    if (o.status === "draft" || o.status === "confirmed") continue;
    const isPartial = o.status === "partial";
    out.push({
      id: `ful-${num(i++)}`,
      orderId: o.id,
      kind: "receipt",
      date: o.closedAt?.slice(0, 10) ?? o.createdAt.slice(0, 10),
      lines: o.lines.map((l) => ({
        lineId: l.id,
        qty: isPartial ? Math.floor(l.qty * 0.6) : l.qty,
        discrepancy: isPartial ? l.qty - Math.floor(l.qty * 0.6) : 0,
      })),
      landedCosts: o.notes?.includes("Landed")
        ? [{ type: "freight", amount: 120, currency: o.currency, note: "Доставка EU" }]
        : undefined,
      discrepancyNote: isPartial ? "Часткова поставка: бекордер на залишок." : undefined,
    });
  }
  return out;
}

// ───────────────────────── Exports ─────────────────────────

export const salonSalesOrders: Order[] = generateSales();
export const salonPurchaseOrders: Order[] = generatePurchases();
export const salonAllOrders: Order[] = [...salonSalesOrders, ...salonPurchaseOrders];
export const salonFulfillments: Fulfillment[] = generateFulfillments(salonAllOrders);

export function seedOrdersForCabinet(cabinetId: string): Order[] {
  if (cabinetId !== CABINET_ID) return [];
  return salonAllOrders;
}

export function seedFulfillmentsForCabinet(cabinetId: string): Fulfillment[] {
  if (cabinetId !== CABINET_ID) return [];
  return salonFulfillments;
}
