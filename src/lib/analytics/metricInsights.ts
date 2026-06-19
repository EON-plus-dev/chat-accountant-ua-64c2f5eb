/**
 * Універсальний fallback-генератор AI-інсайту для будь-якої метрики.
 *
 * Викликається з AnalyticsAiBriefing (секція «Пояснення») і — в історичному
 * вжитку — з FocusMetricView. Гарантує, що секція ніколи не буває порожньою.
 *
 * Для більшості метрик логіка тепер спирається на period-aware `metricContexts`
 * (передається через `extra.*Context`). Якщо контекст відсутній — fallback
 * на стару логіку агрегації chartData.
 */

import type { AnalyticsDataset } from "@/types/universalAnalyticsTypes";
import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import type { MetricId } from "@/lib/analytics/metricSectionMatrix";
import { formatValue, formatCurrencySymbol } from "@/lib/formatters";
import { getFormatForMetric, getAggregationForMetric, getMetricConfig, getRelevantDatasetIds } from "@/lib/analytics/metricSectionMatrix";
import type {
  IncomeContext,
  ExpensesContext,
  NetContext,
  TransactionsContext,
  LimitsContext,
  TaxesContext,
  SalariesContext,
  ComplianceContext,
  DocumentsContext,
  AccessContext,
} from "@/lib/analytics/metricContexts";

const METRIC_NOUN: Partial<Record<MetricId, string>> = {
  income: "доходу",
  expenses: "витрат",
  net: "чистого прибутку",
  taxes: "податків",
  salaries: "ФОП",
  transactions: "транзакцій",
  limits: "обороту",
  compliance: "виконаних пунктів",
  documents: "документів",
  access: "входів",
};

export interface MetricInsightExtra {
  /** Контекст ліміту ФОП — для метрики `limits`. */
  limitContext?: {
    enabled: boolean;
    amount: number;
    limit: number | null;
    percent: number;
    remaining: number;
    group?: 1 | 2 | 3;
  };
  incomeContext?: IncomeContext;
  expensesContext?: ExpensesContext;
  netContext?: NetContext;
  transactionsContext?: TransactionsContext;
  limitsContext?: LimitsContext;
  taxesContext?: TaxesContext;
  salariesContext?: SalariesContext;
  complianceContext?: ComplianceContext;
  documentsContext?: DocumentsContext;
  accessContext?: AccessContext;
}

/** Підбір датасету під метрику (раніше дублювалося у FocusMetricView). */
export function pickDatasetForMetric(
  metricId: MetricId,
  datasets: AnalyticsDataset[],
): AnalyticsDataset | null {
  if (!datasets?.length) return null;
  const wanted = getRelevantDatasetIds([metricId]);
  return datasets.find((d) => wanted.has(d.id)) ?? datasets[0] ?? null;
}

const fmtPct = (v: number): string => `${v >= 0 ? "+" : ""}${v.toFixed(1).replace(/\.0$/, "")}%`;

