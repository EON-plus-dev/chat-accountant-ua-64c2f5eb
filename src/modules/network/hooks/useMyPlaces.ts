import { useEffect, useMemo, useState } from "react";
import {
  MOCK_CATALOG_PUBLICATIONS,
  MOCK_CATALOG_SUBSCRIPTIONS,
  DEMO_INDIVIDUAL_USER_ID,
} from "../data/mockNetworkData";
import { getRuntimeSubs, subscribeToSubsChanges } from "../data/subscriptionRuntime";
import type { SubscribedPlaceVM } from "../types";

/**
 * Список «Моїх місць» — активних L3-підписок фізособи.
 * Об'єднує seed-підписки і runtime-додані (autosubscribe / інлайн-пошук).
 */
export function useMyPlaces(userId: string = DEMO_INDIVIDUAL_USER_ID): SubscribedPlaceVM[] {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeToSubsChanges(() => setTick((t) => t + 1)), []);

  return useMemo(() => {
    void tick;
    const all = [...MOCK_CATALOG_SUBSCRIPTIONS, ...getRuntimeSubs()];
    return all
      .filter((s) => s.subscriberUserId === userId && s.status === "active")
      .map((subscription) => {
        const publication = MOCK_CATALOG_PUBLICATIONS.find((p) => p.id === subscription.publicationId);
        if (!publication) return null;
        return { subscription, publication } satisfies SubscribedPlaceVM;
      })
      .filter((vm): vm is SubscribedPlaceVM => vm !== null);
  }, [userId, tick]);
}

export function useMyPlace(placeId: string | null): SubscribedPlaceVM | null {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeToSubsChanges(() => setTick((t) => t + 1)), []);

  return useMemo(() => {
    void tick;
    if (!placeId) return null;
    const all = [...MOCK_CATALOG_SUBSCRIPTIONS, ...getRuntimeSubs()];
    const subscription = all.find((s) => s.id === placeId);
    if (!subscription) return null;
    const publication = MOCK_CATALOG_PUBLICATIONS.find((p) => p.id === subscription.publicationId);
    if (!publication) return null;
    return { subscription, publication };
  }, [placeId, tick]);
}
