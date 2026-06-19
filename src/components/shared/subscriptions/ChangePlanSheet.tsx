import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubFlowStore } from "@/personal/subscriptions/subFlowStore";
import { useSubsStore } from "@/personal/subscriptions/subscriptionsStore";
import { getSubscriptionsForCabinet } from "@/personal/subscriptions/personalSubscriptionsMock";
import { fmtUah } from "@/components/cabinets/orders/_primitives";

interface MockPlan {
  name: string;
  priceUah: number;
  hint: string;
}

function makePlans(currentAmount: number): MockPlan[] {
  return [
    { name: "Basic", priceUah: Math.max(50, Math.round(currentAmount * 0.6)), hint: "Базовий доступ" },
    { name: "Standard", priceUah: currentAmount, hint: "Поточний тариф" },
    { name: "Premium", priceUah: Math.round(currentAmount * 1.5), hint: "Без реклами, 4K, до 4 пристроїв" },
  ];
}

export function ChangePlanSheet() {
  const { kind, subscriptionId, cabinetId, close } = useSubFlowStore();
  const changePlan = useSubsStore((s) => s.changePlan);
  const planOverride = useSubsStore((s) => s.planOverride);
  const { toast } = useToast();

  const sub = useMemo(() => {
    if (!cabinetId || !subscriptionId) return null;
    return getSubscriptionsForCabinet(cabinetId).find((s) => s.id === subscriptionId);
  }, [cabinetId, subscriptionId]);

  const plans = useMemo(() => (sub ? makePlans(sub.amountUah) : []), [sub]);
  const current = sub ? (planOverride[sub.id] ?? "Standard") : "Standard";
  const [selected, setSelected] = useState<string | null>(null);

  const open = kind === "changePlan" && !!sub;

  if (!sub) return null;

  const apply = () => {
    if (!selected) return;
    changePlan(sub.id, selected);
    toast({ title: "Тариф змінено", description: `${sub.name} → ${selected}` });
    close();
    setTimeout(() => setSelected(null), 300);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) { close(); setTimeout(() => setSelected(null), 300); } }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle>Змінити тариф</SheetTitle>
          <SheetDescription className="line-clamp-1">{sub.name}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {plans.map((p) => {
            const isCurrent = current === p.name;
            const isSelected = selected === p.name;
            return (
              <Card key={p.name}
                className={`p-3 cursor-pointer transition-colors ${isSelected ? "border-primary bg-primary/5" : ""}`}
                onClick={() => !isCurrent && setSelected(p.name)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{p.name}</span>
                      {isCurrent && <Badge variant="outline" className="text-[10px]">Поточний</Badge>}
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.hint}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold tabular-nums">{fmtUah(p.priceUah)}</div>
                    <div className="text-[10px] text-muted-foreground">/{sub.cadence === "month" ? "міс" : "рік"}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="border-t p-5">
          <Button className="w-full" onClick={apply} disabled={!selected}>
            Змінити тариф
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
