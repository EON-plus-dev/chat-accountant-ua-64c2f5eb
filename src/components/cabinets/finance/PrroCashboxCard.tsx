/**
 * PrroCashboxCard — картка готівкової каси / ПРРО.
 */

import { Receipt, Wifi, WifiOff, FileDown, History, ArrowLeftRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { PrroCashbox } from "@/hooks/usePrroCashboxes";

interface Props {
  cashbox: PrroCashbox;
  onOpenDetails?: (id: string) => void;
}

export function PrroCashboxCard({ cashbox, onOpenDetails }: Props) {
  const isOpenShift = cashbox.zReportClosedAt === null;

  return (
    <Card
      className="cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails?.(cashbox.id)}
      onKeyDown={(e) => e.key === "Enter" && onOpenDetails?.(cashbox.id)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Receipt className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-sm truncate">{cashbox.name}</span>
          </div>
          <Badge
            variant="outline"
            size="sm"
            className={cn(
              "text-[10px] gap-1",
              cashbox.online
                ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "text-amber-600 dark:text-amber-400 border-amber-500/30",
            )}
          >
            {cashbox.online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            ПРРО {cashbox.online ? "онлайн" : "офлайн"}
          </Badge>
        </div>

        <div className="text-[11px] text-muted-foreground">
          ФН {cashbox.fiscalNumber} · оператор: {cashbox.operator}
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Залишок готівки</span>
            <span className="text-lg font-bold tabular-nums">{formatCurrency(cashbox.cashBalance)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">
              Виторг {isOpenShift ? "поточної зміни" : "минулої зміни"}
            </span>
            <span className="text-sm font-medium tabular-nums">{formatCurrency(cashbox.dayRevenue)}</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {cashbox.receiptsCount} чеків ·{" "}
            {isOpenShift
              ? "Z-звіт ще не закрито"
              : `Закрито ${new Date(cashbox.zReportClosedAt!).toLocaleString("uk-UA", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}`}
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={(e) => e.stopPropagation()}
            disabled={!isOpenShift}
          >
            <FileDown className="w-3 h-3" />
            Z-звіт
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={(e) => e.stopPropagation()}>
            <ArrowLeftRight className="w-3 h-3" />
            Інкасація
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={(e) => e.stopPropagation()}>
            <History className="w-3 h-3" />
            Історія
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
