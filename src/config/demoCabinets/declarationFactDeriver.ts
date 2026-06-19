// Phase 7.1 — Деривація profileTags декларації з реальних даних модулів кабінету.
// Декларація автогенерується: користувач не відповідає на анкету, бо система вже знає
// факти з Книги доходів, Фін.моніторингу, Інвестицій, КІК, Податкової знижки.

import type { ProfileTag } from "./declarationCases";
import { demoIncomeRecords } from "@/config/incomeBookConfig";
import { getDemoFinMonitoringForCabinet } from "./getters";
import { investmentPositions } from "./investmentPositions";
import { getKikEntitiesForCabinet } from "./kikRegistryConfig";
import type { FinMonitoringRecord } from "@/config/finMonitoringConfig";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import type { InvestmentPosition } from "./investmentTypes";
import type { KikEntity } from "./kikRegistryConfig";

export interface FactEvidence {
  /** Звідки взято факт */
  module: "income_book" | "fin_monitoring" | "investments" | "kik" | "tax_discount";
  moduleLabel: string;
  /** ID транзакції / запису */
  recordId: string;
  /** Короткий опис, що бачить користувач */
  summary: string;
  /** Дата */
  date?: string;
  /** Сума у грн (опційно) */
  amountUah?: number;
  /** Глибокий маршрут для drill-down */
  deepLink?: string;
}

export interface DeriveOutcome {
  tags: ProfileTag[];
  evidence: Partial<Record<ProfileTag, FactEvidence[]>>;
  /** Метрики «скільки чого знайшли» — для пояснення користувачу */
  metrics: Partial<Record<ProfileTag, { count: number; totalUah?: number }>>;
  /** Рекомендований residency-статус (за замовч. resident, але якщо є ознаки — pending_review) */
  residencyHint: "resident" | "pending_review";
  residencyReason?: string;
}

/**
 * Парсить дату у будь-якому з підтримуваних форматів:
 *  - ISO: "2025-08-15", "2025-08-15T10:00:00.000Z"
 *  - DD.MM.YYYY: "15.08.2025"
 * Повертає null для невалідних значень.
 *
 * BUG-FIX (Phase 7 audit): раніше використовувався `new Date("15.08.2025")`,
 * що повертає Invalid Date і ламало деривацію інвестицій (тег is_investor
 * ніколи не виставлявся, бо всі sellDate у форматі DD.MM.YYYY).
 */
function parseFlexibleDate(s: string | undefined | null): Date | null {
  if (!s) return null;
  // DD.MM.YYYY
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d;
  }
  // ISO або інше, що розуміє Date
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

const inYear = (s: string | undefined, year: number): boolean => {
  const d = parseFlexibleDate(s);
  return !!d && d.getUTCFullYear() === year;
};

function deriveFromIncomeBook(year: number): FactEvidence[] {
  // У декларацію включаємо лише записи зі статусом "income" та inIncomeBook > 0
  // (записи "not-income" як подарунки 1-ї черги не оподатковуються і не входять у dohid).
  return demoIncomeRecords
    .filter((r) => inYear(r.date, year) && r.status === "income" && r.inIncomeBook > 0)
    .map<FactEvidence>((r: IncomeBookRecord) => ({
      module: "income_book",
      moduleLabel: "Книга доходів",
      recordId: r.id,
      summary: r.description,
      date: r.date,
      amountUah: r.inIncomeBook,
      deepLink: `/cabinets/individual/income-book?recordId=${r.id}`,
    }));
}

