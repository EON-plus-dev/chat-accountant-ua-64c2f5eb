import { Check, X, ArrowLeft, ArrowRight, Target, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useWizard, type BusinessType, type Employees, type Clients, type Priority } from "@/portal/hooks/useWizard";
import { cn } from "@/lib/utils";
import { CTA_CHECKOUT_URL } from "@/portal/constants";

const BUSINESS_TYPES: { value: BusinessType; emoji: string; label: string }[] = [
  { value: "trade", emoji: "🛒", label: "Торгівля" },
  { value: "it", emoji: "💻", label: "IT та послуги" },
  { value: "manufacturing", emoji: "🏭", label: "Виробництво" },
  { value: "restaurant", emoji: "🍕", label: "Ресторан" },
  { value: "construction", emoji: "🏗️", label: "Будівництво" },
  { value: "education", emoji: "📚", label: "Освіта" },
];

const EMPLOYEE_OPTIONS: { value: Employees; label: string }[] = [
  { value: "solo", label: "Тільки я" },
  { value: "small", label: "1–10 осіб" },
  { value: "large", label: "Більше 10 осіб" },
];

const CLIENT_OPTIONS: { value: Clients; label: string }[] = [
  { value: "individuals", label: "Фізичні особи" },
  { value: "businesses", label: "Юридичні особи" },
  { value: "both", label: "І ті, і інші" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "min-tax", label: "Мінімум податків" },
  { value: "simplicity", label: "Простота звітності" },
  { value: "scaling", label: "Масштабування" },
];

const fmt = (n: number) => Math.round(n).toLocaleString("uk-UA");

export const TaxWizard = () => {
  const w = useWizard();

  const ProgressPills = () => (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: w.totalSteps }, (_, i) => {
        const s = i + 1;
        const done = s < w.step;
        const active = s === w.step;
        return (
          <div
            key={s}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              done ? "bg-primary" : active ? "bg-primary" : "bg-muted"
            )}
          />
        );
      })}
    </div>
  );

  const SelectableCard = ({
    selected,
    onClick,
    children,
  }: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40"
      )}
    >
      {children}
    </button>
  );

  const renderStep = () => {
    switch (w.step) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Який тип вашого бізнесу?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BUSINESS_TYPES.map((bt) => (
                <SelectableCard
                  key={bt.value}
                  selected={w.state.businessType === bt.value}
                  onClick={() => w.setBusinessType(bt.value)}
                >
                  <span className="text-2xl">{bt.emoji}</span>
                  <p className="mt-1 font-medium text-sm">{bt.label}</p>
                </SelectableCard>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Очікуваний річний дохід?</h3>
            <p className="text-3xl font-mono font-bold text-primary text-center mb-6">
              {fmt(w.state.income)} ₴
            </p>
            <Slider
              min={0}
              max={10000000}
              step={100000}
              value={[w.state.income]}
              onValueChange={([v]) => w.setIncome(v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0 ₴</span>
              <span>10 000 000 ₴</span>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Чи плануєте наймати працівників?</h3>
            <div className="grid gap-3">
              {EMPLOYEE_OPTIONS.map((o) => (
                <SelectableCard key={o.value} selected={w.state.employees === o.value} onClick={() => w.setEmployees(o.value)}>
                  <p className="font-medium">{o.label}</p>
                </SelectableCard>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Хто ваші клієнти?</h3>
            <div className="grid gap-3">
              {CLIENT_OPTIONS.map((o) => (
                <SelectableCard key={o.value} selected={w.state.clients === o.value} onClick={() => w.setClients(o.value)}>
                  <p className="font-medium">{o.label}</p>
                </SelectableCard>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Що для вас важливіше?</h3>
            <div className="grid gap-3">
              {PRIORITY_OPTIONS.map((o) => (
                <SelectableCard key={o.value} selected={w.state.priority === o.value} onClick={() => w.setPriority(o.value)}>
                  <p className="font-medium">{o.label}</p>
                </SelectableCard>
              ))}
            </div>
          </div>
        );
      case 6:
        if (!w.result) return null;
        return (
          <div className="space-y-6">
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">🎯 Рекомендація: {w.result.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{w.result.reason}</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Переваги</p>
                  {w.result.pros.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-destructive uppercase tracking-wide">Недоліки</p>
                  {w.result.cons.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-5">
              <p className="text-sm font-medium">
                При доході {fmt(w.result.monthlyIncome)} ₴/міс: податок {fmt(w.result.monthlyTax)} ₴ + ЄСВ{" "}
                {fmt(w.result.monthlyEsv)} ₴ ={" "}
                <span className="font-bold text-primary">{fmt(w.result.monthlyTotal)} ₴/міс</span>
              </p>
            </div>

            <p className="text-xs text-muted-foreground">💡 {w.result.alternatives}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" asChild>
                <Link to="/articles/fop-2026-povnyy-gayd">Читати гайд по ФОП →</Link>
              </Button>
              <Button asChild>
                <Link to={CTA_CHECKOUT_URL}>Автоматизувати у fintodo →</Link>
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={w.restart} className="gap-1">
              <RotateCcw className="h-3.5 w-3.5" /> Почати заново
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">🧭 Майстер вибору системи оподаткування</h2>
      <Card>
        <CardContent className="pt-6">
          {w.step <= w.totalSteps && (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">
                  Крок {w.step} з {w.totalSteps}
                </p>
              </div>
              <ProgressPills />
            </>
          )}

          <div className="min-h-[260px]">{renderStep()}</div>

          {w.step <= w.totalSteps && (
            <div className="flex justify-between mt-6">
              {w.step > 1 ? (
                <Button variant="ghost" onClick={w.back} className="gap-1">
                  <ArrowLeft className="h-4 w-4" /> Назад
                </Button>
              ) : (
                <div />
              )}
              {w.step < w.totalSteps ? (
                <Button onClick={w.next} disabled={!w.canNext} className="gap-1">
                  Далі <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={w.showResult} disabled={!w.canNext} className="gap-1">
                  Показати результат <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
