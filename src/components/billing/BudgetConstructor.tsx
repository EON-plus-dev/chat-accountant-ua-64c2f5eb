import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calculator, Sparkles, ArrowRight } from "lucide-react";
import {
  OPERATION_CATALOG,
  OPERATION_GROUP_LABELS,
  type OperationDef,
  type OperationGroup,
} from "@/config/operationCatalog";
import { PLAN_LIST, getPlan, type PlanId } from "@/config/billingModel";

type Frequency = "off" | "monthly" | "weekly" | "daily";

interface RowConfig {
  frequency: Frequency;
  count: number;
}

const FREQ_PER_MONTH: Record<Frequency, number> = {
  off: 0,
  monthly: 1,
  weekly: 4.33,
  daily: 30.42,
};

const FREQ_LABEL: Record<Frequency, string> = {
  off: "Вимкнено",
  monthly: "Раз/міс",
  weekly: "Щотижня",
  daily: "Щодня",
};

// Curated subset shown by default — configurable + most common AI ops
const DEFAULT_OP_IDS = [
  "bank_sync",
  "edr_monitoring",
  "counterparty_risk",
  "vat_payer_check",
  "recognize_check",
  "recognize_invoice",
  "auto_categorization",
  "ai_consultation",
  "ai_chat_short",
  "report_1df",
  "audit_ai_readiness",
  "tax_calculation",
];

interface BudgetConstructorProps {
  currentPlanId?: PlanId | string;
}

export const BudgetConstructor = ({ currentPlanId = "smart" }: BudgetConstructorProps) => {
  const navigate = useNavigate();
  const plan = getPlan(currentPlanId);

  const initialOps = useMemo(
    () => DEFAULT_OP_IDS.map((id) => OPERATION_CATALOG[id]).filter(Boolean) as OperationDef[],
    [],
  );

  const [config, setConfig] = useState<Record<string, RowConfig>>(() =>
    initialOps.reduce<Record<string, RowConfig>>((acc, op) => {
      acc[op.id] = { frequency: "monthly", count: 1 };
      return acc;
    }, {}),
  );

  const totals = useMemo(() => {
    let monthlyCredits = 0;
    initialOps.forEach((op) => {
      const cfg = config[op.id];
      if (!cfg || cfg.frequency === "off") return;
      monthlyCredits += op.estimatedCredits * cfg.count * FREQ_PER_MONTH[cfg.frequency];
    });
    monthlyCredits = Math.ceil(monthlyCredits);

    const includedMonthly =
      plan.includedKind === "monthly" ? plan.includedCredits : plan.includedCredits * 30.42;

    const overage = Math.max(0, monthlyCredits - includedMonthly);
    const overageCostUah = overage / plan.topUpRatePerUah;

    // Suggest cheapest plan that covers it
    let recommended = plan;
    for (const p of PLAN_LIST) {
      const inc = p.includedKind === "monthly" ? p.includedCredits : p.includedCredits * 30.42;
      if (inc >= monthlyCredits) {
        recommended = p;
        break;
      }
      recommended = p;
    }

    return {
      monthlyCredits,
      includedMonthly: Math.round(includedMonthly),
      overage: Math.ceil(overage),
      overageCostUah: Math.ceil(overageCostUah),
      recommended,
    };
  }, [config, initialOps, plan]);

  const grouped = useMemo(() => {
    const map = new Map<OperationGroup, OperationDef[]>();
    initialOps.forEach((op) => {
      if (!map.has(op.group)) map.set(op.group, []);
      map.get(op.group)!.push(op);
    });
    return Array.from(map.entries());
  }, [initialOps]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Калькулятор бюджету</CardTitle>
          </div>
          <Badge variant="secondary">
            Тариф: {plan.label} · 1 ₴ = {plan.topUpRatePerUah} кр.
          </Badge>
        </div>
        <CardDescription>
          Оцініть, скільки кредитів вам потрібно на місяць, і визначте оптимальний тариф або суму
          поповнення.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {grouped.map(([group, ops]) => (
          <div key={group} className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">
              {OPERATION_GROUP_LABELS[group]}
            </h4>
            <div className="space-y-2">
              {ops.map((op) => {
                const cfg = config[op.id];
                const monthly =
                  cfg.frequency === "off"
                    ? 0
                    : Math.ceil(op.estimatedCredits * cfg.count * FREQ_PER_MONTH[cfg.frequency]);
                return (
                  <div
                    key={op.id}
                    className="grid grid-cols-12 gap-2 items-center p-2 rounded-md hover:bg-muted/40"
                  >
                    <div className="col-span-12 md:col-span-5">
                      <p className="text-sm font-medium leading-tight">{op.label}</p>
                      <p className="text-xs text-muted-foreground">
                        ≈{op.estimatedCredits} кр./раз
                      </p>
                    </div>
                    <div className="col-span-5 md:col-span-3">
                      <Select
                        value={cfg.frequency}
                        onValueChange={(v) =>
                          setConfig((prev) => ({
                            ...prev,
                            [op.id]: { ...prev[op.id], frequency: v as Frequency },
                          }))
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(["off", "monthly", "weekly", "daily"] as Frequency[]).map((f) => (
                            <SelectItem key={f} value={f}>
                              {FREQ_LABEL[f]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      <Input
                        type="number"
                        min={0}
                        value={cfg.count}
                        disabled={cfg.frequency === "off"}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            [op.id]: { ...prev[op.id], count: Math.max(0, Number(e.target.value) || 0) },
                          }))
                        }
                        className="h-9 tabular-nums"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 text-right text-sm tabular-nums text-muted-foreground">
                      {monthly} кр./міс
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Прогноз на місяць:</span>
            <span className="text-xl font-bold tabular-nums">
              {totals.monthlyCredits.toLocaleString()} кр.
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>У вашому тарифі вже є:</span>
            <span className="tabular-nums">{totals.includedMonthly.toLocaleString()} кр./міс</span>
          </div>

          {totals.overage > 0 ? (
            <div className="rounded-md bg-warning/10 border border-warning/30 p-3 text-sm">
              <p className="font-medium">
                Понад пакет: {totals.overage.toLocaleString()} кр. ≈{" "}
                {totals.overageCostUah.toLocaleString()} ₴ докупівлі.
              </p>
              {totals.recommended.id !== plan.id && (
                <p className="mt-1 text-muted-foreground">
                  За цією конфігурацією вигідніше перейти на тариф{" "}
                  <strong>{totals.recommended.label}</strong> (
                  {totals.recommended.priceUah} ₴/міс).
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md bg-success/10 border border-success/30 p-3 text-sm">
              <Sparkles className="h-4 w-4 inline mr-1 text-success" />
              Вам вистачає пакету тарифу <strong>{plan.label}</strong>. Докупівля не потрібна.
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/top-up")}>
              Поповнити баланс
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button className="flex-1" onClick={() => navigate("/change-plan")}>
              Змінити тариф
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
