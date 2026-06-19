import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Paperclip, 
  Sparkles,
  FileText,
  AlertCircle,
  Plus,
  Link2,
  Info,
  FileDown,
  CheckCircle2,
  Loader2,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import type { EdoIncomingDocument } from "@/config/edoIntegrationConfig";
import { 
  edoDocumentTypeConfig, 
  formatFileSize,
} from "@/config/edoIntegrationConfig";
import type { TaxAudit } from "@/config/taxAuditsConfig";
import { getAuditTypeLabel } from "@/config/taxAuditsConfig";

interface ProcessEdoDocumentSheetProps {
  document: EdoIncomingDocument | null;
  existingAudits: TaxAudit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProcessed: (documentId: string, action: string, auditId?: string) => void;
}

type ProcessAction = "create-audit" | "add-request" | "info-only";

export const ProcessEdoDocumentSheet = ({
  document,
  existingAudits,
  open,
  onOpenChange,
  onProcessed,
}: ProcessEdoDocumentSheetProps) => {
  const [action, setAction] = useState<ProcessAction>("create-audit");
  const [selectedAuditId, setSelectedAuditId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiParsedData, setAiParsedData] = useState<any>(null);

  if (!document) return null;

  const typeConfig = edoDocumentTypeConfig[document.documentType];
  const TypeIcon = typeConfig.icon;

  // Визначаємо рекомендовану дію на основі типу документа
  const getRecommendedAction = (): ProcessAction => {
    if (["audit-order", "audit-notification"].includes(document.documentType)) {
      return "create-audit";
    }
    if (["audit-request", "audit-act"].includes(document.documentType)) {
      return document.relatedAuditId ? "add-request" : "create-audit";
    }
    return "info-only";
  };

  const handleAiParse = async () => {
    setIsAiParsing(true);
    
    // Імітація AI парсингу
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAiParsedData({
      auditType: "documentary-scheduled",
      period: "2024",
      orderNumber: "ДП-2024-0200",
      orderDate: "2024-12-15",
      inspectorName: "Петренко Олена Василівна",
      inspectorPhone: "+380 44 123 45 67",
      taxOffice: document.senderName,
      suggestedDeadline: document.deadlineDate,
    });
    
    setIsAiParsing(false);
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    
    // Імітація обробки
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onProcessed(
      document.id, 
      action === "create-audit" ? "created-audit" : action === "add-request" ? "added-request" : "info-only",
      action === "add-request" ? selectedAuditId : undefined
    );
    
    // Reset state
    setAction("create-audit");
    setSelectedAuditId("");
    setNotes("");
    setAiParsedData(null);
    setIsProcessing(false);
  };

  const activeAudits = existingAudits.filter(a => 
    !["completed", "appealed"].includes(a.status)
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="responsive-right"
        className="w-full sm:max-w-2xl flex flex-col h-[90dvh] sm:h-full !overflow-hidden min-w-0"
      >
        <SheetHeader className="shrink-0 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("p-2 rounded-lg shrink-0", typeConfig.color)}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-left text-base">
                Обробка вхідного документа
              </SheetTitle>
              <SheetDescription className="text-left break-words">
                {typeConfig.label}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full -mx-6 px-6">
          <div className="space-y-6 pb-6 min-w-0 w-full [overflow-wrap:anywhere]">
            {/* Document info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 min-w-0">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm break-words">{document.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1 break-words">
                    № {document.registrationNumber}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] shrink-0 gap-1 bg-primary/10 text-primary border-primary/20"
                  title="Документ надійшов напряму від ДПС"
                >
                  <Landmark className="w-3 h-3" />
                  ДПС
                </Badge>
              </div>

              <p className="text-[11px] text-muted-foreground italic">
                Надійшло з Електронного кабінету ДПС
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground leading-relaxed">
                <div className="min-w-0 break-words">
                  <span className="text-muted-foreground/70">Від:</span> {document.senderName}
                </div>
                <div className="min-w-0 break-words">
                  <span className="text-muted-foreground/70">Отримано:</span>{" "}
                  {format(parseISO(document.receivedAt), "dd.MM.yyyy HH:mm", { locale: uk })}
                </div>
              </div>

              {document.deadlineDate && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Дедлайн: {format(parseISO(document.deadlineDate), "dd.MM.yyyy", { locale: uk })}
                </div>
              )}
            </div>

            {/* Document content */}
            {document.content && (
              <div>
                <Label className="text-xs text-muted-foreground">Текст документа</Label>
                <div className="mt-2 p-4 bg-muted/30 rounded-lg text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {document.content}
                </div>
              </div>
            )}

            {/* Attachments */}
            {document.attachments.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Вкладення</Label>
                <div className="mt-2 space-y-2">
                  {document.attachments.map((attachment) => (
                    <div 
                      key={attachment.id}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-xs"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{attachment.fileName}</p>
                        {attachment.signedBy && (
                          <p className="text-muted-foreground truncate">
                            Підписано: {attachment.signedBy}
                          </p>
                        )}
                      </div>
                      <span className="text-muted-foreground shrink-0">
                        {formatFileSize(attachment.fileSize)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        <FileDown className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* AI Parse button */}
            <Button
              variant="outline"
              className="w-full gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800 hover:from-violet-500/20 hover:to-purple-500/20"
              onClick={handleAiParse}
              disabled={isAiParsing}
            >
              {isAiParsing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-violet-600" />
              )}
              {isAiParsing ? "AI аналізує документ..." : "AI: Розпізнати дані"}
            </Button>

            {/* AI Parsed data */}
            {aiParsedData && (
              <div className="p-3 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                <div className="flex items-center gap-2 text-xs font-medium text-violet-700 dark:text-violet-300 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  AI розпізнав дані
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Тип:</span>
                    <span className="ml-1">Документальна планова</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Період:</span>
                    <span className="ml-1">{aiParsedData.period}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">№ наказу:</span>
                    <span className="ml-1">{aiParsedData.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Інспектор:</span>
                    <span className="ml-1">{aiParsedData.inspectorName}</span>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Action selection */}
            <div>
              <Label className="text-sm font-medium">Оберіть дію</Label>
              <RadioGroup 
                value={action} 
                onValueChange={(v) => setAction(v as ProcessAction)}
                className="mt-3 space-y-3"
              >
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors min-w-0">
                  <RadioGroupItem value="create-audit" id="create-audit" className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="create-audit" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" />
                      Створити нову перевірку
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Буде створено новий запис перевірки з даними документа
                    </p>
                  </div>
                  {getRecommendedAction() === "create-audit" && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      Рекомендовано
                    </Badge>
                  )}
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors min-w-0">
                  <RadioGroupItem value="add-request" id="add-request" className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="add-request" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-primary" />
                      Додати до існуючої перевірки
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Прив'язати як запит або подію до активної перевірки
                    </p>
                    
                    {action === "add-request" && (
                      <div className="mt-3">
                        <Select value={selectedAuditId} onValueChange={setSelectedAuditId}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Оберіть перевірку" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeAudits.length === 0 ? (
                              <div className="p-2 text-xs text-muted-foreground text-center">
                                Немає активних перевірок
                              </div>
                            ) : (
                              activeAudits.map(audit => (
                                <SelectItem key={audit.id} value={audit.id}>
                                  {getAuditTypeLabel(audit.type)} • {audit.period}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  {getRecommendedAction() === "add-request" && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      Рекомендовано
                    </Badge>
                  )}
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors min-w-0">
                  <RadioGroupItem value="info-only" id="info-only" className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="info-only" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      <Info className="w-4 h-4 text-muted-foreground" />
                      Інформаційний
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Позначити як прочитаний без створення перевірки
                    </p>
                  </div>
                  {getRecommendedAction() === "info-only" && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      Рекомендовано
                    </Badge>
                  )}
                </div>
              </RadioGroup>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-xs text-muted-foreground">
                Примітки (опційно)
              </Label>
              <Textarea
                id="notes"
                placeholder="Додаткові коментарі..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 min-h-[60px] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Скасувати
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleProcess}
            disabled={isProcessing || (action === "add-request" && !selectedAuditId)}
          >
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            {action === "create-audit" && "Створити перевірку"}
            {action === "add-request" && "Додати до перевірки"}
            {action === "info-only" && "Позначити як прочитаний"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
