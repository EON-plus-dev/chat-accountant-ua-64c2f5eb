import { useMemo, useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { AnalyticsExplorerShell } from "./AnalyticsExplorerShell";
import { BudgetSettlementSection } from "./widgets/BudgetSettlementSection";

import { NoDataForPeriod } from "./widgets/AnalyticsEmptyStates";
import { KPIDrillDownSheet, type KPIDrillDownData } from "./widgets/KPIDrillDownSheet";
import { getMetricConfig, getRelevantDatasetIds, type MetricId } from "@/lib/analytics/metricSectionMatrix";

import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import type { AnalyticsDataset } from "@/types/universalAnalyticsTypes";
import type { ViewMode, AnalysisMode } from "./widgets/QueryBuilderBar";
import type { Cabinet } from "@/types/cabinet";
import type { TaxPayment } from "@/config/paymentsConfig";
import type { PeriodType } from "@/lib/analytics/periodFilter";

interface SmartResultZoneProps {
  selectedMetrics: MetricId[];
  config: CabinetAnalyticsConfig;
  explorerDatasets: AnalyticsDataset[];
  comparisonResult: { currentLabel: string; previousLabel: string } | null;
  explorerActiveTab: string | undefined;
  onExplorerActiveTabChange: (tab: string) => void;
  explorerViewMode: ViewMode;
  analysisMode?: AnalysisMode;
  onPeriodChange?: () => void;
  cabinet?: Cabinet;
  onChatPromptInsert?: (prompt: string) => void;
  /** Tax payments for the "Розрахунки з бюджетом" subsection inside the Taxes tab */
  taxPayments?: TaxPayment[];
  period: PeriodType;
  customRange?: { from: Date; to: Date } | null;
}

export const SmartResultZone = ({
  selectedMetrics,
  config,
  explorerDatasets,
  comparisonResult,
  explorerActiveTab,
  onExplorerActiveTabChange,
  explorerViewMode,
  analysisMode = "period",
  onPeriodChange,
  cabinet: _cabinet,
  onChatPromptInsert,
  taxPayments,
  period,
  customRange,
}: SmartResultZoneProps) => {
  const isCompareMode = analysisMode === "compare";
  const merged = useMemo(() => {
    const configs = selectedMetrics.map(getMetricConfig);
    return {
      showKpis: configs.some((c) => c.hasKpis),
      showDynamics: configs.some((c) => c.hasDynamics),
    };
  }, [selectedMetrics]);

  const relevantDatasetIds = useMemo(() => getRelevantDatasetIds(selectedMetrics), [selectedMetrics]);

  const filteredDatasets = useMemo(() => {
    if (relevantDatasetIds.size === 0) return explorerDatasets;
    const filtered = explorerDatasets.filter((ds) => relevantDatasetIds.has(ds.id));
    return filtered.length > 0 ? filtered : explorerDatasets;
  }, [explorerDatasets, relevantDatasetIds]);

  const hasData = explorerDatasets.some(ds => ds.rows.length > 0);

  // Auto-realign active tab if user changes selected metrics in Sidebar
  // and the previously-active tab is no longer in the filtered datasets.
  useEffect(() => {
    if (isCompareMode) return; // compare mode forces "comparison" tab
    if (filteredDatasets.length === 0) return;
    const ids = filteredDatasets.map((d) => d.id);
    if (!explorerActiveTab || !ids.includes(explorerActiveTab)) {
      onExplorerActiveTabChange(filteredDatasets[0].id);
    }
  }, [filteredDatasets, explorerActiveTab, isCompareMode, onExplorerActiveTabChange]);

  // KPI drill-down state
  const [drillDownData, setDrillDownData] = useState<KPIDrillDownData | null>(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  // «Розрахунки з бюджетом» — підрозділ табу «Податки» в Explorer
  const datasetFooters = useMemo<Record<string, React.ReactNode>>(() => {
    if (!taxPayments) return {};
    return {
      taxes: (
        <BudgetSettlementSection
          taxPayments={taxPayments}
          period={period}
          customRange={customRange}
          onChatPromptInsert={onChatPromptInsert}
        />
      ),
    };
  }, [taxPayments, period, customRange, onChatPromptInsert]);


  return (
    <div className="space-y-4">
      {/* Empty state */}
      {!hasData && (
        <NoDataForPeriod onPrimaryAction={onPeriodChange} />
      )}

      {/* EXPLORER — головна зона перегляду даних. Не collapsible. */}
      {hasData && merged.showKpis && merged.showDynamics && (
        <section id="analytics-explorer" className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 px-1">
            <BarChart3 className="w-4 h-4" /> Аналітика
            {comparisonResult && isCompareMode && (
              <span className="text-xs font-normal text-muted-foreground/80 ml-1">
                · vs {comparisonResult.previousLabel}
              </span>
            )}
          </h3>
          <AnalyticsExplorerShell
            datasets={filteredDatasets}
            defaultTab={isCompareMode ? "comparison" : "dynamics"}
            activeTab={isCompareMode ? "comparison" : explorerActiveTab}
            onTabChange={onExplorerActiveTabChange}
            viewMode={explorerViewMode}
            datasetFooters={datasetFooters}
            compareEnabled={isCompareMode}
          />
        </section>
      )}

      {/* KPI Drill-down sheet */}
      <KPIDrillDownSheet
        data={drillDownData}
        open={drillDownOpen}
        onOpenChange={setDrillDownOpen}
        onExplorerNavigate={() => {
          setDrillDownOpen(false);
          if (drillDownData) onExplorerActiveTabChange("dynamics");
        }}
      />
    </div>
  );
};
