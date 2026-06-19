/**
 * Комерційна оренда в Україні — snapshot станом на квітень 2026.
 * Джерела: огляди CBRE Ukraine, Colliers Ukraine, Cushman & Wakefield Expandia,
 * портали oblikvartir, lun.ua/biznes, dom.ria/commerce, OLX Бізнес.
 * Ціни наведено як «прайм / А-клас» та «середній по сегменту» (середньозважено).
 */

export const COMMERCIAL_RENT_AS_OF = "Квітень 2026";

export type RentSegment = "office" | "retail_street" | "retail_mall" | "warehouse" | "coworking";

export const RENT_SEGMENT_LABEL: Record<RentSegment, string> = {
  office: "Офіси (А/B)",
  retail_street: "Стріт-рітейл",
  retail_mall: "ТРЦ",
  warehouse: "Склади / логістика",
  coworking: "Коворкінги (workplace)",
};

export interface RentRow {
  id: string;
  city: string;
  segment: RentSegment;
  classOrZone: string;
  /** Прайм-ставка (верхня межа) у USD/м²/міс без ПДВ */
  primeUsd: number;
  /** Середня ставка USD/м²/міс */
  avgUsd: number;
  /** Вакантність, % */
  vacancy: number;
  notes?: string;
}

export const COMMERCIAL_RENT_ROWS: RentRow[] = [
  // ── Київ — офіси ──────────────────────────────────────────────────────
  { id: "kyiv-off-a", city: "Київ", segment: "office", classOrZone: "Клас A (Подільський, БЦ Astarta, Gulliver)", primeUsd: 28, avgUsd: 22, vacancy: 22, notes: "Прайм-обʼєкти з укриттям рівня II, резервне живлення 100%." },
  { id: "kyiv-off-b", city: "Київ", segment: "office", classOrZone: "Клас B (Печерський, Шевченківський)", primeUsd: 18, avgUsd: 13, vacancy: 28 },
  { id: "kyiv-off-c", city: "Київ", segment: "office", classOrZone: "Клас C (околиці, конверсії)", primeUsd: 10, avgUsd: 7.5, vacancy: 31 },
  // Київ — рітейл
  { id: "kyiv-ret-prime", city: "Київ", segment: "retail_street", classOrZone: "Хрещатик / В. Васильківська", primeUsd: 110, avgUsd: 75, vacancy: 12 },
  { id: "kyiv-ret-mid", city: "Київ", segment: "retail_street", classOrZone: "Шота Руставелі / Подол", primeUsd: 55, avgUsd: 35, vacancy: 18 },
  { id: "kyiv-mall", city: "Київ", segment: "retail_mall", classOrZone: "Прайм-ТРЦ (Ocean Plaza, Lavina, Gulliver)", primeUsd: 90, avgUsd: 55, vacancy: 9 },
  // Київ — склади
  { id: "kyiv-wh-a", city: "Київ область", segment: "warehouse", classOrZone: "Клас A (Бровари, Бориспіль, Вишгород)", primeUsd: 7.5, avgUsd: 6.2, vacancy: 4, notes: "Дефіцит. Очікування 2026 — будівництво +180 тис. м²." },
  { id: "kyiv-wh-b", city: "Київ область", segment: "warehouse", classOrZone: "Клас B/C", primeUsd: 5.0, avgUsd: 3.8, vacancy: 8 },
  // Київ — коворкінги
  { id: "kyiv-co", city: "Київ", segment: "coworking", classOrZone: "Workplace/hot-desk (Creative Quarter, Chasopys, Regus)", primeUsd: 320, avgUsd: 220, vacancy: 15, notes: "Ціна за робоче місце на міс., dedicated desk." },

  // ── Львів ─────────────────────────────────────────────────────────────
  { id: "lviv-off-a", city: "Львів", segment: "office", classOrZone: "Клас A (Lviv Tech City, !FEST Plaza)", primeUsd: 22, avgUsd: 18, vacancy: 12, notes: "Один з найзаповненіших ринків UA." },
  { id: "lviv-off-b", city: "Львів", segment: "office", classOrZone: "Клас B (Личаківський, Сихів)", primeUsd: 14, avgUsd: 11, vacancy: 18 },
  { id: "lviv-ret", city: "Львів", segment: "retail_street", classOrZone: "Просп. Свободи / Краківська", primeUsd: 65, avgUsd: 45, vacancy: 8 },
  { id: "lviv-mall", city: "Львів", segment: "retail_mall", classOrZone: "Forum Lviv, Victoria Gardens", primeUsd: 70, avgUsd: 45, vacancy: 6 },
  { id: "lviv-wh", city: "Львів область", segment: "warehouse", classOrZone: "Клас A (Рясне, Скнилів)", primeUsd: 7.0, avgUsd: 5.8, vacancy: 3 },
  { id: "lviv-co", city: "Львів", segment: "coworking", classOrZone: "Creative Quarter, iHub, REACTOR", primeUsd: 280, avgUsd: 190, vacancy: 10 },

  // ── Дніпро ────────────────────────────────────────────────────────────
  { id: "dnipro-off-a", city: "Дніпро", segment: "office", classOrZone: "Клас A (БЦ Caspian Plaza, Меркурій)", primeUsd: 16, avgUsd: 12, vacancy: 25 },
  { id: "dnipro-off-b", city: "Дніпро", segment: "office", classOrZone: "Клас B", primeUsd: 10, avgUsd: 7.5, vacancy: 30 },
  { id: "dnipro-ret", city: "Дніпро", segment: "retail_street", classOrZone: "Проспект Дмитра Яворницького", primeUsd: 45, avgUsd: 30, vacancy: 17 },
  { id: "dnipro-mall", city: "Дніпро", segment: "retail_mall", classOrZone: "Мост-Сіті, Most", primeUsd: 50, avgUsd: 32, vacancy: 12 },
  { id: "dnipro-wh", city: "Дніпро область", segment: "warehouse", classOrZone: "Клас A/B (Підгородне)", primeUsd: 5.5, avgUsd: 4.2, vacancy: 7 },

  // ── Одеса ─────────────────────────────────────────────────────────────
  { id: "odesa-off", city: "Одеса", segment: "office", classOrZone: "Клас A/B (центр, Аркадія)", primeUsd: 15, avgUsd: 10, vacancy: 32, notes: "Ринок під тиском через ракетні удари по порту." },
  { id: "odesa-ret", city: "Одеса", segment: "retail_street", classOrZone: "Дерибасівська / Грецька", primeUsd: 50, avgUsd: 30, vacancy: 22 },
  { id: "odesa-wh", city: "Одеса область", segment: "warehouse", classOrZone: "Клас A (Усатове, Чорноморськ)", primeUsd: 5.8, avgUsd: 4.5, vacancy: 11, notes: "Зерно/контейнери — попит зростає з відкриттям коридору." },

  // ── Харків (західна частина) ──────────────────────────────────────────
  { id: "kharkiv-off", city: "Харків", segment: "office", classOrZone: "Клас B (центр, віддалені від ЛБЗ)", primeUsd: 9, avgUsd: 6, vacancy: 45, notes: "Високий ризик; багато офісів простоюють." },
  { id: "kharkiv-ret", city: "Харків", segment: "retail_street", classOrZone: "Сумська / Пушкінська", primeUsd: 28, avgUsd: 18, vacancy: 28 },
  { id: "kharkiv-wh", city: "Харків область", segment: "warehouse", classOrZone: "Західні околиці", primeUsd: 4.5, avgUsd: 3.2, vacancy: 18 },

  // ── Івано-Франківськ / Ужгород / Чернівці (західні хаби) ──────────────
  { id: "if-off", city: "Івано-Франківськ", segment: "office", classOrZone: "Клас B (центр)", primeUsd: 12, avgUsd: 8.5, vacancy: 14 },
  { id: "uzh-off", city: "Ужгород", segment: "office", classOrZone: "Клас B/C", primeUsd: 11, avgUsd: 8, vacancy: 10, notes: "Релокаційний попит з прифронтових регіонів." },
  { id: "chern-off", city: "Чернівці", segment: "office", classOrZone: "Клас B", primeUsd: 10, avgUsd: 7.5, vacancy: 13 },
  { id: "if-wh", city: "Івано-Франківськ область", segment: "warehouse", classOrZone: "Клас B (Тисмениця)", primeUsd: 5.2, avgUsd: 4.0, vacancy: 8 },
  { id: "uzh-wh", city: "Закарпатська область", segment: "warehouse", classOrZone: "Митні склади (Чоп, Соломоново)", primeUsd: 6.8, avgUsd: 5.5, vacancy: 4, notes: "Преміум через сусідство з ЄС-кордоном." },
];

