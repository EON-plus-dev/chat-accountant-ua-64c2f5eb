/**
 * useSalonViewBookings — обгортка над `useMergedSalonBookings` для САЛОННОГО view.
 *
 * Застосовує privacy-маскінг: для прямих записів ФОП-майстра-орендаря
 * (origin="master_direct" + контракт з terms.kind ∈ {workspace_rental, hybrid})
 * салон бачить слот як зайнятий, але:
 *   - clientId підмінюється на `PRIVATE_MASTER_CLIENT_ID` (стаб без PII)
 *   - `notes` стираються
 *
 * Реальний клієнт залишається у Щоденнику майстра — там фільтр іде по
 * `masterId`, тож `useMergedSalonBookings` без обгортки дає майстру повний доступ.
 *
 * Юридичне обґрунтування: за договором оренди робочого місця клієнт юридично
 * є клієнтом майстра-ФОП, а не салону. Салон може знати лише факт зайнятості
 * робочого місця для уникнення конфліктів бронювань.
 */

import { useMemo } from "react";
import {
  PRIVATE_MASTER_CLIENT_ID,
  type SalonBooking,
} from "@/config/demoCabinets/salonData";
import { getDelegationsForSalon } from "@/config/demoCabinets/salonMasterDelegations";
import { useMergedSalonBookings } from "./useMergedSalonBookings";

export function useSalonViewBookings(cabinetId: string): SalonBooking[] {
  const merged = useMergedSalonBookings(cabinetId);

  return useMemo(() => {
    const rentalMasterIds = new Set(
      getDelegationsForSalon(cabinetId)
        .filter(
          (d) =>
            d.terms.kind === "workspace_rental" || d.terms.kind === "hybrid",
        )
        .map((d) => d.masterId),
    );

    return merged.map((b) => {
      const isPrivate = b.origin === "master_direct" && rentalMasterIds.has(b.masterId);
      if (!isPrivate) return b;
      return {
        ...b,
        clientId: PRIVATE_MASTER_CLIENT_ID,
        notes: undefined,
      };
    });
  }, [merged, cabinetId]);
}
