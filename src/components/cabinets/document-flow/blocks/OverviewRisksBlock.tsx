/**
 * @deprecated Use DocumentAICommandCenter instead.
 * This component is deprecated and will be removed in a future version.
 * 
 * OverviewRisksBlock — Блок "Ризики та рекомендації (AI)"
 * 
 * UX-оптимізована структура (v3):
 * - Додано CSS анімацію pulse при scroll-to
 * - Покращена візуальна ієрархія
 * - localStorage persistence для HITL стану
 * - Demo data marking
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AlertTriangle, CheckCircle2, MessageSquare, FileSearch, ThumbsUp, ThumbsDown, Coins, Beaker } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { DocumentRisk, RiskSeverity, RiskCategory } from "@/config/documentFlowConfig";

interface OverviewRisksBlockProps {
  aiRisks?: DocumentRisk[];
  onExplainRisk?: (riskId: string, riskTitle: string) => void;
  onShowInDocument?: (sourceSection: string) => void;
  onConfirmRisk?: (riskId: string) => void;
  onDisputeRisk?: (riskId: string) => void;
  className?: string;
  documentId?: string; // For localStorage key
}

const severityColors: Record<RiskSeverity, {
  bg: string;
  border: string;
  text: string;
  badge: string;
}> = {
  low: {
    bg: "bg-slate-50 dark:bg-slate-950/30",
    border: "border-slate-200 dark:border-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  medium: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300",
  },
  high: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300",
  },
  critical: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    badge: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300",
  },
};

const severityLabels: Record<RiskSeverity, string> = {
  low: "Низький",
  medium: "Середній",
  high: "Високий",
  critical: "Критичний",
};

const categoryLabels: Record<RiskCategory, string> = {
  financial: "Фінансовий",
  legal: "Юридичний",
  compliance: "Комплаєнс",
  deadline: "Строки",
  counterparty: "Контрагент",
};

const categoryIcons: Record<RiskCategory, string> = {
  financial: "💰",
  legal: "⚖️",
  compliance: "📋",
  deadline: "⏰",
  counterparty: "🏢",
};

const formatAmount = (amount?: number): string => {
  if (!amount) return "";
  return amount.toLocaleString("uk-UA") + " ₴";
};

interface RiskCardProps {
  risk: DocumentRisk;
  onExplain?: () => void;
  onShowInDoc?: () => void;
  onConfirm?: () => void;
  onDispute?: () => void;
}

const RiskCard = ({ risk, onExplain, onShowInDoc, onConfirm, onDispute }: RiskCardProps) => {
  const colors = severityColors[risk.severity];

  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all",
      colors.bg,
      colors.border
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base">{categoryIcons[risk.category]}</span>
          <Badge className={cn("text-[10px] px-1.5 py-0", colors.badge)}>
            {categoryLabels[risk.category]} · {severityLabels[risk.severity]}
          </Badge>
          
          {/* HITL status */}
          {risk.isConfirmed && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3 h-3 mr-0.5" />
              Підтверджено
            </Badge>
          )}
          {risk.isDisputed && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-400 text-slate-600 dark:text-slate-400">
              Оскаржено
            </Badge>
          )}
        </div>
      </div>
      
      {/* Title & Description */}
      <p className={cn("text-sm font-medium mb-1", colors.text)}>
        {risk.title}
      </p>
      <p className="text-xs text-muted-foreground mb-2">
        {risk.description}
      </p>
      
      {/* Impact & Source */}
      <div className="flex flex-wrap gap-2 mb-3">
        {risk.potentialImpact && (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
            <Coins className="w-3 h-3" />
            Потенційний вплив: {formatAmount(risk.potentialImpact)}
          </span>
        )}
        
        {risk.sourceSection && (
          <span className="text-xs text-muted-foreground">
            📍 {risk.sourceSection}
          </span>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {onExplain && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExplain}
            className="h-7 text-xs gap-1"
            data-action="explain-risk"
          >
            <MessageSquare className="w-3 h-3" />
            Поясни детальніше
          </Button>
        )}
        
        {onShowInDoc && risk.sourceSection && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowInDoc}
            className="h-7 text-xs gap-1"
            data-action="show-in-document"
          >
            <FileSearch className="w-3 h-3" />
            Показати у документі
          </Button>
        )}
        
        {/* HITL buttons */}
        {!risk.isConfirmed && !risk.isDisputed && (
          <>
            {onConfirm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onConfirm}
                className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
              >
                <ThumbsUp className="w-3 h-3" />
                Підтвердити
              </Button>
            )}
            {onDispute && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDispute}
                className="h-7 text-xs gap-1 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-950/50"
              >
                <ThumbsDown className="w-3 h-3" />
                Оскаржити
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const OverviewRisksBlock = ({
  aiRisks,
  onExplainRisk,
  onShowInDocument,
  onConfirmRisk,
  onDisputeRisk,
  className,
  documentId,
}: OverviewRisksBlockProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  
  // localStorage key for HITL persistence
  const storageKey = documentId ? `doc-risks-hitl-${documentId}` : null;
  
  // HITL state with localStorage persistence
  const [hitlState, setHitlState] = useState<{
    confirmed: Set<string>;
    disputed: Set<string>;
  }>(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            confirmed: new Set(parsed.confirmed || []),
            disputed: new Set(parsed.disputed || []),
          };
        }
      } catch {
        // Ignore parse errors
      }
    }
    return { confirmed: new Set(), disputed: new Set() };
  });
  
  // Persist HITL state to localStorage
  useEffect(() => {
    if (storageKey && (hitlState.confirmed.size > 0 || hitlState.disputed.size > 0)) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          confirmed: [...hitlState.confirmed],
          disputed: [...hitlState.disputed],
        }));
      } catch {
        // Ignore storage errors
      }
    }
  }, [storageKey, hitlState]);
  
  // HITL handlers with persistence
  const handleConfirmRisk = useCallback((riskId: string) => {
    setHitlState(prev => ({
      ...prev,
      confirmed: new Set([...prev.confirmed, riskId]),
    }));
    onConfirmRisk?.(riskId);
  }, [onConfirmRisk]);
  
  const handleDisputeRisk = useCallback((riskId: string) => {
    setHitlState(prev => ({
      ...prev,
      disputed: new Set([...prev.disputed, riskId]),
    }));
    onDisputeRisk?.(riskId);
  }, [onDisputeRisk]);

  // Listen for scroll-to events and trigger pulse animation
  useEffect(() => {
    const handleHighlight = () => {
      setIsHighlighted(true);
      setTimeout(() => setIsHighlighted(false), 1500);
    };

    const element = cardRef.current;
    if (element) {
      element.addEventListener('risks-highlight', handleHighlight);
      return () => element.removeEventListener('risks-highlight', handleHighlight);
    }
  }, []);

  // Track if showing demo data
  const isUsingDemoData = !aiRisks || aiRisks.length === 0;

  // Demo risks if not provided, merged with HITL state
  const displayRisks: DocumentRisk[] = useMemo(() => {
    const baseRisks = aiRisks && aiRisks.length > 0 ? aiRisks : [
      {
        id: "demo-risk-1",
        category: "financial" as RiskCategory,
        severity: "medium" as RiskSeverity,
        title: "Умови оплати потребують уваги",
        description: "Рекомендуємо перевірити терміни та умови оплати перед підписанням",
        sourceSection: "Розділ «Порядок розрахунків»",
      },
    ];
    
    // Merge with HITL state
    return baseRisks.map(risk => ({
      ...risk,
      isConfirmed: hitlState.confirmed.has(risk.id) || risk.isConfirmed,
      isDisputed: hitlState.disputed.has(risk.id) || risk.isDisputed,
    }));
  }, [aiRisks, hitlState]);

  // Calculate overall risk level
  const maxSeverity = displayRisks.reduce((max, risk) => {
    const order: Record<RiskSeverity, number> = { low: 0, medium: 1, high: 2, critical: 3 };
    return order[risk.severity] > order[max] ? risk.severity : max;
  }, "low" as RiskSeverity);

  // If no risks or all low
  const hasSignificantRisks = displayRisks.some(r => r.severity !== "low");

  if (!hasSignificantRisks && displayRisks.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)} data-section="risks" ref={cardRef}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Ризики та рекомендації
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Критичних ризиків не виявлено
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "overflow-hidden transition-all duration-500",
        isHighlighted && "ring-2 ring-primary ring-offset-2 animate-pulse",
        className
      )} 
      data-section="risks"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className={cn(
              "w-4 h-4",
              severityColors[maxSeverity].text
            )} />
            Ризики та нюанси
            {isUsingDemoData && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1 border-dashed border-amber-400 text-amber-600 dark:text-amber-400">
                      <Beaker className="w-3 h-3" />
                      Demo
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Приклад AI-аналізу для демонстрації</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
          <Badge className={cn("text-xs", severityColors[maxSeverity].badge)}>
            {severityLabels[maxSeverity]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {displayRisks.map(risk => (
          <RiskCard
            key={risk.id}
            risk={risk}
            onExplain={onExplainRisk ? () => onExplainRisk(risk.id, risk.title) : undefined}
            onShowInDoc={onShowInDocument && risk.sourceSection ? () => onShowInDocument(risk.sourceSection!) : undefined}
            onConfirm={!risk.isConfirmed && !risk.isDisputed ? () => handleConfirmRisk(risk.id) : undefined}
            onDispute={!risk.isConfirmed && !risk.isDisputed ? () => handleDisputeRisk(risk.id) : undefined}
          />
        ))}
      </CardContent>
    </Card>
  );
};
