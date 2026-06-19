// Мінімальні гонорари адвокатів — рекомендовані ставки НААУ
// (Положення про мінімальні ставки гонорару адвоката, затв. РАУ 27.09.2019, чинне з оновленнями 2024-2025)
// Розраховуються від прожиткового мінімуму для працездатних осіб (ПМПО 2026 = 3 028 ₴)
export const LAWYER_FEES_AS_OF = "2026-01-15";
export const PMPO_2026 = 3028; // прожитковий мінімум для працездатних

export type LawyerService =
  | "consultation"     // консультації
  | "criminal"         // кримінальні справи
  | "civil"            // цивільні
  | "commercial"       // господарські
  | "administrative"   // адміністративні
  | "documents"        // підготовка документів
  | "representation";  // представництво

export const LAWYER_SERVICE_LABEL: Record<LawyerService, string> = {
  consultation: "Консультації",
  criminal: "Кримінальні",
  civil: "Цивільні",
  commercial: "Господарські",
  administrative: "Адміністративні",
  documents: "Документи",
  representation: "Представництво",
};

export interface LawyerFee {
  id: string;
  category: LawyerService;
  service: string;
  minPmpo: number;       // мінімум у ПМПО
  minUah: number;        // мінімум у ₴
  marketRange: string;   // ринковий діапазон Київ 2026
  notes?: string;
}

const calc = (pmpo: number) => Math.round(pmpo * PMPO_2026);

export const LAWYER_FEES: LawyerFee[] = [
  // Консультації
  { id: "l-cons-1", category: "consultation", service: "Усна консультація (до 1 год)", minPmpo: 0.5, minUah: calc(0.5), marketRange: "500 – 2 500 ₴" },
  { id: "l-cons-2", category: "consultation", service: "Письмова правова консультація / висновок", minPmpo: 2, minUah: calc(2), marketRange: "3 000 – 15 000 ₴" },
  { id: "l-cons-3", category: "consultation", service: "Аналіз договору (до 10 стор.)", minPmpo: 1, minUah: calc(1), marketRange: "2 000 – 8 000 ₴" },

  // Кримінальні
  { id: "l-cr-1", category: "criminal", service: "Захист на досудовому розслідуванні (за день)", minPmpo: 1.5, minUah: calc(1.5), marketRange: "5 000 – 25 000 ₴/день" },
  { id: "l-cr-2", category: "criminal", service: "Захист у суді 1-ї інстанції (за день засідання)", minPmpo: 2, minUah: calc(2), marketRange: "7 000 – 30 000 ₴/день" },
  { id: "l-cr-3", category: "criminal", service: "Апеляційне оскарження (повний цикл)", minPmpo: 10, minUah: calc(10), marketRange: "30 000 – 150 000 ₴" },
  { id: "l-cr-4", category: "criminal", service: "Касаційне оскарження", minPmpo: 15, minUah: calc(15), marketRange: "50 000 – 200 000 ₴" },

  // Цивільні
  { id: "l-civ-1", category: "civil", service: "Розлучення (за згодою) — без суду", minPmpo: 3, minUah: calc(3), marketRange: "5 000 – 15 000 ₴" },
  { id: "l-civ-2", category: "civil", service: "Розлучення через суд + поділ майна", minPmpo: 10, minUah: calc(10), marketRange: "30 000 – 100 000 ₴" },
  { id: "l-civ-3", category: "civil", service: "Стягнення аліментів", minPmpo: 5, minUah: calc(5), marketRange: "10 000 – 30 000 ₴" },
  { id: "l-civ-4", category: "civil", service: "Спадкові спори (повний цикл)", minPmpo: 10, minUah: calc(10), marketRange: "25 000 – 150 000 ₴" },

  // Господарські
  { id: "l-com-1", category: "commercial", service: "Стягнення боргу (господарський суд)", minPmpo: 8, minUah: calc(8), marketRange: "20 000 – 100 000 ₴ + % від суми" },
  { id: "l-com-2", category: "commercial", service: "Банкрутство (супровід процедури)", minPmpo: 30, minUah: calc(30), marketRange: "100 000 – 500 000 ₴" },
  { id: "l-com-3", category: "commercial", service: "Корпоративні спори", minPmpo: 15, minUah: calc(15), marketRange: "50 000 – 300 000 ₴" },

  // Адміністративні
  { id: "l-ad-1", category: "administrative", service: "Оскарження ППР (податкове повідомлення-рішення)", minPmpo: 5, minUah: calc(5), marketRange: "15 000 – 80 000 ₴ + % від донарахувань" },
  { id: "l-ad-2", category: "administrative", service: "Оскарження рішень держорганів (1 інстанція)", minPmpo: 5, minUah: calc(5), marketRange: "15 000 – 60 000 ₴" },

  // Документи
  { id: "l-doc-1", category: "documents", service: "Складання договору", minPmpo: 2, minUah: calc(2), marketRange: "3 000 – 15 000 ₴" },
  { id: "l-doc-2", category: "documents", service: "Позовна заява (цивільна/господарська)", minPmpo: 3, minUah: calc(3), marketRange: "5 000 – 25 000 ₴" },
  { id: "l-doc-3", category: "documents", service: "Апеляційна / касаційна скарга", minPmpo: 5, minUah: calc(5), marketRange: "10 000 – 50 000 ₴" },
  { id: "l-doc-4", category: "documents", service: "Адвокатський запит", minPmpo: 0.5, minUah: calc(0.5), marketRange: "1 500 – 5 000 ₴" },

  // Представництво
  { id: "l-rep-1", category: "representation", service: "Участь у суді (1 засідання)", minPmpo: 1.5, minUah: calc(1.5), marketRange: "3 500 – 15 000 ₴/засідання" },
  { id: "l-rep-2", category: "representation", service: "Представництво в держорганах (день)", minPmpo: 1, minUah: calc(1), marketRange: "2 500 – 10 000 ₴/день" },
];
