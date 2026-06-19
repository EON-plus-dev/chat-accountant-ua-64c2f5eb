import { AlertTriangle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AnalyticsRisk } from "@/types/analyticsTypes";
import { cn } from "@/lib/utils";

interface RiskRegisterSectionProps {
  risks: AnalyticsRisk[];
  onChatPromptInsert?: (prompt: string) => void;
  onNavigate?: (path: string) => void;
  onScrollTo?: (sectionId: string) => void;
}

const severityStyles: Record<string, { bg: string; text: string; dot: string; badge: "error" | "warning" | "outline" }> = {
  critical: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", badge: "error" },
  high: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", badge: "error" },
  medium: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", badge: "warning" },
  low: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground", badge: "outline" },
};

const categoryLabels: Record<string, string> = {
  limit: "Ліміт",
  data: "Дані",
  compliance: "Відповідність",
  finance: "Фінансові",
  operations: "Операційні",
};

export const RiskRegisterSection = ({ risks, onChatPromptInsert, onNavigate, onScrollTo }: RiskRegisterSectionProps) => {
  const highCount = risks.filter(r => r.severity === "critical").length;

  const handleAction = (actionType: string, payload: string) => {
    switch (actionType) {
      case "chat-prompt":
        onChatPromptInsert?.(payload);
        break;
      case "navigate":
        onNavigate?.(payload);
        break;
      case "scroll":
        onScrollTo?.(payload);
        break;
    }
  };

  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Ризики та аномалії
          {highCount > 0 && (
            <Badge variant="warning" size="sm" className="ml-auto">
              {highCount} критичних
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {risks.map((risk) => {
            const styles = severityStyles[risk.severity] || severityStyles.low;
            return (
              <div 
                key={risk.id} 
                className="p-3 rounded-lg bg-background/80 space-y-2"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", styles.bg)}>
                    <risk.icon className={cn("w-4 h-4", styles.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">{risk.text}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" size="sm" className="font-normal">
                        {categoryLabels[risk.category] || risk.category}
                      </Badge>
                      {risk.evidence.map((ev, i) => (
                        <Badge key={i} variant={styles.badge} size="sm">
                          {ev.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Action buttons */}
                {risk.recommendedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-11">
                    {risk.recommendedActions.map((action) => (
                      <Button
                        key={action.id}
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 text-primary"
                        onClick={() => handleAction(action.actionType, action.actionPayload)}
                      >
                        <action.icon className="w-3 h-3" />
                        {action.label}
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
