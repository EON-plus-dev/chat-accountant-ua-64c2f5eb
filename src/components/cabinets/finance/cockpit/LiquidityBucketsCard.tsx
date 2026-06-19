/**
 * LiquidityBucketsCard — Operating / Tax / Payroll / Savings reserves.
 *
 * Brex/Mercury sweep-pattern: показує, скільки Available розписано по призначеннях
 * і чи є underfunded-бакети (червоний бейдж).
 */

import { useState } from "react";
import { Layers, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { useLiquidityBuckets, type BucketId, type LiquidityBucket } from "@/hooks/useLiquidityBuckets";
import type { Cabinet } from "@/types/cabinet";
import type { CabinetCashPosition } from "@/hooks/useCabinetCashPosition";
import { LiquidityBucketDetailSheet } from "./LiquidityBucketDetailSheet";

interface Props {
  cabinet: Cabinet;
  position: CabinetCashPosition;
  onEscapeToPayments?: (source: string) => void;
  onEscapeToAccounts?: () => void;
}

const BUCKET_COLOR: Record<BucketId, string> = {
  operating: "bg-primary",
  tax: "bg-violet-500",
  payroll: "bg-sky-500",
  savings: "bg-emerald-500",
};

export function LiquidityBucketsCard({ cabinet, position, onEscapeToPayments, onEscapeToAccounts }: Props) {
  const { available, buckets, shortfall } = useLiquidityBuckets(cabinet, position);
  const total = buckets.reduce((s, b) => s + b.amount, 0) || 1;
  const [selected, setSelected] = useState<LiquidityBucket | null>(null);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold inline-flex items-center gap-2 flex-wrap">
          <Layers className="w-4 h-4 text-muted-foreground" />
          Резерви ліквідності
          <span className="text-xs font-normal text-muted-foreground">
            · Доступно {formatCurrency(available)}
          </span>
          {shortfall > 0 && (
            <Badge
              variant="outline"
              size="sm"
              className="text-[10px] gap-1 text-red-600 dark:text-red-400 border-red-500/30"
            >
              <AlertCircle className="w-3 h-3" />
              Не вистачає {formatCurrency(shortfall)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1 space-y-3">
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
          {buckets.map((b) => (
            <button
              type="button"
              key={b.id}
              className={cn("h-full transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring", BUCKET_COLOR[b.id])}
              style={{ width: `${(b.amount / total) * 100}%` }}
              title={`${b.label}: ${formatCurrency(b.amount)} — клік для деталізації`}
              onClick={() => setSelected(b)}
              aria-label={`Деталізація ${b.label}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {buckets.map((b) => (
            <button
              type="button"
              key={b.id}
              onClick={() => setSelected(b)}
              className={cn(
                "text-left rounded-md border px-3 py-2 transition hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring",
                b.isUnderfunded
                  ? "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10"
                  : "border-border/60 bg-muted/30",
              )}
              aria-label={`Деталізація ${b.label}: ${formatCurrency(b.amount)}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                <span className={cn("w-1.5 h-1.5 rounded-full", BUCKET_COLOR[b.id])} />
                {b.label}
              </div>
              <div className="text-sm font-semibold tabular-nums mt-0.5">
                {formatCurrency(b.amount)}
              </div>
              {b.needed !== undefined && b.needed > 0 && (
                <div className="text-[10px] text-muted-foreground tabular-nums">
                  потрібно {formatCurrency(b.needed)}
                  {b.isUnderfunded && (
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      {" "}
                      · −{formatCurrency(b.needed - b.amount)}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>

      <LiquidityBucketDetailSheet
        cabinet={cabinet}
        bucket={selected}
        position={position}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        onEscapeToPayments={onEscapeToPayments}
        onEscapeToAccounts={onEscapeToAccounts}
      />
    </Card>
  );
}
