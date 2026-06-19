/**
 * Tax FOP Detail Section (ЄП, ЄСВ)
 * Displays detailed breakdown for FOP tax payments
 */

import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  Calculator, 
  Scale, 
  Building2, 
  TrendingUp, 
  History,
  Copy,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { type TaxPayment, taxBudgetCodes, taxTypeConfig } from "@/config/paymentsConfig";
import { 
  getLegalReference, 
  getQuarterBreakdown, 
  getPaymentHistory,
  type MonthlyIncomeBreakdown,
  type PaymentHistoryItem,
} from "@/config/paymentDetailConfig";
import { formatIban } from "@/lib/iban";
import { formatTaxPaymentPurpose } from "@/lib/paymentPurposeFormatter";
import { MIN_WAGE_2026, MIN_ESV_MONTHLY_2026, TAX_RATES_2026, PAYMENT_KIND_CODES, PAYMENT_KIND_LABELS } from "@/config/taxRates2026";
import { OverdueSanctionsSection } from "./OverdueSanctionsSection";

interface TaxFopDetailSectionProps {
  payment: TaxPayment;
  onNavigateToIncomeBook?: () => void;
  onNavigateToReport?: (reportType: string, period: string) => void;
}

export function TaxFopDetailSection({ payment, onNavigateToIncomeBook, onNavigateToReport }: TaxFopDetailSectionProps) {
  const { toast } = useToast();
  const budgetCode = taxBudgetCodes[payment.taxType];
  const legalRef = getLegalReference(payment.taxType);
  const taxConfig = taxTypeConfig[payment.taxType];
  
  // Get quarterly breakdown for ЄП
  const quarterBreakdown = payment.quarter 
    ? getQuarterBreakdown(payment.quarter, payment.year) 
    : [];
  const totalIncome = quarterBreakdown.reduce((sum, m) => sum + m.amount, 0);
  
  // Get payment history
  const paymentHistory = getPaymentHistory(payment.taxType);

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban);
    toast({ title: "Скопійовано", description: "IBAN скопійовано в буфер обміну" });
  };

  const handleCopyRequisites = () => {
    if (!budgetCode) return;
    const text = `Отримувач: ${budgetCode.recipient}\nЄДРПОУ: ${budgetCode.edrpou}\nІБАН: ${budgetCode.iban}\nКБК: ${budgetCode.code}\nПризначення: ${payment.taxTypeLabel} за ${payment.period}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Скопійовано", description: "Реквізити скопійовано в буфер обміну" });
  };

  const formatCurrency = (amount: number) => `₴${amount.toLocaleString("uk-UA")}`;

  return (
    <div className="space-y-5">
      {/* 0. Sanctions for overdue (rendered only if overdue) */}
      <OverdueSanctionsSection payment={payment} />

      {/* 1. AI Calculation */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">AI-розрахунок</h4>
        </div>
        <div className="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-violet-700 dark:text-violet-300">
                {payment.taxType === "ep" ? "Єдиний податок" : "Єдиний соціальний внесок"}
              </p>
              {payment.taxType === "ep" && payment.calculatedFromIncome ? (
                <>
                  <p className="text-sm text-violet-600 dark:text-violet-400">
                    <span className="font-mono bg-violet-100 dark:bg-violet-900/50 px-1.5 py-0.5 rounded">
                      {formatCurrency(payment.calculatedFromIncome)} × 5%
                    </span>
                    {" = "}
                    <span className="font-semibold">{formatCurrency(payment.amountToPay)}</span>
                  </p>
                  {onNavigateToIncomeBook && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-violet-600 hover:text-violet-700 -ml-2"
                      onClick={onNavigateToIncomeBook}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Переглянути в Книзі доходів
                    </Button>
                  )}
                </>
              ) : payment.taxType === "esv" ? (
                <>
                  <p className="text-sm text-violet-600 dark:text-violet-400">
                    <span className="font-mono bg-violet-100 dark:bg-violet-900/50 px-1.5 py-0.5 rounded">
                      {formatCurrency(MIN_WAGE_2026)} × {Math.round(TAX_RATES_2026.ESV * 100)}% × 3 міс
                    </span>
                    {" = "}
                    <span className="font-semibold">{formatCurrency(payment.amountToPay)}</span>
                  </p>
                  <p className="text-xs text-violet-600/70 dark:text-violet-400/70">
                    База — мінзарплата 2026 ({formatCurrency(MIN_WAGE_2026)}). Мін. внесок: {formatCurrency(MIN_ESV_MONTHLY_2026)}/міс.
                  </p>
                </>
              ) : (
                <p className="text-sm text-violet-600 dark:text-violet-400">
                  Сума: <span className="font-semibold">{formatCurrency(payment.amountToPay)}</span>
                </p>
              )}
              {/* Navigate to related report */}
              {onNavigateToReport && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-violet-600 hover:text-violet-700 -ml-2"
                  onClick={() => onNavigateToReport(payment.taxType, payment.period)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Переглянути декларацію
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Income Breakdown (for ЄП only) */}
      {payment.taxType === "ep" && quarterBreakdown.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">База нарахування ({payment.period})</h4>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border">
            <div className="space-y-2">
              {quarterBreakdown.map((month, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{month.month}</span>
                  <span className="font-mono">{formatCurrency(month.amount)}</span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-medium">
                <span>Всього дохід</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

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

      {/* 4. Payment Requisites */}
      {budgetCode && budgetCode.iban && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">Реквізити для оплати</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={handleCopyRequisites}
            >
              <Copy className="h-3 w-3 mr-1" />
              Копіювати все
            </Button>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Отримувач:</span>
              <span className="font-medium text-right">{budgetCode.recipient}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ЄДРПОУ:</span>
              <span className="font-mono">{budgetCode.edrpou}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">КБК:</span>
              <span className="font-mono">{budgetCode.code}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">IBAN:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleCopyIban(budgetCode.iban)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Копіювати
                </Button>
              </div>
              <p className="font-mono text-xs bg-background px-2 py-1.5 rounded border break-all">
                {formatIban(budgetCode.iban)}
              </p>
            </div>
          </div>

          {/* Призначення платежу за форматом ДПС */}
          <div className="mt-3 p-3 bg-muted/30 rounded-lg border space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Призначення платежу (формат ДПС)
              </span>
              <Badge variant="outline" className="text-[10px]">
                {PAYMENT_KIND_CODES.CURRENT} — {PAYMENT_KIND_LABELS[PAYMENT_KIND_CODES.CURRENT]}
              </Badge>
            </div>
            <p className="font-mono text-xs bg-background px-2 py-1.5 rounded border break-all">
              {formatTaxPaymentPurpose({
                kindCode: PAYMENT_KIND_CODES.CURRENT,
                payerCode: budgetCode.edrpou,
                description: `${payment.taxTypeLabel} за ${payment.period}`,
              })}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Постанова НБУ №216. Коди: 101 — поточна сплата, 121 — штраф, 140 — пеня.
            </p>
          </div>
        </section>
      )}

      {/* 5. Payment History */}
      {paymentHistory.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Історія платежів</h4>
          </div>
          <div className="space-y-2">
            {paymentHistory.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2">
                  {item.status === "paid" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span>{item.period}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-muted-foreground">
                    {formatCurrency(item.amount)}
                  </span>
                  {item.status === "paid" && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(item.paidDate), "dd.MM.yy")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
