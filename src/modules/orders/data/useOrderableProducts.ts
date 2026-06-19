/**
 * useOrderableProducts — універсальний hook, що повертає нормалізований
 * список товарів/послуг для будь-якого кабінету (`Order` UI). Працює з:
 *
 *   1. SALON_PRODUCTS (`demo-salon-3`)
 *   2. TENNIS_NOMENCLATURE_SEED (`demo-tennis-3`) — raw seed, не V2
 *   3. getNomenclatureForCabinet() (legacy NomenclatureItem) — інші demo
 *
 * Це фундамент Phase 1 плану: до цього SalesPage/PurchasesPage напряму
 * імпортували SALON_PRODUCTS, тому тенісний кабінет ламався.
 *
 * stockQty повертається з warehouse-стора (Phase 3) коли він заповнений,
 * інакше — з seed-значення (статичний `stock`).
 */

import { useMemo } from "react";
import type { OrderableProduct } from "./types";
import { SALON_PRODUCTS } from "@/config/demoCabinets/salonOrdersData";
import { TENNIS_NOMENCLATURE_SEED } from "@/config/demoCabinets/nomenclature/tennisNomenclature";
import { TENNIS_SUPPLIERS } from "@/config/demoCabinets/tennisOrdersData";
import { SALON_SUPPLIERS } from "@/config/demoCabinets/salonOrdersData";
import { restaurantMenu } from "@/config/demoCabinets/restaurantData";
import { HOTEL_NOMENCLATURE_SEED } from "@/config/demoCabinets/nomenclature/hotelNomenclature";
import { HOTEL_SUPPLIERS } from "@/config/demoCabinets/hotelOrdersData";
import { getNomenclatureForCabinet } from "@/config/settingsConfig";
import type { Cabinet } from "@/types/cabinet";
import { useWarehouseStockMap } from "@/modules/warehouse/store/useWarehouseStock";
import { getVerticalIdOrNull } from "@/core";

function tennisSupplierIdByName(name: string): string | undefined {
  const map: Record<string, string> = {
    "Wilson EU": "tsup-wilson",
    "Head Sport": "tsup-head",
    "Babolat UA": "tsup-babolat",
    "Yonex EU": "tsup-yonex",
    "Prince Distrib": "tsup-prince",
    "Dunlop UA": "tsup-dunlop",
    "Nike UA": "tsup-nike",
    "Adidas UA": "tsup-adidas",
    "ASICS UA": "tsup-asics",
    "Gamma US": "tsup-gamma",
    "Court Equip": "tsup-court",
    "Antuka PL": "tsup-antuka",
    "BeanLab": "tsup-beanlab",
    "TeaHouse": "tsup-teahouse",
    "FreshDistrib": "tsup-fresh",
    "Coca-Cola UA": "tsup-cocacola",
    "BonAqua UA": "tsup-boneaqua",
    "SportPit UA": "tsup-sportpit",
    "Bake&Co": "tsup-bake",
    "NutsCo": "tsup-nuts",
  };
  return map[name];
}

export function useOrderableProducts(cabinet: Cabinet | { id: string; industry?: string; type?: string }): OrderableProduct[] {
  const stockMap = useWarehouseStockMap(cabinet.id);

  return useMemo(() => {
    const vertical = getVerticalIdOrNull(cabinet as Cabinet);

    // 1) Salon
    if (vertical === "salon") {
      return SALON_PRODUCTS.map<OrderableProduct>((p) => {
        const sup = SALON_SUPPLIERS.find((s) => s.id === p.defaultSupplierId);
        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          unit: p.unit,
          price: p.retailPrice,
          cost: p.baseCost,
          stockQty: stockMap.get(p.id) ?? p.stockQty,
          minStock: p.minStock,
          supplierId: p.defaultSupplierId,
          supplierName: sup?.name,
          group: p.isRetail ? "Ритейл" : "Професійні",
          isService: false,
          source: "salon-product",
        };
      });
    }

    // 2) Tennis Club
    if (vertical === "tennis_club") {
      return TENNIS_NOMENCLATURE_SEED.map<OrderableProduct>((s) => {
        const supId = tennisSupplierIdByName(s.supplier);
        const sup = TENNIS_SUPPLIERS.find((x) => x.id === supId);
        return {
          id: s.id,
          sku: s.sku,
          name: s.name,
          unit: s.unit,
          price: s.price,
          cost: s.cost,
          stockQty: stockMap.get(s.id) ?? s.stock,
          minStock: s.minStock,
          supplierId: supId,
          supplierName: sup?.name ?? s.supplier,
          defaultLocationId: s.group === "shop" ? "loc-shop" : "loc-cafe",
          group: s.group === "shop" ? "Магазин Pro Shop" : "Кафе Net Point",
          isService: false,
          source: "tennis-seed",
        };
      });
    }

    // 3) Restaurant
    if (vertical === "restaurant") {
      return restaurantMenu.map<OrderableProduct>((m) => ({
        id: m.id,
        sku: m.sku,
        name: m.name,
        unit: m.unit,
        price: m.price,
        cost: m.baseCost,
        stockQty: stockMap.get(m.id) ?? (m.stopList ? 0 : 20),
        minStock: 5,
        group: m.category === "wine" || m.category === "cocktails" || m.category === "beer" ? "Бар" : "Кухня",
        isService: false,
        source: "restaurant-menu" as any,
      }));
    }

    // 4) Hotel
    if (vertical === "hotel") {
      const GROUP_LABEL: Record<string, string> = {
        minibar: "Mini-bar",
        breakfast: "Сніданок і кухня",
        spa: "SPA / Косметика",
        supplies: "Готельні товари",
        souvenirs: "Сувеніри",
      };
      return HOTEL_NOMENCLATURE_SEED.map<OrderableProduct>((s) => {
        const sup = HOTEL_SUPPLIERS.find((x) => x.name === s.supplier);
        return {
          id: s.id,
          sku: s.sku,
          name: s.name,
          unit: s.unit,
          price: s.price,
          cost: s.cost,
          stockQty: stockMap.get(s.id) ?? s.stock,
          minStock: s.minStock,
          supplierId: sup?.id,
          supplierName: sup?.name ?? s.supplier,
          group: GROUP_LABEL[s.group] ?? s.group,
          isService: false,
          source: "hotel-seed" as any,
        };
      });
    }


    // 4) Legacy NomenclatureItem (інші кабінети)
    const legacy = getNomenclatureForCabinet(cabinet as Cabinet);
    return legacy.map<OrderableProduct>((n) => ({
      id: n.id,
      sku: n.code ?? n.id,
      name: n.name,
      unit: n.unit,
      price: n.price,
      cost: Math.round(n.price * 0.6),
      stockQty: stockMap.get(n.id) ?? 0,
      minStock: 0,
      isService: n.category === "service",
      group: n.category === "service" ? "Послуги" : "Товари",
      source: "settings-legacy",
    }));
  }, [cabinet, stockMap]);
}
