/**
 * Warehouse seed — для демо-кабінетів генерує початкові StockMove
 * (receipt з seed-каталогу), плюс кілька списань/інвентаризацій для
 * демонстрації журналу.
 *
 * Тенісний кабінет: 2 локації (loc-shop / loc-cafe), ~80 receipt-руху + 5 списань.
 * Салон: 1 локація (loc-salon), ~13 receipt-руху + 2 списання.
 */

import type { StockMove, StockLocation, WriteOffDoc, InventoryDoc } from "../types";
import { SALON_PRODUCTS } from "@/config/demoCabinets/salonOrdersData";
import { TENNIS_NOMENCLATURE_SEED } from "@/config/demoCabinets/nomenclature/tennisNomenclature";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10 + (days % 8), 15, 0, 0);
  return d.toISOString();
}

export function seedLocationsForCabinet(cabinetId: string): StockLocation[] {
  if (cabinetId === "demo-tennis-3") {
    return [
      { id: "loc-shop", cabinetId, name: "Магазин Pro Shop", kind: "shop", isFiscal: true },
      { id: "loc-cafe", cabinetId, name: "Кафе Net Point", kind: "cafe", isFiscal: true },
    ];
  }
  if (cabinetId === "demo-salon-3") {
    return [
      { id: "loc-salon", cabinetId, name: "Склад салону", kind: "salon" },
    ];
  }
  return [{ id: "loc-default", cabinetId, name: "Основний склад", kind: "backroom" }];
}

export function seedStockMovesForCabinet(cabinetId: string): StockMove[] {
  if (cabinetId === "demo-tennis-3") {
    const out: StockMove[] = [];
    TENNIS_NOMENCLATURE_SEED.forEach((s, i) => {
      // Початковий прихід (60 днів тому): передплата + 70-100% від поточного залишку
      const initial = Math.max(s.stock, s.minStock * 3, s.group === "cafe" ? 40 : 0);
      if (initial > 0) {
        out.push({
          id: `mv-seed-tennis-r-${i}`,
          cabinetId,
          productId: s.id,
          locationId: s.group === "shop" ? "loc-shop" : "loc-cafe",
          qty: initial,
          kind: "receipt",
          costPerUnit: s.cost,
          date: daysAgoIso(60),
          notes: "Початковий прихід",
        });
      }
      // Симуляція продажів за останні 30 днів — частина залишку
      const sold = Math.max(0, Math.floor(initial * 0.25));
      if (sold > 0) {
        const chunks = 3;
        for (let c = 0; c < chunks; c++) {
          const q = Math.floor(sold / chunks) || 1;
          out.push({
            id: `mv-seed-tennis-s-${i}-${c}`,
            cabinetId,
            productId: s.id,
            locationId: s.group === "shop" ? "loc-shop" : "loc-cafe",
            qty: -q,
            kind: "prro_sale",
            costPerUnit: s.cost,
            date: daysAgoIso(25 - c * 8),
          });
        }
      }
    });
    return out;
  }

  if (cabinetId === "demo-salon-3") {
    return SALON_PRODUCTS.map((p, i) => ({
      id: `mv-seed-salon-r-${i}`,
      cabinetId,
      productId: p.id,
      locationId: "loc-salon",
      qty: Math.max(p.stockQty, p.minStock * 3),
      kind: "receipt" as const,
      costPerUnit: p.baseCost,
      date: daysAgoIso(45),
      notes: "Початковий прихід",
    }));
  }

  return [];
}

export function seedWriteOffsForCabinet(cabinetId: string): WriteOffDoc[] {
  if (cabinetId === "demo-tennis-3") {
    return [
      {
        id: "wo-tennis-1",
        cabinetId,
        locationId: "loc-cafe",
        date: daysAgoIso(12),
        number: "СП-2026/001",
        lines: [
          { productId: "tc-sn1", qty: 3, reason: "expired", notes: "Прострочені круасани" },
          { productId: "tc-sn2", qty: 2, reason: "expired" },
        ],
        totalCost: 3 * 22 + 2 * 32,
        expensePosted: true,
        status: "confirmed",
        responsibleName: "Бариста Світлана",
        createdAt: daysAgoIso(12),
      },
      {
        id: "wo-tennis-2",
        cabinetId,
        locationId: "loc-cafe",
        date: daysAgoIso(5),
        number: "СП-2026/002",
        lines: [
          { productId: "tc-c1", qty: 4, reason: "internal_use", notes: "Кава для тренерів" },
        ],
        totalCost: 4 * 65,
        expensePosted: true,
        status: "confirmed",
        responsibleName: "Адміністратор",
        createdAt: daysAgoIso(5),
      },
      {
        id: "wo-tennis-3",
        cabinetId,
        locationId: "loc-shop",
        date: daysAgoIso(8),
        number: "СП-2026/003",
        lines: [
          { productId: "ts-b1", qty: 24, reason: "damage", notes: "Бій м'ячів на грі дітей" },
        ],
        totalCost: 24 * 160,
        expensePosted: true,
        status: "confirmed",
        responsibleName: "Тренер Олег",
        createdAt: daysAgoIso(8),
      },
    ];
  }
  if (cabinetId === "demo-salon-3") {
    return [
      {
        id: "wo-salon-1",
        cabinetId,
        locationId: "loc-salon",
        date: daysAgoIso(7),
        number: "СП-2026/001",
        lines: [{ productId: "p-7", qty: 1, reason: "damage", notes: "Пошкоджена упаковка" }],
        totalCost: 250,
        expensePosted: true,
        status: "confirmed",
        responsibleName: "Адміністратор",
        createdAt: daysAgoIso(7),
      },
    ];
  }
  return [];
}

export function seedInventoriesForCabinet(cabinetId: string): InventoryDoc[] {
  if (cabinetId === "demo-tennis-3") {
    return [
      {
        id: "inv-tennis-1",
        cabinetId,
        locationId: "loc-cafe",
        date: daysAgoIso(30),
        number: "ІНВ-2026/001",
        lines: [
          { productId: "tc-sn5", expectedQty: 30, countedQty: 28, deltaCost: -110 },
          { productId: "tc-c1", expectedQty: 120, countedQty: 118, deltaCost: -130 },
        ],
        status: "confirmed",
        responsibleName: "Адміністратор + бариста",
        notes: "Місячна інвентаризація кафе",
        createdAt: daysAgoIso(30),
      },
    ];
  }
  return [];
}
