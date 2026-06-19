/**
 * METRIC FOCUS BLUEPRINTS — канонічні структури Focus-картки для кожної метрики.
 *
 * Використовується у `FocusMetricView` як єдине джерело правди:
 *  • які 4 supporting-KPI обов’язково мають бути показані (картка ніколи не «провалюється» через відсутність значення — синтезуємо з dataset);
 *  • які питання-чипи (follow-up prompts) пропонувати в чат під AI-інсайтом;
 *  • які додаткові блоки за метрикою (Net waterfall, Salary burden, Limit runway, dual-axis, структура).
 */

import type { MetricId } from "@/lib/analytics/metricSectionMatrix";
import type { AnalyticsDataset } from "@/types/universalAnalyticsTypes";
import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import type { MetricContexts } from "@/lib/analytics/metricContexts";

export type KpiFormat = "currency" | "number" | "percent" | "days";

export interface FocusKpiSpec {
  id: string;
  title: string;
  format: KpiFormat;
  /** Семантика для UniversalKPICard variant. */
  semantic?: "income" | "expense" | "warning" | "default";
  /**
   * Як обчислити значення, якщо в `config.kpis` нема цього id.
   * Має повернути число; для відсутніх даних повертати 0.
   */
  resolve: (ctx: FocusResolveCtx) => number;
  /**
   * Period-aware значення з `metricContexts` (пріоритетне джерело).
   * Якщо повертає число — воно використовується замість `resolve`/`config.kpis`.
   * Якщо `undefined` — fallback на статичний KPI або `resolve`.
   */
  resolveFromCtx?: (mc: MetricContexts) => number | undefined;
}

export interface FocusResolveCtx {
  dataset: AnalyticsDataset | null;
  config: CabinetAnalyticsConfig;
  /** Швидкий пошук статичного KPI з config.kpis за списком id. */
  findKpi: (...ids: string[]) => number;
}

export interface FocusBlueprint {
  /** 4 supporting KPI (показуємо завжди, навіть якщо синтезовані). */
  kpis: [FocusKpiSpec, FocusKpiSpec, FocusKpiSpec, FocusKpiSpec];
  /** Чипи з готовими промптами в AI-чат. */
  followUps: string[];
}

// ── Helpers (resolve-функції) ──

const sumCurrent = (ds: AnalyticsDataset | null): number =>
  ds?.chartData?.reduce((s, p) => s + (Number(p.current) || 0), 0) ?? 0;

const sumPrevious = (ds: AnalyticsDataset | null): number =>
  ds?.chartData?.reduce((s, p) => s + (Number(p.previous) || 0), 0) ?? 0;

const avgCurrent = (ds: AnalyticsDataset | null): number => {
  const arr = ds?.chartData ?? [];
  if (!arr.length) return 0;
  return sumCurrent(ds) / arr.length;
};

const maxCurrent = (ds: AnalyticsDataset | null): number => {
  const arr = ds?.chartData ?? [];
  if (!arr.length) return 0;
  return arr.reduce((m, p) => Math.max(m, Number(p.current) || 0), 0);
};

const minCurrent = (ds: AnalyticsDataset | null): number => {
  const arr = ds?.chartData ?? [];
  if (!arr.length) return 0;
  const vals = arr.map((p) => Number(p.current) || 0).filter((v) => v > 0);
  return vals.length ? Math.min(...vals) : 0;
};

const deltaPct = (ds: AnalyticsDataset | null): number => {
  const cur = sumCurrent(ds);
  const prev = sumPrevious(ds);
  return prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : 0;
};

const topStructureValue = (
  ctx: FocusResolveCtx,
  field: "incomeStructure" | "expenseStructure",
): number => {
  const items = (ctx.config[field] ?? []) as Array<{ value: number }>;
  if (!items.length) return 0;
  return items.reduce((m, x) => Math.max(m, x.value || 0), 0);
};

const txCount = (ds: AnalyticsDataset | null): number => sumCurrent(ds);

// ── BLUEPRINTS ──

