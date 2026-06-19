import { useMemo, useCallback } from "react";
import { UniversalKPICard } from "@/components/ui/UniversalKPICard";
import { FocusMetricChart } from "./FocusMetricChart";
import { NetWaterfall } from "./widgets/NetWaterfall";
import { TransactionsDualAxis } from "./widgets/TransactionsDualAxis";
import { LimitRunway } from "./widgets/LimitRunway";
import { SalaryBurden } from "./widgets/SalaryBurden";
import {
  getMetricConfig,
  getRelevantDatasetIds,
  getAggregationForMetric,
  getFormatForMetric,
  getRowIdsForMetric,
  type MetricId,
} from "@/lib/analytics/metricSectionMatrix";
import { getBlueprint } from "@/lib/analytics/metricFocusBlueprints";
import { getDefaultChartTypeForMetric } from "@/lib/analytics/displayMode";
import { formatValue, formatCurrencySymbol } from "@/lib/formatters";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  MessageCircleQuestion, CheckCircle2, AlertTriangle, Clock, FileText, ShieldCheck, LogIn,
  Download, ImageDown, Copy, Wallet,
} from "lucide-react";
import type { AnalyticsDataset, AnalyticsRow } from "@/types/universalAnalyticsTypes";
import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import type { MetricContexts } from "@/lib/analytics/metricContexts";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface FocusMetricViewProps {
  metricId: MetricId;
  config: CabinetAnalyticsConfig;
  explorerDatasets: AnalyticsDataset[];
  comparisonResult: { currentLabel: string; previousLabel: string } | null;
  /** "table" — показати компактну таблицю замість hero-чарту. */
  viewMode?: "table" | "chart";
  /** Перемикач Графік/Таблиця у hero (якщо переданий — рендериться). */
  onViewModeChange?: (v: "table" | "chart") => void;
  /** Контекстні follow-up чипи кидаємо в чат-провайдер. */
  onChatPromptInsert?: (prompt: string) => void;
  /** Period-aware фактологія для всіх 10 метрик (з PeriodModeView). */
  metricContexts?: MetricContexts;
}

/**
 * Hero values, обчислені виключно з period-фільтрованих даних:
 *  1) **metricContexts** (period-aware, найточніше джерело)
 *  2) шукаємо рядок dataset.rows за канонічними id метрики
 *  3) якщо нема — агрегуємо chartData (sum/last/avg)
 *  4) якщо й цього немає — fallback на config.kpis (статичний).
 */
