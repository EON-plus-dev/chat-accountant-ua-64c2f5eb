/**
 * Мок-агрегатор готівкових кас (ПРРО) для розділу «Фінанси».
 *
 * Гейтиться capability `retail_prro` — кабінети без неї отримують порожній масив,
 * і блок «Каси / Готівка» у FinancePage не рендериться.
 *
 * Wave 3 → замінити на реальні дані з Z-звітів ПРРО.
 */

import { useMemo } from "react";
import type { Cabinet } from "@/types/cabinet";
import { hasCapability } from "@/config/cabinetCapabilities";
import { getVerticalId } from "@/core";

export interface PrroCashbox {
  id: string;
  name: string;
  /** Фіскальний номер ПРРО. */
  fiscalNumber: string;
  /** Поточний оператор зміни (для UI). */
  operator: string;
  /** Залишок готівки в касі, ₴. */
  cashBalance: number;
  /** Виторг поточної зміни (з моменту останнього Z), ₴. */
  dayRevenue: number;
  /** Кількість фіскальних чеків зміни. */
  receiptsCount: number;
  /** Час останнього закритого Z-звіту (ISO) або null, якщо зміна відкрита. */
  zReportClosedAt: string | null;
  /** Онлайн/офлайн. */
  online: boolean;
}

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

const NAME_POOL = [
  { name: "Магазин Хрещатик", op: "Бондаренко О.І." },
  { name: "ТРЦ Lavina", op: "Кравченко М.С." },
  { name: "Точка Поділ", op: "Литвиненко А.В." },
];

const TENNIS_CASHBOXES: { name: string; op: string }[] = [
  { name: "Pro Shop", op: "Адміністратор зміни" },
  { name: "Кафе Net Point", op: "Бариста зміни" },
];

const RESTAURANT_CASHBOXES: { name: string; op: string }[] = [
  { name: "Зал", op: "Хост-менеджер" },
  { name: "Кухня / Доставка", op: "Адміністратор кухні" },
];

const HOTEL_CASHBOXES: { name: string; op: string }[] = [
  { name: "Reception", op: "Адміністратор ресепшн" },
];

export function usePrroCashboxes(cabinet: Cabinet): PrroCashbox[] {
  return useMemo(() => {
    if (!hasCapability(cabinet, "retail_prro")) return [];

    const seed = hashSeed(cabinet.id);
    const verticalId = getVerticalId(cabinet);

    // Tennis club: 2 фіксовані каси з прозорими назвами магазину/кафе.
    if (verticalId === "tennis_club") {
      return TENNIS_CASHBOXES.map((meta, i) => {
        const cashBalance = 5_000 + ((seed + i * 17) % 12_000);
        const dayRevenue = (i === 0 ? 14_000 : 9_000) + ((seed + i * 41) % 22_000);
        const receiptsCount = (i === 0 ? 8 : 30) + ((seed + i * 5) % 60);
        const isOpen = ((seed + i) % 5) !== 0;
        return {
          id: `${cabinet.id}-prro-${i + 1}`,
          name: i === 0 ? `Каса №1 «${meta.name}»` : `Каса №2 «${meta.name}»`,
          fiscalNumber: `400055${(2000 + ((seed + i * 113) % 7999)).toString().padStart(4, "0")}`,
          operator: meta.op,
          cashBalance,
          dayRevenue,
          receiptsCount,
          zReportClosedAt: isOpen
            ? null
            : new Date(Date.now() - (3 + (i % 5)) * 3600_000).toISOString(),
          online: ((seed + i * 5) % 10) !== 0,
        } satisfies PrroCashbox;
      });
    }

    // Restaurant: 2 каси — Зал і Кухня/Доставка.
    if (verticalId === "restaurant") {
      return RESTAURANT_CASHBOXES.map((meta, i) => {
        const cashBalance = 6_000 + ((seed + i * 19) % 14_000);
        const dayRevenue = (i === 0 ? 22_000 : 16_000) + ((seed + i * 43) % 28_000);
        const receiptsCount = (i === 0 ? 42 : 28) + ((seed + i * 7) % 70);
        const isOpen = ((seed + i) % 5) !== 0;
        return {
          id: `${cabinet.id}-prro-${i + 1}`,
          name: `Каса №${i + 1} «${meta.name}»`,
          fiscalNumber: `400077${(3000 + ((seed + i * 127) % 6999)).toString().padStart(4, "0")}`,
          operator: meta.op,
          cashBalance,
          dayRevenue,
          receiptsCount,
          zReportClosedAt: isOpen
            ? null
            : new Date(Date.now() - (2 + (i % 6)) * 3600_000).toISOString(),
          online: ((seed + i * 5) % 10) !== 0,
        } satisfies PrroCashbox;
      });
    }

    // Hotel: 1 ПРРО «Reception» (проживання + mini-bar + сніданки + SPA + сувеніри).
    if (verticalId === "hotel") {
      return HOTEL_CASHBOXES.map((meta, i) => {
        const cashBalance = 12_000 + ((seed + i * 23) % 18_000);
        const dayRevenue = 38_000 + ((seed + i * 47) % 42_000);
        const receiptsCount = 18 + ((seed + i * 11) % 36);
        const isOpen = ((seed + i) % 6) !== 0;
        return {
          id: `${cabinet.id}-prro-${i + 1}`,
          name: `Каса «${meta.name}»`,
          fiscalNumber: `400099${(4000 + ((seed + i * 131) % 5999)).toString().padStart(4, "0")}`,
          operator: meta.op,
          cashBalance,
          dayRevenue,
          receiptsCount,
          zReportClosedAt: isOpen
            ? null
            : new Date(Date.now() - (3 + (i % 5)) * 3600_000).toISOString(),
          online: true,
        } satisfies PrroCashbox;
      });
    }


    const count = 1 + (seed % 3); // 1–3 каси
    const out: PrroCashbox[] = [];
    for (let i = 0; i < count; i++) {
      const meta = NAME_POOL[i % NAME_POOL.length];
      const cashBalance = 4_000 + ((seed + i * 13) % 12_000);
      const dayRevenue = 8_000 + ((seed + i * 31) % 40_000);
      const receiptsCount = 12 + ((seed + i * 7) % 80);
      const isOpen = ((seed + i) % 4) !== 0; // 75% змін відкриті
      const zReportClosedAt = isOpen
        ? null
        : new Date(Date.now() - (4 + (i % 6)) * 3600_000).toISOString();
      out.push({
        id: `${cabinet.id}-prro-${i + 1}`,
        name: `Каса №${i + 1} «${meta.name}»`,
        fiscalNumber: `400012${(3000 + ((seed + i * 97) % 6999)).toString().padStart(4, "0")}`,
        operator: meta.op,
        cashBalance,
        dayRevenue,
        receiptsCount,
        zReportClosedAt,
        online: ((seed + i * 5) % 10) !== 0, // 90% онлайн
      });
    }
    return out;
  }, [cabinet.id, cabinet.type, cabinet.industry, cabinet.capabilities]);
}
