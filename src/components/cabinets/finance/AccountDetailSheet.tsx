/**
 * AccountDetailSheet — drill-sheet для одного банк-рахунку.
 *
 * Локальний (НЕ через DrillStack), бо `DrillKind` строго типізований.
 * Показує мок-виписку за 30 днів + кнопку «Відкрити повну виписку» з BackTrail.
 */

import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { formatIban } from "@/lib/iban";
import type { BankAccountSnapshot } from "@/hooks/usePaymentsAccountsBalance";

interface Props {
  account: BankAccountSnapshot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenFullStatement?: (accountId: string) => void;
}

interface MockTx {
  id: string;
  date: string;
  description: string;
  amount: number;
  counterparty: string;
}

const COUNTERPARTIES = [
  "ТОВ «Постачальник Плюс»",
  "ФОП Іваненко В.І.",
  "ТОВ «Клієнт Сервіс»",
  "ПАТ «Київобленерго»",
  "Bondarenko Olena (зарплата)",
  "ДПС · ЄП 3 група",
  "ТОВ «Інтернет Сервіс»",
];

function generateMockTxs(account: BankAccountSnapshot): MockTx[] {
  // Детерміністичний за account.id. Список покриває 7 днів і його сума точно дорівнює
  // account.inflow7d / account.outflow7d — щоб KPI у шапці звірялись зі списком.
  let seed = account.id.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0);
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  const total = Math.max(1, account.txCount7d);
  // Розподіл напрямків пропорційно до сум, але мінімум по 1 з кожного боку (якщо обидві ненульові).
  const sumAbs = account.inflow7d + account.outflow7d;
  let inCount =
    account.inflow7d > 0 && sumAbs > 0
      ? Math.max(1, Math.round((account.inflow7d / sumAbs) * total))
      : 0;
  let outCount = total - inCount;
  if (account.outflow7d > 0 && outCount === 0) {
    outCount = 1;
    inCount = Math.max(0, total - 1);
  }
  if (account.inflow7d === 0) inCount = 0;
  if (account.outflow7d === 0) outCount = 0;

  // Розподіл суми між N записів детерміністично, останній забирає залишок.
  const distribute = (sum: number, n: number): number[] => {
    if (n <= 0 || sum <= 0) return [];
    const weights = Array.from({ length: n }, () => 0.5 + rng());
    const wSum = weights.reduce((a, b) => a + b, 0);
    const parts = weights.map((w) => Math.max(1, Math.round((w / wSum) * sum)));
    const diff = sum - parts.reduce((a, b) => a + b, 0);
    parts[parts.length - 1] = Math.max(1, parts[parts.length - 1] + diff);
    return parts;
  };

  const inParts = distribute(account.inflow7d, inCount);
  const outParts = distribute(account.outflow7d, outCount);

  const out: MockTx[] = [];
  const now = Date.now();
  const pushTxs = (amounts: number[], sign: 1 | -1) => {
    for (let i = 0; i < amounts.length; i++) {
      const daysAgo = Math.floor(rng() * 7);
      out.push({
        id: `${account.id}-tx-${sign === 1 ? "in" : "out"}-${i}`,
        date: new Date(now - daysAgo * 86400_000).toLocaleDateString("uk-UA"),
        description: sign === 1 ? "Надходж. від контрагента" : "Списання · оплата",
        amount: sign * amounts[i],
        counterparty: COUNTERPARTIES[Math.floor(rng() * COUNTERPARTIES.length)],
      });
    }
  };
  pushTxs(inParts, 1);
  pushTxs(outParts, -1);

  return out.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function AccountDetailSheet({ account, open, onOpenChange, onOpenFullStatement }: Props) {
  const txs = useMemo(() => (account ? generateMockTxs(account) : []), [account]);

  if (!account) return null;

  // KPI = реальні per-account snapshot-числа (звіряються з BankAccountCard «· 7д»).
  const inflow = account.inflow7d;
  const outflow = account.outflow7d;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-4 md:px-6 py-4 border-b">
          <div className="flex items-center gap-2 flex-wrap">
            <SheetTitle className="text-base">{account.bankShort}</SheetTitle>
            {account.currency !== "UAH" && (
              <Badge variant="secondary" size="sm">{account.currency}</Badge>
            )}
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            {account.iban ? formatIban(account.iban) : account.bic ? `BIC ${account.bic}` : "—"}
          </p>
        </SheetHeader>

        <div className="px-4 md:px-6 py-4 border-b bg-muted/30">
          <div className="text-2xl font-bold tabular-nums">
            {account.currency === "UAH"
              ? formatCurrency(account.balance)
              : `${formatNumber(account.balance)} ${account.currency}`}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="text-xs">
              <div className="text-muted-foreground flex items-center gap-1">
                <ArrowDownToLine className="w-3 h-3 text-emerald-500" /> Надходження 7д
              </div>
              <div className="font-semibold tabular-nums mt-0.5">
                {account.currency === "UAH" ? formatCurrency(Math.round(inflow)) : `${formatNumber(Math.round(inflow))} ${account.currency}`}
              </div>
            </div>
            <div className="text-xs">
              <div className="text-muted-foreground flex items-center gap-1">
                <ArrowUpFromLine className="w-3 h-3 text-red-500" /> Списання 7д
              </div>
              <div className="font-semibold tabular-nums mt-0.5">
                {account.currency === "UAH" ? formatCurrency(Math.round(outflow)) : `${formatNumber(Math.round(outflow))} ${account.currency}`}
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-4 md:px-6 py-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Останні операції (7 днів)
            </div>
            <ul className="divide-y divide-border/60">
              {txs.map((t) => (
                <li key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm truncate">{t.counterparty}</div>
                    <div className="text-[11px] text-muted-foreground">{t.date} · {t.description}</div>
                  </div>
                  <div
                    className={cn(
                      "tabular-nums font-medium text-sm shrink-0",
                      t.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
                    )}
                  >
                    {t.amount > 0 ? "+" : "−"}
                    {account.currency === "UAH"
                      ? formatCurrency(Math.abs(t.amount))
                      : `${formatNumber(Math.abs(t.amount))} ${account.currency}`}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>

        <div className="border-t px-4 md:px-6 py-3">
          <Button
            className="w-full gap-2"
            variant="default"
            onClick={() => onOpenFullStatement?.(account.id)}
          >
            <ExternalLink className="w-4 h-4" />
            Відкрити повну виписку у Платежах
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
