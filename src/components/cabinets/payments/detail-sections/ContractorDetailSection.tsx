/**
 * Contractor Detail Section
 * Displays comprehensive contractor payment information
 */

import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  Building2, 
  FileText, 
  Wallet,
  CreditCard,
  Calendar,
  Copy,
  ExternalLink,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { type ContractorPayment, paymentPurposeTypeConfig } from "@/config/paymentsConfig";
import { formatIban, extractMfoFromIban } from "@/lib/iban";

interface ContractorDetailSectionProps {
  payment: ContractorPayment;
  onNavigateToContractor?: (contractorId: string) => void;
  onNavigateToDocument?: (documentId: string) => void;
}

export function ContractorDetailSection({ 
  payment, 
  onNavigateToContractor,
  onNavigateToDocument,
}: ContractorDetailSectionProps) {
  const { toast } = useToast();

  const handleCopyIban = (iban: string) => {
    navigator.clipboard.writeText(iban);
    toast({ title: "Скопійовано", description: "IBAN скопійовано в буфер обміну" });
  };

  const handleCopyRequisites = () => {
    const text = `Отримувач: ${payment.contractor}\n${payment.contractorCode ? `ЄДРПОУ: ${payment.contractorCode}\n` : ''}${payment.recipientIban ? `IBAN: ${payment.recipientIban}\n` : ''}Призначення: ${payment.purpose}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Скопійовано", description: "Реквізити скопійовано в буфер обміну" });
  };

  const formatCurrency = (amount: number) => `₴${amount.toLocaleString("uk-UA")}`;
  const purposeConfig = paymentPurposeTypeConfig[payment.paymentPurposeType];

  // Mock verification status
  const isVerified = payment.contractorCode && payment.contractorCode.length === 8;

  return (
    <div className="space-y-5">
      {/* 1. Contractor Info */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Контрагент</h4>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{payment.contractor}</p>
              {payment.contractorCode && (
                <p className="text-sm text-muted-foreground">
                  {payment.contractorCode.length === 8 ? "ЄДРПОУ" : "ІПН"}: {payment.contractorCode}
                </p>
              )}
            </div>
            {onNavigateToContractor && payment.contractorId && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => onNavigateToContractor(payment.contractorId!)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Картка
              </Button>
            )}
          </div>
          {/* Verification status */}
          <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isVerified ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    Верифіковано в ЄДРПОУ
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    Не верифіковано
                  </span>
                </>
              )}
            </div>
            {payment.contractorCode && payment.contractorCode.length === 8 && (
              <a
                href={`https://usr.minjust.gov.ua/content/free-search/person-result?code=${payment.contractorCode}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                <Shield className="h-3 w-3" />
                Перевірити в ЄДР
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 2. Supporting Documents */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Документи-підстава</h4>
        </div>
        <div className="space-y-2">
          {payment.contractNumber && (
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Договір №{payment.contractNumber}</p>
                  <p className="text-xs text-muted-foreground">Підстава для оплати</p>
                </div>
              </div>
              {onNavigateToDocument && payment.contractId && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => onNavigateToDocument(payment.contractId!)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          {payment.invoiceNumber && (
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Рахунок №{payment.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">Рахунок-фактура</p>
                </div>
              </div>
              {onNavigateToDocument && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onNavigateToDocument(payment.invoiceNumber!)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          {payment.actNumber && (
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Акт №{payment.actNumber}</p>
                  <p className="text-xs text-muted-foreground">Акт виконаних робіт</p>
                </div>
              </div>
              {onNavigateToDocument && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => onNavigateToDocument(payment.actNumber!)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          {!payment.contractNumber && !payment.invoiceNumber && !payment.actNumber && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Документи-підстави не прикріплено
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 2. Supporting Documents */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Документи-підстава</h4>
        </div>
        <div className="space-y-2">
          {payment.contractNumber && (
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Договір №{payment.contractNumber}</p>
                  <p className="text-xs text-muted-foreground">Підстава для оплати</p>
                </div>
              </div>
              {onNavigateToDocument && payment.contractId && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => onNavigateToDocument(payment.contractId!)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          {payment.invoiceNumber && (
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Рахунок №{payment.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">Рахунок-фактура</p>
                </div>
              </div>
            </div>
          )}
          {payment.actNumber && (
            <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Акт №{payment.actNumber}</p>
                  <p className="text-xs text-muted-foreground">Акт виконаних робіт</p>
                </div>
              </div>
            </div>
          )}
          {!payment.contractNumber && !payment.invoiceNumber && !payment.actNumber && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Документи-підстави не прикріплено
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Payment Details */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Деталі оплати</h4>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Тип</span>
            <Badge variant="secondary" className="text-xs">
              {purposeConfig?.label || "Інше"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Сума</span>
            <span className="font-semibold font-mono">{formatCurrency(payment.amount)}</span>
          </div>
          {payment.vatAmount && payment.vatAmount > 0 && (
            <>
              <div className="flex justify-between text-muted-foreground">
                <span>ПДВ ({payment.vatRate || 20}%)</span>
                <span className="font-mono">{formatCurrency(payment.vatAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Без ПДВ</span>
                <span className="font-mono">{formatCurrency(payment.amount - payment.vatAmount)}</span>
              </div>
            </>
          )}
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Призначення платежу</p>
            <p className="text-sm">{payment.purpose}</p>
          </div>
        </div>
      </section>

      {/* 4. Bank Requisites */}
      {payment.recipientIban && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h4 className="font-medium text-sm">Банківські реквізити</h4>
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
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">IBAN</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleCopyIban(payment.recipientIban!)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Копіювати
                </Button>
              </div>
              <p className="font-mono text-xs bg-background px-2 py-1.5 rounded border break-all">
                {formatIban(payment.recipientIban)}
              </p>
            </div>
            {payment.recipientBankName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Банк</span>
                <span className="text-right">{payment.recipientBankName}</span>
              </div>
            )}
            {payment.recipientMfo && (
              <div className="flex justify-between items-center pt-1 border-t">
                <span className="text-[11px] text-muted-foreground">МФО (довідково, з IBAN)</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {extractMfoFromIban(payment.recipientIban) || payment.recipientMfo}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Payment Schedule (if partial payment) */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Дата платежу</h4>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Запланована дата</span>
            <span>{format(new Date(payment.date), "dd MMMM yyyy", { locale: uk })}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
