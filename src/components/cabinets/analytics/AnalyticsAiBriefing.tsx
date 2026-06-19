import { useMemo, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PERIOD_LABELS, type PeriodType } from "@/lib/analytics/periodFilter";
import { getMetricConfig, type MetricId } from "@/lib/analytics/metricSectionMatrix";
import { formatValue, formatCurrencySymbol } from "@/lib/formatters";
import type { TodaySnapshotResult } from "@/hooks/useTodaySnapshot";
import type { CabinetAnalyticsConfig, AnalyticsKPI } from "@/config/cabinetAnalyticsConfig";
import type { AnalyticsRisk } from "@/types/analyticsTypes";
import type { AnalyticsDataset } from "@/types/universalAnalyticsTypes";
import type { ForecastItem, Recommendation } from "./widgets/ForecastChips";
import { filterRisksForMetric, filterForecastsForMetric } from "@/lib/analytics/metricRiskMap";
import { buildMetricInsight, pickDatasetForMetric, type MetricInsightExtra } from "@/lib/analytics/metricInsights";
import type { MetricContexts } from "@/lib/analytics/metricContexts";

interface AnalyticsAiBriefingProps {
  todaySnapshot: TodaySnapshotResult;
  config: CabinetAnalyticsConfig;
  analyticsRisks: AnalyticsRisk[];
  period: PeriodType;
  customRange: { from: Date; to: Date } | null;
  selectedMetrics: MetricId[];
  comparisonResult: { currentLabel: string; previousLabel: string } | null;
  hideHeaderMeta?: boolean;
  forecasts?: ForecastItem[];
  recommendations?: Recommendation[];
  focusMetric?: MetricId;
  /** Датасети — потрібні для побудови «Пояснення» через buildMetricInsight. */
  explorerDatasets?: AnalyticsDataset[];
  /** Контекст ліміту ФОП — для метрики `limits`. */
  limitContext?: MetricInsightExtra["limitContext"];
  /** Period-aware контексти для всіх 10 метрик (формуються в PeriodModeView). */
  metricContexts?: MetricContexts;
  onChatPromptInsert?: (prompt: string) => void;
}

const fmtDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;

/** Маппінг id метрики Explorer → можливі id KPI (в порядку пріоритету). */
const METRIC_TO_KPI_IDS: Partial<Record<MetricId, string[]>> = {
  income: ["income", "revenue", "total-income"],
  expenses: ["expenses", "total-expenses"],
  net: ["net-income", "margin", "profit"],
  taxes: ["tax-total", "ep-vz", "esv", "pdfo", "military-tax"],
  salaries: ["salary-total", "payroll", "salaries"],
};

function findKpiForMetric(
  configKpis: AnalyticsKPI[],
  snapshotKpis: AnalyticsKPI[],
  metric: MetricId,
): AnalyticsKPI | undefined {
  const ids = METRIC_TO_KPI_IDS[metric] ?? [metric];
  for (const id of ids) {
    const kpi = configKpis.find((k) => k.id === id) ?? snapshotKpis.find((k) => k.id === id);
    if (kpi) return kpi;
  }
  return undefined;
}

function trendText(kpi: AnalyticsKPI): string {
  if (!kpi.trend) return "";
  const sign = kpi.trend.direction === "up" ? "+" : "−";
  return ` (${sign}${kpi.trend.value}%)`;
}

