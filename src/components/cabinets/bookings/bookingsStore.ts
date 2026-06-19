/**
 * Локальне сховище адмін-бронювань салону:
 *   - `created`: нові бронювання, створені з кабінету (не існують у seed)
 *   - `updates`: часткові оверрайди над seed (`salonBookings`) + публічними (widget)
 *   - `waitlist`: список очікування
 *
 * Persist у localStorage `salon-admin-bookings-{cabinetId}` + emit `salon-admin-bookings-updated`.
 * Production: edge function + БД з RLS.
 */

import type { Booking as SalonBooking, WaitlistEntry as SalonWaitlistEntry } from "@/core";
import { publishBookingEvent, fromSalonBooking } from "@/lib/bookings/bookingEventBridge";


const KEY = (cabinetId: string) => `salon-admin-bookings-${cabinetId}`;
const EVENT_NAME = "salon-admin-bookings-updated";

export interface AdminBookingsState {
  created: SalonBooking[];
  updates: Record<string, Partial<SalonBooking>>;
  waitlist: SalonWaitlistEntry[];
}

const emptyState: AdminBookingsState = { created: [], updates: {}, waitlist: [] };

export function readState(cabinetId: string): AdminBookingsState {
  try {
    const raw = localStorage.getItem(KEY(cabinetId));
    if (!raw) return { ...emptyState };
    const parsed = JSON.parse(raw);
    return {
      created: Array.isArray(parsed.created) ? parsed.created : [],
      updates: parsed.updates && typeof parsed.updates === "object" ? parsed.updates : {},
      waitlist: Array.isArray(parsed.waitlist) ? parsed.waitlist : [],
    };
  } catch {
    return { ...emptyState };
  }
}

function writeState(cabinetId: string, state: AdminBookingsState) {
  try {
    localStorage.setItem(KEY(cabinetId), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cabinetId } }));
  } catch {
    /* ignore */
  }
}

export function subscribeAdminBookings(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT_NAME, handler);
  const storageHandler = (e: StorageEvent) => {
    if (e.key?.startsWith("salon-admin-bookings-")) cb();
  };
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

// ============================================================================
// Bookings mutations
// ============================================================================

export function createBooking(cabinetId: string, booking: SalonBooking) {
  const state = readState(cabinetId);
  state.created = [booking, ...state.created.filter((b) => b.id !== booking.id)];
  writeState(cabinetId, state);
  publishBookingEvent(cabinetId, "created", fromSalonBooking(booking));
}

/** Часткове оновлення (підходить і для created, і для seed/public). */
export function updateBooking(cabinetId: string, id: string, patch: Partial<SalonBooking>) {
  const state = readState(cabinetId);
  // Якщо це власний created — оновлюємо напряму
  const createdIdx = state.created.findIndex((b) => b.id === id);
  let merged: SalonBooking | undefined;
  if (createdIdx >= 0) {
    state.created[createdIdx] = { ...state.created[createdIdx], ...patch };
    merged = state.created[createdIdx];
  } else {
    state.updates[id] = { ...state.updates[id], ...patch };
    merged = { id, ...(state.updates[id] as SalonBooking) };
  }
  writeState(cabinetId, state);
  if (patch.status === "no-show" && merged) {
    publishBookingEvent(cabinetId, "no_show", fromSalonBooking(merged));
  } else if (patch.status === "canceled" && merged) {
    publishBookingEvent(cabinetId, "cancelled", fromSalonBooking(merged));
  }
}

export function deleteBooking(cabinetId: string, id: string) {
  const state = readState(cabinetId);
  const target =
    state.created.find((b) => b.id === id) ??
    ({ id, ...(state.updates[id] ?? {}) } as SalonBooking);
  state.created = state.created.filter((b) => b.id !== id);
  // Для seed/public позначаємо як canceled через update
  if (!state.created.find((b) => b.id === id)) {
    state.updates[id] = {
      ...state.updates[id],
      status: "canceled",
      canceledAt: new Date().toISOString(),
    };
  }
  writeState(cabinetId, state);
  if (target?.date && target?.startTime) {
    publishBookingEvent(cabinetId, "cancelled", fromSalonBooking(target as SalonBooking));
  }
}


export function applyAdminOverrides(
  base: SalonBooking[],
  state: AdminBookingsState,
): SalonBooking[] {
  const merged = base.map((b) => {
    const patch = state.updates[b.id];
    return patch ? { ...b, ...patch } : b;
  });
  // Додаємо власні created на початок
  return [...state.created, ...merged];
}

// ============================================================================
// Waitlist mutations
// ============================================================================

export function addToWaitlist(cabinetId: string, entry: SalonWaitlistEntry) {
  const state = readState(cabinetId);
  state.waitlist = [entry, ...state.waitlist];
  writeState(cabinetId, state);
}

export function updateWaitlistEntry(
  cabinetId: string,
  id: string,
  patch: Partial<SalonWaitlistEntry>,
) {
  const state = readState(cabinetId);
  state.waitlist = state.waitlist.map((w) => (w.id === id ? { ...w, ...patch } : w));
  writeState(cabinetId, state);
}

export function removeFromWaitlist(cabinetId: string, id: string) {
  const state = readState(cabinetId);
  state.waitlist = state.waitlist.filter((w) => w.id !== id);
  writeState(cabinetId, state);
}
