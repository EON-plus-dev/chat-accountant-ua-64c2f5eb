/**
 * KPIStrip — horizontal divided strip for uniform metrics (Stripe/Mercury/Linear pattern).
 *
 * Use when you have 4–6 self-explanatory metrics with no drill-down (e.g., Fin-Monitoring totals).
 * Visual: single bordered container with vertical dividers between cells; ~56–64px tall.
 *
 * Mobile strategy: snap-scroll horizontally with `overflow-x-auto snap-x snap-mandatory`
 * and `min-w-[140px]` per cell so labels never truncate awkwardly (Stripe Atlas pattern).
 *
 * For grid-of-cards layouts use UniversalKPICard with `density="compact"` instead.
 */

import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KPIStripItem {
  id: string;
  title: string;
  value: ReactNode;
  /** Optional 14px inline icon (no background tile). */
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
  /** Tiny annotation rendered under the value (e.g., "12 операцій"). Truncated. */
  hint?: string;
  onClick?: () => void;
}

interface KPIStripProps {
  items: KPIStripItem[];
  className?: string;
  ariaLabel?: string;
}

const dotByVariant: Record<NonNullable<KPIStripItem["variant"]>, string> = {
  default: "bg-muted-foreground/40 ring-1 ring-muted-foreground/20",
  success: "bg-emerald-500 ring-1 ring-emerald-500/30",
  warning: "bg-amber-500 ring-1 ring-amber-500/30",
  danger: "bg-red-500 ring-1 ring-red-500/30",
};

const iconToneByVariant: Record<NonNullable<KPIStripItem["variant"]>, string> = {
  default: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
};

export function KPIStrip({ items, className, ariaLabel }: KPIStripProps) {
  if (!items.length) return null;

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? "KPI"}
      className={cn(
        "rounded-md border border-border/70 bg-card",
        // Mobile: horizontal snap-scroll. Desktop (sm+): equal-width grid.
        "flex overflow-x-auto sm:grid sm:overflow-visible",
        "snap-x snap-mandatory sm:snap-none",
        // Dynamic columns based on item count, capped at 6 for readability.
        items.length === 2 && "sm:grid-cols-2",
        items.length === 3 && "sm:grid-cols-3",
        items.length === 4 && "sm:grid-cols-4",
        items.length === 5 && "sm:grid-cols-5",
        items.length >= 6 && "sm:grid-cols-6",
        className,
      )}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        const variant = item.variant ?? "default";
        const isClickable = !!item.onClick;
        return (
          <div
            key={item.id}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={item.onClick}
            onKeyDown={(e) => {
              if (isClickable && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                item.onClick?.();
              }
            }}
            className={cn(
              "flex flex-col justify-center gap-0.5 px-3 py-2.5 min-w-[140px] sm:min-w-0 shrink-0 sm:shrink",
              "snap-start",
              // Vertical divider between cells (skip first).
              idx > 0 && "border-l border-border/60",
              isClickable &&
                "cursor-pointer hover:bg-muted/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            )}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                aria-hidden
                className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotByVariant[variant])}
              />
              {Icon && (
                <Icon className={cn("w-3.5 h-3.5 shrink-0", iconToneByVariant[variant])} />
              )}
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium truncate">
                {item.title}
              </p>
            </div>
            <p className="font-bold tabular-nums tracking-tight text-base text-foreground truncate">
              {item.value}
            </p>
            {item.hint && (
              <p className="text-[10px] text-muted-foreground truncate">{item.hint}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
