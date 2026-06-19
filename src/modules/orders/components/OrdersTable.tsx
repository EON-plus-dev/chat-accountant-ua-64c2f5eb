/**
 * OrdersTable — універсальна таблиця для Sales і Purchase ордерів.
 * Direction-aware: міняє лейбли колонок (Клієнт vs Постачальник, Виторг vs Витрати).
 */

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import type { Order, OrderDirection, OrderStatus } from "../types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  draft: "Чернетка",
  confirmed: "Підтверджено",
  partial: "Частково",
  fulfilled: "Виконано",
  invoiced: "Виставлено",
  paid: "Оплачено",
  closed: "Закрито",
  cancelled: "Скасовано",
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  confirmed: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  partial: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  fulfilled: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  invoiced: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  closed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
};

interface Props {
  orders: Order[];
  direction: OrderDirection;
  onRowClick?: (o: Order) => void;
}

export function OrdersTable({ orders, direction, onRowClick }: Props) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {direction === "sale" ? "Поки немає продажів." : "Поки немає закупівель."}
        </p>
      </div>
    );
  }

  const counterpartyLabel = direction === "sale" ? "Клієнт" : "Постачальник";
  const amountLabel = direction === "sale" ? "Виторг" : "Сума";

  const sorted = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 font-medium">№</th>
              <th className="text-left px-3 py-2 font-medium">Дата</th>
              <th className="text-left px-3 py-2 font-medium">{counterpartyLabel}</th>
              <th className="text-left px-3 py-2 font-medium">Канал</th>
              <th className="text-right px-3 py-2 font-medium">Позицій</th>
              <th className="text-right px-3 py-2 font-medium">{amountLabel}</th>
              <th className="text-left px-3 py-2 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((o) => {
              const hasReturn = o.lines.some((l) => l.isReturn);
              const totalUah = o.totals.total * (o.fxRate ?? 1);
              return (
                <tr
                  key={o.id}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onRowClick?.(o)}
                >
                  <td className="px-3 py-2 text-xs font-mono">
                    {o.number}
                    {hasReturn && <Badge variant="outline" className="ml-1.5 text-[9px]">RMA</Badge>}
                  </td>
                  <td className="px-3 py-2 text-xs tabular-nums text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("uk-UA")}
                  </td>
                  <td className="px-3 py-2 truncate max-w-[220px]">{o.counterpartyName}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {o.channel ?? (direction === "purchase" ? "PO" : "—")}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{o.lines.length}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium">
                    {o.currency !== "UAH" ? (
                      <div>
                        <div>{o.totals.total.toLocaleString("uk-UA")} {o.currency}</div>
                        <div className="text-[10px] text-muted-foreground">≈ {formatCurrency(totalUah)}</div>
                      </div>
                    ) : (
                      formatCurrency(o.totals.total)
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={`text-[10px] ${STATUS_CLASS[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {sorted.map((o) => {
          const totalUah = o.totals.total * (o.fxRate ?? 1);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onRowClick?.(o)}
              className="w-full text-left rounded-lg border bg-card p-3 space-y-1.5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono">{o.number}</span>
                <Badge variant="outline" className={`text-[10px] ${STATUS_CLASS[o.status]}`}>{STATUS_LABEL[o.status]}</Badge>
              </div>
              <div className="text-sm truncate">{o.counterpartyName}</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground tabular-nums">{new Date(o.createdAt).toLocaleDateString("uk-UA")}</span>
                <span className="font-semibold tabular-nums">{formatCurrency(totalUah)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