function deriveFromFinMonitoring(cabinetId: string, year: number) {
  const all = getDemoFinMonitoringForCabinet(cabinetId).filter((r) =>
    inYear(r.date, year),
  );
  const foreign = all.filter(
    (r: FinMonitoringRecord) =>
      r.direction === "income" && !!r.currency && r.currency !== "UAH",
  );
  const propertySale = all.filter(
    (r) => r.direction === "income" && r.category === "sale",
  );
  const inheritance = all.filter(
    (r) => r.direction === "income" && (r.category === "inheritance" || r.category === "gift"),
  );
  const toEvidence = (r: FinMonitoringRecord): FactEvidence => ({
    module: "fin_monitoring",
    moduleLabel: "Фін.моніторинг",
    recordId: r.id,
    summary: r.description + (r.currency && r.currency !== "UAH" ? ` (${r.currency})` : ""),
    date: r.date,
    amountUah: r.amount,
    deepLink: `/cabinets/individual/fin-monitoring?recordId=${r.id}`,
  });
  return {
    foreign: foreign.map(toEvidence),
    propertySale: propertySale.map(toEvidence),
    inheritance: inheritance.map(toEvidence),
  };
}

/**
 * Обчислює UAH-еквівалент доходу від інвестиційної операції на основі реальних
 * полів позиції (sellPriceUsd, grossDividendUsd, couponRate тощо) та курсу НБУ.
 * Повертає `null` коли даних недостатньо — у цьому випадку snapshot покаже
 * "потребує уточнення" замість синтетичного числа.
 */
function computeInvestmentIncomeUah(p: InvestmentPosition): number | null {
  // Sell — реалізований прибуток (P&L)
  if (p.operationType === "sell" && p.sellPriceUsd != null && p.nbuRateSell != null) {
    const revenueUah = (p.sellPriceUsd * p.buyQty - (p.sellCommission ?? 0)) * p.nbuRateSell;
    const costUah = (p.buyPriceUsd * p.buyQty + (p.buyCommission ?? 0)) * (p.nbuRateBuy ?? p.nbuRateSell);
    return Math.max(0, Math.round(revenueUah - costUah));
  }
  // Dividend — gross × курс на дату
  if (p.operationType === "dividend" && p.grossDividendUsd != null && p.nbuRateDividend != null) {
    return Math.round(p.grossDividendUsd * p.nbuRateDividend);
  }
  // Coupon — nominal × ставка купона × курс
  if (p.operationType === "coupon" && p.couponRate != null && p.nominal != null) {
    const fx = p.nbuRateSell ?? p.nbuRateBuy ?? 1;
    return Math.round(p.nominal * (p.couponRate / 100) * fx);
  }
  // Yield (DeFi/P2P) — yieldAmount у USD × курс
  if (p.operationType === "yield" && p.yieldAmount != null) {
    const fx = p.nbuRateDividend ?? p.nbuRateSell ?? p.nbuRateBuy ?? 1;
    return Math.round(p.yieldAmount * fx);
  }
  // Exercise (ESOP) — (FMV - strike) × qty × курс
  if (
    p.operationType === "exercise" &&
    p.fmvAtExercise != null &&
    p.strikePrice != null
  ) {
    const fx = p.nbuRateSell ?? p.nbuRateBuy ?? 1;
    return Math.round((p.fmvAtExercise - p.strikePrice) * p.buyQty * fx);
  }
  return null;
}

function deriveFromInvestments(year: number): FactEvidence[] {
  return investmentPositions
    .filter((p: InvestmentPosition) => {
      if (p.sellDate && inYear(p.sellDate, year)) return true;
      if (p.dividendDate && inYear(p.dividendDate, year)) return true;
      if (p.couponDate && inYear(p.couponDate, year)) return true;
      return false;
    })
    .map<FactEvidence>((p) => {
      const amountUah = computeInvestmentIncomeUah(p);
      return {
        module: "investments",
        moduleLabel: "Інвестиційний портфель",
        recordId: p.id,
        summary: `${p.ticker} — ${p.asset} (${p.operationType})`,
        date: p.sellDate ?? p.dividendDate ?? p.couponDate ?? p.buyDate,
        // amountUah буде undefined для позицій з браком даних → snapshot позначить needsReview
        amountUah: amountUah ?? undefined,
        deepLink: `/cabinets/individual/investments?positionId=${p.id}`,
      };
    });
}

