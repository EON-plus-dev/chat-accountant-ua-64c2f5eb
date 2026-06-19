import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpToLine,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  BookOpen,
  FileText,
  Wallet,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { taxFormula, taxFullName, humanizeDeadline } from "./taxFormulas";
import { RequisitesBlock } from "./okp/RequisitesBlock";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Платіж, для якого показуємо боковий drill-sheet. */
  payment: TaxPayment | null;
  /** Перейти до повної ОКП-сторінки податку (заміна старого "Усі нарахування цього податку"). */
  onOpenTaxType?: (taxType: TaxType, year: number) => void;
  /** Відкрити стандартний платіжний drill-sheet (UniversalPaymentDetailSheet). */
  onOpenPayment: (payment: TaxPayment) => void;
  onOpenDeclaration?: (taxType: TaxType, payments: TaxPayment[]) => void;
  onOpenIncomeBook?: (period?: { year: number; quarter?: number }) => void;
  onOpenCalendar?: () => void;
  /** Усі нарахування — для onOpenDeclaration (передаємо релевантний підмасив). */
  payments?: TaxPayment[];
}

const fmt = (n: number) => `${Math.round(n).toLocaleString("uk-UA")} ₴`;

function StatusBadge({ payment }: { payment: TaxPayment }) {
  const eff = effectiveTaxStatus(payment);
  if (eff === "paid") {
    return (
      <Badge variant="status" className="gap-1 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30">
        <CheckCircle2 className="h-3 w-3" /> Сплачено
      </Badge>
    );
  }
  if (eff === "overdue") {
    return (
      <Badge variant="status" className="gap-1 bg-destructive/10 text-destructive border border-destructive/30">
        <AlertTriangle className="h-3 w-3" /> Прострочено
      </Badge>
    );
  }
  if (eff === "cancelled") {
    return (
      <Badge variant="status" className="gap-1 bg-muted text-muted-foreground border border-border/60">
        Скасовано
      </Badge>
    );
  }
  return (
    <Badge variant="status" className="gap-1 bg-muted text-muted-foreground border border-border/60">
      <Clock className="h-3 w-3" /> До сплати
    </Badge>
  );
}

export function TaxDetailSheet({
  open,
  onOpenChange,
  payment,
  onOpenTaxType,
  onOpenPayment,
  onOpenDeclaration,
  onOpenIncomeBook,
  onOpenCalendar,
  payments,
}: Props) {
  if (!payment) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl" />
      </Sheet>
    );
  }

  const cfg = taxTypeConfig[payment.taxType];
  const fullName = taxFullName[payment.taxType] ?? cfg.label;
  const formula = taxFormula[payment.taxType] ?? cfg.description;
  const showIncomeBookAction = payment.taxType === "ep" || payment.taxType === "military-fop";

  const days = daysToDeadline(payment);
  const eff = effectiveTaxStatus(payment);
  const human = humanizeDeadline(days);
  const paidAmt = paidAmountOf(payment);
  const remaining = Math.max(0, payment.amountToPay - paidAmt);
  const overdueDays = eff === "overdue" ? Math.abs(days) : 0;
  const penalty = overdueDays > 0 ? calcTaxPenalty(payment.amountToPay, overdueDays) : null;

  const typeItems = (payments ?? []).filter(
    (p) => p.taxType === payment.taxType && p.year === payment.year,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="px-4 py-3 border-b border-border/60 space-y-0">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 -ml-2 h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              До Податків
            </Button>
            {onOpenTaxType && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 h-7 text-xs"
                onClick={() => {
                  onOpenChange(false);
                  onOpenTaxType(payment.taxType, payment.year);
                }}
              >
                <ArrowUpToLine className="h-3.5 w-3.5" />
                Картка ОКП цього податку
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-semibold leading-tight">{fullName}</h2>
              <StatusBadge payment={payment} />
            </div>
            <div className="text-xs text-muted-foreground">
              Формула: <span className="text-foreground">{formula}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Період: <span className="text-foreground">{payment.year} рік</span>
              {" · нарахування за "}
              <span className="text-foreground">{payment.period}</span>
            </div>
          </div>

          <div className="rounded-md border border-border/60 p-3 space-y-3">
            <div className="space-y-1">
              <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Розрахунок</div>
              {payment.calculatedFromIncome ? (
                <div className="text-sm">
                  <span className="text-muted-foreground">База: </span>
                  <span className="font-medium tabular-nums">{fmt(payment.calculatedFromIncome)}</span>
                  <span className="text-muted-foreground"> × </span>
                  <span className="font-medium">{payment.taxRate ?? cfg.rate ?? "—"}%</span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="font-semibold tabular-nums">{fmt(payment.amountToPay)}</span>
                </div>
              ) : (
                <div className="text-sm">
                  <span className="font-semibold tabular-nums">{fmt(payment.amountToPay)}</span>
                  <span className="text-muted-foreground"> · фікс. ставка</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Дедлайн:</span>
              <span className="font-medium">
                {format(parseISO(payment.deadline), "dd MMMM yyyy", { locale: uk })}
              </span>
              <span className={cn(
                "text-xs",
                eff === "overdue" ? "text-rose-600 dark:text-rose-400 font-medium" : "text-muted-foreground",
              )}>
                · {human}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded bg-muted/40 p-2">
                <div className="text-[11px] text-muted-foreground">Нараховано</div>
                <div className="font-semibold tabular-nums">{fmt(payment.amountToPay)}</div>
              </div>
              <div className="rounded bg-muted/40 p-2">
                <div className="text-[11px] text-muted-foreground">Сплачено</div>
                <div className="font-semibold tabular-nums text-emerald-600">{fmt(paidAmt)}</div>
              </div>
              <div className="rounded bg-muted/40 p-2">
                <div className="text-[11px] text-muted-foreground">Залишок</div>
                <div className={cn(
                  "font-semibold tabular-nums",
                  remaining > 0 ? "text-foreground" : "text-muted-foreground",
                )}>{fmt(remaining)}</div>
              </div>
            </div>

            {penalty && penalty.total > 0 && (
              <div className="rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-2 text-xs space-y-0.5">
                <div className="flex items-center justify-between font-medium text-rose-700 dark:text-rose-400">
                  <span>Санкції (ст. 124 + 129 ПКУ)</span>
                  <span className="tabular-nums">+{fmt(penalty.total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Штраф</span>
                  <span className="tabular-nums">+{fmt(penalty.fine)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Пеня · {overdueDays} дн.</span>
                  <span className="tabular-nums">+{fmt(penalty.penalty)}</span>
                </div>
              </div>
            )}
          </div>

          <RequisitesBlock taxType={payment.taxType} />
        </div>

        <div className="border-t border-border/60 px-4 py-3 flex flex-wrap items-center gap-2 bg-background">
          <Button
            size="sm"
            variant="default"
            className="gap-1"
            onClick={() => onOpenPayment(payment)}
          >
            <Wallet className="h-3.5 w-3.5" />
            Сплатити
          </Button>

          {onOpenDeclaration && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => onOpenDeclaration(payment.taxType, typeItems)}
            >
              <FileText className="h-3.5 w-3.5" />
              Декларація
              <ArrowRight className="h-3 w-3" />
            </Button>
          )}

          {showIncomeBookAction && onOpenIncomeBook && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1"
              onClick={() => onOpenIncomeBook({ year: payment.year, quarter: payment.quarter })}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Книга доходів
            </Button>
          )}

          {onOpenCalendar && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 ml-auto"
              onClick={onOpenCalendar}
            >
              <Calendar className="h-3.5 w-3.5" />
              Календар
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
