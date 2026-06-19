/**
 * Funnel-events лог (demo: localStorage; future: client_link_funnel_events).
 * Дає shown/clicked/dismissed/completed CR per (source × variant × benefit).
 */

import type { PitchEvent, PitchSource, PitchVariant, PitchBenefit } from "./types";

const KEY = "fintodo:client_pitch_funnel_v1";
const MAX_EVENTS = 500;

function readAll(): PitchEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as PitchEvent[];
  } catch {
    return [];
  }
}

function writeAll(events: PitchEvent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    /* quota */
  }
}

export function logShown(args: {
  clientId: string;
  fopCabinetId: string;
  source: PitchSource;
  variant: PitchVariant;
  benefit: PitchBenefit;
}): string {
  const id = `pe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const events = readAll();
  events.push({
    id,
    clientId: args.clientId,
    fopCabinetId: args.fopCabinetId,
    source: args.source,
    variant: args.variant,
    benefit: args.benefit,
    shownAt: new Date().toISOString(),
  });
  writeAll(events);
  return id;
}

function patch(eventId: string, fields: Partial<PitchEvent>) {
  const events = readAll();
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx === -1) return;
  events[idx] = { ...events[idx], ...fields };
  writeAll(events);
}

export const logClicked = (eventId: string) => patch(eventId, { clickedAt: new Date().toISOString() });
export const logCompleted = (eventId: string) => patch(eventId, { completedAt: new Date().toISOString() });
export const logDismissed = (eventId: string, reason?: string) =>
  patch(eventId, { dismissedAt: new Date().toISOString(), abandonedReason: reason });

export function getFunnelEvents(): PitchEvent[] {
  return readAll();
}
