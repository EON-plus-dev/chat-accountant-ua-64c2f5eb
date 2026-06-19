/**
 * Демо-генератор «відкритого рахунку» для Pay-by-Table.
 * Pure-функції — без store, без бекенду. Детермінований seed від tableId,
 * щоб той самий столик завжди показував той самий tab упродовж сесії.
 */

import { restaurantMenu, restaurantTables, type MenuItem } from "@/config/demoCabinets/restaurantData";

export interface OpenTabLine {
  key: string;
  item: MenuItem;
  qty: number;
  /** Хто з гостей замовив (для split-by-guest, simplified). */
  guest?: number;
  /** Помітка про модифікатор (для UI лише). */
  note?: string;
}

export interface OpenTab {
  tableNumber: number;
  tableId: string;
  tableName: string;
  zone: "hall" | "terrace" | "vip";
  guests: number;
  /** Коли офіціант відкрив рахунок. */
  openedAt: string;
  waiterName: string;
  lines: OpenTabLine[];
}

/** Простий seeded RNG (mulberry32). */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const WAITERS = ["Олена", "Андрій", "Марʼяна", "Сергій", "Ірина"];

/** 1-based номер столика з його позиції в `restaurantTables`. */
export function getTableNumber(tableId: string): number | null {
  const idx = restaurantTables.findIndex((t) => t.id === tableId);
  return idx < 0 ? null : idx + 1;
}

/** 1-based номер → workstation. */
export function getTableByNumber(n: number) {
  return restaurantTables[n - 1] ?? null;
}

/** Чи має столик відкритий рахунок (демо: 1-25 крім 4, 11, 19, 23). */
export function tableHasOpenTab(n: number): boolean {
  return ![4, 11, 19, 23].includes(n);
}

/** Демо-стан «зайнято/вільно» для picker'а — детермінований за id. */
export function tableIsBusy(tableId: string): boolean {
  const n = getTableNumber(tableId);
  if (n == null) return false;
  return tableHasOpenTab(n);
}

export function getDemoOpenTab(tableNumber: number): OpenTab | null {
  const table = getTableByNumber(tableNumber);
  if (!table) return null;
  if (!tableHasOpenTab(tableNumber)) return null;

  const r = rng(seedFromString(table.id));
  const guests = Math.min(
    table.seats ?? 2,
    2 + Math.floor(r() * Math.max(1, (table.seats ?? 2) - 1)),
  );
  const linesCount = 3 + Math.floor(r() * 5); // 3-7

  // Beverage + main mix
  const drinks = restaurantMenu.filter((m) => ["drinks", "wine", "beer", "cocktails"].includes(m.category));
  const foods = restaurantMenu.filter((m) => ["starters", "soups", "mains", "grill", "pasta", "pizza", "salads", "sides", "desserts"].includes(m.category));

  const lines: OpenTabLine[] = [];
  for (let i = 0; i < linesCount; i++) {
    const pool = i < Math.ceil(linesCount / 2) ? foods : drinks;
    const item = pool[Math.floor(r() * pool.length)];
    if (!item || lines.find((l) => l.item.id === item.id)) {
      i--;
      continue;
    }
    const qty = r() > 0.75 ? 2 : 1;
    lines.push({
      key: `${table.id}-l${i + 1}`,
      item,
      qty,
      guest: 1 + Math.floor(r() * guests),
    });
  }

  // Час відкриття: 30-90 хв тому
  const openedMinutesAgo = 30 + Math.floor(r() * 60);
  const openedAt = new Date(Date.now() - openedMinutesAgo * 60_000).toISOString();
  const waiterName = WAITERS[Math.floor(r() * WAITERS.length)];

  return {
    tableNumber,
    tableId: table.id,
    tableName: table.name,
    zone: (table.zone ?? "hall") as OpenTab["zone"],
    guests,
    openedAt,
    waiterName,
    lines,
  };
}

export interface BillCalc {
  subtotal: number;
  serviceFee: number;
  tip: number;
  total: number;
}

export function calcBill(
  lines: OpenTabLine[],
  selectedKeys: Set<string> | null,
  serviceFeePct: number,
  tipPct: number,
  customTip?: number,
): BillCalc {
  const useLines = selectedKeys
    ? lines.filter((l) => selectedKeys.has(l.key))
    : lines;
  const subtotal = useLines.reduce((s, l) => s + l.item.price * l.qty, 0);
  const serviceFee = Math.round(subtotal * (serviceFeePct / 100));
  const tip = customTip != null && customTip > 0
    ? customTip
    : Math.round((subtotal + serviceFee) * (tipPct / 100));
  return { subtotal, serviceFee, tip, total: subtotal + serviceFee + tip };
}

export const ZONE_LABEL: Record<OpenTab["zone"], string> = {
  hall: "Зал",
  terrace: "Тераса",
  vip: "VIP",
};

export function formatOpenedAgo(iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 60) return `${mins} хв тому`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} год ${m} хв тому` : `${h} год тому`;
}
