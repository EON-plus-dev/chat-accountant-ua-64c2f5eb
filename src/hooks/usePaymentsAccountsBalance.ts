/**
 * Поточний баланс банківських рахунків кабінету (мок-агрегатор).
 *
 * Wave 1: розширено до 3 видів балансу (Book / Available / Pending) і окремих полів
 * `iban` + `bic` (для не-IBAN валютних рахунків Wise/Revolut).
 *
 * Wave 3 → замінити на реальні дані з `useCabinetBankAccounts` коли з'явиться.
 */

import { useMemo } from "react";
import type { Cabinet } from "@/types/cabinet";
import { FINANCE_FX_RATES } from "@/lib/finance/financeFxRates";

export type AccountCurrency = "UAH" | "USD" | "EUR";

export interface BankAccountSnapshot {
  id: string;
  bankShort: string;
  /** IBAN у форматі UA+27 (порожньо для non-SEPA рахунків). */
  iban: string;
  /** BIC/SWIFT для іноземних рахунків (Wise, Revolut). Опційно. */
  bic?: string;
  /**
   * Book balance — посаджений залишок у банку (з урахуванням усіх completed-операцій).
   * Це число, яке банк показує у виписці на сьогодні.
   */
  balance: number;
  /**
   * Available balance — book − pending out + pending in.
   * Це число, яким реально можна оперувати «прямо зараз».
   * (У реальній інтеграції — отримуємо напряму з банку, тут — деривуємо.)
   */
  availableBalance: number;
  /** Сума pending-out (платежі надіслані в банк, ще не списані). У валюті рахунку. */
  pendingOut: number;
  currency: AccountCurrency;
  /** ISO. */
  syncedAt: string;
  /** Останні 14 значень балансу (для sparkline). */
  sparkline: number[];
  /**
   * Inflow/outflow за 7д у валюті рахунку.
   * Wave 1: для UAH-рахунків ці значення мають бути перезаписані реальними flows
   * з `useCabinetCashFlows` у hero/list — тут лишається мок як fallback,
   * щоб картка не була порожньою для бекап-сценаріїв.
   */
  inflow7d: number;
  outflow7d: number;
  /** Δ балансу за 7 днів у валюті рахунку. */
  delta7d: number;
  /** Кількість операцій за 7 днів (банк-овий counter, не з ledger). */
  txCount7d: number;
}

export interface PaymentsAccountsBalance {
  totalUah: number;
  accountsCount: number;
  accounts: BankAccountSnapshot[];
}

// Стабільний хеш id → seed
function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Mulberry32 — детерміністичний PRNG
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSparkline(currentBalance: number, seed: number): number[] {
  const rng = makeRng(seed);
  const points: number[] = [];
  let v = currentBalance * (0.85 + rng() * 0.15); // 14 днів тому
  for (let i = 0; i < 14; i++) {
    const drift = (rng() - 0.45) * currentBalance * 0.04;
    v = Math.max(0, v + drift);
    points.push(Math.round(v));
  }
  // Останнє значення = поточному балансу
  points[points.length - 1] = currentBalance;
  return points;
}

interface BuildArgs {
  id: string;
  bankShort: string;
  iban: string;
  bic?: string;
  balance: number;
  currency: AccountCurrency;
  seed: number;
  minutesAgoMax: number;
  /** Якщо true — змусити рахунок мати свіжий sync (для основних UAH). */
  forceFresh?: boolean;
}

