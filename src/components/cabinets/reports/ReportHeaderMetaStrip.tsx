import { useMemo } from "react";
import { Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Report, ReportStatus } from "@/config/reportsConfig";
import { migrateReportStatus } from "@/config/reportsConfig";
import { buildReportSections } from "./reportSectionsBuilder";

interface ReportHeaderMetaStripProps {
  report: Report;
  /** Готовність у % (з AI-перевірки) */
  readinessPercent: number;
  /** Скрол до AI-перевірки */
  onScrollToReadiness?: () => void;
  className?: string;
}

/**
 * Компактна мета-смуга шапки звіту: дедлайн · структура звіту · готовність.
 * Один рядок на desktop, переноситься на mobile.
 */
export function ReportHeaderMetaStrip({
  report,
  readinessPercent,
  onScrollToReadiness,
  className,
}: ReportHeaderMetaStripProps) {
  const normalizedStatus = migrateReportStatus(report.status) as ReportStatus;
  const isSubmittedOrAccepted = normalizedStatus === "submitted" || normalizedStatus === "accepted";

  // Розрахунок днів до дедлайну
  const deadlineInfo = useMemo(() => {
    const deadline = new Date(report.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffMs = deadline.getTime() - today.getTime();
    const days = Math.ceil(diffMs / 86400000);
    const dateStr = deadline.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
    return { days, dateStr, isOverdue: days < 0 };
  }, [report.deadline]);

  // Структура звіту за типом
  const sections = useMemo(() => buildReportSections(report), [report]);

  // Колір прогресу за порогом
  const progressColor =
    readinessPercent >= 90
      ? "bg-emerald-500"
      : readinessPercent >= 70
        ? "bg-amber-500"
        : "bg-destructive";
  const readinessTextColor =
    readinessPercent >= 90
      ? "text-emerald-700 dark:text-emerald-400"
      : readinessPercent >= 70
        ? "text-amber-700 dark:text-amber-400"
        : "text-destructive";

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground",
          className
        )}
      >
        {/* Дедлайн */}
        {!isSubmittedOrAccepted && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 cursor-help",
                    deadlineInfo.isOverdue && "text-destructive font-medium"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {deadlineInfo.isOverdue ? (
                    <>Прострочено на {Math.abs(deadlineInfo.days)} дн.</>
                  ) : deadlineInfo.days === 0 ? (
                    <>Сьогодні дедлайн ({deadlineInfo.dateStr})</>
                  ) : (
                    <>
                      <span className={cn(deadlineInfo.days <= 7 && "text-amber-700 dark:text-amber-400 font-medium")}>
                        {deadlineInfo.days} дн.
                      </span>{" "}
                      до {deadlineInfo.dateStr}
                    </>
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Граничний термін подання згідно ст. 49.18 ПКУ
                </p>
              </TooltipContent>
            </Tooltip>
            <span className="text-border" aria-hidden>·</span>
          </>
        )}

        {/* Структура звіту */}
        {sections.length > 0 && (
          <>
            <div className="inline-flex items-center gap-0.5">
              {sections.map((section, idx) => (
                <span key={`${section.code}-${idx}`} className="inline-flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`section-${section.code}`);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "center" });
                            el.classList.add("ring-2", "ring-primary/40", "rounded-md");
                            window.setTimeout(() => {
                              el.classList.remove("ring-2", "ring-primary/40", "rounded-md");
                            }, 1500);
                          }
                        }}
                        className={cn(
                          "inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-sm text-[9px] font-bold leading-none cursor-pointer border transition-colors hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          section.status === "ready" &&
                            "bg-emerald-500 border-emerald-500 text-white",
                          section.status === "empty" &&
                            "bg-muted border-border text-muted-foreground",
                          section.status === "error" &&
                            "bg-destructive border-destructive text-destructive-foreground"
                        )}
                        aria-label={`Перейти до розділу: ${section.name}`}
                      >
                        {section.code}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-medium">{section.name}</p>
                      {section.hint && (
                        <p className="text-xs text-muted-foreground mt-0.5">{section.hint}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                  {idx < sections.length - 1 && (
                    <span
                      className={cn(
                        "w-2 h-px mx-0.5",
                        sections[idx + 1].status === "ready" || section.status === "ready"
                          ? "bg-emerald-500/60"
                          : "bg-border"
                      )}
                      aria-hidden
                    />
                  )}
                </span>
              ))}
            </div>
            <span className="text-border" aria-hidden>·</span>
          </>
        )}

        {/* Готовність */}
        <button
          type="button"
          onClick={onScrollToReadiness}
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors group"
          aria-label="Перейти до AI-перевірки"
        >
          <span className="text-muted-foreground group-hover:text-foreground">Готовність</span>
          <span className={cn("font-semibold tabular-nums", readinessTextColor)}>
            {readinessPercent}%
          </span>
          <span className="relative h-1.5 w-[60px] rounded-full bg-muted overflow-hidden">
            <span
              className={cn("absolute inset-y-0 left-0 rounded-full transition-all", progressColor)}
              style={{ width: `${Math.max(0, Math.min(100, readinessPercent))}%` }}
            />
          </span>
        </button>
      </div>
    </TooltipProvider>
  );
}

