/**
 * useSalonClients — головний hook сторінки «Клієнти».
 *
 * Privacy boundary:
 *  - Виключає `PRIVATE_MASTER_CLIENT_ID` (приватний клієнт ФОП-орендаря).
 *  - Виключає клієнтів, у яких ВСІ bookings мають `revenueOwner === "master"`
 *    (тобто це клієнти ФОП-майстра на оренді, а не салону).
 *  - Клієнти без bookings — вважаються салонними (додані вручну/імпорт).
 *
 * Merge:
 *  - seed (`salonClients`) + admin updates (`clientsStore.updates`)
 *  - + локально створені (`clientsStore.created`)
 */

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  salonClients,
  PRIVATE_MASTER_CLIENT_ID,
  type SalonClient,
} from "@/config/demoCabinets/salonData";
import { tennisClients } from "@/config/demoCabinets/tennisData";
import { hotelClients } from "@/config/demoCabinets/hotelData";
import { mockCabinets } from "@/config/cabinetsData";
import { getVerticalId } from "@/core";

/** Резолвить seed клієнтів і приватний-master-id за вертикаллю кабінету. */
function resolveClientsSeed(cabinetId: string): {
  seed: SalonClient[];
  privateMasterId: string | null;
} {
  const cabinet = mockCabinets.find((c) => c.id === cabinetId);
  const verticalId = getVerticalId(cabinet);
  if (verticalId === "tennis_club" || cabinetId === "demo-tennis-3") {
    return { seed: tennisClients, privateMasterId: null };
  }
  if (verticalId === "hotel" || cabinetId === "demo-hotel-3") {
    return { seed: hotelClients, privateMasterId: null };
  }
  return { seed: salonClients, privateMasterId: PRIVATE_MASTER_CLIENT_ID };
}
import { useSalonViewBookings } from "@/components/cabinets/bookings/useSalonViewBookings";
import {
  readClientsState,
  subscribeClients,
  type ClientsState,
} from "./clientsStore";
import { computeRfm, deriveSegment, type RfmCell, type ClientSegment } from "./rfm";

export interface EnrichedClient {
  client: SalonClient;
  rfm: RfmCell;
  segment: ClientSegment;
  avgCheck: number;
  ltv: number;
  topMasterId?: string;
}

export function useSalonClients(cabinetId: string) {
  const [state, setState] = useState<ClientsState>(() => readClientsState(cabinetId));
  const bookings = useSalonViewBookings(cabinetId);
  const { seed, privateMasterId } = useMemo(() => resolveClientsSeed(cabinetId), [cabinetId]);

  useEffect(() => {
    setState(readClientsState(cabinetId));
    return subscribeClients(() => setState(readClientsState(cabinetId)));
  }, [cabinetId]);

  /** Усі клієнти, які видимі салону (privacy boundary). */
  const visibleClients = useMemo<SalonClient[]>(() => {
    // 1) Merge seed + updates
    const merged: SalonClient[] = seed.map((c) =>
      state.updates[c.id] ? { ...c, ...state.updates[c.id] } : c,
    );
    // 2) Plus created
    const all = [...state.created, ...merged];
    // 3) Filter out master-private + masters-only revenue
    return all.filter((c) => {
      if (privateMasterId && c.id === privateMasterId) return false;
      const bs = bookings.filter((b) => b.clientId === c.id);
      if (bs.length === 0) return true; // manual entry
      return bs.some((b) => b.revenueOwner !== "master");
    });
  }, [seed, privateMasterId, state.created, state.updates, bookings]);


  /** Збагачені клієнти з RFM/segment/LTV. */
  const enriched = useMemo<EnrichedClient[]>(() => {
    return visibleClients.map((client) => {
      const bs = bookings.filter((b) => b.clientId === client.id);
      const rfm = computeRfm(bs);
      const segment = deriveSegment(client, rfm);
      const done = bs.filter((b) => b.status === "done" || b.status === "confirmed");
      const ltv = done.reduce((s, b) => s + (b.totalPrice || 0), 0);
      const avgCheck = done.length ? Math.round(ltv / done.length) : 0;
      // Top master by frequency
      const masterCount = new Map<string, number>();
      for (const b of done) masterCount.set(b.masterId, (masterCount.get(b.masterId) || 0) + 1);
      const topMasterId = [...masterCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      return { client, rfm, segment, avgCheck, ltv, topMasterId };
    });
  }, [visibleClients, bookings]);

  const byId = useMemo(() => {
    const m = new Map<string, EnrichedClient>();
    for (const e of enriched) m.set(e.client.id, e);
    return m;
  }, [enriched]);

  const getBookings = useCallback(
    (clientId: string) => bookings.filter((b) => b.clientId === clientId),
    [bookings],
  );

  return { list: enriched, byId, getBookings, state };
}
