import { Card } from "@/components/ui/card";
import { getSubscriptionsForCabinet, getMonthlySubscriptionsTotal } from "@/personal/subscriptions/personalSubscriptionsMock";
import { AlertCircle } from "lucide-react";

const CATEGORY_LABEL = {
  streaming: "Стрімінг",
  cloud: "Хмара",
  insurance: "Страхування",
  fitness: "Фітнес",
  telecom: "Телеком",
  gov: "Державні",
} as const;

function fmt(n: number) {
  return new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(n) + " ₴";
}

export function SubscriptionsList({ cabinetId }: { cabinetId: string }) {
  const subs = getSubscriptionsForCabinet(cabinetId);
  const monthly = getMonthlySubscriptionsTotal(cabinetId);
  if (subs.length === 0) {
    return <p className="text-sm text-muted-foreground">Підписки не знайдено.</p>;
  }
  const lowUseCount = subs.filter((s) => s.usageHint === "low_use" || s.usageHint === "unused").length;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap p-3 rounded-lg bg-muted/40 border">
        <div>
          <div className="text-xs text-muted-foreground">Витрати на підписки (ефективні за міс.)</div>
          <div className="text-xl font-semibold mt-0.5">{fmt(monthly)}</div>
        </div>
        {lowUseCount > 0 && (
          <div className="text-xs flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            {lowUseCount} підписок з низькою активністю — можна скасувати
          </div>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {subs.map((s) => (
          <Card key={s.id} className="p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm truncate">{s.name}</span>
                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {CATEGORY_LABEL[s.category]}
                </span>
                {s.usageHint === "low_use" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    низька активність
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">наступне списання: {s.nextChargeAt}</div>
            </div>
            <div className="text-sm font-semibold whitespace-nowrap">
              {fmt(s.amountUah)}<span className="text-[11px] font-normal text-muted-foreground">/{s.cadence === "month" ? "міс" : "рік"}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