export const COMMERCIAL_RENT_CITIES = Array.from(
  new Set(COMMERCIAL_RENT_ROWS.map((r) => r.city))
).sort((a, b) => a.localeCompare(b, "uk"));

/** Загальні правила і структура договору оренди (для довідкового блоку) */
export const RENT_CONTRACT_NOTES = [
  "Договір комерційної оренди (нежитлове приміщення) — у простій письмовій формі (ст. 793 ЦКУ). Якщо строк ≥ 3 років — нотаріальне посвідчення + держреєстрація (ст. 794 ЦКУ).",
  "Орендна ставка зазвичай в USD з фіксацією у гривні за курсом НБУ на дату виставлення рахунку.",
  "Service charge (експлуатаційні витрати) сплачується додатково: офіси 3–6 USD/м², ТРЦ 8–14 USD/м², склади 0.8–1.5 USD/м².",
  "ПДВ 20% нараховується понад ставку, якщо орендодавець — платник ПДВ.",
  "Депозит — 1–3 місячні ставки. Rent-free період (без сплати) — 1–6 міс. при довгих контрактах.",
  "Індексація: щорічна 3–5% або привʼязка до CPI/HICP єврозони.",
  "Дострокове розірвання — штраф 3–6 місячних ставок (negotiable). Force-majeure щодо воєнних дій — окремий розділ обовʼязковий.",
];
