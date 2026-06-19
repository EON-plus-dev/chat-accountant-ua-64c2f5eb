/**
 * Demo-seed для Cabinet Network Protocol (L3).
 *
 * Використовує наявні демо-кабінети (`demo-salon-3`, `demo-tennis-3`, `demo-hotel-3`)
 * як публікації, і прив'язує демо-підписки до «фізособи»-демо-користувача.
 *
 * У реальній системі ці дані живуть у `catalog_publications` /
 * `catalog_subscriptions` таблицях (див. план Phase 1).
 */

import type {
  CatalogPublication,
  CatalogSubscription,
} from "../types";

/** Демо-userId фізособи з демо-кабінетів. */
export const DEMO_INDIVIDUAL_USER_ID = "demo-user-individual";

export const MOCK_CATALOG_PUBLICATIONS: CatalogPublication[] = [
  {
    id: "pub-salon-zatyshok",
    providerCabinetId: "demo-salon-3",
    kind: "c2b_place",
    visibility: "public",
    status: "active",
    slug: "salon-zatyshok",
    displayName: "Beauty Zatyshok",
    categoryKey: "salon",
    shortDescription: "Перукарня · манікюр · косметологія",
    address: "Київ, вул. Січових Стрільців, 24",
    phone: "+380 67 123 45 67",
    publicBookingUrl: "/book/salon-zatyshok",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "pub-tennis-club",
    providerCabinetId: "demo-tennis-3",
    kind: "c2b_place",
    visibility: "public",
    status: "active",
    slug: "tennis-net-point",
    displayName: "Net Point Tennis Club",
    categoryKey: "tennis_club",
    shortDescription: "8 кортів · школа · pro-shop",
    address: "Київ, вул. Велика Васильківська, 100",
    phone: "+380 44 555 10 10",
    publicBookingUrl: "/book/tennis-net-point",
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "pub-hotel-zatyshok",
    providerCabinetId: "demo-hotel-3",
    kind: "c2b_place",
    visibility: "public",
    status: "active",
    slug: "hotel-zatyshok",
    displayName: "Готель «Затишок»",
    categoryKey: "hotel",
    shortDescription: "30 номерів · сніданок · паркінг",
    address: "Львів, вул. Личаківська, 15",
    phone: "+380 32 297 50 50",
    publicBookingUrl: "/book/hotel-zatyshok",
    createdAt: "2026-02-10T10:00:00Z",
  },
  // ── B2B постачальники ────────────────────────────────────
  {
    id: "pub-supplier-beautypro",
    providerCabinetId: "demo-supplier-beautypro",
    kind: "b2b_supplier",
    visibility: "public",
    status: "active",
    slug: "beauty-pro-distribution",
    displayName: "Beauty Pro Distribution",
    categoryKey: "supplier",
    shortDescription: "Косметика, фарби, інструмент для салонів",
    phone: "+380 44 333 22 11",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "pub-supplier-courtgear",
    providerCabinetId: "demo-supplier-courtgear",
    kind: "b2b_supplier",
    visibility: "public",
    status: "active",
    slug: "court-gear-ua",
    displayName: "Court Gear UA",
    categoryKey: "supplier",
    shortDescription: "Мʼячі, ракетки, струни, апаратура",
    phone: "+380 67 444 55 66",
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "pub-supplier-horeca",
    providerCabinetId: "demo-supplier-horeca",
    kind: "b2b_supplier",
    visibility: "public",
    status: "active",
    slug: "horeca-supply",
    displayName: "HoReCa Supply",
    categoryKey: "supplier",
    shortDescription: "Текстиль, амініті, побутова хімія для готелів",
    phone: "+380 32 100 20 30",
    createdAt: "2026-01-20T10:00:00Z",
  },
];

