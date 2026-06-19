import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/config/reportsConfig";
import { getLifecycleStep, migrateReportStatus } from "@/config/reportsConfig";

const STEPS = [
  { key: "scheduled",  label: "Заплановано" },
  { key: "processing", label: "Формується" },
  { key: "review",     label: "На перевірку" },
  { key: "approved",   label: "Підтверджено" },
  { key: "submitted",  label: "Подано" },
  { key: "accepted",   label: "Прийнято" },
] as const;

interface ReportLifecycleStepperProps {
  status: ReportStatus;
  className?: string;
  /** Компактний icon-only варіант (без підписів) — для розміщення поруч з h1 */
  compact?: boolean;
  /**
   * Розмір повного варіанту:
   * - "md" (default): 24×24 кружки, адаптивні підписи (3 на md, всі на lg+)
   * - "lg": 28×28 кружки, всі підписи на lg+ (повна версія для широких екранів)
   */
  size?: "md" | "lg";
}

/**
 * Горизонтальний 6-кроковий індикатор життєвого циклу звіту.
 * - Виконані кроки: зелена галочка
 * - Поточний крок: primary
 * - Майбутні: сірі
 * - rejected: червоний індикатор з прапорцем error
 *
 * Адаптивність повного варіанту:
 * - < sm — компактний прогрес-рядок «Крок N з 6 · {label}» + thin progress-bar
 * - sm-md — кружки + підписи тільки під 3 кроками (попередній · поточний · наступний)
 * - lg+ — всі 6 підписів
 */
export function ReportLifecycleStepper({
  status,
  className,
  compact = false,
  size = "md",
}: ReportLifecycleStepperProps) {
  const { current, hasError } = getLifecycleStep(status);
  const normalized = migrateReportStatus(status);
  const isTerminalSuccess = normalized === "accepted";

  // Компактний icon-only режим — для шапки поруч з h1
  if (compact) {
    return (
      <ol
        className={cn("flex items-center gap-0.5", className)}
        aria-label={`Етап ${current} з 6: ${hasError ? "Відхилено ДПС" : STEPS[current - 1]?.label}`}
      >
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isPast = stepNum < current || (isTerminalSuccess && stepNum <= current);
          const isCurrent = stepNum === current && !isTerminalSuccess;
          const isRejected = isCurrent && hasError;
          return (
            <li key={step.key} className="flex items-center" title={step.label}>
              <div
                className={cn(
                  "h-4 w-4 rounded-full flex items-center justify-center border transition-colors",
                  isPast && "bg-emerald-500 border-emerald-500 text-white",
                  isCurrent && !isRejected && "bg-primary border-primary text-primary-foreground ring-2 ring-primary/20",
                  isRejected && "bg-destructive border-destructive text-destructive-foreground",
                  stepNum > current && "bg-background border-border"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isPast ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                ) : isRejected ? (
                  <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2.5} />
                ) : null}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-2 h-px mx-0.5",
                    stepNum < current || isTerminalSuccess ? "bg-emerald-500" : "bg-border"
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  // Розміри (md за замовчуванням)
  const circleSize = size === "lg" ? "h-7 w-7" : "h-6 w-6";
  const iconSize = size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3";

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop / tablet — горизонтальний stepper */}
      <ol className="hidden sm:flex items-center w-full gap-1">
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isPast = stepNum < current || (isTerminalSuccess && stepNum <= current);
          const isCurrent = stepNum === current && !isTerminalSuccess;
          const isFuture = stepNum > current;
          const isRejected = isCurrent && hasError;

          // Адаптивні підписи: на md показуємо лише попередній · поточний · наступний;
          // на lg+ — всі. Поточний крок завжди має підпис (якщо isCurrent).
          const isAdjacentToCurrent =
            stepNum === current - 1 || stepNum === current || stepNum === current + 1;

          return (
            <li key={step.key} className="flex items-center flex-1 min-w-0 last:flex-initial">
              {/* Кружок з підписом */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className={cn(
                    circleSize,
                    "rounded-full flex items-center justify-center text-[11px] font-semibold border-2 transition-colors",
                    isPast && "bg-emerald-500 border-emerald-500 text-white",
                    isCurrent && !isRejected && "bg-primary border-primary text-primary-foreground ring-2 ring-primary/15",
                    isRejected && "bg-destructive border-destructive text-destructive-foreground ring-2 ring-destructive/15",
                    isFuture && "bg-background border-border text-muted-foreground"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isPast ? (
                    <Check className={iconSize} strokeWidth={3} />
                  ) : isRejected ? (
                    <AlertTriangle className={iconSize} strokeWidth={2.5} />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] leading-tight text-center whitespace-nowrap",
                    // На md показуємо тільки сусідні підписи; на lg+ — всі
                    isAdjacentToCurrent ? "inline-block" : "hidden lg:inline-block",
                    isPast && "text-emerald-700 dark:text-emerald-400 font-medium",
                    isCurrent && !isRejected && "text-primary font-semibold",
                    isRejected && "text-destructive font-semibold",
                    isFuture && "text-muted-foreground"
                  )}
                >
                  {isRejected ? "Відхилено" : step.label}
                </span>
              </div>

              {/* Лінія до наступного кроку */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 mb-5 rounded transition-colors",
                    stepNum < current || isTerminalSuccess ? "bg-emerald-500" : "bg-border"
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile — компактна версія: «Крок N з 6 · label» + прогрес-бар */}
      <div className="sm:hidden space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Крок {current} з 6</span>
          <span
            className={cn(
              "font-semibold",
              hasError ? "text-destructive" : isTerminalSuccess ? "text-emerald-600" : "text-primary"
            )}
          >
            {hasError ? "Відхилено ДПС" : STEPS[current - 1]?.label}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full transition-all rounded-full",
              hasError ? "bg-destructive" : isTerminalSuccess ? "bg-emerald-500" : "bg-primary"
            )}
            style={{ width: `${(current / 6) * 100}%` }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
