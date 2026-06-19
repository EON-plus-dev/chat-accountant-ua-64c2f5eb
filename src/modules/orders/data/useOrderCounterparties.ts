/**
 * useOrderCounterparties — повертає нормалізованих контрагентів для:
 *   direction="sale"     → клієнти (фізособи з salonClients/tennisClients)
 *   direction="purchase" → постачальники (suppliers + contractors-suppliers)
 *
 * Для тенісного кабінету бере tennisClients + TENNIS_SUPPLIERS.
 * Для салонного — salonClients + SALON_SUPPLIERS.
 * Інакше — getContractorsForCabinet (з фільтром по ролі).
 */

import { useMemo } from "react";
import type { OrderCounterparty } from "./types";
import { SALON_SUPPLIERS } from "@/config/demoCabinets/salonOrdersData";
import { salonClients } from "@/config/demoCabinets/salonData";
import { TENNIS_SUPPLIERS } from "@/config/demoCabinets/tennisOrdersData";
import { tennisClients } from "@/config/demoCabinets/tennisData";
import { restaurantClients, restaurantContractors } from "@/config/demoCabinets/restaurantData";
import { HOTEL_SUPPLIERS } from "@/config/demoCabinets/hotelOrdersData";
import { hotelClients } from "@/config/demoCabinets/hotelData";
import { getContractorsForCabinet } from "@/config/settingsConfig";
import type { Cabinet } from "@/types/cabinet";
import type { OrderDirection } from "../types";
import { getVerticalIdOrNull } from "@/core";

export function useOrderCounterparties(
  cabinet: Cabinet | { id: string; industry?: string; type?: string },
  direction: OrderDirection,
): OrderCounterparty[] {
  return useMemo(() => {
    const vertical = getVerticalIdOrNull(cabinet as Cabinet);

    if (direction === "purchase") {
      // Salon
      if (vertical === "salon") {
        return SALON_SUPPLIERS.map<OrderCounterparty>((s) => ({
          id: s.id,
          name: s.name,
          taxId: s.taxId,
          kind: "supplier",
          currency: s.currency,
          country: s.country,
          onTimePct: s.onTimePct,
          defaultLeadDays: s.defaultLeadDays,
          paymentTermsDays: 14,
        }));
      }
      // Tennis
      if (vertical === "tennis_club") {
        return TENNIS_SUPPLIERS.map<OrderCounterparty>((s) => ({
          id: s.id,
          name: s.name,
          taxId: s.taxId,
          kind: "supplier",
          currency: s.currency,
          country: s.country,
          onTimePct: s.onTimePct,
          defaultLeadDays: s.defaultLeadDays,
          paymentTermsDays: 14,
        }));
      }
      // Restaurant
      if (vertical === "restaurant") {
        return restaurantContractors
          .filter((c) => c.role === "supplier")
          .map<OrderCounterparty>((c) => ({
            id: c.id,
            name: c.name,
            taxId: c.code,
            kind: "supplier",
            currency: "UAH",
            paymentTermsDays: 14,
          }));
      }
      // Hotel
      if (vertical === "hotel") {
        return HOTEL_SUPPLIERS.map<OrderCounterparty>((s) => ({
          id: s.id,
          name: s.name,
          taxId: s.taxId,
          kind: "supplier",
          currency: s.currency,
          country: s.country,
          onTimePct: s.onTimePct,
          defaultLeadDays: s.defaultLeadDays,
          paymentTermsDays: 14,
        }));
      }
      // Generic
      const contractors = getContractorsForCabinet(cabinet as Cabinet);
      return contractors
        .filter((c) => c.role === "supplier" || c.role === "both")
        .map<OrderCounterparty>((c) => ({
          id: c.id,
          name: c.name,
          taxId: c.code,
          kind: "supplier",
          currency: "UAH",
          paymentTermsDays: c.paymentTermsDays,
        }));
    }

    // SALE → клієнти
    if (vertical === "salon") {
      return salonClients.map<OrderCounterparty>((c) => ({
        id: c.id,
        name: c.fullName,
        kind: "client",
        currency: "UAH",
      }));
    }
    if (vertical === "tennis_club") {
      return tennisClients.map<OrderCounterparty>((c) => ({
        id: c.id,
        name: c.fullName,
        kind: "client",
        currency: "UAH",
      }));
    }
    if (vertical === "restaurant") {
      return restaurantClients.map<OrderCounterparty>((c) => ({
        id: c.id,
        name: c.fullName,
        kind: "client",
        currency: "UAH",
      }));
    }
    if (vertical === "hotel") {
      return hotelClients.map<OrderCounterparty>((c) => ({
        id: c.id,
        name: c.fullName,
        kind: "client",
        currency: "UAH",
      }));
    }
    const contractors = getContractorsForCabinet(cabinet as Cabinet);
    return contractors
      .filter((c) => c.role === "buyer" || c.role === "both")
      .map<OrderCounterparty>((c) => ({
        id: c.id,
        name: c.name,
        taxId: c.code,
        kind: "client",
        currency: "UAH",
        paymentTermsDays: c.paymentTermsDays,
      }));
  }, [cabinet, direction]);
}
