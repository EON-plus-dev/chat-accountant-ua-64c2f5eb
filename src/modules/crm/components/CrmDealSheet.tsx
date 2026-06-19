/**
 * CrmDealSheet — drill-картка угоди (bottom sheet на mobile, right sheet на desktop).
 *
 * У Phase 4 додано міст до Tasks:
 *  - Секція «Повʼязані задачі» (linkedTasks)
 *  - Секція «AI-наступні кроки» з кнопкою + до задач
 *  - Кнопки Виграно/Втрачено автоматично запускають playbook (`deal_won` / `deal_lost`)
 *    і показують toast зі скільки задач створено.
 */

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Mail,
  Phone,
  User,
  Calendar,
  Tag,
  ListChecks,
  Sparkles,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CrmAccount, CrmContact, CrmDeal, CrmPreset, CrmSequence, CrmSequenceEnrollment, CrmSequenceStep, CrmStage } from "../types";
import type { UniversalTask } from "@/modules/tasks/types";
import type { CrmTaskSuggestion } from "@/modules/integrations/crmTasksBridge";
import { CrmHealthScoreBadge } from "./CrmHealthScoreBadge";
import { CrmDealSequencePanel } from "./CrmDealSequencePanel";

interface Props {
  deal: CrmDeal | null;
  account?: CrmAccount;
  contact?: CrmContact;
  preset: CrmPreset;
  stages: CrmStage[];
  onOpenChange: (open: boolean) => void;
  onMoveToStage: (stageId: string) => void;
  isMobile: boolean;
  /** Phase 4 — bridge data/handlers (опціонально, якщо tasksPreset відсутній) */
  linkedTasks?: UniversalTask[];
  suggestions?: CrmTaskSuggestion[];
  onCreateTaskFromSuggestion?: (s: CrmTaskSuggestion) => void;
  onAddManualTask?: () => void;
  /** Повертає кількість створених задач */
  onRunPlaybook?: (trigger: string) => number;
  /** Phase 2 — sequences */
  sequences?: CrmSequence[];
  enrollments?: CrmSequenceEnrollment[];
  onEnrollSequence?: (sequenceId: string) => void;
  onExecuteSequenceStep?: (enr: CrmSequenceEnrollment, step: CrmSequenceStep) => void;
  onPauseSequence?: (enrollmentId: string) => void;
  onResumeSequence?: (enrollmentId: string) => void;
  onCancelSequence?: (enrollmentId: string) => void;
}

function formatValue(value: number, currency: string, isRecurring: boolean): string {
  const formatted = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(value);
  const symbol = currency === "UAH" ? "₴" : currency;
  return `${formatted} ${symbol}${isRecurring ? "/міс" : ""}`;
}

function priorityClass(p: UniversalTask["priority"]) {
  if (p === "urgent") return "text-red-600 dark:text-red-400";
  if (p === "high") return "text-orange-600 dark:text-orange-400";
  if (p === "med") return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}

