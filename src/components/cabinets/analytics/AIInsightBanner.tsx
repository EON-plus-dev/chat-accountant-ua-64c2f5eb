import { Sparkles, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIInsightBannerProps {
  /** Що сказав AI у відповідь на запит. 1-2 речення. */
  message: string;
  /** Контекст: який фільтр щойно застосовано (опційно, для атрибуції). */
  context?: string;
  /** Підказки для подальших уточнень. */
  followUps?: string[];
  onFollowUp?: (prompt: string) => void;
  onDismiss?: () => void;
}

/**
 * Amber-banner з AI-інсайтом, що з'являється над аналітикою після того,
 * як AI у чаті застосував фільтри (через apply_analytics_filters tool).
 *
 * Показується замість/над звичайною AI-довідкою, щоб користувач бачив
 * прямий зв'язок між своїм запитом і змінами на сторінці.
 */
export function AIInsightBanner({
  message,
  context,
  followUps = [],
  onFollowUp,
  onDismiss,
}: AIInsightBannerProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 md:p-4",
        "border-amber-300/60 bg-amber-50/60 dark:border-amber-700/40 dark:bg-amber-950/20",
        "shadow-sm",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] uppercase tracking-wide font-semibold text-amber-700 dark:text-amber-400">
              AI оновив аналітику
            </span>
            {context && (
              <span className="text-[10px] text-amber-700/70 dark:text-amber-400/70 truncate">
                · {context}
              </span>
            )}
          </div>
          <p className="text-sm leading-snug text-foreground">{message}</p>

          {followUps.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {followUps.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onFollowUp?.(prompt)}
                  className={cn(
                    "inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors",
                    "bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300",
                    "border border-amber-300/40 dark:border-amber-700/40",
                  )}
                >
                  <MessageCircle className="w-3 h-3" />
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 shrink-0 text-amber-700/70 hover:text-amber-900 dark:text-amber-400/70 dark:hover:text-amber-300"
            onClick={onDismiss}
            aria-label="Сховати"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
