/**
 * Комунальні тарифи України — snapshot станом на квітень 2026.
 * Джерела: НКРЕКП (постанови про граничні роздрібні ціни електроенергії і газу),
 * Кабмін (тарифи на тепло/гарячу воду для населення в опалювальний сезон),
 * локальні постанови водоканалів і теплокомуненерго (Київ, Львів, Дніпро, Харків, Одеса).
 * Усі ставки — для нп / бізнесу при відсутності пільг та з ПДВ.
 */

export const UTILITY_TARIFFS_AS_OF = "Квітень 2026";

export type UtilityKind =
  | "electricity"
  | "gas"
  | "heating"
  | "hot_water"
  | "cold_water"
  | "sewage"
  | "waste"
  | "internet";

export type ConsumerSegment = "household" | "business";

export interface UtilityTariff {
  id: string;
  kind: UtilityKind;
  segment: ConsumerSegment;
  /** Назва тарифу/умови */
  name: string;
  /** Постачальник або «загальнодержавний» */
  provider: string;
  /** Місто/регіон. "UA" — по всій країні */
  region: string;
  /** Ціна за одиницю (₴) */
  price: number;
  /** Одиниця виміру */
  unit: string;
  /** Чинність з */
  effectiveFrom: string;
  /** Підстава (постанова, рішення) */
  basis?: string;
  /** Особливі умови, обсяги, формули */
  notes?: string;
}

export const UTILITY_KIND_LABEL: Record<UtilityKind, string> = {
  electricity: "Електроенергія",
  gas: "Природний газ",
  heating: "Теплопостачання",
  hot_water: "Гаряча вода",
  cold_water: "Холодна вода",
  sewage: "Водовідведення",
  waste: "Вивезення сміття",
  internet: "Інтернет / звʼязок",
};

export const SEGMENT_LABEL: Record<ConsumerSegment, string> = {
  household: "Населення",
  business: "Бізнес / небутові",
};

