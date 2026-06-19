/**
 * useConsentLog — глобальні згоди + лог їх змін (GDPR Art. 7 audit).
 * Frontend mock: localStorage.
 */
import { useCallback, useEffect, useState } from "react";

const CONSENTS_KEY = "network:consents:v1";
const LOG_KEY = "network:consent-log:v1";
const EVENT = "network:consents-changed";

export interface GlobalConsents {
  // Сповіщення
  notifyVisitReminders: boolean;
  notifyMyPlacesPromos: boolean;
  notifyNewPlacesPromos: boolean;
  notifyPlatformEmail: boolean;
  // Персоналізація
  aiAnalyzeOrders: boolean;
  showSimilarPlaces: boolean;
  // Аналітика
  anonymousUsageStats: boolean;
}

export const DEFAULT_CONSENTS: GlobalConsents = {
  notifyVisitReminders: true,
  notifyMyPlacesPromos: false,
  notifyNewPlacesPromos: false,
  notifyPlatformEmail: false,
  aiAnalyzeOrders: false,
  showSimilarPlaces: true,
  anonymousUsageStats: true,
};

export interface ConsentLogEntry {
  id: string;
  at: string;
  key: keyof GlobalConsents;
  value: boolean;
  source: string;
}

function readConsents(): GlobalConsents {
  if (typeof window === "undefined") return DEFAULT_CONSENTS;
  try {
    return { ...DEFAULT_CONSENTS, ...JSON.parse(localStorage.getItem(CONSENTS_KEY) ?? "{}") };
  } catch {
    return DEFAULT_CONSENTS;
  }
}

function readLog(): ConsentLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function emit() {
  try { window.dispatchEvent(new CustomEvent(EVENT)); } catch { /* ignore */ }
}

export function useConsents() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = () => setTick((t) => t + 1);
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, []);
  void tick;

  const consents = readConsents();
  const log = readLog();

  const set = useCallback((key: keyof GlobalConsents, value: boolean) => {
    const cur = readConsents();
    const next = { ...cur, [key]: value };
    try {
      localStorage.setItem(CONSENTS_KEY, JSON.stringify(next));
      const log = readLog();
      log.unshift({
        id: `${Date.now()}-${key}`,
        at: new Date().toISOString(),
        key,
        value,
        source: "cabinet/settings",
      });
      localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 200)));
    } catch { /* ignore */ }
    emit();
  }, []);

  return { consents, log, set };
}
