/**
 * useConcentrationRisk — % коштів у найбільшому банку.
 *
 * Поріг 50/70/85% → ok/warn/danger.
 * Додатково — попередження по ФГВФО (Фонд гарантування вкладів) ліміт 600 тис ₴ на банк.
 */

import { useMemo } from "react";
import type { CabinetCashPosition } from "./useCabinetCashPosition";

const FGVFO_LIMIT_UAH = 600_000;

export type ConcentrationTone = "ok" | "warn" | "danger";

export interface ConcentrationBucket {
  bankShort: string;
  amountUah: number;
  percent: number;
  /** Перевищення ФГВФО — лише для UAH-сум, грубо. */
  exceedsFgvfo: boolean;
}

export interface ConcentrationRisk {
  buckets: ConcentrationBucket[];
  /** Топ-банк (для headline). */
  topPercent: number;
  topBank: string | null;
  tone: ConcentrationTone;
  /** Кількість банків понад ФГВФО ліміт. */
  exceedFgvfoCount: number;
  totalUah: number;
}

export function useConcentrationRisk(position: CabinetCashPosition): ConcentrationRisk {
  return useMemo(() => {
    const byBank = new Map<string, number>();
    for (const a of position.bankAccounts) {
      const uah = a.balance * (position.fx.rates[a.currency] ?? 1);
      byBank.set(a.bankShort, (byBank.get(a.bankShort) ?? 0) + uah);
    }
    const total = position.totalUah || 1;

    const buckets: ConcentrationBucket[] = [...byBank.entries()]
      .map(([bankShort, amount]) => ({
        bankShort,
        amountUah: Math.round(amount),
        percent: Math.round((amount / total) * 100),
        exceedsFgvfo: amount > FGVFO_LIMIT_UAH,
      }))
      .sort((a, b) => b.amountUah - a.amountUah);

    const top = buckets[0];
    const topPercent = top?.percent ?? 0;
    const tone: ConcentrationTone =
      topPercent >= 85 ? "danger" : topPercent >= 70 ? "warn" : "ok";
    const exceedFgvfoCount = buckets.filter((b) => b.exceedsFgvfo).length;

    return {
      buckets,
      topPercent,
      topBank: top?.bankShort ?? null,
      tone,
      exceedFgvfoCount,
      totalUah: position.totalUah,
    };
  }, [position]);
}
