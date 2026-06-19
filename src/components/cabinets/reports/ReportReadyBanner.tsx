/**
 * Proactive AI Report Ready Banner
 * Shows when reports are approaching deadline and can be auto-generated
 */

import { useState, useMemo } from "react";
import { Sparkles, Wand2, X, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { uk } from "date-fns/locale";
import type { Cabinet } from "@/types/cabinet";
import type { Report, ReportType } from "@/config/reportsConfig";
import { generateAnnualSchedule, type ReportScheduleItem } from "@/lib/reportScheduleEngine";
import { autoGenerateReport, type GeneratedReport } from "@/lib/reportAutoGenerationEngine";

interface ReportReadyBannerProps {
  cabinet: Cabinet;
  existingReports: Report[];
  onReportGenerated: (report: Report) => void;
  onRemindLater?: () => void;
  className?: string;
}

interface UpcomingReportInfo {
  type: ReportType;
  periodLabel: string;
  deadline: string;
  daysUntil: number;
  canAutoGenerate: boolean;
}

// Type label mapping
const typeLabels: Record<ReportType, string> = {
  ep: "Єдиний податок",
  esv: "ЄСВ",
  "esv-emp": "ЄСВ (працівники)",
  vz: "Військовий збір",
  "vz-emp": "ВЗ (працівники)",
  mpz: "МПЗ",
  pdfo: "ПДФО",
  "1df": "Податковий розрахунок (4ДФ)",
  stat: "Статистика",
  other: "Інший",
};

export function ReportReadyBanner({ 
  cabinet, 
  existingReports, 
  onReportGenerated,
  onRemindLater,
  className 
}: ReportReadyBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Find upcoming reports that need preparation (within 14 days)
  const upcomingReports = useMemo<UpcomingReportInfo[]>(() => {
    const schedule = generateAnnualSchedule(
      cabinet.fopGroup || 3,
      new Date().getFullYear(),
      false,
      cabinet.hasEmployees || false
    );

    const today = new Date();
    const upcoming: UpcomingReportInfo[] = [];

    schedule.forEach((item: ReportScheduleItem) => {
      const deadline = new Date(item.deadline);
      const daysUntil = differenceInDays(deadline, today);

      // Only show reports due within 14 days that aren't already created
      if (daysUntil > 0 && daysUntil <= 14) {
        const existingReport = existingReports.find(r => 
          r.type === item.type && 
          r.periodLabel?.includes(item.periodLabel || "") &&
          (r.status === "review" || r.status === "approved" || r.status === "submitted" || r.status === "accepted")
        );

        if (!existingReport) {
          upcoming.push({
            type: item.type,
            periodLabel: item.periodLabel,
            deadline: item.deadline,
            daysUntil,
            canAutoGenerate: ["ep", "esv", "vz", "1df"].includes(item.type),
          });
        }
      }
    });

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [cabinet, existingReports]);

  const handleGenerate = async (info: UpcomingReportInfo) => {
    setIsGenerating(true);
    try {
      // Determine period from periodLabel
      let period: "Q1" | "Q2" | "Q3" | "Q4" | "year" | "month" = "Q1";
      let quarter: number | undefined;
      let month: number | undefined;

      if (info.periodLabel.includes("I квартал")) { period = "Q1"; quarter = 1; }
      else if (info.periodLabel.includes("II квартал")) { period = "Q2"; quarter = 2; }
      else if (info.periodLabel.includes("III квартал")) { period = "Q3"; quarter = 3; }
      else if (info.periodLabel.includes("IV квартал")) { period = "Q4"; quarter = 4; }
      else if (info.periodLabel.includes("рік")) { period = "year"; }
      else { period = "month"; month = new Date().getMonth() + 1; }

      const result: GeneratedReport = await autoGenerateReport({
        cabinet,
        reportType: info.type,
        period,
        year: new Date().getFullYear(),
        quarter,
        month,
      });

      onReportGenerated(result.report);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onRemindLater?.();
  };

  // Don't show if dismissed or no upcoming reports
  if (isDismissed || upcomingReports.length === 0) {
    return null;
  }

  const primaryReport = upcomingReports[0];
  const isUrgent = primaryReport.daysUntil <= 7;

  return (
    <div 
      className={cn(
        "relative p-4 rounded-lg border transition-all",
        isUrgent 
          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800" 
          : "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800",
        className
      )}
    >
      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-60 hover:opacity-100"
        onClick={handleDismiss}
      >
        <X className="h-3.5 w-3.5" />
      </Button>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "p-2 rounded-lg shrink-0",
          isUrgent 
            ? "bg-amber-100 dark:bg-amber-900/50" 
            : "bg-violet-100 dark:bg-violet-900/50"
        )}>
          {isUrgent ? (
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={cn(
              "font-medium text-sm",
              isUrgent 
                ? "text-amber-800 dark:text-amber-200" 
                : "text-violet-800 dark:text-violet-200"
            )}>
              {isUrgent ? "Терміновий дедлайн!" : "AI підготував чернетку"}
            </h4>
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs",
                isUrgent 
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                  : "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
              )}
            >
              <Clock className="h-3 w-3 mr-1" />
              {primaryReport.daysUntil} дн.
            </Badge>
          </div>

          <p className={cn(
            "text-sm",
            isUrgent 
              ? "text-amber-700 dark:text-amber-300" 
              : "text-violet-700 dark:text-violet-300"
          )}>
            <span className="font-medium">{typeLabels[primaryReport.type]}</span>
            {" за "}
            <span className="font-medium">{primaryReport.periodLabel}</span>
            {" — дедлайн "}
            {format(new Date(primaryReport.deadline), "d MMMM", { locale: uk })}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {primaryReport.canAutoGenerate && (
              <Button
                size="sm"
                variant={isUrgent ? "default" : "secondary"}
                className={cn(
                  "h-7 text-xs gap-1",
                  !isUrgent && "bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:hover:bg-violet-800/50"
                )}
                onClick={() => handleGenerate(primaryReport)}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="h-3 w-3 animate-pulse" />
                    Генерую...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3 w-3" />
                    Згенерувати чернетку
                  </>
                )}
              </Button>
            )}
            
            {upcomingReports.length > 1 && (
              <span className="text-xs text-muted-foreground">
                +{upcomingReports.length - 1} ще
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
