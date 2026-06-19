import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type HubTone = "violet" | "emerald" | "blue" | "amber" | "sky" | "rose" | "indigo";

const toneMap: Record<HubTone, { bg: string; fg: string }> = {
  violet: { bg: "bg-violet-100 dark:bg-violet-500/15", fg: "text-violet-600 dark:text-violet-300" },
  emerald: { bg: "bg-emerald-100 dark:bg-emerald-500/15", fg: "text-emerald-600 dark:text-emerald-300" },
  blue: { bg: "bg-blue-100 dark:bg-blue-500/15", fg: "text-blue-600 dark:text-blue-300" },
  amber: { bg: "bg-amber-100 dark:bg-amber-500/15", fg: "text-amber-600 dark:text-amber-300" },
  sky: { bg: "bg-sky-100 dark:bg-sky-500/15", fg: "text-sky-600 dark:text-sky-300" },
  rose: { bg: "bg-rose-100 dark:bg-rose-500/15", fg: "text-rose-600 dark:text-rose-300" },
  indigo: { bg: "bg-indigo-100 dark:bg-indigo-500/15", fg: "text-indigo-600 dark:text-indigo-300" },
};

export interface HubCardItem {
  icon?: LucideIcon;
  label: string;
  value?: string;
  valueClassName?: string;
}

interface Props {
  icon: LucideIcon;
  tone: HubTone;
  title: string;
  description: string;
  items?: HubCardItem[];
  onClick?: () => void;
  footer?: React.ReactNode;
}

export function SettingsHubCard({ icon: Icon, tone, title, description, items, onClick, footer }: Props) {
  const t = toneMap[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-2xl border border-border/70 bg-card p-5",
        "shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]",
        "transition-all duration-200 hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", t.bg)}>
          <Icon className={cn("w-5 h-5", t.fg)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold leading-tight text-foreground">{title}</h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
          </div>
          <p className="text-sm text-muted-foreground leading-snug mt-1">{description}</p>
        </div>
      </div>

      {items && items.length > 0 && (
        <ul className="mt-4 divide-y divide-border/40 border-t border-border/40">
          {items.map((it, i) => {
            const ItIcon = it.icon;
            return (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex items-center gap-2 text-sm text-foreground/90 min-w-0">
                  {ItIcon && <ItIcon className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <span className="truncate">{it.label}</span>
                </span>
                {it.value && (
                  <span className={cn("text-sm font-medium shrink-0", it.valueClassName ?? "text-muted-foreground")}>
                    {it.value}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {footer && <div className="mt-3 pt-3 border-t border-border/40">{footer}</div>}
    </button>
  );
}
