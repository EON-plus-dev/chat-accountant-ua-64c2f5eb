import { useMemo } from "react";
import {
  MOCK_CATALOG_PUBLICATIONS,
  MOCK_CATALOG_SUBSCRIPTIONS,
} from "../data/mockNetworkData";
import type { CatalogSubscription, CatalogPublication } from "../types";

/**
 * Privacy-VIEW для провайдера (L3).
 *
 * Повертає список підписників (фізосіб або кабінетів) на каталоги поточного
 * бізнес-кабінету. У реалі — `select * from subscription_client_profile_v`
 * під RLS, що віддає ЛИШЕ name + phone + клієнтську історію в цьому бізнесі.
 *
 * Жодних інших підписок, фінансів чи декларацій клієнта тут немає за
 * визначенням.
 */
export interface CabinetSubscriberVM {
  subscription: CatalogSubscription;
  publication: CatalogPublication;
  /** Денормалізована «обкладинка клієнта» для картки. */
  client: {
    displayName: string;
    phone: string;
    isIndividual: boolean;
  };
}

const DEMO_INDIVIDUAL_DIRECTORY: Record<string, { name: string; phone: string }> = {
  "demo-user-individual": { name: "Сидоренко Іван П.", phone: "+380 67 333 11 22" },
};

const DEMO_CABINET_DIRECTORY: Record<string, { name: string; phone: string }> = {
  "demo-salon-3": { name: "Beauty Zatyshok (ФОП)", phone: "+380 67 123 45 67" },
  "demo-tennis-3": { name: "Net Point Tennis Club", phone: "+380 44 555 10 10" },
  "demo-hotel-3": { name: "Готель «Затишок»", phone: "+380 32 297 50 50" },
};

export function useCabinetSubscribers(providerCabinetId: string): CabinetSubscriberVM[] {
  return useMemo(() => {
    const myPubs = MOCK_CATALOG_PUBLICATIONS.filter(
      (p) => p.providerCabinetId === providerCabinetId,
    );
    const pubIds = new Set(myPubs.map((p) => p.id));
    return MOCK_CATALOG_SUBSCRIPTIONS
      .filter((s) => pubIds.has(s.publicationId) && s.status === "active")
      .map<CabinetSubscriberVM | null>((subscription) => {
        const publication = myPubs.find((p) => p.id === subscription.publicationId);
        if (!publication) return null;
        const isIndividual = !!subscription.subscriberUserId;
        const dir = isIndividual
          ? DEMO_INDIVIDUAL_DIRECTORY[subscription.subscriberUserId!]
          : DEMO_CABINET_DIRECTORY[subscription.subscriberCabinetId!];
        return {
          subscription,
          publication,
          client: {
            displayName: dir?.name ?? "Клієнт",
            phone: dir?.phone ?? "—",
            isIndividual,
          },
        };
      })
      .filter((vm): vm is CabinetSubscriberVM => vm !== null);
  }, [providerCabinetId]);
}
