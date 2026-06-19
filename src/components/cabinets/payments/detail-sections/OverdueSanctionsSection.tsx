/**
 * Overdue Sanctions Section
 * Показує розрахунок штрафу (ст. 124 ПКУ) та пені (ст. 129.4 ПКУ, 120% облікової
 * ставки НБУ) для прострочених податкових платежів. Рендериться лише коли
 * платіж справді прострочений.
 */

import { differenceInDays } from "date-fns";
import { AlertTriangle, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  calcTaxPenalty,
  PENALTY_RATE_ANNUAL,
  NBU_KEY_RATE_2026,
} from "@/lib/taxPenaltyCalculator";
import type { TaxPayment } from "@/config/paymentsConfig";

interface OverdueSanctionsSectionProps {
  payment: TaxPayment;
}

export function OverdueSanctionsSection({ payment }: OverdueSanctionsSectionProps) {
  const today = new Date();
  const days = differenceInDays(today, new Date(payment.deadline));
  const isOverdue =
    payment.status === "overdue" ||
    (payment.status !== "paid" && payment.status !== "cancelled" && days > 0);

  if (!isOverdue || days <= 0) return null;

  const result = calcTaxPenalty(payment.amountToPay, days);
  const totalDue = payment.amountToPay + result.total;
  const fmt = (v: number) => `₴${Math.round(v).toLocaleString("uk-UA")}`;
  const finePct = Math.round(result.finePercent * 100);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <h4 className="font-medium text-sm">Санкції за прострочення</h4>
        <Badge variant="destructive" className="text-[10px] h-5">
          {days} {days === 1 ? "день" : "дн."}
        </Badge>
      </div>

      <div className="p-3 bg-destructive/5 dark:bg-destructive/10 rounded-lg border border-destructive/30 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Основна сума</span>
          <span className="font-mono">{fmt(payment.amountToPay)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Штраф · {finePct}% ·{" "}
            <span className="text-[11px]">ст. 124 ПКУ</span>
          </span>
          <span className="font-mono">{fmt(result.fine)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Пеня · {(PENALTY_RATE_ANNUAL * 100).toFixed(1)}%/рік × {days} дн. ·{" "}
            <span className="text-[11px]">ст. 129.4 ПКУ</span>
          </span>
          <span className="font-mono">{fmt(result.penalty)}</span>
        </div>

        <Separator className="my-1" />

        <div className="flex justify-between font-medium">
          <span>Разом санкції</span>
          <span className="font-mono text-destructive">+{fmt(result.total)}</span>
        </div>

        <div className="flex justify-between font-semibold pt-1 border-t">
          <span>До сплати з санкціями</span>
          <span className="font-mono">{fmt(totalDue)}</span>
        </div>

        <div className="flex items-start gap-1.5 pt-2 text-[11px] text-muted-foreground">
          <Info className="h-3 w-3 mt-0.5 shrink-0" />
          <p>
            Розрахунок орієнтовний (ставка НБУ {(NBU_KEY_RATE_2026 * 100).toFixed(1)}%, пеня — 120%
            ставки НБУ ÷ 365). Фактичну суму нараховує ДПС у ППР. Штраф і пеня
            сплачуються окремими платіжками: код призначення 121 — штраф, 140 —
            пеня (постанова НБУ №216).
          </p>
        </div>
      </div>
    </section>
  );
}
