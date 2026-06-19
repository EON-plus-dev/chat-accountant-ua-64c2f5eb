// Phase 7.3 — Auto-create draft declaration cases.
// Декларація — це похідна від даних модулів. Чернетка має зʼявлятися автоматично
// одразу як завершиться звітний рік (1 січня), без жодних дій користувача.

import {
  demoDeclarationCases,
  rulesVersionForYear,
  type DeclarationCase,
  type ProfileTag,
} from "@/config/demoCabinets/declarationCases";
import { deriveProfileTagsFromFacts } from "@/config/demoCabinets/declarationFactDeriver";
import { buildDeclarationSnapshot } from "@/config/demoCabinets/declarationSnapshot";

/** Кеш авто-створених кейсів у межах сесії — щоб ID були стабільні між рендерами */
const autoCaseCache = new Map<string, DeclarationCase>();

const cacheKey = (cabinetId: string, year: number) => `${cabinetId}::${year}`;

/**
 * Гарантує існування чернетки декларації за рік.
 * 1) Якщо кейс уже є в demoDeclarationCases — повертає його.
 * 2) Інакше — деривує теги з фактів модулів і створює "draft" з обчисленими сумами.
 *
 * Ідемпотентно: повторні виклики повертають той самий обʼєкт.
 */
export function ensureDraftDeclarationForYear(
  cabinetId: string,
  year: number,
): DeclarationCase {
  // 1) Існуючий кейс?
  const existing = demoDeclarationCases.find(
    (c) => c.cabinetId === cabinetId && c.reportingYear === year && !c.amendmentOf,
  );
  if (existing) return existing;

  // 2) Кеш авто-створення
  const key = cacheKey(cabinetId, year);
  const cached = autoCaseCache.get(key);
  if (cached) return cached;

  // 3) Створюємо з фактів
  const derived = deriveProfileTagsFromFacts(cabinetId, year);
  const tags: ProfileTag[] = derived.tags;

  // Базовий кейс без сум — потрібен для buildDeclarationSnapshot
  const skeletal: DeclarationCase = {
    id: `auto-${cabinetId}-${year}`,
    cabinetId,
    title: "Декларація про майновий стан і доходи",
    reportingYear: year,
    amendmentOf: null,
    status: "draft",
    rulesVersion: rulesVersionForYear(year),
    filingStatus:
      tags.includes("has_kik") || tags.includes("has_foreign_income")
        ? "mandatory_with_addons"
        : tags.length > 0
          ? "mandatory"
          : "voluntary",
    profileTags: tags,
    residencyStatus: derived.residencyHint,
    progressPercent: 0,
    trustees: [],
    auditLog: [
      {
        id: "auto-1",
        actorRole: "system",
        actorName: "Система",
        eventType: "field_changed",
        fieldPath: "case",
        newValue: `Чернетку згенеровано автоматично на основі даних модулів кабінету (${derived.tags.length} ознак, версія правил ${rulesVersionForYear(year)})`,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 4) Обчислюємо реальні суми зі snapshot
  const snapshot = buildDeclarationSnapshot(skeletal);

  const totalIncome = snapshot.totals.grossIncome;
  const totalTax = snapshot.totals.netToPay;
  const totalRefund = snapshot.totals.refund;

  // Чесний прогрес: жодних базових 30% «за то що ми тут».
  // Якщо джерел немає — 0%. Інакше — складається з реально досяжних кроків.
  let progress = 0;
  const sc = snapshot.generation.sourceCount;
  if (sc > 0) {
    progress = 20; // base "є дані"
    if (snapshot.incomes.length > 0) progress += 25;
    if (snapshot.appendices.length === 0 || snapshot.appendices.every((a) => a.ready)) progress += 20;
    if (!snapshot.warnings.some((w) => w.severity === "error")) progress += 20;
    if (snapshot.fxRates.length > 0 || !tags.includes("has_foreign_income")) progress += 10;
  }

  const fullCase: DeclarationCase = {
    ...skeletal,
    totalIncome,
    totalTax,
    totalRefund,
    // Чернетка ніколи не досягає 100% — це резервується для статусу submitted/accepted.
    progressPercent: Math.min(95, progress),
  };

  if (derived.residencyReason) {
    fullCase.auditLog.push({
      id: "auto-2",
      actorRole: "system",
      actorName: "Система",
      eventType: "comment",
      reason: derived.residencyReason,
      createdAt: new Date().toISOString(),
    });
  }

  autoCaseCache.set(key, fullCase);
  return fullCase;
}

/**
 * Повертає всі кейси кабінету: історичні (з demoDeclarationCases) + авто-створені чернетки
 * для років, де ще немає поданої декларації.
 *
 * Phase 7 audit: чернетка створюється ЛИШЕ коли є реальні факти у звітному році
 * (через deriveProfileTagsFromFacts). Це прибирає "сміття" типу порожніх чернеток
 * за 2023 і 2026, які раніше з'являлися автоматично.
 */
export function getDeclarationCasesWithAutoDrafts(
  cabinetId: string,
  yearsToEnsure: number[],
): DeclarationCase[] {
  const result: DeclarationCase[] = [];
  const seenYears = new Set<number>();

  // Спочатку — все, що вже є вручну (історичні + amendments)
  for (const c of demoDeclarationCases) {
    if (c.cabinetId === cabinetId) {
      result.push(c);
      if (!c.amendmentOf) seenYears.add(c.reportingYear);
    }
  }

  // Доповнюємо автоматичними чернетками лише для років з фактичними даними
  for (const y of yearsToEnsure) {
    if (seenYears.has(y)) continue;
    const derived = deriveProfileTagsFromFacts(cabinetId, y);
    // Жодних фактів → не створюємо чернетку (інакше буде "0 ₴ AI чернетка")
    if (derived.tags.length === 0) continue;
    result.push(ensureDraftDeclarationForYear(cabinetId, y));
  }

  return result.sort((a, b) => b.reportingYear - a.reportingYear);
}
