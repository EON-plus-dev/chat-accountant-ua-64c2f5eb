import { useState, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { PeriodComparisonResult } from "@/lib/analytics/periodComparison";
import { generateComparisonInsight } from "@/lib/analytics/periodComparison";
import { UniversalAnalyticsPanel } from "./UniversalAnalyticsPanel";
import type { MetricOption, AiAnalysis } from "@/types/universalAnalyticsTypes";

interface PeriodComparisonSectionProps {
  result: PeriodComparisonResult;
  cabinetType?: string;
}

export const COMPARISON_METRIC_OPTIONS: MetricOption[] = [
  { id: "income", label: "Дохід", defaultOn: true },
  { id: "expenses", label: "Витрати", defaultOn: true },
  { id: "taxes", label: "ЄП + ВЗ", defaultOn: true },
  { id: "cashflow", label: "Cashflow", defaultOn: true },
  { id: "ops", label: "Операцій", defaultOn: false },
  { id: "docs", label: "Документів", defaultOn: false },
  { id: "uncategorized", label: "Некат.", defaultOn: false },
];

export const PeriodComparisonSection = ({ result, cabinetType }: PeriodComparisonSectionProps) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);

  const localInsight = useMemo(() => generateComparisonInsight(result.rows), [result.rows]);

  const requestAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analytics-ai-comment", {
        body: {
          rows: result.rows,
          currentLabel: result.currentLabel,
          previousLabel: result.previousLabel,
          cabinetType: cabinetType || "fop",
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
      } else {
        setAiAnalysis(data as AiAnalysis);
      }
    } catch (e: any) {
      toast.error("Не вдалося отримати AI-аналіз");
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <UniversalAnalyticsPanel
      rows={result.rows}
      chartData={result.chartData}
      metricOptions={COMPARISON_METRIC_OPTIONS}
      currentLabel={result.currentLabel}
      previousLabel={result.previousLabel}
      insightText={localInsight}
      onRequestAiAnalysis={requestAiAnalysis}
      aiLoading={aiLoading}
      aiAnalysis={aiAnalysis}
      chartType="bar"
      compareEnabled
    />
  );
};
