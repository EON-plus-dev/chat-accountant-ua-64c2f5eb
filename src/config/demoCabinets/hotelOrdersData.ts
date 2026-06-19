/**
 * HOTEL orders demo data (demo-hotel-3).
 * Структура дзеркальна `tennisOrdersData`:
 *   - SO: ~120 продажів через ПРРО Reception (mini-bar + сніданок + SPA + сувеніри)
 *         + 10 B2B корпоративних пакетів (відрядження)
 *         + 4 return-кейси
 *   - PO: ~20 закупівель (білизна, хімія, mini-bar напої, кава, харчі, текстиль)
 *         з multi-currency опційно (для L'Oréal Mini, Pringles)
 */

import type { Order, Fulfillment, OrderChannel } from "@/modules/orders/types";
import { getDateInPast } from "./helpers";
import { HOTEL_NOMENCLATURE_SEED } from "./nomenclature/hotelNomenclature";

// ───────────────────────── Catalog ─────────────────────────

export interface HotelProduct {
  id: string;
  sku: string;
  name: string;
  group: "minibar" | "breakfast" | "spa" | "supplies" | "souvenirs";
  category: string;
  retailPrice: number;
  baseCost: number;
  defaultSupplierId: string;
  stockQty: number;
  minStock: number;
  unit: string;
}

function supplierIdByName(name: string): string {
  const map: Record<string, string> = {
    "BoneAqua": "hsup-boneaqua",
    "Coca-Cola UA": "hsup-cocacola",
    "Sandora": "hsup-sandora",
    "Red Bull UA": "hsup-redbull",
    "Nestle Waters": "hsup-nestle",
    "Оболонь": "hsup-obolon",
    "Carlsberg UA": "hsup-carlsberg",
    "AB InBev UA": "hsup-abinbev",
    "Bayadera Group": "hsup-bayadera",
    "GG Distribution": "hsup-gg",
    "Mondelez UA": "hsup-mondelez",
    "PepsiCo UA": "hsup-pepsico",
    "NutsCo": "hsup-nuts",
    "FreshDistrib": "hsup-fresh",
    "Бісквіт-Шоколад": "hsup-biscuit",
    "Nestle UA": "hsup-nestleua",
    "Mars UA": "hsup-mars",
    "TeaHouse": "hsup-teahouse",
    "BeanLab": "hsup-beanlab",
    "Bake&Co": "hsup-bake",
    "L'Oréal UA": "hsup-loreal",
    "Ecolab UA": "hsup-ecolab",
    "TextilePro": "hsup-textile",
    "Hotel Laundry": "hsup-laundry",
    "DTEK": "hsup-dtek",
    "internal": "hsup-internal",
  };
  return map[name] ?? "hsup-internal";
}

