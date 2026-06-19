import { useState, useMemo } from "react";
import { Sparkles, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import type { HealthScoreResult, HealthGrade, AnalyticsRisk } from "@/types/analyticsTypes";
import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import type { Cabinet } from "@/types/cabinet";
import { formatValue } from "@/lib/formatters";
import { useIsMobile } from "@/hooks/use-mobile";

interface HealthBriefingWidgetProps {
  healthScore: HealthScoreResult;
  config: CabinetAnalyticsConfig;
  cabinet: Cabinet;
  risks?: AnalyticsRisk[];
  onChatPromptInsert?: (prompt: string) => void;
  freshnessText?: string;
  isStale?: boolean;
  onRefresh?: () => void;
  extraControls?: React.ReactNode;
}

const GRADE_CONFIG: Record<HealthGrade, { label: string; color: string; bg: string; ring: string; border: string }> = {
  excellent: { label: "Відмінно", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", ring: "stroke-emerald-500", border: "border-emerald-200 dark:border-emerald-800/40" },
  good: { label: "Добре", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", ring: "stroke-blue-500", border: "border-blue-200 dark:border-blue-800/40" },
  attention: { label: "Потребує уваги", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", ring: "stroke-amber-500", border: "border-amber-200 dark:border-amber-800/40" },
  critical: { label: "Критично", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", ring: "stroke-red-500", border: "border-red-200 dark:border-red-800/40" },
};


// --- Gauge Arc ---
function GaugeArc({ score, grade, size = 80 }: { score: number; grade: HealthGrade; size?: number }) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const gradeConfig = GRADE_CONFIG[grade];

  return (
    <svg
      width={size}
      height={size / 2 + 10}
      viewBox={`0 0 ${size} ${size / 2 + 10}`}
      className="block"
      role="img"
      aria-label={`Health Score: ${score} зі 100, стан: ${GRADE_CONFIG[grade].label}`}
    >
      <path
        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/20"
        strokeLinecap="round"
      />
      <path
        d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
        fill="none"
        strokeWidth={strokeWidth}
        className={gradeConfig.ring}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
      />
      <text
        x={size / 2}
        y={size / 2 - 2}
        textAnchor="middle"
        className={cn("fill-current font-bold", gradeConfig.color)}
        fontSize={size / 3.5}
      >
        {score}
      </text>
    </svg>
  );
}

// --- AI Insight generation ---
interface InsightResult {
  fact: string;
  risk: string;
  action: string;
}

function generateInsight(
  config: CabinetAnalyticsConfig,
  cabinet: Cabinet,
  risks: AnalyticsRisk[]
): InsightResult | null {
  if (risks.length > 0) {
    const topRisk = risks[0];
    const fact = topRisk.subtitle || topRisk.text;
    const riskText = topRisk.impact || topRisk.text;
    const actionText = topRisk.recommendedActions[0]?.label || "Перегляньте деталі ризику.";

    if (topRisk.severity === "critical") {
      return { fact: `${fact}.`, risk: `${riskText} — потребує негайної уваги.`, action: actionText };
    }
    if (topRisk.severity === "warning") {
      return { fact: `${fact}.`, risk: `${riskText} — варто звернути увагу.`, action: actionText };
    }
    return { fact: `${fact}.`, risk: "Немає критичних сигналів.", action: actionText };
  }

  const incomeKpi = config.kpis.find(k => ["income", "revenue", "total-income"].includes(k.id));
  if (incomeKpi?.trend?.direction === "up" && incomeKpi.trend.value >= 15) {
    return {
      fact: `Дохід зріс на ${incomeKpi.trend.value}% — стабільна динаміка.`,
      risk: `Зростання доходу може наблизити до ліміту ФОП — варто відстежувати.`,
      action: `Хороший момент для податкового планування та створення резерву.`,
    };
  }

  const cashflowForecast = config.forecasts.find(f => f.id === "forecast-cashflow");
  if (cashflowForecast && typeof cashflowForecast.value === "number" && cashflowForecast.value < 0) {
    return {
      fact: `Прогнозний дефіцит: ${formatValue(cashflowForecast.value, "currency")} наступного місяця.`,
      risk: `Без змін поточний тренд призведе до касового розриву.`,
      action: `Розгляньте збільшення доходу або скорочення витрат найближчим часом.`,
    };
  }

  return null;
}

// --- P3: Real trend with localStorage ---
const HEALTH_SCORE_STORAGE_KEY = "healthScore_prev";

function useTrendDelta(cabinetId: string, currentScore: number): { delta: number | null; label: string } {
  return useMemo(() => {
    const storageKey = `${HEALTH_SCORE_STORAGE_KEY}_${cabinetId}`;
    try {
      const raw = localStorage.getItem(storageKey);
      const prev = raw ? JSON.parse(raw) : null;
      const now = Date.now();

      // Save current score
      localStorage.setItem(storageKey, JSON.stringify({ score: currentScore, ts: now }));

      if (prev && typeof prev.score === "number" && typeof prev.ts === "number") {
        const ageMs = now - prev.ts;
        const ageHours = ageMs / (1000 * 60 * 60);
        // Only show delta if previous score is at least 1 hour old (avoid showing delta on rapid refreshes)
        if (ageHours >= 1) {
          const delta = currentScore - prev.score;
          if (delta === 0) return { delta: 0, label: "без змін" };
          const sign = delta > 0 ? "+" : "";
          const period = ageHours >= 168 ? "за тиждень" : ageHours >= 24 ? "за день" : "за сеанс";
          return { delta, label: `${sign}${delta} ${period}` };
        }
      }
    } catch {
      // localStorage unavailable
    }
    return { delta: null, label: "" };
  }, [cabinetId, currentScore]);
}

export function HealthBriefingWidget({ healthScore, config, cabinet, risks = [], onChatPromptInsert, freshnessText, isStale, onRefresh, extraControls }: HealthBriefingWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useIsMobile();
  const gradeConfig = GRADE_CONFIG[healthScore.grade];
  const insight = generateInsight(config, cabinet, risks);

  const TrendIcon = healthScore.trend === "up" ? TrendingUp : healthScore.trend === "down" ? TrendingDown : Minus;
  const trendColor = healthScore.trend === "up" ? "text-emerald-500" : healthScore.trend === "down" ? "text-red-500" : "text-muted-foreground";

  // P1: Primary driver — weakest pillar
  const primaryDriver = useMemo(() => {
    const sorted = [...healthScore.pillars].sort((a, b) => a.score - b.score);
    const weakest = sorted[0];
    if (!weakest || weakest.score >= 85) return null;
    const issue = weakest.issues[0];
    return { label: weakest.label, issue: issue || `${weakest.label}: ${weakest.score}/100` };
  }, [healthScore.pillars]);

  // Actionable checklist items from pillar issues matched to risks
  const actionableItems = useMemo(() => {
    const pillarCategoryMap: Record<string, string> = {
      compliance: "compliance",
      dataQuality: "data",
      financial: "finance",
      operational: "operations",
      growth: "finance",
    };

    return healthScore.pillars
      .flatMap(pillar => pillar.issues.map(issue => {
        const category = pillarCategoryMap[pillar.id] || "data";
        // Find matching risk by category or text similarity
        const matchedRisk = risks.find(r =>
          r.category === category && issue.toLowerCase().includes(r.text.toLowerCase().slice(0, 15))
        ) || risks.find(r => r.category === category);

        const action = matchedRisk?.recommendedActions[0];
        const severity = matchedRisk?.severity || (pillar.grade === "critical" ? "critical" : "warning");

        return {
          issue,
          severity,
          ctaLabel: action?.label || "Запитати AI",
          actionType: action?.actionType || "chat-prompt",
          actionPayload: action?.actionPayload || "",
        };
      }))
      .slice(0, 6);
  }, [healthScore.pillars, risks]);

  // P3: Real trend delta
  const { delta, label: deltaLabel } = useTrendDelta(cabinet.id, healthScore.total);

  return (
    <div className={cn("rounded-xl border p-4 transition-colors", gradeConfig.bg, gradeConfig.border)}>
      {/* Meta row: freshness + extra controls */}
      {(freshnessText || extraControls) && (
        <div className="flex items-center justify-end gap-2 mb-2 flex-wrap">
          {freshnessText && (
            <span className="text-xs text-muted-foreground">
              станом на {freshnessText}
              {isStale && onRefresh && (
                <button onClick={onRefresh} className="ml-1.5 text-warning hover:underline text-xs font-medium">
                  Оновити
                </button>
              )}
            </span>
          )}
          {extraControls}
        </div>
      )}
      {/* Main row: Gauge + Briefing text + Expand */}
      <div className="flex items-start gap-4">
        {/* Gauge */}
        <div className="flex-shrink-0">
          <GaugeArc score={healthScore.total} grade={healthScore.grade} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Grade label + trend + P1 primary driver */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("text-sm font-semibold", gradeConfig.color)}>{gradeConfig.label}</span>
              <TrendIcon className={cn("w-3.5 h-3.5", trendColor)} />
              {/* P3: Real delta badge */}
              {delta !== null && delta !== 0 && (
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  delta > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                )}>
                  {deltaLabel}
                </span>
              )}
              <span className="text-xs text-muted-foreground">Health Score</span>
            </div>
            {/* P1: Primary driver always visible */}
            {primaryDriver && (
              <p className="text-xs text-muted-foreground truncate">
                <span className="font-medium text-foreground/80">{primaryDriver.label}:</span>{" "}
                {primaryDriver.issue}
              </p>
            )}
          </div>

          {/* AI Briefing text */}
          {insight ? (
            <div className="space-y-0.5">
              <p className="text-sm text-foreground leading-relaxed">
                <Sparkles className="w-3.5 h-3.5 inline-block mr-1 text-primary/60" />
                {insight.fact}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.risk}</p>
              <p className="text-xs text-primary/80 leading-relaxed font-medium">{insight.action}</p>
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 inline-block mr-1 text-primary/60" />
              Критичних ризиків не виявлено. Операції в нормі.
            </p>
          )}

          {/* Toggle details */}
          {actionableItems.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-medium text-primary hover:underline transition-colors"
            >
              {expanded ? "Згорнути" : "Детальніше →"}
            </button>
          )}
        </div>
      </div>

      {/* Expanded: actionable checklist */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
          {actionableItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 min-h-[36px]">
              <span className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                item.severity === "critical" ? "bg-destructive" :
                item.severity === "warning" ? "bg-warning" : "bg-primary"
              )} />
              <span className="text-xs text-foreground flex-1">{item.issue}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 min-h-[44px] md:min-h-0 gap-1 text-primary px-2 flex-shrink-0"
                onClick={() => {
                  if (item.actionPayload && item.actionType === "chat-prompt" && onChatPromptInsert) {
                    onChatPromptInsert(item.actionPayload);
                  } else if (item.actionPayload && item.actionType === "scroll") {
                    const el = document.getElementById(item.actionPayload);
                    el?.scrollIntoView({ behavior: "smooth" });
                  } else if (onChatPromptInsert) {
                    onChatPromptInsert(`Як виправити: ${item.issue}?`);
                  }
                }}
              >
                {item.ctaLabel}
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {actionableItems.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Усі показники в нормі ✓</p>
          )}
        </div>
      )}
    </div>
  );
}
