import { useMemo, useState } from "react";
import { MoreHorizontal, MessageSquare, Download, FileText, Calculator } from "lucide-react";
import { ReportPreviewDialog } from "./ReportPreviewDialog";
import { SortIndicator } from "@/components/ui/sort-indicator";
import type { SortDirection } from "@/hooks/use-sort-state";
import { migrateReportStatus } from "@/config/reportsConfig";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Report, ReportDataSource } from "@/config/reportsConfig";
import { reportStatusConfig, dataSourceConfig, getDeadlineUrgency, getCanonicalStatusLabel } from "@/config/reportsConfig";
import { formatCurrency } from "@/lib/formatters";

export type ReportSortKey = "typeLabel" | "deadline" | "status" | "amountToPay";

interface ReportsTableProps {
  reports: Report[];
  sortKey?: ReportSortKey;
  sortDirection?: SortDirection;
  onSort?: (key: ReportSortKey) => void;
  onOpenReport: (report: Report) => void;
  onExplainInChat: (report: Report) => void;
  onResetFilters?: () => void;
  /** Year currently selected — drives empty-state messaging */
  selectedYear?: number;
  /** True when the selected year has zero reports overall (regardless of filters) */
  yearHasNoReports?: boolean;
  /** Previous year that does have reports — for "switch to {year}" CTA */
  fallbackYear?: number;
  onSwitchYear?: (year: number) => void;
  /** True for FOP cabinets — drives AI-friendly empty state copy */
  isFopCabinet?: boolean;
  /** Navigate to cabinet settings (used in FOP empty-state CTA) */
  onNavigateToSettings?: () => void;
}

// AI Score calculation based on report data
function calculateAIScore(report: Report): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  // Check if report has calculation data
  if (!report.calculation) {
    score -= 30;
    issues.push("Немає даних розрахунку");
  }

  // Check data sources
  if (report.dataSources.length === 0) {
    score -= 20;
    issues.push("Немає джерел даних");
  }

  // Review reports with low progress
  if (report.status === "review" && report.draftProgress && report.draftProgress < 50) {
    score -= 15;
    issues.push("Низький прогрес заповнення");
  }

  // Scheduled reports (not yet generated) 
  if (report.status === "scheduled") {
    score = 50;
    issues.push("Очікує автоматичної генерації");
  }

  // Check for rejected status
  if (report.status === "rejected") {
    score -= 25;
    issues.push("Звіт відхилено");
  }

  return { score: Math.max(0, Math.min(100, score)), issues };
}

// (Removed unused AIScoreBadge and DataSourceIcons components — dead code cleanup)


// Combined Status + Deadline cell — AI warning is now inline in Type/Period cell (one accent only)
const StatusDeadlineCell = ({
  report,
  showDeadline = true,
}: {
  report: Report;
  showDeadline?: boolean;
}) => {
  const config = reportStatusConfig[report.status];
  const urgency = getDeadlineUrgency(report.deadline);
  const { score } = calculateAIScore(report);
  const aiCritical =
    score < 70 && report.status !== "accepted" && report.status !== "submitted";

  const deadlineStyles = {
    urgent: "text-red-600 dark:text-red-400 font-medium",
    warning: "text-amber-600 dark:text-amber-400",
    normal: "text-muted-foreground",
  };

  // Tint the badge amber when AI flags issues — single visual accent instead of badge + dot.
  const badgeClass = aiCritical
    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
    : config.className;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <Badge variant="secondary" className={cn("font-medium shrink-0", badgeClass)}>
        {getCanonicalStatusLabel(report.status)}
      </Badge>
      {showDeadline && (
        <span className={cn("text-xs shrink-0 tabular-nums", deadlineStyles[urgency])}>
          до {format(new Date(report.deadline), "dd.MM", { locale: uk })}
        </span>
      )}
    </div>
  );
};

