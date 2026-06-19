/**
 * useAccessLog — журнал доступу закладів до даних користувача (Apple App Privacy Report style).
 * Frontend mock: генерується з `MOCK_CATALOG_SUBSCRIPTIONS` (lastVisit / lastOrder / upcoming).
 */
import { useMemo } from "react";
import {
  MOCK_CATALOG_PUBLICATIONS,
  MOCK_CATALOG_SUBSCRIPTIONS,
  DEMO_INDIVIDUAL_USER_ID,
} from "../data/mockNetworkData";

export type AccessLogAction =
  | "view_phone"
  | "view_history"
  | "update_card"
  | "view_upcoming"
  | "view_order";

export interface AccessLogEntry {
  id: string;
  at: string;
  publicationId: string;
  providerName: string;
  action: AccessLogAction;
  reason: string;
}

const ACTION_LABELS: Record<AccessLogAction, string> = {
  view_phone: "переглянув ваш телефон",
  view_history: "переглянув історію",
  update_card: "оновив вашу картку",
  view_upcoming: "переглянув майбутні візити",
  view_order: "переглянув ваше замовлення",
};

export function getAccessLogActionLabel(a: AccessLogAction): string {
  return ACTION_LABELS[a];
}

export function useAccessLog(userId: string = DEMO_INDIVIDUAL_USER_ID): AccessLogEntry[] {
  return useMemo(() => {
    const subs = MOCK_CATALOG_SUBSCRIPTIONS.filter(
      (s) => s.subscriberUserId === userId && s.status === "active",
    );
    const entries: AccessLogEntry[] = [];

    subs.forEach((sub) => {
      const pub = MOCK_CATALOG_PUBLICATIONS.find((p) => p.id === sub.publicationId);
      if (!pub) return;

      if (sub.stats?.upcomingBookingAt) {
        entries.push({
          id: `${sub.id}-upcoming`,
          at: sub.stats.upcomingBookingAt,
          publicationId: pub.id,
          providerName: pub.displayName,
          action: "view_phone",
          reason: "Нова бронь",
        });
      }
      if (sub.stats?.lastVisitAt) {
        entries.push({
          id: `${sub.id}-visit`,
          at: sub.stats.lastVisitAt,
          publicationId: pub.id,
          providerName: pub.displayName,
          action: "view_history",
          reason: "Підготовка до візиту",
        });
      }
      if (sub.stats?.lastOrderAt) {
        entries.push({
          id: `${sub.id}-order`,
          at: sub.stats.lastOrderAt,
          publicationId: pub.id,
          providerName: pub.displayName,
          action: "view_order",
          reason: "Обробка замовлення",
        });
      }
      // Synthetic update (демо)
      entries.push({
        id: `${sub.id}-sync`,
        at: sub.createdAt,
        publicationId: pub.id,
        providerName: pub.displayName,
        action: "update_card",
        reason: "Підписка створена",
      });
    });

    return entries.sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [userId]);
}
