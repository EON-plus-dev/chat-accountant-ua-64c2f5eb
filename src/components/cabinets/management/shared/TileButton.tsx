import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TileTone =
  | "violet"
  | "emerald"
  | "blue"
  | "rose"
  | "indigo"
  | "amber"
  | "sky";

export const TILE_TONE: Record<TileTone, { iconBg: string; iconColor: string }> = {
  violet:  { iconBg: "bg-violet-50 dark:bg-violet-500/10",   iconColor: "text-violet-600 dark:text-violet-300" },
  emerald: { iconBg: "bg-emerald-50 dark:bg-emerald-500/10", iconColor: "text-emerald-600 dark:text-emerald-300" },
  blue:    { iconBg: "bg-blue-50 dark:bg-blue-500/10",       iconColor: "text-blue-600 dark:text-blue-300" },
  rose:    { iconBg: "bg-rose-50 dark:bg-rose-500/10",       iconColor: "text-rose-600 dark:text-rose-300" },
  indigo:  { iconBg: "bg-indigo-50 dark:bg-indigo-500/10",   iconColor: "text-indigo-600 dark:text-indigo-300" },
  amber:   { iconBg: "bg-amber-50 dark:bg-amber-500/10",     iconColor: "text-amber-600 dark:text-amber-300" },
  sky:     { iconBg: "bg-sky-50 dark:bg-sky-500/10",         iconColor: "text-sky-600 dark:text-sky-300" },
};

export const ALERT_RE = /(завтра|завершується|потребує|сьогодні|протерміновано|прострочен|дедлайн)/i;

export interface LauncherTileItem {
  id: string;
  label: string;
  icon: LucideIcon;
  metric: string;
  sub?: string;
}

interface Props {
  tile: LauncherTileItem;
  tone: TileTone;
  onClick: () => void;
}

export function TileButton({ tile, tone, onClick }: Props) {
  const t = TILE_TONE[tone];
  const Icon = tile.icon;
  const showAlert = tile.sub && ALERT_RE.test(tile.sub);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative text-left rounded-xl bg-card p-3 md:p-4",
        "h-[88px] md:h-[104px]",
        "border border-border/60 hover:border-foreground/20",
        "transition-all duration-150 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "flex flex-col justify-between",
      )}
    >
      {showAlert && (
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 leading-none">
          {tile.sub}
        </span>
      )}
      <div className="flex items-center gap-2 min-w-0">
        <div className={cn("w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0", t.iconBg)}>
          <Icon className={cn("w-4 h-4", t.iconColor)} />
        </div>
        <div className="text-sm font-medium truncate">{tile.label}</div>
      </div>
      <div className="text-xs md:text-sm text-muted-foreground truncate tabular-nums">
        {tile.metric}
      </div>
    </button>
  );
}
