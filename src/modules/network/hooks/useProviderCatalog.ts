/**
 * useProviderCatalog — універсальний агрегатор каталогу провайдера для
 * L3-підписника. Тягне дані з існуючих демо-сідів індустрій (salon,
 * tennis, hotel) і нормалізує у простий вид {id,name,price,kind}.
 *
 * MVP: працює лише з 4 демо-кабінетами.
 */
import { useMemo } from "react";
import { MOCK_CATALOG_PUBLICATIONS } from "../data/mockNetworkData";
import { salonServices } from "@/config/demoCabinets/salonData";
import { SALON_PRODUCTS } from "@/config/demoCabinets/salonOrdersData";
import { TENNIS_NOMENCLATURE_SEED } from "@/config/demoCabinets/nomenclature/tennisNomenclature";
import { HOTEL_NOMENCLATURE_SEED } from "@/config/demoCabinets/nomenclature/hotelNomenclature";

export interface ProviderCatalogItem {
  id: string;
  name: string;
  price: number;
  kind: "service" | "product";
  category?: string;
}

export function useProviderCatalog(publicationId: string | null): ProviderCatalogItem[] {
  return useMemo<ProviderCatalogItem[]>(() => {
    if (!publicationId) return [];
    const pub = MOCK_CATALOG_PUBLICATIONS.find((p) => p.id === publicationId);
    if (!pub) return [];
    const cabinetId = pub.providerCabinetId;

    if (cabinetId === "demo-salon-3") {
      const services = salonServices.slice(0, 8).map<ProviderCatalogItem>((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
        kind: "service",
        category: s.category,
      }));
      const retail = SALON_PRODUCTS.filter((p) => p.isRetail).slice(0, 6).map<ProviderCatalogItem>((p) => ({
        id: p.id,
        name: p.name,
        price: p.retailPrice,
        kind: "product",
        category: p.category,
      }));
      return [...services, ...retail];
    }

    if (cabinetId === "demo-tennis-3") {
      return (TENNIS_NOMENCLATURE_SEED as Array<{ id: string; name: string; price?: number; retailPrice?: number; category?: string }>)
        .slice(0, 12)
        .map((it) => ({
          id: it.id,
          name: it.name,
          price: it.retailPrice ?? it.price ?? 0,
          kind: "product",
          category: it.category,
        }));
    }

    if (cabinetId === "demo-hotel-3") {
      return (HOTEL_NOMENCLATURE_SEED as Array<{ id: string; name: string; price?: number; retailPrice?: number; category?: string }>)
        .slice(0, 10)
        .map((it) => ({
          id: it.id,
          name: it.name,
          price: it.retailPrice ?? it.price ?? 0,
          kind: "product",
          category: it.category,
        }));
    }

    return [];
  }, [publicationId]);
}
