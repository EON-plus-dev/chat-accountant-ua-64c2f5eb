/**
 * CrmDealSequencePanel — UI-секція каденцій усередині CrmDealSheet.
 *
 * Показує:
 *  - dropdown «+ Записати в каденцію» з пресет-релевантними шаблонами
 *  - активну каденцію зі stepper-прогресом (виконані / поточний / майбутні)
 *  - кнопку «Виконати крок зараз» (створює задачу через bridge + позначає крок)
 *  - швидкі дії pause/resume/cancel
 *
 * Не залежить від конкретного кабінету: усе через пропси.
 */

import { useMemo } from "react";
import {
  Mail, Phone, Users as Linkedin, MessageCircle, MessageSquare, CheckSquare, Calendar,
  CheckCircle2, Circle, Pause, Play, X, Plus, ListPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type {
  CrmDeal,
  CrmSequence,
  CrmSequenceEnrollment,
  CrmSequenceStep,
  CrmSequenceStepKind,
} from "../types";

interface Props {
  deal: CrmDeal;
  sequences: CrmSequence[];
  enrollments: CrmSequenceEnrollment[];
  onEnroll: (sequenceId: string) => void;
  onExecuteStep: (enrollment: CrmSequenceEnrollment, step: CrmSequenceStep) => void;
  onPause: (enrollmentId: string) => void;
  onResume: (enrollmentId: string) => void;
  onCancel: (enrollmentId: string) => void;
}

function stepIcon(kind: CrmSequenceStepKind) {
  switch (kind) {
    case "email":     return Mail;
    case "call":      return Phone;
    case "linkedin":  return Linkedin;
    case "whatsapp":  return MessageCircle;
    case "sms":       return MessageSquare;
    case "check_in":  return CheckSquare;
    case "meeting":   return Calendar;
  }
}

function formatStepDate(enrolledAt: string, delayDays: number): string {
  const d = new Date(enrolledAt);
  d.setDate(d.getDate() + delayDays);
  return d.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
}

function dueLabel(enrolledAt: string, delayDays: number): { text: string; tone: "due" | "upcoming" | "overdue" } {
  const target = new Date(enrolledAt);
  target.setDate(target.getDate() + delayDays);
  const diffDays = Math.ceil((target.getTime() - Date.now()) / 86_400_000);
  if (diffDays < 0) return { text: `Прострочено ${Math.abs(diffDays)} дн.`, tone: "overdue" };
  if (diffDays === 0) return { text: "Сьогодні", tone: "due" };
  if (diffDays === 1) return { text: "Завтра", tone: "due" };
  return { text: `Через ${diffDays} дн.`, tone: "upcoming" };
}

export function CrmDealSequencePanel({
  deal,
  sequences,
  enrollments,
  onEnroll,
  onExecuteStep,
  onPause,
  onResume,
  onCancel,
}: Props) {
  const activeEnrollments = useMemo(
    () => enrollments.filter((e) => e.status !== "cancelled"),
    [enrollments],
  );
  const enrolledIds = new Set(activeEnrollments.map((e) => e.sequenceId));
  const available = sequences.filter((s) => !enrolledIds.has(s.id));

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          <ListPlus className="h-3 w-3" /> Каденції
        </div>
        {available.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]">
                <Plus className="h-3 w-3 mr-1" /> Запис
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-[10px]">Доступні каденції</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {available.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => {
                    onEnroll(s.id);
                    toast.success(`Записано в «${s.label}»`);
                  }}
                  className="flex-col items-start gap-0.5"
                >
                  <span className="text-xs font-medium">{s.label}</span>
                  <span className="text-[10px] text-muted-foreground">{s.steps.length} touchpoints · {s.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {activeEnrollments.length === 0 ? (
        <div className="text-[11px] text-muted-foreground text-center py-3 border rounded-md border-dashed">
          Жодної активної каденції
        </div>
      ) : (
        <div className="space-y-3">
          {activeEnrollments.map((enr) => {
            const seq = sequences.find((s) => s.id === enr.sequenceId);
            if (!seq) return null;
            const totalSteps = seq.steps.length;
            const completedCount = Object.keys(enr.completedSteps).length;
            return (
              <div key={enr.id} className="rounded-md border bg-card p-2.5 space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium truncate">{seq.label}</span>
                    <Badge
                      variant={enr.status === "paused" ? "secondary" : "outline"}
                      className="text-[10px] tabular-nums shrink-0"
                    >
                      {completedCount}/{totalSteps}
                    </Badge>
                    {enr.status === "paused" && (
                      <Badge variant="secondary" className="text-[10px]">пауза</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {enr.status === "active" ? (
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onPause(enr.id)} aria-label="Пауза">
                        <Pause className="h-3 w-3" />
                      </Button>
                    ) : enr.status === "paused" ? (
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onResume(enr.id)} aria-label="Відновити">
                        <Play className="h-3 w-3" />
                      </Button>
                    ) : null}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        onCancel(enr.id);
                        toast.message("Каденцію скасовано");
                      }}
                      aria-label="Скасувати"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Step rail */}
                <ol className="space-y-1.5">
                  {seq.steps.map((step, idx) => {
                    const done = !!enr.completedSteps[step.id];
                    const isCurrent = !done && idx === enr.currentStepIdx;
                    const Icon = stepIcon(step.kind);
                    const due = dueLabel(enr.enrolledAt, step.delayDays);
                    return (
                      <li
                        key={step.id}
                        className={cn(
                          "flex items-center gap-2 rounded px-1.5 py-1",
                          isCurrent && "bg-primary/5",
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className={cn("h-3.5 w-3.5 shrink-0", isCurrent ? "text-primary" : "text-muted-foreground/50")} />
                        )}
                        <Icon className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          done ? "text-muted-foreground/50" : "text-muted-foreground",
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "text-xs truncate",
                            done && "line-through text-muted-foreground",
                            isCurrent && "font-medium",
                          )}>
                            {step.title}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground tabular-nums">
                            <span>{formatStepDate(enr.enrolledAt, step.delayDays)}</span>
                            {!done && (
                              <span className={cn(
                                due.tone === "overdue" && "text-destructive font-medium",
                                due.tone === "due" && "text-amber-600 dark:text-amber-400 font-medium",
                              )}>
                                · {due.text}
                              </span>
                            )}
                          </div>
                        </div>
                        {!done && enr.status === "active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-1.5 text-[10px] shrink-0"
                            onClick={() => {
                              onExecuteStep(enr, step);
                              toast.success("Крок виконано — задача створена");
                            }}
                          >
                            Виконати
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      )}

      <Separator className="opacity-0" />
      <span className="sr-only">Угода: {deal.id}</span>
    </section>
  );
}

export default CrmDealSequencePanel;
