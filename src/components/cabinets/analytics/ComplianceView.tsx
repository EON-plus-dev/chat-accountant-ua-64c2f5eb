import { useMemo } from "react";
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsRisk } from "@/types/analyticsTypes";

interface ComplianceViewProps {
  analyticsRisks: AnalyticsRisk[];
  onChatPromptInsert?: (prompt: string) => void;
}

/**
 * Спеціалізована панель: «Перевірки / Compliance».
 * Чек-лист зобов'язань — групує ризики категорій compliance/data/finance,
 * показує статус, дедлайни і пропонує дію.
 */
export const ComplianceView = ({ analyticsRisks, onChatPromptInsert }: ComplianceViewProps) => {
  const items = useMemo(() => {
    return analyticsRisks
      .filter((r) => r.category === "compliance" || r.category === "data" || r.category === "finance")
      .sort((a, b) => {
        const sevOrder = { critical: 0, warning: 1, info: 2 } as const;
        return sevOrder[a.severity] - sevOrder[b.severity] || a.priority - b.priority;
      });
  }, [analyticsRisks]);

  const stats = useMemo(() => {
    const total = items.length;
    const critical = items.filter((r) => r.severity === "critical").length;
    const warning = items.filter((r) => r.severity === "warning").length;
    const ok = Math.max(0, 8 - total); // умовний знаменник: 8 ключових зобов'язань
    return { total, critical, warning, ok };
  }, [items]);

  return (
    <div className="space-y-3">
      {/* Header summary */}
      <div className="rounded-xl border bg-card p-4 md:p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-pink-500/10 text-pink-600 dark:text-pink-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">Compliance чек-лист</div>
            <div className="text-xs text-muted-foreground">
              Звітність, дедлайни, дані — все, що уберігає від штрафів
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SummaryTile tone="danger" count={stats.critical} label="Критичні" icon={AlertTriangle} />
          <SummaryTile tone="warn" count={stats.warning} label="Попередження" icon={Clock} />
          <SummaryTile tone="ok" count={stats.ok} label="В нормі" icon={CheckCircle2} />
        </div>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
          <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Усі зобов'язання виконані
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            На цей момент критичних або прострочених позицій немає.
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card divide-y divide-border/50 overflow-hidden">
          {items.map((risk) => {
            const Icon = risk.icon ?? FileText;
            const tone =
              risk.severity === "critical" ? "danger" : risk.severity === "warning" ? "warn" : "info";
            const toneText =
              tone === "danger"
                ? "text-rose-600 dark:text-rose-400"
                : tone === "warn"
                ? "text-amber-600 dark:text-amber-400"
                : "text-sky-600 dark:text-sky-400";
            const toneBg =
              tone === "danger"
                ? "bg-rose-500/10"
                : tone === "warn"
                ? "bg-amber-500/10"
                : "bg-sky-500/10";

            const action = risk.recommendedActions?.[0];

            return (
              <div key={risk.id} className="p-3 md:p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", toneBg, toneText)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{risk.title ?? risk.text}</div>
                      {risk.subtitle && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{risk.subtitle}</div>
                      )}
                    </div>
                    {risk.deadline && (
                      <span className={cn("text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0", toneBg, toneText)}>
                        до {risk.deadline}
                      </span>
                    )}
                  </div>
                  {(risk.impact || risk.value) && (
                    <div className="text-xs text-muted-foreground mt-1.5">
                      {risk.value && <span className="font-medium text-foreground">{risk.value}</span>}
                      {risk.value && risk.impact && <span className="mx-1.5">·</span>}
                      {risk.impact}
                    </div>
                  )}
                  {action && onChatPromptInsert && action.actionType === "chat-prompt" && (
                    <button
                      type="button"
                      onClick={() => onChatPromptInsert(action.actionPayload)}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      {action.label} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function SummaryTile({
  tone,
  count,
  label,
  icon: Icon,
}: {
  tone: "danger" | "warn" | "ok";
  count: number;
  label: string;
  icon: typeof AlertTriangle;
}) {
  const styles =
    tone === "danger"
      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
      : tone === "warn"
      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  return (
    <div className={cn("rounded-lg p-3 flex flex-col items-start gap-1", styles)}>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[11px] uppercase tracking-wide font-medium">{label}</span>
      </div>
      <div className="text-2xl font-semibold tabular-nums leading-none">{count}</div>
    </div>
  );
}
