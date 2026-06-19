/**
 * OrderDrillView — один drill-view для Sales і Purchase ордерів.
 * Розрізняє за `direction`. Escape-кнопка веде у відповідний підрозділ.
 */

import { useMemo } from "react";
import { ExternalLink, ArrowRight, ShoppingCart, PackagePlus, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DrillSheet } from "../DrillSheet";
import { useDrillStack } from "../DrillStackProvider";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  seedOrdersForCabinet,
  seedFulfillmentsForCabinet,
} from "@/modules/orders/demo/seedRegistry";
import { useOrders } from "@/modules/orders/store/useOrdersStore";
import { useFulfillments } from "@/modules/orders/store/useFulfillmentsStore";
import { totalLandedUah } from "@/modules/orders/bridges/landedCost";

interface Props {
  orderId: string;
  cabinetId?: string;
  sourceLabel?: string;
  onOpenFullOrder?: (orderId: string, direction: "sale" | "purchase") => void;
}

export function OrderDrillView({ orderId, cabinetId, sourceLabel, onOpenFullOrder }: Props) {
  const { popAll, push } = useDrillStack();
  const { byId } = useOrders(cabinetId ?? "", { seed: seedOrdersForCabinet });
  const { byOrderId } = useFulfillments(cabinetId ?? "", { seed: seedFulfillmentsForCabinet });
  const order = byId(orderId);
  const fulfillments = useMemo(() => byOrderId(orderId), [byOrderId, orderId]);

  if (!order) {
    return (
      <DrillSheet matchKind="order" matchId={orderId} title="Замовлення не знайдено" sourceLabel={sourceLabel}>
        <p className="text-sm text-muted-foreground">Запис {orderId} відсутній або прихований.</p>
      </DrillSheet>
    );
  }

  const isSale = order.direction === "sale";
  const Icon = isSale ? ShoppingCart : PackagePlus;
  const totalUah = order.totals.total * (order.fxRate ?? 1);
  const landedUah = totalLandedUah(fulfillments[0]?.landedCosts);

  return (
    <DrillSheet
      matchKind="order"
      matchId={orderId}
      title={`${order.number} · ${order.counterpartyName}`}
      sourceLabel={sourceLabel}
      footer={
        onOpenFullOrder ? (
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              popAll();
              onOpenFullOrder(orderId, order.direction);
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Відкрити в розділі «{isSale ? "Продажі" : "Закупки"}»
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5 items-center">
              <Badge variant="outline" className="text-[10px]">{isSale ? "Продаж" : "Закупка"}</Badge>
              <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
              {order.channel && <Badge variant="outline" className="text-[10px]">{order.channel}</Badge>}
              {order.currency !== "UAH" && <Badge variant="outline" className="text-[10px]">{order.currency} @ {order.fxRate}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1 tabular-nums">
              {new Date(order.createdAt).toLocaleDateString("uk-UA")}
              {order.expectedAt && ` · очікувано до ${new Date(order.expectedAt).toLocaleDateString("uk-UA")}`}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-1.5">
          <div className="text-xs text-muted-foreground">Позиції ({order.lines.length})</div>
          <ul className="text-sm space-y-1">
            {order.lines.map((l) => (
              <li key={l.id} className="flex justify-between gap-2">
                <span className="truncate flex-1">
                  {l.isReturn && <Badge variant="outline" className="mr-1 text-[9px]">RMA</Badge>}
                  {l.productName}
                  <span className="text-xs text-muted-foreground tabular-nums ml-2">× {l.qty}</span>
                </span>
                <span className="tabular-nums text-muted-foreground shrink-0">
                  {(l.price * l.qty).toLocaleString("uk-UA")} {order.currency}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <Metric label="Сума" value={`${order.totals.total.toLocaleString("uk-UA")} ${order.currency}`} />
          {order.currency !== "UAH" && <Metric label="≈ у грн" value={formatCurrency(totalUah)} />}
          {order.totals.discount > 0 && <Metric label="Знижка" value={`−${order.totals.discount.toLocaleString("uk-UA")} ${order.currency}`} />}
          {isSale && order.totals.margin != null && <Metric label="Маржа" value={formatCurrency(order.totals.margin)} />}
          {landedUah > 0 && <Metric label="Landed cost" value={formatCurrency(landedUah)} />}
        </div>

        {fulfillments.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Receipt className="w-3 h-3" /> {isSale ? "Відвантаження" : "Прийом"}</div>
            <ul className="text-xs space-y-1">
              {fulfillments.map((f) => {
                const totalQty = f.lines.reduce((s, l) => s + l.qty, 0);
                const discrepancy = f.lines.reduce((s, l) => s + Math.abs(l.discrepancy ?? 0), 0);
                return (
                  <li key={f.id} className="rounded-md border bg-card px-2.5 py-1.5 flex justify-between">
                    <span className="tabular-nums">{new Date(f.date).toLocaleDateString("uk-UA")} · {totalQty} од</span>
                    {discrepancy > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400">−{discrepancy} розбіжність</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">OK</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {order.linkedBookingId && (
          <button
            type="button"
            onClick={() => push({ kind: "booking", id: order.linkedBookingId!, sourceLabel: `Замовлення ${order.number}` })}
            className="w-full text-left rounded-md border bg-card px-3 py-2 text-xs hover:bg-muted/40 transition-colors"
          >
            <div className="text-[10px] text-muted-foreground uppercase">Допродаж на візиті</div>
            <div className="font-medium mt-0.5">Відкрити пов'язане бронювання →</div>
          </button>
        )}

        {order.notes && (
          <div className="text-xs text-muted-foreground leading-relaxed border-t pt-3">
            <span className="font-medium text-foreground">Нотатки:</span> {order.notes}
          </div>
        )}
      </div>
    </DrillSheet>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-2">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}