export const HOTEL_PRODUCTS: HotelProduct[] = HOTEL_NOMENCLATURE_SEED.map((s) => ({
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

export interface HotelSupplier {
  id: string;
  name: string;
  taxId: string;
  country: "UA" | "PL" | "DE" | "FR" | "US";
  currency: "UAH" | "USD" | "EUR";
  onTimePct: number;
  qualityScore: number;
  defaultLeadDays: number;
}

export const HOTEL_SUPPLIERS: HotelSupplier[] = [
  { id: "hsup-boneaqua", name: "ТОВ «БонАква UA»", taxId: "21998765", country: "UA", currency: "UAH", onTimePct: 99, qualityScore: 4.8, defaultLeadDays: 2 },
  { id: "hsup-cocacola", name: "Coca-Cola Україна", taxId: "20034871", country: "UA", currency: "UAH", onTimePct: 99, qualityScore: 4.9, defaultLeadDays: 2 },
  { id: "hsup-sandora", name: "ПрАТ «Сандора»", taxId: "22430081", country: "UA", currency: "UAH", onTimePct: 96, qualityScore: 4.7, defaultLeadDays: 3 },
  { id: "hsup-redbull", name: "ТОВ «Red Bull Україна»", taxId: "41887211", country: "UA", currency: "UAH", onTimePct: 95, qualityScore: 4.8, defaultLeadDays: 4 },
  { id: "hsup-nestle", name: "Nestle Waters Europe", taxId: "FR4123456789", country: "FR", currency: "EUR", onTimePct: 90, qualityScore: 4.7, defaultLeadDays: 12 },
  { id: "hsup-obolon", name: "ПрАТ «Оболонь»", taxId: "05459581", country: "UA", currency: "UAH", onTimePct: 98, qualityScore: 4.7, defaultLeadDays: 2 },
  { id: "hsup-carlsberg", name: "ПрАТ «Carlsberg Ukraine»", taxId: "00377511", country: "UA", currency: "UAH", onTimePct: 96, qualityScore: 4.8, defaultLeadDays: 3 },
  { id: "hsup-abinbev", name: "ТОВ «AB InBev Efes Україна»", taxId: "30965919", country: "UA", currency: "UAH", onTimePct: 95, qualityScore: 4.7, defaultLeadDays: 3 },
  { id: "hsup-bayadera", name: "Bayadera Group", taxId: "31197077", country: "UA", currency: "UAH", onTimePct: 96, qualityScore: 4.8, defaultLeadDays: 3 },
  { id: "hsup-gg", name: "ТОВ «GG Distribution»", taxId: "42441877", country: "UA", currency: "UAH", onTimePct: 94, qualityScore: 4.6, defaultLeadDays: 4 },
  { id: "hsup-mondelez", name: "ТОВ «Mondelez Україна»", taxId: "22945447", country: "UA", currency: "UAH", onTimePct: 97, qualityScore: 4.8, defaultLeadDays: 3 },
  { id: "hsup-pepsico", name: "ТОВ «PepsiCo Україна»", taxId: "30169525", country: "UA", currency: "UAH", onTimePct: 98, qualityScore: 4.8, defaultLeadDays: 2 },
  { id: "hsup-nuts", name: "ТОВ «NutsCo»", taxId: "42111222", country: "UA", currency: "UAH", onTimePct: 95, qualityScore: 4.55, defaultLeadDays: 3 },
  { id: "hsup-fresh", name: "ТОВ «FreshDistrib»", taxId: "41998877", country: "UA", currency: "UAH", onTimePct: 92, qualityScore: 4.6, defaultLeadDays: 1 },
  { id: "hsup-biscuit", name: "ПрАТ «Бісквіт-Шоколад»", taxId: "00377391", country: "UA", currency: "UAH", onTimePct: 96, qualityScore: 4.6, defaultLeadDays: 4 },
  { id: "hsup-nestleua", name: "ТОВ «Nestle Україна»", taxId: "32531437", country: "UA", currency: "UAH", onTimePct: 97, qualityScore: 4.8, defaultLeadDays: 3 },
  { id: "hsup-mars", name: "ТОВ «Mars Україна»", taxId: "22931997", country: "UA", currency: "UAH", onTimePct: 97, qualityScore: 4.85, defaultLeadDays: 3 },
  { id: "hsup-teahouse", name: "ТОВ «TeaHouse»", taxId: "42667788", country: "UA", currency: "UAH", onTimePct: 95, qualityScore: 4.7, defaultLeadDays: 3 },
  { id: "hsup-beanlab", name: "ТОВ «BeanLab Coffee»", taxId: "42558899", country: "UA", currency: "UAH", onTimePct: 98, qualityScore: 4.9, defaultLeadDays: 2 },
  { id: "hsup-bake", name: "ТОВ «Bake & Co»", taxId: "42223344", country: "UA", currency: "UAH", onTimePct: 97, qualityScore: 4.6, defaultLeadDays: 1 },
  { id: "hsup-loreal", name: "ТОВ «L'Oréal Україна»", taxId: "32334655", country: "UA", currency: "UAH", onTimePct: 92, qualityScore: 4.75, defaultLeadDays: 7 },
  { id: "hsup-ecolab", name: "ТОВ «Ecolab UA»", taxId: "41334455", country: "UA", currency: "UAH", onTimePct: 96, qualityScore: 4.7, defaultLeadDays: 5 },
  { id: "hsup-textile", name: "ТОВ «TextilePro Україна»", taxId: "41223344", country: "UA", currency: "UAH", onTimePct: 90, qualityScore: 4.6, defaultLeadDays: 14 },
  { id: "hsup-laundry", name: "ТОВ «Hotel Laundry Service»", taxId: "41887766", country: "UA", currency: "UAH", onTimePct: 96, qualityScore: 4.7, defaultLeadDays: 1 },
  { id: "hsup-dtek", name: "ПрАТ «ДТЕК Київські електромережі»", taxId: "00131305", country: "UA", currency: "UAH", onTimePct: 99, qualityScore: 4.5, defaultLeadDays: 30 },
  { id: "hsup-internal", name: "Внутрішній", taxId: "—", country: "UA", currency: "UAH", onTimePct: 100, qualityScore: 5, defaultLeadDays: 0 },
];

// ───────────────────────── Demo clients ─────────────────────────

const DEMO_HOTEL_CLIENTS = [
  { id: "hcli-1", name: "Іваненко Сергій" },
  { id: "hcli-2", name: "Кравчук Юлія" },
  { id: "hcli-3", name: "Петренко Олег" },
  { id: "hcli-4", name: "Шевченко Анна" },
  { id: "hcli-7", name: "ТОВ «КиївБудIT»" },
  { id: "hcli-9", name: "Smith John (UK)" },
  { id: "hcli-10", name: "Müller Hans (DE)" },
  { id: "hcli-12", name: "Костенко Олег" },
  { id: "hcli-17", name: "ТОВ «Український Експорт»" },
];

const CABINET_ID = "demo-hotel-3";

function num(n: number, padding = 3): string {
  return String(n).padStart(padding, "0");
}

function pickClient(i: number) {
  return DEMO_HOTEL_CLIENTS[i % DEMO_HOTEL_CLIENTS.length];
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
    const prod = HOTEL_PRODUCTS.find((x) => x.id === p.id)!;
    const qty = opts.isReturn ? -Math.abs(p.qty) : p.qty;
    const discount = p.discountPct ?? 0;
    return {
      id: `line-hs-${i}-${idx}`,
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
    id: `hso-${num(i)}`,
    cabinetId: CABINET_ID,
    direction: "sale",
    number: `HSO-2026-${num(i)}`,
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
  const sup = HOTEL_SUPPLIERS.find((s) => s.id === supplierId)!;
  const dateIso = getDateInPast(daysAgo);
  const currency = opts.currency ?? sup.currency;
  const fxRate = currency === "USD" ? 41.5 : currency === "EUR" ? 44.2 : 1;
  const lns = lines.map((p, idx) => {
    const prod = HOTEL_PRODUCTS.find((x) => x.id === p.id)!;
    const unitCost = p.unitCost ?? prod.baseCost / fxRate;
    return {
      id: `line-hp-${i}-${idx}`,
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
    id: `hpo-${num(i)}`,
    cabinetId: CABINET_ID,
    direction: "purchase",
    number: `HPO-2026-${num(i)}`,
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

  // Mini-bar: дрібні чеки 1–2 SKU, ~3/день
  const minibarPool = [
    ["h-mb-w1"], ["h-mb-w3"], ["h-mb-s4"], ["h-mb-d1"], ["h-mb-b1"],
    ["h-mb-a4", "h-mb-s8"], ["h-mb-w1", "h-mb-s2"], ["h-mb-b3", "h-mb-s5"],
    ["h-mb-w11"], ["h-mb-d5"], ["h-mb-a5"], ["h-mb-w7"], ["h-mb-c1"],
    ["h-mb-a1", "h-mb-s7"], ["h-mb-a6"], ["h-mb-s10"], ["h-mb-w13"],
  ];
  for (let d = 90; d >= 0; d--) {
    const perDay = 2 + (d % 3);
    for (let k = 0; k < perDay; k++) {
      const ids = minibarPool[i % minibarPool.length].map((id) => ({ id, qty: 1 }));
      out.push(makeSale(i++, d, "retail_prro", ids));
    }
  }

  // Сніданок à la carte: ~2/день (тих, хто не з пакетом)
  const breakfastPool = [
    ["h-br-h1", "h-br-cf3"], ["h-br-h7", "h-br-j1"], ["h-br-h5", "h-br-cf4"],
    ["h-br-c4", "h-br-t2"], ["h-br-p1", "h-br-cf2"], ["h-br-h10", "h-br-cf1"],
    ["h-br-h2", "h-br-j2"], ["h-br-c6", "h-br-cf5"], ["h-br-h6", "h-br-t3"],
  ];
  for (let d = 60; d >= 0; d--) {
    const perDay = 1 + (d % 2);
    for (let k = 0; k < perDay; k++) {
      const ids = breakfastPool[i % breakfastPool.length].map((id) => ({ id, qty: 1 }));
      out.push(makeSale(i++, d, "retail_prro", ids));
    }
  }

  // SPA / косметика / готельні товари — 1/день, преміум-сегмент
  const supPool = [
    ["h-sp-11"], ["h-sup-1"], ["h-sup-2"], ["h-sp-12"], ["h-sup-15"],
    ["h-sp-14", "h-sp-22"], ["h-sv-1", "h-sv-7"], ["h-sup-13"],
  ];
  for (let d = 45; d >= 0; d--) {
    if (d % 2 !== 0) continue;
    const ids = supPool[i % supPool.length].map((id) => ({ id, qty: 1 }));
    out.push(makeSale(i++, d, "retail_prro", ids));
  }

  // B2B корпоративні пакети
  out.push(makeSale(i++, 40, "b2b", [{ id: "h-sup-15", qty: 10 }, { id: "h-sv-10", qty: 10 }]));
  out.push(makeSale(i++, 25, "b2b", [{ id: "h-sv-11", qty: 8 }]));
  out.push(makeSale(i++, 12, "b2b", [{ id: "h-sup-15", qty: 6 }, { id: "h-sup-12", qty: 6 }]));
  out.push(makeSale(i++, 5, "online", [{ id: "h-sv-13", qty: 2 }]));

  // 4 повернення (брак, незадоволеність)
  out.push(makeSale(i++, 28, "retail_prro", [{ id: "h-sup-1", qty: 1 }], { isReturn: true }));
  out.push(makeSale(i++, 18, "retail_prro", [{ id: "h-sv-15", qty: 1 }], { isReturn: true }));
  out.push(makeSale(i++, 9, "retail_prro", [{ id: "h-sp-11", qty: 1 }], { isReturn: true }));
  out.push(makeSale(i++, 3, "retail_prro", [{ id: "h-sv-9", qty: 1 }], { isReturn: true }));

  return out;
}

// ───────────────────────── Purchases ─────────────────────────

function generatePurchases(): Order[] {
  const out: Order[] = [];
  let i = 1;

  // Поточні закупки (UAH)
  out.push(makePurchase(i++, 60, "hsup-cocacola", [{ id: "h-mb-w3", qty: 240 }, { id: "h-mb-w4", qty: 96 }, { id: "h-mb-w5", qty: 96 }, { id: "h-mb-w6", qty: 96 }]));
  out.push(makePurchase(i++, 55, "hsup-boneaqua", [{ id: "h-mb-w1", qty: 480 }, { id: "h-mb-w2", qty: 360 }]));
  out.push(makePurchase(i++, 48, "hsup-sandora", [{ id: "h-mb-w7", qty: 240 }, { id: "h-mb-w8", qty: 240 }, { id: "h-mb-w9", qty: 144 }]));
  out.push(makePurchase(i++, 42, "hsup-carlsberg", [{ id: "h-mb-b2", qty: 96 }, { id: "h-mb-b4", qty: 72 }]));
  out.push(makePurchase(i++, 40, "hsup-obolon", [{ id: "h-mb-b1", qty: 120 }]));
  out.push(makePurchase(i++, 38, "hsup-abinbev", [{ id: "h-mb-b3", qty: 72 }, { id: "h-mb-b5", qty: 72 }]));
  out.push(makePurchase(i++, 36, "hsup-bayadera", [{ id: "h-mb-a1", qty: 60 }, { id: "h-mb-a2", qty: 60 }, { id: "h-mb-a3", qty: 36 }, { id: "h-sv-9", qty: 24 }]));
  out.push(makePurchase(i++, 32, "hsup-gg", [{ id: "h-mb-a4", qty: 120 }, { id: "h-mb-a5", qty: 72 }, { id: "h-mb-a6", qty: 36 }, { id: "h-mb-a7", qty: 36 }]));
  out.push(makePurchase(i++, 28, "hsup-mondelez", [{ id: "h-mb-s1", qty: 144 }, { id: "h-mb-s2", qty: 96 }, { id: "h-mb-d5", qty: 72 }, { id: "h-mb-d6", qty: 60 }, { id: "h-mb-d8", qty: 72 }]));
  out.push(makePurchase(i++, 25, "hsup-mars", [{ id: "h-mb-d2", qty: 144 }, { id: "h-mb-d3", qty: 96 }, { id: "h-mb-d4", qty: 96 }, { id: "h-mb-d7", qty: 96 }]));
  out.push(makePurchase(i++, 22, "hsup-nuts", [{ id: "h-mb-s4", qty: 144 }, { id: "h-mb-s5", qty: 60 }, { id: "h-mb-s6", qty: 60 }]));
  out.push(makePurchase(i++, 18, "hsup-loreal", [{ id: "h-sp-1", qty: 1000 }, { id: "h-sp-2", qty: 1000 }, { id: "h-sp-3", qty: 1000 }, { id: "h-sp-4", qty: 600 }, { id: "h-sp-11", qty: 36 }]));
  out.push(makePurchase(i++, 15, "hsup-ecolab", [{ id: "h-sp-5", qty: 2400 }, { id: "h-sp-6", qty: 360 }, { id: "h-sp-7", qty: 360 }]));
  out.push(makePurchase(i++, 14, "hsup-textile", [{ id: "h-sup-1", qty: 36 }, { id: "h-sup-2", qty: 100 }, { id: "h-sup-3", qty: 60 }, { id: "h-sup-4", qty: 36 }]));
  out.push(makePurchase(i++, 10, "hsup-beanlab", [{ id: "h-mb-c1", qty: 1200 }, { id: "h-sv-10", qty: 60 }]));
  out.push(makePurchase(i++, 8, "hsup-teahouse", [{ id: "h-mb-c2", qty: 1200 }, { id: "h-mb-c3", qty: 1200 }, { id: "h-mb-c4", qty: 2400 }]));
  out.push(makePurchase(i++, 7, "hsup-fresh", [{ id: "h-br-c3", qty: 240 }, { id: "h-mb-s7", qty: 144 }, { id: "h-mb-s10", qty: 96 }, { id: "h-sv-6", qty: 48 }]));
  out.push(makePurchase(i++, 4, "hsup-bake", [{ id: "h-br-p1", qty: 120 }, { id: "h-br-p2", qty: 60 }, { id: "h-br-p3", qty: 60 }, { id: "h-br-p5", qty: 36 }]));

  // Multi-currency (EUR Perrier через Nestle Waters)
  out.push(makePurchase(i++, 30, "hsup-nestle", [{ id: "h-mb-w13", qty: 96 }, { id: "h-mb-w14", qty: 96 }], { currency: "EUR", landed: 120 }));

  // Partial
  out.push(makePurchase(i++, 12, "hsup-textile", [{ id: "h-sup-3", qty: 30 }], { status: "partial" }));

  // Confirmed / очікується
  out.push(makePurchase(i++, 3, "hsup-loreal", [{ id: "h-sp-11", qty: 24 }, { id: "h-sp-12", qty: 12 }], { status: "confirmed", expectedAhead: 4 }));

  // Draft
  out.push({
    ...makePurchase(i++, 1, "hsup-bayadera", [{ id: "h-mb-a3", qty: 24 }], { status: "draft" }),
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
      id: `hful-${num(i++)}`,
      orderId: o.id,
      kind: "receipt",
      date: o.closedAt?.slice(0, 10) ?? o.createdAt.slice(0, 10),
      lines: o.lines.map((l) => ({
        lineId: l.id,
        qty: isPartial ? Math.floor(l.qty * 0.6) : l.qty,
        discrepancy: isPartial ? l.qty - Math.floor(l.qty * 0.6) : 0,
      })),
      landedCosts: o.notes?.includes("Landed")
        ? [{ type: "freight", amount: 80, currency: o.currency, note: "Доставка / митні" }]
        : undefined,
      discrepancyNote: isPartial ? "Часткова поставка: бекордер на залишок." : undefined,
    });
  }
  return out;
}

export const hotelSalesOrders: Order[] = generateSales();
export const hotelPurchaseOrders: Order[] = generatePurchases();
export const hotelAllOrders: Order[] = [...hotelSalesOrders, ...hotelPurchaseOrders];
export const hotelFulfillments: Fulfillment[] = generateFulfillments(hotelAllOrders);