function toNumber(v: AnalyticsKPI["value"]): number {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * AI-довідка з можливістю розгортання.
 * Згорнутий вигляд — 2-3 речення висновку.
 * Розгорнутий — додає ключові рекомендації.
 */
export function AnalyticsAiBriefing({
  todaySnapshot,
  config,
  analyticsRisks,
  period,
  customRange,
  selectedMetrics,
  comparisonResult,
  hideHeaderMeta = false,
  forecasts = [],
  recommendations = [],
  focusMetric,
  explorerDatasets = [],
  limitContext,
  metricContexts,
  onChatPromptInsert,
}: AnalyticsAiBriefingProps) {
  // ── Скоупи під активну метрику Focus ──
  const scopedRisks = useMemo(
    () => filterRisksForMetric(analyticsRisks, focusMetric),
    [analyticsRisks, focusMetric],
  );
  const scopedForecasts = useMemo(
    () => filterForecastsForMetric(forecasts, focusMetric),
    [forecasts, focusMetric],
  );
  const scopedRecommendations = useMemo(() => {
    if (!focusMetric) return recommendations;
    const allowedIds = new Set(scopedRisks.map((r) => r.id));
    const matched = recommendations.filter((r) => allowedIds.has(r.id));
    return matched;
  }, [recommendations, scopedRisks, focusMetric]);

  // ── Релевантні ризики (critical + warning, посортовано) ──
  const relevantRisks = useMemo(
    () =>
      [...scopedRisks]
        .filter((risk) => risk.severity === "critical" || risk.severity === "warning")
        .sort((a, b) => {
          const weight = { critical: 0, warning: 1, info: 2 } as const;
          return weight[a.severity] - weight[b.severity] || a.priority - b.priority;
        })
        .slice(0, 3),
    [scopedRisks],
  );

  const riskCards = useMemo(
    () =>
      relevantRisks.map((risk, index) => ({
        risk,
        recommendation:
          scopedRecommendations.find((item) => item.id === risk.id) ?? scopedRecommendations[index],
      })),
    [relevantRisks, scopedRecommendations],
  );

  const hasCritical = relevantRisks.some((r) => r.severity === "critical");
  const riskCount = relevantRisks.length;
  const hasForecastSection = scopedForecasts.length > 0;
  const hasProblemsSection = riskCards.length > 0;
  const hasExpandableContent = hasForecastSection || hasProblemsSection;

  const [expanded, setExpanded] = useState<boolean>(hasCritical);

  const periodLabel = useMemo(() => {
    if (comparisonResult?.currentLabel) return comparisonResult.currentLabel;
    if (period === "custom" && customRange) {
      return `${fmtDate(customRange.from)} – ${fmtDate(customRange.to)}`;
    }
    return PERIOD_LABELS[period];
  }, [period, customRange, comparisonResult]);

  const comparisonBadge = useMemo(() => {
    if (period === "today") return null;
    if (!comparisonResult) return null;
    const { currentLabel, previousLabel } = comparisonResult;
    if (!previousLabel || previousLabel === currentLabel) return null;
    return previousLabel;
  }, [period, comparisonResult]);

  // ── Секція «ПОЯСНЕННЯ» ──
  // Для focus-метрики — buildMetricInsight (метрика-залежний, для `limits` бере limitContext).
  // Для multi-режиму — стара логіка агрегації по selectedMetrics.
  const explanationText = useMemo(() => {
    if (focusMetric) {
      const dataset = pickDatasetForMetric(focusMetric, explorerDatasets);
      return buildMetricInsight(focusMetric, dataset, config, {
        limitContext,
        incomeContext: metricContexts?.income,
        expensesContext: metricContexts?.expenses,
        netContext: metricContexts?.net,
        transactionsContext: metricContexts?.transactions,
        limitsContext: metricContexts?.limits,
        taxesContext: metricContexts?.taxes,
        salariesContext: metricContexts?.salaries,
        complianceContext: metricContexts?.compliance,
        documentsContext: metricContexts?.documents,
        accessContext: metricContexts?.access,
      });
    }

    // Multi-mode: агрегований висновок по обраних метриках
    const snapshotKpis = todaySnapshot.config.kpis;
    const metricLines: string[] = [];
    let nonZeroCount = 0;
    let expensesKpi: AnalyticsKPI | undefined;
    let incomeKpi: AnalyticsKPI | undefined;
    let netKpi: AnalyticsKPI | undefined;

    for (const metric of selectedMetrics.slice(0, 3)) {
      const kpi = findKpiForMetric(config.kpis, snapshotKpis, metric);
      if (metric === "expenses") expensesKpi = kpi;
      if (metric === "income") incomeKpi = kpi;
      if (metric === "net") netKpi = kpi;

      let title: string;
      let valueStr: string;
      let suffix = "";
      if (kpi) {
        title = kpi.title.toLowerCase();
        const num = toNumber(kpi.value);
        valueStr =
          kpi.format === "percent"
            ? formatValue(num, "percent")
            : kpi.format === "days"
              ? formatValue(num, "number")
              : formatCurrencySymbol(num);
        suffix = trendText(kpi);
        if (num !== 0) nonZeroCount++;
      } else {
        try {
          title = getMetricConfig(metric).label.toLowerCase();
        } catch {
          title = metric;
        }
        valueStr = "немає даних";
      }
      metricLines.push(`${title} — ${valueStr}${suffix}`);
    }

    if (nonZeroCount === 0 && selectedMetrics.length > 0) {
      return "Дані за обраними метриками відсутні.";
    }

    const parts: string[] = [];
    if (metricLines.length > 0) {
      const head = metricLines[0].charAt(0).toUpperCase() + metricLines[0].slice(1);
      parts.push(`${head}${metricLines.length > 1 ? ", " + metricLines.slice(1).join(", ") : ""}.`);
    }

    if (incomeKpi && toNumber(incomeKpi.value) > 0 && config.incomeStructure?.length) {
      const total = config.incomeStructure.reduce((s, e) => s + e.value, 0);
      const top = [...config.incomeStructure].sort((a, b) => b.value - a.value)[0];
      if (top && total > 0) {
        const pct = Math.round((top.value / total) * 100);
        if (pct >= 20) parts.push(`Найбільший клієнт — ${top.name} (${pct}% доходу).`);
      }
    }

    if (expensesKpi && toNumber(expensesKpi.value) > 0 && config.expenseStructure?.length) {
      const total = config.expenseStructure.reduce((s, e) => s + e.value, 0);
      const top = [...config.expenseStructure].sort((a, b) => b.value - a.value)[0];
      if (top && total > 0) {
        const pct = Math.round((top.value / total) * 100);
        if (pct >= 15) parts.push(`Найбільший внесок — ${top.name.toLowerCase()} (${pct}% витрат).`);
      }
    }

    if (netKpi && incomeKpi) {
      const inc = toNumber(incomeKpi.value);
      const net = toNumber(netKpi.value);
      if (inc > 0) parts.push(`Маржа: ${((net / inc) * 100).toFixed(1)}%.`);
    }

    if (parts.length === 0) parts.push("Динаміка стабільна, відхилень не виявлено.");
    return parts.slice(0, 3).join(" ");
  }, [focusMetric, explorerDatasets, config, limitContext, metricContexts, todaySnapshot.config.kpis, selectedMetrics]);

  const explanationIcon = hasCritical ? AlertTriangle : Info;
  const explanationIconClass = hasCritical ? "text-destructive" : "text-primary/70";

  const riskTone = (severity: AnalyticsRisk["severity"]) =>
    severity === "critical"
      ? "bg-destructive/5 text-destructive"
      : "bg-warning/5 text-warning";

  const forecastTone = (confidence: ForecastItem["confidence"]) =>
    confidence === "high"
      ? "border-success/30 bg-success/5"
      : confidence === "medium"
        ? "border-warning/30 bg-warning/5"
        : "border-muted bg-muted/30";

  return (
    <div className="rounded-lg border border-border/60 bg-gradient-to-br from-primary/5 to-transparent p-3 md:p-4 space-y-3">
      {/* ── Хедер ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
            AI-довідка
          </span>
        </div>
        {!hideHeaderMeta && (
          <>
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
              {periodLabel}
            </Badge>
            {comparisonBadge && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                vs {comparisonBadge}
              </Badge>
            )}
          </>
        )}
        {riskCount > 0 && (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] h-5 px-1.5 font-normal",
              hasCritical
                ? "border-destructive/40 text-destructive bg-destructive/5"
                : "border-warning/40 text-warning",
            )}
          >
            {riskCount} {riskCount === 1 ? "ризик" : riskCount < 5 ? "ризики" : "ризиків"}
          </Badge>
        )}
        <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-1 justify-end">
          {onChatPromptInsert && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => {
                const metricLabels = selectedMetrics
                  .map((m) => {
                    try { return getMetricConfig(m).label.toLowerCase(); } catch { return m; }
                  })
                  .join(", ");
                const prompt = `Поясни детальніше показники за ${periodLabel}${
                  comparisonBadge ? ` (vs ${comparisonBadge})` : ""
                }${metricLabels ? `: ${metricLabels}` : ""}. Що головне і що зробити?`;
                onChatPromptInsert(prompt);
              }}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Спитати в AI
            </Button>
          )}
          {hasExpandableContent && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              {expanded ? "Сховати" : "Деталі"}
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── Секція 1: ПОЯСНЕННЯ (завжди) ── */}
      <section className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/80 px-0.5">
          Пояснення
        </div>
        <div className="flex items-start gap-2">
          {(() => {
            const Ico = explanationIcon;
            return <Ico className={cn("w-4 h-4 mt-0.5 shrink-0", explanationIconClass)} />;
          })()}
          <p className="text-sm leading-snug text-foreground">{explanationText}</p>
        </div>
      </section>

      {/* ── Секція 2: ПРОГНОЗ (умовно) ── */}
      {expanded && hasForecastSection && (
        <section className="space-y-1.5 pt-2 border-t border-border/40">
          <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/80 px-0.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Прогноз
          </div>
          <div className="grid gap-1.5 sm:grid-cols-3">
            {scopedForecasts.slice(0, 3).map((forecast) => (
              <div
                key={forecast.id}
                className={cn("rounded-md border px-2 py-1.5", forecastTone(forecast.confidence))}
              >
                <p className="text-xs text-muted-foreground leading-snug">{forecast.label}</p>
                <p className="text-sm font-semibold tabular-nums text-foreground mt-0.5">
                  {forecast.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Секція 3: ПРОБЛЕМИ ТА РІШЕННЯ (умовно) ── */}
      {expanded && hasProblemsSection && (
        <section className="space-y-1.5 pt-2 border-t border-border/40">
          <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/80 px-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Проблеми та рішення
          </div>
          <div className="space-y-2">
            {riskCards.map(({ risk, recommendation }) => (
              <div key={risk.id} className="rounded-lg border border-border/70 bg-card overflow-hidden">
                <div className={cn("p-2.5 border-b border-border/50", riskTone(risk.severity))}>
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold">
                    <risk.icon className="w-3.5 h-3.5 shrink-0" />
                    Проблема
                  </div>
                  <p className="text-sm leading-snug font-medium text-foreground mt-1">
                    {risk.title || risk.subtitle || risk.text}
                  </p>
                  {(risk.subtitle || risk.impact || risk.value) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[risk.subtitle && risk.title ? risk.subtitle : null, risk.impact, risk.value]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>

                {recommendation && (
                  <div className="p-2.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold text-primary">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                      Рішення
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">{recommendation.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{recommendation.why}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs flex-shrink-0"
                        onClick={recommendation.onAction}
                      >
                        {recommendation.actionLabel}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
