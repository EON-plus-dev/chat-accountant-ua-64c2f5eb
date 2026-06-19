import { useCallback, useEffect, useState } from "react";

export type FontSize = "sm" | "base" | "lg";

const STORAGE_KEY = "fintodo:font-size";

const SCALE_MAP: Record<FontSize, number> = {
  sm: 0.94,
  base: 1,
  lg: 1.12,
};

const apply = (size: FontSize) => {
  const root = document.documentElement;
  root.style.setProperty("--font-scale", String(SCALE_MAP[size]));
  // Root font-size scales rem-based Tailwind tokens proportionally
  root.style.fontSize = `calc(16px * var(--font-scale, 1))`;
  root.dataset.fontSize = size;
};

const read = (): FontSize => {
  if (typeof window === "undefined") return "base";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "sm" || v === "base" || v === "lg") return v;
  // Backward compatibility: legacy "xl" maps to "lg"
  if (v === "xl") return "lg";
  return "base";
};

export const useFontSize = () => {
  const [size, setSizeState] = useState<FontSize>(() => read());

  useEffect(() => {
    apply(size);
  }, [size]);

  const setSize = useCallback((next: FontSize) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    setSizeState(next);
  }, []);

  return { size, setSize };
};
