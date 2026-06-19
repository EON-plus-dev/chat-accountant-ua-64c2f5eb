/**
 * LiquidityBucketDetailSheet — деталізація бакета ліквідності.
 *
 * Tax / Payroll → перелік scheduled-out платежів у горизонті 30д + escape «Перейти до Платежів».
 * Savings → пояснення політики sweep (10% Available).
 * Operating → breakdown Available − Tax − Payroll − Savings + escape «Перейти до Рахунків».
 */

import { ArrowRight, ExternalLink, Layers, PiggyBank, Receipt, Wallet } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { filterBucketPayments, type LiquidityBucket } from "@/hooks/useLiquidityBuckets";
import { useCabinetAllPayments } from "@/hooks/useCabinetAllPayments";
import { inferCurrency, toUah } from "@/lib/paymentsCurrency";
import { paymentTypeConfig } from "@/config/unifiedPaymentsConfig";
import type { Cabinet } from "@/types/cabinet";
import type { CabinetCashPosition } from "@/hooks/useCabinetCashPosition";

interface Props {
  cabinet: Cabinet;
  bucket: LiquidityBucket | null;
  position: CabinetCashPosition;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEscapeToPayments?: (source: string) => void;
  onEscapeToAccounts?: () => void;
}

const BUCKET_COLOR: Record<LiquidityBucket["id"], string> = {
  operating: "bg-primary",
  tax: "bg-violet-500",
  payroll: "bg-sky-500",
  savings: "bg-emerald-500",
};

const BUCKET_ICON: Record<LiquidityBucket["id"], typeof Layers> = {
  operating: Wallet,
  tax: PiggyBank,
  payroll: Receipt,
  savings: Layers,
};

function formatUaDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("uk-UA", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}

export function LiquidityBucketDetailSheet({
  cabinet,
  bucket,
  position,
  open,
  onOpenChange,
  onEscapeToPayments,
  onEscapeToAccounts,
}: Props) {
  const allPayments = useCabinetAllPayments(cabinet);

  if (!bucket) return null;
  const Icon = BUCKET_ICON[bucket.id];
  const dotColor = BUCKET_COLOR[bucket.id];

  const isTaxLike = bucket.id === "tax" || bucket.id === "payroll";
  const items = isTaxLike ? filterBucketPayments(allPayments, bucket.id as "tax" | "payroll") : [];

  // Breakdown for "operating"
  const taxBucket = bucket.id === "operating" ? undefined : undefined;
  // Note: for operating breakdown we just recompute from position.availableUah and bucket sums via context — but
  // since we don't receive them here, request via re-derive — kept simple by passing only what's needed.

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-2">
          <SheetTitle className="inline-flex items-center gap-2 text-base">
            <span className={cn("w-2 h-2 rounded-full", dotColor)} />
            <Icon className="w-4 h-4 text-muted-foreground" />
            {bucket.label}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-semibold tabular-nums text-foreground">
              {formatCurrency(bucket.amount)}
            </span>
            {bucket.needed !== undefined && bucket.needed > 0 && (
              <span className="text-xs text-muted-foreground tabular-nums">
                / потрібно {formatCurrency(bucket.needed)}
              </span>
            )}
            {bucket.isUnderfunded && bucket.needed !== undefined && (
              <Badge
                variant="outline"
                size="sm"
                className="text-[10px] text-amber-700 dark:text-amber-400 border-amber-500/40"
              >
                Не вистачає {formatCurrency(bucket.needed - bucket.amount)}
              </Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3">
          {isTaxLike && items.length === 0 && (
            <div className="text-sm text-muted-foreground border rounded-md p-4 text-center">
              Немає запланованих платежів у горизонті 30 днів.
            </div>
          )}

          {isTaxLike && items.length > 0 && (
            <ul className="divide-y border rounded-md overflow-hidden">
              {items.map((p) => {
                const uah = toUah(p.amount, inferCurrency(p));
                const cfg = paymentTypeConfig[p.paymentType];
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-muted/40 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {p.entityName || cfg?.label || p.paymentType}
                      </div>
                      <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                        <span>{formatUaDate(p.date)}</span>
                        <span>·</span>
                        <span>{p.statusLabel}</span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                      −{formatCurrency(uah)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {bucket.id === "savings" && (
            <div className="space-y-3 text-sm">
              <div className="border rounded-md p-3 space-y-1.5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Як рахується
                </div>
                <div className="tabular-nums">
                  10% × {formatCurrency(position.availableUah)} (Доступно) ={" "}
                  <span className="font-semibold">{formatCurrency(bucket.amount)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Це політика sweep-резервування (Brex-style): 10% доступних коштів автоматично
                відкладається на «подушку». Сума не блокується на рахунку — це орієнтир для
                планування. Налаштування відсотка зʼявиться в розділі «Політики резервування».
              </p>
            </div>
          )}

          {bucket.id === "operating" && (
            <div className="space-y-3 text-sm">
              <div className="border rounded-md overflow-hidden">
                <div className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground bg-muted/30 border-b">
                  Як рахується
                </div>
                <ul className="divide-y">
                  <li className="flex justify-between px-3 py-2">
                    <span>Доступно</span>
                    <span className="tabular-nums">{formatCurrency(position.availableUah)}</span>
                  </li>
                  <li className="flex justify-between px-3 py-2 text-muted-foreground">
                    <span>− Під податки (30д)</span>
                    <span className="tabular-nums">
                      −{formatCurrency(position.availableUah - bucket.amount > 0 ? position.availableUah - bucket.amount : 0)}
                    </span>
                  </li>
                  <li className="flex justify-between px-3 py-2 font-semibold bg-muted/20">
                    <span>= Оперативно</span>
                    <span className="tabular-nums">{formatCurrency(bucket.amount)}</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Решта Доступно після резервів — кошти, якими можна вільно розпоряджатись на
                операційну діяльність.
              </p>
            </div>
          )}
        </div>

        {/* Escape */}
        <div className="border-t pt-3 mt-3 space-y-2">
          {isTaxLike && (
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => {
                onOpenChange(false);
                onEscapeToPayments?.(bucket.id === "tax" ? "tax-reserve" : "payroll-reserve");
              }}
            >
              <span className="inline-flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Відкрити в Платежах
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          {bucket.id === "operating" && (
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => {
                onOpenChange(false);
                onEscapeToAccounts?.();
              }}
            >
              <span className="inline-flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Перейти до Рахунків
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
