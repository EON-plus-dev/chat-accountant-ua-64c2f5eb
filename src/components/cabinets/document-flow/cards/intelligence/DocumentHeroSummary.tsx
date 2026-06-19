import { AlertTriangle, CheckCircle2, Clock, ArrowRight, Building2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { PartyInfo, KeyDate } from "@/types/documentSummary";
import type { RiskScoreResult } from "../RiskScoreBadge";
import type { DocumentCategory } from "@/config/documentFlowConfig";
import { DocumentRegistrationBadge } from "./DocumentRegistrationBadge";

export interface DocumentHeroSummaryProps {
  shortSummary: string;
  subject?: string;
  amount?: number;
  currency?: string;
  supplier?: PartyInfo;
  buyer?: PartyInfo;
  validityDate?: KeyDate;
  isExpired?: boolean;
  riskLevel?: RiskScoreResult["level"];
  documentStatus?: string;
  className?: string;
  // Registration props
  documentNumber?: string;
  documentCategory?: DocumentCategory;
  retentionYears?: number;
  retentionDeadline?: string;
  humanVerified?: boolean;
}

export const DocumentHeroSummary = ({
  shortSummary,
  subject,
  amount,
  currency = "UAH",
  supplier,
  buyer,
  validityDate,
  isExpired = false,
  riskLevel,
  documentStatus,
  className,
  // Registration props
  documentNumber,
  documentCategory,
  retentionYears,
  retentionDeadline,
  humanVerified,
}: DocumentHeroSummaryProps) => {
  // Determine background based on status
  const getBackgroundStyle = () => {
    if (isExpired) {
      return "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
    }
    if (riskLevel === "critical") {
      return "bg-red-50/60 dark:bg-red-950/30 border-red-200 dark:border-red-800";
    }
    if (riskLevel === "high") {
      return "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
    }
    return "bg-muted/40 border-border/50";
  };

  // Format the main status message
  const getStatusMessage = () => {
    if (isExpired && validityDate?.daysUntil !== undefined) {
      const daysAgo = Math.abs(validityDate.daysUntil);
      return {
        icon: AlertTriangle,
        text: `Прострочено — термін дії закінчився ${daysAgo} дн. тому`,
        color: "text-amber-700 dark:text-amber-400",
      };
    }
    if (riskLevel === "critical") {
      return {
        icon: AlertTriangle,
        text: "Виявлено критичні ризики",
        color: "text-red-700 dark:text-red-400",
      };
    }
    if (documentStatus === "pending-sign") {
      return {
        icon: Clock,
        text: "Очікує підпису",
        color: "text-amber-600 dark:text-amber-400",
      };
    }
    if (documentStatus === "signed" || documentStatus === "confirmed") {
      return {
        icon: CheckCircle2,
        text: "Документ підписано",
        color: "text-emerald-600 dark:text-emerald-400",
      };
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  // Role labels
  const roleLabels: Record<string, string> = {
    supplier: "Постачальник",
    buyer: "Замовник",
    executor: "Виконавець",
    client: "Клієнт",
  };

  return (
    <div className={cn(
      "rounded-lg border p-4 space-y-3",
      getBackgroundStyle(),
      className
    )}>
      {/* Registration Badge (if available) */}
      {documentNumber && documentCategory && retentionYears && (
        <DocumentRegistrationBadge
          number={documentNumber}
          category={documentCategory}
          retentionYears={retentionYears}
          retentionDeadline={retentionDeadline}
          humanVerified={humanVerified}
        />
      )}

      {/* Status Banner (if applicable) */}
      {statusMessage && (
        <div className={cn("flex items-center gap-2", statusMessage.color)}>
          <statusMessage.icon className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Main Summary Text */}
      <p className="text-sm text-foreground/90 leading-relaxed">
        {shortSummary}
      </p>

      {/* Compact Info Row: Amount + Parties */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
        {/* Amount */}
        {amount && amount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">💰</span>
            <span className="font-bold">
              {currency !== "UAH" 
                ? `${amount.toLocaleString("uk-UA")} ${currency}` 
                : formatCurrency(amount)
              }
            </span>
          </div>
        )}

        {/* Parties inline */}
        {(supplier || buyer) && (
          <div className="flex items-center gap-1.5 text-muted-foreground flex-wrap">
            {supplier && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span className="font-medium text-foreground">{supplier.name}</span>
              </span>
            )}
            {supplier && buyer && (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
            {buyer && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span className="font-medium text-foreground">{buyer.name}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Validity Date (if critical) */}
      {validityDate && validityDate.daysUntil !== undefined && (
        <div className={cn(
          "flex items-center gap-1.5 text-xs",
          isExpired 
            ? "text-amber-700 dark:text-amber-400" 
            : validityDate.daysUntil <= 7 
            ? "text-amber-600 dark:text-amber-400"
            : "text-muted-foreground"
        )}>
          <span>📅</span>
          <span>
            {validityDate.label}: {new Date(validityDate.date).toLocaleDateString("uk-UA")}
            {isExpired ? (
              <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0">
                ПРОСТРОЧЕНО
              </Badge>
            ) : validityDate.daysUntil <= 7 ? (
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700">
                {validityDate.daysUntil} дн.
              </Badge>
            ) : null}
          </span>
        </div>
      )}
    </div>
  );
};
