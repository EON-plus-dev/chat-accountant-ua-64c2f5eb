/**
 * UniversalTaskSheet — drill-картка задачі (bottom-sheet mobile / right-sheet desktop).
 * Швидкі дії перенесення між статусами в action-bar.
 */

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Tag, User, Flame, AlertTriangle, ChevronUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TasksPreset, UniversalTask } from "../types";

interface Props {
  task: UniversalTask | null;
  preset: TasksPreset;
  assigneeName?: string;
  isMobile: boolean;
  onOpenChange: (open: boolean) => void;
  onMoveToStatus: (statusId: string) => void;
}

function priorityIcon(p: UniversalTask["priority"]) {
  switch (p) {
    case "urgent": return Flame;
    case "high":   return AlertTriangle;
    case "med":    return ChevronUp;
    case "low":    return Minus;
  }
}

export function UniversalTaskSheet({ task, preset, assigneeName, isMobile, onOpenChange, onMoveToStatus }: Props) {
  if (!task) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }
  const currentStatus = preset.statuses.find((s) => s.id === task.statusId);
  const currentIdx = preset.statuses.findIndex((s) => s.id === task.statusId);
  const nextStatus = preset.statuses.slice(currentIdx + 1).find((s) => !s.terminal);
  const doneStatus = preset.statuses.find((s) => s.terminal === "done");
  const Icon = priorityIcon(task.priority);

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={isMobile ? "h-[88vh] flex flex-col" : "w-full sm:max-w-md flex flex-col"}
      >
        <SheetHeader className="text-left space-y-2 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <SheetTitle className="text-base leading-tight flex items-start gap-2">
              <Icon className={cn(
                "h-4 w-4 mt-0.5 shrink-0",
                task.priority === "urgent" && "text-red-600 dark:text-red-400",
                task.priority === "high" && "text-orange-600 dark:text-orange-400",
                task.priority === "med" && "text-amber-600 dark:text-amber-400",
                task.priority === "low" && "text-muted-foreground",
              )} />
              <span>{task.title}</span>
            </SheetTitle>
          </div>
          <SheetDescription className="flex items-center gap-2 text-xs">
            {currentStatus && <Badge variant="outline" className="text-[10px]">{currentStatus.label}</Badge>}
            <span className="capitalize">{task.priority}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-5">
          {task.description && (
            <section>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Опис</div>
              <p className="text-sm">{task.description}</p>
            </section>
          )}

          <Separator />

          <section className="grid grid-cols-2 gap-3 text-xs">
            {task.deadline && (
              <div>
                <div className="text-muted-foreground mb-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Дедлайн</div>
                <div className="font-medium">{new Date(task.deadline).toLocaleDateString("uk-UA")}</div>
              </div>
            )}
            {task.estimateHours !== undefined && (
              <div>
                <div className="text-muted-foreground mb-0.5 flex items-center gap-1"><Clock className="h-3 w-3" /> Оцінка</div>
                <div className="font-medium tabular-nums">{task.estimateHours} год</div>
              </div>
            )}
            {assigneeName && (
              <div className="col-span-2">
                <div className="text-muted-foreground mb-0.5 flex items-center gap-1"><User className="h-3 w-3" /> Виконавець</div>
                <div className="font-medium">{assigneeName}</div>
              </div>
            )}
          </section>

          {task.linkedDealId && (
            <>
              <Separator />
              <section>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Повʼязана угода
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">{task.linkedDealId}</Badge>
              </section>
            </>
          )}

          {task.tags && task.tags.length > 0 && (
            <>
              <Separator />
              <section>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Теги
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        <div className="shrink-0 border-t pt-3 -mx-6 px-6 flex flex-col sm:flex-row gap-2">
          {nextStatus && (
            <Button onClick={() => onMoveToStatus(nextStatus.id)} className="flex-1">
              До «{nextStatus.label}»
            </Button>
          )}
          {doneStatus && doneStatus.id !== task.statusId && (
            <Button variant="outline" onClick={() => onMoveToStatus(doneStatus.id)} className="flex-1">
              {preset.terminology.completeVerb}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
