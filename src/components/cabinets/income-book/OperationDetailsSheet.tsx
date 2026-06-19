import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bot, Building2, CreditCard, Hash, Calendar, ArrowRight, Calculator,
  CheckCircle, XCircle, AlertCircle, Link2, Copy,
  Mail, FileText, ExternalLink, Percent, Tags, Check, Plus, ListFilter,
  ChevronLeft, ChevronRight, Undo2, CopyCheck, CopyX,
  UploadCloud, Gift, X as XIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select as USelect,
  SelectContent as USelectContent,
  SelectItem as USelectItem,
  SelectTrigger as USelectTrigger,
  SelectValue as USelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  formatCurrency,
  formatDate,
  getPaymentTypeLabel,
  getSourceLabel,
  getStatusLabel,
  getStatusColor,
  getRowStyles,
  issueTypeConfig,
  type IncomeBookRecord,
  type IncomeRecordStatus,
  type IssueType,
} from "@/config/incomeBookConfig";
import { 
  getIncomeCategoryByCode, 
  getExpenseCategoryByCode,
  getIncomeCategoriesForCabinet,
  getExpenseCategoriesForCabinet,
} from "@/config/categoriesConfig";
import { BankRuleSheet } from "@/components/cabinets/settings/references/bank-rules/BankRuleSheet";
import { DEMO_BANK_RULES, type BankCategorizationRule } from "@/config/bankCategorizationRulesConfig";
import { TransferClassificationSheet, type TransferCategory } from "./TransferClassificationSheet";
import { FifoCalculator } from "@/components/cabinets/calculators/FifoCalculator";
import { DtaCalculatorEnhanced as DtaCalculator } from "@/components/cabinets/calculators/DtaCalculatorEnhanced";

interface OperationDetailsSheetProps {
  record: IncomeBookRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatPromptInsert?: (prompt: string) => void;
  onStatusChange?: (recordId: string, newStatus: IncomeRecordStatus) => void;
  onNavigateToRecord?: (recordId: string) => void;
  onRecordUpdate?: (recordId: string, updates: Partial<IncomeBookRecord>) => void;
  isReadOnly?: boolean;
  /** Optional review queue — enables Next/Prev navigation + counter "3 / 47" */
  queue?: IncomeBookRecord[];
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  /** Optional handler for "Create return" CTA on income records */
  onCreateReturn?: (record: IncomeBookRecord) => void;
}

// Helper to get document type label
const getDocumentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    invoice: "Рахунок",
    act: "Акт",
    contract: "Договір",
    check: "Чек",
    receipt: "Квитанція",
    other: "Документ",
  };
  return labels[type] || type;
};

// Heuristic for proactive «gift / loan / personal» nudge.
// Closes J11 (private inflow) — high-value income from non-business counterparties.
const looksLikePrivateInflow = (record: IncomeBookRecord): boolean => {
  if (record.status !== "income") return false;
  if (record.amount < 50000) return false;
  if (record.source === "prro") return false;
  // Business counterparty heuristic: 8-digit ЄДРПОУ in code, OR has IBAN starting with UA + business prefix.
  const code = (record.contractorCode || "").trim();
  const isBusinessCode = /^\d{8}$/.test(code) || /^\d{10}$/.test(code);
  return !isBusinessCode;
};

