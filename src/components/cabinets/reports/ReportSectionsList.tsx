import { cn } from "@/lib/utils";
import type { Report } from "@/config/reportsConfig";
import { buildReportSections, type SectionStatus } from "./reportSectionsBuilder";

interface ReportSectionsListProps {
  report: Report;
  /** Заголовок блоку. Default: «Структура звіту». Для scheduled — «Попередня структура звіту». */
  title?: string;
  className?: string;
}

function sectionBadgeClasses(status: SectionStatus): string {
  switch (status) {
    case "ready":
      return "bg-emerald-500 border-emerald-500 text-white";
    case "error":
      return "bg-destructive border-destructive text-destructive-foreground";
    default:
      return "bg-muted border-border text-muted-foreground";
  }
}

function statusLabel(status: SectionStatus): string {
  switch (status) {
    case "ready":
      return "Готово";
    case "error":
      return "Потребує уваги";
    default:
      return "Очікує даних";
  }
}

function statusLabelClasses(status: SectionStatus): string {
  switch (status) {
    case "ready":
      return "text-emerald-700 dark:text-emerald-400";
    case "error":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}

/**
 * Універсальний інлайн-список структури звіту (Р/I/II/П з назвою, статусом
 * і hint-описом). Використовується і в `ScheduledReportPlaceholder`
 * (попередня структура майбутнього звіту), і на сторінці звіту в
 * draft/review/approved-станах.
 *
 * Кожен `<li>` отримує `id="section-<code>"` для навігації з кружків
 * `ReportHeaderMetaStrip` через `scrollIntoView`.
 */
export function ReportSectionsList({ report, title = "Структура звіту", className }: ReportSectionsListProps) {
  const sections = buildReportSections(report);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
        {title}
      </div>
      <ul className="rounded-md border divide-y bg-background">
        {sections.map((section, idx) => (
          <li
            key={`${section.code}-${idx}`}
            id={`section-${section.code}`}
            className="flex items-start gap-3 px-3 py-2.5 scroll-mt-20"
          >
            <span
              className={cn(
                "inline-flex items-center justify-center h-6 min-w-[1.5rem] px-1.5 rounded-md text-[11px] font-bold leading-none border shrink-0 mt-0.5",
                sectionBadgeClasses(section.status),
              )}
              aria-hidden
            >
              {section.code}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-foreground leading-tight">
                  {section.name}
                </p>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wide shrink-0",
                    statusLabelClasses(section.status),
                  )}
                >
                  {statusLabel(section.status)}
                </span>
              </div>
              {section.hint && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  {section.hint}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
