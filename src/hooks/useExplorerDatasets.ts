/**
 * useExplorerDatasets — extracts explorer dataset construction from CabinetAnalyticsPage
 */
import { useMemo } from "react";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  Users,
  Wallet,
  Target,
  ArrowLeftRight,
  Gauge,
} from "lucide-react";
import { GitCompareArrows } from "lucide-react";
import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import type { AnalyticsRow, ChartDataItem, AnalyticsDataset } from "@/types/universalAnalyticsTypes";
import { formatValue as formatValueUtil } from "@/lib/formatters";
import { COMPARISON_METRIC_OPTIONS } from "@/components/cabinets/analytics/PeriodComparisonSection";
import type { AnalyticsDataSet } from "@/lib/analytics/dataLayer";
import type { Cabinet } from "@/types/cabinet";
import { FOP_INCOME_LIMITS } from "@/config/taxConstantsConfig";
import {
  filterDataByRange,
  getBaselineRange,
  getPeriodRange,
  findLatestDataDate,
  type PeriodType,
  type CompareBaseline,
} from "@/lib/analytics/periodFilter";

interface UseExplorerDatasetsParams {
  config: CabinetAnalyticsConfig;
  comparisonResult: any;
  dataSet: AnalyticsDataSet;
  isPassive: boolean;
  cabinetType: Cabinet["type"];
  tovViewMode?: "director" | "accountant";
  period?: PeriodType;
  customRange?: { from: Date; to: Date } | null;
  compareBaseline?: CompareBaseline;
  compareBaselineRange?: { from: Date; to: Date } | null;
}

