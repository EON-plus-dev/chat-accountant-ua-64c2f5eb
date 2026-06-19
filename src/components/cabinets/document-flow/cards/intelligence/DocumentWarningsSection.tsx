import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { RiskScoreResult, RiskFactor } from "../RiskScoreBadge";
import type { LegalSectionsSummary } from "./types";

export interface DocumentWarning {
  id: string;
  type: "risk" | "legal" | "compliance" | "contractor" | "expiry";
  severity: "critical" | "high" | "medium";
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

interface DocumentWarningsSectionProps {
  warnings: DocumentWarning[];
  riskResult?: RiskScoreResult | null;
  legalSummary?: LegalSectionsSummary | null;
  className?: string;
  onNavigateToContractor?: (code: string) => void;
  onNavigateToLegalTab?: () => void;
}

export const DocumentWarningsSection = ({
  warnings,
  riskResult,
  legalSummary,
  className,
  onNavigateToContractor,
  onNavigateToLegalTab,
}: DocumentWarningsSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Combine all warnings
  const allWarnings: DocumentWarning[] = [...warnings];

  // Add risk factor warnings
  if (riskResult && riskResult.level !== "low") {
    riskResult.factors.forEach((factor, i) => {
      allWarnings.push({
        id: `risk-${i}`,
        type: "risk",
        severity: factor.points >= 25 ? "critical" : factor.points >= 15 ? "high" : "medium",
        title: factor.name,
        description: factor.source ? `📍 ${factor.source}` : undefined,
      });
    });
  }

  // Add legal warnings
  if (legalSummary?.warnings) {
    legalSummary.warnings.forEach((warning, i) => {
      allWarnings.push({
        id: `legal-${i}`,
        type: "legal",
        severity: "high",
        title: `${warning.section}: ${warning.label}`,
        action: onNavigateToLegalTab ? {
          label: "Детальніше",
          onClick: onNavigateToLegalTab,
        } : undefined,
      });
    });
  }

  // No warnings = show positive state
  if (allWarnings.length === 0) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800",
        className
      )}>
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span className="text-sm text-emerald-700 dark:text-emerald-400">
          Умови документа стандартні, проблем не виявлено
        </span>
      </div>
    );
  }

  // Get severity badge
  const getSeverityColor = (severity: DocumentWarning["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800";
      case "high":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-400 dark:border-yellow-800";
    }
  };

  const criticalCount = allWarnings.filter(w => w.severity === "critical").length;
  const highCount = allWarnings.filter(w => w.severity === "high").length;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className={className}>
      <div className="rounded-lg border bg-card">
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full p-3 hover:bg-accent/50 transition-colors rounded-t-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn(
                "w-4 h-4",
                criticalCount > 0 ? "text-red-500" : "text-amber-500"
              )} />
              <span className="font-medium text-sm">На що звернути увагу</span>
              <Badge variant="secondary" className={cn(
                "text-xs",
                criticalCount > 0 
                  ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" 
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
              )}>
                {allWarnings.length}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {allWarnings.map((warning) => (
              <div
                key={warning.id}
                className={cn(
                  "flex items-start gap-2 p-2.5 rounded-md border",
                  getSeverityColor(warning.severity)
                )}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{warning.title}</p>
                  {warning.description && (
                    <p className="text-xs opacity-80 mt-0.5">{warning.description}</p>
                  )}
                </div>
                {warning.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs shrink-0"
                    onClick={warning.action.onClick}
                  >
                    {warning.action.label}
                  </Button>
                )}
              </div>
            ))}

            {/* Potential impact summary */}
            {riskResult && riskResult.financialImpact && riskResult.financialImpact.maxAmount > 0 && (
              <div className="p-2.5 rounded-md bg-muted/50 border border-dashed text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Потенційний вплив:</span>
                  <span className="font-medium">
                    до {riskResult.financialImpact.maxAmount.toLocaleString("uk-UA")} грн
                  </span>
                </div>
                {riskResult.financialImpact.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {riskResult.financialImpact.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
