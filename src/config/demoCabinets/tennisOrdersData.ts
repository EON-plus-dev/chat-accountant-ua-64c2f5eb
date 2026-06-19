/**
 * TENNIS CLUB orders demo data (demo-tennis-3).
 * Структура дзеркальна `salonOrdersData`: продукти + 90 днів продажів
 * (роздріб ПРРО магазин + кафе + B2B на корпоративні комплекти + повернення)
 * + закупівлі (інвентар, продукти кафе, multi-currency імпорт з ЄС/США)
 * + GRN з landed cost.
 */

import type { Order, Fulfillment, OrderChannel } from "@/modules/orders/types";
import { getDateInPast } from "./helpers";
import { TENNIS_NOMENCLATURE_SEED } from "./nomenclature/tennisNomenclature";

// ───────────────────────── Catalog (shared shape with salonOrdersData) ─────────────────────────

export interface TennisProduct {
  id: string;
  sku: string;
  name: string;
  group: "shop" | "cafe";
  category: string;
  retailPrice: number;
  baseCost: number;
  defaultSupplierId: string;
  stockQty: number;
  minStock: number;
  unit: string;
}

export const TENNIS_PRODUCTS: TennisProduct[] = TENNIS_NOMENCLATURE_SEED.map((s) => ({
  id: s.id,
  sku: s.sku,
  name: s.name,
  group: s.group,
  category: s.category,
  retailPrice: s.price,
  baseCost: s.cost,
  defaultSupplierId: supplierIdByName(s.supplier),
  stockQty: s.stock,
  minStock: s.minStock,
  unit: s.unit,
}));

// ───────────────────────── Suppliers ─────────────────────────

export interface TennisSupplier {
  id: string;
  name: string;
  taxId: string;
  country: "UA" | "PL" | "DE" | "FR" | "US";
  currency: "UAH" | "USD" | "EUR";
  onTimePct: number;
  qualityScore: number;
  defaultLeadDays: number;
}

export const TENNIS_SUPPLIERS: TennisSupplier[] = [
  { id: "tsup-wilson", name: "Wilson Sporting Goods (EU)", taxId: "DE301452211", country: "DE", currency: "EUR", onTimePct: 94, qualityScore: 4.8, defaultLeadDays: 12 },
  { id: "tsup-head", name: "HEAD Sport GmbH", taxId: "AT12446789", country: "DE", currency: "EUR", onTimePct: 92, qualityScore: 4.85, defaultLeadDays: 10 },
  { id: "tsup-babolat", name: "ТОВ «Babolat Україна»", taxId: "39827654", country: "UA", currency: "UAH", onTimePct: 96, qualityScore: 4.9, defaultLeadDays: 4 },
  { id: "tsup-yonex", name: "Yonex Europe BV", taxId: "NL824112334", country: "DE", currency: "EUR", onTimePct: 88, qualityScore: 4.7, defaultLeadDays: 14 },
  { id: "tsup-prince", name: "Prince Distribution (PL)", taxId: "PL5251234567", country: "PL", currency: "EUR", onTimePct: 89, qualityScore: 4.55, defaultLeadDays: 9 },
  { id: "tsup-dunlop", name: "ТОВ «Dunlop Україна»", taxId: "40123456", country: "UA", currency: "UAH", onTimePct: 95, qualityScore: 4.75, defaultLeadDays: 5 },
  { id: "tsup-nike", name: "ТОВ «Nike Україна»", taxId: "32145678", country: "UA", currency: "UAH", onTimePct: 97, qualityScore: 4.9, defaultLeadDays: 4 },
  { id: "tsup-adidas", name: "ТОВ «Adidas Україна»", taxId: "31876543", country: "UA", currency: "UAH", onTimePct: 96, qualityScore: 4.85, defaultLeadDays: 4 },
  { id: "tsup-asics", name: "ASICS Distribution UA", taxId: "42876512", country: "UA", currency: "UAH", onTimePct: 93, qualityScore: 4.7, defaultLeadDays: 6 },
  { id: "tsup-gamma", name: "Gamma Sports Inc.", taxId: "US261928374", country: "US", currency: "USD", onTimePct: 86, qualityScore: 4.6, defaultLeadDays: 21 },
  { id: "tsup-court", name: "ТОВ «Court Equip Україна»", taxId: "41277889", country: "UA", currency: "UAH", onTimePct: 94, qualityScore: 4.65, defaultLeadDays: 7 },
  { id: "tsup-antuka", name: "Antuka Pro Sp. z o.o.", taxId: "PL7771234567", country: "PL", currency: "EUR", onTimePct: 90, qualityScore: 4.7, defaultLeadDays: 12 },
  { id: "tsup-beanlab", name: "ТОВ «BeanLab Coffee»", taxId: "42558899", country: "UA", currency: "UAH", onTimePct: 98, qualityScore: 4.9, defaultLeadDays: 2 },
  { id: "tsup-teahouse", name: "ТОВ «TeaHouse»", taxId: "42667788", country: "UA", currency: "UAH", onTimePct: 95, qualityScore: 4.7, defaultLeadDays: 3 },
  { id: "tsup-fresh", name: "ТОВ «FreshDistrib»", taxId: "41998877", country: "UA", currency: "UAH", onTimePct: 92, qualityScore: 4.6, defaultLeadDays: 1 },
  { id: "tsup-cocacola", name: "Coca-Cola Україна", taxId: "20034871", country: "UA", currency: "UAH", onTimePct: 99, qualityScore: 4.9, defaultLeadDays: 2 },
  { id: "tsup-boneaqua", name: "ТОВ «БонАква UA»", taxId: "21998765", country: "UA", currency: "UAH", onTimePct: 99, qualityScore: 4.8, defaultLeadDays: 2 },
  { id: "tsup-sportpit", name: "ТОВ «SportPit Україна»", taxId: "42554433", country: "UA", currency: "UAH", onTimePct: 94, qualityScore: 4.7, defaultLeadDays: 4 },
  { id: "tsup-bake", name: "ТОВ «Bake & Co»", taxId: "42223344", country: "UA", currency: "UAH", onTimePct: 97, qualityScore: 4.6, defaultLeadDays: 1 },
  { id: "tsup-nuts", name: "ТОВ «NutsCo»", taxId: "42111222", country: "UA", currency: "UAH", onTimePct: 95, qualityScore: 4.55, defaultLeadDays: 3 },
];

