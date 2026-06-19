/**
 * useCabinetCashPosition — ЄДИНИЙ агрегатор «залишку коштів» кабінету.
 *
 * Wave 1: окрім totals додає Book / Available / Pending, реальні flows із ledger
 * (`useCabinetCashFlows`), реальний 30-day rolling delta, runway по 90-day avg burn,
 * stale-flag (>24 год без синку) і прив'язку FX до зафіксованого `asOf` НБУ.
 *
 * Будь-який екран, що показує «Net Cash», має брати дані звідси.
 */

import { useMemo } from "react";
import { differenceInHours } from "date-fns";
import type { Cabinet } from "@/types/cabinet";
import {
  usePaymentsAccountsBalance,
  type BankAccountSnapshot,
  type AccountCurrency,
} from "./usePaymentsAccountsBalance";
import { usePrroCashboxes, type PrroCashbox } from "./usePrroCashboxes";
import { useCabinetCashFlows, type CabinetCashFlows } from "./useCabinetCashFlows";
import { useFinanceFxRates, type FinanceFxRatesSnapshot } from "@/lib/finance/financeFxRates";

const STALE_HOURS = 24;

export interface CashPositionBreakdownSlice {
  id: "bank_uah" | "bank_fx" | "cash_prro";
  label: string;
  amountUah: number;
}

export interface CashPositionSource {
  id: "rest_banking" | "prro_z_report";
  label: string;
  itemsCount: number;
}

export interface CabinetCashPosition {
  /** Book balance — посаджений залишок (банки + готівка) у ₴. */
  totalUah: number;
  /** Available — book − pending (доступно прямо зараз). */
  availableUah: number;
  /** Pending — надіслані в банк, ще не списані. */
  pendingOutUah: number;
  /** Очікувані надходження (підтверджені, але ще не зайшли). */
  pendingInUah: number;
  /** Δ за 7 / 30 днів у ₴ (із реального ledger). */
  delta7dUah: number;
  delta30dUah: number;
  /** Sparkline сукупного балансу за 14 днів у ₴ (банк-only). */
  sparklineUah: number[];
  breakdown: CashPositionBreakdownSlice[];
  sources: CashPositionSource[];
  /** ISO станом на (timestamp найсвіжішого синку). */
  asOf: string;
  /** Чи є хоча б один рахунок stale (>24h без синку). */
  hasStaleAccounts: boolean;
  /** Кількість stale-рахунків. */
  staleAccountsCount: number;
  bankAccounts: BankAccountSnapshot[];
  prroCashboxes: PrroCashbox[];
  /** Реальні flows із ledger (для KPI-стрічки та cockpit). */
  flows: CabinetCashFlows;
  /** Курси НБУ із зафіксованим asOf — для UI-чіпа. */
  fx: FinanceFxRatesSnapshot;
  /** Backward-compat: rates як простий мап. */
  fxRates: Record<AccountCurrency, number>;
}

export function useCabinetCashPosition(cabinet: Cabinet): CabinetCashPosition {
  const { accounts: bankAccounts } = usePaymentsAccountsBalance(cabinet);
  const prroCashboxes = usePrroCashboxes(cabinet);
  const flows = useCabinetCashFlows(cabinet);
  const fx = useFinanceFxRates();

  return useMemo(() => {
    // 1. Розбивка book-балансу
    let bankUah = 0;
    let bankFxUah = 0;
    let availableUah = 0;
    let pendingOutUah = 0;
    for (const a of bankAccounts) {
      const rate = fx.rates[a.currency];
      const uah = a.balance * rate;
      if (a.currency === "UAH") bankUah += uah;
      else bankFxUah += uah;
      availableUah += a.availableBalance * rate;
      pendingOutUah += a.pendingOut * rate;
    }
    const cashUah = prroCashboxes.reduce((s, c) => s + c.cashBalance, 0);
    availableUah += cashUah; // готівка завжди available

    const breakdown: CashPositionBreakdownSlice[] = (
      [
        { id: "bank_uah", label: "Банк ₴", amountUah: Math.round(bankUah) },
        { id: "bank_fx", label: "Валютні", amountUah: Math.round(bankFxUah) },
        { id: "cash_prro", label: "Готівка ПРРО", amountUah: Math.round(cashUah) },
      ] as CashPositionBreakdownSlice[]
    ).filter((s) => s.amountUah > 0);

    const totalUah = Math.round(bankUah + bankFxUah + cashUah);

    // 2. Sparkline (банк-only) — лишається із account.sparkline, але вже не для Δ
    const sparklineLen = bankAccounts[0]?.sparkline.length ?? 14;
    const sparklineUah: number[] = new Array(sparklineLen).fill(0);
    for (const a of bankAccounts) {
      const rate = fx.rates[a.currency];
      for (let i = 0; i < sparklineLen; i++) {
        sparklineUah[i] += (a.sparkline[i] ?? 0) * rate;
      }
    }
    for (let i = 0; i < sparklineLen; i++) sparklineUah[i] = Math.round(sparklineUah[i]);

    // 3. Δ — із РЕАЛЬНИХ flows (не sparkline-дельти)
    const delta7dUah = flows.delta7d;
    const delta30dUah = flows.delta30d;

    // 4. Джерела
    const sources: CashPositionSource[] = [];
    if (bankAccounts.length > 0) {
      sources.push({ id: "rest_banking", label: "REST-банкінг", itemsCount: bankAccounts.length });
    }
    if (prroCashboxes.length > 0) {
      sources.push({ id: "prro_z_report", label: "Z-звіт ПРРО", itemsCount: prroCashboxes.length });
    }

    // 5. asOf + stale
    const asOf = bankAccounts.reduce<string>(
      (latest, a) => (a.syncedAt > latest ? a.syncedAt : latest),
      bankAccounts[0]?.syncedAt ?? new Date().toISOString(),
    );
    const now = new Date();
    let staleAccountsCount = 0;
    for (const a of bankAccounts) {
      if (differenceInHours(now, new Date(a.syncedAt)) >= STALE_HOURS) staleAccountsCount += 1;
    }

    return {
      totalUah,
      availableUah: Math.round(availableUah),
      pendingOutUah: Math.round(pendingOutUah),
      pendingInUah: flows.pendingIn,
      delta7dUah,
      delta30dUah,
      sparklineUah,
      breakdown,
      sources,
      asOf,
      hasStaleAccounts: staleAccountsCount > 0,
      staleAccountsCount,
      bankAccounts,
      prroCashboxes,
      flows,
      fx,
      fxRates: fx.rates,
    };
  }, [bankAccounts, prroCashboxes, flows, fx]);
}
