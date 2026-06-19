import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { Cabinet } from "@/types/cabinet";
import { getAnalyticsConfig, type CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import { formatValue as formatValueUtil } from "@/lib/formatters";


import { evaluateRisks, buildBudgetDebtRisk } from "@/lib/analytics/riskEngine";
import { aggregateAnalyticsData } from "@/lib/analytics/dataLayer";
import { computeAnalytics } from "@/lib/analytics/computeEngine";
import { computeBudgetSettlement } from "@/lib/analytics/budgetSettlementEngine";
import { useTodaySnapshot } from "@/hooks/useTodaySnapshot";
import type { PeriodType, CompareBaseline } from "@/lib/analytics/periodFilter";
import { computePeriodComparison } from "@/lib/analytics/periodComparison";

import type { StructureBadgeItem } from "./analytics/widgets/StructureBadges";
import type { Driver } from "./analytics/widgets/DriversSection";
import type { ForecastItem, Recommendation } from "./analytics/widgets/ForecastChips";
import type { ViewMode } from "./analytics/widgets/QueryBuilderBar";
import type { AnalysisMode } from "./analytics/widgets/QueryBuilderBar";
import { PeriodModeView } from "./analytics/PeriodModeView";
import { PassiveModeView } from "./analytics/PassiveModeView";

import { useExplorerDatasets } from "@/hooks/useExplorerDatasets";
import { getAvailableMetrics, type MetricId } from "@/lib/analytics/metricSectionMatrix";
import { analyticsControlsRegistry, type AnalyticsAiInsight } from "@/lib/analytics/analyticsControlsRegistry";
import type { DisplayMode } from "@/lib/analytics/displayMode";

interface CabinetAnalyticsPageProps {
  cabinet: Cabinet;
  onChatPromptInsert?: (prompt: string) => void;
  scrollToSection?: string | null;
}

type TovViewMode = "director" | "accountant";

import { IndividualAnalyticsBoard } from "./individual/IndividualAnalyticsBoard";

const CabinetAnalyticsPage = ({ cabinet, onChatPromptInsert, scrollToSection }: CabinetAnalyticsPageProps) => {
  // Individual cabinets → cross-domain Life Analytics board
  if (cabinet.type === "individual" && cabinet.accessMode !== "passive") {
    return <IndividualAnalyticsBoard cabinet={cabinet} onChatPromptInsert={onChatPromptInsert} />;
  }

  // "today" — базовий вибір періоду (раніше це був окремий "Today mode")
  const [period, setPeriod] = useState<PeriodType>("today");
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | null>(null);
  const [tovViewMode, setTovViewMode] = useState<TovViewMode>("director");
  const [openedSectionId, setOpenedSectionId] = useState<string | null>(null);
  const isProMode = true; // Pro-режим за замовчуванням; контрол прибрано з UI
  const [explorerViewMode, setExplorerViewMode] = useState<ViewMode>("chart");
  const [explorerActiveTab, setExplorerActiveTab] = useState<string | undefined>(undefined);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricId[]>(["income"]);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("period");
  const [compareBaseline, setCompareBaseline] = useState<CompareBaseline>("previous_period");
  const [compareBaselineRange, setCompareBaselineRange] = useState<{ from: Date; to: Date } | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("focus");
  const [insightDismissed, setInsightDismissed] = useState(false);
  const [aiInsight, setAiInsight] = useState<AnalyticsAiInsight | null>(null);
  const resetInsightDismissed = useCallback(() => setInsightDismissed(false), []);
  const availableMetrics = useMemo(() => getAvailableMetrics(cabinet.type), [cabinet.type]);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPassive = cabinet.accessMode === "passive";

  // Unified data layer
  const dataSet = useMemo(() => aggregateAnalyticsData(cabinet), [cabinet]);

  const config: CabinetAnalyticsConfig = useMemo(() => {
    if (dataSet.isDemoData) {
      return computeAnalytics(dataSet, period, customRange ?? undefined);
    }
    return getAnalyticsConfig(
      cabinet.type,
      cabinet.type === "tov" ? tovViewMode : undefined,
      isPassive
    );
  }, [dataSet, period, customRange, tovViewMode, isPassive]);

  const budgetSummary = useMemo(
    () => computeBudgetSettlement(dataSet.taxPayments, period, customRange ?? undefined),
    [dataSet.taxPayments, period, customRange],
  );
  const enrichedRisks = useMemo(() => {
    const debtRisk = buildBudgetDebtRisk(budgetSummary);
    return debtRisk ? [debtRisk, ...config.risks] : config.risks;
  }, [budgetSummary, config.risks]);
  const analyticsRisks = evaluateRisks(enrichedRisks);

  const todaySnapshot = useTodaySnapshot(cabinet, cabinet.type === "tov" ? tovViewMode : undefined, dataSet);

  const comparisonResult = useMemo(() => {
    if (!dataSet.isDemoData) return null;
    return computePeriodComparison(
      dataSet,
      period,
      customRange ?? undefined,
      compareBaseline,
      compareBaselineRange,
    );
  }, [dataSet, period, customRange, compareBaseline, compareBaselineRange]);

  const activeComparisonResult = analysisMode === "compare" ? comparisonResult : null;

  const explorerDatasets = useExplorerDatasets({
    config,
    comparisonResult: activeComparisonResult,
    dataSet,
    isPassive,
    cabinetType: cabinet.type,
    tovViewMode,
    period,
    customRange,
    compareBaseline,
    compareBaselineRange,
  });

  // Реєструємо сетери в спільному registry, щоб AI-чат (ChatOrchestrator)
  // міг застосовувати фільтри через tool_call apply_analytics_filters.
  useEffect(() => {
    return analyticsControlsRegistry.register({
      setPeriod,
      setCustomRange,
      setExplorerViewMode,
      setExplorerActiveTab,
      setSelectedMetrics,
      setAnalysisMode,
      setCompareBaseline,
      setCompareBaselineRange,
      setDisplayMode,
      resetInsightDismissed,
      setAiInsight,
    });
  }, [resetInsightDismissed]);

  // Restore saved view from localStorage on mount (per cabinet).
  useEffect(() => {
    if (!cabinet.id) return;
    try {
      const raw = localStorage.getItem(`analytics-view-${cabinet.id}`);
      if (!raw) return;
      const view = JSON.parse(raw);
      const validPeriods = ["today", "week", "month", "quarter", "year", "custom"];
      if (view.period && validPeriods.includes(view.period)) setPeriod(view.period);
      if (view.customRange?.from && view.customRange?.to) {
        setCustomRange({ from: new Date(view.customRange.from), to: new Date(view.customRange.to) });
      }
      if (view.analysisMode === "compare" || view.analysisMode === "period") {
        setAnalysisMode(view.analysisMode);
      }
      if (view.compareBaseline && ["previous_period", "previous_year", "custom"].includes(view.compareBaseline)) {
        setCompareBaseline(view.compareBaseline);
      }
      if (view.compareBaselineRange?.from && view.compareBaselineRange?.to) {
        setCompareBaselineRange({
          from: new Date(view.compareBaselineRange.from),
          to: new Date(view.compareBaselineRange.to),
        });
      }
      if (Array.isArray(view.selectedMetrics) && view.selectedMetrics.length > 0) {
        const valid = view.selectedMetrics.filter((m: MetricId) => availableMetrics.includes(m));
        if (valid.length > 0) setSelectedMetrics(valid);
      }
      if (view.viewMode === "table" || view.viewMode === "chart") {
        setExplorerViewMode(view.viewMode);
      }
    } catch {
      // ignore corrupted state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cabinet.id]);

  useEffect(() => {
    if (analysisMode !== "compare" && explorerActiveTab === "comparison") {
      setExplorerActiveTab("dynamics");
    }
  }, [analysisMode, explorerActiveTab]);

  useEffect(() => {
    if (scrollToSection && containerRef.current) {
      const element = document.getElementById(`analytics-${scrollToSection}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [scrollToSection]);

  const handleScrollTo = (sectionId: string) => {
    setOpenedSectionId(sectionId);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        element.classList.add("ring-2", "ring-primary/50", "ring-offset-2", "ring-offset-background");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-primary/50", "ring-offset-2", "ring-offset-background");
          setOpenedSectionId(null);
        }, 2000);
      }
    }, 300);
  };

  const handlePeriodChange = useCallback((p: PeriodType) => {
    setPeriod(p);
    if (p !== "custom") {
      setCustomRange(null);
    } else if (!customRange) {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      setCustomRange({ from, to });
    }
  }, [customRange]);

  const getKpiVariant = (semantic: string) => {
    if (semantic === "income") return "success" as const;
    if (semantic === "expense") return "danger" as const;
    if (semantic === "warning") return "warning" as const;
    return "default" as const;
  };

  const periodStructureBadges = useMemo((): StructureBadgeItem[] => {
    if (!config.expenseStructure || config.expenseStructure.length === 0) return [];
    const total = config.expenseStructure.reduce((s, e) => s + e.value, 0);
    return config.expenseStructure.map(e => ({
      id: e.name,
      label: e.name,
      value: formatValueUtil(e.value, "currency"),
      percent: total > 0 ? Math.round((e.value / total) * 100) : 0,
    }));
  }, [config.expenseStructure]);

  const periodDrivers = useMemo((): Driver[] => {
    return analyticsRisks.slice(0, 5).map(r => ({
      id: r.id,
      text: r.text,
      impact: r.impact || r.value || "",
      direction: r.severity === "critical" ? "negative" as const : "positive" as const,
      evidence: r.evidence.map(e => `${e.label}: ${e.value}`),
    }));
  }, [analyticsRisks]);

  const periodForecasts = useMemo((): ForecastItem[] => {
    return config.forecasts.slice(0, 4).map(f => ({
      id: f.id,
      label: f.title,
      value: typeof f.value === "number" ? formatValueUtil(f.value, "currency") : String(f.value),
      confidence: "medium" as const,
    }));
  }, [config.forecasts]);

  const periodRecommendations = useMemo((): Recommendation[] => {
    return analyticsRisks.slice(0, 3).map(r => {
      const action = r.recommendedActions[0];
      return {
        id: r.id,
        text: action?.label || "Перевірити",
        why: r.text,
        actionLabel: action?.label || "Деталі",
        onAction: action ? () => {
          if (action.actionType === "chat-prompt") onChatPromptInsert?.(action.actionPayload);
          else if (action.actionType === "scroll") handleScrollTo(action.actionPayload);
        } : undefined,
      };
    });
  }, [analyticsRisks, onChatPromptInsert]);

  return (
    <div ref={containerRef} className="md:overflow-auto max-w-7xl mx-auto">

      <div className="px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-6 space-y-5">

      {/* AI-довідка тепер рендериться всередині PeriodModeView (у правій колонці поряд із sidebar) */}

      {/* Passive cabinet header */}
      {isPassive && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Аналітика кабінету</h2>
            <p className="text-sm text-muted-foreground">Огляд основних показників</p>
          </div>
        </div>
      )}

      {/* ── Активний кабінет: єдина сторінка sidebar | result ── */}
      {!isPassive && (
        <PeriodModeView
          period={period}
          onPeriodChange={handlePeriodChange}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
          isProMode={isProMode}
          explorerViewMode={explorerViewMode}
          onExplorerViewModeChange={setExplorerViewMode}
          explorerActiveTab={explorerActiveTab}
          onExplorerActiveTabChange={setExplorerActiveTab}
          tovViewMode={tovViewMode}
          setTovViewMode={setTovViewMode}
          cabinetType={cabinet.type}
          cabinetId={cabinet.id}
          cabinet={cabinet}
          config={config}
          explorerDatasets={explorerDatasets}
          comparisonResult={activeComparisonResult}
          periodStructureBadges={periodStructureBadges}
          periodDrivers={periodDrivers}
          periodForecasts={periodForecasts}
          periodRecommendations={periodRecommendations}
          analyticsRisks={analyticsRisks}
          openedSectionId={openedSectionId}
          getKpiVariant={getKpiVariant}
          selectedMetrics={selectedMetrics}
          onMetricsChange={setSelectedMetrics}
          availableMetrics={availableMetrics}
          analysisMode={analysisMode}
          onAnalysisModeChange={setAnalysisMode}
          compareBaseline={compareBaseline}
          onCompareBaselineChange={setCompareBaseline}
          compareBaselineRange={compareBaselineRange}
          onCompareBaselineRangeChange={setCompareBaselineRange}
          onChatPromptInsert={onChatPromptInsert}
          taxPayments={dataSet.taxPayments}
          todaySnapshot={todaySnapshot}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          insightDismissed={insightDismissed}
          onInsightDismiss={() => setInsightDismissed(true)}
          aiInsight={aiInsight}
          onChatPromptInsertProxy={onChatPromptInsert}
          dataSet={dataSet}
        />
      )}

      {/* PASSIVE MODE */}
      {isPassive && (
        <PassiveModeView
          config={config}
          onChatPromptInsert={onChatPromptInsert}
        />
      )}
      </div>
    </div>
  );
};

export default CabinetAnalyticsPage;