function supplierIdByName(name: string): string {
  const map: Record<string, string> = {
    "Wilson EU": "tsup-wilson",
    "Head Sport": "tsup-head",
    "Babolat UA": "tsup-babolat",
    "Yonex EU": "tsup-yonex",
    "Prince Distrib": "tsup-prince",
    "Dunlop UA": "tsup-dunlop",
    "Nike UA": "tsup-nike",
    "Adidas UA": "tsup-adidas",
    "ASICS Distrib": "tsup-asics",
    "Gamma Sports": "tsup-gamma",
    "Court Equip UA": "tsup-court",
    "Antuka Pro": "tsup-antuka",
    "BeanLab": "tsup-beanlab",
    "TeaHouse": "tsup-teahouse",
    "FreshDistrib": "tsup-fresh",
    "Coca-Cola UA": "tsup-cocacola",
    "BoneAqua": "tsup-boneaqua",
    "SportPit UA": "tsup-sportpit",
    "Bake&Co": "tsup-bake",
    "NutsCo": "tsup-nuts",
    "internal": "tsup-babolat",
  };
  return map[name] ?? "tsup-babolat";
}

// ───────────────────────── Demo clients (для B2B + sales) ─────────────────────────

const DEMO_TENNIS_CLIENTS = [
  { id: "tcli-1", name: "Іваненко Сергій" },
  { id: "tcli-2", name: "Кравчук Юлія" },
  { id: "tcli-3", name: "Петренко Олег" },
  { id: "tcli-4", name: "Шевченко Анна" },
  { id: "tcli-5", name: "Лисенко Олексій" },
  { id: "tcli-6", name: "Бондар Михайло" },
  { id: "tcli-7", name: "Romanov Mark (Roof Top Hotel)" },
  { id: "tcli-8", name: "ТОВ «КиївБудIT» — корп. кубок" },
  { id: "tcli-9", name: "Tennis Academy KYIV (юніори)" },
  { id: "tcli-10", name: "Гордієнко Наталія" },
];

const CABINET_ID = "demo-tennis-3";

