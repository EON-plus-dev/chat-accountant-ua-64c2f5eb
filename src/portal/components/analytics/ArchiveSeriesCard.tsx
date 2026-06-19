import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/ui/Sparkline";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ArchiveSeriesPoint {
  period: string;
  value: number;
  isForecast?: boolean;
}

export interface ArchiveSeries {
  id: string;
  category: "currency" | "indices" | "key" | "forecast";
  label: string;
  unit?: string;
  source: string;
  sourceUrl?: string;
  points: ArchiveSeriesPoint[];
  note?: string;
  badge?: string;
}

const fmt = (v: number, unit?: string) => {
  const s = Math.abs(v) >= 1000 ? v.toLocaleString("uk-UA", { maximumFractionDigits: 2 }) : v.toFixed(Math.abs(v) < 100 ? 2 : 0);
  return unit ? `${s} ${unit}` : s;
};

export function ArchiveSeriesCard({ series }: { series: ArchiveSeries }) {
  const pts = series.points;
  if (pts.length < 2) return null;
  const first = pts[0];
  const last = pts[pts.length - 1];
  const delta = last.value - first.value;
  const deltaPct = first.value !== 0 ? (delta / Math.abs(first.value)) * 100 : 0;
  const trend: "up" | "down" | "stable" = Math.abs(delta) < 1e-9 ? "stable" : delta > 0 ? "up" : "down";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const sparkData = pts.map((p) => p.value);
  const hasForecast = pts.some((p) => p.isForecast);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground truncate">{series.label}</p>
              {series.badge && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{series.badge}</Badge>}
              {hasForecast && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">прогноз</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">{series.source} · {pts.length} точок</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base font-bold font-mono text-foreground tabular-nums">{fmt(last.value, series.unit)}</p>
            <div className={cn(
              "flex items-center justify-end gap-1 text-xs",
              trend === "up" ? "text-chart-2" : trend === "down" ? "text-destructive" : "text-muted-foreground"
            )}>
              <TrendIcon className="h-3 w-3" />
              <span className="tabular-nums">{delta > 0 ? "+" : ""}{deltaPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-md p-2">
          <Sparkline data={sparkData} width={320} height={48} color={trend === "down" ? "warning" : "success"} className="w-full" />
        </div>

        <details className="group">
          <summary className="text-xs text-primary cursor-pointer hover:underline">Показати таблицю значень</summary>
          <div className="mt-2 max-h-56 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr><th className="text-left py-1 font-normal">Період</th><th className="text-right py-1 font-normal">Значення</th></tr>
              </thead>
              <tbody>
                {pts.map((p, i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="py-1 text-foreground">
                      {p.period}
                      {p.isForecast && <span className="ml-1 text-[10px] text-muted-foreground">(прогноз)</span>}
                    </td>
                    <td className="py-1 text-right font-mono text-foreground tabular-nums">{fmt(p.value, series.unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {series.note && <p className="text-[11px] text-muted-foreground leading-relaxed">{series.note}</p>}

        {series.sourceUrl && (
          <a href={series.sourceUrl} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
            Джерело <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
