/**
 * ReadinessBreakdownPopover Component
 * Shows detailed checklist of document readiness when clicking on the badge
 */

import { Check, ChevronRight, AlertCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReadinessItem {
  id: string;
  label: string;
  isComplete: boolean;
  onClick?: () => void;
}

interface ReadinessBreakdownPopoverProps {
  percent: number;
  isReady: boolean;
  items: ReadinessItem[];
  children: React.ReactNode;
}

export function ReadinessBreakdownPopover({
  percent,
  isReady,
  items,
  children,
}: ReadinessBreakdownPopoverProps) {
  const completedCount = items.filter((i) => i.isComplete).length;
  const incompleteItems = items.filter((i) => !i.isComplete);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className="px-3 py-2.5 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Готовність документа</span>
            <Badge
              variant={isReady ? "default" : "secondary"}
              className={cn(
                "text-xs",
                isReady && "bg-success hover:bg-success/90"
              )}
            >
              {percent}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Заповнено {completedCount} з {items.length} полів
          </p>
        </div>

        {/* Checklist */}
        <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
                !item.isComplete && "bg-muted/50"
              )}
            >
              {item.isComplete ? (
                <Check className="h-4 w-4 text-success shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-warning shrink-0" />
              )}
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.isComplete
                    ? "text-muted-foreground"
                    : "text-foreground font-medium"
                )}
              >
                {item.label}
              </span>
              {!item.isComplete && item.onClick && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={item.onClick}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        {incompleteItems.length > 0 && (
          <div className="px-3 py-2 border-t bg-warning/10">
            <p className="text-xs text-warning-foreground">
              💡 Заповніть всі обов'язкові поля для збереження документа
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
