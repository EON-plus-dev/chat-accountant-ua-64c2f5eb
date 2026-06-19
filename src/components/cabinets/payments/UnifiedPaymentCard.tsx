/**
 * Unified Payment Card - Mobile view
 * Compact card for displaying unified payment in mobile lists.
 * Прибрано дубль "Назва" === "Контрагент" — для salary/contractor/income
 * у назві показуємо суть операції (description/period), контрагента — підрядком.
 */

import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { ExternalLink, User2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type UnifiedPayment,
  paymentTypeConfig,
  directionConfig,
  unifiedStatusConfig,
  isContractorPayment,
  isIncomeBookRecord,
  isTaxPayment,
} from "@/config/unifiedPaymentsConfig";

function getCounterparty(payment: UnifiedPayment): string | null {
  const data = payment.sourceData;
  if (isContractorPayment(data)) return data.contractor;
  if (isIncomeBookRecord(data)) return data.contractor || null;
  if (isTaxPayment(data)) return "ДПС України";
  // salary
  return payment.entityName;
}

/** Назва операції — без дублювання контрагента. */
function getOperationTitle(payment: UnifiedPayment, counterparty: string | null): string {
  if (isTaxPayment(payment.sourceData)) return payment.entityName;
  // Якщо назва дублює контрагента — беремо опис/період
  if (counterparty && payment.entityName === counterparty) {
    return payment.description || payment.period || payment.entityName;
  }
  return payment.entityName;
}

interface UnifiedPaymentCardProps {
  payment: UnifiedPayment;
  onClick: () => void;
  onNavigateToReport?: (reportId: string) => void;
}

export function UnifiedPaymentCard({ payment, onClick, onNavigateToReport }: UnifiedPaymentCardProps) {
  const typeConfig = paymentTypeConfig[payment.paymentType];
  const dirConfig = directionConfig[payment.direction];
  const statusConfig = unifiedStatusConfig[payment.status] || {
    label: payment.statusLabel,
    badgeClass: "bg-slate-100 text-slate-600",
  };
  const DirIcon = dirConfig.icon;
  const counterparty = getCounterparty(payment);
  const title = getOperationTitle(payment, counterparty);
  // Показуємо контрагента підрядком тільки якщо він НЕ дублює title
  const showCounterpartyLine = counterparty && counterparty !== title;

  return (
    <Card
      className="p-3 cursor-pointer hover:bg-accent/50 transition-colors active:scale-[0.99]"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon + Info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Direction Icon */}
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            payment.direction === "in" 
              ? "bg-emerald-100 dark:bg-emerald-950/50" 
              : "bg-rose-100 dark:bg-rose-950/50"
          )}>
            <DirIcon className={cn("h-4 w-4", dirConfig.iconClass)} />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm truncate">
                {title}
              </span>
              <Badge 
                variant="secondary" 
                size="sm"
                className={cn("flex-shrink-0 text-[10px] px-1.5", typeConfig.badgeClass)}
              >
                {typeConfig.shortLabel}
              </Badge>
            </div>
            
            {showCounterpartyLine && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground truncate mb-0.5">
                <User2 className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{counterparty}</span>
              </p>
            )}

            {payment.description && payment.description !== title && (
              <p className="text-xs text-muted-foreground truncate mb-1">
                {payment.description}
              </p>
            )}

            {payment.relatedReportId && onNavigateToReport && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToReport(payment.relatedReportId!);
                }}
                className="mb-1 inline-flex items-center gap-0.5 text-[11px] text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                До звіту
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {format(new Date(payment.date), "dd MMM yyyy", { locale: uk })}
              </span>
              <Badge 
                variant="secondary" 
                size="sm"
                className={cn("text-[10px] px-1.5", statusConfig.badgeClass)}
              >
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right: Amount */}
        <div className="flex-shrink-0 text-right">
          <span className={cn(
            "font-semibold tabular-nums",
            dirConfig.amountClass
          )}>
            {payment.direction === "in" ? "+" : "−"}₴{payment.amount.toLocaleString("uk-UA")}
          </span>
        </div>
      </div>
    </Card>
  );
}
