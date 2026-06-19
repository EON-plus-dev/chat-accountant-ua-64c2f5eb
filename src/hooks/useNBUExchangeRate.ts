import { useState, useCallback } from "react";
import { fetchNBUExchangeRate, ExchangeRateResult } from "@/lib/nbuExchangeRate";

interface UseNBUExchangeRateReturn {
  fetchRate: (currency: string, date: string) => Promise<ExchangeRateResult | null>;
  isLoading: boolean;
  error: string | null;
  result: ExchangeRateResult | null;
  reset: () => void;
}

/**
 * Хук для отримання курсу валют з API НБУ
 * Керує станом завантаження, помилок та результату
 */
export function useNBUExchangeRate(): UseNBUExchangeRateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExchangeRateResult | null>(null);

  const fetchRate = useCallback(async (currency: string, date: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchNBUExchangeRate(currency, date);

      if (data) {
        setResult(data);
        return data;
      } else {
        setError("Курс не знайдено для вказаної дати");
        return null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Помилка отримання курсу";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { fetchRate, isLoading, error, result, reset };
}
