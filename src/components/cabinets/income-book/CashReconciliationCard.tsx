/**
 * CashReconciliationCard
 * Displays reconciliation between PRRO (fiscal) cash and bank cash deposits
 * Used primarily for auto repair and dealer cabinets
 */

import { useMemo } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Receipt, 
  Landmark,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { IncomeBookRecord } from "@/config/incomeBookConfig";
import { formatValue } from "@/lib/formatters";

interface CashReconciliationCardProps {
  records: IncomeBookRecord[];
  onShowDiscrepancies?: () => void;
  onChatPromptInsert?: (prompt: string) => void;
}

interface ReconciliationResult {
  prroTotal: number;
  bankCashTotal: number;
  discrepancy: number;
  discrepancyPercent: number;
  hasDiscrepancy: boolean;
  prroCount: number;
  bankCashCount: number;
  discrepancyRecords: IncomeBookRecord[];
}

/**
 * Reconcile PRRO fiscal receipts with bank cash deposits
 */
function reconcileCashOperations(records: IncomeBookRecord[]): ReconciliationResult {
  // PRRO cash operations (fiscal receipts)
  const prroRecords = records.filter(
    r => r.source === "prro" && r.paymentType === "cash" && r.status === "income"
  );
  const prroTotal = prroRecords.reduce((sum, r) => sum + r.amount, 0);

  // Bank cash deposits (cash deposited to bank account)
  // These would be marked with paymentType "cash" from bank source
  const bankCashRecords = records.filter(
    r => r.source !== "prro" && r.paymentType === "cash" && r.status === "income"
  );
  const bankCashTotal = bankCashRecords.reduce((sum, r) => sum + r.amount, 0);

  const discrepancy = prroTotal - bankCashTotal;
  const discrepancyPercent = prroTotal > 0 
    ? Math.abs(discrepancy / prroTotal) * 100 
    : 0;

  // Find records that might be causing discrepancy
  // (simplified: records without matching counterpart)
  const discrepancyRecords = prroRecords.filter(r => {
    // Check if there's a corresponding bank deposit
    const matchingDeposit = bankCashRecords.find(
      br => Math.abs(br.amount - r.amount) < 1 && 
            br.date === r.date
    );
    return !matchingDeposit;
  });

  return {
    prroTotal,
    bankCashTotal,
    discrepancy,
    discrepancyPercent,
    hasDiscrepancy: Math.abs(discrepancy) > 100, // Tolerance of 100 UAH
    prroCount: prroRecords.length,
    bankCashCount: bankCashRecords.length,
    discrepancyRecords,
  };
}

export const CashReconciliationCard = ({
  records,
  onShowDiscrepancies,
  onChatPromptInsert,
}: CashReconciliationCardProps) => {
  const reconciliation = useMemo(() => {
    return reconcileCashOperations(records);
  }, [records]);

  const {
    prroTotal,
    bankCashTotal,
    discrepancy,
    discrepancyPercent,
    hasDiscrepancy,
    prroCount,
    bankCashCount,
  } = reconciliation;

  // Don't show if no PRRO operations
  if (prroCount === 0 && bankCashCount === 0) return null;

  const isPositiveDiscrepancy = discrepancy > 0; // More in PRRO than bank
  const discrepancyLabel = isPositiveDiscrepancy
    ? "Готівка не внесена в банк"
    : "Внесено більше ніж пробито";

  const handleAskAI = () => {
    const prompt = hasDiscrepancy
      ? `Допоможи розібратись з розбіжністю каси: ПРРО ${formatValue(prroTotal, "currency")}, банк ${formatValue(bankCashTotal, "currency")}, різниця ${formatValue(Math.abs(discrepancy), "currency")}`
      : "Перевір правильність готівкових операцій за цей період";
    onChatPromptInsert?.(prompt);
  };

  return (
    <Card className={cn(
      "border",
      hasDiscrepancy 
        ? "border-warning/30 bg-warning/5" 
        : "border-success/30 bg-success/5"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {hasDiscrepancy ? (
              <AlertTriangle className="w-5 h-5 text-warning" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-success" />
            )}
            <span>Звірка готівки</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[250px]">
                  <p className="text-xs">
                    Порівняння сум фіскальних чеків ПРРО з готівковими внесеннями на банківський рахунок. 
                    Розбіжності можуть призвести до питань від податкової.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge 
            variant={hasDiscrepancy ? "warning" : "success"}
            className="text-xs"
          >
            {hasDiscrepancy ? "Є розбіжності" : "Збігається"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comparison Row */}
        <div className="flex items-center gap-3">
          {/* PRRO */}
          <div className="flex-1 p-3 rounded-lg bg-background/80">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">ПРРО (каса)</span>
            </div>
            <p className="text-lg font-semibold tabular-nums">
              {formatValue(prroTotal, "currency")}
            </p>
            <p className="text-xs text-muted-foreground">
              {prroCount} чеків
            </p>
          </div>

          {/* Arrow */}
          <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

          {/* Bank */}
          <div className="flex-1 p-3 rounded-lg bg-background/80">
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Банк (внесення)</span>
            </div>
            <p className="text-lg font-semibold tabular-nums">
              {formatValue(bankCashTotal, "currency")}
            </p>
            <p className="text-xs text-muted-foreground">
              {bankCashCount} операцій
            </p>
          </div>
        </div>

        {/* Discrepancy Info */}
        {hasDiscrepancy && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">
                  Різниця: {formatValue(Math.abs(discrepancy), "currency")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {discrepancyLabel} ({discrepancyPercent.toFixed(1)}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Match Progress */}
        {!hasDiscrepancy && prroTotal > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Відповідність</span>
              <span className="text-success font-medium">100%</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          {hasDiscrepancy && onShowDiscrepancies && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1"
              onClick={onShowDiscrepancies}
            >
              <Receipt className="w-3.5 h-3.5" />
              Показати розбіжності
            </Button>
          )}
          {onChatPromptInsert && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-muted-foreground"
              onClick={handleAskAI}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Запитати AI
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
