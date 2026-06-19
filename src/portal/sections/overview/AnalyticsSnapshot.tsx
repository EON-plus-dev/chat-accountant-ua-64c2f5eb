import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAudience } from "@/contexts/AudienceContext";
import { getKeyMetrics } from "@/portal/data/dailyDigest";
import { cn } from "@/lib/utils";

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const TREND_COLOR = {
  up: "text-destructive",
  down: "text-chart-2",
  stable: "text-muted-foreground",
};

export const AnalyticsSnapshot = () => {
  const { audience } = useAudience();
  const metrics = getKeyMetrics(audience);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Ринок сьогодні</h2>
        <Link to="/analytics" className="text-xs text-primary hover:underline flex items-center gap-1">
          Вся аналітика <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metrics.map(m => {
          const Icon = TREND_ICON[m.trend];
          return (
            <Link key={m.label} to={m.href}>
              <Card className="hover:shadow-[var(--shadow-lg)] transition-all h-full">
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                    <Icon className={cn("h-3.5 w-3.5", TREND_COLOR[m.trend])} />
                  </div>
                  <p className="text-lg font-bold tabular-nums text-foreground">{m.value}</p>
                  {m.delta && (
                    <p className={cn("text-[10px] font-medium truncate", TREND_COLOR[m.trend])}>
                      {m.delta}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground truncate">{m.sublabel}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
