/**
 * OverviewAISummaryBlock — Блок "Короткий зміст (AI)"
 * Відображає AI-резюме документа з можливістю розширеного аналізу
 */

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, MessageSquare, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface OverviewAISummaryBlockProps {
  aiSummary?: string;
  shortSummary?: string;
  keyPoints?: string[];
  confidence?: number;
  onShowExtendedAnalysis?: () => void;
  onExplainSimple?: () => void;
  className?: string;
}

export const OverviewAISummaryBlock = ({
  aiSummary,
  shortSummary,
  keyPoints,
  confidence = 85,
  onShowExtendedAnalysis,
  onExplainSimple,
  className,
}: OverviewAISummaryBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const summaryText = aiSummary || shortSummary;
  
  // Generate demo key points if not provided
  const displayKeyPoints = keyPoints || [
    "Предмет: надання послуг/постачання товарів",
    "Сума та умови оплати визначено",
    "Терміни дії встановлено",
  ];

  if (!summaryText) {
    return null;
  }

  return (
    <Card className={cn("overflow-hidden", className)} data-section="ai-summary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Короткий зміст (AI)
          </CardTitle>
          {confidence > 0 && (
            <Badge variant="outline" className="text-xs bg-primary/5">
              {confidence}%
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Summary text */}
        <p className="text-sm text-foreground/90 leading-relaxed">
          {summaryText}
        </p>
        
        {/* Key points */}
        {displayKeyPoints.length > 0 && (
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {displayKeyPoints.slice(0, isExpanded ? undefined : 3).map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
        
        {/* Expand/collapse for additional points */}
        {displayKeyPoints.length > 3 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-center gap-1 text-xs h-7">
                {isExpanded ? (
                  <><ChevronUp className="w-3 h-3" />Згорнути</>
                ) : (
                  <><ChevronDown className="w-3 h-3" />Показати ще {displayKeyPoints.length - 3} пунктів</>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="space-y-1.5 text-sm text-muted-foreground mt-2">
                {displayKeyPoints.slice(3).map((point, index) => (
                  <li key={index + 3} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          {onShowExtendedAnalysis && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onShowExtendedAnalysis}
              className="gap-1.5 text-xs h-8"
              data-action="extended-analysis"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Показати розширений аналіз
            </Button>
          )}
          {onExplainSimple && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExplainSimple}
              className="gap-1.5 text-xs h-8"
              data-action="explain-simple"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Поясни простіше
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
