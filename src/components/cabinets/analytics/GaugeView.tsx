import { useMemo } from "react";
import { Gauge, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatValue } from "@/lib/formatters";
import { getFopLimitTone, getFopGroupLimit } from "@/config/fopGroupLimits";
import type { CabinetAnalyticsConfig } from "@/config/cabinetAnalyticsConfig";
import type { Cabinet } from "@/types/cabinet";

interface GaugeViewProps {
  cabinet: Cabinet;
  config: CabinetAnalyticsConfig;
  onChatPromptInsert?: (prompt: string) => void;
}

interface GaugeRow {
  id: string;
  label: string;
  hint: string;
  value: number;     // абсолютне значення
  total: number;     // ліміт
  unit: "currency" | "number";
}

const TONE_STYLES: Record<"ok" | "warn" | "danger", { bar: string; text: string; bg: string; icon: typeof Gauge }> = {
  ok:     { bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10",  icon: CheckCircle2 },
  warn:   { bar: "bg-amber-500",   text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-500/10",    icon: TrendingUp },
  danger: { bar: "bg-rose-500",    text: "text-rose-700 dark:text-rose-400",       bg: "bg-rose-500/10",     icon: AlertTriangle },
};

/**
 * Спеціалізована панель: «Ліміти». Показує великі прогрес-смуги по
 * ключових лімітах кабінету (наразі — річний дохід ФОП). Розширюється
 * при появі інших лімітів (готівка, обмеження по операціях тощо).
 */
export const GaugeView = ({ cabinet, config, onChatPromptInsert }: GaugeViewProps) => {
  const rows = useMemo<GaugeRow[]>(() => {
    const list: GaugeRow[] = [];

    // 1) Річний ліміт ФОП
    if (cabinet.type === "fop" && cabinet.fopGroup) {
      const total = getFopGroupLimit(cabinet.fopGroup as 1 | 2 | 3);
      const value = cabinet.yearlyIncome ?? 0;
      if (total) {
        list.push({
          id: "fop-yearly",
          label: `Річний ліміт ${cabinet.fopGroup}-ї групи`,
          hint: "ст. 291.4 ПКУ — кратно МЗП на 01.01.2026",
          value,
          total,
          unit: "currency",
        });
      }
    }

    // 2) Якщо в config є KPI з id "limit-usage" — додаємо як fallback
    const limitKpi = config.kpis.find((k) => k.id === "limit-usage");
    if (limitKpi && list.length === 0) {
      const percent = typeof limitKpi.value === "number" ? limitKpi.value : 0;
      list.push({
        id: "limit-generic",
        label: limitKpi.title,
        hint: limitKpi.description,
        value: percent,
        total: 100,
        unit: "number",
      });
    }

    return list;
  }, [cabinet, config.kpis]);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        Для цього кабінету ліміти не визначені.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const percent = row.total > 0 ? Math.min(100, Math.round((row.value / row.total) * 100)) : 0;
        const tone = getFopLimitTone(percent);
        const t = TONE_STYLES[tone];
        const ToneIcon = t.icon;
        const remaining = Math.max(0, row.total - row.value);

        return (
          <div key={row.id} className="rounded-xl border bg-card p-4 md:p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", t.bg, t.text)}>
                  <Gauge className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{row.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{row.hint}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={cn("text-2xl md:text-3xl font-semibold leading-none tabular-nums", t.text)}>
                  {percent}%
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">використано</div>
              </div>
            </div>

            {/* Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", t.bar)}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground tabular-nums">
                <span>{formatValue(row.value, row.unit)}</span>
                <span>з {formatValue(row.total, row.unit)}</span>
              </div>
            </div>

            {/* Status + actions */}
            <div className={cn("flex items-start gap-2 rounded-lg p-2.5", t.bg)}>
              <ToneIcon className={cn("h-4 w-4 mt-0.5 shrink-0", t.text)} />
              <div className="text-xs">
                {tone === "ok" && (
                  <span>Ви впевнено в межах ліміту. Залишок — {formatValue(remaining, row.unit)}.</span>
                )}
                {tone === "warn" && (
                  <span>
                    Уже використано {percent}%. Залишок — {formatValue(remaining, row.unit)}. Час планувати дії при наближенні до 80%.
                  </span>
                )}
                {tone === "danger" && (
                  <span>
                    Критично близько до ліміту: залишок лише {formatValue(remaining, row.unit)}. Розгляньте перехід на 3-у групу або призупинення нових надходжень.
                  </span>
                )}
              </div>
            </div>

            {onChatPromptInsert && tone !== "ok" && (
              <button
                type="button"
                onClick={() => onChatPromptInsert(`Що мені робити з лімітом «${row.label}»? Використано ${percent}%.`)}
                className="text-xs text-primary hover:underline"
              >
                Запитати AI: що робити далі →
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
