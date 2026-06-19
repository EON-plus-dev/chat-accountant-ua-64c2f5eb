import type { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UniversalAnalyticsPanel } from "./UniversalAnalyticsPanel";
import type { AnalyticsDataset } from "@/types/universalAnalyticsTypes";
import type { PeriodType } from "@/lib/analytics/periodFilter";
import { Button } from "@/components/ui/button";
import { ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { uk } from "date-fns/locale";

interface AnalyticsExplorerShellProps {
  datasets: AnalyticsDataset[];
  defaultTab?: string;
  /** Controlled tab — when provided, overrides internal state */
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  /** Period controls — when provided, renders period selector in the shell header */
  period?: PeriodType;
  onPeriodChange?: (p: PeriodType) => void;
  customRange?: { from: Date; to: Date } | null;
  onCustomRangeChange?: (range: { from: Date; to: Date } | null) => void;
  /** External view mode — used as initial seed; user can switch locally in panel header */
  viewMode?: "table" | "chart";
  /** Optional per-dataset footer content (e.g. "Розрахунки з бюджетом" under Taxes tab) */
  datasetFooters?: Record<string, ReactNode>;
  /** Whether period comparison is active — controls whether previous/Δ columns and series render */
  compareEnabled?: boolean;
}

const periodLabels: Record<PeriodType, string> = {
  today: "Сьогодні",
  week: "Тиждень",
  month: "Місяць",
  quarter: "Квартал",
  year: "Рік",
  custom: "Довільний",
};

const fmtDateShort = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

export const AnalyticsExplorerShell = ({
  datasets,
  defaultTab,
  activeTab,
  onTabChange,
  period,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
  viewMode,
  datasetFooters,
  compareEnabled = false,
}: AnalyticsExplorerShellProps) => {
  if (datasets.length === 0) return null;

  const hasPeriodControls = period !== undefined && onPeriodChange !== undefined;

  const periodSelector = hasPeriodControls && (
    <div className="flex items-center gap-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
            <CalendarIcon className="w-3.5 h-3.5" />
            {periodLabels[period]}
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onPeriodChange("month")}>Місяць</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPeriodChange("quarter")}>Квартал</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPeriodChange("year")}>Рік</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPeriodChange("custom")}>Довільний період</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {period === "custom" && customRange && onCustomRangeChange && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
                Від: {fmtDateShort(customRange.from)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customRange.from}
                onSelect={(d) => d && onCustomRangeChange({ ...customRange, from: d })}
                locale={uk}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <span className="text-xs text-muted-foreground">—</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
                До: {fmtDateShort(customRange.to)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customRange.to}
                onSelect={(d) => d && onCustomRangeChange({ ...customRange, to: d })}
                locale={uk}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );

  const renderPanel = (d: AnalyticsDataset) => (
    <UniversalAnalyticsPanel
      rows={d.rows}
      chartData={d.chartData}
      metricOptions={d.metricOptions}
      currentLabel={d.currentLabel}
      previousLabel={d.previousLabel}
      insightText={d.insightText}
      onRequestAiAnalysis={d.onRequestAiAnalysis}
      aiLoading={d.aiLoading}
      aiAnalysis={d.aiAnalysis}
      chartType={d.chartType}
      chartSeries={d.chartSeries}
      externalViewMode={viewMode}
      compareEnabled={compareEnabled}
    />
  );

  const renderTab = (d: AnalyticsDataset) => (
    <div className="space-y-3">
      {renderPanel(d)}
      {datasetFooters?.[d.id] && <div>{datasetFooters[d.id]}</div>}
    </div>
  );

  // If only one dataset, render directly without tabs
  if (datasets.length === 1) {
    return (
      <div className="space-y-3">
        {periodSelector}
        {renderTab(datasets[0])}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {periodSelector}
      <Tabs
        {...(activeTab
          ? { value: activeTab, onValueChange: onTabChange }
          : { defaultValue: defaultTab || datasets[0].id }
        )}
        className="w-full"
      >
        <TabsList className="w-full justify-start h-9 bg-muted/50 overflow-x-auto">
          {datasets.map((d) => (
            <TabsTrigger key={d.id} value={d.id} className="gap-1.5 text-xs px-3 h-7">
              <d.icon className="w-3.5 h-3.5" />
              {d.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {datasets.map((d) => (
          <TabsContent key={d.id} value={d.id}>
            {renderTab(d)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