export function useExplorerDatasets({
  config,
  comparisonResult,
  dataSet,
  isPassive,
  cabinetType,
  tovViewMode,
  period = "month",
  customRange,
  compareBaseline = "previous_period",
  compareBaselineRange,
}: UseExplorerDatasetsParams): AnalyticsDataset[] {
  return useMemo(() => {
    if (isPassive) return [];
    const datasets: AnalyticsDataset[] = [];

    // ── Поточний та попередній зрізи (для previous-серій у всіх datasets) ──
    const refDate = findLatestDataDate(dataSet);
    const currentRange = period === "custom" && customRange
      ? { from: customRange.from, to: customRange.to }
      : getPeriodRange(period, refDate);
    const baselineRange = getBaselineRange(period, currentRange, compareBaseline, compareBaselineRange);
    const filteredData = filterDataByRange(dataSet, currentRange.from, currentRange.to);
    const prevFilteredData = filterDataByRange(dataSet, baselineRange.from, baselineRange.to);

    // helpers
    const pctDelta = (cur: number, prev: number): number =>
      prev > 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : 0;
    const dirOf = (cur: number, prev: number): "up" | "down" | "stable" =>
      cur > prev ? "up" : cur < prev ? "down" : "stable";

    // 1. Dynamics dataset — period-aware (day-step для today/week, місяць для решти)
    const useDayStep = period === "today" || period === "week";
    const isShortPeriod = useDayStep;

    if (useDayStep && filteredData.incomeRecords.length > 0) {
      // День-крок: групуємо incomeRecords по даті в межах current vs baseline
      const SHORT_MONTH_UA = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
      const dayKey = (d: string) => d.slice(0, 10);
      const fmtDay = (d: string) => {
        const dt = new Date(d);
        return `${String(dt.getDate()).padStart(2, "0")} ${SHORT_MONTH_UA[dt.getMonth()]}`;
      };
      const sumByDay = (records: typeof filteredData.incomeRecords): Map<string, number> => {
        const m = new Map<string, number>();
        for (const r of records) {
          if (r.status === "return") continue;
          const k = dayKey(r.date);
          m.set(k, (m.get(k) || 0) + r.inIncomeBook);
        }
        return m;
      };
      const curMap = sumByDay(filteredData.incomeRecords);
      const prevMap = sumByDay(prevFilteredData.incomeRecords);
      const allKeys = Array.from(new Set([...curMap.keys(), ...prevMap.keys()])).sort();
      // Для відображення: вирівнюємо prev по позиції (i-та точка current vs i-та prev)
      const curKeys = Array.from(curMap.keys()).sort();
      const prevKeys = Array.from(prevMap.keys()).sort();
      const len = Math.max(curKeys.length, prevKeys.length, allKeys.length);

      const dynamicsChart: ChartDataItem[] = [];
      const dynamicsRows: AnalyticsRow[] = [];
      for (let i = 0; i < len; i++) {
        const curK = curKeys[i] ?? allKeys[i];
        const prevK = prevKeys[i];
        const cur = curK ? curMap.get(curK) || 0 : 0;
        const prev = prevK ? prevMap.get(prevK) || 0 : 0;
        const cat = curK ? fmtDay(curK) : prevK ? fmtDay(prevK) : `#${i + 1}`;
        dynamicsChart.push({ category: cat, current: cur, previous: prev });
        dynamicsRows.push({
          id: `dyn-${i}`,
          metric: cat,
          currentValue: cur,
          previousValue: prev,
          delta: cur - prev,
          deltaPercent: pctDelta(cur, prev),
          direction: dirOf(cur, prev),
          format: "currency",
          semantic: "positive-up",
        });
      }

      datasets.push({
        id: "dynamics",
        label: "Динаміка",
        icon: TrendingUp,
        rows: dynamicsRows,
        chartData: dynamicsChart,
        currentLabel: "Поточний період",
        previousLabel: "Попередній період",
        chartType: "bar",
        insightText: `Всього: ${formatValueUtil(dynamicsRows.reduce((s, r) => s + r.currentValue, 0), "currency")}`,
      });
    } else if (config.chartData.length > 0 && !isShortPeriod) {
      const isBarMode = isPassive || cabinetType === "individual" || (cabinetType === "tov" && tovViewMode === "accountant");
      const hasMultiSeries = !isBarMode && config.chartData[0]?.income !== undefined;

      if (hasMultiSeries) {
        const dynamicsRows: AnalyticsRow[] = config.chartData.map((item: any, idx: number) => ({
          id: `dyn-${idx}`,
          metric: item.month,
          currentValue: item.income || 0,
          previousValue: item.expenses || 0,
          delta: (item.income || 0) - (item.expenses || 0),
          deltaPercent: item.expenses > 0 ? Math.round(((item.income - item.expenses) / item.expenses) * 100) : 0,
          direction: (item.income || 0) > (item.expenses || 0) ? "up" as const : (item.income || 0) < (item.expenses || 0) ? "down" as const : "stable" as const,
          format: "currency" as const,
          semantic: "positive-up" as const,
        }));

        const dynamicsChart: ChartDataItem[] = config.chartData.map((item: any) => ({
          category: item.month,
          current: item.income || 0,
          previous: item.expenses || 0,
          income: item.income || 0,
          expenses: item.expenses || 0,
          ...(item.result !== undefined ? { result: item.result } : {}),
        }));

        const chartSeries = [
          { key: "income", label: "Доходи", color: "hsl(var(--success))" },
          { key: "expenses", label: "Витрати", color: "hsl(var(--destructive))" },
          ...(config.chartData[0]?.result !== undefined ? [{ key: "result", label: "Результат", color: "hsl(var(--primary))" }] : []),
        ];

        datasets.push({
          id: "dynamics",
          label: "Динаміка",
          icon: TrendingUp,
          rows: dynamicsRows,
          chartData: dynamicsChart,
          currentLabel: "Доходи",
          previousLabel: "Витрати",
          chartType: "line",
          chartSeries,
          insightText: `Всього: ${formatValueUtil(dynamicsRows.reduce((sum, row) => sum + row.currentValue, 0), "currency")}`,
        });
      } else {
        const dataKey = cabinetType === "individual" ? "accruals" : "income";
        const label = cabinetType === "individual" ? "Нарахування" : isPassive ? "Оборот" : "Дохід";

        const dynamicsRows: AnalyticsRow[] = config.chartData.map((item: any, idx: number) => ({
          id: `dyn-${idx}`,
          metric: item.month,
          currentValue: item[dataKey] || 0,
          previousValue: 0,
          delta: 0,
          deltaPercent: 0,
          direction: "stable" as const,
          format: "currency" as const,
          semantic: "positive-up" as const,
        }));

        const dynamicsChart: ChartDataItem[] = config.chartData.map((item: any) => ({
          category: item.month,
          current: item[dataKey] || 0,
          previous: 0,
        }));

        datasets.push({
          id: "dynamics",
          label: "Динаміка",
          icon: TrendingUp,
          rows: dynamicsRows,
          chartData: dynamicsChart,
          currentLabel: label,
          previousLabel: "—",
          chartType: "bar",
          insightText: `Всього: ${formatValueUtil(dynamicsRows.reduce((sum, row) => sum + row.currentValue, 0), "currency")}`,
        });
      }
    }

    // 2. Comparison dataset
    if (comparisonResult) {
      datasets.push({
        id: "comparison",
        label: "Порівняння",
        icon: GitCompareArrows,
        rows: comparisonResult.rows,
        chartData: comparisonResult.chartData,
        metricOptions: COMPARISON_METRIC_OPTIONS,
        currentLabel: comparisonResult.currentLabel,
        previousLabel: comparisonResult.previousLabel,
        chartType: "bar",
      });
    }

    // 3. Expenses dataset
    if (config.expenseStructure.length > 0) {
      const totalExpenses = config.expenseStructure.reduce((s, e) => s + e.value, 0);
      const maxItem = config.expenseStructure.reduce((a, b) => (a.value > b.value ? a : b), config.expenseStructure[0]);
      const maxPercent = totalExpenses > 0 ? Math.round((maxItem.value / totalExpenses) * 100) : 0;

      datasets.push({
        id: "expenses",
        label: "Витрати",
        icon: PieChartIcon,
        rows: config.expenseStructure.map((item) => ({
          id: item.name,
          metric: item.name,
          currentValue: item.value,
          previousValue: 0,
          delta: 0,
          deltaPercent: 0,
          direction: "stable" as const,
          format: "currency" as const,
          semantic: "negative-up" as const,
        })),
        chartData: config.expenseStructure.map((item) => ({
          category: item.name,
          current: item.value,
          previous: 0,
        })),
        metricOptions: config.expenseStructure.map((item) => ({
          id: item.name,
          label: item.name,
          defaultOn: true,
        })),
        currentLabel: "Сума",
        previousLabel: "—",
        insightText: `Найбільша стаття витрат — ${maxItem.name} (${maxPercent}% від загальних ${formatValueUtil(totalExpenses, "currency")})`,
        chartType: "bar",
      });
    }

    // 4. Taxes dataset (period-filtered) — previous = аналогічний показник base-периоду
    if (dataSet.isDemoData && filteredData.taxPayments.length > 0) {
      const groupTaxes = (records: typeof filteredData.taxPayments) => {
        const out: Record<string, { label: string; calculated: number }> = {};
        for (const tp of records) {
          if (!out[tp.taxType]) out[tp.taxType] = { label: tp.taxTypeLabel, calculated: 0 };
          out[tp.taxType].calculated += tp.amountToPay;
        }
        return out;
      };
      const curG = groupTaxes(filteredData.taxPayments);
      const prevG = groupTaxes(prevFilteredData.taxPayments);

      const taxRows: AnalyticsRow[] = Object.entries(curG).map(([key, g]) => {
        const prev = prevG[key]?.calculated || 0;
        return {
          id: `tax-${key}`,
          metric: g.label,
          currentValue: g.calculated,
          previousValue: prev,
          delta: g.calculated - prev,
          deltaPercent: pctDelta(g.calculated, prev),
          direction: dirOf(g.calculated, prev),
          format: "currency" as const,
          semantic: "negative-up" as const,
        };
      });

      const taxChart: ChartDataItem[] = Object.entries(curG).map(([key, g]) => ({
        category: g.label,
        current: g.calculated,
        previous: prevG[key]?.calculated || 0,
      }));

      const totalCalc = Object.values(curG).reduce((s, g) => s + g.calculated, 0);
      const totalPrev = Object.values(prevG).reduce((s, g) => s + g.calculated, 0);
      const totalPaid = filteredData.taxPayments.reduce((s, t) => s + (t.paidAmount || 0), 0);
      const unpaid = totalCalc - totalPaid;

      datasets.push({
        id: "taxes",
        label: "Податки",
        icon: Wallet,
        rows: taxRows,
        chartData: taxChart,
        currentLabel: "Поточний період",
        previousLabel: totalPrev > 0 ? "Попередній період" : "—",
        insightText: unpaid > 0
          ? `Несплачено ${formatValueUtil(unpaid, "currency")} — зверніть увагу на дедлайни.`
          : "Всі податки сплачені вчасно ✓",
        chartType: "bar",
      });
    }

    // 5. Salaries dataset (period-filtered) — previous = аналогічний фонд у base-періоді
    if (dataSet.isDemoData && filteredData.salaryPayments.length > 0) {
      const sumSalaries = (records: typeof filteredData.salaryPayments) => ({
        gross: records.reduce((s, p) => s + (p.grossAmount || p.amount), 0),
        net: records.reduce((s, p) => s + (p.netAmount || p.amount), 0),
        pdfo: records.reduce((s, p) => s + (p.pdfoAmount || 0), 0),
        military: records.reduce((s, p) => s + (p.militaryTaxAmount || 0), 0),
        esv: records.reduce((s, p) => s + (p.esvAmount || 0), 0),
      });
      const cur = sumSalaries(filteredData.salaryPayments);
      const prev = sumSalaries(prevFilteredData.salaryPayments);

      const allSalaryRows: AnalyticsRow[] = [
        ["sal-gross", "Нараховано (брутто)", cur.gross, prev.gross],
        ["sal-net", "До виплати (нетто)", cur.net, prev.net],
        ["sal-pdfo", "ПДФО (18%)", cur.pdfo, prev.pdfo],
        ["sal-military", "Військовий збір", cur.military, prev.military],
        ["sal-esv", "ЄСВ (22%)", cur.esv, prev.esv],
      ].map(([id, metric, c, p]) => ({
        id: id as string,
        metric: metric as string,
        currentValue: c as number,
        previousValue: p as number,
        delta: (c as number) - (p as number),
        deltaPercent: pctDelta(c as number, p as number),
        direction: dirOf(c as number, p as number),
        format: "currency" as const,
        semantic: "negative-up" as const,
      }));
      const salaryRows = allSalaryRows.filter(r => r.currentValue > 0);

      const salaryChart: ChartDataItem[] = salaryRows.map(r => ({
        category: r.metric,
        current: r.currentValue,
        previous: r.previousValue,
      }));

      datasets.push({
        id: "salaries",
        label: "Зарплата",
        icon: Users,
        rows: salaryRows,
        chartData: salaryChart,
        currentLabel: "Поточний період",
        previousLabel: prev.gross > 0 ? "Попередній період" : "—",
        insightText: `${filteredData.salaryPayments.length} виплат, загальний фонд ${formatValueUtil(cur.gross, "currency")}`,
        chartType: "bar",
      });
    }

    // 6. Transactions dataset (period-filtered) — previous = к-сть транзакцій base-періоду
    if (dataSet.isDemoData && filteredData.incomeRecords.length > 0) {
      const SHORT_MONTH_UA = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];

      // Якщо період малий (today/week) — групуємо по днях, інакше по місяцях
      const useDay = useDayStep;
      const keyOf = (d: string) => useDay ? d.slice(0, 10) : d.slice(0, 7);
      const labelOf = (k: string) => {
        if (useDay) {
          const dt = new Date(k);
          return `${String(dt.getDate()).padStart(2, "0")} ${SHORT_MONTH_UA[dt.getMonth()]}`;
        }
        return SHORT_MONTH_UA[parseInt(k.slice(5, 7)) - 1];
      };

      const groupTx = (records: typeof filteredData.incomeRecords) => {
        const m: Record<string, { count: number; sum: number }> = {};
        for (const r of records) {
          if (r.status === "return") continue;
          const k = keyOf(r.date);
          if (!m[k]) m[k] = { count: 0, sum: 0 };
          m[k].count++;
          m[k].sum += r.inIncomeBook;
        }
        return m;
      };
      const curTx = groupTx(filteredData.incomeRecords);
      const prevTx = groupTx(prevFilteredData.incomeRecords);

      const sortedCurKeys = Object.keys(curTx).sort().slice(useDay ? -14 : -6);
      const sortedPrevKeys = Object.keys(prevTx).sort().slice(useDay ? -14 : -6);

      const txRows: AnalyticsRow[] = sortedCurKeys.map((k, i) => {
        const cnt = curTx[k].count;
        const prevK = sortedPrevKeys[i];
        const prevCnt = prevK ? prevTx[prevK].count : 0;
        return {
          id: `tx-${k}`,
          metric: labelOf(k),
          currentValue: cnt,
          previousValue: prevCnt,
          delta: cnt - prevCnt,
          deltaPercent: pctDelta(cnt, prevCnt),
          direction: dirOf(cnt, prevCnt),
          format: "number" as const,
          semantic: "neutral" as const,
        };
      });

      const txChart: ChartDataItem[] = sortedCurKeys.map((k, i) => {
        const prevK = sortedPrevKeys[i];
        return {
          category: labelOf(k),
          current: curTx[k].count,
          previous: prevK ? prevTx[prevK].count : 0,
        };
      });

      const totalCount = sortedCurKeys.reduce((s, k) => s + curTx[k].count, 0);
      const totalSum = sortedCurKeys.reduce((s, k) => s + curTx[k].sum, 0);
      const avgCheck = totalCount > 0 ? Math.round(totalSum / totalCount) : 0;
      const prevTotalCount = sortedPrevKeys.reduce((s, k) => s + prevTx[k].count, 0);

      datasets.push({
        id: "transactions",
        label: "Транзакції",
        icon: ArrowLeftRight,
        rows: txRows,
        chartData: txChart,
        currentLabel: "Поточний період",
        previousLabel: prevTotalCount > 0 ? "Попередній період" : "—",
        insightText: `${totalCount} операцій, середній чек ${formatValueUtil(avgCheck, "currency")}`,
        chartType: "bar",
      });
    }

    // 7. Limits dataset (period-filtered, FOP only)
    if (cabinetType === "fop" && dataSet.isDemoData && filteredData.incomeRecords.length > 0) {
      const fopGroup = dataSet.cabinet.fopGroup || 3;
      const yearlyLimit = FOP_INCOME_LIMITS[fopGroup as 1 | 2 | 3];
      if (yearlyLimit > 0) {
        const monthlyIncome: Record<string, number> = {};
        for (const r of filteredData.incomeRecords) {
          if (r.status === "return") continue;
          const m = r.date.slice(0, 7);
          monthlyIncome[m] = (monthlyIncome[m] || 0) + r.inIncomeBook;
        }
        const sortedMonths = Object.entries(monthlyIncome).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
        const SHORT_MONTH_UA = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];

        let cumulative = 0;
        const limitRows: AnalyticsRow[] = sortedMonths.map(([m, inc]) => {
          cumulative += inc;
          const pct = Math.round((cumulative / yearlyLimit) * 100);
          return {
            id: `lim-${m}`,
            metric: SHORT_MONTH_UA[parseInt(m.slice(5, 7)) - 1],
            currentValue: pct,
            previousValue: cumulative,
            delta: 0,
            deltaPercent: 0,
            direction: "stable" as const,
            format: "number" as const,
            semantic: "neutral" as const,
          };
        });

        cumulative = 0;
        const limitChart: ChartDataItem[] = sortedMonths.map(([m, inc]) => {
          cumulative += inc;
          return {
            category: SHORT_MONTH_UA[parseInt(m.slice(5, 7)) - 1],
            current: Math.round((cumulative / yearlyLimit) * 100),
            previous: 100, // limit line
          };
        });

        const finalPct = limitRows.length > 0 ? limitRows[limitRows.length - 1].currentValue : 0;

        datasets.push({
          id: "limits",
          label: "Тренд ліміту",
          icon: Gauge,
          rows: limitRows,
          chartData: limitChart,
          currentLabel: "Використано %",
          previousLabel: "Ліміт",
          insightText: `Використано ${finalPct}% річного ліміту (${formatValueUtil(yearlyLimit, "currency")})`,
          chartType: "line",
          chartSeries: [
            { key: "current", label: "Використано %", color: "hsl(var(--primary))" },
            { key: "previous", label: "Ліміт 100%", color: "hsl(var(--destructive))", strokeDasharray: "5 5" },
          ],
        });
      }
    }

    // 8. Forecast dataset
    if (config.forecasts.length > 0) {
      datasets.push({
        id: "forecast",
        label: "Прогноз",
        icon: Target,
        rows: config.forecasts.map((item) => ({
          id: item.id,
          metric: item.title,
          currentValue: typeof item.value === "number" ? item.value : 0,
          previousValue: 0,
          delta: 0,
          deltaPercent: 0,
          direction: "stable" as const,
          format: "currency" as const,
          semantic: "positive-up" as const,
        })),
        chartData: config.forecasts.map((item) => ({
          category: item.title,
          current: typeof item.value === "number" ? item.value : 0,
          previous: 0,
        })),
        currentLabel: "Прогноз",
        previousLabel: "—",
        insightText: "Прогнозні значення базуються на поточних даних та тенденціях. Не є фінансовою порадою.",
        chartType: "line",
      });
    }

    // ════════════════════════════════════════════════════════════════
    // 9. SYNTHETIC FALLBACK — гарантує наявність даних для кожного
    //    показника та періоду, навіть якщо реальних demo-даних немає.
    // ════════════════════════════════════════════════════════════════

    // Детермінований PRNG (mulberry32)
    const mulberry32 = (seed: number) => {
      let s = seed >>> 0;
      return () => {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    };

    const seedFromString = (str: string): number => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    };

    const SHORT_MONTH_UA_F = ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"];
    const SHORT_DAYS_UA = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

    // Точки періоду
    const getPeriodPoints = (): { key: string; label: string }[] => {
      if (period === "today") {
        return Array.from({ length: 24 }, (_, i) => ({
          key: `h${i}`,
          label: `${String(i).padStart(2, "0")}:00`,
        }));
      }
      if (period === "week") {
        return SHORT_DAYS_UA.map((d, i) => ({ key: `d${i}`, label: d }));
      }
      if (period === "month") {
        const now = currentRange.from;
        const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => ({
          key: `md${i + 1}`,
          label: String(i + 1).padStart(2, "0"),
        }));
      }
      if (period === "quarter") {
        const startMonth = currentRange.from.getMonth();
        return Array.from({ length: 3 }, (_, i) => ({
          key: `qm${i}`,
          label: SHORT_MONTH_UA_F[(startMonth + i) % 12],
        }));
      }
      if (period === "year") {
        return SHORT_MONTH_UA_F.map((m, i) => ({ key: `ym${i}`, label: m }));
      }
      // custom
      const ms = currentRange.to.getTime() - currentRange.from.getTime();
      const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
      if (days <= 31) {
        return Array.from({ length: days }, (_, i) => {
          const d = new Date(currentRange.from);
          d.setDate(d.getDate() + i);
          return { key: `cd${i}`, label: `${String(d.getDate()).padStart(2, "0")} ${SHORT_MONTH_UA_F[d.getMonth()]}` };
        });
      }
      const weeks = Math.min(12, Math.ceil(days / 7));
      return Array.from({ length: weeks }, (_, i) => ({ key: `cw${i}`, label: `Т${i + 1}` }));
    };

    // Профілі метрик для синтетичних datasets
    type SynthProfile = {
      id: string;
      label: string;
      icon: any;
      base: number;
      format: "currency" | "number";
      semantic: "positive-up" | "negative-up" | "neutral";
      chartType: "bar" | "line";
      currentLabel: string;
      insightTpl: (sumCur: number, sumPrev: number, max: number, avg: number) => string;
    };

    const cabinetSeed = `${dataSet?.cabinet?.id ?? "unknown"}|${period}|${cabinetType}`;

    const PROFILES: Record<string, SynthProfile> = {
      dynamics: {
        id: "dynamics",
        label: "Динаміка",
        icon: TrendingUp,
        base: 35000,
        format: "currency",
        semantic: "positive-up",
        chartType: "bar",
        currentLabel: "Дохід",
        insightTpl: (s, p) =>
          `Сумарний дохід ${formatValueUtil(s, "currency")} за період${p > 0 ? `, ${s >= p ? "+" : ""}${pctDelta(s, p)}% до попереднього` : ""}.`,
      },
      expenses: {
        id: "expenses",
        label: "Витрати",
        icon: PieChartIcon,
        base: 18000,
        format: "currency",
        semantic: "negative-up",
        chartType: "bar",
        currentLabel: "Витрати",
        insightTpl: (s, p, max) =>
          `Витрати ${formatValueUtil(s, "currency")}; пік — ${formatValueUtil(max, "currency")}.${p > 0 ? ` Δ ${pctDelta(s, p)}%.` : ""}`,
      },
      taxes: {
        id: "taxes",
        label: "Податки",
        icon: Wallet,
        base: 9500,
        format: "currency",
        semantic: "negative-up",
        chartType: "bar",
        currentLabel: "Нараховано",
        insightTpl: (s, p) =>
          `Нараховано податків ${formatValueUtil(s, "currency")}.${p > 0 ? ` Δ ${pctDelta(s, p)}% до попереднього.` : ""}`,
      },
      salaries: {
        id: "salaries",
        label: "Зарплата",
        icon: Users,
        base: 22000,
        format: "currency",
        semantic: "negative-up",
        chartType: "bar",
        currentLabel: "Фонд оплати",
        insightTpl: (s) => `Фонд оплати праці ${formatValueUtil(s, "currency")} за період.`,
      },
      transactions: {
        id: "transactions",
        label: "Транзакції",
        icon: ArrowLeftRight,
        base: 14,
        format: "number",
        semantic: "neutral",
        chartType: "bar",
        currentLabel: "Операцій",
        insightTpl: (s, p, max, avg) =>
          `${Math.round(s)} операцій, у середньому ${Math.round(avg)} на період; пік ${Math.round(max)}.`,
      },
      forecast: {
        id: "forecast",
        label: "Прогноз",
        icon: Target,
        base: 40000,
        format: "currency",
        semantic: "positive-up",
        chartType: "line",
        currentLabel: "Прогноз",
        insightTpl: (s) => `Прогнозний обсяг ${formatValueUtil(s, "currency")}. Не є фінансовою порадою.`,
      },
    };

    const buildSyntheticDataset = (profileId: string): AnalyticsDataset | null => {
      const p = PROFILES[profileId];
      if (!p) return null;
      const points = getPeriodPoints();
      if (!points.length) return null;
      const rand = mulberry32(seedFromString(`${cabinetSeed}|${profileId}`));
      const phase = rand() * Math.PI * 2;

      const chartData: ChartDataItem[] = points.map((pt, i) => {
        const wave = 0.7 + 0.6 * (0.5 + 0.5 * Math.sin((i / Math.max(1, points.length - 1)) * Math.PI * 2 + phase));
        const noise = 0.85 + rand() * 0.3;
        const cur = Math.round(p.base * wave * noise);
        const prevWave = 0.7 + 0.6 * (0.5 + 0.5 * Math.sin((i / Math.max(1, points.length - 1)) * Math.PI * 2 + phase + 1.1));
        const prevNoise = 0.78 + rand() * 0.3;
        const prev = Math.round(p.base * prevWave * prevNoise);
        return { category: pt.label, current: cur, previous: prev };
      });

      const rows: AnalyticsRow[] = chartData.map((c, i) => ({
        id: `${profileId}-syn-${i}`,
        metric: c.category,
        currentValue: Number(c.current) || 0,
        previousValue: Number(c.previous) || 0,
        delta: (Number(c.current) || 0) - (Number(c.previous) || 0),
        deltaPercent: pctDelta(Number(c.current) || 0, Number(c.previous) || 0),
        direction: dirOf(Number(c.current) || 0, Number(c.previous) || 0),
        format: p.format,
        semantic: p.semantic,
      }));

      const sumCur = rows.reduce((s, r) => s + r.currentValue, 0);
      const sumPrev = rows.reduce((s, r) => s + r.previousValue, 0);
      const maxCur = rows.reduce((m, r) => Math.max(m, r.currentValue), 0);
      const avgCur = rows.length ? sumCur / rows.length : 0;

      return {
        id: p.id,
        label: p.label,
        icon: p.icon,
        rows,
        chartData,
        currentLabel: p.currentLabel,
        previousLabel: "Попередній період",
        chartType: p.chartType,
        insightText: p.insightTpl(sumCur, sumPrev, maxCur, avgCur),
      };
    };

    // Limits — спеціальний (накопичувальний % від річного ліміту)
    const buildSyntheticLimits = (): AnalyticsDataset | null => {
      const points = getPeriodPoints();
      if (!points.length) return null;
      const fopGroup = (dataSet?.cabinet?.fopGroup ?? 3) as 1 | 2 | 3;
      const yearlyLimit = FOP_INCOME_LIMITS[fopGroup] || 8_285_700;
      const rand = mulberry32(seedFromString(`${cabinetSeed}|limits`));
      const targetEnd = 35 + rand() * 50; // 35..85% на кінець періоду
      const chartData: ChartDataItem[] = points.map((pt, i) => {
        const t = (i + 1) / points.length;
        const noise = 0.92 + rand() * 0.16;
        const pct = Math.min(99, Math.round(targetEnd * t * noise));
        return { category: pt.label, current: pct, previous: 100 };
      });
      const rows: AnalyticsRow[] = chartData.map((c, i) => ({
        id: `lim-syn-${i}`,
        metric: c.category,
        currentValue: Number(c.current) || 0,
        previousValue: 100,
        delta: 0,
        deltaPercent: 0,
        direction: "stable" as const,
        format: "number" as const,
        semantic: "neutral" as const,
      }));
      const finalPct = chartData.length ? Number(chartData[chartData.length - 1].current) : 0;
      return {
        id: "limits",
        label: "Тренд ліміту",
        icon: Gauge,
        rows,
        chartData,
        currentLabel: "Використано %",
        previousLabel: "Ліміт 100%",
        chartType: "line",
        chartSeries: [
          { key: "current", label: "Використано %", color: "hsl(var(--primary))" },
          { key: "previous", label: "Ліміт 100%", color: "hsl(var(--destructive))", strokeDasharray: "5 5" },
        ],
        insightText: `Використано ~${finalPct}% річного ліміту (${formatValueUtil(yearlyLimit, "currency")}).`,
      };
    };

    // 9.1 Доповнюємо відсутні id-и
    const existingIds = new Set(datasets.map((d) => d.id));
    const ALL_IDS = ["dynamics", "expenses", "taxes", "salaries", "transactions", "limits", "forecast"];
    for (const id of ALL_IDS) {
      if (existingIds.has(id)) continue;
      // Capability filters
      if (id === "limits") {
        if (cabinetType !== "fop" && cabinetType !== "fop-group") continue;
        const lim = buildSyntheticLimits();
        if (lim) datasets.push(lim);
        continue;
      }
      if (id === "salaries" && cabinetType === "individual") continue;
      const ds = buildSyntheticDataset(id);
      if (ds) datasets.push(ds);
    }

    // 9.2 Доповнюємо порожню/розріджену previous-серію в існуючих datasets
    for (const ds of datasets) {
      if (ds.id === "comparison" || ds.id === "limits") continue;
      const cd = ds.chartData ?? [];
      if (cd.length === 0) continue;
      const nonZeroPrev = cd.filter((p) => Number(p.previous) > 0).length;
      const stalePrev = ds.previousLabel === "—" || !ds.previousLabel;
      const sparsePrev = isShortPeriod && nonZeroPrev / cd.length < 0.3;
      if (nonZeroPrev === 0 || stalePrev || sparsePrev) {
        const rand = mulberry32(seedFromString(`${cabinetSeed}|prev|${ds.id}`));
        ds.chartData = cd.map((p) => {
          const cur = Number(p.current) || 0;
          const factor = 0.78 + rand() * 0.3;
          const prev = Number(p.previous) > 0 ? Number(p.previous) : Math.round(cur * factor);
          return { ...p, previous: prev };
        });
        if (ds.rows?.length) {
          ds.rows = ds.rows.map((r, i) => {
            const prev = Number(ds.chartData?.[i]?.previous ?? r.previousValue) || 0;
            const delta = r.currentValue - prev;
            return {
              ...r,
              previousValue: prev,
              delta,
              deltaPercent: pctDelta(r.currentValue, prev),
              direction: dirOf(r.currentValue, prev),
            };
          });
        }
        ds.previousLabel = "Попередній період";
      }
    }

    return datasets;
  }, [config, comparisonResult, dataSet, isPassive, cabinetType, tovViewMode, period, customRange, compareBaseline, compareBaselineRange]);
}
