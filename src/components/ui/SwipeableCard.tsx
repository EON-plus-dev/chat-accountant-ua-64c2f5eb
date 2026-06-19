import { useState, useRef, useCallback, type ReactNode } from "react";
import { Copy, Flag, Link2, Check, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type SwipeStatusAction = "income" | "not-income" | "return";

interface SwipeableCardProps {
  id: string;
  children: ReactNode;
  onCopyId?: (id: string) => void;
  onToggleFlag?: (id: string) => void;
  onLink?: (id: string) => void;
  onQuickAction?: (id: string) => void;
  quickActionLabel?: string;
  /** Optional: invoked when user swipes left/right far enough to commit a status change */
  onStatusChange?: (id: string, status: SwipeStatusAction) => void;
  /** Right-swipe maps to this status (default: "income") */
  rightSwipeStatus?: SwipeStatusAction;
  /** Left-swipe maps to this status (default: "not-income") */
  leftSwipeStatus?: SwipeStatusAction;
  isFlagged?: boolean;
  className?: string;
}

const SWIPE_THRESHOLD = 80;
const COMMIT_THRESHOLD = 130;
const MAX_SWIPE = 160;

const statusMeta: Record<SwipeStatusAction, { label: string; color: string; icon: ReactNode }> = {
  income: {
    label: "У дохід",
    color: "bg-emerald-500 text-white",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  "not-income": {
    label: "Не в дохід",
    color: "bg-muted text-foreground",
    icon: <XCircle className="w-5 h-5" />,
  },
  return: {
    label: "Повернення",
    color: "bg-blue-500 text-white",
    icon: <ArrowRight className="w-5 h-5" />,
  },
};

export const SwipeableCard = ({
  id,
  children,
  onCopyId,
  onToggleFlag,
  onLink,
  onQuickAction,
  quickActionLabel,
  onStatusChange,
  rightSwipeStatus = "income",
  leftSwipeStatus = "not-income",
  isFlagged = false,
  className,
}: SwipeableCardProps) => {
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = 0;
    isDraggingRef.current = true;
    setIsAnimating(false);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    currentXRef.current = deltaX;
    const clampedX = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX));
    setTranslateX(clampedX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsAnimating(true);
    const delta = currentXRef.current;

    // Strong commit thresholds for status changes
    if (delta < -COMMIT_THRESHOLD && onStatusChange) {
      onStatusChange(id, leftSwipeStatus);
      toast.success(statusMeta[leftSwipeStatus].label, { duration: 1500 });
      setTranslateX(0);
      return;
    }
    if (delta > COMMIT_THRESHOLD && onStatusChange) {
      onStatusChange(id, rightSwipeStatus);
      toast.success(statusMeta[rightSwipeStatus].label, { duration: 1500 });
      setTranslateX(0);
      return;
    }

    // Mid-range left swipe → reveal action tray
    if (delta < -SWIPE_THRESHOLD) {
      setTranslateX(-MAX_SWIPE);
    } else if (delta > SWIPE_THRESHOLD && onQuickAction) {
      onQuickAction(id);
      toast.success(quickActionLabel || statusMeta[rightSwipeStatus].label, { duration: 1500 });
      setTranslateX(0);
    } else {
      setTranslateX(0);
    }
  }, [id, onQuickAction, quickActionLabel, onStatusChange, leftSwipeStatus, rightSwipeStatus]);

  const handleClose = useCallback(() => {
    setIsAnimating(true);
    setTranslateX(0);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("ID скопійовано", { duration: 1500 });
    onCopyId?.(id);
    setTimeout(() => {
      setCopied(false);
      handleClose();
    }, 500);
  }, [id, onCopyId, handleClose]);

  const handleFlag = useCallback(() => {
    onToggleFlag?.(id);
    toast.success(isFlagged ? "Позначку знято" : "Позначено для перевірки", { duration: 1500 });
    handleClose();
  }, [id, isFlagged, onToggleFlag, handleClose]);

  const handleLink = useCallback(() => {
    onLink?.(id);
    toast.success("Зв'язування...", { duration: 1500 });
    handleClose();
  }, [id, onLink, handleClose]);

  const isOpen = translateX < -SWIPE_THRESHOLD / 2;
  const rightMeta = statusMeta[rightSwipeStatus];
  const leftMeta = statusMeta[leftSwipeStatus];

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Right-swipe (left side background) — status change or quick action */}
      {(onStatusChange || onQuickAction) && (
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-start px-4",
            rightMeta.color,
            "transition-opacity duration-150",
            translateX > 20 ? "opacity-100" : "opacity-0"
          )}
          style={{ width: MAX_SWIPE }}
        >
          <div className="flex items-center gap-2">
            {rightMeta.icon}
            <span className="text-sm font-medium">{quickActionLabel || rightMeta.label}</span>
          </div>
        </div>
      )}

      {/* Left-swipe (right side background) — status change OR action tray */}
      {onStatusChange ? (
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-end px-4",
            leftMeta.color,
            "transition-opacity duration-150",
            translateX < -20 ? "opacity-100" : "opacity-0"
          )}
          style={{ width: MAX_SWIPE }}
        >
          <div className="flex items-center gap-2">
            {leftMeta.icon}
            <span className="text-sm font-medium">{leftMeta.label}</span>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-end gap-1 px-2 bg-muted",
            "transition-opacity duration-150",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          style={{ width: MAX_SWIPE }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-background shadow-sm"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9 rounded-full bg-background shadow-sm", isFlagged && "text-amber-500")}
            onClick={handleFlag}
          >
            <Flag className={cn("w-4 h-4", isFlagged && "fill-current")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-background shadow-sm"
            onClick={handleLink}
          >
            <Link2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Main content */}
      <div
        className={cn(
          "relative bg-background",
          isAnimating && "transition-transform duration-200 ease-out"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {!onStatusChange && isOpen && (
        <div
          className="absolute inset-0 z-10"
          style={{ right: MAX_SWIPE, background: "transparent" }}
          onClick={handleClose}
        />
      )}
    </div>
  );
};
