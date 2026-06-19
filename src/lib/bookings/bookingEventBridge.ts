/**
 * Bridge: salon bookings → cabinet event journal.
 *
 * Публікує події `type: "booking"` у persistent сховище `eventJournal_{cabinetId}`,
 * яке читає `useEventJournal`. Емітить `event-journal-updated` для миттєвого
 * оновлення відкритих списків.
 *
 * Demo-only: працює через localStorage. Production: edge function + БД з RLS.
 */

import { CalendarCheck } from "lucide-react";
import type { JournalEvent } from "@/config/eventJournalConfig";
import {
  salonClients,
  salonMasters,
  salonServices,
  type SalonBooking,
} from "@/config/demoCabinets/salonData";
import type { PublicBookingRecord } from "@/lib/publicBooking/types";

const STORAGE_KEY_PREFIX = "eventJournal_";
const BRIDGE_EVENT = "event-journal-updated";

export type BookingEventKind = "created" | "cancelled" | "no_show";

interface BookingLike {
  id: string;
  date: string;
  startTime: string;
  durationMin?: number;
  totalPrice?: number;
  masterId?: string;
  serviceIds?: string[];
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  source?: string;
  origin?: "salon" | "master_direct";
}

function shortClientName(b: BookingLike): string {
  if (b.clientId) {
    const c = salonClients.find((x) => x.id === b.clientId);
    if (c) {
      const parts = c.fullName.split(" ");
      return parts.length >= 2 ? `${parts[0]} ${parts[1][0]}.` : c.fullName;
    }
  }
  if (b.clientName) {
    const parts = b.clientName.split(" ");
    return parts.length >= 2 ? `${parts[0]} ${parts[1][0]}.` : b.clientName;
  }
  return "клієнт";
}

function masterName(b: BookingLike): string {
  if (!b.masterId) return "";
  return salonMasters.find((m) => m.id === b.masterId)?.shortName ?? "";
}

function serviceLabel(b: BookingLike): string {
  if (!b.serviceIds?.length) return "Запис";
  const first = salonServices.find((s) => s.id === b.serviceIds![0]);
  const name = first?.name ?? "Запис";
  const extra = b.serviceIds.length > 1 ? ` +${b.serviceIds.length - 1}` : "";
  return `${name}${extra}`;
}

function formatDayTime(date: string, time: string): string {
  // date = YYYY-MM-DD → DD.MM
  const [, m, d] = date.split("-");
  return `${time} ${d}.${m}`;
}

function readJournal(cabinetId: string): any[] {
  try {
    return JSON.parse(localStorage.getItem(`${STORAGE_KEY_PREFIX}${cabinetId}`) || "[]");
  } catch {
    return [];
  }
}

function writeJournal(cabinetId: string, list: any[]) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${cabinetId}`, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(BRIDGE_EVENT, { detail: { cabinetId } }));
  } catch {
    /* ignore */
  }
}

export function publishBookingEvent(
  cabinetId: string | undefined,
  kind: BookingEventKind,
  booking: BookingLike,
  sourceSystem: "bookings" | "public-widget" = "bookings",
) {
  if (!cabinetId) return;

  const isMasterDirect = booking.origin === "master_direct";
  const titlePrefix = isMasterDirect ? "[Майстер] " : "";
  const slot = formatDayTime(booking.date, booking.startTime);
  const svc = serviceLabel(booking);
  const client = shortClientName(booking);
  const master = masterName(booking);

  let title: string;
  let priority: JournalEvent["priority"];
  switch (kind) {
    case "created":
      title = `${titlePrefix}Новий запис: ${svc} · ${client} · ${slot}`;
      priority = "low";
      break;
    case "cancelled":
      title = `${titlePrefix}Скасовано запис: ${svc} · ${client} · ${slot}`;
      priority = "medium";
      break;
    case "no_show":
      title = `${titlePrefix}Неявка: ${svc} · ${client} · ${slot}`;
      priority = "medium";
      break;
  }

  const description = [master && `Майстер: ${master}`, `Клієнт: ${client}`]
    .filter(Boolean)
    .join(" · ");

  // Persist with icon stripped (re-hydrated by useEventJournal via eventTypeConfig)
  const stored = {
    id: `booking-${kind}-${booking.id}-${Date.now()}`,
    date: new Date().toISOString(),
    title,
    description,
    type: "booking" as const,
    priority,
    icon: undefined,
    metadata: {
      amount: booking.totalPrice,
      relatedEntity: client,
    },
    sourceSystem: sourceSystem === "public-widget" ? "Публічний віджет" : "Щоденник",
    tags: Array.from(
      new Set([
        "bookings",
        kind,
        booking.source ?? "admin",
        booking.origin ?? "salon",
        `booking:${booking.id}`,
      ]),
    ),
  };


  const list = readJournal(cabinetId);
  list.unshift(stored);
  // Cap to last 200 entries to avoid unbounded growth in demo
  if (list.length > 200) list.length = 200;
  writeJournal(cabinetId, list);
}

// Silence unused import warning (icon is the contract via eventTypeConfig)
void CalendarCheck;

/** Adapter: SalonBooking (admin store) → BookingLike. */
export function fromSalonBooking(b: SalonBooking): BookingLike {
  return {
    id: b.id,
    date: b.date,
    startTime: b.startTime,
    durationMin: b.durationMin,
    totalPrice: b.totalPrice,
    masterId: b.masterId,
    serviceIds: b.serviceIds,
    clientId: b.clientId,
    source: b.source,
    origin: b.salonCabinetId && b.revenueOwner === "master" ? "master_direct" : "salon",
  };
}

/** Adapter: PublicBookingRecord (widget) → BookingLike. */
export function fromPublicBooking(b: PublicBookingRecord): BookingLike {
  return {
    id: b.id,
    date: b.date,
    startTime: b.startTime,
    durationMin: b.durationMin,
    totalPrice: b.totalPrice,
    masterId: b.masterId,
    serviceIds: b.serviceIds,
    clientName: b.clientName,
    clientPhone: b.clientPhone,
    source: b.source,
    origin: b.origin,
  };
}
