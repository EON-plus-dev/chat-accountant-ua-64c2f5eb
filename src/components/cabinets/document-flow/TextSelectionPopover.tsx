import { useMemo } from "react";
import { MessageSquare, AlertTriangle, X, FileX, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TextSelectionPopoverProps {
  selectedText: string;
  position: { x: number; y: number };
  onExplain?: () => void;
  onCheckRisk?: () => void;
  onClose: () => void;
  className?: string;
  // Discrepancy mode
  showDiscrepancyOption?: boolean;
  onAddToDiscrepancy?: () => void;
  // Comments
  showCommentOption?: boolean;
  onAddComment?: () => void;
}

export const TextSelectionPopover = ({
  selectedText,
  position,
  onExplain,
  onCheckRisk,
  onClose,
  className,
  showDiscrepancyOption,
  onAddToDiscrepancy,
  showCommentOption = true,
  onAddComment,
}: TextSelectionPopoverProps) => {
  // Safe positioning to prevent viewport clipping (horizontal + vertical)
  const safePosition = useMemo(() => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
    const popoverWidth = 180;
    const popoverHeight = 220; // Approximate height with 4-5 buttons
    const margin = 16;
    
    let safeX = position.x;
    let safeY = position.y;
    let showBelow = false;
    
    // Prevent left edge clipping
    if (position.x - popoverWidth / 2 < margin) {
      safeX = popoverWidth / 2 + margin;
    }
    // Prevent right edge clipping
    else if (position.x + popoverWidth / 2 > viewportWidth - margin) {
      safeX = viewportWidth - popoverWidth / 2 - margin;
    }
    
    // Prevent top edge clipping - show below selection if would overflow top
    if (position.y - popoverHeight < margin) {
      safeY = position.y + 50; // Show below with offset for selection height
      showBelow = true;
    }
    
    return { x: safeX, y: safeY, showBelow };
  }, [position]);

  return (
    <div
      className={cn(
        "absolute z-[100] animate-in fade-in-0 zoom-in-95 duration-150",
        "bg-popover border rounded-lg shadow-lg p-1.5",
        "flex flex-col gap-1 min-w-[180px]",
        className
      )}
      style={{
        left: safePosition.x,
        top: safePosition.y,
        transform: safePosition.showBelow 
          ? "translate(-50%, 0)" 
          : "translate(-50%, -100%)",
      }}
    >
      {/* Explain Button - 44px touch target */}
      {onExplain && (
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] h-auto gap-2 text-sm justify-start w-full px-3 py-2 hover:bg-primary/10"
          onClick={onExplain}
        >
          <MessageSquare className="w-4 h-4 text-primary shrink-0" />
          Пояснити
        </Button>
      )}

      {/* Check Risk Button - 44px touch target */}
      {onCheckRisk && (
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] h-auto gap-2 text-sm justify-start w-full px-3 py-2 hover:bg-warning/10"
          onClick={onCheckRisk}
        >
          <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
          Перевірити ризик
        </Button>
      )}

      {/* Comment Button - 44px touch target */}
      {showCommentOption && onAddComment && (
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] h-auto gap-2 text-sm justify-start w-full px-3 py-2 hover:bg-primary/10"
          onClick={onAddComment}
        >
          <MessageSquarePlus className="w-4 h-4 text-primary shrink-0" />
          Додати коментар
        </Button>
      )}

      {/* Discrepancy Button - 44px touch target */}
      {showDiscrepancyOption && onAddToDiscrepancy && (
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] h-auto gap-2 text-sm justify-start w-full px-3 py-2 hover:bg-destructive/10"
          onClick={onAddToDiscrepancy}
        >
          <FileX className="w-4 h-4 text-destructive shrink-0" />
          До розбіжностей
        </Button>
      )}

      <div className="h-px bg-border my-0.5" />

      {/* Close Button - 44px touch target */}
      <Button
        variant="ghost"
        size="sm"
        className="min-h-[44px] h-auto gap-2 text-sm justify-start w-full px-3 py-2 text-muted-foreground hover:bg-muted"
        onClick={onClose}
      >
        <X className="w-4 h-4 shrink-0" />
        Закрити
      </Button>

      {/* Arrow pointer - flips based on position */}
      <div 
        className={cn(
          "absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-popover",
          safePosition.showBelow 
            ? "-top-1.5 border-l border-t rotate-45" 
            : "-bottom-1.5 border-r border-b rotate-45"
        )}
        style={{ borderRadius: "2px" }}
      />
    </div>
  );
};
