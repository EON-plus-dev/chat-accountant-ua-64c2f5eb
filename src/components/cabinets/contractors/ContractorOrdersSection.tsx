/**
 * CONTRACTOR ORDERS SECTION
 * 
 * Історія замовлень з контрагентом з сортуванням та фільтрацією
 */

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  ChevronRight, 
  ChevronDown,
  Package,
  Calendar,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNomenclaturePrice } from "@/config/nomenclatureConfig";
import {
  type ContractorOrder,
  type ContractorOrderStatus,
  contractorOrderStatusLabels,
  contractorOrderStatusColors,
  contractorOrderStatusIcons,
} from "@/config/contractorInteractionConfig";

interface ContractorOrdersSectionProps {
  orders: ContractorOrder[];
  onViewAllOrders?: () => void;
  onViewOrder?: (orderId: string) => void;
  onCreateOrder?: () => void;
  showAll?: boolean;
}

type SortKey = "date" | "amount" | "status";
type SortDir = "asc" | "desc";

const STATUS_ORDER: Record<ContractorOrderStatus, number> = {
  draft: 0,
  sent: 1,
  confirmed: 2,
  shipped: 3,
  delivered: 4,
  cancelled: 5,
};

const FILTER_STATUSES: { key: ContractorOrderStatus | "all"; label: string }[] = [
  { key: "all", label: "Усі" },
  { key: "draft", label: "Чернетка" },
  { key: "sent", label: "Надіслано" },
  { key: "confirmed", label: "Підтвердж." },
  { key: "shipped", label: "В дорозі" },
  { key: "delivered", label: "Доставлено" },
  { key: "cancelled", label: "Скасовано" },
];

export const ContractorOrdersSection = ({
  orders,
  onViewAllOrders,
  onViewOrder,
  onCreateOrder,
  showAll = false,
}: ContractorOrdersSectionProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<ContractorOrderStatus | "all">("all");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "date" ? "desc" : "asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "amount") cmp = a.amount - b.amount;
      else cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [orders, statusFilter, sortKey, sortDir]);

  // Count per status for filter badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    for (const o of orders) counts[o.status] = (counts[o.status] || 0) + 1;
    return counts;
  }, [orders]);

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Замовлення
            </CardTitle>
            {onCreateOrder && (
              <Button size="sm" variant="outline" onClick={onCreateOrder} className="gap-1 h-8">
                <Plus className="h-3 w-3" />
                Нове
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="py-6 text-center text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Замовлень поки немає</p>
        </CardContent>
      </Card>
    );
  }

  const displayOrders = showAll ? filteredAndSorted : filteredAndSorted.slice(0, 3);
  const hasMore = filteredAndSorted.length > 3;

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" 
      ? <ArrowUp className="h-3 w-3 text-primary" /> 
      : <ArrowDown className="h-3 w-3 text-primary" />;
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Мої замовлення
            <Badge variant="secondary">{orders.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            {onCreateOrder && (
              <Button size="sm" variant="outline" onClick={onCreateOrder} className="gap-1 h-8">
                <Plus className="h-3 w-3" />
                <span className="hidden sm:inline">Нове</span>
              </Button>
            )}
            {hasMore && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onViewAllOrders}
                className="gap-1 h-8"
              >
                {showAll ? "Згорнути" : "Всі"}
                {showAll ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-1 mt-2">
          {FILTER_STATUSES.map(fs => {
            const count = statusCounts[fs.key] || 0;
            if (fs.key !== "all" && count === 0) return null;
            const isActive = statusFilter === fs.key;
            return (
              <Badge
                key={fs.key}
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-[11px] select-none transition-colors",
                  !isActive && "hover:bg-muted"
                )}
                onClick={() => setStatusFilter(fs.key)}
              >
                {fs.label}
                {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
              </Badge>
            );
          })}
        </div>

        {/* Sort buttons */}
        <div className="flex items-center gap-1 mt-2">
          <span className="text-[11px] text-muted-foreground mr-1">Сортувати:</span>
          {([
            { key: "date" as SortKey, label: "Дата" },
            { key: "amount" as SortKey, label: "Сума" },
            { key: "status" as SortKey, label: "Статус" },
          ]).map(s => (
            <Button
              key={s.key}
              size="sm"
              variant={sortKey === s.key ? "secondary" : "ghost"}
              className="h-6 px-2 text-[11px] gap-1"
              onClick={() => handleSort(s.key)}
            >
              {s.label}
              <SortIcon field={s.key} />
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {displayOrders.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Немає замовлень з таким статусом
            </p>
          )}
          {displayOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onViewOrder?.(order.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-2xl shrink-0">
                  {contractorOrderStatusIcons[order.status]}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {order.orderNumber}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(order.date).toLocaleDateString("uk-UA")}
                    <span>•</span>
                    <span>{order.itemsCount} позицій</span>
                  </div>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                <p className="font-mono font-medium text-sm">
                  {formatNomenclaturePrice(order.amount, order.currency)}
                </p>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", contractorOrderStatusColors[order.status])}
                >
                  {contractorOrderStatusLabels[order.status]}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {displayOrders.some(o => o.status === "shipped" && o.expectedDelivery) && (
          <div className="mt-3 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs">
            🚚 Очікується доставка:{" "}
            {displayOrders
              .filter(o => o.status === "shipped" && o.expectedDelivery)
              .map(o => new Date(o.expectedDelivery!).toLocaleDateString("uk-UA"))
              .join(", ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
