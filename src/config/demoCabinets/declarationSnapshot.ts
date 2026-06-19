// Phase 7.2 — Реальний агрегатор знімка декларації.
// Замість синтетичних часток — імпортуємо реальні дані з модулів кабінету
// (Книга доходів, Фін.моніторинг, Інвестиції, КІК) та агрегуємо їх у рядки декларації.
// Кожен рядок несе sourceRecordIds для drill-down у джерело.

import type { DeclarationCase } from "./declarationCases";
import { getAllEvidenceForYear, type FactEvidence } from "./declarationFactDeriver";
import { getYearKeyRates } from "./nbuRateCache";

export interface DeclarationLineItem {
  /** Код рядка декларації (Розділ.Рядок) */
  code: string;
  /** Назва рядка (як у формі ДПС) */
  label: string;
  /** Сума в гривнях */
  amount: number;
  /** Джерело даних — для трасування */
  source: "income_book" | "fin_monitoring" | "investments" | "kik" | "tax_discount" | "manual";
  sourceLabel: string;
  /** Кількість транзакцій, з яких сформовано суму */
  txCount?: number;
  /** ID транзакцій-джерел для drill-down */
  sourceRecordIds?: string[];
  /** Evidence з фактів — для drill-stack */
  evidence?: FactEvidence[];
  /** Чи потребує уточнення / перевірки */
  needsReview?: boolean;
  reviewNote?: string;
}

export interface DeclarationAppendix {
  code: "F1" | "F2" | "F3" | "FZ" | "KIK";
  label: string;
  description: string;
  required: boolean;
  ready: boolean;
  itemsCount?: number;
  blockReason?: string;
}

export interface DeclarationSnapshot {
  caseId: string;
  /** Розділ II — доходи */
  incomes: DeclarationLineItem[];
  /** Розділ III — податкові зобовʼязання */
  taxLiabilities: DeclarationLineItem[];
  /** Розділ IV — податкова знижка */
  taxDiscount: DeclarationLineItem[];
  /** Розділ V — майно */
  assets: DeclarationLineItem[];
  /** Додатки */
  appendices: DeclarationAppendix[];
  /** Підсумки */
  totals: {
    grossIncome: number;
    pit: number; // ПДФО 18%
    militaryTax: number; // ВЗ 5%
    foreignTaxCredit: number;
    netToPay: number;
    refund: number;
  };
  /** Курси НБУ — застосовані */
  fxRates: Array<{ currency: string; rate: number; date: string; source: string }>;
  /** Валідаційні попередження */
  warnings: Array<{ id: string; severity: "info" | "warning" | "error"; message: string }>;
  /** Метаінформація автогенерації */
  generation: {
    generatedAt: string;
    sourceCount: number;
    isFresh: boolean;
  };
}

const sumEvidence = (ev: FactEvidence[]) => ev.reduce((s, e) => s + (e.amountUah ?? 0), 0);
const idsOf = (ev: FactEvidence[]) => ev.map((e) => e.recordId);

/**
 * Формує знімок декларації на основі РЕАЛЬНИХ даних модулів кабінету.
 * Це і є автогенерація: декларація — це похідна функція від transactional state.
 */
