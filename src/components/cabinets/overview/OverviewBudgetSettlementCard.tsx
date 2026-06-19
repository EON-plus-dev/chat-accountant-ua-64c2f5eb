import { useMemo } from "react";
import { Receipt, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { computeBudgetSettlement } from "@/lib/analytics/budgetSettlementEngine";
import { formatCurrency, formatCompact } from "@/lib/formatters";
import type { TaxPayment } from "@/config/paymentsConfig";
import { useOverviewBp } from "./OverviewBpContext";

interface Props {
  taxPayments: TaxPayment[];
  /** Натиск CTA (футер). Для ФОП веде у підрозділ «Податки», для решти — у «Платежі». */
  onOpenPayments: () => void;
  onOpenAnalytics: () => void;
  /** Клік по конкретному рядку у списку несплачених. Якщо не передано — рядки не клікабельні. */
  onOpenTaxPayment?: (paymentId: string) => void;
  /** Текст CTA в футері. Default: «Платежі». */
  ctaLabel?: string;
  variant?: "card" | "inline";
}

export function OverviewBudgetSettlementCard({
  taxPayments,
  onOpenPayments,
  onOpenAnalytics,
  onOpenTaxPayment,
  ctaLabel = "Платежі",
  variant = "card",
}: Props) {
  const { isAtLeast, bp } = useOverviewBp();
  const summary = useMemo(
    () => computeBudgetSettlement(taxPayments, "month"),
    [taxPayments],
  );
  const isWide = isAtLeast("md");
  const compactNum = bp === "xs";
  const fmt = (n: number) => (compactNum ? formatCompact(n) : formatCurrency(n));

  if (summary.byType.length === 0) {
    return (
      <Card className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Receipt className="w-4 h-4 text-primary" />
            Стан розрахунків з бюджетом
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Цього місяця нарахувань немає.
        </CardContent>
      </Card>
    );
  }

  const ratio = Math.max(0, Math.min(1, summary.paymentRatio));
  const ratioPct = Math.round(ratio * 100);
  const tone =
    ratio >= 0.95 ? "success" : ratio >= 0.7 ? "warning" : "danger";
  const toneText =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-destructive";
  const progressIndicator =
    tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-destructive";

  const top = summary.byType.slice(0, isWide ? 3 : 2);

  type Stat = { label: string; value: number; tone: string; icon?: React.ReactNode };
  const stats: Stat[] = [
    { label: "Нараховано", value: summary.accrued, tone: "text-foreground" },
    { label: "Сплачено", value: summary.paid, tone: "text-success", icon: <CheckCircle2 className="w-3.5 h-3.5 text-success" /> },
    {
      label: summary.overdueAmount > 0 ? "Прострочено" : "До сплати",
      value: summary.overdueAmount > 0 ? summary.overdueAmount : summary.debt,
      tone: summary.overdueAmount > 0 ? "text-destructive" : summary.debt > 0 ? "text-warning" : "text-success",
      icon: summary.overdueAmount > 0 ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> : undefined,
    },
  ];

  if (variant === "inline") {
    const borderTone =
      tone === "success"
        ? "border-success/30 bg-success/5"
        : tone === "warning"
          ? "border-warning/30 bg-warning/5"
          : "border-destructive/30 bg-destructive/5";

    const MONTHS_UK = [
      "січень", "лютий", "березень", "квітень", "травень", "червень",
      "липень", "серпень", "вересень", "жовтень", "листопад", "грудень",
    ];
    // Use April 2026 per project data baseline
    const periodDate = new Date(2026, 3, 1);
    const monthLabel = MONTHS_UK[periodDate.getMonth()];
    const monthTitle = `${monthLabel[0].toUpperCase()}${monthLabel.slice(1)} ${periodDate.getFullYear()}`;

    const remaining = Math.max(0, summary.accrued - summary.paid);
    const hint =
      summary.overdueAmount > 0
        ? { text: `Прострочено: ${fmt(summary.overdueAmount)}`, tone: "text-destructive" }
        : ratio >= 0.95
          ? { text: "Майже все сплачено", tone: toneText }
          : ratio >= 0.7
            ? { text: `Залишилось доплатити ${fmt(remaining)}`, tone: toneText }
            : { text: `Заборгованість: ${fmt(remaining)}`, tone: toneText };

    const tooltip = `Частка сплачених податків від нарахованих за ${monthLabel}. ${fmt(summary.paid)} з ${fmt(summary.accrued)} грн`;

    return (
      <div className={cn("flex flex-col gap-2 p-3 rounded-lg border min-w-0", borderTone)}>
        {/* Header */}
        <div className={cn("flex gap-x-2 gap-y-0.5 min-w-0", compactNum ? "flex-col" : "flex-row items-center justify-between")}>
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 min-w-0">
            <Receipt className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">Розрахунки з бюджетом</span>
          </span>
          <span className={cn("text-[11px] text-muted-foreground shrink-0", compactNum && "leading-none pl-5")}>
            {monthTitle}
          </span>
        </div>

        {/* Main metrics row */}
        <div className="flex items-center gap-3 min-w-0" title={tooltip}>
          <CheckCircle2 className={cn("w-5 h-5 shrink-0", toneText)} />
          <div className="flex-1 min-w-0">
            <div className={cn("text-sm font-semibold tabular-nums leading-tight truncate", toneText)}>
              Сплачено {ratioPct}%
            </div>
            <div className="text-[11px] text-muted-foreground tabular-nums leading-tight mt-0.5 truncate">
              з нарахованих {fmt(summary.accrued)}
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] text-muted-foreground leading-tight">Залишок</span>
            <span className={cn("text-sm font-bold tabular-nums leading-tight whitespace-nowrap", toneText)}>
              {fmt(remaining)}
            </span>
          </div>
        </div>

        {/* Full-width progress */}
        <div className="space-y-1">
          <Progress
            value={ratioPct}
            className="h-2 w-full"
            indicatorClassName={progressIndicator}
          />
          <div className="flex justify-between gap-2 text-[11px] text-muted-foreground tabular-nums">
            <span className="truncate min-w-0">{fmt(summary.paid)} з {fmt(summary.accrued)}</span>
            <span className={cn("font-semibold shrink-0", toneText)}>{ratioPct}%</span>
          </div>
        </div>

        {/* Несплачені — топ-4 (прострочені вгорі) */}
        {summary.unpaid.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-border/50">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              Несплачені цього місяця · {summary.unpaid.length}
            </div>
            <ul className="space-y-0.5">
              {summary.unpaid.slice(0, 4).map((item) => {
                const dueText = item.isOverdue
                  ? `прострочено ${Math.abs(item.daysToDeadline)} дн.`
                  : item.daysToDeadline === 0
                    ? "сьогодні"
                    : item.daysToDeadline === 1
                      ? "завтра"
                      : `до ${new Date(item.deadline).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" })}`;
                const Row = onOpenTaxPayment ? "button" : "div";
                return (
                  <Row
                    key={item.id}
                    type={onOpenTaxPayment ? "button" : undefined}
                    onClick={onOpenTaxPayment ? () => onOpenTaxPayment(item.id) : undefined}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 text-[11px] py-1 px-1.5 rounded-sm text-left",
                      onOpenTaxPayment && "hover:bg-muted/60 transition-colors cursor-pointer",
                    )}
                  >
                    <span className="flex items-center gap-1.5 min-w-0 flex-1">
                      {item.isOverdue && (
                        <AlertTriangle className="w-3 h-3 shrink-0 text-destructive" />
                      )}
                      <span className="truncate text-foreground font-medium">
                        {item.label}
                      </span>
                      <span className="text-muted-foreground truncate">
                        · {item.period}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0 tabular-nums">
                      <span className="font-semibold text-foreground">{fmt(item.amount)}</span>
                      <span className={cn("text-[10px]", item.isOverdue ? "text-destructive" : "text-muted-foreground")}>
                        {dueText}
                      </span>
                    </span>
                  </Row>
                );
              })}
            </ul>
            {summary.unpaid.length > 4 && (
              <div className="text-[10px] text-muted-foreground pl-1.5">
                та ще {summary.unpaid.length - 4} позиц.
              </div>
            )}
          </div>
        )}

        {/* Hint + CTA */}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-auto">
          <span className={cn("text-[11px] flex items-center gap-1 min-w-0 flex-1 basis-full sm:basis-auto", hint.tone)}>
            {summary.overdueAmount > 0 && <AlertTriangle className="w-3 h-3 shrink-0" />}
            <span className="truncate">{hint.text}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1 shrink-0 ml-auto"
            onClick={onOpenPayments}
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Receipt className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">Стан розрахунків з бюджетом</span>
          </div>
          <span className="text-xs font-normal text-muted-foreground shrink-0">цей місяць</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className={cn("grid gap-3", isWide ? "grid-cols-3" : "grid-cols-1")}>
          {stats.map((s) => (
            <div
              key={s.label}
              className={cn(
                "rounded-md border border-border/60 bg-muted/20 px-3 py-2",
                !isWide && "flex items-baseline justify-between",
              )}
            >
              <div className={cn("flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground", !isWide && "mb-0")}>
                {s.icon}
                <span className="truncate">{s.label}</span>
              </div>
              <div className={cn("font-bold tabular-nums tracking-tight", s.tone, isWide ? "text-lg mt-0.5" : "text-base")}>
                {fmt(s.value)}
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Сплачено від нарахованого</span>
            <span className={cn("font-semibold tabular-nums", toneText)}>{ratioPct}%</span>
          </div>
          <Progress value={ratioPct} className="h-1.5" indicatorClassName={progressIndicator} />
        </div>

        {/* Top by type */}
        <div className="space-y-1.5">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
            За типами
          </div>
          <ul className="space-y-1">
            {top.map((t) => {
              const itemRatio = t.accrued > 0 ? Math.round((t.paid / t.accrued) * 100) : 100;
              const itemTone = t.overdueAmount > 0 ? "text-destructive" : t.debt > 0 ? "text-warning" : "text-success";
              return (
                <li
                  key={t.taxType}
                  className="flex items-center justify-between gap-3 text-sm py-1"
                >
                  <span className="truncate min-w-0 text-foreground">{t.label}</span>
                  <div className="flex items-center gap-3 shrink-0 text-xs tabular-nums">
                    <span className="text-muted-foreground">
                      {fmt(t.paid)} / {fmt(t.accrued)}
                    </span>
                    <span className={cn("font-semibold w-10 text-right", itemTone)}>
                      {itemRatio}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" variant="outline" className="h-8 text-xs flex-1" onClick={onOpenPayments}>
            Перейти до {ctaLabel}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
          {isWide && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={onOpenAnalytics}
            >
              Деталі в Аналітиці
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
