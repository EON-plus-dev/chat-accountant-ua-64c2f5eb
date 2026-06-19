/**
 * Cash-flow forecast 30 днів.
 *
 * Алгоритм: starting balance + Σ(in до дати) − Σ(out до дати).
 * На вхід — поточний баланс рахунків, scheduled / expected платежі та шаблони регулярних платежів
 * (з яких породжуємо синтетичні витрати на наступні 90 днів).
 *
 * Повертаємо щоденні точки + перший день з касовим розривом (якщо є).
 */

import { useMemo } from "react";
import { addDays, parseISO, isBefore, format } from "date-fns";
import type { UnifiedPayment } from "@/config/unifiedPaymentsConfig";
import { inferCurrency, toUah } from "@/lib/paymentsCurrency";
import { demoRecurringTemplates, generateOccurrences, type RecurringTemplate } from "@/config/recurringPaymentTemplates";

export interface CashFlowPoint {
  /** ISO date (yyyy-MM-dd). */
  date: string;
  /** Прогнозний баланс на кінець цього дня. */
  balance: number;
  /** Сума всіх надходжень за день (UAH-equiv). */
  inflow: number;
  /** Сума всіх витрат за день (UAH-equiv). */
  outflow: number;
  /** Підпис для tooltip — основна подія дня. */
  primaryEvent?: string;
}

export interface CashFlowForecast {
  points: CashFlowPoint[];
  startingBalance: number;
  endingBalance: number;
  minBalance: number;
  /** Перший день, коли баланс падає нижче нуля. */
  gapDate: string | null;
  gapAmount: number | null;
  /** Найбільше очікуване надходження у горизонті 14 днів — для CashRiskBanner. */
  largestExpectedInflow: {
    payment: UnifiedPayment;
    amount: number;
    date: string;
  } | null;
}

const FORECAST_HORIZON_DAYS = 30;
const RECURRING_HORIZON_DAYS = 90;

const SCHEDULED_OUT_STATUSES = new Set(["scheduled", "created", "sent-to-bank", "not-created", "overdue"]);
const EXPECTED_IN_STATUSES = new Set(["scheduled", "needs-clarification"]);

interface UseCashFlowForecastInput {
  payments: UnifiedPayment[];
  startingBalance: number;
  recurringTemplates?: RecurringTemplate[];
}

export function useCashFlowForecast({
  payments,
  startingBalance,
  recurringTemplates = demoRecurringTemplates,
}: UseCashFlowForecastInput): CashFlowForecast {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizon = addDays(today, FORECAST_HORIZON_DAYS);

    // Map: ISO date → { in, out, events[] }
    const buckets = new Map<string, { in: number; out: number; events: string[] }>();

    const ensureBucket = (iso: string) => {
      let b = buckets.get(iso);
      if (!b) {
        b = { in: 0, out: 0, events: [] };
        buckets.set(iso, b);
      }
      return b;
    };

    // 1. Реальні scheduled / expected платежі
    for (const p of payments) {
      let date: Date;
      try {
        date = parseISO(p.date);
      } catch {
        continue;
      }
      if (isBefore(date, today) || isBefore(horizon, date)) continue;

      const uah = toUah(p.amount, inferCurrency(p));
      const iso = format(date, "yyyy-MM-dd");

      if (p.direction === "out" && SCHEDULED_OUT_STATUSES.has(p.status as string)) {
        const b = ensureBucket(iso);
        b.out += uah;
        b.events.push(`${p.entityName} −₴${Math.round(uah).toLocaleString("uk-UA")}`);
      } else if (p.direction === "in" && EXPECTED_IN_STATUSES.has(p.status as string)) {
        const b = ensureBucket(iso);
        b.in += uah;
        b.events.push(`${p.entityName} +₴${Math.round(uah).toLocaleString("uk-UA")}`);
      }
    }

    // 2. Регулярні шаблони (тільки активні) — генеруємо очікувані витрати
    const occurrencesPerTemplate = Math.ceil(RECURRING_HORIZON_DAYS / 28);
    for (const tpl of recurringTemplates) {
      if (!tpl.active) continue;
      const dates = generateOccurrences(tpl, occurrencesPerTemplate, today);
      for (const iso of dates) {
        const date = parseISO(iso);
        if (isBefore(date, today) || isBefore(horizon, date)) continue;
        const b = ensureBucket(iso);
        b.out += tpl.amount;
        b.events.push(`${tpl.name} −₴${tpl.amount.toLocaleString("uk-UA")}`);
      }
    }

    // 3. Послідовний прохід по днях — рахуємо runningBalance
    const points: CashFlowPoint[] = [];
    let running = startingBalance;
    let minBalance = startingBalance;
    let gapDate: string | null = null;
    let gapAmount: number | null = null;

    for (let i = 0; i <= FORECAST_HORIZON_DAYS; i++) {
      const day = addDays(today, i);
      const iso = format(day, "yyyy-MM-dd");
      const b = buckets.get(iso) ?? { in: 0, out: 0, events: [] };
      running = running + b.in - b.out;
      if (running < minBalance) minBalance = running;
      if (running < 0 && gapDate === null) {
        gapDate = iso;
        gapAmount = running;
      }
      points.push({
        date: iso,
        balance: Math.round(running),
        inflow: Math.round(b.in),
        outflow: Math.round(b.out),
        primaryEvent: b.events[0],
      });
    }

    // 4. Найбільше очікуване надходження у горизонті 14 днів — для ризик-банера
    const horizon14 = addDays(today, 14);
    let largest: CashFlowForecast["largestExpectedInflow"] = null;
    for (const p of payments) {
      if (p.direction !== "in") continue;
      if (!EXPECTED_IN_STATUSES.has(p.status as string)) continue;
      let d: Date;
      try {
        d = parseISO(p.date);
      } catch {
        continue;
      }
      if (isBefore(d, today) || isBefore(horizon14, d)) continue;
      const amount = toUah(p.amount, inferCurrency(p));
      if (!largest || amount > largest.amount) {
        largest = { payment: p, amount, date: p.date };
      }
    }

    return {
      points,
      startingBalance: Math.round(startingBalance),
      endingBalance: Math.round(running),
      minBalance: Math.round(minBalance),
      gapDate,
      gapAmount: gapAmount !== null ? Math.round(gapAmount) : null,
      largestExpectedInflow: largest,
    };
  }, [payments, startingBalance, recurringTemplates]);
}
