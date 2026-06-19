/**
 * Tax Salary Detail Section (ПДФО, ВЗ, ЄСВ роботодавця)
 * Displays aggregate breakdown and per-employee details
 */

import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  Calculator, 
  Scale, 
  Building2, 
  Users,
  FileText,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { type TaxPayment, taxBudgetCodes, taxTypeConfig } from "@/config/paymentsConfig";
import { 
  getLegalReference, 
  demoEmployeeTaxBreakdown,
  type EmployeeTaxBreakdown,
} from "@/config/paymentDetailConfig";
import { OverdueSanctionsSection } from "./OverdueSanctionsSection";

interface TaxSalaryDetailSectionProps {
  payment: TaxPayment;
  onNavigateToEmployee?: (employeeId: string) => void;
  onNavigateToPayroll?: () => void;
  onNavigateToReport?: (reportType: string, period: string) => void;
}

export function TaxSalaryDetailSection({ 
  payment, 
  onNavigateToEmployee,
  onNavigateToPayroll,
  onNavigateToReport,
}: TaxSalaryDetailSectionProps) {
  const { toast } = useToast();
  const [isEmployeesExpanded, setIsEmployeesExpanded] = useState(false);
  
  const budgetCode = taxBudgetCodes[payment.taxType];
  const legalRef = getLegalReference(payment.taxType);
  const taxConfig = taxTypeConfig[payment.taxType];
  
  // Calculate aggregates from demo data
  const employees = demoEmployeeTaxBreakdown;
  const totalGross = employees.reduce((sum, e) => sum + e.grossAmount, 0);
  const totalPdfo = employees.reduce((sum, e) => sum + e.pdfoAmount, 0);
  const totalMilitary = employees.reduce((sum, e) => sum + e.militaryAmount, 0);
  const totalEsv = employees.reduce((sum, e) => sum + e.esvAmount, 0);

  // Determine which tax amount to show based on payment type
  const getEmployeeTaxAmount = (emp: EmployeeTaxBreakdown): number => {
    switch (payment.taxType) {
      case "pdfo": return emp.pdfoAmount;
      case "military": return emp.militaryAmount;
      case "esv-employer": return emp.esvAmount;
      default: return 0;
    }
  };

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban);
    toast({ title: "Скопійовано", description: "IBAN скопійовано в буфер обміну" });
  };

  const formatCurrency = (amount: number) => `₴${amount.toLocaleString("uk-UA")}`;

  return (
    <div className="space-y-5">
      {/* 0. Sanctions for overdue (rendered only if overdue) */}
      <OverdueSanctionsSection payment={payment} />

      {/* 1. Aggregate Summary */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Загальна інформація</h4>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Фонд оплати праці</span>
              <span className="font-medium font-mono">{formatCurrency(totalGross)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {taxConfig.shortLabel} ({taxConfig.rate}%)
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">
                {formatCurrency(payment.amountToPay)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Працівників</span>
              <span>{employees.length}</span>
            </div>
            {/* Navigate to 1DF report */}
            {onNavigateToReport && (
              <div className="pt-2 border-t mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-violet-600 hover:text-violet-700 w-full justify-start -ml-2"
                  onClick={() => onNavigateToReport("1df", payment.period)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Переглянути звіт 4ДФ
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Per-Employee Breakdown */}
      <section>
        <Collapsible open={isEmployeesExpanded} onOpenChange={setIsEmployeesExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-auto py-2 px-0">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">По працівниках</h4>
                <Badge variant="secondary" className="text-xs">
                  {employees.length}
                </Badge>
              </div>
              {isEmployeesExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-2">
              {employees.map((emp) => (
                <div 
                  key={emp.employeeId}
                  className="p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{emp.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{emp.position}</p>
                    </div>
                    {onNavigateToEmployee && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs"
                        onClick={() => onNavigateToEmployee(emp.employeeId)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Брутто:</span>
                      <span className="ml-1 font-mono">{formatCurrency(emp.grossAmount)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground">{taxConfig.shortLabel}:</span>
                      <span className="ml-1 font-mono font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrency(getEmployeeTaxAmount(emp))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* 3. Legal Basis */}
      {legalRef && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Законодавча база</h4>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Стаття:</span>
              <span className="font-medium">{legalRef.article}</span>
            </div>
            {legalRef.rate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ставка:</span>
                <span>{legalRef.rate}</span>
              </div>
            )}
            {legalRef.deadline && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Термін сплати:</span>
                <span>{legalRef.deadline}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-1 border-t">
              {legalRef.description}
            </p>
          </div>
        </section>
      )}

      {/* 4. Payroll Reference */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Відомість</h4>
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="text-sm">
            <p className="font-medium">Відомість №{payment.month || 3}/{payment.year}</p>
            <p className="text-xs text-muted-foreground">
              Нараховано: {format(new Date(payment.deadline), "dd MMMM yyyy", { locale: uk })}
            </p>
          </div>
          {onNavigateToPayroll && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onNavigateToPayroll}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Відкрити
            </Button>
          )}
        </div>
      </section>

      {/* 5. Payment Requisites */}
      {budgetCode && budgetCode.iban && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Реквізити для оплати</h4>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Отримувач:</span>
              <span className="font-medium">{budgetCode.recipient}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">КБК:</span>
              <span className="font-mono">{budgetCode.code}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">IBAN:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs">{budgetCode.iban.slice(0, 14)}...</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopyIban(budgetCode.iban)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