// Helper to get AI chips based on status and issue type
const getContextualAIChips = (status: IncomeRecordStatus, issueType?: IssueType) => {
  if (status === "needs-clarification" && issueType) {
    switch (issueType) {
      case "missing-purpose":
        return [
          { label: "Знайти схожі за сумою", prompt: "Знайди схожі операції за сумою для визначення призначення" },
          { label: "Запитати в банку", prompt: "Як отримати деталі платежу від банку?" },
        ];
      case "unknown-contractor":
        return [
          { label: "Пошук в ЄДРПОУ", prompt: "Допоможи знайти контрагента в ЄДРПОУ за кодом" },
          { label: "Перевірити в реєстрі", prompt: "Перевір контрагента у відкритих реєстрах" },
        ];
      case "possible-duplicate":
        return [
          { label: "Показати дублікати", prompt: "Покажи можливі дублікати цієї операції" },
          { label: "Порівняти операції", prompt: "Порівняй деталі схожих операцій" },
        ];
      case "classification":
        return [
          { label: "Знайти схожі перекази", prompt: "Покажи схожі перекази між власними рахунками" },
          { label: "Поясни критерії", prompt: "Поясни як відрізнити внутрішній переказ від доходу" },
        ];
      case "missing-document":
        return [
          { label: "Створити акт", prompt: "Допоможи створити акт для цієї операції" },
          { label: "Знайти документ", prompt: "Пошук пов'язаних документів" },
        ];
      default:
        return [
          { label: "Уточнити статус", prompt: "Допоможи уточнити статус цієї операції" },
          { label: "Поясни правила", prompt: "Поясни правила для таких операцій" },
        ];
    }
  }

  switch (status) {
    case "income":
      return [
        { label: "Схожі операції", prompt: "Покажи схожі операції до цієї" },
        { label: "Аналіз контрагента", prompt: "Проаналізуй операції з цим контрагентом" },
      ];
    case "not-income":
      return [
        { label: "Чому не в дохід?", prompt: "Поясни чому ця операція не включена в дохід" },
        { label: "Перевірити класифікацію", prompt: "Перевір правильність класифікації операції" },
      ];
    case "return":
      return [
        { label: "Знайти оригінал", prompt: "Знайди оригінальну операцію для цього повернення" },
        { label: "Правила повернень", prompt: "Поясни правила обліку повернень для ФОП" },
      ];
    default:
      return [
        { label: "Схожі операції", prompt: "Покажи схожі операції до цієї" },
        { label: "Поясни правила", prompt: "Поясни правила для таких операцій" },
      ];
  }
};

// Extract keywords from transaction description for auto-populating rule
// Delegates to shared helper (filters service stop-words, falls back to contractor).
import { extractRuleKeywords } from "@/config/incomeBookConfig";
function extractKeywordsFromDescription(description: string, contractor?: string): string[] {
  return extractRuleKeywords(description, contractor);
}

// Get issue icon component
const IssueIcon = ({ issueType }: { issueType: IssueType }) => {
  const iconClass = "w-4 h-4";
  switch (issueType) {
    case "missing-purpose":
      return <FileText className={iconClass} />;
    case "unknown-contractor":
      return <Building2 className={iconClass} />;
    case "missing-document":
      return <FileText className={iconClass} />;
    case "possible-duplicate":
      return <Copy className={iconClass} />;
    case "suspicious-amount":
      return <AlertCircle className={iconClass} />;
    case "classification":
      return <AlertCircle className={iconClass} />;
    case "source-mismatch":
      return <AlertCircle className={iconClass} />;
    default:
      return <AlertCircle className={iconClass} />;
  }
};

