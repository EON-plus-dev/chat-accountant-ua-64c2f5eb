/**
 * AIInsightCard — Combined Risk + AI Suggestion Card
 * 
 * Displays a risk with its AI-generated resolution suggestion.
 * Follows the "Actionable Insight" pattern: Problem + Solution in one view.
 */

import { AlertTriangle, Check, Edit, X, Lightbulb, Coins, Copy, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DocumentRisk, RiskSeverity } from "@/config/documentFlowConfig";
import { severityStyles, categoryLabels, categoryIcons } from "@/types/aiCommandCenter";

interface AIInsightCardProps {
  risk: DocumentRisk;
  isAccepted?: boolean;
  isConfirmed?: boolean;
  isDisputed?: boolean;
  onAcceptSuggestion?: (riskId: string, suggestionText: string) => void;
  onConfirm?: (riskId: string) => void;
  onDispute?: (riskId: string) => void;
  onOpenEditor?: (targetSection?: string) => void;
  onExplain?: (riskId: string) => void;
}

const formatAmount = (amount?: number): string => {
  if (!amount) return "";
  return amount.toLocaleString("uk-UA") + " ₴";
};

const severityLabels: Record<RiskSeverity, string> = {
  low: "Низький",
  medium: "Середній",
  high: "Високий",
  critical: "Критичний",
};

export const AIInsightCard = ({
  risk,
  isAccepted,
  isConfirmed,
  isDisputed,
  onAcceptSuggestion,
  onConfirm,
  onDispute,
  onOpenEditor,
  onExplain,
}: AIInsightCardProps) => {
  const colors = severityStyles[risk.severity];
  const hasSuggestion = !!risk.suggestion;
  const isResolved = isAccepted || isConfirmed || isDisputed;
  
  const handleAccept = () => {
    if (!risk.suggestion?.text) return;
    
    // Copy to clipboard
    navigator.clipboard.writeText(risk.suggestion.text).then(() => {
      toast.success("Текст скопійовано", {
        description: "Вставте текст у потрібне місце документа",
      });
    });
    
    // Mark as accepted
    onAcceptSuggestion?.(risk.id, risk.suggestion.text);
    
    // Open editor
    onOpenEditor?.(risk.suggestion.targetSection);
  };
  
  const handleCopyOnly = () => {
    if (!risk.suggestion?.text) return;
    
    navigator.clipboard.writeText(risk.suggestion.text).then(() => {
      toast.success("Текст скопійовано в буфер обміну");
    });
  };
  
  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-2.5 rounded-lg border transition-all",
        colors.bg, 
        colors.border,
        isResolved && "opacity-60"
      )}
      data-item-id={risk.id}
    >
      {/* Icon - consistent with CommandItemCard */}
      <Lightbulb className={cn("w-4 h-4 mt-0.5 shrink-0", colors.text)} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {risk.category && (
            <span className="text-sm">{categoryIcons[risk.category]}</span>
          )}
          <span className={cn(
            "text-sm font-medium",
            isResolved && "line-through text-muted-foreground"
          )}>
            {risk.title}
          </span>
          <Badge className={cn("text-[10px] px-1.5 py-0", colors.badge)}>
            {severityLabels[risk.severity]}
          </Badge>
          {isAccepted && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 border-success text-success gap-0.5">
              <Check className="w-2.5 h-2.5" />
              Прийнято
            </Badge>
          )}
          {isConfirmed && !isAccepted && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 border-success text-success gap-0.5">
              <Check className="w-2.5 h-2.5" />
              Підтверджено
            </Badge>
          )}
          {isDisputed && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 border-muted-foreground text-muted-foreground">
              Не стосується
            </Badge>
          )}
        </div>
        
        {/* Description */}
        <p className="text-xs text-muted-foreground mt-0.5">
          {risk.description}
        </p>
      
        {/* Potential impact */}
        {risk.potentialImpact && !isResolved && (
          <div className="flex items-center gap-1 text-xs font-medium text-destructive mt-1">
            <Coins className="w-3 h-3" />
            Потенційний вплив: {formatAmount(risk.potentialImpact)}
          </div>
        )}
        
        {/* AI Suggestion - embedded box */}
        {hasSuggestion && !isResolved && (
          <div className="mt-2 p-2 rounded-md bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Lightbulb className="w-3.5 h-3.5" />
                {risk.suggestion!.targetSection 
                  ? `Пропоную додати до ${risk.suggestion!.targetSection}:`
                  : "AI-пропозиція:"}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={handleCopyOnly}
                    >
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs">Скопіювати текст</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              "{risk.suggestion!.text}"
            </p>
            {risk.suggestion!.confidence && (
              <div className="text-[10px] text-muted-foreground mt-1">
                Впевненість AI: {risk.suggestion!.confidence}%
              </div>
            )}
          </div>
        )}
        
        {/* Actions - inline like CommandItemCard */}
        {!isResolved && (
          <div className="flex items-center gap-2 mt-2">
            {hasSuggestion && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAccept}
                  className="h-7 text-xs gap-1"
                >
                  <Check className="w-3 h-3" />
                  Прийняти
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenEditor?.(risk.suggestion?.targetSection)}
                  className="h-7 text-xs gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Редагувати
                </Button>
              </>
            )}
            
            {!hasSuggestion && onConfirm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onConfirm(risk.id)}
                className="h-7 text-xs gap-1 text-success hover:text-success hover:bg-success/10"
              >
                <Check className="w-3 h-3" />
                Ок
              </Button>
            )}
            
            {onDispute && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDispute(risk.id)}
                className="h-7 text-xs gap-1 text-muted-foreground"
              >
                <X className="w-3 h-3" />
                Не стосується
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
