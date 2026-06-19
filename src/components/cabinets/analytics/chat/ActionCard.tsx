import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  Bell,
  CalendarPlus,
  FileText,
  ListPlus,
  Check,
  X,
} from "lucide-react";
import type { ProposeActionArgs } from "@/lib/analytics/aiToolSchemas";

const ICON_BY_TYPE: Record<ProposeActionArgs["type"], React.ComponentType<{ className?: string }>> = {
  payment_slip: Receipt,
  reminder: Bell,
  calendar_event: CalendarPlus,
  tax_report: FileText,
  expense_log: ListPlus,
};

const LABEL_BY_TYPE: Record<ProposeActionArgs["type"], string> = {
  payment_slip: "Платіжка",
  reminder: "Нагадування",
  calendar_event: "Подія",
  tax_report: "Звіт",
  expense_log: "Витрата",
};

interface ActionCardProps {
  action: ProposeActionArgs;
  onConfirm: () => void;
  onDismiss: () => void;
  state?: "pending" | "confirmed" | "dismissed";
}

/**
 * Картка пропонованої дії від AI (платіжка/нагадування/подія).
 * Користувач підтверджує або відхиляє — ніколи не виконується автоматично.
 */
export const ActionCard = ({ action, onConfirm, onDismiss, state = "pending" }: ActionCardProps) => {
  const Icon = ICON_BY_TYPE[action.type];

  if (state === "dismissed") {
    return (
      <div className="rounded-lg border border-dashed border-border/50 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
        <X className="h-3.5 w-3.5" />
        Пропозицію відхилено: {action.title}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2.5">
      <div className="flex items-start gap-2.5">
        <div className="rounded-md bg-primary/10 p-1.5 mt-0.5">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {LABEL_BY_TYPE[action.type]}
            </Badge>
            <span className="text-sm font-medium text-foreground truncate">{action.title}</span>
          </div>
          {action.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{action.description}</p>
          )}
          {(action.dueDate || action.amount !== undefined) && (
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              {action.dueDate && (
                <span>📅 {new Date(action.dueDate).toLocaleDateString("uk-UA")}</span>
              )}
              {action.amount !== undefined && (
                <span className="font-medium text-foreground">
                  {action.amount.toLocaleString("uk-UA")} ₴
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {state === "pending" ? (
        <div className="flex items-center gap-2 pl-9">
          <Button size="sm" className="h-7 text-xs" onClick={onConfirm}>
            <Check className="h-3.5 w-3.5 mr-1" />
            Створити
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onDismiss}>
            Не зараз
          </Button>
        </div>
      ) : (
        <div className="pl-9 text-xs text-emerald-600 flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5" />
          Створено
        </div>
      )}
    </div>
  );
};
