import { cn } from "@/lib/utils";

export type SummaryTileTone = "neutral" | "primary" | "warning" | "success" | "info";

const TONE: Record<SummaryTileTone, string> = {
  neutral: "bg-muted/40 text-foreground border-border/60",
  primary: "bg-primary/5 text-foreground border-primary/20",
  warning: "bg-amber-500/10 text-amber-900 dark:text-amber-100 border-amber-500/30",
  success: "bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 border-emerald-500/30",
  info: "bg-blue-500/10 text-blue-900 dark:text-blue-100 border-blue-500/30",
};

interface SummaryTileProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: SummaryTileTone;
  /** Mobile text-2xl/p-4 → Desktop text-3xl/p-6 (per design system memory). */
  size?: "sm" | "md";
}

/**
 * Уніфікована KPI-плитка для деталізованих сторінок декларацій.
 * Дотримується правил памʼяті: mobile `text-2xl`/`p-4`, desktop `text-3xl`/`p-6`.
 */
export function SummaryTile({
  label,
  value,
  hint,
  tone = "neutral",
  size = "md",
}: SummaryTileProps) {
  const padding = size === "sm" ? "p-3 md:p-4" : "p-4 md:p-6";
  const valueSize = size === "sm" ? "text-xl md:text-2xl" : "text-2xl md:text-3xl";
  return (
    <div className={cn("rounded-lg border", padding, TONE[tone])}>
      <div className="text-xs uppercase tracking-wide opacity-80">{label}</div>
      <div className={cn("mt-1 font-bold tabular-nums", valueSize)}>{value}</div>
      {hint && <div className="text-xs opacity-70 mt-1">{hint}</div>}
    </div>
  );
}
