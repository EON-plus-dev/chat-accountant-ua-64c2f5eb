// Судовий збір — ставки на 2026 (ЗУ № 3674-VI "Про судовий збір")
// База: розмір прожиткового мінімуму для працездатних осіб на 1 січня — ПМПО 2026 = 3 028 ₴
export const COURT_FEES_AS_OF = "2026-01-15";
export const PMPO_JAN_2026 = 3028;

export type CourtType = "civil" | "commercial" | "administrative" | "supreme";

export const COURT_TYPE_LABEL: Record<CourtType, string> = {
  civil: "Цивільні (загальні)",
  commercial: "Господарські",
  administrative: "Адміністративні",
  supreme: "Верховний Суд",
};

export interface CourtFee {
  id: string;
  court: CourtType;
  action: string;
  forIndividual: string;      // фіз. особа
  forBusiness: string;        // юр. особа / ФОП
  minPmpo?: number;
  maxPmpo?: number;
  legalBasis: string;
}

const f = (n: number) => Math.round(n).toLocaleString("uk-UA") + " ₴";
const pmpo = (k: number) => f(k * PMPO_JAN_2026);

export const COURT_FEES: CourtFee[] = [
  // Цивільні
  { id: "cf-civ-1", court: "civil", action: "Позовна заява майнового характеру",
    forIndividual: `1% ціни позову (мін. ${pmpo(0.4)}, макс. ${pmpo(5)})`,
    forBusiness: `1.5% ціни позову (мін. ${pmpo(1)}, макс. ${pmpo(350)})`,
    minPmpo: 0.4, maxPmpo: 5, legalBasis: "ЗУ № 3674-VI ст. 4 ч. 2 п. 1" },
  { id: "cf-civ-2", court: "civil", action: "Позовна заява немайнового характеру",
    forIndividual: pmpo(0.4),
    forBusiness: pmpo(1),
    legalBasis: "ЗУ № 3674-VI ст. 4 ч. 2 п. 2" },
  { id: "cf-civ-3", court: "civil", action: "Заява про розірвання шлюбу",
    forIndividual: pmpo(0.4),
    forBusiness: "—",
    legalBasis: "ЗУ № 3674-VI ст. 4" },
  { id: "cf-civ-4", court: "civil", action: "Апеляційна скарга у цивільній справі",
    forIndividual: "150% ставки 1-ї інстанції",
    forBusiness: "150% ставки 1-ї інстанції",
    legalBasis: "ЗУ № 3674-VI ст. 4 ч. 2 п. 6" },
  { id: "cf-civ-5", court: "civil", action: "Касаційна скарга у цивільній справі",
    forIndividual: "200% ставки 1-ї інстанції",
    forBusiness: "200% ставки 1-ї інстанції",
    legalBasis: "ЗУ № 3674-VI ст. 4 ч. 2 п. 7" },

  // Господарські
  { id: "cf-com-1", court: "commercial", action: "Позов майнового характеру",
    forIndividual: "—",
    forBusiness: `1.5% ціни позову (мін. ${pmpo(1)}, макс. ${pmpo(350)})`,
    minPmpo: 1, maxPmpo: 350, legalBasis: "ЗУ № 3674-VI ст. 4 ч. 2 п. 2" },
  { id: "cf-com-2", court: "commercial", action: "Позов немайнового характеру",
    forIndividual: "—",
    forBusiness: pmpo(1),
    legalBasis: "ЗУ № 3674-VI ст. 4" },
  { id: "cf-com-3", court: "commercial", action: "Заява про відкриття провадження у справі про банкрутство",
    forIndividual: pmpo(10),
    forBusiness: pmpo(10),
    legalBasis: "ЗУ № 3674-VI ст. 4" },
  { id: "cf-com-4", court: "commercial", action: "Апеляційна скарга у госп. справі",
    forIndividual: "—",
    forBusiness: "150% ставки 1-ї інстанції",
    legalBasis: "ЗУ № 3674-VI ст. 4" },

  // Адміністративні
  { id: "cf-adm-1", court: "administrative", action: "Позов майнового характеру (оскарження ППР)",
    forIndividual: `1% суми позову (мін. ${pmpo(0.4)}, макс. ${pmpo(5)})`,
    forBusiness: `1.5% суми позову (мін. ${pmpo(1)}, макс. ${pmpo(10)})`,
    minPmpo: 1, maxPmpo: 10, legalBasis: "ЗУ № 3674-VI ст. 4 ч. 2 п. 3" },
  { id: "cf-adm-2", court: "administrative", action: "Позов немайнового характеру",
    forIndividual: pmpo(0.4),
    forBusiness: pmpo(1),
    legalBasis: "ЗУ № 3674-VI ст. 4" },
  { id: "cf-adm-3", court: "administrative", action: "Оскарження бездіяльності суб'єкта владних повноважень",
    forIndividual: pmpo(0.4),
    forBusiness: pmpo(1),
    legalBasis: "ЗУ № 3674-VI ст. 4" },

  // Верховний Суд
  { id: "cf-sup-1", court: "supreme", action: "Касаційна скарга (Верховний Суд)",
    forIndividual: "200% ставки 1-ї інстанції",
    forBusiness: "200% ставки 1-ї інстанції",
    legalBasis: "ЗУ № 3674-VI ст. 4 ч. 2 п. 7" },
  { id: "cf-sup-2", court: "supreme", action: "Заява про перегляд за нововиявленими обставинами",
    forIndividual: pmpo(0.4),
    forBusiness: pmpo(1),
    legalBasis: "ЗУ № 3674-VI ст. 4" },
];

// Пільги (ст. 5 ЗУ № 3674-VI) — повний перелік скорочено
export const COURT_FEE_EXEMPTIONS: { who: string; what: string }[] = [
  { who: "Позивачі — у справах про стягнення зарплати", what: "Звільнені від збору повністю" },
  { who: "Позивачі — про відшкодування шкоди здоров'ю", what: "Звільнені повністю" },
  { who: "Інваліди I–II групи, законні представники дітей-інвалідів", what: "Звільнені повністю" },
  { who: "Учасники бойових дій, ветерани війни", what: "Звільнені повністю" },
  { who: "Позивачі — про стягнення аліментів, поновлення прав дітей", what: "Звільнені повністю" },
  { who: "ВПО — у справах щодо реалізації прав ВПО", what: "Звільнені повністю" },
];
