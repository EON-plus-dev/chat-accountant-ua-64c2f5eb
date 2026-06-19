import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  taxTypeConfig,
  type TaxPayment,
  type TaxType,
} from "@/config/paymentsConfig";
import { calcTaxPenalty } from "@/lib/taxPenaltyCalculator";
import {
  effectiveTaxStatus,
  daysToDeadline,
  paidAmountOf,
} from "@/lib/taxStatus";

interface TaxTypeCardProps {
  taxType: TaxType;
  payments: TaxPayment[];
  /** Рік контексту картки. */
  year?: number;
  onOpenPayment: (payment: TaxPayment) => void;
  /** @deprecated — доступно через TaxDetailSheet (клік по картці). */
  onOpenDeclaration?: (taxType: TaxType, payments: TaxPayment[]) => void;
  /** @deprecated — доступно через TaxDetailSheet (клік по картці). */
  onOpenIncomeBook?: (period?: { year: number; quarter?: number }) => void;
  /** Клік по тілу картки → відкрити TaxDetailSheet у режимі type. */
  onOpenDetail?: (taxType: TaxType) => void;
}

const formula: Partial<Record<TaxType, string>> = {
  ep: "Дохід × 5% (3 група)",
  esv: "МЗП × 22% × N міс",
  "military-fop": "Дохід × 1%",
  pdfo: "Зарплата × 18%",
  military: "Зарплата × 5%",
  "esv-employer": "Зарплата × 22%",
};

export function TaxTypeCard({
  taxType,
  payments,
  onOpenPayment,
  onOpenDetail,
}: TaxTypeCardProps) {
  const cfg = taxTypeConfig[taxType];

  const stats = useMemo(() => {
    const today = new Date();
    let accrued = 0;
    let paid = 0;
    let overdueCount = 0;
    let sanctions = 0;
    let nextDue: { payment: TaxPayment; days: number } | null = null;

    for (const p of payments) {
      const status = effectiveTaxStatus(p, today);
      if (status === "cancelled") continue;

      accrued += p.amountToPay;
      paid += paidAmountOf(p);

      if (status === "paid") continue;

      const days = daysToDeadline(p, today);

      if (status === "overdue") {
        overdueCount += 1;
        sanctions += calcTaxPenalty(p.amountToPay, Math.abs(days)).total;
      } else if (days >= 0) {
        if (!nextDue || days < nextDue.days) nextDue = { payment: p, days };
      }
    }

    return {
      accrued,
      paid,
      overdueCount,
      sanctions,
      nextDue,
      remaining: Math.max(0, accrued - paid),
    };
  }, [payments, taxType]);

  const fmt = (n: number) => `${Math.round(n).toLocaleString("uk-UA")} ₴`;

  const statusBadge =
    stats.overdueCount > 0 ? (
      <Badge variant="status" className="gap-1 bg-destructive/10 text-destructive border border-destructive/30">
        <AlertTriangle className="h-3 w-3" />
        {stats.overdueCount} прострочено
      </Badge>
    ) : stats.remaining > 0 ? (
      <Badge variant="status" className="gap-1 bg-muted text-muted-foreground border border-border/60">
        <Clock className="h-3 w-3" />
        До сплати
      </Badge>
    ) : (
      <Badge
        variant="status"
        className="gap-1 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30"
      >
        <CheckCircle2 className="h-3 w-3" />
        Актуально
      </Badge>
    );

  const metrics: Array<{ label: string; value: string; tone?: string }> = [
    { label: "Нарах.", value: fmt(stats.accrued) },
    { label: "Сплачено", value: fmt(stats.paid), tone: "text-emerald-600" },
    {
      label: "Залишок",
      value: fmt(stats.remaining),
      tone: stats.remaining > 0 ? "text-foreground" : "text-muted-foreground",
    },
    {
      label: "Санкції",
      value: stats.sanctions > 0 ? `+${fmt(stats.sanctions)}` : "—",
      tone: stats.sanctions > 0 ? "text-rose-600" : "text-muted-foreground",
    },
  ];

  return (
    <Card
      className={cn(
        "flex flex-col",
        onOpenDetail && "cursor-pointer hover:shadow-md transition-shadow",
      )}
      onClick={onOpenDetail ? () => onOpenDetail(taxType) : undefined}
      role={onOpenDetail ? "button" : undefined}
      tabIndex={onOpenDetail ? 0 : undefined}
      onKeyDown={
        onOpenDetail
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenDetail(taxType);
              }
            }
          : undefined
      }
    >
      <CardContent className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight">{cfg.label}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {formula[taxType] ?? cfg.description}
            </div>
          </div>
          {statusBadge}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-md bg-muted/40 p-1.5">
              <div className="text-[10px] text-muted-foreground leading-none">{m.label}</div>
              <div className={cn("text-sm font-semibold tabular-nums mt-1", m.tone)}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {stats.nextDue && (
          <div
            className="flex items-center justify-between gap-2 mt-auto pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs text-muted-foreground min-w-0 truncate">
              <span className="font-medium text-foreground">
                {format(parseISO(stats.nextDue.payment.deadline), "dd MMM", { locale: uk })}
              </span>
              {" · "}
              {stats.nextDue.days === 0
                ? "сьогодні"
                : stats.nextDue.days === 1
                  ? "завтра"
                  : `через ${stats.nextDue.days} дн.`}
            </div>
            <Button
              size="sm"
              variant="default"
              className="h-7 px-3 text-xs shrink-0"
              onClick={() => onOpenPayment(stats.nextDue!.payment)}
            >
              Сплатити
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