function buildAccountSnapshot(args: BuildArgs): BankAccountSnapshot {
  const { id, bankShort, iban, bic, balance, currency, seed, minutesAgoMax, forceFresh } = args;
  const rng = makeRng(seed);
  const sparkline = buildSparkline(balance, seed);
  const balance7dAgo = sparkline[sparkline.length - 8] ?? balance;
  const delta7d = balance - balance7dAgo;

  const gross = Math.round(balance * (0.4 + rng() * 0.4));
  const inflow7d = Math.round(gross / 2 + delta7d / 2);
  const outflow7d = Math.round(gross / 2 - delta7d / 2);

  const txCount7d = 4 + Math.floor(rng() * 14);
  // Stale-симуляція: ~20% рахунків мають syncedAt > 24 год для UI-warning,
  // окрім тих, що forceFresh (основні робочі рахунки).
  const isStale = !forceFresh && rng() < 0.2;
  const minutesAgo = isStale
    ? 24 * 60 + Math.floor(rng() * 36 * 60) // 24–60 год тому
    : 1 + Math.floor(rng() * minutesAgoMax);
  const syncedAt = new Date(Date.now() - minutesAgo * 60_000).toISOString();

  // Pending-out: 0–10% від балансу (надіслано в банк, ще не списано)
  const pendingOut = Math.round(balance * rng() * 0.1);
  const availableBalance = Math.max(0, balance - pendingOut);

  return {
    id,
    bankShort,
    iban,
    bic,
    balance,
    availableBalance,
    pendingOut,
    currency,
    syncedAt,
    sparkline,
    inflow7d: Math.max(0, inflow7d),
    outflow7d: Math.max(0, outflow7d),
    delta7d,
    txCount7d,
  };
}

export function usePaymentsAccountsBalance(cabinet: Cabinet): PaymentsAccountsBalance {
  return useMemo(() => {
    const seed = hashSeed(cabinet.id);
    const isFop = cabinet.type === "fop";
    const isIndividual = cabinet.type === "individual";

    const mainBalance = 60_000 + (seed % 80_000);
    const accounts: BankAccountSnapshot[] = [
      buildAccountSnapshot({
        id: `${cabinet.id}-main`,
        bankShort: "ПриватБанк",
        iban: "UA213223130000026007233566001",
        balance: mainBalance,
        currency: "UAH",
        seed,
        minutesAgoMax: 45,
        forceFresh: true,
      }),
    ];

    if (isFop) {
      accounts.push(
        buildAccountSnapshot({
          id: `${cabinet.id}-fop`,
          bankShort: "Sense",
          iban: "UA903052992990004149123456789",
          balance: 12_000 + (seed % 25_000),
          currency: "UAH",
          seed: seed ^ 0x9e3779b9,
          minutesAgoMax: 90,
        }),
      );

      if (seed % 3 !== 0) {
        accounts.push(
          buildAccountSnapshot({
            id: `${cabinet.id}-usd`,
            bankShort: "Wise",
            iban: "",
            bic: "TRWIBEB1XXX",
            balance: 800 + (seed % 1500),
            currency: "USD",
            seed: seed ^ 0x517cc1b7,
            minutesAgoMax: 360,
          }),
        );
      }
    }

    if (cabinet.type === "tov") {
      accounts.push(
        buildAccountSnapshot({
          id: `${cabinet.id}-tov-uah2`,
          bankShort: "Укрсиббанк",
          iban: "UA653510050000026004290123456",
          balance: 40_000 + (seed % 120_000),
          currency: "UAH",
          seed: seed ^ 0x7f4a7c15,
          minutesAgoMax: 75,
        }),
      );
      if (seed % 2 === 0) {
        accounts.push(
          buildAccountSnapshot({
            id: `${cabinet.id}-tov-eur`,
            bankShort: "Райффайзен",
            iban: "UA743003460000026008330123456",
            balance: 500 + (seed % 4500),
            currency: "EUR",
            seed: seed ^ 0xb5297a4d,
            minutesAgoMax: 240,
          }),
        );
      }
    }

    if (isIndividual) {
      accounts.push(
        buildAccountSnapshot({
          id: `${cabinet.id}-ind-2`,
          bankShort: "monobank",
          iban: "UA773220010000026201340123456",
          balance: 5_000 + (seed % 35_000),
          currency: "UAH",
          seed: seed ^ 0x6c8e9cf5,
          minutesAgoMax: 30,
        }),
      );
    }

    const totalUah = accounts.reduce((s, a) => s + a.balance * FINANCE_FX_RATES[a.currency], 0);

    return {
      totalUah: Math.round(totalUah),
      accountsCount: accounts.length,
      accounts,
    };
  }, [cabinet.id, cabinet.type]);
}
