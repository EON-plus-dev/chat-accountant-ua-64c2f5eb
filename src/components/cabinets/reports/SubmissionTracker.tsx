import { CheckCircle2, Clock, Send, FileText, Wallet, Loader2, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Report } from "@/config/reportsConfig";
import { migrateReportStatus } from "@/config/reportsConfig";

interface SubmissionTrackerProps {
  report: Report;
}

// Stepper for submission tracking (5.4)
const submissionSteps = [
  { id: "draft", label: "Чернетка", icon: FileText },
  { id: "review", label: "Перевірка", icon: Clock },
  { id: "xml", label: "XML сформовано", icon: FileText },
  { id: "submitted", label: "Подано до ДПС", icon: Send },
  { id: "accepted", label: "Прийнято", icon: CheckCircle2 },
];

// Stepper for refund tracking (5.5) — enhanced
const refundSteps = [
  { id: "submitted", label: "Заяву подано", icon: Send },
  { id: "dps-review", label: "ДПС перевіряє", icon: Loader2 },
  { id: "confirmed", label: "Підтверджено", icon: CheckCircle2 },
  { id: "refund", label: "Зарахування", icon: Banknote },
];

function getSubmissionStep(report: Report): number {
  const status = migrateReportStatus(report.status);
  switch (status) {
    case "scheduled": return 0;
    case "processing": return 0;
    case "review": return 1;
    case "approved": return 2;
    case "submitted": return 3;
    case "accepted": return 4;
    case "rejected": return 3;
    default: return 0;
  }
}

function getRefundStep(report: Report): number {
  const status = migrateReportStatus(report.status);
  if (status === "accepted") return 3;
  if (status === "submitted") return 1;
  if (status === "review" || status === "approved") return 0;
  return 0;
}

function StepperTimeline({ steps, currentStep }: { steps: typeof submissionSteps; currentStep: number }) {
  return (
    <div className="flex items-center w-full gap-0">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                  isCompleted && "bg-emerald-500 border-emerald-500 text-white",
                  isCurrent && "bg-primary border-primary text-primary-foreground",
                  isPending && "bg-muted border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className={cn("w-4 h-4", isCurrent && "animate-pulse")} />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] text-center leading-tight max-w-[70px]",
                  isCompleted && "text-emerald-600 dark:text-emerald-400 font-medium",
                  isCurrent && "text-primary font-semibold",
                  isPending && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-1 mt-[-20px]",
                  index < currentStep ? "bg-emerald-500" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Demo refund timeline events
const refundTimeline = [
  { date: "15.02.2026", label: "Декларацію на знижку подано", status: "done" as const },
  { date: "16.02.2026", label: "ДПС отримала, перевірка розпочата", status: "done" as const },
  { date: "~16.04.2026", label: "Завершення камеральної перевірки (60 днів)", status: "current" as const },
  { date: "~30.04.2026", label: "Зарахування на банківський рахунок", status: "pending" as const },
];

export function SubmissionTracker({ report }: SubmissionTrackerProps) {
  // Only show for individual declarant pdfo reports
  if (report.type !== "pdfo" || report.cabinetId !== "demo-individual-declarant") {
    return null;
  }

  const isRefund = report.amountToPay !== undefined && report.amountToPay < 0;
  const steps = isRefund ? refundSteps : submissionSteps;
  const currentStep = isRefund ? getRefundStep(report) : getSubmissionStep(report);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {isRefund ? (
            <>
              <Wallet className="h-4 w-4 text-muted-foreground" />
              Статус повернення знижки
              <Badge variant="success" size="sm">5.5</Badge>
            </>
          ) : (
            <>
              <Send className="h-4 w-4 text-muted-foreground" />
              Статус подачі
              <Badge variant="info" size="sm">5.4</Badge>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StepperTimeline steps={steps} currentStep={currentStep} />

        {isRefund && (
          <>
            {/* Refund amount */}
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5">
              <strong>Сума повернення:</strong> {Math.abs(report.amountToPay!).toLocaleString("uk-UA")} ₴ · ДПС має 60 днів на перевірку після подання декларації (ст. 179.8 ПКУ).
            </div>

            {/* Timeline */}
            <div className="space-y-0">
              <div className="text-xs font-semibold text-muted-foreground mb-2">Хронологія:</div>
              {refundTimeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  {/* Vertical line */}
                  {i < refundTimeline.length - 1 && (
                    <div className={cn(
                      "absolute left-[7px] top-4 w-0.5 h-full",
                      event.status === "done" ? "bg-emerald-400" : "bg-muted-foreground/20"
                    )} />
                  )}
                  {/* Dot */}
                  <div className={cn(
                    "w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border-2",
                    event.status === "done" && "bg-emerald-500 border-emerald-500",
                    event.status === "current" && "bg-primary border-primary animate-pulse",
                    event.status === "pending" && "bg-muted border-muted-foreground/30",
                  )} />
                  <div className="pb-3">
                    <div className={cn(
                      "text-xs font-medium",
                      event.status === "done" && "text-emerald-600 dark:text-emerald-400",
                      event.status === "current" && "text-primary font-semibold",
                      event.status === "pending" && "text-muted-foreground",
                    )}>
                      {event.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
