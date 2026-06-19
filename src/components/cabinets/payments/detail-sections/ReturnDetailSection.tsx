/**
 * Return Detail Section
 * Структурована причина повернення, різниця сум, попередження про крос-періодне коригування.
 */

import { format, isSameMonth, isSameQuarter } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  ArrowLeftRight, 
  Receipt, 
  FileText,
  BookOpen,
  ExternalLink,
  AlertCircle,
  Sparkles,
  AlertTriangle,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type IncomeBookRecord } from "@/config/incomeBookConfig";
import { TAX_RATES_2026 } from "@/config/taxRates2026";

interface ReturnDetailSectionProps {
  record: IncomeBookRecord;
  onNavigateToOriginalPayment?: (paymentId: string) => void;
  onNavigateToDocument?: (documentId: string) => void;
  onNavigateToIncomeBook?: () => void;
}

// Категоризація причини на основі опису (mock — у проді з record.returnReason)
function classifyReason(description: string): { label: string; color: string } {
  const desc = description.toLowerCase();
  if (desc.includes("помилк")) return { label: "Помилковий платіж", color: "amber" };
  if (desc.includes("відмов")) return { label: "Відмова клієнта", color: "blue" };
  if (desc.includes("претенз") || desc.includes("якіст")) return { label: "Претензія/брак", color: "rose" };
  if (desc.includes("товар") || desc.includes("повернен")) return { label: "Повернення товару", color: "violet" };
  return { label: "Інше", color: "slate" };
}

export function ReturnDetailSection({ 
  record, 
  onNavigateToOriginalPayment,
  onNavigateToDocument,
  onNavigateToIncomeBook,
}: ReturnDetailSectionProps) {

  const formatCurrency = (amount: number) => `₴${amount.toLocaleString("uk-UA")}`;
  
  const originalPaymentId = record.linkedReturnId || record.relatedDocument?.number || null;
  const reason = classifyReason(record.description || "");
  
  // Mock оригінальної суми — у проді з прив'язаного запису
  const originalAmount = record.amount * 3; // demo: повернення = 1/3 від оригіналу
  const remainingToReturn = Math.max(0, originalAmount - record.amount);
  
  // Перевірка крос-періодного повернення (демо: оригінал на 3 міс раніше)
  const originalDate = new Date(record.date);
  originalDate.setMonth(originalDate.getMonth() - 3);
  const returnDate = new Date(record.date);
  const isSamePeriod = isSameQuarter(originalDate, returnDate) && originalDate.getFullYear() === returnDate.getFullYear();
  const isCrossPeriod = !isSamePeriod;

  return (
    <div className="space-y-5">
      {/* 1. Return Reason */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Причина повернення</h4>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Повернення коштів
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1 break-words">
                  {record.description || "Повернення оплати за товари/послуги"}
                </p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              size="sm"
              className={cn(
                "shrink-0 text-[10px]",
                reason.color === "amber" && "bg-amber-100 text-amber-700",
                reason.color === "blue" && "bg-blue-100 text-blue-700",
                reason.color === "rose" && "bg-rose-100 text-rose-700",
                reason.color === "violet" && "bg-violet-100 text-violet-700",
                reason.color === "slate" && "bg-slate-100 text-slate-700",
              )}
            >
              {reason.label}
            </Badge>
          </div>

          {record.aiNote && (
            <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
              <div className="flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {record.aiNote}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Original Payment + Amount Difference */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Пов'язане надходження</h4>
        </div>
        {originalPaymentId ? (
          <div className="p-3 bg-muted/30 rounded-lg border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium">Оригінальний платіж</p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  ID: {originalPaymentId}
                </p>
              </div>
              {onNavigateToOriginalPayment && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs shrink-0"
                  onClick={() => onNavigateToOriginalPayment(originalPaymentId)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Переглянути
                </Button>
              )}
            </div>
            <Separator />
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Сума оригіналу</span>
                <span className="font-mono">{formatCurrency(originalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Повернуто</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">−{formatCurrency(record.amount)}</span>
              </div>
              {remainingToReturn > 0 && (
                <div className="flex justify-between font-medium pt-1 border-t">
                  <span>Залишок до повернення</span>
                  <span className="font-mono">{formatCurrency(remainingToReturn)}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              Пов'язаний платіж не знайдено
            </p>
          </div>
        )}
      </section>

      {/* 3. Cross-period warning */}
      {isCrossPeriod && (
        <section>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                  Повернення в іншому періоді
                </p>
                <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                  Оригінальний платіж був у попередньому кварталі. Повернення зменшує дохід <strong>попереднього періоду</strong> — потрібна <strong>уточнююча декларація ЄП</strong> за відповідний квартал.
                </p>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <FileWarning className="h-3 w-3 mr-1" />
                  Створити уточнюючу декларацію
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Supporting Documents */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Документи-підстава</h4>
        </div>
        <div className="space-y-2">
          {record.relatedDocument ? (
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {record.relatedDocument.type === "act" ? "Акт повернення" : 
                     record.relatedDocument.type === "invoice" ? "Рахунок на повернення" : 
                     "Документ"} №{record.relatedDocument.number}
                  </p>
                  {record.relatedDocument.date && (
                    <p className="text-xs text-muted-foreground">
                      від {format(new Date(record.relatedDocument.date), "dd.MM.yyyy")}
                    </p>
                  )}
                </div>
              </div>
              {onNavigateToDocument && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => onNavigateToDocument(record.relatedDocument!.number)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                Документи не прикріплено
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Accounting Impact */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Вплив на облік</h4>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Сума повернення</span>
              <span className="font-mono text-amber-600 dark:text-amber-400">
                −{formatCurrency(record.amount)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Коригування Книги доходів</span>
              <span className="font-mono font-medium text-rose-600 dark:text-rose-400">
                −{formatCurrency(record.inIncomeBook)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Період коригування</span>
              <span>{format(new Date(record.date), "MMMM yyyy", { locale: uk })}</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Зменшення оподатковуваного доходу на {formatCurrency(Math.abs(record.inIncomeBook))}.
              Економія ЄП ({(TAX_RATES_2026.EP_GROUP_3 * 100).toFixed(0)}%): {formatCurrency(Math.round(Math.abs(record.inIncomeBook) * TAX_RATES_2026.EP_GROUP_3))}.
            </p>
          </div>

          {onNavigateToIncomeBook && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={onNavigateToIncomeBook}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Відкрити в Книзі доходів
            </Button>
          )}
        </div>
      </section>

      {/* Contractor info if available */}
      {record.contractor && (
        <section>
          <p className="text-xs text-muted-foreground mb-1">Контрагент</p>
          <p className="text-sm font-medium">{record.contractor}</p>
          {record.contractorCode && (
            <p className="text-xs text-muted-foreground">
              {record.contractorCode.length === 8 ? "ЄДРПОУ" : "ІПН"}: {record.contractorCode}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
