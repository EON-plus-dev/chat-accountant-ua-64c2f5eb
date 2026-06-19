import { useState, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoleHintBannerProps {
  hint: string;
  subtabId: string;
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const STORAGE_KEY = "operations_hints_dismissed";

const getDismissedHints = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const setDismissedHints = (hints: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hints));
};

export function RoleHintBanner({ hint, subtabId, className, onAction, actionLabel = "Переглянути" }: RoleHintBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = getDismissedHints();
    setVisible(!dismissed.includes(subtabId));
  }, [subtabId]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dismissed = getDismissedHints();
    if (!dismissed.includes(subtabId)) {
      setDismissedHints([...dismissed, subtabId]);
    }
    setVisible(false);
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
      handleDismiss({ stopPropagation: () => {} } as React.MouseEvent);
    }
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm animate-in fade-in slide-in-from-top-1 duration-200",
        onAction && "cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors",
        className
      )}
      onClick={onAction ? handleAction : undefined}
      role={onAction ? "button" : undefined}
      tabIndex={onAction ? 0 : undefined}
      onKeyDown={onAction ? (e) => e.key === "Enter" && handleAction() : undefined}
    >
      <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
      <span className="flex-1 text-amber-800 dark:text-amber-300">{hint}</span>
      {onAction && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); handleAction(); }}
          className="h-6 px-2 text-xs text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-800/50"
        >
          {actionLabel}
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="h-6 w-6 p-0 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50"
        aria-label="Закрити підказку"
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export default RoleHintBanner;
