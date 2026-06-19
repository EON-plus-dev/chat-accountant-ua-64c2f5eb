import { useState, useEffect, useCallback } from "react";

export interface DataFreshness {
  lastRefreshTime: Date;
  isStale: boolean;
  formattedTime: string;
  refresh: () => void;
}

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STALE_THRESHOLD = 10 * 60 * 1000; // 10 minutes

export function useDataFreshness(): DataFreshness {
  const [lastRefreshTime, setLastRefreshTime] = useState(() => new Date());
  const [isStale, setIsStale] = useState(false);

  const formattedTime = lastRefreshTime.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const refresh = useCallback(() => {
    setLastRefreshTime(new Date());
    setIsStale(false);
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const id = setInterval(() => {
      setLastRefreshTime(new Date());
      setIsStale(false);
    }, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, []);

  // Detect stale data on tab re-focus
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") {
        const elapsed = Date.now() - lastRefreshTime.getTime();
        if (elapsed > STALE_THRESHOLD) {
          setIsStale(true);
        }
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [lastRefreshTime]);

  return { lastRefreshTime, isStale, formattedTime, refresh };
}
