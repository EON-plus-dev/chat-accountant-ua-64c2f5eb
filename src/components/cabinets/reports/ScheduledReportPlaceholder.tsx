import { CalendarClock, Loader2, Sparkles, Database, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Report } from "@/config/reportsConfig";
import { migrateReportStatus } from "@/config/reportsConfig";
import { getEmployeesForCabinet } from "@/config/employeesConfig";
import { ReportSectionsList } from "./ReportSectionsList";

interface ScheduledReportPlaceholderProps {
  report: Report;
  onCreateDraft?: (report: Report) => void;
}

function formatGenerationDate(deadline: string): string {
  // AI генерує звіт за 3 дні до дедлайну
  const d = new Date(deadline);
  d.setDate(d.getDate() - 3);
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Плейсхолдер для звітів зі статусом `scheduled` або `processing`.
 *
 * Показуємо: коли AI сформує звіт, реальну майбутню структуру (розділи з
 * описом, що буде в кожному), джерела даних, CTA «створити зараз».
 *
 * Не показуємо ані порожні нулі форми ДПС, ані skeleton-заглушки —
 * структура реальна, просто статус «Очікує даних».
 */
export function ScheduledReportPlaceholder({ report, onCreateDraft }: ScheduledReportPlaceholderProps) {
  const status = migrateReportStatus(report.status);
  const isProcessing = status === "processing";
  const generationDate = formatGenerationDate(report.deadline);
  

  // Працівники потрібні лише для звітів, де ПДФО/ВЗ/ЄСВ рахується від ЗП.
  const usesEmployees =
    report.type === "1df" ||
    report.type === "esv-emp" ||
    report.type === "vz-emp";
  const employeesCount = usesEmployees
    ? getEmployeesForCabinet(report.cabinetId).filter(
        (e) => e.status === "active" || e.status === "probation",
      ).length
    : 0;

  return (
    <div className="border rounded-lg bg-background overflow-hidden">
      {/* Шапка */}
      <div className="bg-muted/40 border-b px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md bg-background border shrink-0">
            {isProcessing ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <CalendarClock className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              {isProcessing ? "AI обробляє дані" : "Заплановано до автогенерації"}
            </p>
            <h3 className="text-sm font-semibold leading-snug mt-0.5">
              {report.typeLabel} — {report.periodLabel}
            </h3>
            <Badge variant="outline" className="mt-1.5 text-[11px] h-5">
              Дедлайн подання: {new Date(report.deadline).toLocaleDateString("uk-UA")}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Основне пояснення */}
        {isProcessing ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <Loader2 className="h-4 w-4 text-primary mt-0.5 shrink-0 animate-spin" />
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  AI формує цей звіт прямо зараз
                </p>
                <p className="text-muted-foreground mt-1 leading-relaxed">
                  Обробляємо операції за період, перевіряємо ставки та готуємо чернетку згідно з
                  чинним законодавством. Зазвичай це триває{" "}
                  <span className="font-medium text-foreground">30–60 секунд</span>.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/20 p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <CalendarClock className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-sky-900 dark:text-sky-100">
                  AI автоматично сформує цей звіт {generationDate}
                </p>
                <p className="text-sky-800 dark:text-sky-200 mt-1 leading-relaxed">
                  Розрахунок виконається на основі даних з банків та Книги доходів, які
                  будуть доступні на цю дату. Ви отримаєте сповіщення, коли звіт буде готовий
                  до перевірки.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Реальна структура майбутнього звіту — без skeleton-заглушок */}
        <ReportSectionsList report={report} title="Попередня структура звіту" />

        {/* Джерела даних, з яких AI сформує звіт */}
        <div className="rounded-md border bg-muted/20 p-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Джерела для розрахунку
          </p>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="h-3.5 w-3.5 shrink-0" />
              Банківські інтеграції (синхронізація щодня)
            </li>
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              Книга доходів за {report.periodLabel}
            </li>
            {usesEmployees && (
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5 shrink-0" />
                Профілі працівників
                {employeesCount > 0 && (
                  <span className="text-foreground font-medium">
                    ({employeesCount} {employeesCount === 1 ? "особа" : "осіб"})
                  </span>
                )}
              </li>
            )}
          </ul>
        </div>

        {/* CTA — лише для scheduled (для processing — disabled з spinner) */}
        <div className="pt-1">
          <Button
            className="w-full sm:w-auto"
            onClick={() => onCreateDraft?.(report)}
            disabled={isProcessing || !onCreateDraft}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Триває генерація…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Створити чернетку зараз
              </>
            )}
          </Button>
          {!isProcessing && (
            <p className="text-[11px] text-muted-foreground mt-2">
              Не очікуйте автогенерації — запустіть AI вручну, якщо всі операції за {report.periodLabel} вже внесено.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
