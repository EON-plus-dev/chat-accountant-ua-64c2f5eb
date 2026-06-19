import { useState, useCallback } from "react";
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, Lightbulb, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AuditEntry } from "@/config/documentVersioningConfig";
import { milestoneActions, generateLocalTimelineSummary } from "@/lib/timelineUtils";

interface TimelineAISummaryProps {
  documentId: string;
  entries: AuditEntry[];
  documentType?: string;
  className?: string;
}

interface AISummaryResult {
  summary: string;
  highlights: string[];
  recommendations: string[];
}

export const TimelineAISummary = ({
  entries,
  documentType = "Документ",
  className,
}: TimelineAISummaryProps) => {
  const [result, setResult] = useState<AISummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isLocalFallback, setIsLocalFallback] = useState(false);

  const fetchAISummary = useCallback(async () => {
    setIsLoading(true);
    setIsLocalFallback(false);
    
    try {
      const { data, error } = await supabase.functions.invoke("timeline-ai-summary", {
        body: {
          entries,
          documentType,
          milestoneActions,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        // Handle rate limits or payment errors
        if (data.error.includes("ліміт") || data.error.includes("баланс")) {
          toast.error(data.error);
        }
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      console.error("AI summary error:", err);
      // Fall back to local summary
      const localResult = generateLocalTimelineSummary(entries);
      setResult(localResult);
      setIsLocalFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, [entries, documentType]);

  // Get highlight icon based on content
  const getHighlightIcon = (text: string) => {
    if (text.includes("✓") || text.includes("термін") || text.toLowerCase().includes("виконано")) {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />;
    }
    if (text.includes("⚠") || text.includes("затримка") || text.toLowerCase().includes("проблем")) {
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />;
    }
    return <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />;
  };

  if (entries.length < 3) {
    return null;
  }

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="gap-2 p-0 h-auto hover:bg-transparent">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">AI Резюме</span>
              {isLocalFallback && (
                <span className="text-[10px] text-muted-foreground">(локальний аналіз)</span>
              )}
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAISummary}
            disabled={isLoading}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1", isLoading && "animate-spin")} />
            {result ? "Оновити" : "Згенерувати"}
          </Button>
        </div>

        <CollapsibleContent>
          <CardContent className="pt-3 pb-4 px-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-2 mt-3">
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/6" />
                </div>
              </div>
            ) : result ? (
              <div className="space-y-3">
                {/* Main summary */}
                <p className="text-sm text-foreground leading-relaxed">
                  {result.summary}
                </p>

                {/* Highlights */}
                {result.highlights.length > 0 && (
                  <ul className="space-y-1.5">
                    {result.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        {getHighlightIcon(highlight)}
                        <span>{highlight.replace(/^[✓⚠💰]\s*/, "")}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-primary/10">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Натисніть "Згенерувати" для AI аналізу timeline
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};