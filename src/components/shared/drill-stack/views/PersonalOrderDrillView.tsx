/**
 * PersonalOrderDrillView — компактний перегляд PersonalOrder (purchase/service/booking)
 * для personal-кабінетів. Tabs: Деталі / Позиції / Оплата / Доставка.
 */

import { useMemo } from "react";
import { ExternalLink, ArrowRight, RotateCcw, LifeBuoy, Download, X, Package, CreditCard, Truck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import { useToast } from "@/hooks/use-toast";
import { fmtUah } from "@/components/cabinets/orders/_primitives";
import { getPersonalOrders } from "@/personal/orders/personalOrdersMock";
import { enrichOrder, paymentMethodLabel, deliveryStatusLabel } from "@/personal/orders/orderEnrich";
import { paymentForOrder, methodLabel, statusLabel, bookingCancellationFee } from "@/personal/payments/personalPaymentsBridge";
import { Card } from "@/components/ui/card";

interface Props {
  orderId: string;
  cabinetId?: string;
  sourceLabel?: string;
  onOpenFullOrders?: () => void;
}

const KIND_BADGE: Record<string, string> = {
  purchase: "Покупка",
  service: "Послуга",
  booking: "Бронювання",
};
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  scheduled: { label: "Заплановано", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30" },
  active: { label: "В дорозі", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  completed: { label: "Виконано", cls: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Скасовано", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30" },
};

export function PersonalOrderDrillView({ orderId, cabinetId, sourceLabel, onOpenFullOrders }: Props) {
  const { popAll } = useDrillStack();
  const { toast } = useToast();
  const raw = useMemo(
    () => (cabinetId ? getPersonalOrders(cabinetId).find((o) => o.id === orderId) : undefined),
    [cabinetId, orderId]
  );

  if (!raw) {
    return (
      <DrillSheet matchKind="personal-order" matchId={orderId} title="Замовлення не знайдено" sourceLabel={sourceLabel}>
        <p className="text-sm text-muted-foreground">Запис {orderId} відсутній.</p>
      </DrillSheet>
    );
  }
  const o = enrichOrder(raw);
  const status = STATUS_BADGE[o.status];

  const demoToast = (msg: string) =>
    toast({ title: "Демо-режим", description: msg });

  return (
    <DrillSheet
      matchKind="personal-order"
      matchId={orderId}
      title={o.title}
      sourceLabel={sourceLabel}
      footer={
        onOpenFullOrders ? (
          <Button size="sm" className="w-full" onClick={() => { popAll(); onOpenFullOrders(); }}>
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Відкрити в «Мої замовлення»
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">{KIND_BADGE[o.kind]}</Badge>
            <Badge variant="outline" className={`text-[10px] ${status.cls}`}>{status.label}</Badge>
            <span className="text-xs text-muted-foreground">{o.vendor}</span>
          </div>
          <div className="text-base font-semibold tabular-nums">
            {o.amountUah > 0 ? fmtUah(o.amountUah) : "—"}
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList className={`grid w-full ${o.kind === "purchase" ? "grid-cols-4" : "grid-cols-3"}`}>
            <TabsTrigger value="details" className="text-xs">Деталі</TabsTrigger>
            <TabsTrigger value="items" className="text-xs">Позиції</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">Оплата</TabsTrigger>
            {o.kind === "purchase" && <TabsTrigger value="delivery" className="text-xs">Доставка</TabsTrigger>}
          </TabsList>

          <TabsContent value="details" className="space-y-2 pt-3 text-sm">
            <Row label="Дата" value={o.date} />
            <Row label="Продавець" value={o.vendor} />
            {o.address && <Row label="Адреса" value={o.address} />}
            {o.returnableUntil && <Row label="Повернення до" value={o.returnableUntil} />}
            {o.notes && <p className="text-xs text-muted-foreground pt-2 border-t">{o.notes}</p>}
          </TabsContent>

          <TabsContent value="items" className="pt-3">
            <ul className="space-y-1.5 text-sm">
              {o.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-2 py-1.5 border-b last:border-0">
                  <span className="truncate flex-1">{it.title}</span>
                  <span className="text-muted-foreground tabular-nums shrink-0">{it.qty} ×</span>
                  <span className="font-medium tabular-nums shrink-0 w-20 text-right">{fmtUah(it.priceUah)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-3" />
            <div className="flex justify-between text-sm font-semibold">
              <span>Разом</span>
              <span className="tabular-nums">{fmtUah(o.amountUah)}</span>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-2 pt-3 text-sm">
            <Row icon={CreditCard} label="Метод" value={paymentMethodLabel(o.paymentMethod)} />
            {o.paymentMethod === "card" && <Row label="Картка" value={`•••• ${o.paymentLast4}`} />}
            <Row label="Сума" value={fmtUah(o.amountUah)} />
            {o.invoiceUrl && (
              <Button size="sm" variant="outline" className="w-full mt-2 h-8 text-xs" onClick={() => demoToast("Чек збережено")}>
                <Download className="w-3.5 h-3.5 mr-1.5" /> Завантажити чек
              </Button>
            )}
          </TabsContent>

          {o.kind === "purchase" && (
            <TabsContent value="delivery" className="space-y-2 pt-3 text-sm">
              {o.deliveryStatus && <Row icon={Truck} label="Статус" value={deliveryStatusLabel(o.deliveryStatus)} />}
              {o.trackingNo && <Row icon={Package} label="ТТН" value={o.trackingNo} />}
              {o.address && <Row icon={MapPin} label="Адреса" value={o.address} />}
            </TabsContent>
          )}
        </Tabs>

        {/* Платіж (bridge у фінанси) */}
        {(() => {
          const pay = paymentForOrder(raw);
          if (!pay) return null;
          const st = statusLabel(pay.status);
          return (
            <Card className="p-3 border-border/70 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Платіж</span>
                <Badge variant="outline" className={`text-[10px] ${st.cls}`}>{st.label}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {methodLabel(pay.method)}{pay.last4 ? ` •••• ${pay.last4}` : ""} · {pay.date}
                </span>
                <span className="font-semibold tabular-nums">{fmtUah(pay.amountUah)}</span>
              </div>
              <button
                className="text-[11px] text-primary hover:underline w-full text-left"
                onClick={() => demoToast(`Платіж ${pay.id} — деталі в розділі «Фінанси»`)}
              >
                Відкрити у Фінансах →
              </button>
            </Card>
          );
        })()}

        <Separator />
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => demoToast("Замовлення скопійовано в кошик")}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Повторити
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => demoToast("Звернення створено")}>
            <LifeBuoy className="w-3.5 h-3.5 mr-1.5" /> Допомога
          </Button>
          {o.status !== "completed" && o.status !== "cancelled" && (() => {
            const isBook = o.kind === "booking";
            const policy = isBook ? bookingCancellationFee(raw) : null;
            return (
              <Button size="sm" variant="outline" className="h-8 text-xs text-rose-600 col-span-2"
                onClick={() => demoToast(policy ? `${policy.reason}. Повернення: ${fmtUah(policy.refundUah)}` : "Скасування буде підтверджено email")}>
                <X className="w-3.5 h-3.5 mr-1.5" />
                {isBook ? `Скасувати · ${policy && policy.feeUah > 0 ? `штраф ${fmtUah(policy.feeUah)}` : "без штрафу"}` : "Скасувати замовлення"}
              </Button>
            );
          })()}
        </div>
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
      <span className="text-right truncate font-medium tabular-nums">{value}</span>
    </div>
  );
}
