import type { PropertyType, PropertyObject, DonorRelation } from "./propertyRegistryConfig";

// ─── Tax Records ───────────────────────────────────────────
export type TaxPaymentStatus = "paid" | "pending" | "overdue" | "calculated";

export interface PropertyTaxRecord {
  year: number;
  accrued: number;
  paid: number;
  status: TaxPaymentStatus;
  deadline?: string;
}

// ─── Tax Rules ─────────────────────────────────────────────
export interface PropertyTaxRule {
  taxName: string;
  article: string;
  description: string;
  exemptArea?: number;        // пільгова площа, м²
  rateDescription: string;
  calculateAnnual: (property: PropertyObject) => number | null;
}

// 2026 constants
const MIN_WAGE_2026 = 8_647;
const PROPERTY_TAX_RATE = 0.015; // 1.5% від МЗП за м²
const VEHICLE_TAX_ANNUAL = 25_000;
const VEHICLE_ENGINE_THRESHOLD = 3000; // куб. см
const VEHICLE_AGE_THRESHOLD = 5; // років

const calculateRealEstateTax = (area: number | undefined, exemptArea: number): number | null => {
  if (!area) return null;
  const taxableArea = Math.max(0, area - exemptArea);
  return Math.round(taxableArea * MIN_WAGE_2026 * PROPERTY_TAX_RATE);
};

