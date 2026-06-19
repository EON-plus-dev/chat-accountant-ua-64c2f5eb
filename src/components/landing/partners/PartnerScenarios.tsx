import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Users, Building2, Quote } from "lucide-react";

const scenarios = [
  {
    icon: User,
    name: "Solo",
    color: "border-border",
    who: "Приватний бухгалтер · 5 ФОП",
    yearly: "+42 000 ₴/рік",
    payback: "~2 міс",
    breakdown: "+1 клієнт × 12 + Reseller −25%",
  },
  {
    icon: Users,
    name: "Agency",
    color: "border-primary/40 bg-primary/5",
    who: "Бюро · 15 ФОП",
    yearly: "+211 000 ₴/рік",
    payback: "~1 міс",
    breakdown: "+4 клієнти × 12 + Reseller −30%",
    quote:
      "«За 4 місяці перестала засиджуватися до 22:00. Потім взяла 4 нових клієнтів — без зайвої години роботи»",
  },
  {
    icon: Building2,
    name: "Firm",
    color: "border-success/40 bg-success/5",
    who: "Бухгалтерська фірма · 50 ФОП",
    yearly: "+978 000 ₴/рік",
    payback: "<1 міс",
    breakdown: "+15 клієнтів × 12 + Reseller −35%",
  },
];

export const PartnerScenarios = () => (
  <section id="scenarios" className="py-12 md:py-16 scroll-mt-32">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Три типові профілі — три рівні вигоди
        </h2>
        <p className="text-muted-foreground">
          Числа за тією самою формулою, що й калькулятор. Реалізм 50% — консервативна оцінка.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.name} className={`p-5 h-full border-2 flex flex-col ${s.color}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">{s.name}</h3>
                </div>
                <Badge variant="outline">окуп. {s.payback}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{s.who}</p>
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{s.yearly}</div>
              <div className="text-[11px] text-muted-foreground">{s.breakdown}</div>

              {s.quote && (
                <div className="mt-4 pt-3 border-t border-primary/20">
                  <Quote className="h-3.5 w-3.5 text-primary mb-1" />
                  <p className="text-xs italic text-muted-foreground leading-relaxed">{s.quote}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  </section>
);