function resolveHeroValues(
  metricId: MetricId,
  dataset: AnalyticsDataset | null,
  configKpis: CabinetAnalyticsConfig["kpis"],
  metricContexts?: MetricContexts,
): {
  current: number;
  previous: number | null;
  format: "currency" | "number" | "percent" | "days";
  description: string | null;
  source: "ctx" | "row" | "aggregated" | "kpi";
} {
  const fmt = getFormatForMetric(metricId);

  // 0. Period-aware metricContexts — пріоритетне джерело
  if (metricContexts) {
    switch (metricId) {
      case "income":
        return { current: metricContexts.income.total, previous: metricContexts.income.prevTotal || null, format: "currency", description: null, source: "ctx" };
      case "expenses":
        return { current: metricContexts.expenses.total, previous: metricContexts.expenses.prevTotal || null, format: "currency", description: null, source: "ctx" };
      case "net":
        return { current: metricContexts.net.net, previous: metricContexts.net.prevNet || null, format: "currency", description: null, source: "ctx" };
      case "transactions":
        return { current: metricContexts.transactions.count, previous: metricContexts.transactions.prevCount || null, format: "number", description: null, source: "ctx" };
      case "limits":
        return { current: metricContexts.limits.percent, previous: null, format: "percent", description: metricContexts.limits.enabled ? `Група ${metricContexts.limits.group} · залишок ${formatCurrencySymbol(metricContexts.limits.remaining)}` : "Ліміт не застосовується", source: "ctx" };
      case "taxes":
        return { current: metricContexts.taxes.accrued, previous: null, format: "currency", description: `Сплачено ${metricContexts.taxes.paidCount}/${metricContexts.taxes.totalCount}`, source: "ctx" };
      case "salaries":
        return { current: metricContexts.salaries.fundGross, previous: metricContexts.salaries.prevFund || null, format: "currency", description: `${metricContexts.salaries.payCount} виплат`, source: "ctx" };
      case "compliance":
        return { current: metricContexts.compliance.score, previous: null, format: "percent", description: `${metricContexts.compliance.open} відкритих ризиків`, source: "ctx" };
      case "documents":
        return { current: metricContexts.documents.total, previous: null, format: "number", description: `${metricContexts.documents.signed} підписано · ${metricContexts.documents.unsigned} без підпису`, source: "ctx" };
      case "access":
        return { current: metricContexts.access.users, previous: null, format: "number", description: `${metricContexts.access.logins7d} заходів за 7д`, source: "ctx" };
    }
  }

  // 1. Точний рядок у dataset
  if (dataset?.rows?.length) {
    const ids = getRowIdsForMetric(metricId);
    const row =
      dataset.rows.find((r) => ids.includes(r.id)) ??
      dataset.rows.find((r) =>
        ids.some((id) => r.metric?.toLowerCase().includes(id.replace(/-/g, " "))),
      );
    if (row) {
      return {
        current: row.currentValue,
        previous: row.previousValue ?? null,
        format: row.format ?? fmt,
        description: null,
        source: "row",
      };
    }
  }

  // 2. Агрегація chartData
  if (dataset?.chartData?.length) {
    const agg = getAggregationForMetric(metricId);
    const values = dataset.chartData.map((p) => Number(p.current) || 0);
    const prevValues = dataset.chartData.map((p) => Number(p.previous) || 0);
    const reduce = (arr: number[]): number => {
      if (!arr.length) return 0;
      if (agg === "sum") return arr.reduce((s, v) => s + v, 0);
      if (agg === "last") return arr[arr.length - 1];
      return arr.reduce((s, v) => s + v, 0) / arr.length;
    };
    const current = reduce(values);
    const previous = prevValues.some((v) => v !== 0) ? reduce(prevValues) : null;
    return { current, previous, format: fmt, description: null, source: "aggregated" };
  }

  // 3. KPI fallback (статичний)
  const ids = getRowIdsForMetric(metricId);
  const exact = configKpis.find((k) => k.id === metricId);
  const byCanonical = exact ?? configKpis.find((k) => ids.includes(k.id));
  const kpi = byCanonical ?? configKpis[0];
  const num = kpi
    ? typeof kpi.value === "number"
      ? kpi.value
      : parseFloat(String(kpi.value).replace(/[^\d.-]/g, "")) || 0
    : 0;
  return {
    current: num,
    previous: null,
    format: (kpi?.format as "currency" | "number" | "percent" | "days") ?? fmt,
    description: kpi?.description ?? null,
    source: "kpi",
  };
}

/** Метрики, для яких НЕ показуємо синтетичний hero-чарт (немає осмисленої time-series). */
const HIDE_CHART_FOR: ReadonlySet<MetricId> = new Set<MetricId>(["compliance", "documents", "access"]);

/**
 * Focus-канвас однієї метрики:
 *  - Hero-карта (велика цифра з ПОТОЧНОГО періоду + динамічний trend під baseline)
 *  - 4 supporting KPI strip (compact)
 *  - Hero-чарт (FocusMetricChart) — area/bar за типом метрики
 *  - Структура (income → топ контрагенти; expenses → топ категорії)
 *  - Net → waterfall (Дохід − Витрати − Податки = Net)
 */
