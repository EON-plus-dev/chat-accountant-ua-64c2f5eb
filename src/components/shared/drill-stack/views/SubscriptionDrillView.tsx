/**
 * SubscriptionDrillView — preview підписки + історія списань + дії.
 */

import { useMemo } from "react";
import { ExternalLink, ArrowRight, Pause, Settings2, X, CreditCard, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import { useToast } from "@/hooks/use-toast";
import { fmtUah, BrandLogo } from "@/components/cabinets/orders/_primitives";
import { getSubscriptionsForCabinet } from "@/personal/subscriptions/personalSubscriptionsMock";
import { enrichSubscription, subPaymentMethodLabel } from "@/personal/subscriptions/subscriptionEnrich";
import { useSubFlowStore } from "@/personal/subscriptions/subFlowStore";
import { useSubsStore } from "@/personal/subscriptions/subscriptionsStore";
import { upcomingChargesForSubscription, methodLabel, statusLabel } from "@/personal/payments/personalPaymentsBridge";
import { Card } from "@/components/ui/card";


interface Props {
  subscriptionId: string;
  cabinetId?: string;
  sourceLabel?: string;
  onOpenFullSubscriptions?: () => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  streaming: "Стрімінг",
  cloud: "Хмара",
  insurance: "Страхування",
  fitness: "Фітнес",
  telecom: "Телеком",
  gov: "Державні",
};

export function SubscriptionDrillView({ subscriptionId, cabinetId, sourceLabel, onOpenFullSubscriptions }: Props) {
  const { popAll } = useDrillStack();
  const { toast } = useToast();
  const openSubFlow = useSubFlowStore((s) => s.open);
  const pauseSub = useSubsStore((s) => s.pause);
  const statusOverride = useSubsStore((s) => s.statusOverride[subscriptionId]);


  const raw = useMemo(
    () => (cabinetId ? getSubscriptionsForCabinet(cabinetId).find((s) => s.id === subscriptionId) : undefined),
    [cabinetId, subscriptionId]
  );
  if (!raw) {
    return (
      <DrillSheet matchKind="subscription" matchId={subscriptionId} title="Підписка не знайдена" sourceLabel={sourceLabel}>
        <p className="text-sm text-muted-foreground">Запис {subscriptionId} відсутній.</p>
      </DrillSheet>
    );
  }
  const s = enrichSubscription(raw);
  const aiInsight =
    s.usageHint === "unused"
      ? "AI: підписка не використовується 3 місяці — варто скасувати."
      : s.usageHint === "low_use"
      ? "AI: низька активність — економія можлива."
      : "AI: ви активно користуєтесь цією підпискою.";

  return (
    <DrillSheet
      matchKind="subscription"
      matchId={subscriptionId}
      title={s.name}
      sourceLabel={sourceLabel}
      footer={
        onOpenFullSubscriptions ? (
          <Button size="sm" className="w-full" onClick={() => { popAll(); onOpenFullSubscriptions(); }}>
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Відкрити в «Підписки»
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <BrandLogo brand={s.name} size={44} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5 items-center">
              <Badge variant="outline" className="text-[10px]">{CATEGORY_LABEL[s.category]}</Badge>
              {s.isTrial && <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-700 border-violet-500/20">Trial</Badge>}
              {s.usageHint === "low_use" && <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20">Низька активність</Badge>}
              {s.usageHint === "unused" && <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-700 border-rose-500/20">Не використовується</Badge>}
            </div>
            <div className="text-base font-semibold tabular-nums mt-1">
              {fmtUah(s.amountUah)} <span className="text-xs font-normal text-muted-foreground">/{s.cadence === "month" ? "міс" : "рік"}</span>
            </div>
          </div>
        </div>

        <Separator />
        <div className="space-y-2 text-sm">
          <Row label="Наступне списання" value={s.nextChargeAt} />
          <Row label="Метод оплати" icon={CreditCard} value={`${subPaymentMethodLabel(s.paymentMethod)}${s.paymentMethod === "card" ? ` •••• ${s.paymentLast4}` : ""}`} />
          <Row label="Підключено з" value={s.startedAt} />
        </div>

        <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5 text-xs flex gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span>{aiInsight}</span>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1.5">Історія списань</div>
          <ul className="space-y-1 text-sm">
            {s.history.map((h, i) => (
              <li key={i} className="flex items-center justify-between gap-2 py-1 border-b last:border-0">
                <span className="text-xs tabular-nums">{h.date}</span>
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  {h.status === "ok" ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  ) : h.status === "failed" ? (
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                  )}
                  {h.status === "ok" ? "Списано" : h.status === "failed" ? "Помилка" : "Повернуто"}
                </span>
                <span className="text-xs font-medium tabular-nums w-16 text-right">{fmtUah(h.amountUah)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Майбутні списання (bridge у фінанси) */}
        {(() => {
          const isCancelled = statusOverride === "cancelled";
          const upcoming = upcomingChargesForSubscription(raw, isCancelled);
          if (upcoming.length === 0) {
            return isCancelled ? null : (
              <div className="text-xs text-muted-foreground">Майбутні списання не заплановані</div>
            );
          }
          return (
            <Card className="p-3 border-border/70 space-y-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Майбутні списання</div>
              {upcoming.map((p) => {
                const st = statusLabel(p.status);
                return (
                  <div key={p.id} className="flex items-center justify-between text-xs gap-2">
                    <span className="text-muted-foreground tabular-nums">{p.date}</span>
                    <span className="truncate flex-1 mx-2 text-[11px]">
                      {methodLabel(p.method)}{p.last4 ? ` •••• ${p.last4}` : ""}
                    </span>
                    <Badge variant="outline" className={`text-[9px] ${st.cls}`}>{st.label}</Badge>
                    <span className="font-medium tabular-nums w-16 text-right">{fmtUah(p.amountUah)}</span>
                  </div>
                );
              })}
            </Card>
          );
        })()}

        <Separator />
        {statusOverride === "cancelled" ? (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 inline mr-1.5" />
            Скасування заплановане на {s.nextChargeAt}.
          </div>
        ) : statusOverride === "paused" ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm flex items-center justify-between gap-2">
            <span><Pause className="w-4 h-4 inline mr-1.5 text-amber-600" />Призупинено</span>
            <Button size="sm" variant="outline" className="h-7 text-xs"
              onClick={() => { useSubsStore.getState().resume(s.id); toast({ title: "Поновлено" }); }}>
              Поновити
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs"
              onClick={() => { pauseSub(s.id); toast({ title: "Призупинено", description: `${s.name} — до наступного періоду` }); }}>
              <Pause className="w-3.5 h-3.5 mr-1" /> Пауза
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs"
              onClick={() => cabinetId && openSubFlow("changePlan", s.id, cabinetId)}>
              <Settings2 className="w-3.5 h-3.5 mr-1" /> Тариф
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs text-rose-600"
              onClick={() => cabinetId && openSubFlow("cancel", s.id, cabinetId)}>
              <X className="w-3.5 h-3.5 mr-1" /> Скасувати
            </Button>
          </div>
        )}
      </div>
    </DrillSheet>
  );

}

function Row({ icon: Icon, label, value }: { icon?: typeof CreditCard; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </span>
      <span className="text-right truncate font-medium">{value}</span>
    </div>
  );
}
