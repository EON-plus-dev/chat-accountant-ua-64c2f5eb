import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  Send, 
  Clock, 
  AlertTriangle,
  FileText,
  Paperclip,
  X,
  CheckCircle2,
  Sparkles,
  Loader2,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditRequest } from "@/config/taxAuditsConfig";
import { 
  AuditDocumentSelector, 
  AiDocumentSuggestion,
  demoDocumentsForSelection 
} from "./AuditDocumentSelector";
import { mockAiSuggestDocuments } from "@/lib/mockAiDocumentMatcher";
import { format, parseISO, differenceInDays, isPast } from "date-fns";
import { uk } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { analyzeAuditRequest } from "@/lib/mockAuditRequestAnalysis";

interface AuditResponseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: AuditRequest | null;
  initialResponseText?: string;
  /** Якщо true — при відкритті автоматично згенерувати чернетку та підібрати документи. */
  autoGenerate?: boolean;
  onSubmit?: (requestId: string, response: { text: string; documentIds: string[] }) => void;
}

export const AuditResponseForm = ({ 
  open, 
  onOpenChange, 
  request,
  initialResponseText,
  autoGenerate = false,
  onSubmit 
}: AuditResponseFormProps) => {
  const { toast } = useToast();
  const [responseText, setResponseText] = useState(initialResponseText ?? "");
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI suggestion state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiDocumentSuggestion[] | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiDraftActive, setAiDraftActive] = useState(false);
  const [userEdited, setUserEdited] = useState(false);

  useEffect(() => {
    if (open && initialResponseText) {
      setResponseText(initialResponseText);
      setAiDraftActive(false);
      setUserEdited(false);
    }
  }, [open, initialResponseText]);

  // Auto-generate AI draft + auto-select documents on open
  useEffect(() => {
    if (!open || !request || !autoGenerate) return;
    // Не перезаписуємо, якщо вже є текст від користувача / попередньої сесії
    if (responseText && responseText.trim().length > 0) return;

    let cancelled = false;
    (async () => {
      // 1. Текст
      try {
        const draft = analyzeAuditRequest(request).draftResponse;
        if (cancelled) return;
        setResponseText(draft);
        setAiDraftActive(true);
        setUserEdited(false);
      } catch {
        /* noop */
      }
      // 2. Документи
      setIsAiLoading(true);
      try {
        const result = await mockAiSuggestDocuments(
          request.subject,
          request.description,
          request.documentsRequested || [],
          demoDocumentsForSelection,
        );
        if (cancelled) return;
        setAiSuggestions(result.suggestions);
        setAiExplanation(result.explanation);
        const autoSelectIds = result.suggestions
          .filter((s) => s.relevance === "high" || s.relevance === "medium")
          .map((s) => s.documentId);
        if (autoSelectIds.length > 0) {
          setSelectedDocumentIds((prev) => [...new Set([...prev, ...autoSelectIds])]);
        }
      } catch {
        /* noop */
      } finally {
        if (!cancelled) setIsAiLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoGenerate, request?.id]);

  if (!request) return null;

  const deadline = parseISO(request.deadline);
  const isOverdue = isPast(deadline);
  const daysUntil = differenceInDays(deadline, new Date());

  // Extract suggested document types from request
  const suggestedDocTypes = request.documentsRequested?.map(doc => {
    // Map requested doc names to types
    if (doc.toLowerCase().includes("договір")) return "Договір";
    if (doc.toLowerCase().includes("акт")) return "Акт";
    if (doc.toLowerCase().includes("рахун")) return "Рахунок";
    if (doc.toLowerCase().includes("виписк")) return "Виписка";
    if (doc.toLowerCase().includes("книг")) return "Книга доходів";
    if (doc.toLowerCase().includes("чек")) return "Чек ПРРО";
    return doc;
  }) || [];

  // AI document suggestion handler
  const handleAiSuggest = async () => {
    setIsAiLoading(true);
    setAiExplanation(null);
    
    try {
      const result = await mockAiSuggestDocuments(
        request.subject,
        request.description,
        request.documentsRequested || [],
        demoDocumentsForSelection
      );
      
      setAiSuggestions(result.suggestions);
      setAiExplanation(result.explanation);
      
      // Auto-select documents with high or medium relevance
      const autoSelectIds = result.suggestions
        .filter(s => s.relevance === "high" || s.relevance === "medium")
        .map(s => s.documentId);
      
      if (autoSelectIds.length > 0) {
        setSelectedDocumentIds(prev => [...new Set([...prev, ...autoSelectIds])]);
      }
      
      toast({
        title: `🤖 Знайдено ${result.suggestions.length} документів`,
        description: result.explanation,
      });
    } catch (error) {
      toast({
        title: "Помилка AI",
        description: "Не вдалося підібрати документи. Спробуйте ще раз.",
        variant: "destructive"
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!responseText.trim()) {
      toast({
        title: "Помилка",
        description: "Введіть текст відповіді",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Демо-режим",
      description: `Відповідь на запит ${request.number} буде відправлена після запуску системи`,
    });
    
    onSubmit?.(request.id, {
      text: responseText,
      documentIds: selectedDocumentIds,
    });
    
    setIsSubmitting(false);
    setResponseText("");
    setSelectedDocumentIds([]);
    setAiSuggestions(null);
    setAiExplanation(null);
    setAiDraftActive(false);
    setUserEdited(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setResponseText("");
    setSelectedDocumentIds([]);
    setAiSuggestions(null);
    setAiExplanation(null);
    setAiDraftActive(false);
    setUserEdited(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Відповідь на запит
          </SheetTitle>
          <SheetDescription>
            Запит {request.number} від ДПС
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Request summary */}
          <div className={cn(
            "p-4 rounded-lg border",
            isOverdue 
              ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800" 
              : "bg-muted/50"
          )}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-sm">{request.subject}</h4>
              {isOverdue ? (
                <Badge variant="destructive" className="gap-1 shrink-0">
                  <AlertTriangle className="w-3 h-3" />
                  Прострочено
                </Badge>
              ) : daysUntil <= 7 ? (
                <Badge variant="outline" className="gap-1 shrink-0 text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/50">
                  <Clock className="w-3 h-3" />
                  {daysUntil} {daysUntil === 1 ? "день" : daysUntil < 5 ? "дні" : "днів"}
                </Badge>
              ) : null}
            </div>
            
            <p className="text-xs text-muted-foreground">{request.description}</p>
            
            <div className="flex items-center gap-2 mt-3 text-xs">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Дедлайн:</span>
              <span className={cn(
                "font-medium",
                isOverdue && "text-red-600 dark:text-red-400"
              )}>
                {format(deadline, "dd MMMM yyyy", { locale: uk })}
              </span>
            </div>
          </div>

          {/* Requested documents hint */}
          {request.documentsRequested && request.documentsRequested.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Запитувані документи:
              </Label>
              <div className="flex flex-wrap gap-1">
                {request.documentsRequested.map((doc, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs font-normal">
                    {doc}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Response text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="response-text">Текст відповіді *</Label>
              {aiDraftActive && (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                    <Bot className="w-3 h-3" />
                    {userEdited ? "Відредаговано вами" : "Чернетку згенеровано AI"}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] gap-1"
                    onClick={() => {
                      if (!request) return;
                      const draft = analyzeAuditRequest(request).draftResponse;
                      setResponseText(draft);
                      setAiDraftActive(true);
                      setUserEdited(false);
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    Перегенерувати
                  </Button>
                </div>
              )}
            </div>
            <Textarea
              id="response-text"
              placeholder="Введіть пояснення або відповідь на запит інспектора..."
              value={responseText}
              onChange={(e) => {
                setResponseText(e.target.value);
                if (aiDraftActive) setUserEdited(true);
              }}
              rows={7}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {aiDraftActive
                ? "Чернетку підготовлено автоматично. Перевірте та, за потреби, відредагуйте перед відправкою."
                : "Опишіть суть відповіді на запит. Документи можна прикріпити нижче."}
            </p>
          </div>

          {/* Document selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-1.5">
                <Paperclip className="w-4 h-4" />
                Прикріпити документи
              </Label>
              <div className="flex items-center gap-2">
                {selectedDocumentIds.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedDocumentIds.length} обрано
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAiSuggest}
                  disabled={isAiLoading}
                  className="gap-1.5 h-7 text-xs"
                >
                  {isAiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  )}
                  AI: Підібрати
                </Button>
              </div>
            </div>
            
            {/* AI explanation */}
            {aiExplanation && (
              <div className="flex items-start gap-2 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-100 dark:border-purple-900">
                <Bot className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  {aiExplanation}
                </p>
              </div>
            )}
            
            <AuditDocumentSelector
              selectedIds={selectedDocumentIds}
              onSelectionChange={setSelectedDocumentIds}
              suggestedDocTypes={suggestedDocTypes}
              aiSuggestions={aiSuggestions || undefined}
              maxHeight="250px"
            />
          </div>

          {/* Selected documents preview */}
          {selectedDocumentIds.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Обрані документи:</Label>
              <div className="flex flex-wrap gap-1.5">
                {selectedDocumentIds.slice(0, 5).map((id) => (
                  <Badge 
                    key={id} 
                    variant="outline" 
                    className="gap-1 pr-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="text-xs">{id.replace("doc-", "DOC-")}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDocumentIds(ids => ids.filter(i => i !== id))}
                      className="ml-0.5 p-0.5 rounded hover:bg-muted"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {selectedDocumentIds.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedDocumentIds.length - 5} ще
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Скасувати
            </Button>
            <Button
              className={cn(
                "flex-1 gap-1.5",
                isOverdue && "bg-red-600 hover:bg-red-700"
              )}
              onClick={handleSubmit}
              disabled={isSubmitting || !responseText.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Відправка...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Відправити відповідь
                </>
              )}
            </Button>
          </div>

          {/* Warning for overdue */}
          {isOverdue && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-xs text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Термін відповіді на цей запит минув. Рекомендуємо відправити відповідь якнайшвидше.
              </span>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
