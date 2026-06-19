/**
 * Зливає три джерела бронювань салону:
 *   1) Статичні `salonBookings` (демо seed),
 *   2) Публічні через widget (`lib/publicBooking/store`),
 *   3) Адмін-стор (`bookingsStore`): created + updates + waitlist.
 *
 * Підписується на події обох сторів — UI оновлюється миттєво.
 */

import { useEffect, useMemo, useState } from "react";
import {
  type SalonBooking,
  type BookingSource,
} from "@/config/demoCabinets/salonData";
import { getBookableContext } from "@/core";
import { listPublicBookings, subscribeToPublicBookings } from "@/lib/publicBooking/store";
import type { PublicBookingRecord } from "@/lib/publicBooking/types";
import {
  readState,
  subscribeAdminBookings,
  applyAdminOverrides,
  type AdminBookingsState,
} from "./bookingsStore";

const PUBLIC_SOURCE_MAP: Record<string, BookingSource> = {
  wizard: "wizard",
  "ai-chat": "ai-chat",
  "ai-call": "ai-call",
};

function buildToSalonBooking(salonClients: ReturnType<typeof getBookableContext>["clients"]) {
  return function toSalonBooking(r: PublicBookingRecord): SalonBooking {
    const existing = salonClients.find(
      (c) => c.phone.replace(/\D/g, "") === r.clientPhone.replace(/\D/g, ""),
    );
    const isMasterDirect = r.origin === "master_direct";
    return {
      id: r.id,
      date: r.date,
      startTime: r.startTime,
      durationMin: r.durationMin,
      clientId: existing?.id ?? `pub-${r.id.slice(0, 6)}`,
      masterId: r.masterId,
      workstationId: r.workstationId,
      serviceIds: r.serviceIds,
      totalPrice: r.totalPrice,
      commissionAmount: isMasterDirect ? 0 : Math.round(r.totalPrice * 0.5),
      status: r.status === "canceled" ? "canceled" : "confirmed",
      notes: r.note,
      source: PUBLIC_SOURCE_MAP[r.source] ?? "wizard",
      origin: isMasterDirect ? "master_direct" : "salon",
      revenueOwner: isMasterDirect ? "master" : "salon",
      masterPayoutAmount: isMasterDirect ? r.totalPrice : undefined,
    };
  };
}


/** Pure (non-hook) merge helper — для агрегації по кільком салонам. */
export function mergeSalonBookingsFor(salonCabinetId: string): SalonBooking[] {
  const ctx = getBookableContext(salonCabinetId);
  const toSalonBooking = buildToSalonBooking(ctx.clients);
  const publics = listPublicBookings(salonCabinetId).map(toSalonBooking);
  return applyAdminOverrides([...publics, ...ctx.bookings], readState(salonCabinetId));
}

export function useMergedSalonBookings(cabinetId: string): SalonBooking[] {
  const ctx = useMemo(() => getBookableContext(cabinetId), [cabinetId]);
  const [publicList, setPublicList] = useState<PublicBookingRecord[]>(() =>
    listPublicBookings(cabinetId),
  );
  const [adminState, setAdminState] = useState<AdminBookingsState>(() => readState(cabinetId));

  useEffect(() => {
    setPublicList(listPublicBookings(cabinetId));
    setAdminState(readState(cabinetId));
    const offPublic = subscribeToPublicBookings(() => setPublicList(listPublicBookings(cabinetId)));
    const offAdmin = subscribeAdminBookings(() => setAdminState(readState(cabinetId)));
    return () => {
      offPublic();
      offAdmin();
    };
  }, [cabinetId]);

  const toSalonBooking = useMemo(() => buildToSalonBooking(ctx.clients), [ctx.clients]);
  const base: SalonBooking[] = [
    ...publicList.map(toSalonBooking),
    ...ctx.bookings,
  ];
  return applyAdminOverrides(base, adminState);
}

