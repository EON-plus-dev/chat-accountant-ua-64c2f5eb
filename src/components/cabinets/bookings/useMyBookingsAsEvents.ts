/**
 * useMyBookingsAsEvents — повертає бронювання поточного майстра-делегата
 * з усіх активних salon-master делегацій його кабінету.
 *
 * Працює лише якщо кабінет має `bookings_personal:view` (перевіряє caller).
 * Реактивно перепідписується на public-bookings і admin-bookings сторе.
 */
import { useEffect, useMemo, useState } from "react";
import { getDelegationsForMasterCabinet } from "@/config/demoCabinets/salonMasterDelegations";
import { mockCabinets } from "@/config/cabinetsData";
import { mergeSalonBookingsFor } from "./useMergedSalonBookings";
import { subscribeToPublicBookings } from "@/lib/publicBooking/store";
import { subscribeAdminBookings } from "./bookingsStore";
import type { SalonBooking } from "@/config/demoCabinets/salonData";

export interface MyBookingEvent {
  booking: SalonBooking;
  salonCabinetId: string;
  salonName: string;
  /** Поєднана дата + час як Date об'єкт. */
  startAt: Date;
}

export function useMyBookingsAsEvents(cabinetId: string): MyBookingEvent[] {
  const delegations = useMemo(
    () => getDelegationsForMasterCabinet(cabinetId),
    [cabinetId],
  );
  const salonIds = useMemo(
    () => Array.from(new Set(delegations.map((d) => d.salonCabinetId))),
    [delegations],
  );

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const off1 = subscribeToPublicBookings(() => setTick((t) => t + 1));
    const off2 = subscribeAdminBookings(() => setTick((t) => t + 1));
    return () => {
      off1();
      off2();
    };
  }, []);

  return useMemo(() => {
    if (salonIds.length === 0) return [];
    const out: MyBookingEvent[] = [];
    for (const salonId of salonIds) {
      const salon = mockCabinets.find((c) => c.id === salonId);
      const salonName = salon?.name ?? "Салон";
      const merged = mergeSalonBookingsFor(salonId);
      for (const b of merged) {
        const isMine =
          b.masterCabinetId === cabinetId ||
          // fallback: знаходимо masterId за делегацією
          delegations.some(
            (d) => d.salonCabinetId === salonId && d.masterId === b.masterId,
          );
        if (!isMine) continue;
        if (b.status === "canceled") continue;
        const [h, m] = (b.startTime ?? "00:00").split(":").map(Number);
        const startAt = new Date(b.date);
        startAt.setHours(h || 0, m || 0, 0, 0);
        out.push({ booking: b, salonCabinetId: salonId, salonName, startAt });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonIds, cabinetId, delegations, tick]);
}
