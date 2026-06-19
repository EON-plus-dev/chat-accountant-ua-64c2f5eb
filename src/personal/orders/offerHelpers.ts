/**
 * offerHelpers — уніфікований lookup для drill-sheet `personal-offer`.
 * Шукає запис у всіх 7 джерелах discoveryMock + повертає AnyOffer з нормалізованими полями.
 */

import {
  getRecommendations,
  getPromos,
  getSpecials,
  getAnnouncements,
  getProductOffers,
  getServiceOffers,
  getBookingOffers,
  type OfferRecommendation,
  type OfferPromo,
  type OfferSpecial,
  type OfferAnnouncement,
  type ProductOffer,
  type ServiceOffer,
  type BookingOffer,
} from "./discoveryMock";

export type OfferSource =
  | "recommendation"
  | "promo"
  | "special"
  | "announcement"
  | "product"
  | "service"
  | "booking";

export interface AnyOffer {
  id: string;
  source: OfferSource;
  title: string;
  provider: string;
  category?: string;
  description?: string;
  benefit?: string;
  saving?: string;
  cta?: string;
  validUntil?: string;
  priceFromUah?: number;
  rating?: number;
  emoji?: string;
  /** Куди веде «Прийняти / Замовити»: до якого підрозділу */
  acceptTarget?: "shop" | "services" | "bookings" | "external";
  raw?: unknown;
}

export function findOfferById(cabinetId: string, id: string): AnyOffer | null {
  for (const r of getRecommendations(cabinetId)) {
    if (r.id === id) return fromRec(r);
  }
  for (const p of getPromos(cabinetId)) {
    if (p.id === id) return fromPromo(p);
  }
  for (const s of getSpecials(cabinetId)) {
    if (s.id === id) return fromSpecial(s);
  }
  for (const a of getAnnouncements(cabinetId)) {
    if (a.id === id) return fromAnnouncement(a);
  }
  for (const p of getProductOffers(cabinetId)) {
    if (p.id === id) return fromProduct(p);
  }
  for (const s of getServiceOffers(cabinetId)) {
    if (s.id === id) return fromService(s);
  }
  for (const b of getBookingOffers(cabinetId)) {
    if (b.id === id) return fromBooking(b);
  }
  return null;
}

function fromRec(r: OfferRecommendation): AnyOffer {
  return {
    id: r.id, source: "recommendation",
    title: r.title, provider: r.provider,
    description: r.reason, saving: r.saving, cta: r.cta,
    acceptTarget: "external", raw: r,
  };
}
function fromPromo(p: OfferPromo): AnyOffer {
  return {
    id: p.id, source: "promo",
    title: p.title, provider: p.provider, category: p.category,
    benefit: p.discount, validUntil: p.validUntil,
    acceptTarget: "external", raw: p,
  };
}
function fromSpecial(s: OfferSpecial): AnyOffer {
  return {
    id: s.id, source: "special",
    title: s.title, provider: s.provider,
    description: s.description, benefit: s.benefit,
    acceptTarget: "external", raw: s,
  };
}
function fromAnnouncement(a: OfferAnnouncement): AnyOffer {
  return {
    id: a.id, source: "announcement",
    title: a.title, provider: a.provider, category: a.kind,
    validUntil: a.date,
    acceptTarget: "external", raw: a,
  };
}
function fromProduct(p: ProductOffer): AnyOffer {
  return {
    id: p.id, source: "product",
    title: p.title, provider: p.provider, category: p.tag,
    priceFromUah: p.priceUah, rating: p.rating, emoji: p.emoji,
    cta: "У кошик",
    acceptTarget: "shop", raw: p,
  };
}
function fromService(s: ServiceOffer): AnyOffer {
  return {
    id: s.id, source: "service",
    title: s.title, provider: s.provider, category: s.category,
    priceFromUah: s.fromUah, rating: s.rating,
    cta: "Замовити",
    acceptTarget: "services", raw: s,
  };
}
function fromBooking(b: BookingOffer): AnyOffer {
  return {
    id: b.id, source: "booking",
    title: b.title, provider: b.provider, category: b.location,
    priceFromUah: b.priceFromUah, rating: b.rating,
    cta: "Забронювати",
    description: `Найближчий слот: ${b.nextSlot}`,
    acceptTarget: "bookings", raw: b,
  };
}

const SOURCE_LABEL: Record<OfferSource, string> = {
  recommendation: "AI-рекомендація",
  promo: "Акція",
  special: "Спеціальна пропозиція",
  announcement: "Анонс",
  product: "Товар",
  service: "Послуга",
  booking: "Бронювання",
};
export const offerSourceLabel = (s: OfferSource) => SOURCE_LABEL[s];

/** Стабільне deterministic-число з id для derive-полів (% etc.) */
export function stableHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
