import { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Calculator, 
  BookOpen,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { InlineSectionAlert } from "@/components/ui/InlineSectionAlert";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { validateIncomeLimit, FOP_INCOME_LIMITS } from "@/lib/businessRules";
import type { Document as FlowDocument } from "@/config/documentFlowConfig";
import type { CabinetType } from "@/types/cabinet";

interface OperationalData {
  responsibleName?: string;
  period?: string;
  accountingAccount?: string;
  tags?: string[];
  internalNote?: string;
}

interface AccountingTaxSectionProps {
  document: FlowDocument;
  cabinetType: CabinetType;
  fopGroup?: 1 | 2 | 3;
  yearlyIncome?: number;
  operationalData?: OperationalData;
  onNavigateToIncomeBook?: () => void;
  className?: string;
}

// Auto-calculate accounting period from date
const getAutoAccountingPeriod = (date: string) => {
  const d = new Date(date);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} ${d.getFullYear()}`;
};

// Auto-suggest accounting account based on document type
const getAutoAccountingAccount = (doc: FlowDocument) => {
  if (doc.type === "invoice") {
    return doc.contractor?.name?.includes("Постачальник") ? "631" : "361";
  }
  if (doc.type === "act") {
    return "703";
  }
  if (doc.type === "contract") {
    return "—";
  }
  return "—";
};

// Tax category labels
const taxCategoryLabels: Record<string, string> = {
  income: "Дохід",
  expense: "Витрата",
  other: "Інше",
};

export const AccountingTaxSection = ({
  document,
  cabinetType,
  fopGroup,
  yearlyIncome = 0,
  operationalData,
  onNavigateToIncomeBook,
  className,
}: AccountingTaxSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Get accounting data (from document or auto-calculated)
  const accountingAccount = document.accounting?.account || 
    operationalData?.accountingAccount || 
    getAutoAccountingAccount(document);
  
  const accountingPeriod = operationalData?.period || 
    getAutoAccountingPeriod(document.date);
  
  const taxCategory = document.accounting?.taxCategory || 
    (document.type === "invoice" ? "income" : "expense");
  
  const costCenter = document.accounting?.costCenter;

  // Calculate FOP limit impact
  const getLimitImpact = () => {
    if (cabinetType !== "fop" || !fopGroup || !document.amount) return null;
    
    // Use UAH amount for limit calculation
    const amountForLimit = document.amountInUAH || document.amount;
    
    // Only income documents affect the limit
    if (taxCategory !== "income") return null;
    
    // Current state
    const currentValidation = validateIncomeLimit(fopGroup, yearlyIncome);
    
    // State after this document
    const afterValidation = validateIncomeLimit(
      fopGroup, 
      yearlyIncome + amountForLimit
    );
    
    return {
      amountForLimit,
      limit: FOP_INCOME_LIMITS[fopGroup],
      currentStatus: currentValidation.status,
      afterStatus: afterValidation.status,
      currentPercent: currentValidation.usedPercent,
      afterPercent: afterValidation.usedPercent,
      willExceed: afterValidation.status === "exceeded",
      percentIncrease: afterValidation.usedPercent - currentValidation.usedPercent,
      remaining: afterValidation.remainingAmount,
    };
  };

  const limitImpact = getLimitImpact();

  // Don't render if no relevant data
  if (!document.amount && !document.accounting) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">Облік і податки</span>
            {limitImpact?.willExceed && (
              <Badge variant="destructive" className="text-[10px]">
                Перевищення ліміту!
              </Badge>
            )}
            {limitImpact?.afterStatus === "critical" && !limitImpact.willExceed && (
              <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                Критичний ліміт
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        <div className={cn("space-y-3", className)}>
          {/* Basic Accounting Info */}
          <Card className="p-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Рахунок обліку</span>
                <span className="font-medium font-mono">{accountingAccount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Період обліку</span>
                <span className="font-medium">{accountingPeriod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Категорія</span>
                <Badge variant="outline" className="text-xs">
                  {taxCategoryLabels[taxCategory] || taxCategory}
                </Badge>
              </div>
              {costCenter && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Центр витрат</span>
                  <span>{costCenter}</span>
                </div>
              )}
            </div>
          </Card>

          {/* FOP Limit Impact - only for FOP cabinets with income documents */}
          {limitImpact && (
            <Card className={cn(
              "p-3",
              limitImpact.willExceed 
                ? "border-destructive bg-destructive/5" 
                : limitImpact.afterStatus === "critical" 
                  ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30" 
                  : "border-border"
            )}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Вплив на ліміт ФОП</span>
                  <Badge variant="outline" className="text-[10px] ml-auto">
                    Група {fopGroup}
                  </Badge>
                </div>
                
                {/* Progress bar with before/after visualization */}
                <div className="space-y-1">
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    {/* Current usage */}
                    <div 
                      className={cn(
                        "absolute h-full transition-all",
                        limitImpact.currentStatus === "safe" ? "bg-emerald-500/50" :
                        limitImpact.currentStatus === "warning" ? "bg-amber-500/50" :
                        "bg-red-500/50"
                      )}
                      style={{ width: `${Math.min(limitImpact.currentPercent, 100)}%` }}
                    />
                    {/* Added amount */}
                    <div 
                      className={cn(
                        "absolute h-full transition-all",
                        limitImpact.willExceed ? "bg-red-500" :
                        limitImpact.afterStatus === "critical" ? "bg-amber-500" :
                        "bg-primary"
                      )}
                      style={{ 
                        left: `${Math.min(limitImpact.currentPercent, 100)}%`, 
                        width: `${Math.min(limitImpact.percentIncrease, 100 - limitImpact.currentPercent)}%` 
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {limitImpact.currentPercent.toFixed(1)}%
                      <ArrowRight className="w-3 h-3" />
                      <span className={cn(
                        "font-medium",
                        limitImpact.willExceed ? "text-destructive" :
                        limitImpact.afterStatus === "critical" ? "text-amber-600" :
                        "text-foreground"
                      )}>
                        {limitImpact.afterPercent.toFixed(1)}%
                      </span>
                    </span>
                    <span className="font-medium text-foreground">
                      +{formatCurrency(limitImpact.amountForLimit)}
                    </span>
                  </div>
                </div>
                
                {/* Remaining info */}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Залишок після документа</span>
                  <span className={cn(
                    "font-medium",
                    limitImpact.remaining <= 0 ? "text-destructive" : "text-foreground"
                  )}>
                    {limitImpact.remaining > 0 ? formatCurrency(limitImpact.remaining) : "Перевищено"}
                  </span>
                </div>
                
                {limitImpact.willExceed && (
                  <InlineSectionAlert
                    type="critical"
                    title="Увага! Ліміт буде перевищено після цього документа"
                    className="mt-2"
                  />
                )}
                
                {limitImpact.afterStatus === "critical" && !limitImpact.willExceed && (
                  <InlineSectionAlert
                    type="warning"
                    title="Після цього документа використано понад 90% ліміту"
                    className="mt-2"
                  />
                )}
              </div>
            </Card>
          )}

          {/* Link to Income Book */}
          {onNavigateToIncomeBook && taxCategory === "income" && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground hover:text-primary"
              onClick={onNavigateToIncomeBook}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Переглянути в Книзі доходів
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AccountingTaxSection;