export const TAX_RULES_BY_TYPE: Record<PropertyType, PropertyTaxRule> = {
  apartment: {
    taxName: "Податок на нерухомість",
    article: "ст. 266 ПКУ",
    description: "Щорічний податок на житлову нерухомість, що перевищує пільгову площу",
    exemptArea: 60,
    rateDescription: `1.5% від МЗП (${MIN_WAGE_2026.toLocaleString("uk-UA")} грн) за кожний м² понад пільгову площу 60 м²`,
    calculateAnnual: (p) => calculateRealEstateTax(p.totalArea, 60),
  },
  house: {
    taxName: "Податок на нерухомість",
    article: "ст. 266 ПКУ",
    description: "Щорічний податок на житлову нерухомість, що перевищує пільгову площу",
    exemptArea: 120,
    rateDescription: `1.5% від МЗП (${MIN_WAGE_2026.toLocaleString("uk-UA")} грн) за кожний м² понад пільгову площу 120 м²`,
    calculateAnnual: (p) => calculateRealEstateTax(p.totalArea, 120),
  },
  land: {
    taxName: "Земельний податок",
    article: "ст. 269–271 ПКУ",
    description: "Податок на земельну ділянку на основі нормативної грошової оцінки (НГО)",
    exemptArea: 180,
    rateDescription: "Ставка визначається місцевою радою (до 1% від НГО для с/г земель, до 12% для інших)",
    calculateAnnual: (p) => {
      if (!p.estimatedValue) return null;
      return Math.round(p.estimatedValue * 0.01);
    },
  },
  vehicle: {
    taxName: "Транспортний податок",
    article: "ст. 267 ПКУ",
    description: `Сплачується за легкові автомобілі з об'ємом двигуна понад ${VEHICLE_ENGINE_THRESHOLD} куб. см, які використовуються до ${VEHICLE_AGE_THRESHOLD} років з дати випуску`,
    rateDescription: `Фіксована ставка ${VEHICLE_TAX_ANNUAL.toLocaleString("uk-UA")} грн/рік`,
    calculateAnnual: (p) => {
      if (!p.engineVolume || p.engineVolume <= VEHICLE_ENGINE_THRESHOLD) return null;
      // ст. 267: вік визначається за роком випуску, не придбання
      const year = p.manufactureYear ?? new Date(p.acquisitionDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      if (age > VEHICLE_AGE_THRESHOLD) return null;
      return VEHICLE_TAX_ANNUAL;
    },
  },
  commercial: {
    taxName: "Податок на нерухомість (нежитлова)",
    article: "ст. 266.5.1 ПКУ",
    description: "Щорічний податок на нежитлову нерухомість (офіс, склад, магазин, гараж) — без пільгової площі",
    exemptArea: 0,
    rateDescription: `1.5% від МЗП (${MIN_WAGE_2026.toLocaleString("uk-UA")} грн) за кожний м² (пільгова площа 0 м²)`,
    calculateAnnual: (p) => calculateRealEstateTax(p.totalArea, 0),
  },
  other: {
    taxName: "Податок (за типом майна)",
    article: "ПКУ",
    description: "Тип податку визначається індивідуально залежно від категорії майна",
    rateDescription: "—",
    calculateAnnual: () => null,
  },
};

// ─── Gift / Inheritance Tax (ст. 174 ПКУ) ─────────────────
export interface GiftInheritanceTaxResult {
  pitRate: number;
  militaryRate: number;
  pitAmount: number;
  militaryAmount: number;
  total: number;
  isExempt: boolean;
  article: string;
}

export function calculateGiftTax(
  estimatedValue: number,
  relation: DonorRelation
): GiftInheritanceTaxResult {
  // ст. 174.2.1: родичі 1-2 черги — 0%
  // ст. 174.6: неродичі — 18% ПДФО + 5% ВЗ
  // нерезиденти — 18% ПДФО + 5% ВЗ
  const isExempt = relation === "first_line" || relation === "second_line";
  const pitRate = isExempt ? 0 : 18;
  const militaryRate = isExempt ? 0 : 5;
  const pitAmount = Math.round(estimatedValue * pitRate / 100);
  const militaryAmount = Math.round(estimatedValue * militaryRate / 100);
  return {
    pitRate, militaryRate, pitAmount, militaryAmount,
    total: pitAmount + militaryAmount,
    isExempt,
    article: isExempt ? "ст. 174.2.1 ПКУ" : "ст. 174.6 ПКУ",
  };
}

export function calculateInheritanceTax(
  estimatedValue: number,
  relation: DonorRelation
): GiftInheritanceTaxResult {
  // ст. 174.2.1: 1-2 черга — 0%
  // ст. 174.2.2: інші — 5% ПДФО + 5% ВЗ
  // нерезидент-спадкодавець — 18% + 5%
  const isExempt = relation === "first_line" || relation === "second_line";
  let pitRate: number;
  let militaryRate: number;
  if (isExempt) {
    pitRate = 0; militaryRate = 0;
  } else if (relation === "non_resident") {
    pitRate = 18; militaryRate = 5;
  } else {
    pitRate = 5; militaryRate = 5;
  }
  const pitAmount = Math.round(estimatedValue * pitRate / 100);
  const militaryAmount = Math.round(estimatedValue * militaryRate / 100);
  return {
    pitRate, militaryRate, pitAmount, militaryAmount,
    total: pitAmount + militaryAmount,
    isExempt,
    article: isExempt ? "ст. 174.2.1 ПКУ" : (relation === "non_resident" ? "ст. 174.2.3 ПКУ" : "ст. 174.2.2 ПКУ"),
  };
}

// ─── Rental Tax (ст. 170.1 ПКУ) ──────────────────────────
export interface RentalTaxResult {
  annualRent: number;
  pitRate: number;
  militaryRate: number;
  pitAmount: number;
  militaryAmount: number;
  total: number;
  isAgentWithheld: boolean;
  article: string;
}

export function calculateRentalTax(
  monthlyRent: number,
  tenantType: "individual" | "legal_entity"
): RentalTaxResult {
  const annualRent = monthlyRent * 12;
  const pitRate = 18;
  const militaryRate = 5;
  const pitAmount = Math.round(annualRent * pitRate / 100);
  const militaryAmount = Math.round(annualRent * militaryRate / 100);
  return {
    annualRent,
    pitRate, militaryRate, pitAmount, militaryAmount,
    total: pitAmount + militaryAmount,
    // Якщо орендар — юрособа, вона виступає податковим агентом
    isAgentWithheld: tenantType === "legal_entity",
    article: "ст. 170.1.1 ПКУ",
  };
}

// ─── Sale Tax ──────────────────────────────────────────────
export interface SaleTaxCondition {
  id: string;
  label: string;
  article: string;
  check: (property: PropertyObject, allProperties: PropertyObject[]) => boolean;
}

export interface SaleTaxResult {
  pitRate: number;       // ПДФО %
  militaryRate: number;  // ВЗ %
  pitAmount: number;
  militaryAmount: number;
  total: number;
  isExempt: boolean;
}

export const SALE_TAX_CONDITIONS: SaleTaxCondition[] = [
  {
    id: "first-sale",
    label: "Перший продаж нерухомості у поточному році",
    article: "ст. 172.1 ПКУ",
    check: (property, allProperties) => {
      const currentYear = new Date().getFullYear();
      const otherSales = allProperties.filter(
        (p) =>
          p.id !== property.id &&
          p.status === "sold" &&
          p.soldDate &&
          new Date(p.soldDate).getFullYear() === currentYear
      );
      return otherSales.length === 0;
    },
  },
  {
    id: "ownership-3y",
    label: "Володіння понад 3 роки",
    article: "ст. 172.1 ПКУ",
    check: (property) => {
      const acquired = new Date(property.acquisitionDate);
      const now = new Date();
      const diffYears = (now.getTime() - acquired.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return diffYears >= 3;
    },
  },
];

export function calculateSaleTax(
  price: number,
  property: PropertyObject,
  allProperties: PropertyObject[]
): SaleTaxResult {
  const conditionsMet = SALE_TAX_CONDITIONS.every((c) => c.check(property, allProperties));
  const isExempt = conditionsMet;

  // If exempt (first sale + 3+ years): 0% PIT, but still 1.5% military
  // If not exempt first sale: 5% PIT + 1.5% military
  // If second+ sale in year: 18% PIT + 5% military
  const currentYear = new Date().getFullYear();
  const otherSalesThisYear = allProperties.filter(
    (p) =>
      p.id !== property.id &&
      p.status === "sold" &&
      p.soldDate &&
      new Date(p.soldDate).getFullYear() === currentYear
  ).length;

  let pitRate: number;
  let militaryRate: number;

  if (isExempt) {
    pitRate = 0;
    militaryRate = 0;
  } else if (otherSalesThisYear === 0) {
    pitRate = 5;
    militaryRate = 1.5;
  } else {
    pitRate = 18;
    militaryRate = 5;
  }

  const pitAmount = Math.round(price * pitRate / 100);
  const militaryAmount = Math.round(price * militaryRate / 100);

  return {
    pitRate,
    militaryRate,
    pitAmount,
    militaryAmount,
    total: pitAmount + militaryAmount,
    isExempt,
  };
}

// ─── Declaration History ───────────────────────────────────
export interface DeclarationHistoryEntry {
  year: number;
  declarationType: string;
  section: string;
  row: string;
  status: "submitted" | "draft";
}

// ─── Demo Data ─────────────────────────────────────────────
// Synced with calculateRealEstateTax formulas:
// prop-1: 78m² - 60m² = 18m² × 8647 × 0.015 = 2,335 ₴
// prop-2: 180m² - 120m² = 60m² × 8647 × 0.015 = 7,782 ₴
// prop-4: land — estimatedValue 480,000 × 0.01 = 4,800 ₴
// prop-9: commercial 65m² × 8647 × 0.015 = 8,431 ₴

export const DEMO_TAX_RECORDS: Record<string, PropertyTaxRecord[]> = {
  "prop-1": [
    { year: 2024, accrued: 2335, paid: 2335, status: "paid", deadline: "2024-07-01" },
    { year: 2025, accrued: 2335, paid: 0, status: "pending", deadline: "2025-07-01" },
  ],
  "prop-2": [
    { year: 2024, accrued: 7782, paid: 7782, status: "paid", deadline: "2024-07-01" },
    { year: 2025, accrued: 7782, paid: 7782, status: "paid", deadline: "2025-07-01" },
  ],
  "prop-3": [],
  "prop-4": [
    { year: 2024, accrued: 4800, paid: 4800, status: "paid", deadline: "2024-07-01" },
    { year: 2025, accrued: 4800, paid: 0, status: "pending", deadline: "2025-07-01" },
  ],
  "prop-5": [],
  "prop-6": [],
  "prop-7": [],
  "prop-8": [],
  "prop-9": [
    { year: 2024, accrued: 8431, paid: 8431, status: "paid", deadline: "2024-07-01" },
    { year: 2025, accrued: 8431, paid: 0, status: "pending", deadline: "2025-07-01" },
  ],
  "prop-10": [],
  "prop-11": [],
};

export const DEMO_DECLARATION_HISTORY: Record<string, DeclarationHistoryEntry[]> = {
  "prop-1": [
    { year: 2024, declarationType: "Щорічна декларація", section: "Секція 3", row: "Рядок 1", status: "submitted" },
    { year: 2023, declarationType: "Щорічна декларація", section: "Секція 3", row: "Рядок 1", status: "submitted" },
  ],
  "prop-2": [
    { year: 2024, declarationType: "Щорічна декларація", section: "Секція 3", row: "Рядок 2", status: "submitted" },
    { year: 2023, declarationType: "Щорічна декларація", section: "Секція 3", row: "Рядок 2", status: "submitted" },
    { year: 2022, declarationType: "Щорічна декларація", section: "Секція 3", row: "Рядок 1", status: "submitted" },
  ],
  "prop-3": [
    { year: 2024, declarationType: "Щорічна декларація", section: "Секція 5", row: "Рядок 1", status: "submitted" },
  ],
  "prop-4": [
    { year: 2024, declarationType: "Щорічна декларація", section: "Секція 3", row: "Рядок 3", status: "submitted" },
    { year: 2023, declarationType: "Щорічна декларація", section: "Секція 3", row: "Рядок 3", status: "submitted" },
  ],
  "prop-5": [
    { year: 2026, declarationType: "Декларація про продаж (5% ПДФО + 1.5% ВЗ)", section: "Секція 2", row: "Рядок 1", status: "draft" },
  ],
  "prop-6": [
    { year: 2024, declarationType: "Декларація про продаж (2-й за рік, 18% + 5%)", section: "Секція 2", row: "Рядок 2", status: "draft" },
  ],
  "prop-7": [
    { year: 2025, declarationType: "Щорічна декларація (орендний дохід)", section: "Секція 1", row: "Рядок 5", status: "draft" },
  ],
  "prop-8": [
    { year: 2025, declarationType: "Декларація (дарування від неродича, 18% + 5%)", section: "Секція 2", row: "Рядок 3", status: "draft" },
  ],
  "prop-9": [
    { year: 2024, declarationType: "Щорічна декларація", section: "Секція 3", row: "Рядок 4", status: "submitted" },
  ],
  "prop-10": [
    { year: 2025, declarationType: "Щорічна декларація (незавершене будівництво)", section: "Секція 3", row: "Рядок 5", status: "draft" },
  ],
  "prop-11": [
    { year: 2025, declarationType: "Щорічна декларація (закордонне майно)", section: "Секція 4", row: "Рядок 1", status: "draft" },
  ],
};