function deriveFromKik(cabinetId: string, year: number): FactEvidence[] {
  return getKikEntitiesForCabinet(cabinetId)
    .filter((k: KikEntity) => k.reportingYear === year)
    .map<FactEvidence>((k) => ({
      module: "kik",
      moduleLabel: "Реєстр КІК",
      recordId: k.id,
      summary: `${k.name} (${k.jurisdiction})`,
      date: `${k.reportingYear}-12-31`,
      deepLink: `/cabinets/individual/declarations?caseId=auto-${year}&tab=kik&kikId=${k.id}`,
    }));
}

/**
 * Виводить теги профілю декларації з реальних даних кабінету за звітний рік.
 * Це серце автогенерації — користувач НЕ відповідає на анкету, факти беруться з модулів.
 */
export function deriveProfileTagsFromFacts(cabinetId: string, year: number): DeriveOutcome {
  const tags: ProfileTag[] = [];
  const evidence: DeriveOutcome["evidence"] = {};
  const metrics: DeriveOutcome["metrics"] = {};

  // Інвестиції
  const investEv = deriveFromInvestments(year);
  if (investEv.length > 0) {
    tags.push("is_investor");
    evidence.is_investor = investEv;
    metrics.is_investor = { count: investEv.length };
  }

  // Фін.моніторинг
  const fin = deriveFromFinMonitoring(cabinetId, year);
  if (fin.foreign.length > 0) {
    tags.push("has_foreign_income");
    evidence.has_foreign_income = fin.foreign;
    metrics.has_foreign_income = {
      count: fin.foreign.length,
      totalUah: fin.foreign.reduce((s, e) => s + (e.amountUah ?? 0), 0),
    };
  }
  if (fin.propertySale.length > 0) {
    tags.push("sold_property");
    evidence.sold_property = fin.propertySale;
    metrics.sold_property = {
      count: fin.propertySale.length,
      totalUah: fin.propertySale.reduce((s, e) => s + (e.amountUah ?? 0), 0),
    };
  }
  if (fin.inheritance.length > 0) {
    tags.push("received_inheritance");
    evidence.received_inheritance = fin.inheritance;
    metrics.received_inheritance = {
      count: fin.inheritance.length,
      totalUah: fin.inheritance.reduce((s, e) => s + (e.amountUah ?? 0), 0),
    };
  }

  // КІК
  const kikEv = deriveFromKik(cabinetId, year);
  if (kikEv.length > 0) {
    tags.push("has_kik");
    evidence.has_kik = kikEv;
    metrics.has_kik = { count: kikEv.length };
  }

  // Податкова знижка — у демо немає окремого модуля, лишимо як «можна додати вручну»
  // (не виводимо тег з фактів)

  // Резидентство — heuristic: якщо є іноземні доходи + кілька країн → pending_review
  const foreignCurrencies = new Set(
    fin.foreign.map((e) => {
      const m = e.summary.match(/\(([A-Z]{3})\)/);
      return m?.[1];
    }).filter(Boolean),
  );
  const residencyHint = foreignCurrencies.size >= 2 ? "pending_review" : "resident";
  const residencyReason =
    residencyHint === "pending_review"
      ? `Знайдено доходи у ${foreignCurrencies.size} іноземних валютах — варто підтвердити центр життєвих інтересів та 183-денний тест.`
      : undefined;

  // Income book → допоміжна евіденція для «зарплата/доходи» (не окремий тег)
  // Зберігаємо її окремо для snapshot, не як тег.

  return { tags, evidence, metrics, residencyHint, residencyReason };
}

/** Повний набір evidence для побудови snapshot — повертає також income_book та income монетарну сторону fin_monitoring */
export function getAllEvidenceForYear(cabinetId: string, year: number) {
  const incomeBook = deriveFromIncomeBook(year);
  const fin = deriveFromFinMonitoring(cabinetId, year);
  const investments = deriveFromInvestments(year);
  const kik = deriveFromKik(cabinetId, year);
  return {
    incomeBook,
    finMonitoring: {
      foreign: fin.foreign,
      propertySale: fin.propertySale,
      inheritance: fin.inheritance,
    },
    investments,
    kik,
  };
}
