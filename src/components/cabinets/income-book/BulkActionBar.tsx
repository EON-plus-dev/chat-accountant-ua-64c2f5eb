import { CheckCircle2, XCircle, ArrowRight, Download, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, type IncomeBookRecord } from "@/config/incomeBookConfig";

interface BulkActionBarProps {
  selectedRecords: IncomeBookRecord[];
  onClearSelection: () => void;
  onBulkConfirmCategory: () => void;
  onBulkMarkIncome: () => void;
  onBulkMarkNotIncome: () => void;
  onBulkExport: () => void;
  className?: string;
}

/**
 * Sticky bottom bar that appears when 1+ records are selected.
 * Provides bulk-confirm, bulk-status mutations and selection export.
 */
export const BulkActionBar = ({
  selectedRecords,
  onClearSelection,
  onBulkConfirmCategory,
  onBulkMarkIncome,
  onBulkMarkNotIncome,
  onBulkExport,
  className,
}: BulkActionBarProps) => {
  const count = selectedRecords.length;
  if (count === 0) return null;

  const totalAmount = selectedRecords.reduce(
    (sum, r) => sum + (r.status === "return" ? -r.amount : r.amount),
    0,
  );
  const unconfirmedCategoryCount = selectedRecords.filter(
    (r) => r.categoryCode && !r.categoryConfirmed,
  ).length;

  const opLabel = count === 1 ? "операція" : count < 5 ? "операції" : "операцій";

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 md:left-[var(--sidebar-width,0px)]",
        "border-t border-border bg-background/95 backdrop-blur-sm shadow-[0_-4px_20px_-8px_hsl(var(--foreground)/0.15)]",
        "px-4 py-3 md:px-6",
        className,
      )}
      role="region"
      aria-label="Масові дії"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-auto min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="h-8 w-8 shrink-0"
            aria-label="Скинути вибір"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium tabular-nums">
              Вибрано {count} {opLabel}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              на суму {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {unconfirmedCategoryCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkConfirmCategory}
              className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800/70 dark:hover:bg-emerald-950"
            >
              <Tag className="h-3.5 w-3.5" />
              Підтвердити категорії ({unconfirmedCategoryCount})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkMarkIncome}
            className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800/70 dark:hover:bg-emerald-950"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">У дохід</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkMarkNotIncome}
            className="gap-1.5"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Не в дохід</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkExport}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Експорт</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
