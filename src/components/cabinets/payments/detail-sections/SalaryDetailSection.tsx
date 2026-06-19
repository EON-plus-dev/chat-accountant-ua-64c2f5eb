/**
 * Salary Detail Section
 * Comprehensive salary payment information with PSP support and split tax presentation.
 */

import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {
  User,
  Calendar,
  Calculator,
  Scale,
  CreditCard,
  ExternalLink,
  Briefcase,
  Clock,
  Info,
  Sparkles,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { type SalaryPayment } from "@/config/paymentsConfig";
import { getLegalReference } from "@/config/paymentDetailConfig";
import { formatIban } from "@/lib/iban";
import { calculateSalaryWithPSP, KBK_2026, PSP_THRESHOLD_2026 } from "@/config/taxRates2026";

interface SalaryDetailSectionProps {
  payment: SalaryPayment;
  onNavigateToEmployee?: (employeeId: string) => void;
}

export function SalaryDetailSection({ payment, onNavigateToEmployee }: SalaryDetailSectionProps) {
  const legalRef = getLegalReference("salaryPayment");

  // Calculate taxes from gross with PSP support
  const grossAmount = payment.grossAmount || payment.amount;
  const isAdvance = payment.salaryType === "advance";
  const pspCalc = calculateSalaryWithPSP(grossAmount, true);

  // Use actual values if available, otherwise calculated (with PSP)
  const pdfoAmount = payment.pdfoAmount ?? pspCalc.pdfo;
  const militaryAmount = payment.militaryTaxAmount ?? pspCalc.military;
  const esvAmount = payment.esvAmount ?? pspCalc.esvEmployer;
  const netAmount = payment.netAmount ?? (grossAmount - pdfoAmount - militaryAmount);

  const formatCurrency = (amount: number) => `₴${amount.toLocaleString("uk-UA")}`;

  return (
    <div className="space-y-5">
      {/* 1. Employee Info */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Працівник</h4>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{payment.employeeName}</p>
              <p className="text-sm text-muted-foreground">{payment.employeePosition}</p>
            </div>
            {onNavigateToEmployee && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onNavigateToEmployee(payment.employeeId)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Профіль
              </Button>
            )}
          </div>
          <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              <span>Трудовий договір</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Повна зайнятість</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Accrual Details */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Нарахування</h4>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Період</span>
            <span className="font-medium">{payment.period}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Тип виплати</span>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {payment.salaryTypeLabel}
              </Badge>
              {isAdvance && (
                <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 dark:text-amber-400">
                  Аванс
                </Badge>
              )}
            </div>
          </div>
          {payment.workingDays && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Відпрацьовано днів</span>
              <span>{payment.workingDays}</span>
            </div>
          )}
          {payment.sickDays && payment.sickDays > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Лікарняні</span>
              <span>{payment.sickDays} дн.</span>
            </div>
          )}
          {payment.vacationDays && payment.vacationDays > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Відпустка</span>
              <span>{payment.vacationDays} дн.</span>
            </div>
          )}
          {payment.accrualDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Дата нарахування</span>
              <span>{format(new Date(payment.accrualDate), "dd.MM.yyyy")}</span>
            </div>
          )}
        </div>
      </section>

      {/* 3. Advance info OR full tax calculation split into two payments */}
      {isAdvance ? (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Розрахунок виплати</h4>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Сума авансу</span>
              <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(grossAmount)}
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <p>
                <strong>На аванс податки не утримуються.</strong> ПДФО, ВЗ та ЄСВ нараховуються та сплачуються
                разом із основною зарплатою за місяць (ПКУ 168.1.2).
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Розрахунок зарплати</h4>
          </div>

          {/* Gross + net summary */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Нараховано (брутто)</span>
              <span className="font-medium font-mono">{formatCurrency(grossAmount)}</span>
            </div>
            {pspCalc.pspApplied && (
              <div className="flex items-start gap-2 p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    ПСП застосовано (−{formatCurrency(pspCalc.pspAmount)} до бази ПДФО)
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Дохід ≤ {formatCurrency(PSP_THRESHOLD_2026)} (ПКУ 169.1)
                  </p>
                </div>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>До виплати працівнику (нетто)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {formatCurrency(netAmount)}
              </span>
            </div>
          </div>

          {/* Two-payments split */}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {/* Withholding from employee */}
            <div className="p-3 rounded-lg border bg-rose-50/40 dark:bg-rose-950/20 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  Платіж 1 · утримання з працівника
                </p>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">ПДФО (18%)</span>
                <span className="font-mono">−{formatCurrency(pdfoAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Військовий збір (5%)</span>
                <span className="font-mono">−{formatCurrency(militaryAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xs font-medium">
                <span>Разом до сплати</span>
                <span className="font-mono">{formatCurrency(pdfoAmount + militaryAmount)}</span>
              </div>
              <div className="text-[10px] text-muted-foreground pt-1 space-y-0.5">
                <div>КБК ПДФО: <span className="font-mono">{KBK_2026.PDFO_SALARY}</span></div>
                <div>КБК ВЗ: <span className="font-mono">{KBK_2026.MILITARY_TAX}</span></div>
              </div>
            </div>

            {/* Employer ESV */}
            <div className="p-3 rounded-lg border bg-amber-50/40 dark:bg-amber-950/20 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Платіж 2 · ЄСВ роботодавця
                </p>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">ЄСВ (22%)</span>
                <span className="font-mono">{formatCurrency(esvAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xs font-medium">
                <span>Разом до сплати</span>
                <span className="font-mono">{formatCurrency(esvAmount)}</span>
              </div>
              <div className="text-[10px] text-muted-foreground pt-1">
                КБК: <span className="font-mono">{KBK_2026.ESV_EMPLOYER}</span>
              </div>
            </div>
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground italic flex items-start gap-1">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            Це <strong>два окремі платіжні доручення</strong> з різними КБК та строками сплати.
          </p>
        </section>
      )}

      {/* 4. Legal Basis */}
      {legalRef && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Законодавча база</h4>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Стаття:</span>
              <span className="font-medium">{legalRef.article}</span>
            </div>
            {legalRef.deadline && (
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Термін виплати:</span>
                <span className="text-xs">{legalRef.deadline}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-1 border-t">
              {legalRef.description}
            </p>
          </div>
        </section>
      )}

      {/* 5. Payment Details */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Реквізити виплати</h4>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border space-y-2 text-sm">
          {payment.employeeCardMask && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Картка</span>
              <span className="font-mono">{payment.employeeCardMask}</span>
            </div>
          )}
          {payment.employeeIban && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground shrink-0">IBAN</span>
              <span className="font-mono text-xs break-all text-right">
                {formatIban(payment.employeeIban)}
              </span>
            </div>
          )}
          {payment.payrollNumber && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">№ відомості</span>
              <span>{payment.payrollNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Дата виплати</span>
            <span>{format(new Date(payment.scheduledDate), "dd MMMM yyyy", { locale: uk })}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
