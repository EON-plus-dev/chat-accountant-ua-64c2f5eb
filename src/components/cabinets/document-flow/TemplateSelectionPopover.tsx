/**
 * TemplateSelectionPopover - Popover for text selection actions in template preview
 * Actions: Create field, Find similar, Copy
 */

import { useMemo } from "react";
import { Plus, Search, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TemplateSelectionPopoverProps {
  selectedText: string;
  position: { x: number; y: number };
  onCreateField: () => void;
  onFindSimilar: () => void;
  onCopy: () => void;
  onClose: () => void;
  className?: string;
}

export const TemplateSelectionPopover = ({
  selectedText,
  position,
  onCreateField,
  onFindSimilar,
  onCopy,
  onClose,
  className,
}: TemplateSelectionPopoverProps) => {
  // Safe positioning to prevent viewport clipping (horizontal + vertical)
  const safePosition = useMemo(() => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 400;
    const popoverWidth = 180;
    const popoverHeight = 200;
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
      safeY = position.y + 50;
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
      {/* Create Field Button - 44px touch target */}
      <Button
        variant="ghost"
        size="sm"
        className="min-h-[44px] h-auto gap-2 text-sm justify-start w-full px-3 py-2 hover:bg-primary/10"
        onClick={onCreateField}
      >
        <Plus className="w-4 h-4 text-primary shrink-0" />
        Створити поле
      </Button>

      {/* Find Similar Button - 44px touch target */}
      <Button
        variant="ghost"
        size="sm"
        className="min-h-[44px] h-auto gap-2 text-sm justify-start w-full px-3 py-2 hover:bg-primary/10"
        onClick={onFindSimilar}
      >
        <Search className="w-4 h-4 text-primary shrink-0" />
        Знайти схожі
      </Button>

      {/* Copy Button - 44px touch target */}
      <Button
        variant="ghost"
        size="sm"
        className="min-h-[44px] h-auto gap-2 text-sm justify-start w-full px-3 py-2 hover:bg-primary/10"
        onClick={onCopy}
      >
        <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
        Скопіювати
      </Button>

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
