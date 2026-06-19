/**
 * useSubscriptionScope — get/update scope per L3 subscription.
 *
 * Frontend mock: тримає overrides у localStorage, мерджить з seed-scope
 * з `MOCK_CATALOG_SUBSCRIPTIONS`. У реальному API — UPDATE по
 * `catalog_subscriptions.scope`.
 */
import { useCallback, useEffect, useState } from "react";
import {
  MOCK_CATALOG_SUBSCRIPTIONS,
} from "../data/mockNetworkData";
import { getRuntimeSubs, subscribeToSubsChanges } from "../data/subscriptionRuntime";
import type { CatalogSubscription } from "../types";

const STORAGE_KEY = "network:scope-overrides:v1";
const EVENT = "network:scope-changed";

export interface SubscriptionScopeExt {
  catalog: boolean;
  orders: boolean;
  bookings: boolean;
  pricesTier: "default" | "wholesale";
  /** Маркетинг-розсилка від закладу. */
  marketing: boolean;
  /** Персоналізовані пропозиції на основі історії. */
  personalization: boolean;
  /** Підписку призупинено (pause без видалення). */
  paused: boolean;
}

type ScopeOverrides = Record<string, Partial<SubscriptionScopeExt>>;

function readOverrides(): ScopeOverrides {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeOverrides(next: ScopeOverrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch { /* ignore */ }
}

function findSub(id: string): CatalogSubscription | undefined {
  return [...MOCK_CATALOG_SUBSCRIPTIONS, ...getRuntimeSubs()].find((s) => s.id === id);
}

function merge(id: string): SubscriptionScopeExt {
  const seed = findSub(id);
  const overrides = readOverrides()[id] ?? {};
  return {
    catalog: seed?.scope.catalog ?? true,
    orders: seed?.scope.orders ?? true,
    bookings: seed?.scope.bookings ?? true,
    pricesTier: seed?.scope.pricesTier ?? "default",
    marketing: false,
    personalization: false,
    paused: seed?.status === "paused",
    ...overrides,
  };
}

export function useSubscriptionScope(subscriptionId: string | null) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = () => setTick((t) => t + 1);
    window.addEventListener(EVENT, h);
    const off = subscribeToSubsChanges(h);
    return () => {
      window.removeEventListener(EVENT, h);
      off();
    };
  }, []);

  const scope = subscriptionId ? merge(subscriptionId) : null;
  void tick;

  const update = useCallback(
    (patch: Partial<SubscriptionScopeExt>) => {
      if (!subscriptionId) return;
      const all = readOverrides();
      all[subscriptionId] = { ...all[subscriptionId], ...patch };
      writeOverrides(all);
    },
    [subscriptionId],
  );

  const reset = useCallback(() => {
    if (!subscriptionId) return;
    const all = readOverrides();
    delete all[subscriptionId];
    writeOverrides(all);
  }, [subscriptionId]);

  return { scope, update, reset };
}
