import { useState, useEffect, useCallback, useRef } from "react";
import { fetchNBUAllRates } from "@/lib/nbuExchangeRate";

export interface NBULiveRate {
  rate: number;
  change: number;
  changePercent: number;
  name: string;
}

interface UseNBUFinderRatesReturn {
  rates: Map<string, NBULiveRate>;
  history: number[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isLive: boolean;
}

const CURRENCIES = ["USD", "EUR", "GBP", "PLN", "CZK"];

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getPreviousBusinessDay(d: Date): Date {
  const prev = new Date(d);
  prev.setDate(prev.getDate() - 1);
  // Skip weekends
  while (prev.getDay() === 0 || prev.getDay() === 6) {
    prev.setDate(prev.getDate() - 1);
  }
  return prev;
}

export function useNBUFinderRates(activeCurrency: string): UseNBUFinderRatesReturn {
  const [rates, setRates] = useState<Map<string, NBULiveRate>>(new Map());
  const [history, setHistory] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const ratesCache = useRef<Map<string, NBULiveRate> | null>(null);
  const historyCache = useRef<Map<string, number[]>>(new Map());

  // Fetch today + yesterday rates (once)
  useEffect(() => {
    if (ratesCache.current) {
      setRates(ratesCache.current);
      setIsLive(true);
      return;
    }

    let cancelled = false;

    async function fetchRates() {
      try {
        const today = new Date();
        const yesterday = getPreviousBusinessDay(today);

        const [todayRates, yesterdayRates] = await Promise.all([
          fetchNBUAllRates(formatDate(today)),
          fetchNBUAllRates(formatDate(yesterday)),
        ]);

        if (cancelled) return;

        const result = new Map<string, NBULiveRate>();
        for (const cc of CURRENCIES) {
          const t = todayRates.get(cc);
          const y = yesterdayRates.get(cc);
          if (t) {
            const change = y ? +(t.rate - y.rate).toFixed(4) : 0;
            const changePercent = y && y.rate !== 0 ? +((change / y.rate) * 100).toFixed(2) : 0;
            result.set(cc, {
              rate: t.rate,
              change,
              changePercent,
              name: t.currencyName,
            });
          }
        }

        ratesCache.current = result;
        setRates(result);
        setLastUpdated(new Date());
        setIsLive(true);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.error("NBU rates fetch failed:", err);
          setError("Не вдалося завантажити курси НБУ");
          setIsLive(false);
        }
      }
    }

    fetchRates();
    return () => { cancelled = true; };
  }, []);

  // Fetch 30-day history for active currency
  const fetchHistory = useCallback(async (currency: string) => {
    const cached = historyCache.current.get(currency);
    if (cached) {
      setHistory(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date();
      const dates: string[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(formatDate(d));
      }

      // Fetch in batches of 10 to avoid overwhelming the API
      const results: (number | null)[] = [];
      for (let batch = 0; batch < dates.length; batch += 10) {
        const chunk = dates.slice(batch, batch + 10);
        const chunkResults = await Promise.all(
          chunk.map(async (date) => {
            try {
              const allRates = await fetchNBUAllRates(date);
              return allRates.get(currency)?.rate ?? null;
            } catch {
              return null;
            }
          })
        );
        results.push(...chunkResults);
      }

      const validRates = results.filter((r): r is number => r !== null);
      historyCache.current.set(currency, validRates);
      setHistory(validRates);
    } catch {
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(activeCurrency);
  }, [activeCurrency, fetchHistory]);

  return { rates, history, isLoading, error, lastUpdated, isLive };
}
