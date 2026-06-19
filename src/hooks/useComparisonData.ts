import { useMemo } from "react";
import type { Cabinet } from "@/types/cabinet";
import type {
  ComparisonState,
  ComparisonResult,
  ComparisonDataPoint,
  ComparisonChartPoint,
  ComparisonInsight,
  ComparisonMetric,
  BenchmarkComparison,
  Industry,
} from "@/types/comparison";
import { COMPARISON_COLORS, METRIC_CONFIGS } from "@/types/comparison";
import { INDUSTRY_BENCHMARKS, getIndustryLabel } from "@/config/industryBenchmarks";

// Mock data generator - in real app would fetch from API
function getCabinetMetrics(cabinet: Cabinet, year: number): Record<ComparisonMetric, number> {
  const baseIncome = cabinet.monthlyIncome || 0;
  const yearMultiplier = year === 2024 ? 1 : year === 2023 ? 0.88 : 0.75;
  const income = baseIncome * 12 * yearMultiplier;
  
  // Generate somewhat realistic metrics based on cabinet type
  const taxRate = cabinet.type === "fop" 
    ? (cabinet.fopGroup === 3 ? 0.05 : 0.05) 
    : 0.18;
  const taxes = income * taxRate;
  const salary = cabinet.hasEmployees ? income * 0.25 : 0;
  const employees = cabinet.hasEmployees ? Math.floor(income / 200000) + 1 : 0;
  
  return {
    income,
    taxes,
    salary,
    taxBurden: income > 0 ? (taxes / income) * 100 : 0,
    laborCost: income > 0 ? (salary / income) * 100 : 0,
    employees,
  };
}

// Generate monthly data for charts
function getCabinetMonthlyData(cabinet: Cabinet, year: number): { month: string; value: number }[] {
  const months = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
  const baseIncome = cabinet.monthlyIncome || 0;
  const yearMultiplier = year === 2024 ? 1 : year === 2023 ? 0.88 : 0.75;
  
  return months.map((month, i) => ({
    month,
    value: baseIncome * yearMultiplier * (0.85 + Math.sin(i / 2) * 0.15 + Math.random() * 0.1),
  }));
}

// Calculate benchmark comparison
function calculateBenchmarkComparison(
  value: number,
  metric: "taxBurden" | "laborCost",
  industry: Industry
): BenchmarkComparison | null {
  const benchmark = INDUSTRY_BENCHMARKS.find(b => b.id === industry);
  if (!benchmark) return null;
  
  const { low, optimal, high } = benchmark.benchmarks[metric];
  
  let status: "below" | "optimal" | "above";
  if (value < low) status = "below";
  else if (value > high) status = "above";
  else status = "optimal";
  
  // Calculate percentile (0-100)
  const range = high - low;
  const percentile = Math.max(0, Math.min(100, ((value - low) / range) * 100));
  
  // Generate recommendation based on status
  let recommendation: string | undefined;
  const industryLabel = getIndustryLabel(industry);
  const metricLabel = metric === "taxBurden" ? "податкове навантаження" : "витрати на персонал";
  
  if (status === "above") {
    recommendation = `Рекомендуємо оптимізувати ${metricLabel}. Галузевий оптимум для ${industryLabel}: ${optimal}%.`;
  } else if (status === "below" && metric === "laborCost") {
    recommendation = `Низькі витрати на персонал можуть вказувати на недостатнє інвестування в команду.`;
  }
  
  return {
    metric,
    value,
    industry,
    benchmark: { low, optimal, high },
    status,
    percentile,
    recommendation,
  };
}