export function buildMetricInsight(
  metricId: MetricId,
  dataset: AnalyticsDataset | null,
  config: CabinetAnalyticsConfig,
  extra?: MetricInsightExtra,
): string {
  const fmt = getFormatForMetric(metricId);
  const agg = getAggregationForMetric(metricId);
  const label = getMetricConfig(metricId).label;
  const noun = METRIC_NOUN[metricId] ?? label.toLowerCase();

  // ── Period-aware бранчі (пріоритет) ──

  // INCOME
  if (metricId === "income" && extra?.incomeContext) {
    const ic = extra.incomeContext;
    if (ic.total === 0) return "Надходжень за цей період не зафіксовано.";
    const parts = [`Дохід ${formatCurrencySymbol(ic.total)} (${ic.count} надходжень, середній чек ${formatCurrencySymbol(ic.avgCheck)}).`];
    if (ic.prevTotal > 0) parts.push(`${fmtPct(ic.deltaPct)} до попереднього періоду.`);
    if (ic.topPayer) parts.push(`Топ-1 платник — ${ic.topPayer.name} (${formatCurrencySymbol(ic.topPayer.value)}).`);
    return parts.join(" ");
  }

  // EXPENSES
  if (metricId === "expenses" && extra?.expensesContext) {
    const ec = extra.expensesContext;
    if (ec.total === 0) return "Витрат за цей період не зафіксовано.";
    const parts = [`Витрати ${formatCurrencySymbol(ec.total)} (${ec.count} операцій).`];
    if (ec.prevTotal > 0) parts.push(`${fmtPct(ec.deltaPct)} vs попер.`);
    if (ec.topCategory) parts.push(`Найбільша стаття — ${ec.topCategory.name} (${ec.topCategory.pct}%).`);
    return parts.join(" ");
  }

  // NET
  if (metricId === "net" && extra?.netContext) {
    const nc = extra.netContext;
    if (nc.income === 0 && nc.expenses === 0 && nc.taxes === 0) return "Даних для розрахунку чистого прибутку немає.";
    const parts = [`Чистий прибуток ${formatCurrencySymbol(nc.net)} (маржа ${nc.marginPct}%).`];
    parts.push(`Дохід ${formatCurrencySymbol(nc.income)} − витрати ${formatCurrencySymbol(nc.expenses)} − податки ${formatCurrencySymbol(nc.taxes)}.`);
    if (nc.prevNet !== 0) parts.push(`${fmtPct(nc.deltaPct)} до попер.`);
    if (nc.biggestDrag) parts.push(`Найбільший зʼїдач — ${nc.biggestDrag === "expenses" ? "витрати" : "податки"}.`);
    return parts.join(" ");
  }

  // TRANSACTIONS
  if (metricId === "transactions" && extra?.transactionsContext) {
    const tc = extra.transactionsContext;
    if (tc.count === 0) return "Транзакцій за цей період не зафіксовано.";
    const parts = [`${tc.count} операцій на ${formatCurrencySymbol(tc.turnover)}; середній чек ${formatCurrencySymbol(tc.avgCheck)}.`];
    if (tc.maxCheck > 0) parts.push(`Макс. чек — ${formatCurrencySymbol(tc.maxCheck)}.`);
    if (tc.peakDay) parts.push(`Пік — ${tc.peakDay.label} (${tc.peakDay.value} оп.).`);
    if (tc.returnsCount > 0) parts.push(`Повернень: ${tc.returnsCount}.`);
    return parts.join(" ");
  }

  // LIMITS
  if (metricId === "limits") {
    const lc = extra?.limitsContext;
    if (lc && lc.enabled && lc.limit > 0) {
      const groupLabel = lc.group ? ` групи ${lc.group}` : "";
      const status = lc.status === "ok" ? "у нормі" : lc.status === "warning" ? "увага" : "критично";
      const parts = [`Використано ${lc.percent}% річного ліміту${groupLabel} (${formatCurrencySymbol(lc.used)} / ${formatCurrencySymbol(lc.limit)}) — ${status}.`];
      parts.push(`Залишок ${formatCurrencySymbol(lc.remaining)}; темп ${formatCurrencySymbol(lc.burnPerDay)}/день.`);
      if (lc.daysToLimit !== null) parts.push(`До 100% ліміту — ${lc.daysToLimit} днів.`);
      parts.push(`Прогноз на 31.12 — ${lc.forecastEndOfYearPct}%.`);
      return parts.join(" ");
    }
    // Старий бранч (limitContext) — для зворотньої сумісності
    const oc = extra?.limitContext;
    if (oc && oc.enabled && oc.limit && oc.limit > 0) {
      const groupLabel = oc.group ? ` групи ${oc.group}` : "";
      return `Використано ${oc.percent.toFixed(1)}% річного ліміту${groupLabel} (${formatCurrencySymbol(oc.amount)} / ${formatCurrencySymbol(oc.limit)}). Залишок — ${formatCurrencySymbol(oc.remaining)}.`;
    }
    return "Дані ліміту відсутні для обраного періоду.";
  }

  // TAXES
  if (metricId === "taxes" && extra?.taxesContext) {
    const tc = extra.taxesContext;
    if (tc.totalCount === 0) return "Податкових зобовʼязань за цей період немає.";
    const parts = [`Сплачено ${tc.paidCount} з ${tc.totalCount}: нараховано ${formatCurrencySymbol(tc.accrued)}, оплачено ${formatCurrencySymbol(tc.paid)}.`];
    if (tc.debt > 0) parts.push(`Заборгованість — ${formatCurrencySymbol(tc.debt)}.`);
    else parts.push("Розраховано повністю.");
    if (tc.overdueTypes.length > 0) parts.push(`Прострочено: ${tc.overdueTypes.join(", ")}.`);
    if (tc.upcoming.length > 0) {
      const u = tc.upcoming[0];
      parts.push(`Найближчий дедлайн — ${u.name} (${u.date}).`);
    }
    return parts.join(" ");
  }

  // SALARIES
  if (metricId === "salaries" && extra?.salariesContext) {
    const sc = extra.salariesContext;
    if (sc.payCount === 0) return "Виплат зарплати за цей період не було.";
    const parts = [`Фонд ${formatCurrencySymbol(sc.fundGross)} (${sc.payCount} виплат, нетто ${formatCurrencySymbol(sc.net)}).`];
    parts.push(`ПДФО+ВЗ ${formatCurrencySymbol(sc.pdfoVz)}, ЄСВ ${formatCurrencySymbol(sc.esv)}.`);
    if (sc.burdenPct > 0) parts.push(`Навантаження на дохід — ${sc.burdenPct}%.`);
    if (sc.prevFund > 0) parts.push(`${fmtPct(sc.deltaPct)} до попер.`);
    return parts.join(" ");
  }

  // COMPLIANCE
  if (metricId === "compliance" && extra?.complianceContext) {
    const cc = extra.complianceContext;
    const parts = [`Score відповідності ${cc.score}%; відкритих ризиків ${cc.open} (критичних ${cc.critical}).`];
    if (cc.overdue > 0) parts.push(`Прострочено ${cc.overdue}.`);
    if (cc.upcoming > 0) parts.push(`Дедлайнів у наступних 14 днях — ${cc.upcoming}.`);
    const top = cc.topRisks[0];
    if (top) parts.push(`Найгостріше — «${top.title}».`);
    return parts.join(" ");
  }

  // DOCUMENTS
  if (metricId === "documents" && extra?.documentsContext) {
    const dc = extra.documentsContext;
    if (dc.total === 0) return "Документів за цей період немає.";
    const parts = [`Всього документів ${dc.total}: ${dc.signed} підписано, ${dc.unsigned} без підпису.`];
    if (dc.awaiting > 0) parts.push(`Очікують уточнень — ${dc.awaiting}.`);
    if (dc.overdue > 0) parts.push(`Прострочено — ${dc.overdue}.`);
    return parts.join(" ");
  }

  // ACCESS
  if (metricId === "access" && extra?.accessContext) {
    const ac = extra.accessContext;
    const parts = [`${ac.users} користувачів (${ac.roles} ролей); за тиждень ${ac.logins7d} входів.`];
    parts.push(`2FA увімкнено в ${ac.twofaPct}% акаунтів.`);
    if (ac.suspiciousCount > 0) parts.push(`Підозрілих дій: ${ac.suspiciousCount}.`);
    return parts.join(" ");
  }

  // ── Fallback: chartData агрегація (стара логіка) ──

  // 1. Беремо chartData (якщо є) — найточніше джерело
  const points = dataset?.chartData ?? [];
  if (points.length === 0) {
    // 2. fallback на config.kpis
    const kpi = config.kpis.find((k) => k.id === metricId) ?? config.kpis[0];
    if (kpi) {
      const num = typeof kpi.value === "number"
        ? kpi.value
        : parseFloat(String(kpi.value).replace(/[^\d.-]/g, "")) || 0;
      return `${label}: ${formatValue(num, (kpi.format as "currency" | "number" | "percent" | "days") ?? fmt)}.`;
    }
    return `Немає даних ${noun} за обраний період.`;
  }

  const curs = points.map((p) => Number(p.current) || 0);
  const prevs = points.map((p) => Number(p.previous) || 0);
  const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);

  const total = agg === "sum" ? sum(curs) : agg === "last" ? curs[curs.length - 1] : sum(curs) / curs.length;
  const totalPrev = agg === "sum" ? sum(prevs) : agg === "last" ? prevs[prevs.length - 1] : sum(prevs) / Math.max(1, prevs.length);
  const hasPrev = prevs.some((v) => v !== 0);

  const peakIdx = curs.indexOf(Math.max(...curs));
  const peakLabel = points[peakIdx]?.category ?? "";
  const peakVal = curs[peakIdx] ?? 0;

  // Δ%
  let deltaText = "";
  if (hasPrev && totalPrev !== 0) {
    const pct = ((total - totalPrev) / Math.abs(totalPrev)) * 100;
    if (Number.isFinite(pct)) {
      const arrow = pct >= 0 ? "▲" : "▼";
      deltaText = ` ${arrow} ${Math.abs(pct).toFixed(1)}% до попереднього періоду.`;
    }
  }

  const aggLabel = agg === "sum" ? "Сума" : agg === "last" ? "Поточне значення" : "Середнє";
  const peakText = peakLabel && peakVal > 0
    ? ` Пік — ${peakLabel} (${formatValue(peakVal, fmt)}).`
    : "";

  return `${aggLabel} ${noun}: ${formatValue(total, fmt)}.${deltaText}${peakText}`;
}