export const FocusMetricView = ({
  metricId,
  config,
  explorerDatasets,
  comparisonResult,
  viewMode = "chart",
  onViewModeChange,
  onChatPromptInsert,
  metricContexts,
}: FocusMetricViewProps) => {
  const metricConfig = getMetricConfig(metricId);
  const Icon = metricConfig.icon;
  const accent = metricConfig.color;

  const dataset = useMemo<AnalyticsDataset | null>(() => {
    const wanted = getRelevantDatasetIds([metricId]);
    return explorerDatasets.find((d) => wanted.has(d.id)) ?? explorerDatasets[0] ?? null;
  }, [explorerDatasets, metricId]);

  // ── Period-aware hero ──
  const hero = useMemo(
    () => resolveHeroValues(metricId, dataset, config.kpis, metricContexts),
    [metricId, dataset, config.kpis, metricContexts],
  );

  /** Δ% рахуємо з period-aware values, тільки якщо є comparisonResult. */
  const heroTrend = useMemo(() => {
    // Для score-based метрик не показуємо стрілку (немає семантичного попереднього періоду)
    if (metricId === "limits" || metricId === "compliance" || metricId === "documents" || metricId === "access" || metricId === "taxes") {
      return null;
    }
    if (!comparisonResult) return null;
    if (hero.previous === null || hero.previous === 0) return null;
    const pct = ((hero.current - hero.previous) / Math.abs(hero.previous)) * 100;
    if (!Number.isFinite(pct)) return null;
    return { pct, direction: pct >= 0 ? ("up" as const) : ("down" as const) };
  }, [comparisonResult, hero.current, hero.previous, metricId]);

  /** Семантика метрики для розфарбування тренду (для expenses зростання — погано). */
  const trendIsGood = useMemo(() => {
    if (!heroTrend) return true;
    const negativeUp = metricId === "expenses" || metricId === "taxes" || metricId === "salaries";
    return negativeUp ? heroTrend.direction === "down" : heroTrend.direction === "up";
  }, [heroTrend, metricId]);

  /** Статус-бейдж для limits замість Δ%-стрілки. */
  const limitsStatusBadge = useMemo(() => {
    if (metricId !== "limits" || !metricContexts?.limits.enabled) return null;
    const s = metricContexts.limits.status;
    return {
      label: s === "ok" ? "ОК" : s === "warning" ? "Увага" : "Критично",
      tone: s === "ok"
        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
        : s === "warning"
          ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
          : "text-rose-600 dark:text-rose-400 bg-rose-500/10",
    };
  }, [metricId, metricContexts]);

  /** 4 supporting KPI з blueprint — пріоритет: resolveFromCtx → static KPI → resolve. */
  const supportingKpis = useMemo(() => {
    const blueprint = getBlueprint(metricId);
    const findKpi = (...ids: string[]): number => {
      for (const id of ids) {
        const kpi = config.kpis.find((k) => k.id === id);
        if (kpi) {
          return typeof kpi.value === "number"
            ? kpi.value
            : parseFloat(String(kpi.value).replace(/[^\d.-]/g, "")) || 0;
        }
      }
      return 0;
    };
    const ctx = { dataset, config, findKpi };
    return blueprint.kpis.map((spec) => {
      // 1. Period-aware: resolveFromCtx має пріоритет.
      let value: number | undefined;
      if (metricContexts && spec.resolveFromCtx) {
        value = spec.resolveFromCtx(metricContexts);
      }
      // 2. Статичний KPI з config.
      if (value === undefined) {
        const staticKpi = config.kpis.find((k) => k.id === spec.id);
        if (staticKpi) {
          value = typeof staticKpi.value === "number"
            ? staticKpi.value
            : parseFloat(String(staticKpi.value).replace(/[^\d.-]/g, "")) || 0;
        }
      }
      // 3. Fallback resolve.
      if (value === undefined) value = spec.resolve(ctx);

      const staticKpi = config.kpis.find((k) => k.id === spec.id);
      return {
        id: spec.id,
        title: spec.title,
        value,
        format: spec.format,
        semantic: spec.semantic ?? "default",
        // Тренд показуємо тільки якщо НЕ використали ctx (статичний KPI).
        trend: metricContexts && spec.resolveFromCtx ? undefined : staticKpi?.trend,
      };
    });
  }, [metricId, config, dataset, metricContexts]);

  /** Follow-up чипи в чат — з blueprint. */
  const followUps = useMemo(() => getBlueprint(metricId).followUps, [metricId]);


  const chartType = getDefaultChartTypeForMetric(metricId);
  const chartData = dataset?.chartData ?? [];

  // ── Експорт чарту (CSV / PNG / Copy) — викликається з шапки блоку «Динаміка» ──
  const compareEnabled = Boolean(comparisonResult);
  const currentLabel = dataset?.currentLabel ?? comparisonResult?.currentLabel ?? "Поточний період";
  const previousLabel = dataset?.previousLabel ?? comparisonResult?.previousLabel ?? "Попередній період";

  const handleExportCsv = useCallback(() => {
    if (!chartData.length) {
      toast.error("Немає даних для експорту");
      return;
    }
    const header = compareEnabled
      ? ["Період", currentLabel, previousLabel]
      : ["Період", currentLabel];
    const rows = chartData.map((d) =>
      compareEnabled
        ? [d.category, String(d.current), String(d.previous ?? "")]
        : [d.category, String(d.current)],
    );
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${metricConfig.label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV експортовано");
  }, [chartData, compareEnabled, currentLabel, previousLabel, metricConfig.label]);

  const handleCopyValues = useCallback(async () => {
    if (!chartData.length) {
      toast.error("Немає даних для копіювання");
      return;
    }
    const text = chartData
      .map((d) =>
        compareEnabled
          ? `${d.category}\t${d.current}\t${d.previous ?? ""}`
          : `${d.category}\t${d.current}`,
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Значення скопійовано");
    } catch {
      toast.error("Не вдалося скопіювати");
    }
  }, [chartData, compareEnabled]);

  const handleExportPng = useCallback(() => {
    const wrapper = document.querySelector(`[data-focus-chart-id="${metricConfig.label}"] svg`);
    if (!wrapper) {
      toast.error("Не вдалося знайти графік");
      return;
    }
    const svgClone = wrapper.cloneNode(true) as SVGElement;
    const xml = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = (wrapper as SVGElement).clientWidth * 2;
      canvas.height = (wrapper as SVGElement).clientHeight * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `analytics-${metricConfig.label}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success("PNG збережено");
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [metricConfig.label]);

  // ── Структура: правильне джерело за метрикою ──
  const structureItems = useMemo(() => {
    let items: typeof config.expenseStructure = [];
    if (metricId === "expenses") items = config.expenseStructure ?? [];
    else if (metricId === "income") items = config.incomeStructure ?? [];
    // для net — структуру не показуємо (нижче — waterfall)
    if (!items.length) return [];
    const total = items.reduce((s, e) => s + (e.value || 0), 0);
    if (total <= 0) return [];

    // Largest-remainder округлення до 100%
    const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, 5);
    const raw = sorted.map((e) => ({ name: e.name, value: e.value, exact: (e.value / total) * 100 }));
    const floored = raw.map((r) => ({ ...r, percent: Math.floor(r.exact), remainder: r.exact - Math.floor(r.exact) }));
    let leftover = 100 - floored.reduce((s, r) => s + r.percent, 0);
    floored
      .map((r, i) => ({ i, remainder: r.remainder }))
      .sort((a, b) => b.remainder - a.remainder)
      .forEach(({ i }) => {
        if (leftover > 0) {
          floored[i].percent += 1;
          leftover -= 1;
        }
      });
    return floored.map(({ name, value, percent }) => ({ name, value, percent }));
  }, [config.expenseStructure, config.incomeStructure, metricId]);

  // ── Net waterfall: рахуємо з config.kpis (income, expenses, tax-total/ep-vz+esv), з fallback на datasets ──
  const netInputs = useMemo(() => {
    if (metricId !== "net") return null;
    const findVal = (...ids: string[]): number => {
      for (const id of ids) {
        const kpi = config.kpis.find((k) => k.id === id);
        if (kpi) {
          return typeof kpi.value === "number"
            ? kpi.value
            : parseFloat(String(kpi.value).replace(/[^\d.-]/g, "")) || 0;
        }
      }
      return 0;
    };
    const sumDsCurrent = (id: string): number => {
      const ds = explorerDatasets.find((d) => d.id === id);
      if (!ds?.chartData?.length) return 0;
      return ds.chartData.reduce((s, p) => s + (Number(p.current) || 0), 0);
    };
    let income = findVal("income", "revenue", "total-income");
    let expenses = findVal("expenses", "total-expenses");
    const ep = findVal("ep-vz");
    const esv = findVal("esv");
    const taxTotal = findVal("tax-total");
    let taxes = taxTotal || ep + esv;
    if (!income) income = sumDsCurrent("dynamics");
    if (!expenses) expenses = sumDsCurrent("expenses");
    if (!taxes) taxes = sumDsCurrent("taxes");
    return { income, expenses, taxes };
  }, [metricId, config.kpis, explorerDatasets]);

  // ── KPI helper для метрика-специфічних розрахунків ──
  const findKpiVal = useMemo(() => {
    return (...ids: string[]): number => {
      for (const id of ids) {
        const kpi = config.kpis.find((k) => k.id === id);
        if (kpi) {
          return typeof kpi.value === "number"
            ? kpi.value
            : parseFloat(String(kpi.value).replace(/[^\d.-]/g, "")) || 0;
        }
      }
      return 0;
    };
  }, [config.kpis]);

  // ── Transactions: dual-axis потребує сум-датасет (income/expenses chartData) ──
  const txSumsData = useMemo(() => {
    if (metricId !== "transactions") return undefined;
    const sumsDs = explorerDatasets.find((d) => d.id === "dynamics" || d.id === "income");
    return sumsDs?.chartData;
  }, [metricId, explorerDatasets]);

  // ── Limits: вхідні для runway ──
  const limitInputs = useMemo(() => {
    if (metricId !== "limits") return null;
    const usagePctKpi = config.kpis.find((k) => k.id === "limit-usage");
    const usagePct = usagePctKpi
      ? typeof usagePctKpi.value === "number"
        ? usagePctKpi.value
        : parseFloat(String(usagePctKpi.value).replace(/[^\d.-]/g, "")) || 0
      : 0;
    // Річний ліміт ФОП 3-ї групи 2026: ~8 285 700 грн (1167 МЗП). Якщо є явний — беремо.
    const annualLimit = findKpiVal("annual-limit") || 8_285_700;
    const currentUsage = (usagePct / 100) * annualLimit;
    // burn rate з останнього періоду chartData (приріст)
    const cd = dataset?.chartData ?? [];
    const recent = cd.slice(-30);
    const burn = recent.length > 1
      ? Math.max(0, (Number(recent[recent.length - 1].current) - Number(recent[0].current)) / recent.length)
      : currentUsage / Math.max(1, new Date().getDate() + (new Date().getMonth() * 30));
    return { currentUsage, annualLimit, dailyBurnRate: burn };
  }, [metricId, config.kpis, dataset, findKpiVal]);

  // ── Salaries: вхідні для burden ──
  const salaryInputs = useMemo(() => {
    if (metricId !== "salaries") return null;
    const totalPayroll = hero.current;
    const income = findKpiVal("income", "revenue", "total-income");
    const employeeCount = findKpiVal("employee-count") || 1;
    return { totalPayroll, income, employeeCount };
  }, [metricId, hero.current, findKpiVal]);


  // ── Hero-картка ──
  const heroValueText = formatValue(hero.current, hero.format);
  const heroComparisonText =
    comparisonResult && hero.previous !== null
      ? `vs ${comparisonResult.previousLabel}: ${formatValue(hero.previous, hero.format)}`
      : null;

  return (
    <div className="space-y-3">
      {/* ── Hero ── */}
      <div
        className="rounded-xl border bg-card p-4 md:p-5 flex items-center gap-3 md:gap-4"
        style={{ borderLeftColor: accent, borderLeftWidth: 4 }}
      >
        <div
          className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold truncate">
            Фокус: {metricConfig.label}
          </div>
          <div className="flex items-baseline gap-3 flex-wrap mt-0.5">
            <div className="text-2xl md:text-3xl font-semibold leading-tight">{heroValueText}</div>
            {heroTrend && (
              <div
                className={
                  trendIsGood
                    ? "text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                    : "text-xs text-rose-600 dark:text-rose-400 font-medium"
                }
              >
                {heroTrend.direction === "up" ? "▲" : "▼"} {Math.abs(heroTrend.pct).toFixed(1)}%
              </div>
            )}
            {limitsStatusBadge && (
              <span className={cn("text-[11px] font-medium px-1.5 py-0.5 rounded", limitsStatusBadge.tone)}>
                {limitsStatusBadge.label}
              </span>
            )}
          </div>
          {heroComparisonText ? (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{heroComparisonText}</div>
          ) : (
            hero.description && (
              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{hero.description}</div>
            )
          )}
        </div>
        {/* ViewModeToggle перенесено у шапку блоку «Динаміка» нижче. */}
      </div>

      {/* ── 4 supporting KPI ── */}
      {supportingKpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {supportingKpis.map((k) => {
            const variant: "default" | "success" | "warning" | "danger" =
              k.semantic === "income"
                ? "success"
                : k.semantic === "expense"
                  ? "danger"
                  : k.semantic === "warning"
                    ? "warning"
                    : "default";
            return (
              <UniversalKPICard
                key={k.id}
                title={k.title}
                value={k.value}
                format={k.format as "currency" | "number" | "percent" | "days" | undefined}
                trend={k.trend}
                variant={variant}
                density="compact"
              />
            );
          })}
        </div>
      )}

      {/* ── Динаміка: чарт / таблиця з перемикачем у шапці ──
          Приховуємо для score-based метрик (compliance/documents/access) — вони
          не мають осмисленої time-series, лише поточний стан. */}
      {!HIDE_CHART_FOR.has(metricId) && (
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between gap-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate min-w-0">
            Динаміка{viewMode === "table" ? " · таблиця" : ""}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onViewModeChange && (
              <ViewModeToggle
                mode="analytics"
                value={viewMode}
                onChange={onViewModeChange}
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Експорт</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={handleExportCsv} className="text-xs gap-2">
                  <Download className="w-3.5 h-3.5" />
                  CSV-файл
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPng} className="text-xs gap-2">
                  <ImageDown className="w-3.5 h-3.5" />
                  PNG-зображення
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyValues} className="text-xs gap-2">
                  <Copy className="w-3.5 h-3.5" />
                  Скопіювати значення
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {viewMode === "table" ? (
          chartData.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Немає даних за обраний період.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2">Період</th>
                    <th className="text-right font-medium px-4 py-2">Поточний</th>
                    {comparisonResult && (
                      <>
                        <th className="text-right font-medium px-4 py-2">Попередній</th>
                        <th className="text-right font-medium px-4 py-2">Δ</th>
                        <th className="text-right font-medium px-4 py-2">Δ%</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, i) => {
                    const cur = Number(row.current) || 0;
                    const prev = Number(row.previous) || 0;
                    const delta = cur - prev;
                    const pct = prev > 0 ? ((cur - prev) / prev) * 100 : null;
                    return (
                      <tr key={`${row.category}-${i}`} className="border-t border-border/30 hover:bg-muted/20">
                        <td className="px-4 py-2 text-foreground">{row.category}</td>
                        <td className="px-4 py-2 text-right tabular-nums font-medium">{formatValue(cur, hero.format)}</td>
                        {comparisonResult && (
                          <>
                            <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{formatValue(prev, hero.format)}</td>
                            <td className={`px-4 py-2 text-right tabular-nums ${delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {delta >= 0 ? "+" : ""}{formatValue(delta, hero.format)}
                            </td>
                            <td className={`px-4 py-2 text-right tabular-nums ${pct === null ? "text-muted-foreground" : pct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {pct === null ? "—" : `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <FocusMetricChart
            data={chartData}
            color={accent}
            chartType={chartType}
            currentLabel={currentLabel}
            previousLabel={previousLabel}
            compareEnabled={compareEnabled}
            metricLabel={metricConfig.label}
          />
        )}
      </div>
      )}

      {/* ── Follow-up чипи (контекстні питання в чат) ── */}
      {followUps.length > 0 && onChatPromptInsert && (
        <div className="flex flex-wrap items-center gap-1.5">
          <MessageCircleQuestion className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {followUps.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChatPromptInsert(p)}
              className="text-[11px] leading-tight px-2.5 py-1 rounded-full border border-border/60 bg-background hover:bg-muted/50 hover:border-primary/40 hover:text-foreground text-muted-foreground transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ── Context mini-блоки (для метрик без власного widget) ──
          Пріоритет: period-aware metricContexts → fallback на статичний config. */}
      {metricId === "taxes" && (() => {
        const ctxRows = metricContexts?.taxes.breakdown ?? [];
        const rows = ctxRows.length > 0 ? ctxRows : (config.taxBudgetBreakdown ?? []);
        if (!rows.length) return null;
        return (
        <div className="rounded-lg border border-border/60 bg-card">
          <div className="px-3 py-2 border-b border-border/40 text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Стан розрахунку з бюджетом · {metricContexts?.taxes.paidCount ?? 0}/{metricContexts?.taxes.totalCount ?? rows.length} закрито
          </div>
          <div className="divide-y divide-border/30">
            {rows.map((row) => {
              const statusTone =
                row.status === "closed"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : row.status === "overdue"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400";
              const statusLabel =
                row.status === "closed" ? "✓ закрито" : row.status === "overdue" ? "⚠ прострочено" : "очікує";
              return (
                <div key={row.name} className="px-3 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-3 text-xs">
                  <span className="font-medium text-foreground truncate min-w-0 md:flex-1">{row.name}</span>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground tabular-nums shrink-0 flex-wrap">
                    <span>нараховано <span className="text-foreground font-medium">{formatCurrencySymbol(row.accrued)}</span></span>
                    <span>сплачено <span className="text-foreground font-medium">{formatCurrencySymbol(row.paid)}</span></span>
                  </div>
                  <span className={cn("self-start md:self-auto text-[10px] px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap", statusTone)}>
                    {statusLabel}{row.deadline ? ` · ${row.deadline}` : ""}
                  </span>
                </div>
              );
            })}
            {/* Підсумковий рядок */}
            {(() => {
              const accrued = rows.reduce((s, r) => s + r.accrued, 0);
              const paid = rows.reduce((s, r) => s + r.paid, 0);
              const debt = metricContexts?.taxes.debt ?? Math.max(0, accrued - paid);
              return (
                <div className="px-3 py-2 bg-muted/30 flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-3 text-[11px]">
                  <span className="text-muted-foreground">Підсумок</span>
                  <div className="flex items-center gap-3 tabular-nums flex-wrap">
                    <span className="text-muted-foreground">Σ нараховано <span className="text-foreground font-semibold">{formatCurrencySymbol(accrued)}</span></span>
                    <span className="text-muted-foreground">Σ сплачено <span className="text-foreground font-semibold">{formatCurrencySymbol(paid)}</span></span>
                    <span className={cn("font-semibold", debt > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                      {debt > 0 ? `Заборгованість ${formatCurrencySymbol(debt)}` : "Розраховано повністю"}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
        );
      })()}

      {metricId === "taxes" && (() => {
        const upcoming = metricContexts?.taxes.upcoming ?? [];
        if (upcoming.length === 0) return null;
        return (
        <div className="rounded-lg border border-border/60 bg-card">
          <div className="px-3 py-2 border-b border-border/40 text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Найближчі дедлайни сплати
          </div>
          <div className="px-3 py-2 space-y-1.5 text-xs">
            {upcoming.map((d) => (
              <div key={d.name} className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-foreground truncate min-w-0 flex-1">{d.name}</span>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <span className="tabular-nums text-muted-foreground text-[11px]">{formatCurrencySymbol(d.amount)}</span>
                  <span className={cn(
                    "tabular-nums text-[11px] px-1.5 py-0.5 rounded",
                    d.status === "urgent" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                    d.status === "soon" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {d.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        );
      })()}

      {metricId === "compliance" && (() => {
        const risks = metricContexts?.compliance.topRisks ?? [];
        if (risks.length === 0) return null;
        return (
        <div className="rounded-lg border border-border/60 bg-card">
          <div className="px-3 py-2 border-b border-border/40 text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Топ ризики · {metricContexts?.compliance.open ?? 0} відкритих
          </div>
          <div className="px-3 py-2 space-y-1.5 text-xs">
            {risks.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 truncate text-foreground min-w-0">
                  <AlertTriangle className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    r.severity === "critical" ? "text-rose-500" :
                    r.severity === "warning" ? "text-amber-500" :
                    "text-muted-foreground"
                  )} />
                  <span className="truncate">{r.title}</span>
                </span>
                <span className="hidden sm:inline text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                  {r.severity === "critical" ? "критично" : r.severity === "warning" ? "попередження" : "інфо"}
                </span>
              </div>
            ))}
          </div>
        </div>
        );
      })()}

      {metricId === "documents" && metricContexts?.documents && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Підписано", value: metricContexts.documents.signed, icon: CheckCircle2, tone: "emerald" },
            { label: "Без підпису", value: metricContexts.documents.unsigned, icon: FileText, tone: "amber" },
            { label: "Очікує уточнень", value: metricContexts.documents.awaiting, icon: Clock, tone: "amber" },
            { label: "Прострочених", value: metricContexts.documents.overdue, icon: AlertTriangle, tone: "rose" },
          ].map((s) => {
            const Ico = s.icon;
            return (
              <div key={s.label} className="rounded-lg border border-border/60 bg-card p-2.5 flex items-center gap-2">
                <Ico className={cn(
                  "w-4 h-4 shrink-0",
                  s.tone === "rose" ? "text-rose-500" :
                  s.tone === "amber" ? "text-amber-500" :
                  "text-emerald-500"
                )} />
                <div className="min-w-0">
                  <div className="text-base font-semibold tabular-nums leading-none">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5 truncate">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {metricId === "access" && metricContexts?.access && (
        <div className="rounded-lg border border-border/60 bg-card">
          <div className="px-3 py-2 border-b border-border/40 text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
            <span className="flex items-center gap-1.5 min-w-0">
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Останні входи · {metricContexts.access.logins7d} за 7 днів</span>
            </span>
            <span className="text-[10px] normal-case tracking-normal shrink-0">
              {metricContexts.access.users} користувачів · 2FA {metricContexts.access.twofaPct}%
            </span>
          </div>
          <div className="px-3 py-2 space-y-1 text-xs">
            {metricContexts.access.recent.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-2 py-0.5">
                <div className="min-w-0 flex-1">
                  <div className="text-foreground truncate">{e.user}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{e.device}</div>
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{e.when}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ── Net Waterfall (тільки для метрики net) ── */}
      {metricId === "net" && netInputs && (
        <NetWaterfall income={netInputs.income} expenses={netInputs.expenses} taxes={netInputs.taxes} net={hero.current} />
      )}

      {/* ── Transactions: dual-axis (count vs sum) ── */}
      {metricId === "transactions" && chartData.length > 0 && (
        <TransactionsDualAxis data={chartData} sumsData={txSumsData} color={accent} />
      )}

      {/* ── Limits: runway projection ── */}
      {metricId === "limits" && limitInputs && (
        <LimitRunway
          currentUsage={limitInputs.currentUsage}
          annualLimit={limitInputs.annualLimit}
          dailyBurnRate={limitInputs.dailyBurnRate}
          color={accent}
        />
      )}

      {/* ── Salaries: payroll burden ── */}
      {metricId === "salaries" && salaryInputs && salaryInputs.totalPayroll > 0 && (
        <SalaryBurden
          totalPayroll={salaryInputs.totalPayroll}
          income={salaryInputs.income}
          employeeCount={salaryInputs.employeeCount}
          color={accent}
        />
      )}

      {/* ── Структура (income/expenses) ── */}
      {structureItems.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card">
          <div className="px-4 py-2.5 border-b border-border/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {metricId === "income" ? "Топ контрагенти" : "Структура витрат"} · топ-{structureItems.length}
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {structureItems.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="truncate text-foreground">{item.name}</span>
                  <span className="tabular-nums text-muted-foreground shrink-0">
                    {formatCurrencySymbol(item.value)} · {item.percent}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: accent,
                      opacity: 0.75,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
