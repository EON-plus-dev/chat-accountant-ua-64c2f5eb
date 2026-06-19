import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/ui/Sparkline";
import { Badge } from "@/components/ui/badge";
import { KEY_FIGURES_HISTORY } from "@/portal/data/indicesMethodology";

export function KeyFiguresHistory() {
  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">📈 Ключові цифри: історія змін</h2>
        <p className="text-sm text-muted-foreground">
          Динаміка основних фінансових показників України за 2022–2026 роки
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KEY_FIGURES_HISTORY.map((fig) => {
          const sparkData = fig.years.map((y) => y.value);

          return (
            <Card key={fig.id}>
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{fig.name}</p>
                    <p className="text-xl font-bold font-mono text-foreground">{fig.currentValue}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Sparkline data={sparkData} width={72} height={28} color="primary" />
                    <Badge
                      variant={fig.totalGrowth.includes("+") ? "default" : "secondary"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {fig.totalGrowth}
                    </Badge>
                  </div>
                </div>

                {/* Year timeline */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {fig.years.map((y, i) => (
                      <div key={y.year} className="flex items-center gap-1 shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">{y.year}</p>
                          <p className={`text-[11px] font-mono ${i === fig.years.length - 1 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                            {y.label}
                          </p>
                        </div>
                        {i < fig.years.length - 1 && (
                          <span className="text-muted-foreground/40 text-[10px]">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Impact */}
                <div className="pt-2 border-t border-border/50 space-y-1">
                  <p className="text-xs text-muted-foreground leading-relaxed">{fig.impact}</p>
                  <p className="text-[10px] text-muted-foreground/70">{fig.legalBasis}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
