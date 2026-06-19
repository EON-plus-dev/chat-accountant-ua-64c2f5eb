/**
 * UniversalTaskCard — компактна draggable картка задачі для Kanban-колонок.
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical, Clock, Flame, AlertTriangle, ChevronUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UniversalTask, TaskPriority } from "../types";

interface Props {
  task: UniversalTask;
  assigneeName?: string;
  draggable?: boolean;
  onOpen?: (t: UniversalTask) => void;
}

function priorityMeta(p: TaskPriority) {
  switch (p) {
    case "urgent": return { icon: Flame, cls: "text-red-600 dark:text-red-400", label: "Терміново" };
    case "high":   return { icon: AlertTriangle, cls: "text-orange-600 dark:text-orange-400", label: "Високий" };
    case "med":    return { icon: ChevronUp, cls: "text-amber-600 dark:text-amber-400", label: "Середній" };
    case "low":    return { icon: Minus, cls: "text-muted-foreground", label: "Низький" };
  }
}

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  return Math.floor((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function initials(name?: string): string {
  if (!name) return "?";
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function UniversalTaskCard({ task, assigneeName, draggable = true, onOpen }: Props) {
  const sortable = useSortable({ id: task.id, disabled: !draggable });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };
  const pm = priorityMeta(task.priority);
  const Icon = pm.icon;
  const days = daysUntil(task.deadline);
  const overdue = days !== null && days < 0;
  const dueSoon = days !== null && days >= 0 && days <= 2;

  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(task);
        }
      }}
      className={cn(
        "group rounded-lg border bg-card text-card-foreground p-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer",
        sortable.isDragging && "opacity-50",
      )}
      aria-label={task.title}
    >
      <div className="flex items-start gap-2">
        {draggable && (
          <button
            type="button"
            className="shrink-0 -ml-1 mt-0.5 text-muted-foreground/40 hover:text-muted-foreground touch-none cursor-grab active:cursor-grabbing"
            aria-label="Перетягнути"
            onClick={(e) => e.stopPropagation()}
            {...sortable.attributes}
            {...sortable.listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-1.5 mb-1.5">
            <Icon className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", pm.cls)} aria-label={pm.label} />
            <h4 className="text-sm font-medium leading-tight line-clamp-2 min-w-0 flex-1">{task.title}</h4>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {task.deadline && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] gap-1 px-1.5 py-0 leading-none h-5",
                  overdue && "border-red-500/40 text-red-700 dark:text-red-300",
                  dueSoon && "border-amber-500/40 text-amber-700 dark:text-amber-300",
                )}
              >
                <Calendar className="h-2.5 w-2.5" />
                {overdue ? `+${Math.abs(days!)}д прострочено` : `${days}д`}
              </Badge>
            )}
            {task.estimateHours !== undefined && (
              <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 leading-none h-5">
                <Clock className="h-2.5 w-2.5" />
                {task.estimateHours}год
              </Badge>
            )}
            {task.tags?.slice(0, 2).map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0 leading-none h-5">
                {t}
              </Badge>
            ))}
          </div>

          {assigneeName && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[8px]">{initials(assigneeName)}</AvatarFallback>
              </Avatar>
              <span className="truncate">{assigneeName}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
