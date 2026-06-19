import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CheckCircle2, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubFlowStore } from "@/personal/subscriptions/subFlowStore";
import { useSubsStore } from "@/personal/subscriptions/subscriptionsStore";
import { getSubscriptionsForCabinet } from "@/personal/subscriptions/personalSubscriptionsMock";
import { fmtUah } from "@/components/cabinets/orders/_primitives";

type Step = "reason" | "alternative" | "confirm" | "done";

const REASONS = [
  { id: "expensive", label: "Дорого" },
  { id: "unused", label: "Не користуюсь" },
  { id: "alt", label: "Знайшов альтернативу" },
  { id: "other", label: "Інше" },
];

export function CancellationWizard() {
  const { kind, subscriptionId, cabinetId, close } = useSubFlowStore();
  const cancel = useSubsStore((s) => s.cancel);
  const pause = useSubsStore((s) => s.pause);
  const { toast } = useToast();

  const sub = useMemo(() => {
    if (!cabinetId || !subscriptionId) return null;
    return getSubscriptionsForCabinet(cabinetId).find((s) => s.id === subscriptionId);
  }, [cabinetId, subscriptionId]);

  const [step, setStep] = useState<Step>("reason");
  const [reason, setReason] = useState("expensive");

  const open = kind === "cancel" && !!sub;

  const handleClose = (v: boolean) => {
    if (!v) { close(); setTimeout(() => setStep("reason"), 300); }
  };

  if (!sub) return null;

  const handlePause = () => {
    pause(sub.id);
    toast({ title: "Призупинено", description: `${sub.name} — до наступного періоду` });
    handleClose(false);
  };

  const handleCancel = () => {
    cancel(sub.id);
    setStep("done");
    toast({ title: "Скасовано", description: `${sub.name} — діятиме до ${sub.nextChargeAt}` });
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            {step !== "reason" && step !== "done" && (
              <Button variant="ghost" size="icon" className="h-6 w-6 -ml-2"
                onClick={() => setStep(step === "confirm" ? "alternative" : "reason")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            Скасування підписки
          </SheetTitle>
          <SheetDescription className="line-clamp-1">{sub.name}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === "reason" && (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Чому скасовуєте?
              </div>
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
                {REASONS.map((r) => (
                  <Card key={r.id} className="p-3 cursor-pointer" onClick={() => setReason(r.id)}>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <RadioGroupItem value={r.id} />
                      <span className="text-sm">{r.label}</span>
                    </label>
                  </Card>
                ))}
              </RadioGroup>
            </div>
          )}

          {step === "alternative" && (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Можливо, інший варіант?
              </div>
              <Card className="p-3 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start gap-3">
                  <Pause className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Призупинити на 1 місяць</div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Підписка автоматично поновиться, не списуватиметься {fmtUah(sub.amountUah)}.
                    </p>
                    <Button size="sm" variant="outline" className="h-7 text-xs mt-2"
                      onClick={handlePause}>Призупинити</Button>
                  </div>
                </div>
              </Card>
              <div className="text-xs text-muted-foreground text-center">або</div>
              <Button variant="outline" className="w-full" onClick={() => setStep("confirm")}>
                Все одно скасувати
              </Button>
            </div>
          )}

          {step === "confirm" && (
            <Card className="p-4 border-rose-500/30 bg-rose-500/5 space-y-2">
              <div className="text-sm font-medium">Підтвердіть скасування</div>
              <p className="text-xs text-muted-foreground">
                Підписка «{sub.name}» діятиме до <strong>{sub.nextChargeAt}</strong>.
                Списання {fmtUah(sub.amountUah)} припиниться.
              </p>
            </Card>
          )}

          {step === "done" && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <div className="text-lg font-semibold">Скасовано</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Діє до {sub.nextChargeAt}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-5">
          {step === "reason" && <Button className="w-full" onClick={() => setStep("alternative")}>Далі</Button>}
          {step === "confirm" && (
            <Button className="w-full" variant="destructive" onClick={handleCancel}>
              Скасувати підписку
            </Button>
          )}
          {step === "done" && <Button className="w-full" onClick={() => handleClose(false)}>Готово</Button>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
