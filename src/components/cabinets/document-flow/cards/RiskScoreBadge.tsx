import { AlertTriangle, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { ContractSummary, PartyInfo } from "@/types/documentSummary";
import type { Document as FlowDocument } from "@/config/documentFlowConfig";

export interface RiskFactor {
  name: string;
  points: number;
  severity: "low" | "medium" | "high" | "critical";
  source?: string; // Reference to document section/clause for transparency
}

export interface RiskScoreResult {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  factors: RiskFactor[];
  financialImpact?: {
    minAmount: number;
    maxAmount: number;
    description: string;
    penaltyType?: string; // Source transparency - which penalty was used
  };
}

/**
 * Calculate risk score based on document analysis
 * Score ranges: 0-25 (low), 26-50 (medium), 51-75 (high), 76-100 (critical)
 */
export const calculateRiskScore = (
  document?: FlowDocument,
  contractData?: ContractSummary["contract"] | null,
  parties?: PartyInfo[],
  complianceWarnings?: string[]
): RiskScoreResult => {
  const factors: RiskFactor[] = [];
  let totalScore = 0;

  // Factor 1: High penalty rate - specifically check late-payment penalties (most relevant for cash flow)
  if (contractData?.penalties && contractData.penalties.length > 0) {
    // Find late-payment penalty specifically
    const latePaymentPenalty = contractData.penalties.find(p => p.type === "late-payment");
    
    if (latePaymentPenalty) {
      const rate = parseFloat(latePaymentPenalty.rate.replace(/[^0-9.,]/g, "").replace(",", "."));
      // Only flag if late-payment rate is unusually high (>= 0.5% per day)
      if (rate >= 0.5) {
        factors.push({ 
          name: `Підвищена ставка штрафу за прострочення (${rate}%)`, 
          points: 20, 
          severity: "high",
          source: "Розділ «Штрафні санкції» — прострочення оплати",
        });
        totalScore += 20;
      }
    }
    
    // Separately check for high non-delivery penalties (informational, lower weight)
    const nonDeliveryPenalty = contractData.penalties.find(p => p.type === "non-delivery");
    if (nonDeliveryPenalty) {
      const rate = parseFloat(nonDeliveryPenalty.rate.replace(/[^0-9.,]/g, "").replace(",", "."));
      if (rate >= 5) {
        factors.push({ 
          name: `Підвищена ставка за невиконання (${rate}%)`, 
          points: 10, 
          severity: "medium",
          source: "Розділ «Штрафні санкції» — невиконання поставки",
        });
        totalScore += 10;
      }
    }
  }

  // Factor 2: Missing legal sections (each = +10 points)
  if (contractData) {
    if (!contractData.penalties || contractData.penalties.length === 0) {
      factors.push({ 
        name: "Штрафні санкції не визначено", 
        points: 10, 
        severity: "medium",
        source: "Юридичний аналіз договору",
      });
      totalScore += 10;
    }
    if (!contractData.termination) {
      factors.push({ 
        name: "Умови розірвання не визначено", 
        points: 10, 
        severity: "medium",
        source: "Юридичний аналіз договору",
      });
      totalScore += 10;
    }
    if (!contractData.disputes) {
      factors.push({ 
        name: "Порядок спорів не визначено", 
        points: 10, 
        severity: "medium",
        source: "Юридичний аналіз договору",
      });
      totalScore += 10;
    }
  }

  // Factor 3: Unknown contractor (+15 points)
  const unknownParty = parties?.find(p => !p.isKnown || p.validationStatus === "pending");
  if (unknownParty) {
    factors.push({ 
      name: "Новий/невідомий контрагент", 
      points: 15, 
      severity: "high",
      source: `Контрагент: ${unknownParty.name} (${unknownParty.code})`,
    });
    totalScore += 15;
  }

  // Factor 4: Invalid contractor (+25 points)
  const invalidParty = parties?.find(p => p.validationStatus === "invalid");
  if (invalidParty) {
    factors.push({ 
      name: "Контрагент не пройшов перевірку", 
      points: 25, 
      severity: "critical",
      source: `Контрагент: ${invalidParty.name} (${invalidParty.code})`,
    });
    totalScore += 25;
  }

  // Factor 5: Compliance warnings (+10 each, max 30)
  if (complianceWarnings && complianceWarnings.length > 0) {
    const warningPoints = Math.min(complianceWarnings.length * 10, 30);
    factors.push({ 
      name: `AI-виявлені ризики (${complianceWarnings.length})`, 
      points: warningPoints, 
      severity: warningPoints >= 20 ? "high" : "medium",
      source: "Автоматичний AI-аналіз документа",
    });
    totalScore += warningPoints;
  }

  // Factor 6: Short termination notice (<14 days)
  if (contractData?.termination && contractData.termination.noticePeriod < 14) {
    factors.push({ 
      name: "Короткий термін повідомлення (<14 днів)", 
      points: 10, 
      severity: "medium",
      source: "Розділ «Умови розірвання»",
    });
    totalScore += 10;
  }

  // Factor 7: Large amount without proper protection
  const amount = document?.amount || 0;
  if (amount > 100000 && (!contractData?.liability || !contractData?.confidentiality)) {
    factors.push({ 
      name: "Великий платіж без повного захисту", 
      points: 15, 
      severity: "high",
      source: "Відсутні: обмеження відповідальності та/або конфіденційність",
    });
    totalScore += 15;
  }

  // Cap at 100
  totalScore = Math.min(totalScore, 100);

  // Determine level
  let level: RiskScoreResult["level"] = "low";
  if (totalScore >= 76) level = "critical";
  else if (totalScore >= 51) level = "high";
  else if (totalScore >= 26) level = "medium";

  // Calculate financial impact - use RELEVANT penalty rate (late-payment), not just max
  let financialImpact: RiskScoreResult["financialImpact"] | undefined;
  
  if (amount > 0 && contractData?.penalties && contractData.penalties.length > 0) {
    // Find late-payment penalty (most relevant for cash flow impact)
    const latePaymentPenalty = contractData.penalties.find(p => p.type === "late-payment");
    const relevantPenalty = latePaymentPenalty || contractData.penalties[0];
    
    const rate = parseFloat(relevantPenalty.rate.replace(/[^0-9.,]/g, "").replace(",", "."));

    if (rate > 0) {
      // Calculate potential penalty for 30 and 90 days
      const dailyPenalty = (amount * rate) / 100;
      const minPenalty = dailyPenalty * 30; // 30 days
      const maxPenalty = dailyPenalty * 90; // 90 days

      financialImpact = {
        minAmount: Math.round(minPenalty),
        maxAmount: Math.round(maxPenalty),
        description: `${rate}% за день × 30-90 днів прострочення`,
        penaltyType: relevantPenalty.type,
      };
    }
  }

  return { score: totalScore, level, factors, financialImpact };
};

interface RiskScoreBadgeProps {
  riskResult: RiskScoreResult;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const levelConfig = {
  low: {
    label: "Низький",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    progressColor: "[&>div]:bg-emerald-500",
    icon: ShieldCheck,
  },
  medium: {
    label: "Середній",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    borderColor: "border-amber-200 dark:border-amber-800",
    progressColor: "[&>div]:bg-amber-500",
    icon: AlertTriangle,
  },
  high: {
    label: "Високий",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    borderColor: "border-orange-200 dark:border-orange-800",
    progressColor: "[&>div]:bg-orange-500",
    icon: ShieldAlert,
  },
  critical: {
    label: "Критичний",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    borderColor: "border-red-200 dark:border-red-800",
    progressColor: "[&>div]:bg-red-500",
    icon: ShieldX,
  },
};

export const RiskScoreBadge = ({
  riskResult,
  showDetails = true,
  compact = false,
  className,
}: RiskScoreBadgeProps) => {
  const config = levelConfig[riskResult.level];
  const Icon = config.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                "gap-1 cursor-help",
                config.bgColor,
                config.borderColor,
                config.color,
                className
              )}
            >
              <Icon className="w-3 h-3" />
              {riskResult.score}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium mb-1">Оцінка ризику: {riskResult.score}/100</p>
            <p className="text-xs text-muted-foreground">{config.label} рівень ризику</p>
            {riskResult.factors.length > 0 && (
              <ul className="text-xs mt-2 space-y-0.5">
                {riskResult.factors.slice(0, 3).map((f, i) => (
                  <li key={i}>• {f.name} (+{f.points})</li>
                ))}
              </ul>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-3 space-y-2",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {/* Header with score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", config.color)} />
          <span className={cn("text-sm font-medium", config.color)}>
            Оцінка ризику
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-lg font-bold", config.color)}>
            {riskResult.score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Progress bar */}
      <Progress
        value={riskResult.score}
        className={cn("h-2", config.progressColor)}
      />

      {/* Level label */}
      <div className="flex items-center justify-between text-xs">
        <span className={config.color}>{config.label} рівень</span>
        {riskResult.factors.length > 0 && (
          <span className="text-muted-foreground">
            {riskResult.factors.length} фактор(и)
          </span>
        )}
      </div>

      {/* Financial impact */}
      {riskResult.financialImpact && (
        <div className="pt-2 border-t border-current/10">
          <p className="text-xs text-muted-foreground mb-1">Потенційний вплив:</p>
          <p className={cn("text-sm font-medium", config.color)}>
            до {formatCurrency(riskResult.financialImpact.maxAmount)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {riskResult.financialImpact.description}
          </p>
        </div>
      )}

      {/* Risk factors (expandable) with source attribution */}
      {showDetails && riskResult.factors.length > 0 && (
        <div className="pt-2 border-t border-current/10 space-y-1.5">
          <p className="text-xs text-muted-foreground">Фактори ризику:</p>
          {riskResult.factors.map((factor, i) => (
            <div key={i} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate">{factor.name}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] h-4 px-1.5 shrink-0",
                    factor.severity === "critical" && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
                    factor.severity === "high" && "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
                    factor.severity === "medium" && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                    factor.severity === "low" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  )}
                >
                  +{factor.points}
                </Badge>
              </div>
              {/* Source attribution for transparency */}
              {factor.source && (
                <p className="text-[10px] text-muted-foreground pl-2 italic">
                  📍 {factor.source}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