export const UTILITY_TARIFFS: UtilityTariff[] = [
  // ── Електроенергія ────────────────────────────────────────────────────
  {
    id: "el-pop-day",
    kind: "electricity",
    segment: "household",
    name: "Єдиний тариф для побутових споживачів",
    provider: "Постачальники універсальної послуги (ЕК)",
    region: "UA",
    price: 4.32,
    unit: "₴/кВт·год",
    effectiveFrom: "2024-06-01",
    basis: "Пост. КМУ № 483 від 30.04.2024 (продовжено на 2026)",
    notes: "Без диференціації за обсягом. Для НП діє мораторій на підвищення.",
  },
  {
    id: "el-pop-night",
    kind: "electricity",
    segment: "household",
    name: "Двозонний (нічний тариф 23:00–07:00)",
    provider: "Постачальники універсальної послуги",
    region: "UA",
    price: 2.16,
    unit: "₴/кВт·год",
    effectiveFrom: "2024-06-01",
    notes: "Денний 4,32 ₴; нічний 50% денного. Потрібен 2-зонний лічильник.",
  },
  {
    id: "el-biz-2level",
    kind: "electricity",
    segment: "business",
    name: "Небутові споживачі, 2 клас напруги (0,4 кВ)",
    provider: "Ринок електроенергії (BCH + послуги ОСР+ОСП)",
    region: "UA",
    price: 9.85,
    unit: "₴/кВт·год без ПДВ",
    effectiveFrom: "2026-04-01",
    notes: "Орієнтовна ринкова ціна квітень 2026: BCH ~6.8 + ОСР+ОСП ~3.0. З ПДВ ~11,82 ₴.",
  },
  {
    id: "el-biz-1level",
    kind: "electricity",
    segment: "business",
    name: "Небутові споживачі, 1 клас напруги (≥ 27,5 кВ)",
    provider: "Ринок електроенергії",
    region: "UA",
    price: 7.40,
    unit: "₴/кВт·год без ПДВ",
    effectiveFrom: "2026-04-01",
    notes: "Великі промислові споживачі. З ПДВ ~8,88 ₴.",
  },

  // ── Газ ───────────────────────────────────────────────────────────────
  {
    id: "gas-pop",
    kind: "gas",
    segment: "household",
    name: "Природний газ для населення (фіксована ціна)",
    provider: "Газзбут, Нафтогаз, Київські Енергетичні Послуги тощо",
    region: "UA",
    price: 7.96,
    unit: "₴/м³",
    effectiveFrom: "2021-08-01",
    basis: "Пост. КМУ № 859 (мораторій до закінчення воєнного стану + 6 міс.)",
    notes: "Тариф з ПДВ. Розподіл оплачується окремо.",
  },
  {
    id: "gas-rozpodil",
    kind: "gas",
    segment: "household",
    name: "Розподіл газу (доставка)",
    provider: "Облгази",
    region: "UA",
    price: 1.79,
    unit: "₴/м³",
    effectiveFrom: "2025-01-01",
    notes: "Усереднено по облгазах. У різних регіонах 0,99–2,40 ₴/м³.",
  },
  {
    id: "gas-biz",
    kind: "gas",
    segment: "business",
    name: "Природний газ для небутових (ринкова)",
    provider: "Постачальники газу",
    region: "UA",
    price: 22.50,
    unit: "₴/м³ без ПДВ",
    effectiveFrom: "2026-04-01",
    notes: "Орієнтир квітень 2026: 22–25 ₴/м³. З ПДВ ~27 ₴/м³.",
  },

  // ── Теплопостачання і гаряча вода ────────────────────────────────────
  {
    id: "heat-pop",
    kind: "heating",
    segment: "household",
    name: "Теплопостачання — населення (опалювальний сезон)",
    provider: "Теплокомуненерго",
    region: "UA (середнє)",
    price: 1654,
    unit: "₴/Гкал",
    effectiveFrom: "2021-10-01",
    basis: "Пост. КМУ № 1082 (мораторій до закінчення воєнного стану + 6 міс.)",
    notes: "Київ 1647 ₴, Львів 1670 ₴, Харків 1438 ₴, Дніпро 1690 ₴ за Гкал.",
  },
  {
    id: "hw-pop-counter",
    kind: "hot_water",
    segment: "household",
    name: "Гаряча вода (за лічильником)",
    provider: "Теплокомуненерго",
    region: "UA (середнє)",
    price: 95.6,
    unit: "₴/м³",
    effectiveFrom: "2021-10-01",
    notes: "Київ 95,77 ₴/м³, Львів 96,12 ₴/м³, Дніпро 98,30 ₴/м³.",
  },
  {
    id: "heat-biz",
    kind: "heating",
    segment: "business",
    name: "Теплопостачання — небутові споживачі",
    provider: "Теплокомуненерго",
    region: "UA (середнє)",
    price: 4280,
    unit: "₴/Гкал без ПДВ",
    effectiveFrom: "2025-10-01",
    notes: "Ринкова ціна; від 3 200 до 5 500 ₴/Гкал залежно від міста.",
  },

  // ── Вода і водовідведення ────────────────────────────────────────────
  {
    id: "cw-kyiv",
    kind: "cold_water",
    segment: "household",
    name: "Холодна вода — Київ",
    provider: "Київводоканал",
    region: "Київ",
    price: 17.10,
    unit: "₴/м³",
    effectiveFrom: "2025-01-01",
    notes: "Постачання 17,10 ₴/м³ (з ПДВ).",
  },
  {
    id: "sw-kyiv",
    kind: "sewage",
    segment: "household",
    name: "Водовідведення — Київ",
    provider: "Київводоканал",
    region: "Київ",
    price: 13.46,
    unit: "₴/м³",
    effectiveFrom: "2025-01-01",
    notes: "Тариф для населення.",
  },
  {
    id: "cw-lviv",
    kind: "cold_water",
    segment: "household",
    name: "Холодна вода — Львів",
    provider: "Львівводоканал",
    region: "Львів",
    price: 21.83,
    unit: "₴/м³",
    effectiveFrom: "2025-04-01",
  },
  {
    id: "sw-lviv",
    kind: "sewage",
    segment: "household",
    name: "Водовідведення — Львів",
    provider: "Львівводоканал",
    region: "Львів",
    price: 17.46,
    unit: "₴/м³",
    effectiveFrom: "2025-04-01",
  },
  {
    id: "cw-dnipro",
    kind: "cold_water",
    segment: "household",
    name: "Холодна вода — Дніпро",
    provider: "Дніпроводоканал",
    region: "Дніпро",
    price: 19.20,
    unit: "₴/м³",
    effectiveFrom: "2025-01-01",
  },
  {
    id: "sw-dnipro",
    kind: "sewage",
    segment: "household",
    name: "Водовідведення — Дніпро",
    provider: "Дніпроводоканал",
    region: "Дніпро",
    price: 14.74,
    unit: "₴/м³",
    effectiveFrom: "2025-01-01",
  },
  {
    id: "cw-biz-kyiv",
    kind: "cold_water",
    segment: "business",
    name: "Холодна вода — небутові (Київ)",
    provider: "Київводоканал",
    region: "Київ",
    price: 28.55,
    unit: "₴/м³ без ПДВ",
    effectiveFrom: "2025-01-01",
  },
  {
    id: "sw-biz-kyiv",
    kind: "sewage",
    segment: "business",
    name: "Водовідведення — небутові (Київ)",
    provider: "Київводоканал",
    region: "Київ",
    price: 22.40,
    unit: "₴/м³ без ПДВ",
    effectiveFrom: "2025-01-01",
  },

  // ── Сміття ────────────────────────────────────────────────────────────
  {
    id: "waste-kyiv-pop",
    kind: "waste",
    segment: "household",
    name: "Вивезення ТПВ — Київ, населення",
    provider: "Київкомунсервіс",
    region: "Київ",
    price: 31.93,
    unit: "₴/особу/міс",
    effectiveFrom: "2024-01-01",
    notes: "У будинках з контейнерами; приватний сектор інший тариф.",
  },
  {
    id: "waste-lviv-pop",
    kind: "waste",
    segment: "household",
    name: "Вивезення ТПВ — Львів, населення",
    provider: "Збиранка",
    region: "Львів",
    price: 38.50,
    unit: "₴/особу/міс",
    effectiveFrom: "2024-07-01",
  },
  {
    id: "waste-biz",
    kind: "waste",
    segment: "business",
    name: "Вивезення ТПВ — бізнес (контейнер 1,1 м³)",
    provider: "Локальні підрядники",
    region: "UA (середнє)",
    price: 380,
    unit: "₴/вивіз без ПДВ",
    effectiveFrom: "2026-01-01",
    notes: "Київ 350–450 ₴, Львів 380–480 ₴, обласні центри 280–380 ₴.",
  },

  // ── Інтернет/звʼязок ─────────────────────────────────────────────────
  {
    id: "internet-biz-100",
    kind: "internet",
    segment: "business",
    name: "Інтернет 100 Мб/с — бізнес-тариф",
    provider: "Київстар Бізнес, Voli, Lanet, Vega",
    region: "UA (середнє)",
    price: 650,
    unit: "₴/міс без ПДВ",
    effectiveFrom: "2026-04-01",
    notes: "Зі статичною IP. Без статики ~ 450 ₴.",
  },
  {
    id: "internet-pop-100",
    kind: "internet",
    segment: "household",
    name: "Інтернет 100 Мб/с — населення",
    provider: "Локальні провайдери",
    region: "UA (середнє)",
    price: 220,
    unit: "₴/міс",
    effectiveFrom: "2026-01-01",
  },
];

export const UTILITY_REGIONS = Array.from(
  new Set(UTILITY_TARIFFS.map((t) => t.region))
).sort((a, b) => a.localeCompare(b, "uk"));