export function useComparisonData(
  cabinets: Cabinet[],
  state: ComparisonState
): ComparisonResult {
  return useMemo(() => {
    const { mode, items, metrics, showBenchmarks, benchmarkIndustry } = state;
    
    if (items.length === 0) {
      return {
        dataPoints: [],
        chartData: [],
        insights: [],
        maxDelta: null,
        summary: { bestPerformer: null, worstPerformer: null },
      };
    }
    
    const dataPoints: ComparisonDataPoint[] = [];
    const chartDataMap: Map<string, ComparisonChartPoint> = new Map();
    
    // Process based on mode
    if (mode === "cabinets") {
      // Compare multiple cabinets for the same period
      items.forEach((item, index) => {
        if (item.type === "cabinet" && item.cabinetId) {
          const cabinet = cabinets.find(c => c.id === item.cabinetId);
          if (cabinet) {
            const currentMetrics = getCabinetMetrics(cabinet, state.basePeriod.year);
            const previousMetrics = state.comparePeriod 
              ? getCabinetMetrics(cabinet, state.comparePeriod.year)
              : undefined;
            
            const deltas = previousMetrics ? 
              Object.keys(currentMetrics).reduce((acc, key) => {
                const k = key as ComparisonMetric;
                const current = currentMetrics[k];
                const previous = previousMetrics[k];
                const delta = current - previous;
                const percent = previous !== 0 ? (delta / previous) * 100 : 0;
                acc[k] = {
                  value: delta,
                  percent,
                  direction: delta > 0 ? "up" : delta < 0 ? "down" : "stable",
                };
                return acc;
              }, {} as ComparisonDataPoint["deltas"])
              : undefined;
            
            dataPoints.push({
              itemId: item.id,
              itemLabel: item.label,
              color: item.color || COMPARISON_COLORS[index % COMPARISON_COLORS.length],
              metrics: currentMetrics,
              previousMetrics,
              deltas,
            });
            
            // Generate chart data
            const monthlyData = getCabinetMonthlyData(cabinet, state.basePeriod.year);
            monthlyData.forEach(({ month, value }) => {
              if (!chartDataMap.has(month)) {
                chartDataMap.set(month, { month });
              }
              const point = chartDataMap.get(month)!;
              point[item.id] = value;
            });
          }
        }
      });
    } else if (mode === "periods") {
      // Compare same cabinet across different periods
      const cabinetItem = items.find(i => i.type === "cabinet");
      const periodItems = items.filter(i => i.type === "period");
      
      if (cabinetItem?.cabinetId) {
        const cabinet = cabinets.find(c => c.id === cabinetItem.cabinetId);
        if (cabinet) {
          periodItems.forEach((item, index) => {
            if (item.period) {
              const metricsData = getCabinetMetrics(cabinet, item.period.year);
              
              dataPoints.push({
                itemId: item.id,
                itemLabel: item.label,
                color: item.color || COMPARISON_COLORS[index % COMPARISON_COLORS.length],
                metrics: metricsData,
              });
              
              // Generate chart data
              const monthlyData = getCabinetMonthlyData(cabinet, item.period.year);
              monthlyData.forEach(({ month, value }) => {
                if (!chartDataMap.has(month)) {
                  chartDataMap.set(month, { month });
                }
                const point = chartDataMap.get(month)!;
                point[item.id] = value;
              });
            }
          });
        }
      }
    } else {
      // Mixed mode - cabinets × periods
      items.forEach((item, index) => {
        if (item.type === "cabinet" && item.cabinetId) {
          const cabinet = cabinets.find(c => c.id === item.cabinetId);
          if (cabinet) {
            const period = item.period || state.basePeriod;
            const metricsData = getCabinetMetrics(cabinet, period.year);
            
            dataPoints.push({
              itemId: item.id,
              itemLabel: `${item.label} (${period.label})`,
              color: item.color || COMPARISON_COLORS[index % COMPARISON_COLORS.length],
              metrics: metricsData,
            });
          }
        }
      });
    }
    
    // Convert chart data map to array
    const chartData = Array.from(chartDataMap.values());
    
    // Generate insights
    const insights: ComparisonInsight[] = [];
    
    if (dataPoints.length >= 2) {
      // Find best/worst performers for income
      const sortedByIncome = [...dataPoints].sort((a, b) => b.metrics.income - a.metrics.income);
      const best = sortedByIncome[0];
      const worst = sortedByIncome[sortedByIncome.length - 1];
      
      if (best.metrics.income > worst.metrics.income * 2) {
        insights.push({
          id: "income-gap",
          type: "info",
          title: `${best.itemLabel} лідирує за доходом`,
          description: `Дохід ${best.itemLabel} у ${(best.metrics.income / worst.metrics.income).toFixed(1)}x більший ніж у ${worst.itemLabel}`,
        });
      }
      
      // Tax burden comparison
      const highTaxBurden = dataPoints.filter(d => d.metrics.taxBurden > 10);
      if (highTaxBurden.length > 0) {
        insights.push({
          id: "high-tax-burden",
          type: "warning",
          title: `Високе податкове навантаження`,
          description: `${highTaxBurden.map(d => d.itemLabel).join(", ")} мають Tax Burden > 10%`,
        });
      }
      
      // YoY growth
      const withDeltas = dataPoints.filter(d => d.deltas?.income);
      const growing = withDeltas.filter(d => d.deltas!.income.direction === "up");
      if (growing.length > 0) {
        insights.push({
          id: "yoy-growth",
          type: "success",
          title: `${growing.length} кабінети(-ів) зростають`,
          description: `Середній ріст: ${(growing.reduce((sum, d) => sum + d.deltas!.income.percent, 0) / growing.length).toFixed(1)}%`,
        });
      }
    }
    
    // Generate benchmark insights
    if (showBenchmarks && benchmarkIndustry) {
      const industryLabel = getIndustryLabel(benchmarkIndustry);
      
      dataPoints.forEach(dp => {
        const taxComparison = calculateBenchmarkComparison(dp.metrics.taxBurden, "taxBurden", benchmarkIndustry);
        const laborComparison = calculateBenchmarkComparison(dp.metrics.laborCost, "laborCost", benchmarkIndustry);
        
        if (taxComparison?.status === "above") {
          insights.push({
            id: `${dp.itemId}-high-tax-benchmark`,
            type: "warning",
            title: `${dp.itemLabel}: Tax Burden вище галузевого`,
            description: `${taxComparison.value.toFixed(1)}% проти оптимальних ${taxComparison.benchmark.optimal}% для ${industryLabel}`,
          });
        } else if (taxComparison?.status === "below") {
          insights.push({
            id: `${dp.itemId}-low-tax-benchmark`,
            type: "success",
            title: `${dp.itemLabel}: відмінний Tax Burden`,
            description: `${taxComparison.value.toFixed(1)}% — нижче середнього по ${industryLabel} на ${(taxComparison.benchmark.optimal - taxComparison.value).toFixed(1)} п.п.`,
          });
        }
        
        if (laborComparison?.status === "above") {
          insights.push({
            id: `${dp.itemId}-high-labor-benchmark`,
            type: "warning",
            title: `${dp.itemLabel}: високі витрати на персонал`,
            description: `${laborComparison.value.toFixed(1)}% проти ${laborComparison.benchmark.optimal}% оптимуму для ${industryLabel}`,
          });
        }
      });
    }
    
    // Find max delta
    let maxDelta: ComparisonResult["maxDelta"] = null;
    dataPoints.forEach(dp => {
      if (dp.deltas) {
        metrics.forEach(metric => {
          const delta = dp.deltas![metric];
          if (delta && (!maxDelta || Math.abs(delta.percent) > Math.abs(maxDelta.value))) {
            maxDelta = { metric, itemId: dp.itemId, value: delta.percent };
          }
        });
      }
    });
    
    // Summary
    const summary: ComparisonResult["summary"] = {
      bestPerformer: dataPoints.length > 0 
        ? { itemId: dataPoints.sort((a, b) => b.metrics.income - a.metrics.income)[0].itemId, metric: "income" }
        : null,
      worstPerformer: dataPoints.length > 0 
        ? { itemId: dataPoints.sort((a, b) => a.metrics.income - b.metrics.income)[0].itemId, metric: "income" }
        : null,
    };
    
    return {
      dataPoints,
      chartData,
      insights,
      maxDelta,
      summary,
    };
  }, [cabinets, state]);
}