function num(n: number, padding = 3): string {
  return String(n).padStart(padding, "0");
}

function pickClient(i: number) {
  return DEMO_TENNIS_CLIENTS[i % DEMO_TENNIS_CLIENTS.length];
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
  const createdAt = `${dateIso}T${10 + (i % 11)}:${String(15 + (i % 4) * 10).padStart(2, "0")}:00`;
  const lines = productIds.map((p, idx) => {
    const prod = TENNIS_PRODUCTS.find((x) => x.id === p.id)!;
    const qty = opts.isReturn ? -Math.abs(p.qty) : p.qty;
    const discount = p.discountPct ?? 0;
    return {
      id: `line-ts-${i}-${idx}`,
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
    (s, l) => s + (l.price - (l.costBasis ?? l.price * 0.6)) * l.qty,
    0,
  );
  return {
    id: `tso-${num(i)}`,
    cabinetId: CABINET_ID,
    direction: "sale",
    number: `TSO-2026-${num(i)}`,
    counterpartyId: client.id,
    counterpartyName: client.name,
    currency: "UAH",
    fxRate: 1,
    status: "closed",
    channel,
    lines,
    totals: { subtotal, discount: discountSum, tax: 0, total, margin },
    linkedBookingId: opts.linkedBookingId,
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
  const sup = TENNIS_SUPPLIERS.find((s) => s.id === supplierId)!;
  const dateIso = getDateInPast(daysAgo);
  const currency = opts.currency ?? sup.currency;
  const fxRate = currency === "USD" ? 41.5 : currency === "EUR" ? 44.2 : 1;
  const lns = lines.map((p, idx) => {
    const prod = TENNIS_PRODUCTS.find((x) => x.id === p.id)!;
    const unitCost = p.unitCost ?? prod.baseCost / fxRate;
    return {
      id: `line-tp-${i}-${idx}`,
      productId: prod.id,
      productName: prod.name,
      qty: p.qty,
      price: Math.round(unitCost * 100) / 100,
      discount: 0,
      isReturn: false,
      fulfilled:
        opts.status === "partial" ? Math.floor(p.qty * 0.6) :
        opts.status === "confirmed" ? 0 : p.qty,
      costBasis: unitCost,
    };
  });
  const subtotal = lns.reduce((s, l) => s + l.price * l.qty, 0);
  const expectedDate = opts.expectedAhead
    ? getDateInPast(-opts.expectedAhead)
    : getDateInPast(daysAgo - sup.defaultLeadDays);
  const status = opts.status ?? "fulfilled";
  return {
    id: `tpo-${num(i)}`,
    cabinetId: CABINET_ID,
    direction: "purchase",
    number: `TPO-2026-${num(i)}`,
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
    closedAt:
      status === "closed" || status === "fulfilled" || status === "paid"
        ? `${getDateInPast(Math.max(0, daysAgo - sup.defaultLeadDays))}T15:00:00`
        : undefined,
    notes: opts.landed ? `Landed cost ${opts.landed} ${currency}` : undefined,
  };
}

// ───────────────────────── Sales (90 днів) ─────────────────────────

function generateSales(): Order[] {
  const out: Order[] = [];
  let i = 1;

  // Pro Shop роздріб через ПРРО: ~1–2 продажі/день
  const shopPool = [
    ["ts-b2"], ["ts-ac1"], ["ts-b4"], ["ts-ac3"], ["ts-s2"],
    ["ts-b1"], ["ts-ap8"], ["ts-ap1"], ["ts-ac2"], ["ts-bg3"],
    ["ts-r5"], ["ts-sh3"], ["ts-ap6"], ["ts-ap7"], ["ts-ac6"],
  ];
  for (let d = 90; d >= 0; d--) {
    if (d % 7 === 1) continue; // понеділок — клуб закритий
    const perDay = d < 30 ? 2 : 1;
    for (let k = 0; k < perDay; k++) {
      const ids = shopPool[i % shopPool.length].map((id) => ({
        id,
        qty: 1,
        discountPct: i % 14 === 0 ? 10 : undefined,
      }));
      const channel: OrderChannel = d % 6 === 0 ? "upsell_visit" : "retail_prro";
      out.push(
        makeSale(i++, d, channel, ids, channel === "upsell_visit" ? { linkedBookingId: `tb-demo-${d}` } : {}),
      );
    }
  }

  // Кафе — швидкі чеки на ПРРО кафе (моделюємо суміжний потік)
  const cafePool = [
    ["tc-c2", "tc-sn1"], ["tc-c3"], ["tc-d2"], ["tc-d3"], ["tc-c4", "tc-sn3"],
    ["tc-sp1"], ["tc-sp2"], ["tc-d5"], ["tc-fr1"], ["tc-fr4"],
    ["tc-c1"], ["tc-sn5"], ["tc-d1", "tc-sn4"], ["tc-c5"], ["tc-fr3"],
  ];
  for (let d = 90; d >= 0; d--) {
    if (d % 7 === 1) continue;
    const perDay = d < 30 ? 3 : 2;
    for (let k = 0; k < perDay; k++) {
      const ids = cafePool[i % cafePool.length].map((id) => ({ id, qty: 1 }));
      out.push(makeSale(i++, d, "retail_prro", ids));
    }
  }

  // B2B / корпоративні замовлення
  out.push(makeSale(i++, 38, "b2b", [{ id: "ts-r5", qty: 6 }, { id: "ts-b1", qty: 24 }]));
  out.push(makeSale(i++, 22, "b2b", [{ id: "ts-ap3", qty: 18 }, { id: "ts-ap6", qty: 18 }]));
  out.push(makeSale(i++, 14, "b2b", [{ id: "ts-b2", qty: 96 }, { id: "ts-ac1", qty: 30 }]));
  out.push(makeSale(i++, 6, "online", [{ id: "ts-r3", qty: 1 }, { id: "ts-s2", qty: 2 }]));
  // 2 returns
  out.push(makeSale(i++, 17, "retail_prro", [{ id: "ts-sh1", qty: 1 }], { isReturn: true }));
  out.push(makeSale(i++, 42, "retail_prro", [{ id: "ts-ap5", qty: 1 }], { isReturn: true }));

  return out;
}

// ───────────────────────── Purchases ─────────────────────────

function generatePurchases(): Order[] {
  const out: Order[] = [];
  let i = 1;

  // Великі імпортні замовлення EU/US (Wilson, Head, Yonex, Gamma)
  out.push(makePurchase(i++, 78, "tsup-wilson", [{ id: "ts-r1", qty: 8 }, { id: "ts-r2", qty: 6 }, { id: "ts-s1", qty: 30 }], { currency: "EUR", landed: 320 }));
  out.push(makePurchase(i++, 70, "tsup-head", [{ id: "ts-r3", qty: 8 }, { id: "ts-r4", qty: 4 }, { id: "ts-s4", qty: 24 }], { currency: "EUR", landed: 280 }));
  out.push(makePurchase(i++, 62, "tsup-babolat", [{ id: "ts-r5", qty: 10 }, { id: "ts-r6", qty: 12 }, { id: "ts-s3", qty: 30 }]));
  out.push(makePurchase(i++, 55, "tsup-nike", [{ id: "ts-sh1", qty: 8 }, { id: "ts-sh2", qty: 6 }, { id: "ts-ap1", qty: 24 }]));
  out.push(makePurchase(i++, 48, "tsup-asics", [{ id: "ts-sh3", qty: 8 }, { id: "ts-sh4", qty: 6 }]));
  out.push(makePurchase(i++, 45, "tsup-yonex", [{ id: "ts-r7", qty: 4 }, { id: "ts-s6", qty: 18 }], { currency: "EUR", landed: 180 }));
  out.push(makePurchase(i++, 40, "tsup-adidas", [{ id: "ts-ap3", qty: 20 }, { id: "ts-ap4", qty: 15 }, { id: "ts-sh5", qty: 6 }]));
  out.push(makePurchase(i++, 36, "tsup-dunlop", [{ id: "ts-b4", qty: 144 }]));
  out.push(makePurchase(i++, 32, "tsup-court", [{ id: "ts-ex2", qty: 2 }, { id: "ts-ex3", qty: 10 }, { id: "ts-ac5", qty: 4 }]));
  out.push(makePurchase(i++, 28, "tsup-antuka", [{ id: "ts-ex1", qty: 3 }], { currency: "EUR", landed: 220 }));
  out.push(makePurchase(i++, 24, "tsup-gamma", [{ id: "ts-ac4", qty: 6 }], { currency: "USD", landed: 95 }));

  // Кафе: регулярні щотижневі закупки
  out.push(makePurchase(i++, 21, "tsup-beanlab", [{ id: "tc-c1", qty: 200 }, { id: "tc-c2", qty: 200 }, { id: "tc-c3", qty: 200 }]));
  out.push(makePurchase(i++, 14, "tsup-fresh", [{ id: "tc-d1", qty: 60 }, { id: "tc-d2", qty: 80 }, { id: "tc-fr1", qty: 40 }, { id: "tc-fr4", qty: 24 }]));
  out.push(makePurchase(i++, 12, "tsup-bake", [{ id: "tc-sn1", qty: 60 }, { id: "tc-sn2", qty: 30 }, { id: "tc-fr2", qty: 24 }]));
  out.push(makePurchase(i++, 10, "tsup-sportpit", [{ id: "tc-sp1", qty: 60 }, { id: "tc-sp2", qty: 36 }, { id: "tc-sp4", qty: 80 }]));
  out.push(makePurchase(i++, 9, "tsup-cocacola", [{ id: "tc-d4", qty: 120 }, { id: "tc-d5", qty: 96 }]));
  out.push(makePurchase(i++, 7, "tsup-boneaqua", [{ id: "tc-d3", qty: 240 }]));
  out.push(makePurchase(i++, 6, "tsup-nuts", [{ id: "tc-sn5", qty: 40 }, { id: "tc-sn6", qty: 36 }]));
  out.push(makePurchase(i++, 3, "tsup-bake", [{ id: "tc-sn1", qty: 60 }, { id: "tc-fr1", qty: 30 }]));

  // Partial поставка (60%)
  out.push(makePurchase(i++, 18, "tsup-prince", [{ id: "ts-r8", qty: 10 }], { currency: "EUR", status: "partial", landed: 110 }));

  // Overdue
  out.push({
    ...makePurchase(i++, 14, "tsup-yonex", [{ id: "ts-r7", qty: 4 }], { currency: "EUR" }),
    status: "confirmed",
    expectedAt: getDateInPast(3),
  });

  // In-progress
  out.push(makePurchase(i++, 4, "tsup-babolat", [{ id: "ts-r5", qty: 10 }], { status: "confirmed", expectedAhead: 3 }));
  out.push(makePurchase(i++, 2, "tsup-wilson", [{ id: "ts-s2", qty: 30 }], { currency: "EUR", status: "confirmed", expectedAhead: 9 }));

  // Draft
  out.push({
    ...makePurchase(i++, 1, "tsup-head", [{ id: "ts-s4", qty: 24 }], { currency: "EUR", status: "draft" }),
    confirmedAt: undefined,
    closedAt: undefined,
  });

  return out;
}

function generateFulfillments(orders: Order[]): Fulfillment[] {
  const out: Fulfillment[] = [];
  let i = 1;
  for (const o of orders) {
    if (o.direction !== "purchase") continue;
    if (o.status === "draft" || o.status === "confirmed") continue;
    const isPartial = o.status === "partial";
    out.push({
      id: `tful-${num(i++)}`,
      orderId: o.id,
      kind: "receipt",
      date: o.closedAt?.slice(0, 10) ?? o.createdAt.slice(0, 10),
      lines: o.lines.map((l) => ({
        lineId: l.id,
        qty: isPartial ? Math.floor(l.qty * 0.6) : l.qty,
        discrepancy: isPartial ? l.qty - Math.floor(l.qty * 0.6) : 0,
      })),
      landedCosts: o.notes?.includes("Landed")
        ? [{ type: "freight", amount: 120, currency: o.currency, note: "Доставка / митні" }]
        : undefined,
      discrepancyNote: isPartial ? "Часткова поставка: бекордер на залишок." : undefined,
    });
  }
  return out;
}

// ───────────────────────── Exports ─────────────────────────

export const tennisSalesOrders: Order[] = generateSales();
export const tennisPurchaseOrders: Order[] = generatePurchases();
export const tennisAllOrders: Order[] = [...tennisSalesOrders, ...tennisPurchaseOrders];
export const tennisFulfillments: Fulfillment[] = generateFulfillments(tennisAllOrders);
