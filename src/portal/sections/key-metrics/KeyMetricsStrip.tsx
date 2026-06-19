import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { CURRENCY_RATES } from "@/portal/data/finder";
import { useScrollReveal } from "@/portal/hooks/useScrollReveal";
import { cn } from "@/lib/utils";

const usdRate = CURRENCY_RATES.rates.find((r) => r.currency === "USD");

const KEY_METRICS = [
  {
    value: "8 647 ₴",
    label: "Мінзарплата 2026",
    sub: "База для ЄСВ",
    href: "/analytics/indices",
  },
  {
    value: "1 902 ₴",
    label: "Мін. ЄСВ / міс",
    sub: "ФОП всіх груп",
    href: "/tools/esv",
    highlight: true,
    cta: "Розрахувати точно →",
  },
  {
    value: "18% + 5%",
    label: "ПДФО + Військовий збір",
    sub: "Ставки для фізичних осіб",
    href: "/taxes",
  },
  {
    value: usdRate ? `${usdRate.nbuRate.toFixed(2)} ₴` : "41.25 ₴",
    label: "Курс USD",
    sub: "НБУ сьогодні",
    href: "/analytics/currency",
  },
];

export const KeyMetricsStrip = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`py-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
    >
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Аналізуємо дані</h2>
          <p className="text-sm text-muted-foreground">Актуальні показники на 2026 рік</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {KEY_METRICS.map((metric) => (
            <Link key={metric.label} to={metric.href}>
              <Card
                className={cn(
                  "h-full transition-all hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5",
                  metric.highlight && "border-primary/40"
                )}
              >
                <CardContent className="p-4 space-y-1">
                  <p className={cn(
                    "text-xl font-bold tabular-nums",
                    metric.highlight ? "text-primary" : "text-foreground"
                  )}>
                    {metric.value}
                  </p>
                  <p className="text-sm font-medium text-foreground">{metric.label}</p>
                  <p className="text-xs text-muted-foreground">{metric.sub}</p>
                  {metric.cta && (
                    <p className="text-xs font-medium text-primary flex items-center gap-1 pt-1">
                      {metric.cta}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Актуальні показники · Оновлюється щодня →{" "}
          <Link to="/analytics" className="text-primary hover:underline">
            Вся аналітика
          </Link>
        </p>
      </div>
    </section>
  );
};
