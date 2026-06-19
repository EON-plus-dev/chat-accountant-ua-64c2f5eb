/**
 * SalesPurchasesPolicySection — спільна секція налаштувань для каналів,
 * approval-правил, знижок і бюджетів закупок. Підключається в Settings
 * салону (і пізніше — TOV). Один Policy Engine, не дві форми.
 */

import { useState } from "react";
import { Plus, Trash2, ShieldCheck, Percent, Truck, ToggleLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import {
  readPolicies,
  writePolicies,
} from "@/modules/orders/store/useOrdersStore";
import type { OrderPolicy } from "@/modules/orders/types";

const TYPE_LABEL: Record<OrderPolicy["type"], string> = {
  approval: "Затвердження",
  discount_limit: "Ліміт знижки",
  supplier_default: "Дефолтний постачальник",
  stock_threshold: "Поріг залишку",
};

const TYPE_ICON: Record<OrderPolicy["type"], React.ElementType> = {
  approval: ShieldCheck,
  discount_limit: Percent,
  supplier_default: Truck,
  stock_threshold: ToggleLeft,
};

const SCOPE_LABEL: Record<OrderPolicy["scope"], string> = {
  sale: "Продажі",
  purchase: "Закупки",
  both: "Обидва",
};

export function SalesPurchasesPolicySection({ cabinet }: { cabinet: Cabinet }) {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<OrderPolicy[]>(() => readPolicies(cabinet.id));
  const [budget, setBudget] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(`purchases-budget-${cabinet.id}`);
      return raw ? Number(raw) : 120000;
    } catch {
      return 120000;
    }
  });

  const persist = (next: OrderPolicy[]) => {
    setPolicies(next);
    writePolicies(cabinet.id, next);
  };

  const togglePolicy = (id: string) => {
    persist(policies.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  const removePolicy = (id: string) => {
    persist(policies.filter((p) => p.id !== id));
    toast({ title: "Правило вилучено" });
  };

  const saveBudget = () => {
    try {
      localStorage.setItem(`purchases-budget-${cabinet.id}`, String(budget));
      toast({ title: "Бюджет збережено", description: `${budget.toLocaleString("uk-UA")} ₴/міс` });
    } catch {/* */}
  };

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h3 className="text-base font-semibold">Продажі і закупки</h3>
        <p className="text-xs text-muted-foreground">
          Єдиний движок правил: затвердження, ліміти знижок, дефолтні постачальники, пороги залишку. Канали і бюджет — нижче.
        </p>
      </header>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Правила (Policy Engine)</h4>
              <p className="text-[11px] text-muted-foreground">Спрацьовують автоматично при створенні/підтвердженні Order.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Додавання правил буде в UI-Builder після MVP" })} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Нове правило
            </Button>
          </div>
          <div className="rounded-md border bg-card divide-y">
            {policies.map((p) => {
              const Icon = TYPE_ICON[p.type];
              return (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium truncate">{p.label}</span>
                      <Badge variant="outline" className="text-[9px]">{TYPE_LABEL[p.type]}</Badge>
                      <Badge variant="outline" className="text-[9px]">{SCOPE_LABEL[p.scope]}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {p.condition.field} {p.condition.op} {String(p.condition.value)}
                      {p.action.approverRole && ` → ${p.action.approverRole} (${p.slaHours ?? "?"}год SLA)`}
                      {p.action.maxDiscountPct != null && ` → макс ${p.action.maxDiscountPct}%`}
                      {p.action.reorderToQty != null && ` → замовити до ${p.action.reorderToQty} од`}
                    </p>
                  </div>
                  <Switch checked={p.enabled} onCheckedChange={() => togglePolicy(p.id)} />
                  <Button variant="ghost" size="icon" onClick={() => removePolicy(p.id)} className="h-7 w-7 text-muted-foreground">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
            {policies.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">Правил немає. Додайте перше.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h4 className="text-sm font-medium">Канали продажів</h4>
          <p className="text-[11px] text-muted-foreground">
            Які канали показувати у звітах. Канал записується в Order.channel при створенні.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { id: "retail_prro", label: "Каса / ПРРО", on: true },
              { id: "b2b", label: "B2B-рахунок", on: true },
              { id: "online", label: "Онлайн", on: true },
              { id: "upsell_visit", label: "Допродаж на візиті", on: true },
              { id: "marketplace", label: "Маркетплейс", on: false },
            ].map((c) => (
              <label key={c.id} className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 cursor-pointer">
                <span className="text-sm">{c.label}</span>
                <Switch defaultChecked={c.on} />
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h4 className="text-sm font-medium">Бюджет закупок</h4>
          <p className="text-[11px] text-muted-foreground">
            Місячний бюджет — показується у Закупках як KPI «vs план».
          </p>
          <div className="flex items-end gap-2">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="budget" className="text-xs">Місячний бюджет, ₴</Label>
              <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value) || 0)} className="h-9 mt-1" />
            </div>
            <Button size="sm" onClick={saveBudget}>Зберегти</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h4 className="text-sm font-medium">Мульти-валютність закупок</h4>
          <p className="text-[11px] text-muted-foreground">
            Дефолтна валюта для нових закупівель — UAH. Закупки в EUR/USD конвертуються в грн за курсом НБУ на дату підтвердження ордера. Курс фіксується в Order.fxRate і не змінюється після confirmedAt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