export const METRIC_FOCUS_BLUEPRINTS: Record<MetricId, FocusBlueprint> = {
  income: {
    kpis: [
      {
        id: "income-count",
        title: "К-сть надходжень",
        format: "number",
        resolve: ({ dataset }) => dataset?.chartData?.length ?? 0,
        resolveFromCtx: (mc) => mc.income.count,
      },
      {
        id: "income-avg",
        title: "Середній чек",
        format: "currency",
        resolve: ({ dataset }) => Math.round(avgCurrent(dataset)),
        resolveFromCtx: (mc) => mc.income.avgCheck,
      },
      {
        id: "income-top-payer",
        title: "Топ-1 платник",
        format: "currency",
        resolve: (ctx) => topStructureValue(ctx, "incomeStructure"),
        resolveFromCtx: (mc) => mc.income.topPayer?.value ?? 0,
      },
      {
        id: "income-delta",
        title: "Δ% до попер.",
        format: "percent",
        resolve: ({ dataset }) => deltaPct(dataset),
        resolveFromCtx: (mc) => mc.income.deltaPct,
      },
    ],
    followUps: [
      "Покажи топ-5 платників за період",
      "Чому дохід змінився vs попередній період?",
      "Розклади дохід по днях",
      "Прогноз доходу до кінця місяця",
    ],
  },

  expenses: {
    kpis: [
      {
        id: "expenses-count",
        title: "К-сть операцій",
        format: "number",
        resolve: ({ dataset }) => dataset?.chartData?.length ?? 0,
        resolveFromCtx: (mc) => mc.expenses.count,
      },
      {
        id: "expenses-avg",
        title: "Середня витрата",
        format: "currency",
        resolve: ({ dataset }) => Math.round(avgCurrent(dataset)),
        resolveFromCtx: (mc) => mc.expenses.avg,
      },
      {
        id: "expenses-top-cat",
        title: "Найбільша стаття",
        format: "currency",
        semantic: "warning",
        resolve: (ctx) => topStructureValue(ctx, "expenseStructure"),
        resolveFromCtx: (mc) => mc.expenses.topCategory?.value ?? 0,
      },
      {
        id: "expenses-delta",
        title: "Δ% до попер.",
        format: "percent",
        resolve: ({ dataset }) => deltaPct(dataset),
        resolveFromCtx: (mc) => mc.expenses.deltaPct,
      },
    ],
    followUps: [
      "Покажи топ-5 категорій витрат",
      "Що зросло найбільше vs попередній період?",
      "Розклади витрати по контрагентах",
      "Що можна скоротити без шкоди для бізнесу?",
    ],
  },

  net: {
    kpis: [
      {
        id: "net-income",
        title: "Дохід",
        format: "currency",
        semantic: "income",
        resolve: ({ findKpi }) => findKpi("income", "revenue"),
        resolveFromCtx: (mc) => mc.net.income,
      },
      {
        id: "net-expenses",
        title: "Витрати",
        format: "currency",
        semantic: "expense",
        resolve: ({ findKpi }) => findKpi("expenses", "total-expenses"),
        resolveFromCtx: (mc) => mc.net.expenses,
      },
      {
        id: "net-taxes",
        title: "Податки",
        format: "currency",
        semantic: "expense",
        resolve: ({ findKpi }) => findKpi("tax-total") || findKpi("ep-vz") + findKpi("esv"),
        resolveFromCtx: (mc) => mc.net.taxes,
      },
      {
        id: "net-margin",
        title: "Маржа",
        format: "percent",
        resolve: ({ findKpi }) => {
          const inc = findKpi("income", "revenue");
          const exp = findKpi("expenses", "total-expenses");
          const tax = findKpi("tax-total") || findKpi("ep-vz") + findKpi("esv");
          if (inc <= 0) return 0;
          return Math.round(((inc - exp - tax) / inc) * 1000) / 10;
        },
        resolveFromCtx: (mc) => mc.net.marginPct,
      },
    ],
    followUps: [
      "Чому маржа змінилась?",
      "Розклади Net по днях",
      "Що зʼїдає найбільше Net?",
      "Прогноз Net до кінця кварталу",
    ],
  },

  taxes: {
    kpis: [
      {
        id: "tax-accrued",
        title: "Σ нараховано",
        format: "currency",
        resolve: ({ dataset, findKpi }) => findKpi("tax-total") || sumCurrent(dataset),
        resolveFromCtx: (mc) => mc.taxes.accrued,
      },
      {
        id: "tax-paid",
        title: "Σ сплачено",
        format: "currency",
        semantic: "income",
        resolve: ({ findKpi }) => findKpi("tax-paid"),
        resolveFromCtx: (mc) => mc.taxes.paid,
      },
      {
        id: "tax-debt",
        title: "Заборгованість",
        format: "currency",
        semantic: "warning",
        resolve: ({ findKpi }) => Math.max(0, findKpi("tax-total") - findKpi("tax-paid")),
        resolveFromCtx: (mc) => mc.taxes.debt,
      },
      {
        id: "tax-paid-count",
        title: "Закрито з усіх",
        format: "number",
        resolve: () => 0,
        resolveFromCtx: (mc) => mc.taxes.paidCount,
      },
    ],
    followUps: [
      "Коли найближчий дедлайн сплати?",
      "Чи я переплачую податки?",
      "Покажи структуру нарахувань",
      "Сценарій сплати на наступний квартал",
    ],
  },

  salaries: {
    kpis: [
      {
        id: "sal-gross",
        title: "Брутто",
        format: "currency",
        semantic: "expense",
        resolve: ({ findKpi, dataset }) => findKpi("sal-gross", "payroll-gross") || sumCurrent(dataset),
        resolveFromCtx: (mc) => mc.salaries.fundGross,
      },
      {
        id: "sal-net",
        title: "Нетто",
        format: "currency",
        resolve: ({ findKpi }) => findKpi("sal-net", "payroll-net"),
        resolveFromCtx: (mc) => mc.salaries.net,
      },
      {
        id: "sal-pdfo",
        title: "ПДФО + ВЗ",
        format: "currency",
        semantic: "expense",
        resolve: ({ findKpi }) => findKpi("sal-pdfo") + findKpi("sal-military"),
        resolveFromCtx: (mc) => mc.salaries.pdfoVz,
      },
      {
        id: "sal-esv",
        title: "ЄСВ",
        format: "currency",
        semantic: "expense",
        resolve: ({ findKpi }) => findKpi("sal-esv"),
        resolveFromCtx: (mc) => mc.salaries.esv,
      },
    ],
    followUps: [
      "Скільки ФОП від доходу?",
      "Покажи виплати по працівниках",
      "Найближчі дедлайни ПДФО/ЄСВ",
      "Що, якщо підняти зарплату на 10%?",
    ],
  },

  transactions: {
    kpis: [
      {
        id: "tx-count",
        title: "К-сть операцій",
        format: "number",
        resolve: ({ dataset }) => txCount(dataset),
        resolveFromCtx: (mc) => mc.transactions.count,
      },
      {
        id: "tx-avg-check",
        title: "Середній чек",
        format: "currency",
        resolve: ({ dataset, findKpi }) => {
          const sum = findKpi("income", "revenue") || sumCurrent(dataset);
          const cnt = txCount(dataset);
          return cnt > 0 ? Math.round(sum / cnt) : 0;
        },
        resolveFromCtx: (mc) => mc.transactions.avgCheck,
      },
      {
        id: "tx-max-check",
        title: "Макс. чек",
        format: "currency",
        resolve: ({ findKpi, dataset }) => findKpi("max-check") || maxCurrent(dataset),
        resolveFromCtx: (mc) => mc.transactions.maxCheck,
      },
      {
        id: "tx-turnover",
        title: "Σ обороту",
        format: "currency",
        resolve: ({ findKpi, dataset }) => findKpi("income", "revenue") || sumCurrent(dataset),
        resolveFromCtx: (mc) => mc.transactions.turnover,
      },
    ],
    followUps: [
      "Покажи найбільші транзакції за період",
      "У які дні найбільше операцій?",
      "Які канали приносять найбільше?",
      "Аномалії в транзакціях за період",
    ],
  },

  limits: {
    kpis: [
      {
        id: "limit-usage",
        title: "Використано %",
        format: "percent",
        semantic: "warning",
        resolve: ({ findKpi }) => findKpi("limit-usage"),
        resolveFromCtx: (mc) => mc.limits.percent,
      },
      {
        id: "limit-remaining",
        title: "Залишок",
        format: "currency",
        resolve: ({ findKpi }) => {
          const annual = findKpi("annual-limit") || 8_285_700;
          const used = findKpi("income", "revenue");
          return Math.max(0, annual - used);
        },
        resolveFromCtx: (mc) => mc.limits.remaining,
      },
      {
        id: "limit-burn",
        title: "Burn / день",
        format: "currency",
        resolve: () => 0,
        resolveFromCtx: (mc) => mc.limits.burnPerDay,
      },
      {
        id: "limit-forecast",
        title: "Прогноз 31.12",
        format: "percent",
        semantic: "warning",
        resolve: () => 0,
        resolveFromCtx: (mc) => mc.limits.forecastEndOfYearPct,
      },
    ],
    followUps: [
      "Скільки лишилось днів до 100% ліміту?",
      "Що буде, якщо темп зросте на 20%?",
      "Чи варто переходити на іншу групу ФОП?",
      "Який оптимальний дохід для моєї групи?",
    ],
  },

  compliance: {
    kpis: [
      {
        id: "compl-score",
        title: "Score відповідності",
        format: "percent",
        resolve: ({ findKpi }) => findKpi("compl-score"),
        resolveFromCtx: (mc) => mc.compliance.score,
      },
      {
        id: "compl-open",
        title: "Відкритих ризиків",
        format: "number",
        semantic: "warning",
        resolve: ({ findKpi }) => findKpi("compl-open"),
        resolveFromCtx: (mc) => mc.compliance.open,
      },
      {
        id: "compl-critical",
        title: "Критичних",
        format: "number",
        semantic: "expense",
        resolve: ({ findKpi }) => findKpi("compl-overdue"),
        resolveFromCtx: (mc) => mc.compliance.critical,
      },
      {
        id: "compl-deadlines",
        title: "Найближчих 14д",
        format: "number",
        resolve: ({ findKpi }) => findKpi("compl-deadlines"),
        resolveFromCtx: (mc) => mc.compliance.upcoming,
      },
    ],
    followUps: [
      "Що горить найближчим часом?",
      "Які ризики блокують роботу?",
      "Як закрити прострочення без штрафів?",
      "Покажи чек-лист на місяць",
    ],
  },

  documents: {
    kpis: [
      {
        id: "docs-total",
        title: "Всього",
        format: "number",
        resolve: ({ findKpi }) => findKpi("docs-total"),
        resolveFromCtx: (mc) => mc.documents.total,
      },
      {
        id: "docs-unsigned",
        title: "Без підпису",
        format: "number",
        semantic: "warning",
        resolve: ({ findKpi }) => findKpi("docs-unsigned"),
        resolveFromCtx: (mc) => mc.documents.unsigned,
      },
      {
        id: "docs-overdue",
        title: "Прострочених",
        format: "number",
        semantic: "expense",
        resolve: ({ findKpi }) => findKpi("docs-overdue"),
        resolveFromCtx: (mc) => mc.documents.overdue,
      },
      {
        id: "docs-actions",
        title: "Очікують дії",
        format: "number",
        resolve: ({ findKpi }) => findKpi("docs-actions"),
        resolveFromCtx: (mc) => mc.documents.awaiting,
      },
    ],
    followUps: [
      "Покажи документи без підпису",
      "Що очікує моєї дії сьогодні?",
      "Які контрагенти не повернули акти?",
      "Згенеруй чек-лист закриття місяця",
    ],
  },

  access: {
    kpis: [
      {
        id: "access-users",
        title: "Користувачів",
        format: "number",
        resolve: ({ findKpi }) => findKpi("access-users"),
        resolveFromCtx: (mc) => mc.access.users,
      },
      {
        id: "access-roles",
        title: "Ролей",
        format: "number",
        resolve: ({ findKpi }) => findKpi("access-roles"),
        resolveFromCtx: (mc) => mc.access.roles,
      },
      {
        id: "access-2fa",
        title: "2FA вкл.",
        format: "percent",
        resolve: ({ findKpi }) => findKpi("access-2fa"),
        resolveFromCtx: (mc) => mc.access.twofaPct,
      },
      {
        id: "access-recent",
        title: "Заходів 7д",
        format: "number",
        resolve: ({ findKpi }) => findKpi("access-recent"),
        resolveFromCtx: (mc) => mc.access.logins7d,
      },
    ],
    followUps: [
      "Хто заходив до кабінету за тиждень?",
      "Чи є підозрілі дії?",
      "Покажи права моїх співробітників",
      "Як налаштувати 2FA для всіх?",
    ],
  },
};

export function getBlueprint(metricId: MetricId): FocusBlueprint {
  return METRIC_FOCUS_BLUEPRINTS[metricId] ?? METRIC_FOCUS_BLUEPRINTS.income;
}
