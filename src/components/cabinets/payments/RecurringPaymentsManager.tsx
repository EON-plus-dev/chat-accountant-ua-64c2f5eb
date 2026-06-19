/**
 * RecurringPaymentsManager — drawer управління шаблонами регулярних платежів (Wave 3).
 *
 * Demo-stateful: тримаємо масив шаблонів локально, з ініціалізацією `demoRecurringTemplates`.
 * Toggle вкл/вимк, видалення, додавання з популярних пресетів.
 */

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  demoRecurringTemplates,
  recurrenceLabel,
  computeNextDate,
  POPULAR_TEMPLATE_PRESETS,
  type RecurringTemplate,
} from "@/config/recurringPaymentTemplates";

interface RecurringPaymentsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurringPaymentsManager({ open, onOpenChange }: RecurringPaymentsManagerProps) {
  const [templates, setTemplates] = useState<RecurringTemplate[]>(demoRecurringTemplates);

  const toggle = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
    );
    const tpl = templates.find((t) => t.id === id);
    if (tpl) {
      toast.success(tpl.active ? "Шаблон вимкнено" : "Шаблон увімкнено", {
        description: `${tpl.name} · ₴${tpl.amount.toLocaleString("uk-UA")} ${recurrenceLabel[tpl.period]}`,
      });
    }
  };

  const remove = (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (tpl) {
      toast.success(`Шаблон «${tpl.name}» видалено`);
    }
  };

  const addFromPreset = (presetIdx: number) => {
    const preset = POPULAR_TEMPLATE_PRESETS[presetIdx];
    const dayOfMonth = 5;
    const next: RecurringTemplate = {
      id: `rec-custom-${Date.now()}`,
      name: preset.label,
      amount: preset.amount,
      currency: "UAH",
      period: "monthly",
      dayOfMonth,
      category: preset.category,
      active: true,
      Icon: preset.Icon,
      nextDate: computeNextDate("monthly", dayOfMonth).toISOString().slice(0, 10),
    };
    setTemplates((prev) => [next, ...prev]);
    toast.success(`Шаблон «${preset.label}» додано`, {
      description: "Створено scheduled-платежі на наступні 3 місяці",
    });
  };

  const activeCount = templates.filter((t) => t.active).length;
  const monthlyTotal = templates
    .filter((t) => t.active && t.period === "monthly")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 py-4 border-b shrink-0">
          <SheetTitle>Регулярні платежі</SheetTitle>
          <SheetDescription>
            {activeCount} активних · ₴{monthlyTotal.toLocaleString("uk-UA")} щомісяця
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {/* Швидке додавання */}
            <section>
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">+ Додати з популярних</h4>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TEMPLATE_PRESETS.map((p, i) => {
                  const Icon = p.Icon;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => addFromPreset(i)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs hover:bg-accent transition-colors"
                    >
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      {p.label}
                      <Plus className="h-3 w-3 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </section>

            <Separator />

            {/* Список шаблонів */}
            <section>
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Усі шаблони</h4>
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Поки немає шаблонів. Додайте перший з популярних вище.
                </p>
              ) : (
                <ul className="space-y-2">
                  {templates.map((t) => {
                    const Icon = t.Icon;
                    const next = parseISO(t.nextDate);
                    return (
                      <li
                        key={t.id}
                        className={cn(
                          "border rounded-lg p-3 flex items-start gap-3 transition-colors",
                          t.active ? "border-border bg-card" : "border-dashed border-border bg-muted/30",
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center",
                          t.active ? "bg-primary/10" : "bg-muted",
                        )}>
                          <Icon className={cn("h-4 w-4", t.active ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-medium truncate", !t.active && "text-muted-foreground")}>
                              {t.name}
                            </span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                              {recurrenceLabel[t.period]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                            <span className="tabular-nums font-medium text-foreground">
                              ₴{t.amount.toLocaleString("uk-UA")}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              наступне: {format(next, "d MMM", { locale: uk })}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <Switch checked={t.active} onCheckedChange={() => toggle(t.id)} />
                          <button
                            type="button"
                            onClick={() => remove(t.id)}
                            className="text-muted-foreground hover:text-rose-600 transition-colors"
                            aria-label="Видалити"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </ScrollArea>

        <div className="px-5 py-3 border-t shrink-0 bg-muted/30">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            ℹ Шаблони автоматично породжують scheduled-платежі на наступні 3 місяці.
            Деталі — у календарі та прогнозі касового потоку.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
