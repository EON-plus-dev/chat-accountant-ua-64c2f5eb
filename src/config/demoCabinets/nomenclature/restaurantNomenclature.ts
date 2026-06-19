/**
 * RESTAURANT NOMENCLATURE (demo-restaurant-3) — 150 SKU.
 * Базується на `restaurantMenu` з restaurantData.ts (150 готових страв і напоїв).
 * Для розділу «Номенклатура» проектуємо у NomenclatureItemV2.
 */

import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";
import { restaurantMenu } from "../restaurantData";

const CATEGORY_LABEL: Record<string, string> = {
  starters: "Закуски",
  soups: "Супи",
  salads: "Салати",
  mains: "Гарячі страви",
  grill: "Гриль",
  pasta: "Паста",
  pizza: "Піца",
  sides: "Гарніри",
  desserts: "Десерти",
  kids: "Дитяче меню",
  drinks: "Безалкогольні напої",
  cocktails: "Коктейлі",
  wine: "Винна карта",
  beer: "Пиво / Сидр",
};

const SUPPLIER_BY_CAT: Record<string, string> = {
  starters: "ТОВ «Молочна Долина»",
  soups: "ТОВ «М'ясторг Преміум»",
  salads: "ФОП Литвиненко (Овочі)",
  mains: "ТОВ «М'ясторг Преміум»",
  grill: "ТОВ «М'ясторг Преміум»",
  pasta: "ТОВ «Bake & Co»",
  pizza: "ТОВ «Bake & Co»",
  sides: "ФОП Литвиненко (Овочі)",
  desserts: "ТОВ «Bake & Co»",
  kids: "ТОВ «Молочна Долина»",
  drinks: "ТОВ «Coca-Cola Україна»",
  cocktails: "ТОВ «Bartender's Supply»",
  wine: "ТОВ «Винний Дім Україна»",
  beer: "ТОВ «Крафтовий Лагер»",
};

export const restaurantNomenclature: NomenclatureItemV2[] = restaurantMenu.map((m) => ({
  id: m.id,
  sku: m.sku,
  name: m.name,
  category: CATEGORY_LABEL[m.category] ?? m.category,
  unit: m.unit,
  price: m.price,
  cost: m.baseCost,
  stockBalance: m.stopList ? 0 : 10 + ((m.price * 7) % 40),
  minStock: 5,
  supplier: SUPPLIER_BY_CAT[m.category] ?? "ТОВ «Bake & Co»",
  group: m.category === "wine" || m.category === "cocktails" || m.category === "beer" ? "Бар" : "Кухня",
  isService: false,
} as unknown as NomenclatureItemV2));
