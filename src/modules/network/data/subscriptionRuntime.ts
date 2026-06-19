/**
 * Runtime mutable store для L3-підписок (Phase D, mock).
 *
 * MOCK_CATALOG_SUBSCRIPTIONS — це seed; додані підписки під час сесії
 * (autosubscribe з /book, інлайн-пошук) живуть у `runtimeSubs` і
 * мерджаться у `useMyPlaces` через подію `network:subs-changed`.
 *
 * У реальному API — це INSERT у `catalog_subscriptions`.
 */
import type { CatalogSubscription } from "../types";

const EVENT = "network:subs-changed";
const runtimeSubs: CatalogSubscription[] = [];

export function getRuntimeSubs(): CatalogSubscription[] {
  return runtimeSubs;
}

export function addRuntimeSub(sub: CatalogSubscription) {
  if (runtimeSubs.some((s) => s.id === sub.id)) return;
  runtimeSubs.unshift(sub);
  try {
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch { /* SSR-safe */ }
}

export function subscribeToSubsChanges(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

/** Чи фізособа вже підписана на цю публікацію. */
export function isUserSubscribed(
  userId: string,
  publicationId: string,
  seed: CatalogSubscription[],
): boolean {
  return [...seed, ...runtimeSubs].some(
    (s) => s.subscriberUserId === userId && s.publicationId === publicationId && s.status === "active",
  );
}
