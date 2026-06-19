/**
 * Cabinet Network Protocol — L3 (підписка на каталог).
 *
 * Окремий від делегації (L4) механізм:
 *  - L3: постачальник/заклад публікує каталог → інший кабінет/фізособа підписується
 *    і бачить через свою лінзу. Без КЕП, без доступу у чужий кабінет.
 *  - L4: `delegation_contracts` + КЕП — діяти від імені власника кабінету.
 *
 * Див. mem://architecture/cabinet-network-protocol-uk
 */

export type CatalogPublicationKind = "b2b_supplier" | "c2b_place";
export type CatalogPublicationVisibility = "public" | "invite_only";
export type CatalogPublicationStatus = "draft" | "active" | "paused" | "archived";

export interface CatalogPublication {
  id: string;
  providerCabinetId: string;
  kind: CatalogPublicationKind;
  visibility: CatalogPublicationVisibility;
  status: CatalogPublicationStatus;
  slug: string;
  displayName: string;
  /** Категорія для іконки/фільтра: "salon" | "tennis" | "hotel" | "restaurant" | "supplier" | … */
  categoryKey: string;
  shortDescription?: string;
  termsMd?: string;
  /** Публічна адреса (для C2B-місць). */
  address?: string;
  phone?: string;
  /** URL публічного booking-віджету (/book/:slug) якщо є. */
  publicBookingUrl?: string;
  createdAt: string;
}

export type CatalogSubscriptionStatus = "pending" | "active" | "paused" | "ended";

export interface CatalogSubscription {
  id: string;
  publicationId: string;
  /** Один з двох — субʼєкт-підписник. */
  subscriberCabinetId?: string;
  subscriberUserId?: string;
  status: CatalogSubscriptionStatus;
  scope: {
    catalog: boolean;
    orders: boolean;
    bookings: boolean;
    pricesTier: "default" | "wholesale";
  };
  acceptedTermsAt?: string;
  /** ID картки клієнта у провайдера (для звʼязку зі статистикою). */
  clientCardId?: string;
  createdAt: string;
  /** Денормалізовані лічильники (frontend mock). */
  stats?: {
    lastVisitAt?: string;
    lastOrderAt?: string;
    upcomingBookingAt?: string;
    upcomingBookingLabel?: string;
    totalOrders?: number;
    totalSpentUah?: number;
    pendingActionsCount?: number;
  };
}

/** Compact view-model для карток «Мої місця» / «Підписані постачальники». */
export interface SubscribedPlaceVM {
  subscription: CatalogSubscription;
  publication: CatalogPublication;
}
