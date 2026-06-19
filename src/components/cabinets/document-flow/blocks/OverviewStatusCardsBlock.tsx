/**
 * OverviewStatusCardsBlock — Блок "Статуси" (юридичний, підписний, обліковий)
 * Відображає 3 компактні картки зі статусами
 */

import { Scale, FileSignature, Calculator, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Document as FlowDocument } from "@/config/documentFlowConfig";
import type { CabinetType } from "@/types/cabinet";

interface OverviewStatusCardsBlockProps {
  document: FlowDocument;
  signatureStatus?: "none" | "pending-our" | "pending-counterparty" | "fully-signed";
  accountingStatus?: "not-applicable" | "pending" | "posted" | "reconciled";
  taxStatus?: "not-applicable" | "pending" | "declared" | "paid";
  cabinetType?: CabinetType;
  className?: string;
}

// Legal status derived from document status
const getLegalStatus = (documentStatus: string): {
  label: string;
  variant: "default" | "warning" | "success" | "destructive";
  icon: typeof Scale;
} => {
  const statusMap: Record<string, { label: string; variant: "default" | "warning" | "success" | "destructive"; icon: typeof Scale }> = {
    draft: { label: "Чернетка", variant: "default", icon: Clock },
    "needs-clarification": { label: "На узгодженні", variant: "warning", icon: AlertTriangle },
    "pending-sign": { label: "Очікує підпису", variant: "default", icon: Clock },
    signed: { label: "Узгоджено", variant: "success", icon: CheckCircle2 },
    sent: { label: "Узгоджено", variant: "success", icon: CheckCircle2 },
    confirmed: { label: "Узгоджено", variant: "success", icon: CheckCircle2 },
    disputed: { label: "Спір", variant: "destructive", icon: AlertTriangle },
    cancelled: { label: "Скасовано", variant: "destructive", icon: XCircle },
    archived: { label: "Архів", variant: "default", icon: CheckCircle2 },
  };
  
  return statusMap[documentStatus] || { label: documentStatus, variant: "default", icon: Scale };
};

// Signature status labels
const getSignatureStatusInfo = (status?: string): {
  label: string;
  sublabel?: string;
  variant: "default" | "warning" | "success";
} => {
  const statusMap: Record<string, { label: string; sublabel?: string; variant: "default" | "warning" | "success" }> = {
    none: { label: "Не підписано", variant: "default" },
    "pending-our": { label: "Очікує нашого підпису", sublabel: "0/2 підписів", variant: "warning" },
    "pending-counterparty": { label: "Очікує контрагента", sublabel: "1/2 підписів", variant: "warning" },
    "fully-signed": { label: "Повністю підписано", sublabel: "2/2 підписів", variant: "success" },
  };
  
  return statusMap[status || "none"] || { label: "Невідомо", variant: "default" };
};

// Accounting status labels
const getAccountingStatusInfo = (status?: string, cabinetType?: CabinetType): {
  label: string;
  sublabel?: string;
  variant: "default" | "warning" | "success";
} => {
  const statusMap: Record<string, { label: string; sublabel?: string; variant: "default" | "warning" | "success" }> = {
    "not-applicable": { label: "Не застосовується", variant: "default" },
    pending: { label: "Очікує проведення", variant: "warning" },
    posted: { label: "Проведено в обліку", variant: "success" },
    reconciled: { label: "Звірено", sublabel: cabinetType === "fop" ? "Враховано в Книзі" : "Проведено", variant: "success" },
  };
  
  return statusMap[status || "not-applicable"] || { label: "Невідомо", variant: "default" };
};

// Tax status labels
const getTaxStatusInfo = (status?: string, cabinetType?: CabinetType): {
  label: string;
  sublabel?: string;
  variant: "default" | "warning" | "success";
} => {
  if (cabinetType === "fop") {
    const statusMap: Record<string, { label: string; sublabel?: string; variant: "default" | "warning" | "success" }> = {
      "not-applicable": { label: "Не впливає на ліміт", variant: "default" },
      pending: { label: "Очікує обліку", variant: "warning" },
      declared: { label: "Включено в декларацію", sublabel: "Впливає на ліміт ФОП", variant: "success" },
      paid: { label: "Податок сплачено", variant: "success" },
    };
    return statusMap[status || "not-applicable"] || { label: "Невідомо", variant: "default" };
  }
  
  // TOV
  const statusMap: Record<string, { label: string; sublabel?: string; variant: "default" | "warning" | "success" }> = {
    "not-applicable": { label: "Не застосовується", variant: "default" },
    pending: { label: "Очікує декларування", variant: "warning" },
    declared: { label: "Задекларовано", variant: "success" },
    paid: { label: "Податок сплачено", variant: "success" },
  };
  
  return statusMap[status || "not-applicable"] || { label: "Невідомо", variant: "default" };
};

interface StatusCardProps {
  icon: typeof Scale;
  title: string;
  status: {
    label: string;
    sublabel?: string;
    variant: "default" | "warning" | "success" | "destructive";
  };
}

const StatusCard = ({ icon: Icon, title, status }: StatusCardProps) => {
  const variantClasses = {
    default: "border-muted bg-muted/30",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
    success: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30",
    destructive: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30",
  };

  const iconClasses = {
    default: "text-muted-foreground",
    warning: "text-amber-600 dark:text-amber-400",
    success: "text-emerald-600 dark:text-emerald-400",
    destructive: "text-red-600 dark:text-red-400",
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border",
      variantClasses[status.variant]
    )}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={cn("w-4 h-4", iconClasses[status.variant])} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
      </div>
      <p className="text-sm font-medium">{status.label}</p>
      {status.sublabel && (
        <p className="text-xs text-muted-foreground mt-0.5">{status.sublabel}</p>
      )}
    </div>
  );
};

export const OverviewStatusCardsBlock = ({
  document,
  signatureStatus,
  accountingStatus,
  taxStatus,
  cabinetType,
  className,
}: OverviewStatusCardsBlockProps) => {
  const legalStatus = getLegalStatus(document.status);
  const sigStatus = getSignatureStatusInfo(signatureStatus);
  const accStatus = getAccountingStatusInfo(accountingStatus, cabinetType);
  const taxStatusInfo = getTaxStatusInfo(taxStatus, cabinetType);

  // Determine actual signature status from document if not provided
  const effectiveSignStatus = signatureStatus ? sigStatus : {
    label: document.status === "signed" || document.status === "sent" ? "Підписано" : "Не підписано",
    sublabel: document.status === "signed" || document.status === "sent" ? "КЕП" : undefined,
    variant: (document.status === "signed" || document.status === "sent" ? "success" : "default") as "success" | "default",
  };

  return (
    <Card className={cn("overflow-hidden", className)} data-section="status-cards">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          Статуси
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Legal Status */}
          <StatusCard
            icon={Scale}
            title="Юридичний"
            status={{
              label: legalStatus.label,
              variant: legalStatus.variant,
            }}
          />
          
          {/* Signature Status */}
          <StatusCard
            icon={FileSignature}
            title="Підписання"
            status={effectiveSignStatus}
          />
          
          {/* Accounting/Tax Status */}
          <StatusCard
            icon={Calculator}
            title={cabinetType === "fop" ? "Облік/Ліміт" : "Облік"}
            status={{
              label: accStatus.label,
              sublabel: taxStatusInfo.label !== "Не застосовується" ? taxStatusInfo.sublabel : accStatus.sublabel,
              variant: accStatus.variant,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
