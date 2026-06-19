/**
 * CrmHealthScoreBadge — компактний бейдж 0..100 з кольоровою зоною
 * та tooltip-розгорткою драйверів (за патерном
 * `mem://analytics/health-score-actionability-standards`).
 */

import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { CrmHealthScore } from "../types";

interface Props {
  health: CrmHealthScore;
  className?: string;
}

const LEVEL_CLASS: Record<string, string> = {
  high: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  low: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  critical: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

export function CrmHealthScoreBadge({ health, className }: Props) {
  const score = Math.round(health.score);
  const sortedDrivers = [...health.drivers].sort((a, b) => a.score - b.score);
  const primary = sortedDrivers[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none transition-colors hover:opacity-90",
            LEVEL_CLASS[health.level] ?? LEVEL_CLASS.medium,
            className,
          )}
          aria-label={`Health-score ${score} з 100`}
        >
          <Heart className="h-3 w-3" />
          {score}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold">Health-score</div>
          <Badge variant="outline" className="text-[10px] capitalize">{health.level}</Badge>
        </div>
        {primary && (
          <div className="mb-2 text-[11px] text-muted-foreground">
            Головний драйвер: <span className="font-medium text-foreground">{primary.label}</span> · {Math.round(primary.score)}/100
          </div>
        )}
        <div className="space-y-2">
          {sortedDrivers.map((d) => (
            <div key={d.id}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="tabular-nums">{Math.round(d.score)} · ваг. {d.weight}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    d.score >= 75 ? "bg-emerald-500" : d.score >= 55 ? "bg-amber-500" : d.score >= 35 ? "bg-orange-500" : "bg-red-500",
                  )}
                  style={{ width: `${Math.max(4, Math.min(100, d.score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
