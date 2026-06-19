import { useMemo } from "react";
import { Heart, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HealthScoreResult, HealthGrade } from "@/types/analyticsTypes";

interface HealthScoreViewProps {
  healthScore: HealthScoreResult;
  onChatPromptInsert?: (prompt: string) => void;
}

const GRADE_STYLES: Record<HealthGrade, { ring: string; text: string; bg: string; label: string }> = {
  excellent: { ring: "stroke-emerald-500", text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", label: "Відмінно" },
  good:      { ring: "stroke-sky-500",     text: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-500/10",     label: "Добре" },
  attention: { ring: "stroke-amber-500",   text: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10",   label: "Потребує уваги" },
  critical:  { ring: "stroke-rose-500",    text: "text-rose-600 dark:text-rose-400",       bg: "bg-rose-500/10",    label: "Критично" },
};

/**
 * Спеціалізована панель: «Health Score».
 * Великий circle-gauge для загального скору + breakdown по pillar-ах
 * з конкретними issues. На клік по pillar — пропозиція AI-промпта.
 */
export const HealthScoreView = ({ healthScore, onChatPromptInsert }: HealthScoreViewProps) => {
  const gradeStyle = GRADE_STYLES[healthScore.grade];
  const ranked = useMemo(
    () => [...healthScore.pillars].sort((a, b) => a.score - b.score),
    [healthScore.pillars],
  );

  // SVG circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (healthScore.total / 100) * circumference;

  return (
    <div className="space-y-3">
      {/* Hero — big score */}
      <div className="rounded-xl border bg-card p-4 md:p-5 flex flex-col md:flex-row items-center md:items-start gap-5">
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} className="stroke-muted" strokeWidth="10" fill="none" />
            <circle
              cx="70" cy="70" r={radius}
              className={cn("transition-all", gradeStyle.ring)}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={cn("text-4xl font-bold tabular-nums leading-none", gradeStyle.text)}>
              {healthScore.total}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">зі 100</div>
          </div>
        </div>

        <div className="flex-1 min-w-0 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Heart className={cn("w-4 h-4", gradeStyle.text)} />
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Health Score</span>
            <TrendBadge trend={healthScore.trend} />
          </div>
          <div className={cn("text-xl md:text-2xl font-semibold mt-1", gradeStyle.text)}>
            {gradeStyle.label}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Інтегральна оцінка стану кабінету за {healthScore.pillars.length} вимірами:
            відповідність, якість даних, фінанси, операції, зростання.
          </p>
          {onChatPromptInsert && (
            <button
              type="button"
              onClick={() => onChatPromptInsert("Поясни мій Health Score та що покращити в першу чергу")}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Запитати AI: що покращити насамперед →
            </button>
          )}
        </div>
      </div>

      {/* Pillars */}
      <div className="rounded-xl border bg-card divide-y divide-border/50 overflow-hidden">
        {ranked.map((p) => {
          const style = GRADE_STYLES[p.grade];
          return (
            <div key={p.id} className="p-3 md:p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{p.label}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", style.bg, style.text)}>
                      {style.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">вага {Math.round(p.weight * 100)}%</span>
                  </div>
                </div>
                <div className={cn("text-lg font-semibold tabular-nums shrink-0", style.text)}>
                  {p.score}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-2">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    p.grade === "excellent" ? "bg-emerald-500" :
                    p.grade === "good" ? "bg-sky-500" :
                    p.grade === "attention" ? "bg-amber-500" : "bg-rose-500",
                  )}
                  style={{ width: `${p.score}%` }}
                />
              </div>

              {p.issues.length > 0 && (
                <ul className="space-y-1 mt-2">
                  {p.issues.slice(0, 3).map((issue, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground/60" />
                      <span className="line-clamp-2">{issue}</span>
                    </li>
                  ))}
                </ul>
              )}

              {onChatPromptInsert && p.issues.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChatPromptInsert(`Як покращити показник «${p.label}» (зараз ${p.score}/100)?`)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  План покращення →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function TrendBadge({ trend }: { trend: "up" | "down" | "stable" }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const styles =
    trend === "up" ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" :
    trend === "down" ? "text-rose-600 dark:text-rose-400 bg-rose-500/10" :
    "text-muted-foreground bg-muted";
  const label = trend === "up" ? "зростає" : trend === "down" ? "знижується" : "стабільно";
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full", styles)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
