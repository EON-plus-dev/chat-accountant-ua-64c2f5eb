import { useMemo } from "react";
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, Sparkles } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";
import { formatValue } from "@/lib/formatters";
import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import type { AnalyticsRisk } from "@/types/analyticsTypes";

interface ForecastViewProps {
  config: CabinetAnalyticsConfig;
  analyticsRisks: AnalyticsRisk[];
  onChatPromptInsert?: (prompt: string) => void;
}

/**
 * Спеціалізована панель: «Прогноз / Runway».
 * Будує проекцію кумулятивного balance на основі chartData (in / out
 * по днях/місяцях), визначає runway (день, коли balance перетинає 0)
 * та виводить ключові forecast-картки з конфігу.
 */
export const ForecastView = ({ config, analyticsRisks, onChatPromptInsert }: ForecastViewProps) => {
  const series = useMemo(() => {
    const data = config.chartData ?? [];
    if (data.length === 0) return [] as Array<{ label: string; balance: number; net: number }>;
    let running = 0;
    return data.map((p) => {
      const inflow = (p as { income?: number; in?: number }).income ?? (p as { in?: number }).in ?? 0;
      const outflow = (p as { expense?: number; expenses?: number; out?: number }).expense
        ?? (p as { expenses?: number }).expenses
        ?? (p as { out?: number }).out
        ?? 0;
      const net = inflow - outflow;
      running += net;
      return {
        label: (p as { label?: string; period?: string }).label ?? (p as { period?: string }).period ?? "",
        balance: Math.round(running),
        net: Math.round(net),
      };
    });
  }, [config.chartData]);

  const runway = useMemo(() => {
    if (series.length === 0) return null;
    const lastBalance = series[series.length - 1].balance;
    const avgNet = series.reduce((s, p) => s + p.net, 0) / series.length;
    const breakPoint = series.find((p) => p.balance < 0);
    return {
      lastBalance,
      avgNet: Math.round(avgNet),
      breakPoint: breakPoint?.label ?? null,
      tone: breakPoint ? "danger" : avgNet >= 0 ? "ok" : "warn",
    } as const;
  }, [series]);

  const upcomingRisks = useMemo(
    () => analyticsRisks.filter((r) => r.deadline).slice(0, 3),
    [analyticsRisks],
  );

  return (
    <div className="space-y-3">
      {/* Hero — runway summary */}
      {runway && (
        <div className="rounded-xl border bg-card p-4 md:p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                runway.tone === "danger" ? "bg-rose-500/10 text-rose-600" :
                runway.tone === "warn" ? "bg-amber-500/10 text-amber-600" :
                "bg-emerald-500/10 text-emerald-600",
              )}>
                {runway.tone === "ok" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Прогноз cash flow</div>
                <div className="text-sm font-semibold truncate">
                  {runway.breakPoint
                    ? `Кошти можуть закінчитися: ${runway.breakPoint}`
                    : runway.tone === "ok"
                      ? "Грошовий потік стабільний"
                      : "Потік від'ємний — слідкуйте за резервом"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <Stat label="Кінцевий баланс" value={formatValue(runway.lastBalance, "currency")} />
            <Stat label="Середній net/період" value={formatValue(runway.avgNet, "currency")} tone={runway.avgNet >= 0 ? "ok" : "danger"} />
            <Stat label="Точка обнулення" value={runway.breakPoint ?? "—"} tone={runway.breakPoint ? "danger" : "ok"} />
          </div>

          {series.length > 0 && (
            <div className="h-44 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                  <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(v: number) => formatValue(v, "currency")}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="Баланс"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Forecast cards from config */}
      {config.forecasts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {config.forecasts.slice(0, 4).map((f) => {
            const Icon = f.icon ?? Sparkles;
            const tone = f.status === "warning" ? "warn" : f.status === "positive" ? "ok" : "info";
            return (
              <div key={f.id} className="rounded-lg border bg-card p-3.5 flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                  tone === "warn" ? "bg-amber-500/10 text-amber-600" :
                  tone === "ok" ? "bg-emerald-500/10 text-emerald-600" :
                  "bg-sky-500/10 text-sky-600",
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">{f.title}</div>
                  <div className="text-base font-semibold tabular-nums truncate">
                    {typeof f.value === "number" ? formatValue(f.value, "currency") : f.value}
                  </div>
                  {f.description && (
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{f.description}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming deadlines */}
      {upcomingRisks.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Найближчі дедлайни, що впливають на потік</span>
          </div>
          <div className="space-y-2">
            {upcomingRisks.map((r) => (
              <div key={r.id} className="flex items-start gap-2 text-sm">
                <AlertTriangle className={cn(
                  "w-4 h-4 mt-0.5 shrink-0",
                  r.severity === "critical" ? "text-rose-500" : "text-amber-500",
                )} />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{r.title ?? r.text}</div>
                  <div className="text-xs text-muted-foreground">
                    до <span className="font-medium text-foreground">{r.deadline}</span>
                    {r.impact && <> · {r.impact}</>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {onChatPromptInsert && (
            <button
              type="button"
              onClick={() => onChatPromptInsert("Як підготуватися до найближчих дедлайнів і зберегти cash flow?")}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Запитати AI: план підготовки →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

function Stat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "ok" | "danger" }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn(
        "text-base font-semibold tabular-nums mt-0.5 truncate",
        tone === "ok" && "text-emerald-600 dark:text-emerald-400",
        tone === "danger" && "text-rose-600 dark:text-rose-400",
      )}>{value}</div>
    </div>
  );
}
