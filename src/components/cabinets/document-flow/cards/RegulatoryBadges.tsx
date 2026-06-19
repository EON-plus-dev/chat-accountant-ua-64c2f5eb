import { CheckCircle2, AlertTriangle, XCircle, Clock, Building2, FileCheck, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface RegulatoryStatus {
  kved?: {
    code: string;
    isMatch: boolean;
    description?: string;
  };
  license?: {
    required: boolean;
    status: "valid" | "expired" | "expiring" | "missing" | "not-required";
    expiryDate?: string;
    daysUntilExpiry?: number;
    name?: string;
  };
  taxRegime?: {
    group: number;
    rate: number;
    isVatPayer: boolean;
    label: string;
  };
}

interface RegulatoryBadgesProps {
  status: RegulatoryStatus;
  compact?: boolean;
  className?: string;
}

const StatusIcon = ({ status }: { status: "valid" | "warning" | "error" | "pending" }) => {
  switch (status) {
    case "valid":
      return <CheckCircle2 className="w-3 h-3 text-emerald-500" />;
    case "warning":
      return <AlertTriangle className="w-3 h-3 text-amber-500" />;
    case "error":
      return <XCircle className="w-3 h-3 text-red-500" />;
    case "pending":
      return <Clock className="w-3 h-3 text-muted-foreground" />;
  }
};

export const RegulatoryBadges = ({
  status,
  compact = false,
  className,
}: RegulatoryBadgesProps) => {
  const { kved, license, taxRegime } = status;

  // Determine license visual status
  const getLicenseStatus = () => {
    if (!license) return null;
    if (license.status === "not-required") return { visual: "valid" as const, label: "Не потрібна" };
    if (license.status === "valid") {
      if (license.daysUntilExpiry !== undefined && license.daysUntilExpiry <= 30) {
        return { visual: "warning" as const, label: `Спливає через ${license.daysUntilExpiry} дн.` };
      }
      return { visual: "valid" as const, label: "Дійсна" };
    }
    if (license.status === "expiring") {
      return { visual: "warning" as const, label: `Спливає ${license.expiryDate}` };
    }
    if (license.status === "expired") return { visual: "error" as const, label: "Прострочена" };
    if (license.status === "missing") return { visual: "error" as const, label: "Відсутня" };
    return null;
  };

  const licenseStatus = getLicenseStatus();

  if (compact) {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {/* KVED Badge */}
        {kved && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1 text-[10px] cursor-help",
                    kved.isMatch
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                  )}
                >
                  <StatusIcon status={kved.isMatch ? "valid" : "warning"} />
                  КВЕД {kved.code}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{kved.isMatch ? "КВЕД співпадає" : "КВЕД не співпадає"}</p>
                {kved.description && <p className="text-xs text-muted-foreground">{kved.description}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* License Badge - only show if license is actually required */}
        {licenseStatus && license?.required && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1 text-[10px] cursor-help",
                    licenseStatus.visual === "valid" && "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
                    licenseStatus.visual === "warning" && "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
                    licenseStatus.visual === "error" && "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/50 dark:text-red-400"
                  )}
                >
                  <StatusIcon status={licenseStatus.visual} />
                  Ліцензія
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{license?.name || "Ліцензія"}</p>
                <p className="text-xs text-muted-foreground">{licenseStatus.label}</p>
                {license?.expiryDate && license.status !== "not-required" && (
                  <p className="text-xs">до {license.expiryDate}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Tax Regime Badge */}
        {taxRegime && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="gap-1 text-[10px] cursor-help border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                >
                  <Receipt className="w-3 h-3" />
                  {taxRegime.label}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{taxRegime.group} група, {taxRegime.rate}%</p>
                <p className="text-xs text-muted-foreground">
                  {taxRegime.isVatPayer ? "Платник ПДВ" : "Не платник ПДВ"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
        Регуляторний статус
      </p>
      
      <div className="grid gap-2">
        {/* KVED Row */}
        {kved && (
          <div className={cn(
            "flex items-center justify-between p-2.5 rounded-lg border",
            kved.isMatch
              ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
          )}>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">КВЕД {kved.code}</p>
                {kved.description && (
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {kved.description}
                  </p>
                )}
              </div>
            </div>
            <StatusIcon status={kved.isMatch ? "valid" : "warning"} />
          </div>
        )}

        {/* License Row */}
        {licenseStatus && license && (
          <div className={cn(
            "flex items-center justify-between p-2.5 rounded-lg border",
            licenseStatus.visual === "valid" && "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
            licenseStatus.visual === "warning" && "bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
            licenseStatus.visual === "error" && "bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
          )}>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{license.name || "Ліцензія"}</p>
                <p className="text-xs text-muted-foreground">{licenseStatus.label}</p>
              </div>
            </div>
            <StatusIcon status={licenseStatus.visual} />
          </div>
        )}

        {/* Tax Regime Row */}
        {taxRegime && (
          <div className="flex items-center justify-between p-2.5 rounded-lg border bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{taxRegime.label}</p>
                <p className="text-xs text-muted-foreground">
                  {taxRegime.isVatPayer ? "Платник ПДВ" : "Без ПДВ"}
                </p>
              </div>
            </div>
            <CheckCircle2 className="w-3 h-3 text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to extract regulatory status from document and cabinet
export const extractRegulatoryStatus = (
  cabinetType: string,
  cabinetTaxId?: string,
  compliance?: { 
    kvedMatch?: boolean; 
    kvedRequired?: string[]; 
    licenseRequired?: string[]; 
    licenseMissing?: string[]; 
  }
): RegulatoryStatus => {
  const status: RegulatoryStatus = {};

  // KVED from compliance
  if (compliance?.kvedRequired && compliance.kvedRequired.length > 0) {
    status.kved = {
      code: compliance.kvedRequired[0],
      isMatch: compliance.kvedMatch ?? true,
      description: compliance.kvedMatch ? "Відповідає основному виду діяльності" : "Не співпадає з КВЕДом",
    };
  }

  // License from compliance
  if (compliance?.licenseRequired && compliance.licenseRequired.length > 0) {
    const hasMissing = compliance.licenseMissing && compliance.licenseMissing.length > 0;
    status.license = {
      required: true,
      status: hasMissing ? "missing" : "valid",
      name: compliance.licenseRequired[0],
    };
  } else {
    status.license = {
      required: false,
      status: "not-required",
    };
  }

  // Tax regime based on cabinet type
  if (cabinetType === "fop") {
    status.taxRegime = {
      group: 3,
      rate: 5,
      isVatPayer: false,
      label: "3 група ФОП",
    };
  } else if (cabinetType === "tov") {
    status.taxRegime = {
      group: 0,
      rate: 18,
      isVatPayer: true,
      label: "Загальна система",
    };
  }

  return status;
};
