import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

interface OfflineIndicatorProps {
  lastUpdated?: Date;
  className?: string;
}

export function OfflineIndicator({ lastUpdated, className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLastUpdated, setShowLastUpdated] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return "Щойно";
    if (diffMins < 60) return `${diffMins} хв. тому`;
    if (diffHours < 24) return `${diffHours} год. тому`;
    return date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
  };

  if (!isOnline) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-destructive/10 text-destructive text-xs font-medium",
          className
        )}
      >
        <WifiOff className="h-3.5 w-3.5" />
        <span>Офлайн</span>
        {lastUpdated && (
          <span className="text-destructive/70">
            · Дані від {formatLastUpdated(lastUpdated)}
          </span>
        )}
      </div>
    );
  }

  if (lastUpdated && showLastUpdated) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "gap-1.5 text-xs font-normal cursor-pointer hover:bg-muted/50 transition-colors",
          className
        )}
        onClick={() => setShowLastUpdated(false)}
      >
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">
          Оновлено: {formatLastUpdated(lastUpdated)}
        </span>
      </Badge>
    );
  }

  return (
    <button
      onClick={() => setShowLastUpdated(true)}
      className={cn(
        "p-1.5 rounded-md hover:bg-muted/50 transition-colors",
        "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-label="Показати час останнього оновлення"
    >
      <RefreshCw className="h-4 w-4" />
    </button>
  );
}
