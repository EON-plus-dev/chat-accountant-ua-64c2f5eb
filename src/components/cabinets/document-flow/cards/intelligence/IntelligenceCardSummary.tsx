import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InlineSectionAlert } from "@/components/ui/InlineSectionAlert";
import { RiskScoreBadge, type RiskScoreResult } from "../RiskScoreBadge";
import { RegulatoryBadges, type RegulatoryStatus } from "../RegulatoryBadges";
import type { IntelligenceCardSummaryProps, AggregatedAlert } from "./types";

interface ExtendedSummaryProps extends IntelligenceCardSummaryProps {
  riskResult?: RiskScoreResult | null;
  regulatoryStatus?: RegulatoryStatus | null;
}

export const IntelligenceCardSummary = ({
  shortSummary,
  alerts,
  isExpired = false,
  hasNewContractor = false,
  pendingContractorCode,
  onNavigateToContractor,
  isCompact = false,
  onExpandDetails,
  riskResult,
  regulatoryStatus,
}: ExtendedSummaryProps) => {
  // Compact mode for mobile
  if (isCompact) {
    const criticalAlerts = alerts.filter(a => a.severity === "critical");
    
    return (
      <div className="space-y-2">
        <p className="text-sm line-clamp-2">{shortSummary}</p>
        
        <div className="flex items-center gap-2 flex-wrap">
          {riskResult && riskResult.level !== "low" && (
            <RiskScoreBadge riskResult={riskResult} compact />
          )}
          {criticalAlerts.slice(0, 1).map((alert, i) => (
            <Badge key={i} variant="destructive" className="text-xs">
              {alert.text}
            </Badge>
          ))}
        </div>
        
        {onExpandDetails && (
          <Button variant="ghost" size="sm" onClick={onExpandDetails} className="w-full">
            Детальніше <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-3">
      {/* AI Summary Text */}
      <p className="text-sm text-foreground/90 leading-relaxed">
        {shortSummary}
      </p>
      
      {/* Critical alerts are consolidated in RiskScoreBadge */}
      
      {/* Risk Score Badge */}
      {riskResult && riskResult.score > 0 && (
        <RiskScoreBadge riskResult={riskResult} showDetails={riskResult.level !== "low"} />
      )}
      
      {/* Regulatory Status */}
      {regulatoryStatus && (regulatoryStatus.kved || regulatoryStatus.taxRegime) && (
        <RegulatoryBadges status={regulatoryStatus} compact />
      )}
    </div>
  );
};
