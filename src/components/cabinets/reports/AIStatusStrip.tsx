import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIStatusStripProps {
  isAutoGenerating?: boolean;
  generatingReportType?: string | null;
  hasError?: boolean;
  errorMessage?: string | null;
  onRetryGeneration?: () => void;
}

/**
 * AI generation status strip — top slot for AttentionInbox.
 * Renders nothing if there is no active generation or error.
 */
export function AIStatusStrip({
  isAutoGenerating,
  generatingReportType,
  hasError,
  errorMessage,
  onRetryGeneration,
}: AIStatusStripProps) {
  if (hasError && errorMessage) {
    return (
      <div className="flex items-center gap-2 px-4 h-8 border-b border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span className="text-xs font-medium truncate flex-1">
          Помилка генерації: <span className="font-normal">{errorMessage}</span>
        </span>
        {onRetryGeneration && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-destructive hover:bg-destructive/20"
            onClick={onRetryGeneration}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Повторити
          </Button>
        )}
      </div>
    );
  }

  if (isAutoGenerating && generatingReportType) {
    return (
      <div className="flex items-center gap-2 px-4 h-8 border-b border-primary/20 bg-primary/5 text-primary">
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
        <span className="text-xs font-medium truncate flex-1">
          AI формує: <span className="font-normal">{generatingReportType}</span>
        </span>
      </div>
    );
  }

  return null;
}