// Type/Period cell — name + period + sources tooltip icon (only when >1 source)
const TypePeriodCell = ({ report }: { report: Report }) => {
  const sources = report.dataSources;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="font-medium text-sm truncate">{report.typeLabel}</span>
        <span className="text-xs text-muted-foreground truncate">{report.periodLabel}</span>
      </div>
      {sources.length > 1 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-1 rounded hover:bg-muted shrink-0 cursor-help">
                <FileText className="h-3.5 w-3.5 text-muted-foreground/70" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p className="font-medium mb-1">Джерела даних</p>
              <ul className="space-y-0.5">
                {sources.map((s) => {
                  const cfg = dataSourceConfig[s];
                  return <li key={s}>• {cfg.label}</li>;
                })}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

// (Removed legacy StatusBadge — no longer used)


// Mobile card component — 2 rows, no separator, AI warning baked into status badge
const ReportCard = ({ report, onOpen, onExplain }: { report: Report; onOpen: () => void; onExplain: () => void }) => {
  const urgency = getDeadlineUrgency(report.deadline);
  const config = reportStatusConfig[report.status];
  const { score: aiScore } = useMemo(() => calculateAIScore(report), [report]);
  const aiCritical =
    aiScore < 70 && report.status !== "accepted" && report.status !== "submitted";

  const urgencyBorderStyles = {
    urgent: "border-l-red-500",
    warning: "border-l-amber-500",
    normal: "border-l-border",
  };

  const urgencyDotStyles = {
    urgent: "bg-red-500",
    warning: "bg-amber-500",
    normal: "bg-muted-foreground/40",
  };

  const badgeClass = aiCritical
    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
    : config.className;

  return (
    <Card
      className={cn(
        "border-l-4 transition-all hover:shadow-md cursor-pointer",
        urgencyBorderStyles[urgency]
      )}
      onClick={onOpen}
    >
      <CardContent className="p-3 space-y-1.5">
        {/* Row 1: dot + type/period + status badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 flex items-start gap-2">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                urgencyDotStyles[urgency]
              )}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate leading-tight">{report.typeLabel}</p>
              <p className="text-xs text-muted-foreground truncate">{report.periodLabel}</p>
            </div>
          </div>
          <Badge variant="secondary" className={cn("font-medium shrink-0 text-[10px]", badgeClass)}>
            {getCanonicalStatusLabel(report.status)}
          </Badge>
        </div>

        {/* Row 2: deadline + amount + actions */}
        <div className="flex items-center justify-between gap-2 pl-3.5">
          <div className="flex items-center gap-2 text-xs min-w-0">
            <span className={cn(
              "tabular-nums shrink-0",
              urgency === "urgent" && "text-red-600 dark:text-red-400 font-medium",
              urgency === "warning" && "text-amber-600 dark:text-amber-400",
              urgency === "normal" && "text-muted-foreground"
            )}>
              до {format(new Date(report.deadline), "dd.MM.yyyy", { locale: uk })}
            </span>
            {report.amountToPay && report.amountToPay > 0 && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="tabular-nums font-medium truncate">
                  {formatCurrency(report.amountToPay)}
                </span>
              </>
            )}
          </div>
          <div className="flex gap-0.5 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()} aria-label="Інші дії">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={onExplain}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Пояснити в чаті
                </DropdownMenuItem>
                {report.dataSources.length > 0 && (
                  <DropdownMenuItem disabled className="opacity-100">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-xs">
                      Джерела: {report.dataSources.map((s) => dataSourceConfig[s].label).join(", ")}
                    </span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Експорт PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function ReportsTable({ 
  reports, 
  sortKey, 
  sortDirection, 
  onSort, 
  onOpenReport, 
  onExplainInChat,
  onResetFilters,
  selectedYear,
  yearHasNoReports,
  fallbackYear,
  onSwitchYear,
  isFopCabinet,
  onNavigateToSettings,
}: ReportsTableProps) {
  const isMobile = useIsMobile();
  const [previewReport, setPreviewReport] = useState<Report | null>(null);

  // Status priority for sorting (rejected → processing → review → ...)
  const statusPriority: Record<string, number> = {
    rejected: 0, processing: 1, review: 2, scheduled: 3,
    approved: 4, submitted: 5, accepted: 6
  };

  // Sort reports
  const sortedReports = useMemo(() => {
    if (!sortKey || !sortDirection) return reports;

    return [...reports].sort((a, b) => {
      let comparison = 0;
      
      switch (sortKey) {
        case "typeLabel":
          comparison = (a.typeLabel || "").localeCompare(b.typeLabel || "", "uk");
          break;
        case "deadline":
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case "status":
          const statusA = migrateReportStatus(a.status);
          const statusB = migrateReportStatus(b.status);
          comparison = (statusPriority[statusA] || 99) - (statusPriority[statusB] || 99);
          break;
        case "amountToPay":
          // Empty values (0/undefined) sort to the end regardless of direction
          const aEmpty = !a.amountToPay || a.amountToPay <= 0;
          const bEmpty = !b.amountToPay || b.amountToPay <= 0;
          if (aEmpty && !bEmpty) return 1;
          if (!aEmpty && bEmpty) return -1;
          if (aEmpty && bEmpty) return 0;
          comparison = (a.amountToPay || 0) - (b.amountToPay || 0);
          break;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [reports, sortKey, sortDirection]);

  if (reports.length === 0) {
    const isEmptyYear = yearHasNoReports && selectedYear !== undefined;

    // FOP-specific empty state: emphasise auto-generation, hide manual create
    if (isEmptyYear && isFopCabinet) {
      return (
        <div className="border border-border/70 rounded-lg">
          <TableEmptyState
            icon={FileText}
            title={`✨ AI створить ваші звіти автоматично`}
            description={`У ${selectedYear} році ще немає звітів. Не хвилюйтесь — за 7 днів до кожного дедлайну AI підготує чернетку. Нічого робити не треба.`}
            action={
              onNavigateToSettings
                ? { label: "Перевірити налаштування", onClick: onNavigateToSettings }
                : fallbackYear && onSwitchYear
                  ? { label: `Перейти на ${fallbackYear}`, onClick: () => onSwitchYear(fallbackYear) }
                  : { label: "Скинути фільтри", onClick: () => onResetFilters?.() }
            }
            secondaryAction={
              fallbackYear && onSwitchYear
                ? { label: `Переглянути ${fallbackYear}`, onClick: () => onSwitchYear(fallbackYear) }
                : undefined
            }
          />
        </div>
      );
    }

    return (
      <div className="border border-border/70 rounded-lg">
        <TableEmptyState
          icon={FileText}
          title={
            isEmptyYear
              ? `У ${selectedYear} році звітів немає`
              : "Звітів не знайдено"
          }
          description={
            isEmptyYear
              ? "За цей рік ще не сформовано жодного звіту. Оберіть інший період або створіть звіт."
              : "За обраними фільтрами немає звітів. Спробуйте змінити параметри або перегляньте графік звітності."
          }
          action={
            isEmptyYear && fallbackYear && onSwitchYear
              ? { label: `Перейти на ${fallbackYear}`, onClick: () => onSwitchYear(fallbackYear) }
              : { label: "Скинути фільтри", onClick: () => onResetFilters?.() }
          }
          secondaryAction={
            isEmptyYear && onResetFilters
              ? { label: "Скинути фільтри", onClick: onResetFilters }
              : undefined
          }
        />
      </div>
    );
  }

  // Mobile: cards (use sortedReports)
  if (isMobile) {
    return (
      <div className="space-y-2">
        {sortedReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onOpen={() => onOpenReport(report)}
            onExplain={() => onExplainInChat(report)}
          />
        ))}
      </div>
    );
  }

  // Desktop: optimized table with combined columns and sorting
  return (
    <div className="border border-border/70 rounded-lg overflow-hidden">
      <Table className="table-fixed min-w-[590px]">
        <colgroup>
          <col className="w-[40%]" />
          <col className="w-[25%]" />
          <col className="w-[25%]" />
          <col className="w-[10%]" />
        </colgroup>
        <TableHeader sticky>
          <TableRow className="hover:bg-muted/80">
            <TableHead 
              compact 
              className="group pl-5"
              sortable
              sorted={sortKey === "typeLabel"}
              sortDirection={sortKey === "typeLabel" ? sortDirection : undefined}
              onSort={() => onSort?.("typeLabel")}
            >
              <span className="flex items-center">
                Тип / Період
                <SortIndicator active={sortKey === "typeLabel"} direction={sortKey === "typeLabel" ? sortDirection : null} />
              </span>
            </TableHead>
            <TableHead 
              compact 
              className="group"
              sortable
              sorted={sortKey === "deadline"}
              sortDirection={sortKey === "deadline" ? sortDirection : undefined}
              onSort={() => onSort?.("deadline")}
            >
              <span className="flex items-center">
                Статус / Дедлайн
                <SortIndicator active={sortKey === "deadline"} direction={sortKey === "deadline" ? sortDirection : null} />
              </span>
            </TableHead>
            <TableHead 
              compact 
              numeric 
              className="group"
              sortable
              sorted={sortKey === "amountToPay"}
              sortDirection={sortKey === "amountToPay" ? sortDirection : undefined}
              onSort={() => onSort?.("amountToPay")}
            >
              <span className="flex items-center justify-end">
                До сплати
                <SortIndicator active={sortKey === "amountToPay"} direction={sortKey === "amountToPay" ? sortDirection : null} />
              </span>
            </TableHead>
            <TableHead compact className="text-right">Дії</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReports.map((report) => {
            const urgency = getDeadlineUrgency(report.deadline);
            const urgencyHoverBg =
              urgency === "urgent"
                ? "group-hover:bg-red-500"
                : urgency === "warning"
                  ? "group-hover:bg-amber-500"
                  : "group-hover:bg-primary/40";
            return (
            <TableRow
              key={report.id}
              className="group hover:bg-muted/40 cursor-pointer"
              onClick={() => onOpenReport(report)}
            >
              <TableCell compact className="relative min-w-[220px] pl-5">
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-0.5 bg-transparent transition-colors",
                    urgencyHoverBg
                  )}
                />
                <TypePeriodCell report={report} />
              </TableCell>
              <TableCell compact>
                <StatusDeadlineCell report={report} />
              </TableCell>
              <TableCell compact numeric className="font-medium">
                {(() => {
                  if (report.amountToPay === undefined || report.amountToPay <= 0) return "—";
                  // Tooltip розбивки для ЄП-звіту з прив'язаним ВЗ
                  const isEp = report.type === "ep" && report.calculation?.type === "ep";
                  const vzToPay = report.militaryTax?.toPay;
                  if (isEp && vzToPay && vzToPay > 0) {
                    const epToPay = (report.calculation as { type: "ep"; data: { toPay: number } }).data.toPay;
                    const total = epToPay + vzToPay;
                    return (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              {formatCurrency(total)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs space-y-0.5">
                              <div>ЄП: <span className="font-medium">{formatCurrency(epToPay)}</span></div>
                              <div>ВЗ: <span className="font-medium">{formatCurrency(vzToPay)}</span></div>
                              <div className="border-t border-border pt-0.5 mt-0.5">
                                Разом: <span className="font-semibold">{formatCurrency(total)}</span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }
                  return formatCurrency(report.amountToPay);
                })()}
              </TableCell>
              <TableCell compact className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Інші дії">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {report.status === "scheduled" && (
                        <DropdownMenuItem onClick={() => setPreviewReport(report)}>
                          <Calculator className="h-4 w-4 mr-2" />
                          Попередній розрахунок
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onExplainInChat(report)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Пояснити в чаті
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Експорт PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Preview Dialog for scheduled reports */}
      <ReportPreviewDialog 
        report={previewReport}
        open={!!previewReport}
        onOpenChange={(open) => !open && setPreviewReport(null)}
      />
    </div>
  );
}
