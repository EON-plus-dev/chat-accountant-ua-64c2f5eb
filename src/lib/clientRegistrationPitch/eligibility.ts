/**
 * Логіка cooldown / auto-silence реєстраційних pitch'ів.
 * Зберігання — localStorage (демо). Майбутнє — таблиця client_link_pitch_state.
 */

import type { PitchSource, PitchState } from "./types";

const STORE_KEY = "fintodo:client_pitch_state_v1";
const COOLDOWN_DAYS = 90;
const AUTO_SILENCE_AFTER_DISMISSES = 2;

type StateMap = Record<string, PitchState>; // key = `${clientId}::${source}`

const k = (clientId: string, source: PitchSource) => `${clientId}::${source}`;

function readAll(): StateMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") as StateMap;
  } catch {
    return {};
  }
}

function writeAll(map: StateMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(map));
  } catch {
    /* quota — ignore */
  }
}

export function getPitchState(clientId: string, source: PitchSource): PitchState {
  const all = readAll();
  return (
    all[k(clientId, source)] ?? {
      clientId,
      source,
      dismissedCount: 0,
    }
  );
}

export function isEligibleToShow(clientId: string, source: PitchSource, alreadyLinked: boolean): boolean {
  if (alreadyLinked) return false;
  const s = getPitchState(clientId, source);
  if (s.autoSilencedAt) return false;
  if (s.cooldownUntil && new Date(s.cooldownUntil).getTime() > Date.now()) return false;
  return true;
}

export function markShown(clientId: string, source: PitchSource) {
  const all = readAll();
  const cur = all[k(clientId, source)] ?? { clientId, source, dismissedCount: 0 };
  cur.lastShownAt = new Date().toISOString();
  all[k(clientId, source)] = cur;
  writeAll(all);
}

export function markDismissed(clientId: string, source: PitchSource) {
  const all = readAll();
  const cur = all[k(clientId, source)] ?? { clientId, source, dismissedCount: 0 };
  cur.dismissedCount += 1;
  const cooldown = new Date(Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
  cur.cooldownUntil = cooldown.toISOString();
  if (cur.dismissedCount >= AUTO_SILENCE_AFTER_DISMISSES) {
    cur.autoSilencedAt = new Date().toISOString();
  }
  all[k(clientId, source)] = cur;
  writeAll(all);
}

export function markCompleted(clientId: string, source: PitchSource) {
  // після успішного link — більше ніколи не показуємо жоден pitch
  const all = readAll();
  const now = new Date().toISOString();
  for (const key of Object.keys(all)) {
    if (key.startsWith(`${clientId}::`)) {
      all[key].autoSilencedAt = now;
    }
  }
  all[k(clientId, source)] = {
    ...(all[k(clientId, source)] ?? { clientId, source, dismissedCount: 0 }),
    autoSilencedAt: now,
  };
  writeAll(all);
}