export const MOCK_CATALOG_SUBSCRIPTIONS: CatalogSubscription[] = [
  {
    id: "sub-salon-1",
    publicationId: "pub-salon-zatyshok",
    subscriberUserId: DEMO_INDIVIDUAL_USER_ID,
    status: "active",
    scope: { catalog: true, orders: true, bookings: true, pricesTier: "default" },
    acceptedTermsAt: "2026-03-05T12:00:00Z",
    clientCardId: "client-zatyshok-001",
    createdAt: "2026-03-05T12:00:00Z",
    stats: {
      lastVisitAt: "2026-05-22T14:00:00Z",
      upcomingBookingAt: "2026-06-12T11:00:00Z",
      upcomingBookingLabel: "Стрижка + укладка",
      totalOrders: 8,
      totalSpentUah: 5400,
      pendingActionsCount: 1,
    },
  },
  {
    id: "sub-tennis-1",
    publicationId: "pub-tennis-club",
    subscriberUserId: DEMO_INDIVIDUAL_USER_ID,
    status: "active",
    scope: { catalog: true, orders: true, bookings: true, pricesTier: "default" },
    acceptedTermsAt: "2026-04-02T09:00:00Z",
    clientCardId: "client-netpoint-042",
    createdAt: "2026-04-02T09:00:00Z",
    stats: {
      lastVisitAt: "2026-06-01T18:00:00Z",
      upcomingBookingAt: "2026-06-08T19:00:00Z",
      upcomingBookingLabel: "Корт №3 · 1 год",
      totalOrders: 14,
      totalSpentUah: 8200,
    },
  },
  {
    id: "sub-hotel-1",
    publicationId: "pub-hotel-zatyshok",
    subscriberUserId: DEMO_INDIVIDUAL_USER_ID,
    status: "active",
    scope: { catalog: true, orders: false, bookings: true, pricesTier: "default" },
    acceptedTermsAt: "2026-02-12T18:00:00Z",
    clientCardId: "client-hotel-zatyshok-077",
    createdAt: "2026-02-12T18:00:00Z",
    stats: {
      lastVisitAt: "2026-04-18T12:00:00Z",
      totalOrders: 2,
      totalSpentUah: 6400,
    },
  },
  // ── B2B підписки: бізнес-кабінет ↔ постачальник ──────────
  {
    id: "sub-b2b-salon-beautypro",
    publicationId: "pub-supplier-beautypro",
    subscriberCabinetId: "demo-salon-3",
    status: "active",
    scope: { catalog: true, orders: true, bookings: false, pricesTier: "wholesale" },
    acceptedTermsAt: "2026-01-20T10:00:00Z",
    clientCardId: "bp-client-salon-zatyshok",
    createdAt: "2026-01-20T10:00:00Z",
    stats: {
      lastOrderAt: "2026-05-28T11:00:00Z",
      totalOrders: 23,
      totalSpentUah: 142000,
      pendingActionsCount: 1,
    },
  },
  {
    id: "sub-b2b-tennis-courtgear",
    publicationId: "pub-supplier-courtgear",
    subscriberCabinetId: "demo-tennis-3",
    status: "active",
    scope: { catalog: true, orders: true, bookings: false, pricesTier: "wholesale" },
    acceptedTermsAt: "2026-02-05T10:00:00Z",
    clientCardId: "cg-client-netpoint",
    createdAt: "2026-02-05T10:00:00Z",
    stats: {
      lastOrderAt: "2026-06-02T16:00:00Z",
      totalOrders: 17,
      totalSpentUah: 89500,
    },
  },
  {
    id: "sub-b2b-hotel-horeca",
    publicationId: "pub-supplier-horeca",
    subscriberCabinetId: "demo-hotel-3",
    status: "active",
    scope: { catalog: true, orders: true, bookings: false, pricesTier: "wholesale" },
    acceptedTermsAt: "2026-01-25T10:00:00Z",
    clientCardId: "horeca-client-hotel-zatyshok",
    createdAt: "2026-01-25T10:00:00Z",
    stats: {
      lastOrderAt: "2026-05-30T09:00:00Z",
      totalOrders: 31,
      totalSpentUah: 198000,
    },
  },
];
