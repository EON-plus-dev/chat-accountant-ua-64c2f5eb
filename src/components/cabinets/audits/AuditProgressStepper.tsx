import { cn } from "@/lib/utils";
import {
  AuditStatus,
  AuditType,
  TaxAudit,
  getStepsForAuditType,
  getCurrentStepIndex,
  getAuditStepFromStatus,
} from "@/config/taxAuditsConfig";
import {
  Check,
  AlertCircle,
  Clock,
  FileSearch,
  MessageSquare,
  CheckCircle2,
  FileText,
  Scale,
  DoorOpen,
} from "lucide-react";

interface AuditProgressStepperProps {
  /** Передавайте audit для коректного per-type stepper. */
  audit?: TaxAudit;
  /** Legacy: лише статус (без типу) — використовується універсальний 5-крок stepper. */
  status?: AuditStatus;
  className?: string;
}

const STEP_ICON_BY_ID: Record<string, typeof AlertCircle> = {
  announced: AlertCircle,
  preparation: Clock,
  arrival: DoorOpen,
  "in-progress": FileSearch,
  response: MessageSquare,
  act: FileText,
  completed: CheckCircle2,
};

const LEGACY_STEPS = [
  { id: "announced", label: "Оголошено" },
  { id: "preparation", label: "Підготовка" },
  { id: "in-progress", label: "Перевірка" },
  { id: "response", label: "Відповідь" },
  { id: "completed", label: "Завершено" },
];

export const AuditProgressStepper = ({
  audit,
  status,
  className,
}: AuditProgressStepperProps) => {
  const steps = audit
    ? getStepsForAuditType(audit.type).map((s) => ({ id: s.id, label: s.label }))
    : LEGACY_STEPS;

  const currentStep = audit
    ? getCurrentStepIndex(audit)
    : status
      ? getAuditStepFromStatus(status)
      : 0;

  const effectiveStatus = audit?.status ?? status;
  const isAppealed = effectiveStatus === "appealed";

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop horizontal stepper */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;
          const StepIcon = STEP_ICON_BY_ID[step.id] ?? FileSearch;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                    isCurrent && !isAppealed && "bg-primary border-primary text-primary-foreground",
                    isCurrent && isAppealed && "bg-purple-500 border-purple-500 text-white",
                    !isCompleted && !isCurrent && "bg-muted border-border text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent && isAppealed ? (
                    <Scale className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center whitespace-nowrap",
                    isCompleted && "text-emerald-600 dark:text-emerald-400",
                    isCurrent && !isAppealed && "text-primary",
                    isCurrent && isAppealed && "text-purple-600 dark:text-purple-400",
                    !isCompleted && !isCurrent && "text-muted-foreground",
                  )}
                >
                  {isCurrent && isAppealed ? "Оскаржено" : step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-all duration-300",
                    index < currentStep ? "bg-emerald-500" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile compact stepper */}
      <div className="sm:hidden">
        <div className="flex items-center gap-1.5 mb-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  isCompleted && "bg-emerald-500",
                  isCurrent && !isAppealed && "bg-primary",
                  isCurrent && isAppealed && "bg-purple-500",
                  !isCompleted && !isCurrent && "bg-border",
                )}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Крок {currentStep + 1} з {steps.length}
          </span>
          <span
            className={cn(
              "font-medium",
              isAppealed ? "text-purple-600 dark:text-purple-400" : "text-primary",
            )}
          >
            {isAppealed ? "Оскаржено" : steps[currentStep]?.label}
          </span>
        </div>
      </div>
    </div>
  );
};
