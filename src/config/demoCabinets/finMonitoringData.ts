/**
 * DEMO DATA: Financial Monitoring Records for Individual Cabinet
 * ~30 records combining income and expense from various sources
 *
 * Phase 7 audit: дати зафіксовано на 2025 рік (детермінований demo state).
 * Раніше використовувався getDateInPast(N) — він "плив" разом з today,
 * через що записи могли потрапляти то в 2025, то в 2026 і ламали декларацію.
 */

import type { FinMonitoringRecord } from "@/config/finMonitoringConfig";
import { getDateInMonth } from "./helpers";

export const individualFinMonitoringRecords: FinMonitoringRecord[] = [
  // ===== INCOME RECORDS =====

  // 1. Salary from employer (monthly, ЦПД) — Грудень/Листопад/Жовтень 2025
  {
    id: "fm-001",
    date: getDateInMonth(2025, 12, 28),
    description: "Зарплата — ТОВ «Діджитал Академі» (грудень)",
    amount: 20000,
    direction: "income",
    category: "salary",
    source: "monobank",
    contractor: "ТОВ «Діджитал Академі»",
    contractorCode: "41234567",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-004"],
    sourceRef: "doc-ind-d-004",
    taxImplication: { pdfo: 3600, vz: 1000, rate: "18% + 5%", article: "ст. 164.1 ПКУ" },
    sourceTab: "salary",
  },
  {
    id: "fm-002",
    date: getDateInMonth(2025, 11, 28),
    description: "Зарплата — ТОВ «Діджитал Академі» (листопад)",
    amount: 20000,
    direction: "income",
    category: "salary",
    source: "monobank",
    contractor: "ТОВ «Діджитал Академі»",
    contractorCode: "41234567",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-004"],
    taxImplication: { pdfo: 3600, vz: 1000, rate: "18% + 5%", article: "ст. 164.1 ПКУ" },
    sourceTab: "salary",
  },
  {
    id: "fm-003",
    date: getDateInMonth(2025, 10, 28),
    description: "Зарплата — ТОВ «Діджитал Академі» (жовтень)",
    amount: 20000,
    direction: "income",
    category: "salary",
    source: "monobank",
    contractor: "ТОВ «Діджитал Академі»",
    contractorCode: "41234567",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-004"],
    taxImplication: { pdfo: 3600, vz: 1000, rate: "18% + 5%", article: "ст. 164.1 ПКУ" },
    sourceTab: "salary",
  },

  // 2. Rental income — 2025
  {
    id: "fm-004",
    date: getDateInMonth(2025, 12, 5),
    description: "Орендна плата — кв. Саксаганського, 42 (грудень)",
    amount: 15000,
    direction: "income",
    category: "rent",
    source: "monobank",
    contractor: "Сидорчук Ігор Петрович",
    contractorCode: "2987654321",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-010"],
    taxImplication: { pdfo: 2700, vz: 750, rate: "18% + 5%", article: "ст. 170.1 ПКУ" },
    sourceTab: "property",
  },
  {
    id: "fm-005",
    date: getDateInMonth(2025, 11, 5),
    description: "Орендна плата — кв. Саксаганського, 42 (листопад)",
    amount: 15000,
    direction: "income",
    category: "rent",
    source: "monobank",
    contractor: "Сидорчук Ігор Петрович",
    contractorCode: "2987654321",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-010"],
    taxImplication: { pdfo: 2700, vz: 750, rate: "18% + 5%", article: "ст. 170.1 ПКУ" },
    sourceTab: "property",
  },

  // 3. Investment — stock sale (IBKR) — 2025
  {
    id: "fm-006",
    date: getDateInMonth(2025, 11, 20),
    description: "Продаж акцій NVIDIA (NVDA) — прибуток $2 800",
    amount: 115360,
    direction: "income",
    category: "investment",
    source: "ibkr",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-001"],
    sourceRef: "doc-ind-d-001",
    taxImplication: { pdfo: 20765, vz: 5768, rate: "18% + 5%", article: "ст. 170.2 ПКУ" },
    sourceTab: "investments",
  },
  {
    id: "fm-007",
    date: getDateInMonth(2025, 8, 15),
    description: "Продаж акцій Apple (AAPL) — прибуток $1 200",
    amount: 49440,
    direction: "income",
    category: "investment",
    source: "ibkr",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-001"],
    taxImplication: { pdfo: 8899, vz: 2472, rate: "18% + 5%", article: "ст. 170.2 ПКУ" },
    sourceTab: "investments",
  },

  // 4. Dividends — 2025
  {
    id: "fm-008",
    date: getDateInMonth(2025, 6, 15),
    description: "Дивіденди Microsoft (MSFT) — $340",
    amount: 11900,
    direction: "income",
    category: "dividend",
    source: "ibkr",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-001"],
    taxImplication: { pdfo: 642, vz: 595, rate: "3% + 5% (КУПО)", article: "ст. 170.10 ПКУ" },
    sourceTab: "investments",
  },

  // 5. Car sale — 2025
  {
    id: "fm-009",
    date: getDateInMonth(2025, 9, 20),
    description: "Продаж Toyota RAV4 2020",
    amount: 580000,
    direction: "income",
    category: "sale",
    source: "document",
    contractor: "Петров Олександр Миколайович",
    contractorCode: "3145678901",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-005", "doc-ind-d-006"],
    sourceRef: "doc-ind-d-005",
    taxImplication: { pdfo: 0, vz: 0, rate: "0% (перший продаж ТЗ)", article: "ст. 173.2 ПКУ" },
    sourceTab: "property",
  },

  // 6. Foreign salary (Poland) — 2025
  {
    id: "fm-010",
    date: getDateInMonth(2025, 11, 25),
    description: "Зарплата IT Solutions Sp. z o.o. (Польща, листопад)",
    amount: 60000,
    direction: "income",
    category: "salary",
    source: "privat24",
    contractor: "IT Solutions Sp. z o.o.",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-002", "doc-ind-d-003"],
    currency: "PLN",
    taxImplication: { pdfo: 10800, vz: 3000, rate: "18% + 5% (КУПО)", article: "ст. 170.11 ПКУ" },
    sourceTab: "salary",
  },

  // 7. Freelance — 2025
  {
    id: "fm-011",
    date: getDateInMonth(2025, 12, 10),
    description: "ЦПД — дизайн для ФОП Мартиненко",
    amount: 12000,
    direction: "income",
    category: "freelance",
    source: "monobank",
    contractor: "ФОП Мартиненко А.С.",
    status: "confirmed",
    linkedDocuments: [],
    taxImplication: { pdfo: 2160, vz: 600, rate: "18% + 5% (утримано агентом)", article: "ст. 164.1 ПКУ" },
    sourceTab: "freelance",
  },

  // 8. Gift from relative (1st line) — 2025
  {
    id: "fm-012",
    date: getDateInMonth(2025, 10, 15),
    description: "Подарунок від мами (переказ)",
    amount: 50000,
    direction: "income",
    category: "gift",
    source: "monobank",
    contractor: "Ткаченко Вікторія Іванівна",
    status: "confirmed",
    linkedDocuments: [],
    taxImplication: { pdfo: 0, vz: 0, rate: "0% (родич 1-ї черги)", article: "ст. 174.2.1 ПКУ" },
  },

  // 9. Inheritance — 2025
  {
    id: "fm-013",
    date: getDateInMonth(2025, 6, 10),
    description: "Спадщина — земельна ділянка (від бабусі)",
    amount: 120000,
    direction: "income",
    category: "inheritance",
    source: "document",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-015"],
    taxImplication: { pdfo: 0, vz: 0, rate: "0% (1 черга)", article: "ст. 174.2.1 ПКУ" },
  },

  // 10. Lottery win — 2025
  {
    id: "fm-014",
    date: getDateInMonth(2025, 11, 1),
    description: "Виграш у лотерею «Мегалот»",
    amount: 8500,
    direction: "income",
    category: "lottery",
    source: "monobank",
    status: "confirmed",
    linkedDocuments: [],
    taxImplication: { pdfo: 1530, vz: 425, rate: "18% + 5%", article: "ст. 170.6 ПКУ" },
  },

  // 11. Crypto sale — 2025
  {
    id: "fm-015",
    date: getDateInMonth(2025, 12, 5),
    description: "Продаж BTC → UAH (Binance P2P)",
    amount: 42000,
    direction: "income",
    category: "crypto",
    source: "monobank",
    status: "needs-review",
    linkedDocuments: [],
    taxImplication: { pdfo: 7560, vz: 2100, rate: "18% + 5%", article: "ст. 170.2 ПКУ" },
  },

  // ===== EXPENSE RECORDS =====

  // 12. Education — 2025
  {
    id: "fm-016",
    date: getDateInMonth(2025, 9, 1),
    description: "Оплата навчання — КНУ ім. Шевченка (2 семестр)",
    amount: 34000,
    direction: "expense",
    category: "education",
    source: "monobank",
    contractor: "КНУ ім. Тараса Шевченка",
    contractorCode: "02070987",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-008"],
    sourceTab: "tax-discount",
  },
  {
    id: "fm-017",
    date: getDateInMonth(2025, 2, 1),
    description: "Оплата навчання — КНУ ім. Шевченка (1 семестр)",
    amount: 32000,
    direction: "expense",
    category: "education",
    source: "monobank",
    contractor: "КНУ ім. Тараса Шевченка",
    contractorCode: "02070987",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-007"],
    sourceTab: "tax-discount",
  },

  // 13. Medical — 2025
  {
    id: "fm-018",
    date: getDateInMonth(2025, 7, 12),
    description: "Реабілітація — МЦ «Добробут»",
    amount: 18500,
    direction: "expense",
    category: "medical",
    source: "monobank",
    contractor: "МЦ «Добробут»",
    contractorCode: "38745612",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-009"],
    sourceTab: "tax-discount",
  },

  // 14. Utilities — 2025
  {
    id: "fm-019",
    date: getDateInMonth(2025, 12, 22),
    description: "Комунальні послуги (грудень) — КМДА",
    amount: 4200,
    direction: "expense",
    category: "utilities",
    source: "monobank",
    status: "confirmed",
    linkedDocuments: [],
  },
  {
    id: "fm-020",
    date: getDateInMonth(2025, 11, 22),
    description: "Комунальні послуги (листопад) — КМДА",
    amount: 3800,
    direction: "expense",
    category: "utilities",
    source: "monobank",
    status: "confirmed",
    linkedDocuments: [],
  },

  // 15. Insurance — 2025
  {
    id: "fm-021",
    date: getDateInMonth(2025, 11, 14),
    description: "Страхування життя — СК «УНІКА» (річний внесок)",
    amount: 15000,
    direction: "expense",
    category: "insurance",
    source: "monobank",
    contractor: "СК «УНІКА»",
    status: "confirmed",
    linkedDocuments: [],
    sourceTab: "tax-discount",
  },

  // 16. Tax paid — 2025
  {
    id: "fm-022",
    date: getDateInMonth(2025, 12, 20),
    description: "ПДФО з оренди — IV квартал",
    amount: 10800,
    direction: "expense",
    category: "tax-paid",
    source: "privat24",
    status: "confirmed",
    linkedDocuments: [],
  },
  {
    id: "fm-023",
    date: getDateInMonth(2025, 12, 20),
    description: "ВЗ з оренди — IV квартал",
    amount: 3000,
    direction: "expense",
    category: "tax-paid",
    source: "privat24",
    status: "confirmed",
    linkedDocuments: [],
  },

  // 17. Transport — 2025
  {
    id: "fm-024",
    date: getDateInMonth(2025, 12, 18),
    description: "Автострахування ОСЦПВ — Toyota RAV4",
    amount: 3200,
    direction: "expense",
    category: "transport",
    source: "monobank",
    status: "confirmed",
    linkedDocuments: [],
  },

  // 18. P2P from unknown — needs review — 2025
  {
    id: "fm-025",
    date: getDateInMonth(2025, 12, 22),
    description: "Переказ від невідомої особи (P2P Mono)",
    amount: 15000,
    direction: "income",
    category: "other",
    source: "monobank",
    status: "needs-review",
    linkedDocuments: [],
  },

  // 19. Rent payment (expense — renting apartment in Poland) — 2025
  {
    id: "fm-026",
    date: getDateInMonth(2025, 12, 24),
    description: "Оренда квартири у Варшаві (грудень)",
    amount: 22000,
    direction: "expense",
    category: "rent",
    source: "privat24",
    status: "confirmed",
    linkedDocuments: [],
    currency: "PLN",
  },

  // 20. Brokerage commission — 2025
  {
    id: "fm-027",
    date: getDateInMonth(2025, 11, 15),
    description: "Комісія IBKR за торгові операції (листопад)",
    amount: 820,
    direction: "expense",
    category: "investment",
    source: "ibkr",
    status: "confirmed",
    linkedDocuments: [],
    sourceTab: "investments",
  },

  // 21. Charity — 2025
  {
    id: "fm-028",
    date: getDateInMonth(2025, 11, 30),
    description: "Благодійний внесок — Фонд «Повернись живим»",
    amount: 5000,
    direction: "expense",
    category: "charity",
    source: "monobank",
    status: "confirmed",
    linkedDocuments: [],
    taxImplication: { pdfo: 0, vz: 0, rate: "Податкова знижка", article: "ст. 166.3.2 ПКУ" },
    sourceTab: "tax-discount",
  },
  {
    id: "fm-031",
    date: getDateInMonth(2025, 10, 16),
    description: "Благодійний внесок — БФ «Таблеточки»",
    amount: 3000,
    direction: "expense",
    category: "charity",
    source: "monobank",
    status: "confirmed",
    linkedDocuments: [],
    taxImplication: { pdfo: 0, vz: 0, rate: "Податкова знижка", article: "ст. 166.3.2 ПКУ" },
    sourceTab: "tax-discount",
  },

  // 22. Currency conversion (transfer) — 2025
  {
    id: "fm-029",
    date: getDateInMonth(2025, 12, 28),
    description: "Конвертація WISE → Mono (PLN→UAH) — трансфер",
    amount: 58000,
    direction: "income",
    category: "other",
    source: "monobank",
    status: "needs-review",
    linkedDocuments: [],
  },

  // 23. Medical expense — 2025
  {
    id: "fm-030",
    date: getDateInMonth(2025, 12, 12),
    description: "Стоматологія — протезування",
    amount: 12500,
    direction: "expense",
    category: "medical",
    source: "monobank",
    status: "confirmed",
    linkedDocuments: ["doc-ind-d-007"],
    sourceTab: "tax-discount",
  },
];
