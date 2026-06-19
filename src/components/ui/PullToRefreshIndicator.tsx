import { RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold = 80,
}: PullToRefreshIndicatorProps) {
  if (pullDistance <= 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;
  const isTriggered = pullDistance >= threshold;

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-50",
        "flex items-center justify-center",
        "w-10 h-10 rounded-full bg-background shadow-lg border",
        "transition-all duration-200",
        isRefreshing && "animate-pulse"
      )}
      style={{
        top: Math.max(8, pullDistance - 48),
        opacity: Math.min(progress, 1),
        transform: `translateX(-50%) scale(${0.5 + progress * 0.5})`,
      }}
    >
      {isRefreshing ? (
        <RefreshCw className="h-5 w-5 text-primary animate-spin" />
      ) : isTriggered ? (
        <Check className="h-5 w-5 text-success" />
      ) : (
        <RefreshCw
          className="h-5 w-5 text-muted-foreground transition-transform"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      )}
    </div>
  );
}
