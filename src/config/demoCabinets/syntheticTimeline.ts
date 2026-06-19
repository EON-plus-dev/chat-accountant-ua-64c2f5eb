/**
 * SYNTHETIC TIMELINE GENERATOR
 * --------------------------------------------------------------
 * Builds a deterministic 12-month dataset (2025-05-01 → 2026-04-30)
 * for every demo cabinet so that analytics has real data for any
 * period: today / week / month / quarter / year / custom.
 *
 * Curated records in *Data.ts files remain untouched — generator
 * output is appended on top of them in getters.
 *
 * Determinism: PRNG is seeded with cabinetId, so the same numbers
 * are produced on every render (no flicker, no storage).
 */

import type { IncomeBookRecord, PaymentType, DataSource } from "@/config/incomeBookConfig";
import type {
  TaxPayment,
  SalaryPayment,
  ContractorPayment,
} from "@/config/paymentsConfig";
import type { Document } from "@/config/documentFlowConfig";
import type { Employee } from "@/config/employeesConfig";

// ── Fixed "today" for the project (per Core memory: April 2026) ──
const AS_OF = new Date("2026-04-30T18:00:00");
const TIMELINE_START = new Date("2025-05-01T00:00:00");

// ── Deterministic PRNG (mulberry32) ──
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const isoDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const isoDateTime = (d: Date) =>
  `${isoDate(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;

const MONTHS_UA = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
];

// Seasonality multipliers per month index (0=Jan)
const SEASON: number[] = [
  0.85, 0.95, 1.15, 1.05, 1.0, 1.15, 1.0, 0.85, 1.05, 1.1, 1.15, 1.05,
];

// Working-day weight (Sun=0..Sat=6)
const DAY_WEIGHT = [0.15, 1.0, 1.0, 1.05, 1.05, 0.95, 0.35];

// ── Cabinet profiles ──
interface CabinetProfile {
  cabinetId: string;
  cabinetName: string;
  cabinetCode: string;
  /** average per-transaction value (UAH) */
  avgCheck: number;
  /** mean number of income transactions per business day */
  avgDailyTx: number;
  /** ЄП rate, fraction (0.05 = 5%) */
  epRate: number;
  /** flat ЄСВ minimum (₴/month) for the year — 2025/26 demo value */
  esvMonthly: number;
  payers: { name: string; code: string; iban: string; weight: number }[];
  expenseCategories: {
    code: string;
    label: string;
    contractor: string;
    contractorCode: string;
    iban: string;
    base: number; // ₴/month
    purposeType: "rent" | "services" | "goods" | "works" | "other";
    monthlyVar: number; // 0..1
  }[];
}

const COMMON_BANK_IBAN = "UA213223130000026007233566001";

const PROFILES: Record<string, CabinetProfile> = {
  "demo-consulting-3": {
    cabinetId: "demo-consulting-3",
    cabinetName: "ФОП Шевченко М.О.",
    cabinetCode: "3112345678",
    avgCheck: 25000,
    avgDailyTx: 2.4,
    epRate: 0.05,
    esvMonthly: 1760,
    payers: [
      { name: "ТОВ «АльфаГруп»", code: "12345678", iban: "UA113052990000026000010001234", weight: 0.25 },
      { name: "ТОВ «БетаСофт»", code: "87654321", iban: "UA213052990000026000020009876", weight: 0.20 },
      { name: "ТОВ «ГаммаПлюс»", code: "23456789", iban: "UA313052990000026000030005555", weight: 0.14 },
      { name: "ТОВ «ДельтаКонсалт»", code: "34567890", iban: "UA413052990000026000040001111", weight: 0.10 },
      { name: "ФОП Мельник О.В.", code: "3456789012", iban: "UA513052990000026000050002222", weight: 0.08 },
      { name: "ТОВ «ЕпсілонТех»", code: "45678901", iban: "UA613052990000026000060003333", weight: 0.07 },
      { name: "ТОВ «ЗетаПром»", code: "56789012", iban: "UA713052990000026000070004444", weight: 0.06 },
      { name: "ФОП Іваненко А.С.", code: "3201234567", iban: "UA813052990000026000080005555", weight: 0.05 },
      { name: "ТОВ «ЕтаГруп»", code: "67890123", iban: "UA913052990000026000090006666", weight: 0.05 },
    ],
    expenseCategories: [
      { code: "rent", label: "Оренда офісу", contractor: "ТОВ «БЦ Хрещатик»", contractorCode: "11223344", iban: "UA111052990000026000111001111", base: 18000, purposeType: "rent", monthlyVar: 0.05 },
      { code: "subscriptions", label: "Підписки SaaS", contractor: "ТОВ «Софт Сервіс»", contractorCode: "22334455", iban: "UA112052990000026000222002222", base: 6500, purposeType: "services", monthlyVar: 0.15 },
      { code: "marketing", label: "Маркетинг та реклама", contractor: "ФОП Сидоренко Р.І.", contractorCode: "3445566778", iban: "UA113052990000026000333003333", base: 12000, purposeType: "services", monthlyVar: 0.35 },
      { code: "outsourcing", label: "Аутсорсинг", contractor: "ТОВ «Юристи&Партнери»", contractorCode: "33445566", iban: "UA114052990000026000444004444", base: 9500, purposeType: "services", monthlyVar: 0.25 },
      { code: "telecom", label: "Зв'язок та інтернет", contractor: "ПрАТ «Київстар»", contractorCode: "21673832", iban: "UA115052990000026000555005555", base: 1800, purposeType: "services", monthlyVar: 0.05 },
    ],
  },
  "demo-autorepair-2": {
    cabinetId: "demo-autorepair-2",
    cabinetName: "ФОП Коваленко В.П.",
    cabinetCode: "2890123456",
    avgCheck: 4500,
    avgDailyTx: 7.2,
    epRate: 0.05,
    esvMonthly: 1760,
    payers: [
      { name: "Фізична особа (готівка PRRO)", code: "", iban: "", weight: 0.45 },
      { name: "ТОВ «Автотранс»", code: "13579246", iban: "UA213052990000026000110001234", weight: 0.12 },
      { name: "ТОВ «Логістик-Експрес»", code: "24681357", iban: "UA313052990000026000120002345", weight: 0.10 },
      { name: "ФОП Бондар П.І.", code: "3012345678", iban: "UA413052990000026000130003456", weight: 0.08 },
      { name: "ТОВ «ТаксіФлот»", code: "35792468", iban: "UA513052990000026000140004567", weight: 0.08 },
      { name: "ФОП Литвин Р.С.", code: "3098765432", iban: "UA613052990000026000150005678", weight: 0.07 },
      { name: "ТОВ «ДоставкаЕкспрес»", code: "46813579", iban: "UA713052990000026000160006789", weight: 0.05 },
      { name: "ФОП Гончар О.М.", code: "3076543210", iban: "UA813052990000026000170007890", weight: 0.05 },
    ],
    expenseCategories: [
      { code: "parts", label: "Запчастини", contractor: "ТОВ «АвтоДеталь»", contractorCode: "31415926", iban: "UA101052990000026000211001111", base: 28000, purposeType: "goods", monthlyVar: 0.20 },
      { code: "rent", label: "Оренда СТО", contractor: "ТОВ «Промбаза»", contractorCode: "27182818", iban: "UA102052990000026000222002222", base: 22000, purposeType: "rent", monthlyVar: 0.0 },
      { code: "tools", label: "Інструменти та витратні", contractor: "ТОВ «ПрофТул»", contractorCode: "16180339", iban: "UA103052990000026000233003333", base: 5500, purposeType: "goods", monthlyVar: 0.30 },
      { code: "utilities", label: "Комунальні послуги", contractor: "КП «Київводоканал»", contractorCode: "03327664", iban: "UA104052990000026000244004444", base: 4200, purposeType: "services", monthlyVar: 0.10 },
      { code: "marketing", label: "Реклама", contractor: "ФОП Скляр Т.В.", contractorCode: "3022334455", iban: "UA105052990000026000255005555", base: 3500, purposeType: "services", monthlyVar: 0.40 },
    ],
  },
  "demo-it-3": {
    cabinetId: "demo-it-3",
    cabinetName: "ФОП Мельник Д.С.",
    cabinetCode: "3334567890",
    avgCheck: 95000,
    avgDailyTx: 0.45,
    epRate: 0.05,
    esvMonthly: 1760,
    payers: [
      { name: "Acme Inc. (USA)", code: "", iban: "UA213052990000026200110001234", weight: 0.40 },
      { name: "Globex GmbH (DE)", code: "", iban: "UA313052990000026200120002345", weight: 0.30 },
      { name: "Initech Ltd (UK)", code: "", iban: "UA413052990000026200130003456", weight: 0.18 },
      { name: "Stark Industries (USA)", code: "", iban: "UA513052990000026200140004567", weight: 0.07 },
      { name: "Wayne Enterprises (USA)", code: "", iban: "UA613052990000026200150005678", weight: 0.05 },
    ],
    expenseCategories: [
      { code: "subscriptions", label: "Хмарні сервіси", contractor: "AWS Ireland", contractorCode: "", iban: "UA101052990000026300111001111", base: 14000, purposeType: "services", monthlyVar: 0.15 },
      { code: "tools", label: "ПЗ та підписки", contractor: "ТОВ «Софт Сервіс»", contractorCode: "22334455", iban: "UA102052990000026300122002222", base: 4500, purposeType: "services", monthlyVar: 0.10 },
      { code: "outsourcing", label: "Підрядники-розробники", contractor: "ФОП Сидоренко Р.І.", contractorCode: "3445566778", iban: "UA103052990000026300133003333", base: 35000, purposeType: "works", monthlyVar: 0.25 },
      { code: "office", label: "Коворкінг", contractor: "ТОВ «Creative Quarter»", contractorCode: "37653421", iban: "UA104052990000026300144004444", base: 8000, purposeType: "rent", monthlyVar: 0.0 },
    ],
  },
  "demo-dealer-2": {
    cabinetId: "demo-dealer-2",
    cabinetName: "ФОП Іваненко С.М.",
    cabinetCode: "2667890123",
    avgCheck: 380000,
    avgDailyTx: 0.35,
    epRate: 0.05,
    esvMonthly: 1760,
    payers: [
      { name: "ТОВ «Автоцентр Київ»", code: "78901234", iban: "UA213052990000026400110001234", weight: 0.30 },
      { name: "ТОВ «АвтоТрейд»", code: "89012345", iban: "UA313052990000026400120002345", weight: 0.22 },
      { name: "ТОВ «АвтоПарк»", code: "90123456", iban: "UA413052990000026400130003456", weight: 0.18 },
      { name: "Фізична особа (купівля авто)", code: "", iban: "", weight: 0.15 },
      { name: "ФОП Яценко К.В.", code: "3199887766", iban: "UA513052990000026400140004567", weight: 0.08 },
      { name: "ТОВ «Лізинг-Експерт»", code: "01234567", iban: "UA613052990000026400150005678", weight: 0.07 },
    ],
    expenseCategories: [
      { code: "purchase", label: "Закупка авто", contractor: "ТОВ «Імпорт-Авто»", contractorCode: "44556677", iban: "UA101052990000026500111001111", base: 280000, purposeType: "goods", monthlyVar: 0.30 },
      { code: "rent", label: "Оренда салону", contractor: "ТОВ «Молл-Інвест»", contractorCode: "55667788", iban: "UA102052990000026500122002222", base: 45000, purposeType: "rent", monthlyVar: 0.0 },
      { code: "marketing", label: "Реклама та промо", contractor: "ТОВ «Медіа-Партнер»", contractorCode: "66778899", iban: "UA103052990000026500133003333", base: 28000, purposeType: "services", monthlyVar: 0.40 },
      { code: "logistics", label: "Логістика та доставка", contractor: "ТОВ «АвтоЛогіст»", contractorCode: "77889900", iban: "UA104052990000026500144004444", base: 18000, purposeType: "services", monthlyVar: 0.20 },
    ],
  },
  "demo-individual-declarant": {
    cabinetId: "demo-individual-declarant",
    cabinetName: "Петренко Олена Іванівна",
    cabinetCode: "2987654321",
    avgCheck: 18000,
    avgDailyTx: 1.2,
    epRate: 0, // не ФОП — ЄП не нараховується
    esvMonthly: 0,
    payers: [
      { name: "ТОВ «Робота-Київ»", code: "11112222", iban: "UA213052990000026600110001234", weight: 0.50 }, // зарплата
      { name: "Орендар (фіз. особа)", code: "", iban: "", weight: 0.25 }, // оренда нерухомості
      { name: "Interactive Brokers", code: "", iban: "UA313052990000026600120002345", weight: 0.15 }, // дивіденди/інвестиції
      { name: "Київська Школа Економіки", code: "21540488", iban: "UA413052990000026600130003456", weight: 0.06 }, // викладання
      { name: "Одноразові надходження", code: "", iban: "", weight: 0.04 },
    ],
    expenseCategories: [
      { code: "utilities", label: "Комунальні послуги", contractor: "КП «Київенерго»", contractorCode: "00130877", iban: "UA101052990000026700111001111", base: 3500, purposeType: "services", monthlyVar: 0.30 },
      { code: "telecom", label: "Зв'язок та інтернет", contractor: "ПрАТ «Київстар»", contractorCode: "21673832", iban: "UA102052990000026700122002222", base: 800, purposeType: "services", monthlyVar: 0.05 },
      { code: "education", label: "Освіта (вирахування)", contractor: "Київська Школа Економіки", contractorCode: "21540488", iban: "UA103052990000026700133003333", base: 4500, purposeType: "services", monthlyVar: 0.50 },
      { code: "medicine", label: "Медицина (вирахування)", contractor: "Медичний центр «Добробут»", contractorCode: "33446655", iban: "UA104052990000026700144004444", base: 2200, purposeType: "services", monthlyVar: 0.40 },
    ],
  },
};

const PAY_TYPES: PaymentType[] = ["bank", "card", "prro", "cash"];
const SOURCES: DataSource[] = ["monobank", "privat24", "way4pay", "liqpay", "prro"];

function pickWeighted<T extends { weight: number }>(items: T[], rand: () => number): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rand() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

// log-normal-ish around target
function lognAround(target: number, sigma: number, rand: () => number): number {
  // Box–Muller
  const u1 = Math.max(rand(), 1e-9);
  const u2 = rand();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const factor = Math.exp(sigma * z);
  return Math.max(50, Math.round(target * factor));
}

// ── Public types ──
export interface SyntheticTimeline {
  income: IncomeBookRecord[];
  taxes: TaxPayment[];
  salaries: SalaryPayment[];
  contractorPayments: ContractorPayment[];
  documents: Document[];
}

// Cache by cabinetId — generation is pure but not free.
const CACHE = new Map<string, SyntheticTimeline>();

export function generateTimeline(
  cabinetId: string,
  employees: Employee[] = [],
): SyntheticTimeline {
  const cached = CACHE.get(cabinetId);
  if (cached) return cached;
  const profile = PROFILES[cabinetId];
  if (!profile) {
    const empty: SyntheticTimeline = {
      income: [], taxes: [], salaries: [], contractorPayments: [], documents: [],
    };
    CACHE.set(cabinetId, empty);
    return empty;
  }

  const rand = mulberry32(hashString(cabinetId));
  const income: IncomeBookRecord[] = [];
  const taxes: TaxPayment[] = [];
  const salaries: SalaryPayment[] = [];
  const contractorPayments: ContractorPayment[] = [];
  const documents: Document[] = [];

  // Pre-aggregate per (year, month) for tax computation
  const monthlyIncomeBook: Map<string, number> = new Map(); // "YYYY-MM" → sum

  let incomeSeq = 0;
  let docSeq = 0;
  let cpSeq = 0;

  // Iterate every day in the timeline
  const cursor = new Date(TIMELINE_START);
  while (cursor.getTime() <= AS_OF.getTime()) {
    const monthIdx = cursor.getMonth();
    const dow = cursor.getDay();
    const isToday = isoDate(cursor) === isoDate(AS_OF);
    const seasonMul = SEASON[monthIdx];
    const dayMul = DAY_WEIGHT[dow];

    // Expected tx count today
    const expected = profile.avgDailyTx * seasonMul * dayMul;
    const intCount = Math.floor(expected);
    const fracCount = rand() < expected - intCount ? 1 : 0;
    const txCount = intCount + fracCount;

    for (let i = 0; i < txCount; i++) {
      // Random hour: business hours 9-19, today bias toward earlier hours
      const hour = isToday
        ? 9 + Math.floor(rand() * Math.max(1, AS_OF.getHours() - 9))
        : 9 + Math.floor(rand() * 10);
      const minute = Math.floor(rand() * 60);
      const ts = new Date(cursor);
      ts.setHours(hour, minute, 0, 0);

      const payer = pickWeighted(profile.payers, rand);
      const amount = lognAround(profile.avgCheck * seasonMul, 0.55, rand);

      // Status mix: 90% income, 5% not-income, 3% return, 2% needs-clarification
      const statusRoll = rand();
      let status: IncomeBookRecord["status"] = "income";
      let issueType: IncomeBookRecord["issueType"] | undefined;
      let inIncomeBook = amount;
      let returnAmount: number | undefined;
      if (statusRoll < 0.02) {
        status = "needs-clarification";
        const issues: IncomeBookRecord["issueType"][] = [
          "missing-purpose", "unknown-contractor", "classification", "missing-document",
        ];
        issueType = issues[Math.floor(rand() * issues.length)];
        inIncomeBook = 0;
      } else if (statusRoll < 0.05) {
        status = "return";
        returnAmount = amount;
        inIncomeBook = -amount;
      } else if (statusRoll < 0.10) {
        status = "not-income";
        inIncomeBook = 0;
      }

      const paymentType = payer.iban
        ? "bank"
        : PAY_TYPES[Math.floor(rand() * PAY_TYPES.length)];
      const source: DataSource = paymentType === "cash"
        ? "manual"
        : paymentType === "prro"
        ? "prro"
        : SOURCES[Math.floor(rand() * (SOURCES.length - 1))];

      incomeSeq += 1;
      const recId = `gen-${cabinetId}-inc-${incomeSeq}`;

      // 80% have linked document
      let documentNumber: string | undefined;
      let documentFlowId: string | undefined;
      if (status === "income" && rand() < 0.8) {
        docSeq += 1;
        const docNum = `АКТ-${cursor.getFullYear()}-${String(docSeq).padStart(4, "0")}`;
        documentNumber = docNum;
        documentFlowId = `gen-${cabinetId}-doc-${docSeq}`;

        // Randomize doc status: 80% signed, 12% draft, 5% sent, 3% pending-sign
        const docRoll = rand();
        const docStatus: Document["status"] =
          docRoll < 0.80 ? "signed" :
          docRoll < 0.92 ? "draft" :
          docRoll < 0.97 ? "sent" : "pending-sign";

        documents.push({
          id: documentFlowId,
          cabinetId,
          cabinetName: profile.cabinetName,
          cabinetCode: profile.cabinetCode,
          number: docNum,
          type: "act",
          category: "primary",
          title: `Акт виконаних робіт ${docNum}`,
          date: isoDate(cursor),
          dueDate: isoDate(new Date(cursor.getTime() + 14 * 86400000)),
          amount,
          currency: "UAH",
          contractor: payer.code
            ? { id: `gen-c-${payer.code}`, name: payer.name, code: payer.code }
            : { id: `gen-c-anon-${incomeSeq}`, name: payer.name, code: "" },
          status: docStatus,
          retentionPeriod: 5,
          createdAt: isoDateTime(ts),
          createdBy: "owner",
          updatedAt: isoDateTime(ts),
          aiSummary: `Акт на ${amount.toLocaleString("uk-UA")} ₴, контрагент — ${payer.name}.`,
        });
      }

      income.push({
        id: recId,
        date: isoDate(cursor),
        description: status === "return"
          ? `Повернення коштів — ${payer.name}`
          : status === "not-income"
          ? "Внутрішній переказ"
          : `Оплата за послуги — ${payer.name}`,
        contractor: payer.name || undefined,
        contractorCode: payer.code || undefined,
        contractorIban: payer.iban || undefined,
        amount,
        returnAmount,
        inIncomeBook,
        paymentType,
        source,
        status,
        issueType,
        txnId: `T${ts.getTime()}${i}`,
        documentNumber,
        documentFlowId,
      });

      if (inIncomeBook > 0) {
        const mk = `${cursor.getFullYear()}-${pad2(monthIdx + 1)}`;
        monthlyIncomeBook.set(mk, (monthlyIncomeBook.get(mk) || 0) + inIncomeBook);
      }
    }

    // ── monthly things on 1st-of-month boundary ──
    if (cursor.getDate() === 1) {
      // Deferred — we generate taxes/salaries/expenses for the *previous* month
      // when we cross into a new month, so monthlyIncomeBook is final.
      const prev = new Date(cursor);
      prev.setDate(0); // last day of previous month
      const py = prev.getFullYear();
      const pm = prev.getMonth(); // 0-based
      const pmKey = `${py}-${pad2(pm + 1)}`;
      const periodLabel = `${MONTHS_UA[pm]} ${py}`;
      const monthIncome = monthlyIncomeBook.get(pmKey) || 0;

      // ── ЄП monthly (3 group, 5%) — actually quarterly, but ЄП-ФОП-3гр сплачується
      //    за квартал, не місяць. Тому генеруємо тільки на 1 квітня/липня/жовтня/січня.
      // ── Здаються: ЄП — щоквартально, ЄСВ — щоквартально, ВЗ — щоквартально (з 2024).

      // ЄП (квартал)
      if (profile.epRate > 0 && (pm === 2 || pm === 5 || pm === 8 || pm === 11)) {
        // pm is last month of quarter (Mar=2, Jun=5, Sep=8, Dec=11)
        const qStartMonth = pm - 2;
        let qSum = 0;
        for (let m = qStartMonth; m <= pm; m++) {
          qSum += monthlyIncomeBook.get(`${py}-${pad2(m + 1)}`) || 0;
        }
        const qLabel = `${["І", "ІІ", "ІІІ", "IV"][Math.floor(pm / 3)]} квартал ${py}`;
        const epAmount = Math.round(qSum * profile.epRate);
        const deadline = new Date(py, pm + 1, 19); // до 19-го наступного місяця після кварталу
        const paidRoll = rand();
        const isPaid = deadline < AS_OF && paidRoll < 0.85;
        const isOverdue = deadline < AS_OF && !isPaid && paidRoll < 0.95;
        taxes.push({
          id: `gen-${cabinetId}-tax-ep-${py}-q${Math.floor(pm / 3) + 1}`,
          cabinetId,
          taxType: "ep",
          taxTypeLabel: "Єдиний податок (3 гр.)",
          period: qLabel,
          year: py,
          quarter: Math.floor(pm / 3) + 1,
          amountToPay: epAmount,
          status: isPaid ? "paid" : isOverdue ? "overdue" : "scheduled",
          statusLabel: isPaid ? "Оплачено" : isOverdue ? "Прострочено" : "Заплановано",
          deadline: isoDate(deadline),
          paidDate: isPaid ? isoDate(new Date(deadline.getTime() - Math.floor(rand() * 5) * 86400000)) : undefined,
          paidAmount: isPaid ? epAmount : undefined,
          createdAt: isoDateTime(new Date(py, pm + 1, 1)),
          calculatedFromIncome: qSum,
          taxRate: profile.epRate,
          incomeBookPeriodStart: `${py}-${pad2(qStartMonth + 1)}-01`,
          incomeBookPeriodEnd: isoDate(prev),
        });

        // ЄСВ (квартал)
        if (profile.esvMonthly > 0) {
          const esvAmount = profile.esvMonthly * 3;
          const esvDeadline = new Date(py, pm + 1, 19);
          const esvPaidRoll = rand();
          const esvIsPaid = esvDeadline < AS_OF && esvPaidRoll < 0.88;
          const esvIsOverdue = esvDeadline < AS_OF && !esvIsPaid && esvPaidRoll < 0.97;
          taxes.push({
            id: `gen-${cabinetId}-tax-esv-${py}-q${Math.floor(pm / 3) + 1}`,
            cabinetId,
            taxType: "esv",
            taxTypeLabel: "ЄСВ ФОП",
            period: qLabel,
            year: py,
            quarter: Math.floor(pm / 3) + 1,
            amountToPay: esvAmount,
            status: esvIsPaid ? "paid" : esvIsOverdue ? "overdue" : "scheduled",
            statusLabel: esvIsPaid ? "Оплачено" : esvIsOverdue ? "Прострочено" : "Заплановано",
            deadline: isoDate(esvDeadline),
            paidDate: esvIsPaid ? isoDate(new Date(esvDeadline.getTime() - Math.floor(rand() * 5) * 86400000)) : undefined,
            paidAmount: esvIsPaid ? esvAmount : undefined,
            createdAt: isoDateTime(new Date(py, pm + 1, 1)),
          });
        }

        // ВЗ ФОП (квартал, 1% від обороту з 2024)
        const vzAmount = Math.round(qSum * 0.01);
        if (vzAmount > 0) {
          const vzDeadline = new Date(py, pm + 1, 19);
          const vzPaidRoll = rand();
          const vzIsPaid = vzDeadline < AS_OF && vzPaidRoll < 0.85;
          const vzIsOverdue = vzDeadline < AS_OF && !vzIsPaid && vzPaidRoll < 0.95;
          taxes.push({
            id: `gen-${cabinetId}-tax-vz-${py}-q${Math.floor(pm / 3) + 1}`,
            cabinetId,
            taxType: "military-fop",
            taxTypeLabel: "Військовий збір ФОП",
            period: qLabel,
            year: py,
            quarter: Math.floor(pm / 3) + 1,
            amountToPay: vzAmount,
            status: vzIsPaid ? "paid" : vzIsOverdue ? "overdue" : "scheduled",
            statusLabel: vzIsPaid ? "Оплачено" : vzIsOverdue ? "Прострочено" : "Заплановано",
            deadline: isoDate(vzDeadline),
            paidDate: vzIsPaid ? isoDate(new Date(vzDeadline.getTime() - Math.floor(rand() * 5) * 86400000)) : undefined,
            paidAmount: vzIsPaid ? vzAmount : undefined,
            createdAt: isoDateTime(new Date(py, pm + 1, 1)),
            calculatedFromIncome: qSum,
            taxRate: 0.01,
          });
        }
      }

      // ── Salaries: monthly per active employee ──
      for (const emp of employees) {
        const startD = emp.startDate ? new Date(emp.startDate) : new Date(0);
        if (startD > new Date(py, pm + 1, 0)) continue;
        if (emp.status && emp.status !== "active") continue;

        // Base gross by position keyword
        let gross = 35000;
        const pos = (emp.position || "").toLowerCase();
        if (/старший|senior|директор|head/.test(pos)) gross = 55000;
        else if (/адмін|молод|junior|asst/.test(pos)) gross = 22000;
        gross = Math.round(gross * (0.97 + rand() * 0.06));

        const pdfo = Math.round(gross * 0.18);
        const military = Math.round(gross * 0.05);
        const esv = Math.round(gross * 0.22);
        const net = gross - pdfo - military;

        const schedDate = new Date(py, pm + 1, 7); // 7th of next month
        const isPaid = schedDate < AS_OF && rand() < 0.92;

        salaries.push({
          id: `gen-${cabinetId}-sal-${emp.id}-${py}-${pad2(pm + 1)}`,
          cabinetId,
          employeeId: emp.id,
          employeeName: emp.fullName,
          employeePosition: emp.position,
          salaryType: "salary",
          salaryTypeLabel: "Заробітна плата",
          period: periodLabel,
          amount: net,
          status: isPaid ? "paid" : "scheduled",
          statusLabel: isPaid ? "Оплачено" : "Заплановано",
          scheduledDate: isoDate(schedDate),
          paidDate: isPaid ? isoDate(schedDate) : undefined,
          source: "payroll",
          grossAmount: gross,
          netAmount: net,
          pdfoAmount: pdfo,
          militaryTaxAmount: military,
          esvAmount: esv,
          accrualDate: isoDate(new Date(py, pm + 1, 0)),
        });
      }

      // ── Contractor payments (expenses) — distribute across the previous month ──
      for (const cat of profile.expenseCategories) {
        // 1–3 transactions per category per month
        const txN = 1 + Math.floor(rand() * 3);
        const totalForMonth = Math.round(cat.base * (1 + (rand() - 0.5) * 2 * cat.monthlyVar) * (0.95 + 0.1 * SEASON[pm]));
        for (let t = 0; t < txN; t++) {
          const portion = (1 / txN) * (0.7 + rand() * 0.6);
          const amt = Math.max(50, Math.round(totalForMonth * portion / txN));
          const day = 1 + Math.floor(rand() * 27);
          const payDate = new Date(py, pm, day);
          if (payDate > AS_OF) continue;
          cpSeq += 1;
          const cpStatusRoll = rand();
          const cpStatus: ContractorPayment["status"] =
            cpStatusRoll < 0.85 ? "paid" :
            cpStatusRoll < 0.95 ? "scheduled" : "overdue";
          contractorPayments.push({
            id: `gen-${cabinetId}-cp-${cpSeq}`,
            cabinetId,
            date: isoDate(payDate),
            contractor: cat.contractor,
            contractorCode: cat.contractorCode || undefined,
            purpose: `${cat.label} — ${periodLabel}`,
            amount: amt,
            status: cpStatus,
            statusLabel: cpStatus === "paid" ? "Оплачено" : cpStatus === "scheduled" ? "Заплановано" : "Прострочено",
            recipientIban: cat.iban || undefined,
            paymentPurposeType: cat.purposeType,
            expenseCategoryCode: cat.code,
          });
        }
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  const result: SyntheticTimeline = {
    income,
    taxes,
    salaries,
    contractorPayments,
    documents,
  };
  CACHE.set(cabinetId, result);
  return result;
}

export function hasSyntheticProfile(cabinetId: string): boolean {
  return cabinetId in PROFILES;
}