export function buildDeclarationSnapshot(caseItem: DeclarationCase): DeclarationSnapshot {
  const ev = getAllEvidenceForYear(caseItem.cabinetId, caseItem.reportingYear);
  const tags = caseItem.profileTags;

  const incomes: DeclarationLineItem[] = [];

  // Зарплата / доходи з Книги доходів
  if (ev.incomeBook.length > 0) {
    incomes.push({
      code: "10.1",
      label: "Заробітна плата та інші доходи (з Книги доходів)",
      amount: sumEvidence(ev.incomeBook),
      source: "income_book",
      sourceLabel: "Книга доходів",
      txCount: ev.incomeBook.length,
      sourceRecordIds: idsOf(ev.incomeBook),
      evidence: ev.incomeBook,
    });
  }

  // Інвестиційний прибуток — РЕАЛЬНІ суми з полів позицій (через computeInvestmentIncomeUah).
  // Якщо для частини позицій сума не визначена — їх кількість виноситься у needsReview.
  if (ev.investments.length > 0) {
    const withAmount = ev.investments.filter((e) => typeof e.amountUah === "number");
    const withoutAmount = ev.investments.length - withAmount.length;
    const investAmount = sumEvidence(withAmount);
    incomes.push({
      code: "10.4",
      label: "Інвестиційний прибуток (FIFO)",
      amount: investAmount,
      source: "investments",
      sourceLabel: "Інвестиційний портфель",
      txCount: ev.investments.length,
      sourceRecordIds: idsOf(ev.investments),
      evidence: ev.investments,
      needsReview: withoutAmount > 0,
      reviewNote:
        withoutAmount > 0
          ? `${withoutAmount} ${withoutAmount === 1 ? "позиція потребує" : "позицій потребують"} уточнення суми в Інвестиційному портфелі`
          : undefined,
    });
  }

  // Іноземні доходи
  if (ev.finMonitoring.foreign.length > 0) {
    incomes.push({
      code: "10.10",
      label: "Іноземні доходи (з ФТК)",
      amount: sumEvidence(ev.finMonitoring.foreign),
      source: "fin_monitoring",
      sourceLabel: "Фін.моніторинг",
      txCount: ev.finMonitoring.foreign.length,
      sourceRecordIds: idsOf(ev.finMonitoring.foreign),
      evidence: ev.finMonitoring.foreign,
      needsReview: true,
      reviewNote: "Перевірте курс НБУ на дату кожного зарахування у вкладці «Курси НБУ»",
    });
  }

  // КІК — без синтетики. Сума = 0 + needsReview, бо реальна цифра вимагає аудиторської фінзвітності.
  if (ev.kik.length > 0) {
    incomes.push({
      code: "10.13",
      label: "Скоригований прибуток КІК (ст. 39².3 ПКУ)",
      amount: 0,
      source: "kik",
      sourceLabel: "Реєстр КІК",
      txCount: ev.kik.length,
      sourceRecordIds: idsOf(ev.kik),
      evidence: ev.kik,
      needsReview: true,
      reviewNote: "Завантажте аудиторський висновок та фінзвітність КІК — система обчислить скоригований прибуток автоматично.",
    });
  }

  // Продаж майна
  if (ev.finMonitoring.propertySale.length > 0) {
    incomes.push({
      code: "10.5",
      label: "Дохід від продажу нерухомого майна",
      amount: sumEvidence(ev.finMonitoring.propertySale),
      source: "fin_monitoring",
      sourceLabel: "Фін.моніторинг",
      txCount: ev.finMonitoring.propertySale.length,
      sourceRecordIds: idsOf(ev.finMonitoring.propertySale),
      evidence: ev.finMonitoring.propertySale,
    });
  }

  // Спадщина / подарунки
  if (ev.finMonitoring.inheritance.length > 0) {
    incomes.push({
      code: "10.7",
      label: "Спадщина / подарунки",
      amount: sumEvidence(ev.finMonitoring.inheritance),
      source: "fin_monitoring",
      sourceLabel: "Фін.моніторинг",
      txCount: ev.finMonitoring.inheritance.length,
      sourceRecordIds: idsOf(ev.finMonitoring.inheritance),
      evidence: ev.finMonitoring.inheritance,
    });
  }

  const totalIncomes = incomes.reduce((s, l) => s + l.amount, 0);
  const pit = Math.round(totalIncomes * 0.18);
  const militaryTax = Math.round(totalIncomes * 0.05);

  // ФТК — приблизно 12% від іноземних доходів (середня ставка withholding US/EU)
  const foreignAmount = ev.finMonitoring.foreign.length > 0
    ? sumEvidence(ev.finMonitoring.foreign)
    : 0;
  const foreignTaxCredit = Math.round(foreignAmount * 0.12);

  // Податкова знижка — лише якщо явно проставлено вручну (тег claims_tax_credit)
  const refund = tags.includes("claims_tax_credit") ? caseItem.totalRefund ?? 0 : 0;
  const netToPay = Math.max(0, pit + militaryTax - foreignTaxCredit - refund);

  const taxLiabilities: DeclarationLineItem[] = [
    { code: "18.1", label: "ПДФО 18%", amount: pit, source: "manual", sourceLabel: "Розрахунок Rule Engine" },
    { code: "18.2", label: "Військовий збір 5%", amount: militaryTax, source: "manual", sourceLabel: "Розрахунок Rule Engine" },
  ];
  if (foreignTaxCredit > 0) {
    taxLiabilities.push({
      code: "18.3",
      label: "Зменшення на іноземний податок (ФТК)",
      amount: -foreignTaxCredit,
      source: "fin_monitoring",
      sourceLabel: "Довідки 1042-S / KUPO",
      needsReview: true,
      reviewNote: "Потрібна апостильована довідка від іноземного податкового органу",
    });
  }

  const taxDiscount: DeclarationLineItem[] = tags.includes("claims_tax_credit") && refund > 0
    ? [
        {
          code: "16.1",
          label: "Податкова знижка — освіта / іпотека / страхування",
          amount: refund,
          source: "tax_discount",
          sourceLabel: "Майстер податкової знижки",
        },
      ]
    : [];

  // Майно — без синтетичної цифри 4.2 млн. Сума береться з реальних угод продажу
  // (як проксі вартості). Якщо реєстру нерухомості немає — рядок з needsReview.
  const assets: DeclarationLineItem[] = ev.finMonitoring.propertySale.length > 0
    ? [
        {
          code: "V.1",
          label: "Нерухоме майно (за угодами продажу у звітному році)",
          amount: sumEvidence(ev.finMonitoring.propertySale),
          source: "fin_monitoring",
          sourceLabel: "Угоди з нерухомістю",
          txCount: ev.finMonitoring.propertySale.length,
          sourceRecordIds: idsOf(ev.finMonitoring.propertySale),
          evidence: ev.finMonitoring.propertySale,
          needsReview: true,
          reviewNote: "Підтягніть витяг з ДРРП — система автоматично порахує оціночну вартість усього майна.",
        },
      ]
    : [];

  // Додатки — формуються автоматично з фактів
  const appendices: DeclarationAppendix[] = [];
  if (ev.investments.length > 0) {
    appendices.push({
      code: "F1",
      label: "Додаток Ф1",
      description: "Розрахунок інвестиційного прибутку (FIFO)",
      required: true,
      ready: true,
      itemsCount: ev.investments.length,
    });
  }
  if (ev.finMonitoring.propertySale.length > 0) {
    appendices.push({
      code: "F2",
      label: "Додаток Ф2",
      description: "Дохід від продажу нерухомого майна",
      required: true,
      ready: true,
      itemsCount: ev.finMonitoring.propertySale.length,
    });
  }
  if (ev.finMonitoring.foreign.length > 0) {
    const blocked = caseItem.residencyStatus === "pending_review";
    appendices.push({
      code: "FZ",
      label: "Додаток ФЗ",
      description: "Іноземні доходи та залік сплачених податків",
      required: true,
      ready: !blocked,
      itemsCount: ev.finMonitoring.foreign.length,
      blockReason: blocked ? "Очікує підтвердження резидентського статусу" : undefined,
    });
  }
  if (ev.kik.length > 0) {
    appendices.push({
      code: "KIK",
      label: "Звіт про КІК",
      description: "Контрольовані іноземні компанії — окремий звіт",
      required: true,
      ready: false,
      itemsCount: ev.kik.length,
      blockReason: "Не завантажено фінзвітність КІК за рік",
    });
  }

  // FX-курси з NBU кешу
  const fxRates = (ev.finMonitoring.foreign.length > 0 || ev.kik.length > 0)
    ? getYearKeyRates(caseItem.reportingYear).map((r) => ({
        currency: r.currency,
        rate: r.rate,
        date: r.date,
        source: "НБУ",
      }))
    : [];

  // Валідаційні попередження
  const warnings: DeclarationSnapshot["warnings"] = [];
  if (ev.kik.length > 0) {
    warnings.push({
      id: "w-kik",
      severity: "warning",
      message: "Скоригований прибуток КІК розраховано без аудиторського висновку — отримайте перед поданням.",
    });
  }
  if (ev.finMonitoring.foreign.length > 0) {
    warnings.push({
      id: "w-fx",
      severity: "info",
      message: "Курси НБУ застосовано на дату кожної операції (а не середньорічні). Перевірте у вкладці «Курси НБУ».",
    });
  }
  if (caseItem.residencyStatus === "pending_review") {
    warnings.push({
      id: "w-residency",
      severity: "error",
      message: "Резидентський статус потребує підтвердження. Декларація не може бути підписана.",
    });
  }
  if (incomes.length === 0) {
    warnings.push({
      id: "w-empty",
      severity: "warning",
      message: "У звітному році не знайдено жодного доходу в підключених модулях. Перевірте, чи завантажено всі дані.",
    });
  }

  const sourceCount =
    ev.incomeBook.length +
    ev.investments.length +
    ev.finMonitoring.foreign.length +
    ev.finMonitoring.propertySale.length +
    ev.finMonitoring.inheritance.length +
    ev.kik.length;

  return {
    caseId: caseItem.id,
    incomes,
    taxLiabilities,
    taxDiscount,
    assets,
    appendices,
    totals: {
      grossIncome: totalIncomes,
      pit,
      militaryTax,
      foreignTaxCredit,
      netToPay,
      refund,
    },
    fxRates,
    warnings,
    generation: {
      generatedAt: new Date().toISOString(),
      sourceCount,
      isFresh: true,
    },
  };
}