export const OperationDetailsSheet = ({
  record: recordProp,
  open,
  onOpenChange,
  onChatPromptInsert,
  onStatusChange,
  onNavigateToRecord,
  onRecordUpdate,
  isReadOnly = false,
  queue,
  onNavigateNext,
  onNavigatePrev,
  onCreateReturn,
}: OperationDetailsSheetProps) => {
  const [ruleSheetOpen, setRuleSheetOpen] = useState(false);
  const [classifySheetOpen, setClassifySheetOpen] = useState(false);
  const [fifoSheetOpen, setFifoSheetOpen] = useState(false);
  const [dtaSheetOpen, setDtaSheetOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [privateNudgeDismissed, setPrivateNudgeDismissed] = useState(false);
  const [localRecord, setLocalRecord] = useState<IncomeBookRecord | null>(recordProp);

  // Sync localRecord when record prop changes
  useEffect(() => {
    setLocalRecord(recordProp);
    // Reset dismissal & re-read from localStorage when navigating to a different record
    if (recordProp?.id) {
      try {
        const dismissed = localStorage.getItem(`incomebook:private-nudge-dismissed:${recordProp.id}`);
        setPrivateNudgeDismissed(dismissed === "1");
      } catch {
        setPrivateNudgeDismissed(false);
      }
    } else {
      setPrivateNudgeDismissed(false);
    }
  }, [recordProp]);

  // Queue position (1-based) and total — used for "3 / 47" counter and Next/Prev buttons
  const queueIndex = queue && recordProp ? queue.findIndex(r => r.id === recordProp.id) : -1;
  const queueTotal = queue?.length ?? 0;
  const hasQueue = queueTotal > 0 && queueIndex >= 0;
  const canGoPrev = hasQueue && queueIndex > 0 && !!onNavigatePrev;
  const canGoNext = hasQueue && queueIndex < queueTotal - 1 && !!onNavigateNext;

  // Hotkeys: J/← prev, K/→ next, I=income, N=not-income, R=return (when not in input)
  const handleQuickStatus = useCallback((newStatus: IncomeRecordStatus) => {
    if (isReadOnly || !recordProp) return;
    onStatusChange?.(recordProp.id, newStatus);
  }, [isReadOnly, onStatusChange, recordProp]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement | null)?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if ((k === "j" || e.key === "ArrowLeft") && canGoPrev) { e.preventDefault(); onNavigatePrev?.(); }
      else if ((k === "k" || e.key === "ArrowRight") && canGoNext) { e.preventDefault(); onNavigateNext?.(); }
      else if (k === "i") { e.preventDefault(); handleQuickStatus("income"); }
      else if (k === "n") { e.preventDefault(); handleQuickStatus("not-income"); }
      else if (k === "r") { e.preventDefault(); handleQuickStatus("return"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, canGoPrev, canGoNext, onNavigatePrev, onNavigateNext, handleQuickStatus]);

  if (!localRecord) return null;

  // Shadow 'record' with localRecord so all existing template references work
  const record = localRecord;

  const isIncome = record.status === "income";
  const isNotIncome = record.status === "not-income";
  const isReturn = record.status === "return";
  const needsClarification = record.status === "needs-clarification";

  const aiChips = getContextualAIChips(record.status, record.issueType);

  const handleAIChipClick = (prompt: string) => {
    onChatPromptInsert?.(prompt);
    onOpenChange(false);
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопійовано",
      description: `${label} скопійовано в буфер обміну`,
    });
  };


  const handleEmail = () => {
    toast({
      title: "Email",
      description: "Функція надсилання буде доступна незабаром (демо)",
    });
  };

  const handleStatusChange = (newStatus: IncomeRecordStatus) => {
    if (isReadOnly) {
      toast({
        title: "Тільки перегляд",
        description: "Ви не маєте прав для зміни статусу",
        variant: "destructive",
      });
      return;
    }
    onStatusChange?.(localRecord.id, newStatus);
    toast({
      title: "Статус змінено",
      description: `Операцію позначено як "${getStatusLabel(newStatus)}"`,
    });
    onOpenChange(false);
  };

  const handleNavigateToLinked = (linkedId: string) => {
    onNavigateToRecord?.(linkedId);
    onOpenChange(false);
  };

  const handleViewDocument = () => {
    if (record.relatedDocument?.fileDataUrl) {
      setViewerOpen(true);
      return;
    }
    toast({
      title: "Документ",
      description: "Файл не прикріплений. Натисніть «Прикріпити документ», щоб додати скан або PDF.",
    });
  };

  const handleAttachSave = (doc: NonNullable<IncomeBookRecord["relatedDocument"]>) => {
    const updates: Partial<IncomeBookRecord> = {
      relatedDocument: doc,
      ...(record.issueType === "missing-document" ? { issueType: undefined } : {}),
    };
    setLocalRecord(prev => prev ? { ...prev, ...updates } : prev);
    onRecordUpdate?.(record.id, updates);
    setAttachOpen(false);
    toast({
      title: "Документ прикріплено",
      description: `${getDocumentTypeLabel(doc.type)} №${doc.number}`,
    });
  };

  const handleDismissPrivateNudge = () => {
    setPrivateNudgeDismissed(true);
    try {
      localStorage.setItem(`incomebook:private-nudge-dismissed:${record.id}`, "1");
    } catch { /* ignore */ }
  };

  const showPrivateNudge =
    !isReadOnly && !privateNudgeDismissed && looksLikePrivateInflow(record);

  // Build a draft rule pre-populated from current record
  const buildDraftRule = (): BankCategorizationRule => {
    const keywords = extractKeywordsFromDescription(record.description, record.contractor);
    return {
      id: "",
      name: `${keywords.join(" ")} → ?`,
      priority: 50,
      isActive: true,
      conditions: {
        descriptionContains: keywords,
        ...(record.status === "income" ? { transactionType: "income" as const } :
            record.status === "not-income" ? { transactionType: "expense" as const } : {}),
      },
      action: { categoryCode: record.categoryCode || "", autoConfirm: false },
      matchCount: 0,
    };
  };

  const handleSaveRule = (rule: BankCategorizationRule, _applyRetroactive?: boolean) => {
    toast({
      title: "Правило створено",
      description: `«${rule.name}» додано до правил категоризації`,
    });

    // Auto-apply rule to current record
    if (rule.action.categoryCode) {
      const updates: Partial<IncomeBookRecord> = {
        categoryCode: rule.action.categoryCode,
        categorySource: "rule" as const,
        matchedRuleId: rule.id,
        categoryConfirmed: rule.action.autoConfirm,
      };
      setLocalRecord(prev => prev ? { ...prev, ...updates } : prev);
      onRecordUpdate?.(record.id, updates);
    }
  };

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-3 pb-4">
          {hasQueue && (
            <div className="flex items-center justify-between -mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 h-7 px-2 text-xs"
                disabled={!canGoPrev}
                onClick={() => onNavigatePrev?.()}
                aria-label="Попередня операція (J / ←)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Попередня
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {queueIndex + 1} / {queueTotal}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 h-7 px-2 text-xs"
                disabled={!canGoNext}
                onClick={() => onNavigateNext?.()}
                aria-label="Наступна операція (K / →)"
              >
                Далі
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {formatDate(record.date)}
            </span>
            <Badge variant="status" className={cn("text-sm", getStatusColor(record.status))}>
              {getStatusLabel(record.status)}
            </Badge>
          </div>
          <SheetTitle className={cn(
            "text-2xl font-bold tabular-nums",
            isReturn
              ? "text-blue-600 dark:text-blue-400"
              : isIncome
              ? "text-emerald-600 dark:text-emerald-400"
              : ""
          )}>
            {isReturn ? "-" : "+"}{formatCurrency(record.amount)}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Блок «Операція» */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Операція
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Призначення</div>
                <div className="text-sm">{record.description}</div>
              </div>

              {/* Контрагент з реквізитами */}
              {record.contractor && (
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-muted-foreground">Контрагент</div>
                      <div className="text-sm font-medium">{record.contractor}</div>
                    </div>
                  </div>
                  
                  {record.contractorCode && (
                    <div className="flex items-center justify-between pl-6">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {record.contractorCode.length === 8 ? "ЄДРПОУ" : "ІПН"}:
                        </span>
                        <span className="text-sm font-mono ml-1.5">{record.contractorCode}</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyToClipboard(record.contractorCode!, "Код")}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Копіювати</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                  
                  {record.contractorIban && (
                    <div className="flex items-center justify-between pl-6">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-muted-foreground">IBAN:</span>
                        <span className="text-sm font-mono ml-1.5 truncate block">
                          {record.contractorIban.slice(0, 10)}...{record.contractorIban.slice(-4)}
                        </span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyToClipboard(record.contractorIban!, "IBAN")}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Копіювати IBAN</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              )}

              {/* Пов'язаний документ */}
              {record.relatedDocument ? (
                <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        {getDocumentTypeLabel(record.relatedDocument.type)}
                        {record.relatedDocument.fileName && (
                          <span className="ml-1 truncate">· {record.relatedDocument.fileName}</span>
                        )}
                      </div>
                      <div className="text-sm font-medium truncate">
                        №{record.relatedDocument.number} від {formatDate(record.relatedDocument.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={handleViewDocument}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Переглянути
                    </Button>
                    {!isReadOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Замінити документ"
                        onClick={() => setAttachOpen(true)}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                !isReadOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full gap-1.5 justify-start",
                      record.issueType === "missing-document" && "border-warning/40 text-warning hover:bg-warning/10",
                    )}
                    onClick={() => setAttachOpen(true)}
                  >
                    <UploadCloud className="w-4 h-4" />
                    {record.issueType === "missing-document"
                      ? "Прикріпити документ (потрібно)"
                      : "Прикріпити документ"}
                  </Button>
                )
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{getPaymentTypeLabel(record.paymentType)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {record.source === "monobank" || record.source === "privat24" ? "🏦" : 
                     record.source === "way4pay" || record.source === "liqpay" ? "💳" : 
                     record.source === "prro" ? "🧾" : "📥"}
                  </span>
                  <span className="text-sm">{getSourceLabel(record.source)}</span>
                </div>
              </div>

              {/* Банківські деталі */}
              {(record.valuationDate || record.commission) && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {record.valuationDate && record.valuationDate !== record.date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Валютування: {formatDate(record.valuationDate)}</span>
                    </div>
                  )}
                  {record.commission && (
                    <div className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5" />
                      <span>Комісія: {formatCurrency(record.commission)}</span>
                    </div>
                  )}
                </div>
              )}

              {record.txnId && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash className="w-3.5 h-3.5" />
                  <span className="font-mono">{record.txnId}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleCopyToClipboard(record.txnId!, "ID транзакції")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Копіювати ID</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Блок «Категоризація» */}
          {record.categoryCode && (() => {
            const incCat = getIncomeCategoryByCode(record.categoryCode);
            const expCat = getExpenseCategoryByCode(record.categoryCode);
            const cat = incCat || expCat;
            const matchedRule = record.matchedRuleId 
              ? DEMO_BANK_RULES.find(r => r.id === record.matchedRuleId)
              : null;
            
            return (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Tags className="w-4 h-4" />
                  Категоризація
                </h3>
                <div className="space-y-3">
                  {/* Category display */}
                  <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat?.icon || "📋"}</span>
                      <div>
                        <div className="text-sm font-medium">{cat?.name || record.categoryCode}</div>
                        <div className="text-xs text-muted-foreground">
                          Код: {record.categoryCode}
                        </div>
                      </div>
                    </div>
                    {record.categoryConfirmed ? (
                      <Badge variant="success" size="sm" className="gap-1">
                        <Check className="w-3 h-3" />
                        Підтверджено
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm" className="gap-1 border-dashed">
                        Не підтверджено
                      </Badge>
                    )}
                  </div>

                  {/* Source info */}
                  <div className="text-xs text-muted-foreground">
                    {record.categorySource === "rule" && matchedRule ? (
                      <span>Правило: «{matchedRule.name}»</span>
                    ) : record.categorySource === "manual" ? (
                      <span>Встановлено вручну</span>
                    ) : (
                      <span>Автоматично</span>
                    )}
                  </div>

                  {/* Confirm + Create rule buttons */}
                  {!isReadOnly && (
                    <div className="flex flex-wrap gap-2">
                      {!record.categoryConfirmed && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
                          onClick={() => {
                            const updates: Partial<IncomeBookRecord> = { categoryConfirmed: true };
                            setLocalRecord(prev => prev ? { ...prev, ...updates } : prev);
                            onRecordUpdate?.(record.id, updates);
                            toast({
                              title: "Підтверджено",
                              description: `Категорію «${cat?.name}» підтверджено`,
                            });
                          }}
                        >
                          <Check className="w-4 h-4" />
                          Підтвердити категорію
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setRuleSheetOpen(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Створити правило
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {!record.categoryCode && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Tags className="w-4 h-4" />
                Категоризація
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                  Категорію не визначено. Створіть правило для автоматичної категоризації подібних операцій.
                </div>
                {!isReadOnly && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setRuleSheetOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Створити правило
                  </Button>
                )}
              </div>
            </section>
          )}

          <Separator />

          {/* Блок «Податковий статус» */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Податковий статус
            </h3>
            <div className="space-y-3">
              {/* issueType visualization for needs-clarification */}
              {needsClarification && record.issueType && (
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-l-4",
                  getRowStyles("needs-clarification", record.issueType).border,
                  getRowStyles("needs-clarification", record.issueType).bg,
                  getRowStyles("needs-clarification", record.issueType).bgDark
                )}>
                  <div className={cn(
                    "p-2 rounded-full",
                    `bg-${issueTypeConfig[record.issueType].color}-100 dark:bg-${issueTypeConfig[record.issueType].color}-900/30`
                  )}>
                    <IssueIcon issueType={record.issueType} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {issueTypeConfig[record.issueType].label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Пріоритет: {issueTypeConfig[record.issueType].priority === 1 ? "Високий" : issueTypeConfig[record.issueType].priority === 2 ? "Середній" : "Низький"}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {isIncome ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium">Включено в дохід</span>
                  </>
                ) : isNotIncome ? (
                  <>
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Не включено в дохід</span>
                  </>
                ) : isReturn ? (
                  <>
                    <ArrowRight className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Повернення (коригування доходу)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium">Потребує уточнення</span>
                  </>
                )}
              </div>

              <div className="text-sm bg-muted/50 rounded-lg p-3">
                {isIncome && (
                  <span>
                    Стандартне надходження від контрагента включається до доходу ФОП на єдиному податку.
                  </span>
                )}
                {isNotIncome && (
                  <span>
                    Внутрішній переказ між власними рахунками ФОП — не є доходом згідно з ПКУ.
                  </span>
                )}
                {isReturn && (
                  <span>
                    Повернення коштів зменшує суму доходу за місяць, в якому здійснено повернення.
                  </span>
                )}
                {needsClarification && (
                  <span>
                    Для правильного обліку потрібно уточнити характер операції та контрагента.
                  </span>
                )}
              </div>

              {/* Clickable linked return */}
              {record.linkedReturnId && (
                <Button
                  variant="link"
                  className="gap-2 p-0 h-auto text-sm justify-start"
                  onClick={() => handleNavigateToLinked(record.linkedReturnId!)}
                >
                  <Link2 className="w-4 h-4" />
                  Пов'язана операція #{record.linkedReturnId}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              )}

              <div className="flex items-baseline justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">У дохід книги:</span>
                <span className={cn(
                  "text-lg font-bold tabular-nums",
                  record.inIncomeBook > 0 
                    ? "text-emerald-600 dark:text-emerald-400"
                    : record.inIncomeBook < 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground"
                )}>
                  {record.inIncomeBook === 0 
                    ? "Не враховується" 
                    : formatCurrency(record.inIncomeBook)}
                </span>
              </div>
            </div>
          </section>

          {/* Investment calculation for Interactive Brokers records */}
          {record.contractor && record.contractor.includes("Interactive Brokers") && (
            <>
              <Separator />
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Інвестиційний розрахунок
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 w-full justify-start"
                  onClick={() => setFifoSheetOpen(true)}
                >
                  <Calculator className="w-4 h-4" />
                  Відкрити FIFO-калькулятор
                </Button>
              </section>
            </>
          )}

          {/* Foreign income DTA calculator */}
          {record.contractor && (record.contractor.includes("IT Solutions") || record.contractor.includes("WISE")) && (
            <>
              <Separator />
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Іноземний дохід (КУПО)
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 w-full justify-start"
                  onClick={() => setDtaSheetOpen(true)}
                >
                  <Calculator className="w-4 h-4" />
                  Відкрити КУПО-калькулятор
                </Button>
              </section>
            </>
          )}

          <Separator />

          {/* Proactive nudge: J11 — high-value income from non-business counterparty */}
          {showPrivateNudge && (
            <>
              <section className="rounded-lg border border-amber-200/70 bg-amber-50/60 p-3 dark:border-amber-800/60 dark:bg-amber-950/30">
                <div className="flex items-start gap-2">
                  <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      Не схоже на оплату клієнта?
                    </p>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                      Контрагент без коду ЄДРПОУ та сума {formatCurrency(record.amount)} — можливо, це подарунок, позика або переказ між власними рахунками. Класифікуйте, щоб не потрапило до доходу ФОП.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
                        onClick={() => setClassifySheetOpen(true)}
                      >
                        <ListFilter className="w-3.5 h-3.5" />
                        Класифікувати як приватну
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={handleDismissPrivateNudge}
                      >
                        Це дохід
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={handleDismissPrivateNudge}
                    aria-label="Сховати підказку"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </section>
              <Separator />
            </>
          )}

          {/* Quick Actions for needs-clarification */}
          {needsClarification && !isReadOnly && (
            <>
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Швидкі дії
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  ⚠ Перевірте контрагента та призначення перед класифікацією.
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 justify-start border-primary/40 hover:bg-primary/5"
                    onClick={() => setClassifySheetOpen(true)}
                  >
                    <ListFilter className="w-4 h-4" />
                    Класифікувати переказ
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 justify-start text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950"
                    onClick={() => handleStatusChange("return")}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Позначити як повернення
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 justify-start text-emerald-600 border-emerald-200/70 hover:bg-emerald-50 dark:border-emerald-800/70 dark:hover:bg-emerald-950"
                      onClick={() => handleStatusChange("income")}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Включити в дохід
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 justify-start"
                      onClick={() => handleStatusChange("not-income")}
                    >
                      <XCircle className="w-4 h-4" />
                      Не включати
                    </Button>
                  </div>
                </div>
              </section>
              <Separator />
            </>
          )}

          {/* Блок «Пояснення ШІ» */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Пояснення ШІ
            </h3>
            <div className="space-y-3">
              <div className="text-sm bg-primary/5 border border-primary/20 rounded-lg p-3">
                {record.aiNote || (
                  isIncome 
                    ? "Ця операція включена до доходу як стандартне надходження від контрагента за надані послуги/товари."
                    : isNotIncome
                    ? "Ця операція не включена до доходу, оскільки це внутрішній переказ між вашими рахунками."
                    : isReturn
                    ? "Ця операція є поверненням коштів і зменшує загальний дохід за місяць."
                    : "Для цієї операції потрібно уточнити статус. Оберіть дію вище або скористайтесь AI-підказками."
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {aiChips.map((chip, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5"
                    onClick={() => handleAIChipClick(chip.prompt)}
                  >
                    {chip.label}
                  </Button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Contextual actions: duplicates resolution, create return */}
        {(record.issueType === "possible-duplicate" || (isIncome && onCreateReturn)) && (
          <div className="flex flex-wrap gap-2 pt-3 border-t mt-3">
            {record.issueType === "possible-duplicate" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800/70 dark:hover:bg-amber-950"
                  onClick={() => {
                    onRecordUpdate?.(record.id, { status: "not-income", issueType: undefined, inIncomeBook: 0 });
                    setLocalRecord(prev => prev ? { ...prev, status: "not-income", issueType: undefined, inIncomeBook: 0 } : prev);
                    toast({ title: "Позначено як дублікат", description: "Операція виключена з доходу" });
                    onOpenChange(false);
                  }}
                >
                  <CopyCheck className="w-4 h-4" />
                  Це дублікат
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    onRecordUpdate?.(record.id, { issueType: undefined });
                    setLocalRecord(prev => prev ? { ...prev, issueType: undefined } : prev);
                    toast({ title: "Не дублікат", description: "Позначку «Можливий дублікат» знято" });
                  }}
                >
                  <CopyX className="w-4 h-4" />
                  Не дублікат
                </Button>
              </>
            )}
            {isIncome && onCreateReturn && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 ml-auto"
                onClick={() => onCreateReturn(record)}
              >
                <Undo2 className="w-4 h-4" />
                Створити повернення
              </Button>
            )}
          </div>
        )}

        {/* Footer with utility actions */}
        <SheetFooter className="flex-row gap-2 pt-4 border-t mt-4">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleEmail}>
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Надіслати</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const sign = isReturn ? "−" : "+";
              const statusLabel = getStatusLabel(record.status);
              const txn = record.txnId ? ` | ${record.txnId}` : "";
              handleCopyToClipboard(
                `${formatDate(record.date)} | ${record.description} | ${sign}${formatCurrency(record.amount)} | ${statusLabel}${txn}`,
                "Дані операції"
              );
            }}
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Копіювати</span>
          </Button>
          {hasQueue && canGoNext && (
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 ml-auto"
              onClick={() => onNavigateNext?.()}
            >
              Далі
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>

      <BankRuleSheet
        open={ruleSheetOpen}
        onOpenChange={setRuleSheetOpen}
        rule={buildDraftRule()}
        onSave={handleSaveRule}
      />

      {localRecord && (
        <TransferClassificationSheet
          record={localRecord}
          open={classifySheetOpen}
          onOpenChange={setClassifySheetOpen}
          onClassify={(recordId, _category, newStatus) => {
            handleStatusChange(newStatus);
          }}
        />
      )}

      <FifoCalculator
        open={fifoSheetOpen}
        onOpenChange={setFifoSheetOpen}
      />

      <DtaCalculator
        open={dtaSheetOpen}
        onOpenChange={setDtaSheetOpen}
      />

      <AttachDocumentDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        defaultDate={record.date}
        existing={record.relatedDocument}
        onSave={handleAttachSave}
      />

      <DocumentViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        doc={record.relatedDocument}
      />
    </>
  );
};

// ============================================================
// Inline AttachDocumentDialog — keeps file in memory only (data URL).
// For demo/dev; production should upload to storage and store URL.
// ============================================================
interface AttachDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
  existing?: IncomeBookRecord["relatedDocument"];
  onSave: (doc: NonNullable<IncomeBookRecord["relatedDocument"]>) => void;
}

const AttachDocumentDialog = ({ open, onOpenChange, defaultDate, existing, onSave }: AttachDocumentDialogProps) => {
  const [type, setType] = useState<NonNullable<IncomeBookRecord["relatedDocument"]>["type"]>(existing?.type ?? "act");
  const [number, setNumber] = useState(existing?.number ?? "");
  const [date, setDate] = useState(existing?.date ?? defaultDate);
  const [fileName, setFileName] = useState(existing?.fileName);
  const [fileMime, setFileMime] = useState(existing?.fileMime);
  const [fileDataUrl, setFileDataUrl] = useState(existing?.fileDataUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setType(existing?.type ?? "act");
      setNumber(existing?.number ?? "");
      setDate(existing?.date ?? defaultDate);
      setFileName(existing?.fileName);
      setFileMime(existing?.fileMime);
      setFileDataUrl(existing?.fileDataUrl);
    }
  }, [open, existing, defaultDate]);

  const handleFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Файл завеликий", description: "Максимум 8 МБ для прев'ю в браузері", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(String(reader.result));
      setFileName(file.name);
      setFileMime(file.type || "application/octet-stream");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!number.trim()) {
      toast({ title: "Вкажіть номер документа", variant: "destructive" });
      return;
    }
    onSave({ type, number: number.trim(), date, fileName, fileMime, fileDataUrl });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Прикріпити документ</DialogTitle>
          <DialogDescription>Вкажіть реквізити та (за бажанням) прикріпіть скан/PDF.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Тип</Label>
              <USelect value={type} onValueChange={(v) => setType(v as typeof type)}>
                <USelectTrigger className="h-9"><USelectValue /></USelectTrigger>
                <USelectContent>
                  <USelectItem value="act">Акт</USelectItem>
                  <USelectItem value="invoice">Рахунок</USelectItem>
                  <USelectItem value="contract">Договір</USelectItem>
                  <USelectItem value="check">Чек</USelectItem>
                  <USelectItem value="receipt">Квитанція</USelectItem>
                  <USelectItem value="other">Інше</USelectItem>
                </USelectContent>
              </USelect>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Дата</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Номер</Label>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Напр. 042/2025" className="h-9" />
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full border border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/40 transition-colors"
          >
            <UploadCloud className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
            {fileName ? (
              <div className="text-xs">
                <div className="font-medium truncate">{fileName}</div>
                <div className="text-muted-foreground">Натисніть, щоб замінити</div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Натисніть, щоб обрати файл (PDF, JPG, PNG · до 8 МБ)
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
          </button>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Скасувати</Button>
          <Button onClick={handleSave}>Зберегти</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DocumentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doc?: IncomeBookRecord["relatedDocument"];
}

const DocumentViewerDialog = ({ open, onOpenChange, doc }: DocumentViewerDialogProps) => {
  if (!doc?.fileDataUrl) return null;
  const isImage = (doc.fileMime || "").startsWith("image/");
  const isPdf = doc.fileMime === "application/pdf";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="truncate">{doc.fileName || `№${doc.number}`}</DialogTitle>
          <DialogDescription>
            {getDocumentTypeLabel(doc.type)} · №{doc.number}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto rounded-md bg-muted/40 flex items-center justify-center">
          {isImage ? (
            <img src={doc.fileDataUrl} alt={doc.fileName || doc.number} className="max-w-full h-auto" />
          ) : isPdf ? (
            <embed src={doc.fileDataUrl} type="application/pdf" className="w-full h-[70vh]" />
          ) : (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm">{doc.fileName}</p>
              <a
                href={doc.fileDataUrl}
                download={doc.fileName || `document-${doc.number}`}
                className="text-xs text-primary underline mt-2 inline-block"
              >
                Завантажити
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};