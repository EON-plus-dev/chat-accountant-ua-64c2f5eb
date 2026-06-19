import { Zap, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AnalyticsAction } from "@/types/analyticsTypes";
import { cn } from "@/lib/utils";

interface ActionCenterSectionProps {
  actions: AnalyticsAction[];
  onChatPromptInsert?: (prompt: string) => void;
  onNavigate?: (path: string) => void;
  onScrollTo?: (sectionId: string) => void;
}

const priorityStyles: Record<string, { border: string; badge: "error" | "warning" | "outline" }> = {
  high: { border: "border-l-destructive", badge: "error" },
  medium: { border: "border-l-warning", badge: "warning" },
  low: { border: "border-l-border", badge: "outline" },
};

export const ActionCenterSection = ({ actions, onChatPromptInsert, onNavigate, onScrollTo }: ActionCenterSectionProps) => {
  if (actions.length === 0) return null;

  const handleAction = (action: AnalyticsAction) => {
    switch (action.actionType) {
      case "chat-prompt":
        onChatPromptInsert?.(action.actionPayload);
        break;
      case "navigate":
        onNavigate?.(action.actionPayload);
        break;
      case "scroll":
        onScrollTo?.(action.actionPayload);
        break;
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-5 h-5 text-primary" />
          Рекомендовані дії
          <Badge variant="outline" size="sm" className="ml-auto font-normal">
            Топ-{actions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action) => {
            const styles = priorityStyles[action.priority] || priorityStyles.low;
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg bg-background/80 border-l-2 text-left",
                  "hover:bg-background transition-colors",
                  styles.border
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <action.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.expectedEffect}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
