export interface Deadline {
  id: string;
  date: string;
  title: string;
  daysLeft: number;
  urgency: 'urgent' | 'upcoming' | 'ok';
  taxType: 'fop1' | 'fop2' | 'fop3' | 'tov' | 'all';
  type: 'payment' | 'report';
  legalBasis: string;
  penalty: string;
  quarter: 1 | 2 | 3 | 4;
  isCritical?: boolean;
}

const monthMap: Record<string, number> = {
  'січня': 0, 'лютого': 1, 'березня': 2, 'квітня': 3,
  'травня': 4, 'червня': 5, 'липня': 6, 'серпня': 7,
  'вересня': 8, 'жовтня': 9, 'листопада': 10, 'грудня': 11,
};

function getDaysLeft(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parts = dateString.split(' ');
  const day = parseInt(parts[0]);
  const month = monthMap[parts[1]];
  // Support dates with explicit year like "20 січня 2025"
  const year = parts.length >= 3 && /^\d{4}$/.test(parts[2]) ? parseInt(parts[2]) : today.getFullYear();
  const deadline = new Date(year, month, day);
  // Only roll forward if no explicit year was given
  if (parts.length < 3 && deadline < today) deadline.setFullYear(year + 1);
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getUrgency(daysLeft: number): 'urgent' | 'upcoming' | 'ok' {
  if (daysLeft <= 7) return 'urgent';
  if (daysLeft <= 21) return 'upcoming';
  return 'ok';
}

const DEADLINE_DEFINITIONS = [
  // ════════════════════════════════════════
  // Q1 — СІЧЕНЬ–БЕРЕЗЕНЬ 2026
  // ════════════════════════════════════════

  // Січень
  { id: 'q1-esv-jan', date: '20 січня 2026', title: 'Сплата ЄСВ за грудень 2025', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 1 as const },
  { id: 'q1-ep12-jan', date: '20 січня 2026', title: 'Сплата ЄП ФОП 1-2 груп за грудень 2025', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 1 as const },
  { id: 'q1-pdv-dec-dec', date: '20 січня 2026', title: 'Декларація з ПДВ за грудень 2025', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 1 as const },
  { id: 'q1-pdv-dec-pay', date: '30 січня 2026', title: 'Сплата ПДВ за грудень 2025', taxType: 'tov' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.203.2', penalty: 'штраф 10% суми', quarter: 1 as const },

  // Лютий
  { id: 'q1-dec-fop3-q4', date: '9 лютого 2026', title: 'Декларація ФОП 3 групи за Q4 2025', taxType: 'fop3' as const, type: 'report' as const, legalBasis: 'ПКУ ст.296.3', penalty: 'штраф 340 грн', quarter: 1 as const, isCritical: true },
  { id: 'q1-ep3-q4', date: '19 лютого 2026', title: 'Сплата єдиного податку за Q4 2025', taxType: 'fop3' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 1 as const, isCritical: true },
  { id: 'q1-esv-feb', date: '20 лютого 2026', title: 'Сплата ЄСВ за січень 2026', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 1 as const },
  { id: 'q1-ep12-feb', date: '20 лютого 2026', title: 'Сплата ЄП ФОП 1-2 груп за січень 2026', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 1 as const },
  { id: 'q1-pdv-jan-dec', date: '20 лютого 2026', title: 'Декларація з ПДВ за січень 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 1 as const },
  { id: 'q1-1df-q4', date: '9 лютого 2026', title: 'Податковий розрахунок (4ДФ) за Q4 2025', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.51.1', penalty: 'штраф 510 грн', quarter: 1 as const },

  // Березень
  { id: 'q1-dec-fop12', date: '1 березня 2026', title: 'Декларація ФОП 1-2 груп за 2025 рік', taxType: 'fop1' as const, type: 'report' as const, legalBasis: 'ПКУ ст.296.3', penalty: 'штраф 340 грн', quarter: 1 as const, isCritical: true },
  { id: 'q1-esv-mar', date: '20 березня 2026', title: 'Сплата ЄСВ за лютий 2026', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 1 as const },
  { id: 'q1-ep12-mar', date: '20 березня 2026', title: 'Сплата ЄП ФОП 1-2 груп за лютий 2026', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 1 as const },
  { id: 'q1-pdv-feb-dec', date: '20 березня 2026', title: 'Декларація з ПДВ за лютий 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 1 as const },
  { id: 'q1-pdv-feb-pay', date: '30 березня 2026', title: 'Сплата ПДВ за лютий 2026', taxType: 'tov' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.203.2', penalty: 'штраф 10% суми', quarter: 1 as const },

  // ════════════════════════════════════════
  // Q2 — КВІТЕНЬ–ЧЕРВЕНЬ 2026
  // ════════════════════════════════════════

  // Квітень
  { id: 'q2-esv-apr', date: '20 квітня 2026', title: 'Сплата ЄСВ за березень 2026', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 2 as const },
  { id: 'q2-ep12-apr', date: '20 квітня 2026', title: 'Сплата ЄП ФОП 1-2 груп за березень 2026', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 2 as const },
  { id: 'q2-pdv-mar-dec', date: '20 квітня 2026', title: 'Декларація з ПДВ за березень 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 2 as const },
  { id: 'q2-pdv-mar-pay', date: '30 квітня 2026', title: 'Сплата ПДВ за березень 2026', taxType: 'tov' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.203.2', penalty: 'штраф 10% суми', quarter: 2 as const },

  // Травень
  { id: 'q2-1df-q1', date: '11 травня 2026', title: 'Податковий розрахунок (4ДФ) за Q1 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.51.1', penalty: 'штраф 510 грн', quarter: 2 as const },
  { id: 'q2-dec-prib-q1', date: '11 травня 2026', title: 'Декларація з податку на прибуток за Q1 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.137.5', penalty: 'штраф 340 грн', quarter: 2 as const, isCritical: true },
  { id: 'q2-dec-q1', date: '12 травня 2026', title: 'Декларація ФОП 3 групи за Q1 2026', taxType: 'fop3' as const, type: 'report' as const, legalBasis: 'ПКУ ст.296.3', penalty: 'штраф 340 грн', quarter: 2 as const, isCritical: true },
  { id: 'q2-ep-q1', date: '19 травня 2026', title: 'Сплата єдиного податку за Q1', taxType: 'fop3' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 2 as const, isCritical: true },
  { id: 'q2-esv-may', date: '20 травня 2026', title: 'Сплата ЄСВ за квітень 2026', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 2 as const },
  { id: 'q2-ep12-may', date: '20 травня 2026', title: 'Сплата ЄП ФОП 1-2 груп за квітень 2026', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 2 as const },
  { id: 'q2-pdv-apr-dec', date: '20 травня 2026', title: 'Декларація з ПДВ за квітень 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 2 as const },

  // Червень
  { id: 'q2-esv-jun', date: '22 червня 2026', title: 'Сплата ЄСВ за травень 2026', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 2 as const },
  { id: 'q2-ep12-jun', date: '22 червня 2026', title: 'Сплата ЄП ФОП 1-2 груп за травень 2026', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 2 as const },
  { id: 'q2-pdv-may-dec', date: '22 червня 2026', title: 'Декларація з ПДВ за травень 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 2 as const },
  { id: 'q2-pdv-may-pay', date: '30 червня 2026', title: 'Сплата ПДВ за травень 2026', taxType: 'tov' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.203.2', penalty: 'штраф 10% суми', quarter: 2 as const },

  // ════════════════════════════════════════
  // Q3 — ЛИПЕНЬ–ВЕРЕСЕНЬ 2026
  // ════════════════════════════════════════

  // Липень
  { id: 'q3-esv-jul', date: '20 липня 2026', title: 'Сплата ЄСВ за червень 2026', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 3 as const },
  { id: 'q3-ep12-jul', date: '20 липня 2026', title: 'Сплата ЄП ФОП 1-2 груп за червень 2026', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 3 as const },
  { id: 'q3-pdv-jun-dec', date: '20 липня 2026', title: 'Декларація з ПДВ за червень 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 3 as const },
  { id: 'q3-pdv-jun-pay', date: '30 липня 2026', title: 'Сплата ПДВ за червень 2026', taxType: 'tov' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.203.2', penalty: 'штраф 10% суми', quarter: 3 as const },

  // Серпень
  { id: 'q3-1df-q2', date: '10 серпня 2026', title: 'Податковий розрахунок (4ДФ) за Q2 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.51.1', penalty: 'штраф 510 грн', quarter: 3 as const },
  { id: 'q3-dec-prib-h1', date: '10 серпня 2026', title: 'Декларація з податку на прибуток за H1 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.137.5', penalty: 'штраф 340 грн', quarter: 3 as const, isCritical: true },
  { id: 'q3-dec-q2', date: '11 серпня 2026', title: 'Декларація ФОП 3 групи за Q2 2026', taxType: 'fop3' as const, type: 'report' as const, legalBasis: 'ПКУ ст.296.3', penalty: 'штраф 340 грн', quarter: 3 as const, isCritical: true },
  { id: 'q3-ep-q2', date: '19 серпня 2026', title: 'Сплата єдиного податку за Q2', taxType: 'fop3' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 3 as const, isCritical: true },
  { id: 'q3-esv-aug', date: '20 серпня 2026', title: 'Сплата ЄСВ за липень 2026', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 3 as const },
  { id: 'q3-ep12-aug', date: '20 серпня 2026', title: 'Сплата ЄП ФОП 1-2 груп за липень 2026', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 3 as const },
  { id: 'q3-pdv-jul-dec', date: '20 серпня 2026', title: 'Декларація з ПДВ за липень 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 3 as const },

  // Вересень
  { id: 'q3-esv-sep', date: '22 вересня 2026', title: 'Сплата ЄСВ за серпень 2026', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 3 as const },
  { id: 'q3-ep12-sep', date: '22 вересня 2026', title: 'Сплата ЄП ФОП 1-2 груп за серпень 2026', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 3 as const },
  { id: 'q3-pdv-aug-dec', date: '22 вересня 2026', title: 'Декларація з ПДВ за серпень 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 3 as const },
  { id: 'q3-pdv-aug-pay', date: '30 вересня 2026', title: 'Сплата ПДВ за серпень 2026', taxType: 'tov' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.203.2', penalty: 'штраф 10% суми', quarter: 3 as const },

  // ════════════════════════════════════════
  // Q4 — ЖОВТЕНЬ–ГРУДЕНЬ 2026
  // ════════════════════════════════════════

  // Жовтень
  { id: 'q4-esv-oct', date: '20 жовтня 2026', title: 'Сплата ЄСВ за вересень 2026', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 4 as const },
  { id: 'q4-ep12-oct', date: '20 жовтня 2026', title: 'Сплата ЄП ФОП 1-2 груп за вересень 2026', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 4 as const },
  { id: 'q4-pdv-sep-dec', date: '20 жовтня 2026', title: 'Декларація з ПДВ за вересень 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 4 as const },
  { id: 'q4-pdv-sep-pay', date: '30 жовтня 2026', title: 'Сплата ПДВ за вересень 2026', taxType: 'tov' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.203.2', penalty: 'штраф 10% суми', quarter: 4 as const },

  // Листопад
  { id: 'q4-1df-q3', date: '9 листопада 2026', title: 'Податковий розрахунок (4ДФ) за Q3 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.51.1', penalty: 'штраф 510 грн', quarter: 4 as const },
  { id: 'q4-dec-prib-9m', date: '9 листопада 2026', title: 'Декларація з податку на прибуток за 9 міс 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.137.5', penalty: 'штраф 340 грн', quarter: 4 as const, isCritical: true },
  { id: 'q4-dec-q3', date: '10 листопада 2026', title: 'Декларація ФОП 3 групи за Q3 2026', taxType: 'fop3' as const, type: 'report' as const, legalBasis: 'ПКУ ст.296.3', penalty: 'штраф 340 грн', quarter: 4 as const, isCritical: true },
  { id: 'q4-ep-q3', date: '19 листопада 2026', title: 'Сплата єдиного податку за Q3', taxType: 'fop3' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 4 as const, isCritical: true },
  { id: 'q4-esv-nov', date: '20 листопада 2026', title: 'Сплата ЄСВ за жовтень 2026', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 4 as const },
  { id: 'q4-ep12-nov', date: '20 листопада 2026', title: 'Сплата ЄП ФОП 1-2 груп за жовтень 2026', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 4 as const },
  { id: 'q4-pdv-oct-dec', date: '20 листопада 2026', title: 'Декларація з ПДВ за жовтень 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 4 as const },

  // Грудень
  { id: 'q4-esv-dec', date: '22 грудня 2026', title: 'Сплата ЄСВ за листопад 2026', taxType: 'all' as const, type: 'payment' as const, legalBasis: 'ЗУ №2464-VI ст.9', penalty: 'пеня 0.1% за день', quarter: 4 as const },
  { id: 'q4-ep12-dec', date: '22 грудня 2026', title: 'Сплата ЄП ФОП 1-2 груп за листопад 2026', taxType: 'fop1' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.295.1', penalty: 'штраф 50% від ставки ЄП', quarter: 4 as const },
  { id: 'q4-pdv-nov-dec', date: '22 грудня 2026', title: 'Декларація з ПДВ за листопад 2026', taxType: 'tov' as const, type: 'report' as const, legalBasis: 'ПКУ ст.203.1', penalty: 'штраф 340 грн', quarter: 4 as const },
  { id: 'q4-pdv-nov-pay', date: '30 грудня 2026', title: 'Сплата ПДВ за листопад 2026', taxType: 'tov' as const, type: 'payment' as const, legalBasis: 'ПКУ ст.203.2', penalty: 'штраф 10% суми', quarter: 4 as const },
];

export const DEADLINES: Deadline[] = DEADLINE_DEFINITIONS.map(d => {
  const daysLeft = getDaysLeft(d.date);
  return { ...d, daysLeft, urgency: getUrgency(daysLeft) };
});

export function getCurrentQuarter(): 1 | 2 | 3 | 4 {
  const month = new Date().getMonth();
  if (month < 3) return 1;
  if (month < 6) return 2;
  if (month < 9) return 3;
  return 4;
}
