/**
 * Consumer Inbox store — Phase 5 "Мої покупки/записи".
 *
 * Агрегує публічні записи (з усіх FOP-кабінетів у localStorage) за телефоном
 * клієнта. У production — RPC `consumer_inbox_for_user` з фільтром
 * за `linked_user_id` у `client_user_links`.
 */

import { useEffect, useState } from "react";
import { listPublicBookings } from "@/lib/publicBooking/store";
import { mockCabinets } from "@/config/cabinetsData";
import { salonServices, salonMasters } from "@/config/demoCabinets/salonData";
import type { PublicBookingRecord } from "@/lib/publicBooking/types";

export interface ConsumerInboxItem {
  booking: PublicBookingRecord;
  cabinetId: string;
  brandName: string;
  serviceNames: string;
  masterName?: string;
  isUpcoming: boolean;
  isCanceled: boolean;
}

function normPhone(p: string): string {
  return p.replace(/\D/g, "").slice(-9);
}

export function loadConsumerInbox(phone: string): ConsumerInboxItem[] {
  if (typeof window === "undefined") return [];
  const target = normPhone(phone);
  if (target.length < 9) return [];
  const now = Date.now();
  const items: ConsumerInboxItem[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("salon-public-bookings-")) continue;
    const cabinetId = key.replace("salon-public-bookings-", "");
    const list = listPublicBookings(cabinetId);
    const cabinet = mockCabinets.find((c) => c.id === cabinetId);
    const brandName = cabinet?.name ?? "Заклад";

    for (const b of list) {
      if (normPhone(b.clientPhone) !== target) continue;
      const serviceNames = b.serviceIds
        .map((id) => salonServices.find((s) => s.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      const master = salonMasters.find((m) => m.id === b.masterId);
      const startMs = new Date(`${b.date}T${b.startTime}:00`).getTime();
      items.push({
        booking: b,
        cabinetId,
        brandName,
        serviceNames,
        masterName: master?.shortName,
        isUpcoming: startMs >= now && b.status !== "canceled",
        isCanceled: b.status === "canceled",
      });
    }
  }

  // newest first
  items.sort((a, b) => (a.booking.date < b.booking.date ? 1 : -1));
  return items;
}

export function useConsumerInbox(phone: string) {
  const [items, setItems] = useState<ConsumerInboxItem[]>(() => loadConsumerInbox(phone));
  useEffect(() => {
    const refresh = () => setItems(loadConsumerInbox(phone));
    refresh();
    window.addEventListener("public-bookings-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("public-bookings-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [phone]);
  return items;
}
