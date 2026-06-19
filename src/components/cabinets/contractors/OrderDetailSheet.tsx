/**
 * ORDER DETAIL SHEET
 * 
 * Sheet з деталями існуючого замовлення + візуальний степпер статусу
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  CreditCard,
  Truck,
  RotateCcw,
  Package,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNomenclaturePrice } from "@/config/nomenclatureConfig";
import {
  type ContractorOrder,
  type ContractorOrderStatus,
  type ContractorOrderItem,
  contractorOrderStatusLabels,
  contractorOrderStatusColors,
  getMockOrderItems,
} from "@/config/contractorInteractionConfig";
import { toast } from "sonner";

interface OrderDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ContractorOrder | null;
  contractorName: string;
}

const STATUS_STEPS: { key: ContractorOrderStatus; label: string; icon: string }[] = [
  { key: "draft", label: "Чернетка", icon: "📝" },
  { key: "sent", label: "Надіслано", icon: "📤" },
  { key: "confirmed", label: "Підтверджено", icon: "✓" },
  { key: "shipped", label: "В дорозі", icon: "🚚" },
  { key: "delivered", label: "Доставлено", icon: "✅" },
];

const getStatusIndex = (status: ContractorOrderStatus) => {
  if (status === "cancelled") return -1;
  return STATUS_STEPS.findIndex((s) => s.key === status);
};

export const OrderDetailSheet = ({
  open,
  onOpenChange,
  order,
  contractorName,
}: OrderDetailSheetProps) => {
  if (!order) return null;

  const items = getMockOrderItems(order.id);
  const statusIdx = getStatusIndex(order.status);
  const isCancelled = order.status === "cancelled";

  const handleReorder = () => {
    toast.info("Функція повторного замовлення буде доступна найближчим часом");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="responsive-right"
        className="flex flex-col w-full sm:max-w-lg p-0"
      >
        <SheetHeader className="shrink-0 p-4 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            {order.orderNumber}
          </SheetTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className={cn("text-xs", contractorOrderStatusColors[order.status])}
            >
              {contractorOrderStatusLabels[order.status]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {contractorName}
            </span>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            {/* Status stepper */}
            {!isCancelled && (
              <div className="flex items-center px-2">
                {STATUS_STEPS.map((s, i) => {
                  const isCompleted = i <= statusIdx;
                  const isCurrent = i === statusIdx;
                  return (
                    <div key={s.key} className="flex items-center flex-1 last:flex-none">
                      {/* Circle + label */}
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center text-xs border-2 transition-colors shrink-0",
                            isCompleted
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-muted border-muted-foreground/20 text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <span>{i + 1}</span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[10px] text-center leading-tight whitespace-nowrap",
                            isCurrent ? "font-medium" : "text-muted-foreground"
                          )}
                        >
                          {s.label}
                        </span>
                      </div>
                      {/* Connecting line */}
                      {i < STATUS_STEPS.length - 1 && (
                        <div
                          className={cn(
                            "h-0.5 flex-1 mx-1 rounded-full mb-5",
                            isCompleted && i < statusIdx ? "bg-primary" : "bg-muted"
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isCancelled && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center">
                ❌ Замовлення скасовано
              </div>
            )}

            {/* Progress bar under stepper */}
            {!isCancelled && (
              <div className="w-full bg-muted rounded-full h-1.5 -mt-2">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{
                    width: `${((statusIdx + 1) / STATUS_STEPS.length) * 100}%`,
                  }}
                />
              </div>
            )}

            <Separator />

            {/* Dates */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Створено:</span>
                <span>{new Date(order.date).toLocaleDateString("uk-UA")}</span>
              </div>
              {order.expectedDelivery && (
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Очікувана доставка:</span>
                  <span>
                    {new Date(order.expectedDelivery).toLocaleDateString("uk-UA")}
                  </span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Доставлено:</span>
                  <span>
                    {new Date(order.deliveredAt).toLocaleDateString("uk-UA")}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Items */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                Позиції ({items.length})
              </h4>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.sku} • {item.quantity} {item.unit}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-mono text-sm">
                      {formatNomenclaturePrice(item.total, order.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNomenclaturePrice(item.price, order.currency)}/{item.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center text-base font-medium">
              <span>Разом</span>
              <span className="font-mono">
                {formatNomenclaturePrice(order.amount, order.currency)}
              </span>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="shrink-0 border-t p-4">
          <Button
            variant="outline"
            onClick={handleReorder}
            className="w-full gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Повторити замовлення
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
