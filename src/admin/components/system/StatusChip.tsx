import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusLevel = "ok" | "warning" | "critical" | "disabled" | "info";

const STYLES: Record<StatusLevel, string> = {
  ok: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  critical: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
  disabled: "bg-muted text-muted-foreground border-border",
  info: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
};

interface Props {
  level: StatusLevel;
  children: React.ReactNode;
  className?: string;
}

/** Уніфікований статус-бейдж для всього розділу «Система». */
export function StatusChip({ level, children, className }: Props) {
  return (
    <Badge variant="outline" className={cn("text-[10px]", STYLES[level], className)}>
      {children}
    </Badge>
  );
}
