import { Download, FileSpreadsheet, FileText, FileDown, Calendar, Tags, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  type IncomeBookRecord,
} from "@/config/incomeBookConfig";
import {
  buildIncomeBookCsv,
  downloadCsvBlob,
  sanitizeFilenameFragment,
} from "./incomeBookCsv";

export type AggregationType = "weekly" | "monthly" | "quarterly";

interface IncomeBookHeaderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  aggregation: AggregationType;
  onAggregationChange: (aggregation: AggregationType) => void;
  categorizationPercent?: number;
  uncategorizedCount?: number;
  onCategorizationClick?: () => void;
  /** Records that the active filters/period currently expose — drives CSV export */
  exportRecords?: IncomeBookRecord[];
  /** Human-readable period label, e.g. "Січень 2025" або "2025" */
  exportPeriodLabel?: string;
}

const years = [2024, 2025];

const aggregationOptions: { value: AggregationType; label: string }[] = [
  { value: "weekly", label: "За тижнями" },
  { value: "monthly", label: "За місяцями" },
  { value: "quarterly", label: "За кварталами" },
];

export const IncomeBookHeader = ({
  selectedYear,
  onYearChange,
  aggregation,
  onAggregationChange,
  categorizationPercent = 0,
  uncategorizedCount = 0,
  onCategorizationClick,
  exportRecords = [],
  exportPeriodLabel,
}: IncomeBookHeaderProps) => {
  const { toast } = useToast();
  const recordCount = exportRecords.length;
  const periodLabel = exportPeriodLabel || String(selectedYear);

  const handleCsvExport = () => {
    if (recordCount === 0) {
      toast({
        title: "Нічого експортувати",
        description: "У поточній вибірці немає операцій",
      });
      return;
    }
    const csv = buildIncomeBookCsv(exportRecords);
    const safePeriod = sanitizeFilenameFragment(periodLabel);
    downloadCsvBlob(csv, `kniga-dohodiv_${safePeriod}.csv`);
    toast({
      title: "CSV експортовано",
      description: `${recordCount} операцій · ${periodLabel}`,
    });
  };

  const handlePremiumExport = (format: "Excel" | "PDF") => {
    toast({
      title: `${format} — у Premium-тарифі`,
      description: "Поки доступний CSV. Excel і PDF з підписами та шапкою — у платному плані.",
    });
  };

  // Adaptive coloring by threshold
  const isGood = categorizationPercent >= 95;
  const isWarning = categorizationPercent < 80;
  const allCategorized = uncategorizedCount === 0;

  const tooltipContent = (
    <div className="text-xs space-y-1">
      <p className="font-medium">Категоризовано: {categorizationPercent}%</p>
      {uncategorizedCount > 0 ? (
        <>
          <p className="text-muted-foreground">{uncategorizedCount} без категорії</p>
          <p className="text-muted-foreground">Натисніть, щоб переглянути</p>
        </>
      ) : (
        <p className="text-muted-foreground">Усе категоризовано ✓ Керувати правилами →</p>
      )}
    </div>
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {/* Left side: Year + Aggregation selectors */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Year selector */}
        <Select value={String(selectedYear)} onValueChange={(v) => onYearChange(Number(v))}>
          <SelectTrigger className="w-[100px] h-8 text-sm">
            <Calendar className="w-3.5 h-3.5 mr-1.5 shrink-0 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Aggregation selector — desktop only (mobile uses grouped-by-day always) */}
        <Select value={aggregation} onValueChange={(v) => onAggregationChange(v as AggregationType)}>
          <SelectTrigger className="hidden sm:flex w-auto min-w-[130px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {aggregationOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Categorization KPI button — actionable. Hidden on mobile (lives inside Filters drawer there). */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onCategorizationClick}
                aria-label={
                  allCategorized
                    ? "Усе категоризовано, відкрити правила категоризації"
                    : `Категоризовано ${categorizationPercent} відсотків, відкрити ${uncategorizedCount} операцій без категорії`
                }
                className={cn(
                  "hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isWarning
                    ? "border-warning/40 bg-warning/10 hover:bg-warning/15 text-warning"
                    : isGood
                      ? "border-success/40 bg-success/10 hover:bg-success/15 text-success"
                      : "border-border/70 bg-muted/30 hover:bg-muted/50",
                )}
              >
                {allCategorized && isGood ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Усе категоризовано</span>
                  </>
                ) : (
                  <>
                    <Tags className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium tabular-nums">{categorizationPercent}%</span>
                    {/* Progress bar — desktop only */}
                    <Progress
                      value={categorizationPercent}
                      className={cn(
                        "hidden sm:block w-12 h-1.5",
                        isWarning && "[&>div]:bg-warning",
                        isGood && "[&>div]:bg-success",
                      )}
                    />
                    {isWarning && <AlertCircle className="w-3.5 h-3.5 sm:hidden" />}
                  </>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>{tooltipContent}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Right side: Export dropdown with icon-only trigger */}
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Експорт</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            У файл потрапить:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {recordCount} {recordCount === 1 ? "операція" : recordCount < 5 ? "операції" : "операцій"}
            </span>{" "}
            · {periodLabel}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCsvExport} disabled={recordCount === 0}>
            <FileDown className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start">
              <span>CSV (.csv)</span>
              <span className="text-[11px] text-muted-foreground">Для Excel / Google Sheets / 1C</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePremiumExport("Excel")}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start flex-1">
              <span className="flex items-center gap-1.5">
                Excel (.xlsx) <Lock className="w-3 h-3 text-muted-foreground" />
              </span>
              <span className="text-[11px] text-muted-foreground">З формулами і шапкою — Premium</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePremiumExport("PDF")}>
            <FileText className="w-4 h-4 mr-2" />
            <div className="flex flex-col items-start flex-1">
              <span className="flex items-center gap-1.5">
                PDF <Lock className="w-3 h-3 text-muted-foreground" />
              </span>
              <span className="text-[11px] text-muted-foreground">З підписом для ДПС — Premium</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