export function CrmDealSheet({
  deal,
  account,
  contact,
  preset,
  stages,
  onOpenChange,
  onMoveToStage,
  isMobile,
  linkedTasks,
  suggestions,
  onCreateTaskFromSuggestion,
  onAddManualTask,
  onRunPlaybook,
  sequences,
  enrollments,
  onEnrollSequence,
  onExecuteSequenceStep,
  onPauseSequence,
  onResumeSequence,
  onCancelSequence,
}: Props) {
  const open = !!deal;
  if (!deal) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }
  const currentStage = stages.find((s) => s.id === deal.stageId);
  const currentIdx = stages.findIndex((s) => s.id === deal.stageId);
  const nextOpenStage = stages.slice(currentIdx + 1).find((s) => !s.terminal);
  const wonStage = stages.find((s) => s.terminal === "won");
  const lostStage = stages.find((s) => s.terminal === "lost");

  const linked = linkedTasks ?? [];
  const openLinked = linked.filter((t) => !t.completedAt);
  const doneLinked = linked.length - openLinked.length;

  function handleTerminalMove(stageId: string, trigger: "deal_won" | "deal_lost") {
    if (onRunPlaybook) {
      const created = onRunPlaybook(trigger);
      if (created > 0) {
        toast.success(
          trigger === "deal_won"
            ? `Створено ${created} задач онбордингу`
            : `Створено ${created} задач post-mortem`,
        );
      }
    }
    onMoveToStage(stageId);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[88vh] flex flex-col" : "w-full sm:max-w-md flex flex-col"}
      >
        <SheetHeader className="text-left space-y-2 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <SheetTitle className="text-base leading-tight">{deal.title}</SheetTitle>
            {deal.health && <CrmHealthScoreBadge health={deal.health} />}
          </div>
          <SheetDescription className="flex items-center gap-2 text-xs">
            {currentStage && (
              <Badge variant="outline" className="text-[10px]">{currentStage.label}</Badge>
            )}
            <span className="tabular-nums">{deal.probability}% імовірності</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-5">
          {/* Value */}
          <section>
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
              {preset.terminology.valueLabel}
            </div>
            <div className="text-2xl font-semibold tabular-nums">
              {formatValue(deal.value, deal.currency, preset.terminology.valueIsRecurring)}
            </div>
          </section>

          <Separator />

          {/* Account / contact */}
          {(account || contact) && (
            <section className="space-y-2">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">
                {preset.terminology.account}
              </div>
              {account && (
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="text-sm font-medium truncate">{account.name}</div>
                  {account.tier && <Badge variant="secondary" className="text-[10px]">{account.tier}</Badge>}
                </div>
              )}
              {contact && (
                <div className="ml-5 space-y-1 text-xs text-muted-foreground">
                  <div className="font-medium text-foreground">{contact.fullName}{contact.role ? ` · ${contact.role}` : ""}</div>
                  {contact.email && (
                    <a className="flex items-center gap-1.5 hover:text-foreground" href={`mailto:${contact.email}`}>
                      <Mail className="h-3 w-3" /> {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <a className="flex items-center gap-1.5 hover:text-foreground" href={`tel:${contact.phone}`}>
                      <Phone className="h-3 w-3" /> {contact.phone}
                    </a>
                  )}
                </div>
              )}
            </section>
          )}

          {deal.nextStep && (
            <>
              <Separator />
              <section>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Наступний крок</div>
                <p className="text-sm">{deal.nextStep}</p>
              </section>
            </>
          )}

          <Separator />
          <section className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-muted-foreground mb-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Очік. закриття</div>
              <div className="font-medium">
                {new Date(deal.expectedCloseAt).toLocaleDateString("uk-UA")}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-0.5 flex items-center gap-1"><Tag className="h-3 w-3" /> Джерело</div>
              <div className="font-medium capitalize">{deal.source ?? "—"}</div>
            </div>
          </section>

          {/* ───────── Phase 4: AI-suggestions ───────── */}
          {suggestions && suggestions.length > 0 && (
            <>
              <Separator />
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> AI-наступні кроки
                  </div>
                  <Badge variant="outline" className="text-[10px]">{suggestions.length}</Badge>
                </div>
                <ul className="space-y-1.5">
                  {suggestions.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-start gap-2 p-2 rounded-md border bg-muted/30"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-xs font-medium truncate", priorityClass(s.priority))}>
                            {s.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                          {s.reason}
                        </p>
                      </div>
                      {onCreateTaskFromSuggestion && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 shrink-0"
                          onClick={() => {
                            onCreateTaskFromSuggestion(s);
                            toast.success("Задачу додано");
                          }}
                          aria-label="Додати в задачі"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {/* ───────── Phase 2: Sequences / Cadences ───────── */}
          {sequences && sequences.length > 0 && onEnrollSequence && onExecuteSequenceStep && onPauseSequence && onResumeSequence && onCancelSequence && (
            <>
              <Separator />
              <CrmDealSequencePanel
                deal={deal}
                sequences={sequences}
                enrollments={enrollments ?? []}
                onEnroll={onEnrollSequence}
                onExecuteStep={onExecuteSequenceStep}
                onPause={onPauseSequence}
                onResume={onResumeSequence}
                onCancel={onCancelSequence}
              />
            </>
          )}

          {/* ───────── Phase 4: Linked tasks ───────── */}
          {linkedTasks && (
            <>
              <Separator />
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <ListChecks className="h-3 w-3" /> Повʼязані задачі
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] tabular-nums">{openLinked.length}</Badge>
                    {doneLinked > 0 && (
                      <span className="flex items-center gap-0.5 tabular-nums">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />{doneLinked}
                      </span>
                    )}
                  </div>
                </div>
                {linked.length === 0 ? (
                  <div className="text-[11px] text-muted-foreground text-center py-3 border rounded-md border-dashed">
                    Ще немає задач за цією угодою
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {linked.slice(0, 5).map((t) => (
                      <li key={t.id} className="flex items-center gap-2 text-xs py-1">
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", t.completedAt ? "bg-emerald-500" : "bg-amber-500")} />
                        <span className={cn("truncate flex-1", t.completedAt && "line-through text-muted-foreground")}>
                          {t.title}
                        </span>
                        {t.deadline && !t.completedAt && (
                          <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                            {new Date(t.deadline).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" })}
                          </span>
                        )}
                      </li>
                    ))}
                    {linked.length > 5 && (
                      <li className="text-[10px] text-muted-foreground text-center pt-1">
                        +{linked.length - 5} ще…
                      </li>
                    )}
                  </ul>
                )}
                {onAddManualTask && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 mt-1"
                    onClick={() => {
                      onAddManualTask();
                      toast.success("Задачу додано");
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Додати задачу
                  </Button>
                )}
              </section>
            </>
          )}
        </div>

        {/* Action bar */}
        <div className="shrink-0 border-t pt-3 -mx-6 px-6 flex flex-col sm:flex-row gap-2">
          {nextOpenStage && (
            <Button onClick={() => onMoveToStage(nextOpenStage.id)} className="flex-1">
              <ArrowRight className="h-4 w-4 mr-1" />
              До «{nextOpenStage.label}»
            </Button>
          )}
          {wonStage && (
            <Button
              variant="outline"
              onClick={() => handleTerminalMove(wonStage.id, "deal_won")}
              className="flex-1"
            >
              Виграно
            </Button>
          )}
          {lostStage && (
            <Button
              variant="ghost"
              onClick={() => handleTerminalMove(lostStage.id, "deal_lost")}
              className="flex-1 text-destructive hover:text-destructive"
            >
              Втрачено
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
