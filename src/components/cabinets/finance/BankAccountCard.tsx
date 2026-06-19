/**
 * BankAccountCard — картка одного банківського рахунку (Cash Position list).
 */

import { Landmark, Check, ExternalLink, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { formatIban } from "@/lib/iban";
import type { BankAccountSnapshot } from "@/hooks/usePaymentsAccountsBalance";

interface Props {
  account: BankAccountSnapshot;
  onOpenStatement?: (id: string) => void;
}

function syncLabel(iso: string): string {
  const min = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (min < 60) return `${min} хв тому`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} год тому`;
  return new Date(iso).toLocaleDateString("uk-UA");
}

function MiniSpark({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 24;
  const step = w / (data.length - 1);
  const path = data
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 120 24" className="w-[120px] h-6 text-primary/60" preserveAspectRatio="none" aria-hidden>
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

export function BankAccountCard({ account, onOpenStatement }: Props) {
  const fmtBalance =
    account.currency === "UAH"
      ? formatCurrency(account.balance)
      : `${formatNumber(account.balance)} ${account.currency}`;
  const positive = account.delta7d >= 0;

  return (
    <Card
      className="cursor-pointer"
      onClick={() => onOpenStatement?.(account.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpenStatement?.(account.id);
      }}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Landmark className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-sm truncate">{account.bankShort}</span>
            {account.currency !== "UAH" && (
              <Badge variant="secondary" size="sm" className="text-[10px]">
                {account.currency}
              </Badge>
            )}
          </div>
          <Badge variant="outline" size="sm" className="text-[10px] gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            <Check className="w-3 h-3" />
            Синхронізовано · {syncLabel(account.syncedAt)}
          </Badge>
        </div>

        <div className="font-mono text-[11px] text-muted-foreground truncate">
          {account.iban
            ? formatIban(account.iban)
            : account.bic
              ? `BIC ${account.bic}`
              : "—"}
        </div>
        {account.pendingOut > 0 && (
          <div className="text-[11px] text-amber-700 dark:text-amber-400">
            В дорозі: −{formatNumber(account.pendingOut)} {account.currency}
          </div>
        )}

        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-bold tabular-nums tracking-tight">{fmtBalance}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              <span
                className={cn(
                  "tabular-nums font-medium",
                  positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                )}
              >
                {positive ? "↑ +" : "↓ −"}
                {formatNumber(Math.abs(account.delta7d))} {account.currency}
              </span>
              <span> за 7д · {account.txCount7d} оп.</span>
            </div>
          </div>
          <MiniSpark data={account.sparkline} />
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onOpenStatement?.(account.id);
            }}
          >
            <FileText className="w-3 h-3" />
            Виписка
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={(e) => e.stopPropagation()}>
            <ExternalLink className="w-3 h-3" />
            Реквізити
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
