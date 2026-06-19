/**
 * Маппінг публічного `slug` → внутрішній cabinetId + маркетинговий профіль.
 * MVP: статичні словники з демо-салоном.
 * Production: окрема таблиця `salon_public_profiles` (slug, cabinet_id, brand_name, tagline, accent_color, ...).
 */

import { mockCabinets } from "@/config/cabinetsData";
import type { Cabinet } from "@/types/cabinet";
import type { SalonPublicProfile } from "./types";

const getCabinetById = (id: string): Cabinet | undefined =>
  mockCabinets.find((c) => c.id === id);

const SLUG_TO_CABINET: Record<string, string> = {
  "beauty-lab": "demo-salon-3",
  "restoran-smak": "demo-restaurant-3",
  "hotel-zatyshok": "demo-hotel-3",
  "ace-court": "demo-tennis-3",
};

/**
 * Маркетингові профілі (бренд, гасло) per cabinetId.
 * Юридична назва кабінету (`cabinet.name` — напр. "ФОП Іваненко І. І.")
 * залишається для документів. Тут — те, що бачить клієнт на /book/:slug.
 */
const SALON_PROFILES: Record<string, SalonPublicProfile> = {
  "demo-salon-3": {
    brandName: "Beauty Lab",
    tagline: "Салон краси · перукарські, манікюр, масаж, брови",
    accentColor: "#E11D48",
  },
  "demo-restaurant-3": {
    brandName: "Ресторан «Смак»",
    tagline: "Авторська кухня · бронювання столиків і доставка",
    accentColor: "#B45309",
  },
  "demo-hotel-3": {
    brandName: "Готель «Затишок»",
    tagline: "Бутік-готель у центрі Києва · 30 номерів · ресторан · паркінг",
    accentColor: "#0F766E",
  },
  "demo-tennis-3": {
    brandName: "Ace Court",
    tagline: "Тенісний клуб · 8 кортів · школа · оренда інвентарю",
    accentColor: "#15803D",
  },
};

export const DEFAULT_DEMO_SLUG = "beauty-lab";

export function resolveCabinetBySlug(slug: string | undefined): {
  cabinet: Cabinet | null;
  isFallback: boolean;
} {
  const safe = (slug || DEFAULT_DEMO_SLUG).toLowerCase();
  const cabinetId = SLUG_TO_CABINET[safe];
  if (cabinetId) {
    const cabinet = getCabinetById(cabinetId);
    if (cabinet) return { cabinet, isFallback: false };
  }
  const fallback = getCabinetById(SLUG_TO_CABINET[DEFAULT_DEMO_SLUG]);
  return { cabinet: fallback ?? null, isFallback: true };
}

export function slugForCabinet(cabinetId: string): string {
  const entry = Object.entries(SLUG_TO_CABINET).find(([, id]) => id === cabinetId);
  return entry?.[0] ?? DEFAULT_DEMO_SLUG;
}

/**
 * Повертає маркетинговий профіль салону.
 * Якщо профіль не заданий — fallback на юридичну назву кабінету (нічого не ламається).
 */
export function getSalonPublicProfile(
  cabinet: Pick<Cabinet, "id" | "name"> | null | undefined,
  overrides?: Partial<SalonPublicProfile>,
): SalonPublicProfile {
  const base = cabinet ? SALON_PROFILES[cabinet.id] : undefined;
  const brandName =
    overrides?.brandName?.trim() || base?.brandName || cabinet?.name || "Салон";
  return {
    brandName,
    tagline: overrides?.tagline ?? base?.tagline,
    logoInitials: overrides?.logoInitials ?? base?.logoInitials,
    accentColor: overrides?.accentColor ?? base?.accentColor,
  };
}
