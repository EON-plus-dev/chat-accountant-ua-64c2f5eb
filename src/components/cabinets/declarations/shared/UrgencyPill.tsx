import { AlertTriangle, CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UnifiedStatus } from "@/lib/declarations/unifiedDeclarations";

interface Props {
  deadline: string; // ISO
  status: UnifiedStatus;
  className?: string;
}

/**
 * Уніфікований pill «Прострочено / N днів / —».
 * Прихований для submitted/accepted (немає сенсу показувати дедлайн).
 */
export function UrgencyPill({ deadline, status, className }: Props) {
  if (status === "submitted" || status === "accepted") return null;

  const dl = new Date(deadline).getTime();
  const days = Math.ceil((dl - Date.now()) / (24 * 60 * 60 * 1000));

  let tone = "bg-muted text-muted-foreground border-transparent";
  let Icon = CalendarDays;
  let label = `${days} дн. до дедлайну`;

  if (days < 0) {
    tone = "bg-destructive/10 text-destructive border-destructive/30";
    Icon = AlertTriangle;
    label = `Прострочено ${Math.abs(days)} дн.`;
  } else if (days === 0) {
    tone = "bg-destructive/10 text-destructive border-destructive/30";
    Icon = AlertTriangle;
    label = "Сьогодні дедлайн";
  } else if (days <= 7) {
    tone = "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30";
    Icon = Clock;
  } else if (days <= 30) {
    tone = "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
    Icon = Clock;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        tone,
        className,
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}
