/**
 * Income Detail Section — повний redesign
 * Реквізити платника, raw-призначення, класифікація для Книги доходів,
 * залишок ліміту ЄП, ПДВ-розшифровка, ID операції з copy.
 */

import { useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  Receipt, 
  Building2, 
  Wallet,
  BookOpen,
  FileText,
  ExternalLink,
  Sparkles,
  Copy,
  ShieldCheck,
  Info,
  ArrowRight,
  Scale,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { type IncomeBookRecord, demoIncomeRecords } from "@/config/incomeBookConfig";
import { formatIban } from "@/lib/iban";
import { parseIncomingPurpose } from "@/lib/paymentPurposeFormatter";
import {
  TAX_RATES_2026,
  getEpLimitInfo,
} from "@/config/taxRates2026";

/** Сума оподатковуваного доходу ЄП за поточний рік (виключаючи поточний запис). */
function aggregateEpUsedYTD(currentRecordId: string): number | null {
  const currentYear = new Date().getFullYear();
  const records = demoIncomeRecords.filter(r => {
    if (r.id === currentRecordId) return false;
    if (r.status !== "income") return false;
    if (!r.inIncomeBook || r.inIncomeBook <= 0) return false;
    try {
      return new Date(r.date).getFullYear() === currentYear;
    } catch {
      return false;
    }
  });
  if (records.length === 0) return null;
  return records.reduce((sum, r) => sum + r.inIncomeBook, 0);
}

interface IncomeDetailSectionProps {
  record: IncomeBookRecord;
  onNavigateToContractor?: (contractorId: string) => void;
  onNavigateToDocument?: (documentId: string) => void;
  onNavigateToIncomeBook?: () => void;
}

export function IncomeDetailSection({ 
  record, 
  onNavigateToContractor,
  onNavigateToDocument,
  onNavigateToIncomeBook,
}: IncomeDetailSectionProps) {

  const formatCurrency = (amount: number) => `₴${amount.toLocaleString("uk-UA")}`;
  
  const isTaxableIncome = record.status === "income" && record.inIncomeBook > 0;
  const parsedPurpose = parseIncomingPurpose(record.description || "");
  
  // Реальна агрегація з Книги доходів (D)
  const epUsedYTD = aggregateEpUsedYTD(record.id);
  const [taxSystem, setTaxSystem] = useState<"ep_1" | "ep_2" | "ep_3" | "general">("ep_3");
  const [incomeKind, setIncomeKind] = useState<"goods" | "services" | "royalty" | "interest">("services");
  const [isVatPayer, setIsVatPayer] = useState<boolean>(false);
  const [firstEvent, setFirstEvent] = useState<"prepayment" | "shipment">("prepayment");
  // TODO: брати з record.currency коли модель розширить
  const [currency, setCurrency] = useState<"UAH" | "USD" | "EUR">("UAH");
  const defaultRate = currency === "USD" ? 41.5 : currency === "EUR" ? 45.2 : 1;
  const [nbuRate, setNbuRate] = useState<number>(defaultRate);

  const isEp = taxSystem.startsWith("ep_");
  const epGroup = taxSystem === "ep_1" ? 1 : taxSystem === "ep_2" ? 2 : taxSystem === "ep_3" ? 3 : null;
  const epRate =
    taxSystem === "ep_1" ? null :
    taxSystem === "ep_2" ? null :
    taxSystem === "ep_3" ? TAX_RATES_2026.EP_GROUP_3 : null;

  const epInfo =
    isTaxableIncome && epGroup && epUsedYTD !== null
      ? getEpLimitInfo(epGroup as 1 | 2 | 3, epUsedYTD + record.inIncomeBook)
      : null;
  const epDataUnavailable = isTaxableIncome && !!epGroup && epUsedYTD === null;

  const vatAmount = isVatPayer ? Math.round(record.amount / 6) : 0;
  const netAmount = record.amount - vatAmount;

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({ description: `${label} скопійовано` });
  };

  return (
    <div className="space-y-5">
      {/* 1. Operation Info */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Операція</h4>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border space-y-2 text-sm">
          <div className="flex justify-between items-center gap-2">
            <span className="text-muted-foreground">ID транзакції</span>
            <button
              type="button"
              onClick={() => handleCopy(record.id, "ID")}
              className="font-mono text-xs inline-flex items-center gap-1 hover:text-primary transition-colors"
              title={record.id}
            >
              <span className="truncate max-w-[180px]">{record.id}</span>
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Дата зарахування</span>
            <span>{format(new Date(record.date), "dd MMMM yyyy, HH:mm", { locale: uk })}</span>
          </div>
          {record.valuationDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Дата валютування</span>
              <span>{format(new Date(record.valuationDate), "dd.MM.yyyy")}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Спосіб</span>
            <span className="capitalize">
              {record.paymentType === "bank" ? "Банківський рахунок" :
               record.paymentType === "cash" ? "Готівка" :
               record.paymentType === "card" ? "Картка/еквайринг" :
               record.paymentType === "prro" ? "ПРРО" : record.paymentType}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Джерело</span>
            <Badge variant="outline" size="sm" className="text-[10px] uppercase">{record.source}</Badge>
          </div>
        </div>
      </section>

      {/* 2. Payer Requisites */}
      {record.contractor && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Реквізити платника</h4>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border space-y-2 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{record.contractor}</p>
                {record.contractorCode && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {record.contractorCode.length === 8 ? "ЄДРПОУ" : "ІПН"}: {record.contractorCode}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                {record.contractorCode && record.contractorCode.length === 8 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          asChild
                        >
                          <a 
                            href={`https://usr.minjust.gov.ua/ua/freesearch?code=${record.contractorCode}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Перевірити в ЄДР</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {onNavigateToContractor && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => onNavigateToContractor(record.contractorCode || record.contractor || "")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Картка
                  </Button>
                )}
              </div>
            </div>
            {record.contractorIban && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">IBAN</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(record.contractorIban!, "IBAN")}
                    className="font-mono text-xs inline-flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    {formatIban(record.contractorIban)}
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Raw Purpose from bank statement */}
      {record.description && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Призначення платежу від платника</h4>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg border space-y-2">
            <p className="text-sm font-mono leading-relaxed break-words">
              {record.description}
            </p>
            {parsedPurpose.isFormatted && (
              <div className="pt-2 border-t space-y-1 text-xs">
                {parsedPurpose.kindCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Код виду сплати</span>
                    <Badge variant="outline" size="sm" className="text-[10px]">{parsedPurpose.kindCode}</Badge>
                  </div>
                )}
                {parsedPurpose.payerCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Код платника</span>
                    <span className="font-mono">{parsedPurpose.payerCode}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Financial Details + VAT breakdown */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Фінансові деталі</h4>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Сума надходження</span>
              <span className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(record.amount)}
              </span>
            </div>
            {isVatPayer && vatAmount > 0 && (
              <>
                <Separator />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Сума без ПДВ</span>
                  <span className="font-mono">{formatCurrency(netAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>ПДВ ({(TAX_RATES_2026.VAT_STANDARD * 100).toFixed(0)}%)</span>
                  <span className="font-mono">{formatCurrency(vatAmount)}</span>
                </div>
              </>
            )}
            {record.commission && record.commission > 0 && (
              <>
                <Separator />
                <div className="flex justify-between text-muted-foreground">
                  <span>Комісія еквайрингу</span>
                  <span className="font-mono">−{formatCurrency(record.commission)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Чистий дохід</span>
                  <span className="font-mono">
                    {formatCurrency(record.amount - record.commission)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 4b. Classification selectors */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Класифікація доходу</h4>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Система оподаткування</Label>
              <Select value={taxSystem} onValueChange={(v) => setTaxSystem(v as typeof taxSystem)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ep_1">ЄП — 1 група</SelectItem>
                  <SelectItem value="ep_2">ЄП — 2 група</SelectItem>
                  <SelectItem value="ep_3">ЄП — 3 група</SelectItem>
                  <SelectItem value="general">Загальна система</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Тип доходу</Label>
              <Select value={incomeKind} onValueChange={(v) => setIncomeKind(v as typeof incomeKind)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goods">Товари</SelectItem>
                  <SelectItem value="services">Послуги</SelectItem>
                  <SelectItem value="royalty">Роялті</SelectItem>
                  <SelectItem value="interest">Проценти</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Scale className="h-3.5 w-3.5 text-muted-foreground" />
              <Label htmlFor="vat-toggle" className="text-xs cursor-pointer">
                Контрагент — платник ПДВ
              </Label>
            </div>
            <Switch id="vat-toggle" checked={isVatPayer} onCheckedChange={setIsVatPayer} />
          </div>
          {(incomeKind === "royalty" || incomeKind === "interest") && isEp && (
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
              <Info className="h-3 w-3 inline mr-1" />
              Роялті та проценти не дозволені на ЄП (ПКУ 292.1) — оподатковуються за загальною системою (ПДФО 18% + ВЗ 5%).
            </div>
          )}
        </div>
      </section>

      {/* 4c. Правило першої події (ПКУ ст. 187) */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Scale className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Правило першої події (ПКУ ст. 187)</h4>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={firstEvent === "prepayment" ? "default" : "outline"}
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => setFirstEvent("prepayment")}
            >
              Передоплата
            </Button>
            <Button
              type="button"
              variant={firstEvent === "shipment" ? "default" : "outline"}
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => setFirstEvent("shipment")}
            >
              Відвантаження раніше
            </Button>
          </div>
          {firstEvent === "prepayment" && isVatPayer && (incomeKind === "goods" || incomeKind === "services") && (
            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
              <Info className="h-3 w-3 inline mr-1" />
              Виписати ПН на передоплату — обов'язково протягом 5 робочих днів від дати зарахування коштів.
            </div>
          )}
          {firstEvent === "shipment" && (
            <div className="p-2 bg-muted/50 rounded border text-xs text-muted-foreground">
              <Info className="h-3 w-3 inline mr-1" />
              ПН за цією операцією не виписується (перша подія — відвантаження раніше за оплату).
            </div>
          )}
        </div>
      </section>

      {/* 4d. Валюта і курсова різниця (демо — поки немає record.currency) */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Валюта операції</h4>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Валюта</Label>
              <Select value={currency} onValueChange={(v) => { setCurrency(v as typeof currency); setNbuRate(v === "USD" ? 41.5 : v === "EUR" ? 45.2 : 1); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UAH">UAH (₴)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {currency !== "UAH" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Курс НБУ</Label>
                <input
                  type="number"
                  step="0.01"
                  value={nbuRate}
                  onChange={(e) => setNbuRate(parseFloat(e.target.value) || 0)}
                  className="h-8 w-full text-xs rounded-md border border-input bg-background px-2 font-mono"
                />
              </div>
            )}
          </div>
          {currency !== "UAH" && nbuRate > 0 && (
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800 text-xs">
              <span className="text-muted-foreground">Курсова різниця: </span>
              <span className="font-mono font-medium">
                {record.amount.toLocaleString("uk-UA")} {currency} × {nbuRate} = {formatCurrency(Math.round(record.amount * nbuRate))}
              </span>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <h4 className="font-medium text-sm">Облік у Книзі доходів</h4>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">До Книги доходів</p>
              <p className="text-xs text-muted-foreground">
                {isTaxableIncome ? "Оподатковуваний дохід ЄП" : "Не включається"}
              </p>
            </div>
            <span className={cn(
              "font-semibold font-mono",
              isTaxableIncome ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            )}>
              {formatCurrency(record.inIncomeBook)}
            </span>
          </div>
          
          {/* EP limit progress (для 3 групи ЄП) */}
          {epInfo && (
            <div className="pt-2 border-t space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  Ліміт ЄП {epGroup} група (2026)
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[260px]">
                        Граничний річний дохід для перебування на {epGroup} групі ЄП у 2026 році.
                        При перевищенні — перехід на загальну систему.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
                <span className={cn(
                  "font-mono",
                  epInfo.overLimit ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-muted-foreground"
                )}>
                  {epInfo.percentUsed.toFixed(1)}%
                </span>
              </div>
              <Progress value={epInfo.percentUsed} className="h-1.5" />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>{formatCurrency(epInfo.used)} використано</span>
                <span>залишок {formatCurrency(epInfo.remaining)}</span>
              </div>
            </div>
          )}
          {epDataUnavailable && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground italic">
                <Info className="h-3 w-3 inline mr-1" />
                Дані за рік недоступні — додайте записи в Книгу доходів для розрахунку залишку ліміту ЄП.
              </p>
            </div>
          )}
          
          {/* Tax implications */}
          {isTaxableIncome && (
            <div className="pt-2 border-t space-y-1">
              {isEp && epRate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3" />
                  <span>
                    ЄП ({(epRate * 100).toFixed(0)}%): {formatCurrency(Math.round(record.inIncomeBook * epRate))}
                  </span>
                </div>
              )}
              {!isEp && (
                <>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3" />
                    <span>
                      ПДФО ({(TAX_RATES_2026.PDFO * 100).toFixed(0)}%): {formatCurrency(Math.round(record.inIncomeBook * TAX_RATES_2026.PDFO))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3" />
                    <span>
                      ВЗ ({(TAX_RATES_2026.MILITARY_TAX * 100).toFixed(0)}%): {formatCurrency(Math.round(record.inIncomeBook * TAX_RATES_2026.MILITARY_TAX))}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* AI note */}
          {record.aiNote && (
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {record.aiNote}
                </p>
              </div>
            </div>
          )}

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

      {/* 6. Related Document */}
      {record.relatedDocument && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">Пов'язаний документ</h4>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {record.relatedDocument.type === "invoice" ? "Рахунок" :
                   record.relatedDocument.type === "act" ? "Акт виконаних робіт" :
                   record.relatedDocument.type === "contract" ? "Договір" : "Чек"} №{record.relatedDocument.number}
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
                className="h-7 text-xs"
                onClick={() => onNavigateToDocument(record.relatedDocument!.number)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Відкрити
              </Button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
