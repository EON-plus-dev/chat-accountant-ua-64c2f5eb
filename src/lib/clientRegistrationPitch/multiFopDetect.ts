/**
 * Multi-FOP detector — touchpoint #4.
 *
 * Скан localStorage `salon-public-bookings-*` за телефоном клієнта.
 * Повертає кількість унікальних кабінетів ФОП, у яких є записи цього клієнта.
 * Імена ФОП не повертаємо (privacy): клієнт не повинен бачити, де ще був.
 *
 * У production — RPC через service_role + хеш телефону.
 */

import { useEffect, useState } from "react";

export interface MultiFopDetectResult {
  count: number;
  fopCabinetIds: string[];
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-9);
}

export function detectMultiFopClient(phone: string, excludeCabinetId?: string): MultiFopDetectResult {
  if (typeof window === "undefined") return { count: 0, fopCabinetIds: [] };
  const target = normalizePhone(phone);
  if (target.length < 9) return { count: 0, fopCabinetIds: [] };

  const set = new Set<string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("salon-public-bookings-")) continue;
      const cabinetId = key.replace("salon-public-bookings-", "");
      const list: Array<{ clientPhone?: string }> = JSON.parse(
        localStorage.getItem(key) || "[]",
      );
      const match = list.some((b) => normalizePhone(b.clientPhone ?? "") === target);
      if (match) set.add(cabinetId);
    }
  } catch {
    /* ignore */
  }
  if (excludeCabinetId) set.delete(excludeCabinetId);
  return { count: set.size, fopCabinetIds: Array.from(set) };
}

/** React-хук з тим самим контрактом + auto-refresh на події store. */
export function useMultiFopPitch(phone: string, excludeCabinetId?: string) {
  const [result, setResult] = useState<MultiFopDetectResult>(() =>
    detectMultiFopClient(phone, excludeCabinetId),
  );
  useEffect(() => {
    setResult(detectMultiFopClient(phone, excludeCabinetId));
    const handler = () => setResult(detectMultiFopClient(phone, excludeCabinetId));
    window.addEventListener("public-bookings-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("public-bookings-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [phone, excludeCabinetId]);
  return {
    ...result,
    /** Поріг для активації pitch'у. Включає поточний ФОП, тому потрібно ≥ 2. */
    shouldShow: result.count >= 2 || (excludeCabinetId ? result.count >= 1 : false),
  };
}
