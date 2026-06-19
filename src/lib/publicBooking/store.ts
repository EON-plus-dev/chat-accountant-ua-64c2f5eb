/**
 * Демо-сховище публічних записів у localStorage.
 * Production: edge function `salon-booking-confirm` + БД з RLS.
 *
 * Емітить кастомний event `public-bookings-updated`, щоб картка майстра
 * у адмін-панелі салону одразу побачила новий запис.
 */

import { getBookableContext } from "@/core";
import { publishBookingEvent, fromPublicBooking } from "@/lib/bookings/bookingEventBridge";
import type { PublicBookingDraft, PublicBookingRecord, BookingMode } from "./types";

import { computeAvailability } from "./computeAvailability";

const KEY = (cabinetId: string) => `salon-public-bookings-${cabinetId}`;
const EVENT_NAME = "public-bookings-updated";

export function listPublicBookings(cabinetId: string): PublicBookingRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY(cabinetId)) || "[]");
  } catch {
    return [];
  }
}

function persist(cabinetId: string, list: PublicBookingRecord[]) {
  try {
    localStorage.setItem(KEY(cabinetId), JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cabinetId } }));
  } catch {
    /* ignore */
  }
}

export interface ConfirmResult {
  ok: boolean;
  booking?: PublicBookingRecord;
  error?: string;
}

export function confirmPublicBooking(
  cabinetId: string,
  draft: PublicBookingDraft,
  source: BookingMode,
  widgetKind: "salon" | "master_direct" = "salon",
): ConfirmResult {
  if (!draft.serviceIds?.length) return { ok: false, error: "no_service" };
  if (!draft.date || !draft.startTime) return { ok: false, error: "no_slot" };
  if (!draft.clientName?.trim() || !draft.clientPhone?.trim()) {
    return { ok: false, error: "no_contact" };
  }

  // Re-check availability (race condition guard)
  const slots = computeAvailability({
    cabinetId,
    serviceIds: draft.serviceIds,
    masterId: draft.masterId,
  });
  const slot = slots.find(
    (s) =>
      s.date === draft.date &&
      s.startTime === draft.startTime &&
      (!draft.masterId || s.masterId === draft.masterId),
  );
  if (!slot) return { ok: false, error: "slot_taken" };

  const services = getBookableContext(cabinetId).services;
  const totalDuration =
    draft.serviceIds.reduce(
      (sum, id) => sum + (services.find((s) => s.id === id)?.durationMin ?? 0),
      0,
    ) || 30;
  const totalPrice = draft.serviceIds.reduce(
    (sum, id) => sum + (services.find((s) => s.id === id)?.price ?? 0),
    0,
  );

  const record: PublicBookingRecord = {
    id: crypto.randomUUID(),
    cabinetId,
    serviceIds: draft.serviceIds,
    masterId: slot.masterId,
    workstationId: slot.workstationId,
    date: slot.date,
    startTime: slot.startTime,
    durationMin: totalDuration,
    totalPrice,
    clientName: draft.clientName.trim(),
    clientPhone: draft.clientPhone.trim(),
    clientEmail: draft.clientEmail?.trim() || undefined,
    note: draft.note?.trim() || undefined,
    source,
    status: "scheduled",
    createdAt: new Date().toISOString(),
    cancelToken: crypto.randomUUID().slice(0, 12),
    origin: widgetKind === "master_direct" ? "master_direct" : "salon",
  };

  const list = listPublicBookings(cabinetId);
  list.unshift(record);
  persist(cabinetId, list);
  publishBookingEvent(cabinetId, "created", fromPublicBooking(record), "public-widget");
  return { ok: true, booking: record };

}


/** Знаходить публічний запис за cancelToken серед усіх кабінетів у localStorage. */
export function findPublicBookingByToken(token: string): PublicBookingRecord | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("salon-public-bookings-")) continue;
      const list: PublicBookingRecord[] = JSON.parse(localStorage.getItem(key) || "[]");
      const match = list.find((b) => b.cancelToken === token);
      if (match) return match;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function cancelPublicBooking(cabinetId: string, bookingId: string, token: string): boolean {
  const list = listPublicBookings(cabinetId);
  const idx = list.findIndex((b) => b.id === bookingId && b.cancelToken === token);
  if (idx === -1) return false;
  list[idx].status = "canceled";
  persist(cabinetId, list);
  publishBookingEvent(cabinetId, "cancelled", fromPublicBooking(list[idx]), "public-widget");
  return true;

}

export function subscribeToPublicBookings(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT_NAME, handler);
  // Cross-tab sync
  const storageHandler = (e: StorageEvent) => {
    if (e.key?.startsWith("salon-public-bookings-")) cb();
  };
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

/** Знайти клієнта за телефоном (returning client recognition). */
export function lookupClientByPhone(cabinetId: string, phone: string) {
  const normalized = phone.replace(/\D/g, "");
  if (normalized.length < 9) return null;
  const { clients } = getBookableContext(cabinetId);
  const fromMain = clients.find((c) =>
    c.phone.replace(/\D/g, "").endsWith(normalized.slice(-9)),
  );
  if (fromMain) return fromMain;
  // У публічних — за телефоном останнього запису
  const publics = listPublicBookings(cabinetId);
  const prev = publics.find((b) => b.clientPhone.replace(/\D/g, "").endsWith(normalized.slice(-9)));
  if (prev) {
    return {
      id: `pub-${prev.clientPhone}`,
      fullName: prev.clientName,
      phone: prev.clientPhone,
      totalVisits: publics.filter((b) => b.clientPhone === prev.clientPhone).length,
      isVip: false,
    };
  }
  return null;
}
