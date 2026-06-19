import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeIndicatorProps {
  canGoBack: boolean;
  canSwipeForward: boolean;
}

export const SwipeIndicator = ({ canGoBack, canSwipeForward }: SwipeIndicatorProps) => {
  if (!canGoBack && !canSwipeForward) return null;
  
  return (
    <div className="md:hidden fixed bottom-safe left-0 right-0 flex justify-center gap-6 pb-6 pointer-events-none z-10">
      {canGoBack && (
        <span className="text-xs text-muted-foreground/60 flex items-center gap-1 animate-pulse">
          <ChevronLeft className="w-3 h-3" />
          Свайп назад
        </span>
      )}
      {canSwipeForward && (
        <span className="text-xs text-muted-foreground/60 flex items-center gap-1 animate-pulse">
          Далі
          <ChevronRight className="w-3 h-3" />
        </span>
      )}
    </div>
  );
};
