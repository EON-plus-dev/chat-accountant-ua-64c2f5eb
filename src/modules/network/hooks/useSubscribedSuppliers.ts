import { useMemo } from "react";
import {
  MOCK_CATALOG_PUBLICATIONS,
  MOCK_CATALOG_SUBSCRIPTIONS,
} from "../data/mockNetworkData";
import type { SubscribedPlaceVM } from "../types";

/**
 * Список B2B-постачальників, на каталог яких підписаний поточний кабінет.
 * MVP: фронт-мок, у реалі — select з catalog_subscriptions JOIN catalog_publications
 * де kind='b2b_supplier' AND subscriber_cabinet_id=<current>.
 */
export function useSubscribedSuppliers(cabinetId: string): SubscribedPlaceVM[] {
  return useMemo(() => {
    return MOCK_CATALOG_SUBSCRIPTIONS
      .filter((s) => s.subscriberCabinetId === cabinetId && s.status === "active")
      .map((subscription) => {
        const publication = MOCK_CATALOG_PUBLICATIONS.find(
          (p) => p.id === subscription.publicationId && p.kind === "b2b_supplier",
        );
        if (!publication) return null;
        return { subscription, publication } satisfies SubscribedPlaceVM;
      })
      .filter((vm): vm is SubscribedPlaceVM => vm !== null);
  }, [cabinetId]);
}
