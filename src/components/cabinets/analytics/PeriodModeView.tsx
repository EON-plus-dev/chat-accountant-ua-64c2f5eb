import { useMemo, useState, useCallback, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { type ViewMode, type AnalysisMode } from "./widgets/QueryBuilderBar";
import { AnalyticsSidebar } from "./AnalyticsSidebar";
import { AnalyticsAiBriefing } from "./AnalyticsAiBriefing";
import { MobileFilterBar } from "./widgets/MobileFilterBar";
import { SmartResultZone } from "./SmartResultZone";
// MetricTabsStrip навмисно прибрано: метрика перемикається через sidebar (секція «Показники»),
// дублювати горизонтальну стрічку над AI-довідкою не треба.
import { FocusMetricView } from "./FocusMetricView";
import { GaugeView } from "./GaugeView";
import { ComplianceView } from "./ComplianceView";
import { ForecastView } from "./ForecastView";
import { HealthScoreView } from "./HealthScoreView";
import { AIInsightBanner } from "./AIInsightBanner";
import { usePaymentsYearlyIncome } from "@/hooks/usePaymentsYearlyIncome";

import { KPIDrillDownSheet, type KPIDrillDownData } from "./widgets/KPIDrillDownSheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { getMetricConfig } from "@/lib/analytics/metricSectionMatrix";
import type { TaxPayment } from "@/config/paymentsConfig";
import type { DisplayMode } from "@/lib/analytics/displayMode";
import { getDefaultModeForMetric } from "@/lib/analytics/displayMode";
import type { AnalyticsAiInsight } from "@/lib/analytics/analyticsControlsRegistry";

import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import type { PeriodType, CompareBaseline } from "@/lib/analytics/periodFilter";
import type { AnalyticsDataSet } from "@/lib/analytics/dataLayer";
import {
  filterDataByRange,
  getBaselineRange,
  getPeriodRange,
  findLatestDataDate,
} from "@/lib/analytics/periodFilter";
import { buildMetricContexts, type MetricContexts } from "@/lib/analytics/metricContexts";
import type { AnalyticsDataset } from "@/types/universalAnalyticsTypes";
import type { AnalyticsRisk } from "@/types/analyticsTypes";
import type { MetricId } from "@/lib/analytics/metricSectionMatrix";
import type { StructureBadgeItem } from "./widgets/StructureBadges";
import type { Driver } from "./widgets/DriversSection";
import type { ForecastItem, Recommendation } from "./widgets/ForecastChips";
import type { Cabinet } from "@/types/cabinet";
import type { TodaySnapshotResult } from "@/hooks/useTodaySnapshot";

type TovViewMode = "director" | "accountant";

interface PeriodModeViewProps {
  period: PeriodType;
  onPeriodChange: (p: PeriodType) => void;
  customRange: { from: Date; to: Date } | null;
  onCustomRangeChange: (range: { from: Date; to: Date } | null) => void;
  isProMode: boolean;
  explorerViewMode: ViewMode;
  onExplorerViewModeChange: (v: ViewMode) => void;
  explorerActiveTab: string | undefined;
  onExplorerActiveTabChange: (tab: string) => void;
  tovViewMode: TovViewMode;
  setTovViewMode: (v: TovViewMode) => void;
  cabinetType: string;
  cabinetId: string;
  cabinet: Cabinet;
  config: CabinetAnalyticsConfig;
  explorerDatasets: AnalyticsDataset[];
  comparisonResult: { currentLabel: string; previousLabel: string } | null;
  compareBaseline: CompareBaseline;
  onCompareBaselineChange: (b: CompareBaseline) => void;
  compareBaselineRange: { from: Date; to: Date } | null;
  onCompareBaselineRangeChange: (r: { from: Date; to: Date } | null) => void;

  periodStructureBadges: StructureBadgeItem[];
  periodDrivers: Driver[];
  periodForecasts: ForecastItem[];
  periodRecommendations: Recommendation[];
  analyticsRisks: AnalyticsRisk[];
  openedSectionId: string | null;
  getKpiVariant: (semantic: string) => "success" | "danger" | "warning" | "default";

  selectedMetrics: MetricId[];
  onMetricsChange: (metrics: MetricId[]) => void;
  availableMetrics: MetricId[];
  analysisMode: AnalysisMode;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  onChatPromptInsert?: (prompt: string) => void;
  taxPayments?: TaxPayment[];
  /** Огляд "сьогодні" — Health Score + 6 KPI */
  todaySnapshot: TodaySnapshotResult;
  /** Як рендерити центральну зону (multi/focus/...). За замовчуванням "multi". */
  displayMode?: DisplayMode;
  onDisplayModeChange?: (m: DisplayMode) => void;
  /** Чи приховано AI insight banner (керується сторінкою, скидається на новий tool_call) */
  insightDismissed?: boolean;
  onInsightDismiss?: () => void;
  /** AI-інсайт, який зʼявляється у amber banner після apply_analytics_filters. */
  aiInsight?: AnalyticsAiInsight | null;
  /** Прокинутий onChatPromptInsert для follow-up підказок banner-а. */
  onChatPromptInsertProxy?: (prompt: string) => void;
  /** Aggregated dataSet — потрібен для побудови period-aware контекстів метрик. */
  dataSet: AnalyticsDataSet;
}

/** Маппінг id KPI → таб в Explorer для drill-down */
function kpiIdToExplorerTab(kpiId: string): string {
  if (["income", "revenue", "net-income"].includes(kpiId)) return "dynamics";
  if (["expenses", "total-expenses"].includes(kpiId)) return "expenses";
  if (["ep-vz", "esv", "tax-total", "pdfo", "military-tax"].includes(kpiId)) return "taxes";
  if (kpiId.startsWith("sal") || kpiId.includes("salary")) return "salaries";
  return "dynamics";
}

export const PeriodModeView = ({
  period, onPeriodChange, customRange, onCustomRangeChange,
  isProMode,
  explorerViewMode, onExplorerViewModeChange,
  explorerActiveTab, onExplorerActiveTabChange,
  tovViewMode, setTovViewMode, cabinetType, cabinetId, cabinet,
  config, explorerDatasets, comparisonResult,
  periodStructureBadges, periodDrivers,
  periodForecasts, periodRecommendations, analyticsRisks,
  openedSectionId, getKpiVariant,
  selectedMetrics, onMetricsChange, availableMetrics,
  analysisMode, onAnalysisModeChange,
  compareBaseline, onCompareBaselineChange,
  compareBaselineRange, onCompareBaselineRangeChange,
  onChatPromptInsert,
  taxPayments = [],
  todaySnapshot,
  displayMode = "multi",
  onDisplayModeChange,
  insightDismissed = false,
  onInsightDismiss,
  aiInsight = null,
  onChatPromptInsertProxy,
  dataSet,
}: PeriodModeViewProps) => {
  const isMobile = useIsMobile();

  // ── Period-aware фактологія для всіх 10 метрик (одне джерело правди) ──
  const metricContexts: MetricContexts = useMemo(() => {
    const refDate = findLatestDataDate(dataSet);
    const currentRange = period === "custom" && customRange
      ? { from: customRange.from, to: customRange.to }
      : getPeriodRange(period, refDate);
    const baselineRange = getBaselineRange(period, currentRange, compareBaseline, compareBaselineRange);
    const filteredData = filterDataByRange(dataSet, currentRange.from, currentRange.to);
    const prevFilteredData = filterDataByRange(dataSet, baselineRange.from, baselineRange.to);
    return buildMetricContexts({
      filteredData,
      prevFilteredData,
      fullData: dataSet,
      cabinet,
      analyticsRisks,
      healthScore: todaySnapshot.healthScore.total,
    });
  }, [dataSet, period, customRange, compareBaseline, compareBaselineRange, cabinet, analyticsRisks, todaySnapshot.healthScore.total]);
  

  // KPI drill-down
  const [drillDownData, setDrillDownData] = useState<KPIDrillDownData | null>(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  const handleKpiClick = useCallback((kpiId: string) => {
    const kpi = config.kpis.find((k) => k.id === kpiId);
    if (!kpi) return;
    const rawValue = typeof kpi.value === "string"
      ? parseFloat(String(kpi.value).replace(/[^\d.-]/g, ""))
      : Number(kpi.value);
    setDrillDownData({
      kpiId,
      title: kpi.title,
      value: rawValue || 0,
      format: kpi.format === "percent" || kpi.format === "days" ? "number" : (kpi.format as "currency" | "number") || "currency",
    });
    setDrillDownOpen(true);
  }, [config.kpis]);

  // Авто-синк compare ↔ displayMode: при ввімкненні порівняння — comparison view,
  // при виключенні — повертаємось до дефолту обраної метрики.
  useEffect(() => {
    if (!onDisplayModeChange) return;
    if (analysisMode === "compare" && displayMode !== "comparison") {
      onDisplayModeChange("comparison");
    } else if (analysisMode !== "compare" && displayMode === "comparison") {
      const m = selectedMetrics[0];
      onDisplayModeChange(m ? getDefaultModeForMetric(m) : "focus");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisMode]);

  const contextPeriodLabel = useMemo(() => {
    if (period === "custom" && customRange) {
      const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
      return `${fmt(customRange.from)} — ${fmt(customRange.to)}`;
    }
    const MONTH_NAMES = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];
    const now = new Date();
    if (period === "today") return `Сьогодні, ${String(now.getDate()).padStart(2,"0")}.${String(now.getMonth()+1).padStart(2,"0")}.${now.getFullYear()}`;
    if (period === "week") return "Поточний тиждень";
    if (period === "month") return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    if (period === "quarter") return `${Math.floor(now.getMonth() / 3) + 1} квартал ${now.getFullYear()}`;
    if (period === "year") return `${now.getFullYear()} рік`;
    return "Довільний";
  }, [period, customRange]);

  const contextMetricLabels = useMemo(
    () => selectedMetrics.map((m) => getMetricConfig(m).label),
    [selectedMetrics]
  );
  const contextComparisonLabel = comparisonResult?.previousLabel;

  const tovExtraControls = cabinetType === "tov" ? (
    <Tabs value={tovViewMode} onValueChange={(v) => setTovViewMode(v as TovViewMode)}>
      <TabsList className="h-8 w-full">
        <TabsTrigger value="director" className="text-xs px-3 h-6 flex-1">Директор</TabsTrigger>
        <TabsTrigger value="accountant" className="text-xs px-3 h-6 flex-1">Бухгалтер</TabsTrigger>
      </TabsList>
    </Tabs>
  ) : undefined;

  // Єдина контекстна смуга — період / метрики / порівняння. Показується один раз зверху.
  const contextBar = (
    <div className="flex items-center gap-2 flex-wrap px-1 py-1.5 border-b border-border/40">
      <Badge variant="secondary" className="text-xs h-6 px-2 font-medium">
        {contextPeriodLabel}
      </Badge>
      {contextMetricLabels.length > 0 && (
        <Badge variant="outline" className="text-xs h-6 px-2 font-normal">
          <span className="text-muted-foreground mr-1">Метрики:</span>
          {contextMetricLabels.join(", ")}
        </Badge>
      )}
      {contextComparisonLabel && analysisMode === "compare" && (
        <Badge variant="outline" className="text-xs h-6 px-2 font-normal">
          vs {contextComparisonLabel}
        </Badge>
      )}
      {analysisMode === "compare" && (
        <Badge variant="outline" className="text-xs h-6 px-2 font-normal text-primary border-primary/40">
          Режим порівняння
        </Badge>
      )}
    </div>
  );

  const focusMetric = selectedMetrics[0] ?? availableMetrics[0] ?? "income";
  const isFocusLike = displayMode === "focus" || displayMode === "comparison";

  // Контекст ліміту ФОП — потрібен AI-довідці для метрики `limits`,
  // щоб «Пояснення» бралось із реального використання ліміту, а не з chartData.
  const limitContextRaw = usePaymentsYearlyIncome(cabinet);
  const limitContext = limitContextRaw.enabled
    ? {
        enabled: limitContextRaw.enabled,
        amount: limitContextRaw.amount,
        limit: limitContextRaw.limit,
        percent: limitContextRaw.percent,
        remaining: limitContextRaw.remaining,
        group: limitContextRaw.group,
      }
    : undefined;

  // ── Універсальна структура: Explorer → AI-довідка. ──
  const aiBriefingBlock = (
    <AnalyticsAiBriefing
      todaySnapshot={todaySnapshot}
      config={config}
      analyticsRisks={analyticsRisks}
      period={period}
      customRange={customRange}
      selectedMetrics={selectedMetrics}
      comparisonResult={analysisMode === "compare" ? comparisonResult : null}
      hideHeaderMeta
      forecasts={periodForecasts}
      recommendations={periodRecommendations}
      focusMetric={isFocusLike ? focusMetric : undefined}
      explorerDatasets={explorerDatasets}
      limitContext={limitContext}
      metricContexts={metricContexts}
      onChatPromptInsert={onChatPromptInsertProxy ?? onChatPromptInsert}
    />
  );

  const aiBannerBlock = aiInsight && !insightDismissed ? (
    <AIInsightBanner
      key={aiInsight.token}
      message={aiInsight.message}
      context={aiInsight.context}
      followUps={aiInsight.followUps}
      onFollowUp={(p) => (onChatPromptInsertProxy ?? onChatPromptInsert)?.(p)}
      onDismiss={onInsightDismiss}
    />
  ) : null;

  // Перемикання метрики виконується в AnalyticsSidebar.toggleMetric (з авто-роутингом
  // displayMode через getDefaultModeForMetric). Окрема горизонтальна стрічка тут не потрібна.


  let resultBlock: JSX.Element;
  if (displayMode === "focus" || displayMode === "comparison") {
    resultBlock = (
      <FocusMetricView
        metricId={focusMetric}
        config={config}
        explorerDatasets={explorerDatasets}
        comparisonResult={
          (analysisMode === "compare" || displayMode === "comparison") ? comparisonResult : null
        }
        viewMode={explorerViewMode}
        onViewModeChange={onExplorerViewModeChange}
        onChatPromptInsert={onChatPromptInsert}
        metricContexts={metricContexts}
      />
    );
  } else if (displayMode === "gauge") {
    resultBlock = (
      <GaugeView
        cabinet={cabinet}
        config={config}
        onChatPromptInsert={onChatPromptInsert}
      />
    );
  } else if (displayMode === "compliance") {
    resultBlock = (
      <ComplianceView
        analyticsRisks={analyticsRisks}
        onChatPromptInsert={onChatPromptInsert}
      />
    );
  } else if (displayMode === "forecast") {
    resultBlock = (
      <ForecastView
        config={config}
        analyticsRisks={analyticsRisks}
        onChatPromptInsert={onChatPromptInsert}
      />
    );
  } else if (displayMode === "score") {
    resultBlock = (
      <HealthScoreView
        healthScore={todaySnapshot.healthScore}
        onChatPromptInsert={onChatPromptInsert}
      />
    );
  } else {
    resultBlock = (
      <SmartResultZone
        analysisMode={analysisMode}
        selectedMetrics={selectedMetrics}
        config={config}
        explorerDatasets={explorerDatasets}
        comparisonResult={analysisMode === "compare" ? comparisonResult : null}
        explorerActiveTab={explorerActiveTab}
        onExplorerActiveTabChange={onExplorerActiveTabChange}
        explorerViewMode={explorerViewMode}
        cabinet={cabinet}
        onChatPromptInsert={onChatPromptInsert}
        taxPayments={taxPayments}
        period={period}
        customRange={customRange}
      />
    );
  }

  const drillDownSheet = (
    <KPIDrillDownSheet
      data={drillDownData}
      open={drillDownOpen}
      onOpenChange={setDrillDownOpen}
      onExplorerNavigate={() => {
        setDrillDownOpen(false);
        if (drillDownData) {
          onExplorerActiveTabChange(kpiIdToExplorerTab(drillDownData.kpiId));
          setTimeout(() => {
            const el = document.getElementById("analytics-explorer");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }}
    />
  );

  // Спільний sidebar (одна модель — для desktop і mobile)
  const sidebar = (
    <AnalyticsSidebar
      period={period}
      onPeriodChange={onPeriodChange}
      customRange={customRange}
      onCustomRangeChange={onCustomRangeChange}
      cabinetId={cabinetId}
      viewMode={explorerViewMode}
      onViewModeChange={onExplorerViewModeChange}
      selectedMetrics={selectedMetrics}
      onMetricsChange={onMetricsChange}
      availableMetrics={availableMetrics}
      analysisMode={analysisMode}
      onAnalysisModeChange={onAnalysisModeChange}
      compareBaseline={compareBaseline}
      onCompareBaselineChange={onCompareBaselineChange}
      compareBaselineRange={compareBaselineRange}
      onCompareBaselineRangeChange={onCompareBaselineRangeChange}
      comparisonPreviousLabel={contextComparisonLabel}
      extraControls={tovExtraControls}
      displayMode={displayMode}
      onDisplayModeChange={onDisplayModeChange}
    />
  );

  // Mobile: компактна summary-смуга + drawer з тим самим sidebar
  if (isMobile) {
    return (
      <div className="space-y-4">
        <MobileFilterBar
          period={period}
          analysisMode={analysisMode}
          comparisonLabel={contextComparisonLabel}
          customRange={customRange}
          
          sidebar={sidebar}
        />
        {contextBar}
        {resultBlock}
        {aiBriefingBlock}
        {aiBannerBlock}
        {drillDownSheet}
      </div>
    );
  }

  // Desktop: фіксований sidebar зліва + контент
  return (
    <div className="flex gap-4">
      <aside className="w-60 shrink-0 sticky top-[52px] self-start max-h-[calc(100vh-60px)] overflow-y-auto">
        {sidebar}
      </aside>
      <div className="flex-1 min-w-0 space-y-4">
        {contextBar}
        {resultBlock}
        {aiBriefingBlock}
        {aiBannerBlock}
        {drillDownSheet}
      </div>
    </div>
  );
};
