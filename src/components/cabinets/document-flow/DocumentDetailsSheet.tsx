import { useState, useEffect, useMemo } from "react";
import { 
  Building2, Calendar, Hash, Copy, Mail, 
  FileText, ExternalLink, Download, Clock, User,
  CheckCircle, XCircle, Send, Archive, FileSignature,
  AlertCircle, Link2, Bot, CircleDashed, CreditCard,
  ShieldAlert, FileWarning, CalendarClock, Receipt, KeyRound,
  Pencil, Save, X, Lock, Search, ChevronsUpDown, Check,
  BookOpen, Banknote, ArrowRight, Sparkles, ChevronDown, ChevronUp
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  type Document,
  type DocumentFlowStatus,
  type DocumentIssueType,
  documentTypeConfigs,
  documentStatusConfigs,
  documentIssueTypeConfig,
  detectDocumentIssues,
  getDocumentIssueStyles,
  formatDocumentAmount,
  tovDemoDocuments,
  fopDemoDocuments,
  individualDemoDocuments,
} from "@/config/documentFlowConfig";
import { Cabinet } from "@/types/cabinet";
import SignDocumentDialog from "./SignDocumentDialog";
import SendDocumentDialog from "./SendDocumentDialog";
import { KepCertificate, getContractorsForCabinet, Contractor } from "@/config/settingsConfig";
import { DocumentVersionsSection } from "./DocumentVersionsSection";
import { DocumentAuditSection } from "./DocumentAuditSection";
import { VersionChangeDialog } from "./VersionChangeDialog";
import { addVersionToDocument, addAuditEntry, fieldLabels, type ChangedFieldInfo } from "@/config/documentVersioningConfig";
import { DocumentSummaryCard } from "./DocumentSummaryCard";
import { DocumentChecklistCard } from "./DocumentChecklistCard";
import { InviteContractorSheet, type ContractorPrefillData } from "./InviteContractorSheet";
import { type DocumentSummary, type DocumentChecklist, type ChecklistItem } from "@/types/documentSummary";
import { DocumentRelatedSection } from "./cards/intelligence/DocumentRelatedSection";

interface DocumentDetailsSheetProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cabinet?: Cabinet;
  onChatPromptInsert?: (prompt: string) => void;
  onStatusChange?: (docId: string, newStatus: DocumentFlowStatus) => void;
  onDocumentUpdate?: (docId: string, updates: Partial<Document>) => void;
  onNavigateToDocument?: (docId: string) => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToPayments?: () => void;
  isReadOnly?: boolean;
}

// Editable form state interface
interface EditFormState {
  title: string;
  amount: string;
  dueDate: string;
  issueNote: string;
  contractorId: string | null;
}

// Format date helper
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Get contextual AI chips based on document type and status
const getContextualAIChips = (doc: Document) => {
  const typeConfig = documentTypeConfigs[doc.type];
  const chips = [];

  if (doc.status === "draft") {
    chips.push(
      { label: "Перевірити реквізити", prompt: `Перевір правильність реквізитів документа ${doc.number}` },
      { label: "Підготувати до підпису", prompt: `Допоможи підготувати документ ${doc.number} до підписання` }
    );
  } else if (doc.status === "pending-sign") {
    chips.push(
      { label: "Нагадати про підпис", prompt: `Створи нагадування про підпис документа ${doc.number}` },
      { label: "Хто має підписати?", prompt: `Хто наступний у маршруті погодження для ${doc.number}?` }
    );
  } else if (doc.status === "sent") {
    chips.push(
      { label: "Перевірити отримання", prompt: `Чи отримав контрагент документ ${doc.number}?` },
      { label: "Нагадати контрагенту", prompt: `Створи нагадування для контрагента про документ ${doc.number}` }
    );
  } else if (doc.status === "partially-paid" && doc.amount && doc.paidAmount) {
    const remaining = doc.amount - doc.paidAmount;
    chips.push(
      { label: `Залишок ${formatDocumentAmount(remaining)}`, prompt: `Коли очікувати решту оплати за ${doc.number}?` },
      { label: "Надіслати нагадування", prompt: `Створи нагадування про оплату залишку за ${doc.number}` }
    );
  }

  // Default chips
  if (chips.length === 0) {
    chips.push(
      { label: "Схожі документи", prompt: `Покажи схожі документи до ${doc.number}` },
      { label: "Історія контрагента", prompt: `Покажи історію документів з ${doc.contractor?.name || "цим контрагентом"}` }
    );
  }

  return chips;
};

export const DocumentDetailsSheet = ({
  document: doc,
  open,
  onOpenChange,
  cabinet,
  onChatPromptInsert,
  onStatusChange,
  onDocumentUpdate,
  onNavigateToDocument,
  onNavigateToIncomeBook,
  onNavigateToPayments,
  isReadOnly = false,
}: DocumentDetailsSheetProps) => {
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<Document> | null>(null);
  const [changedFields, setChangedFields] = useState<ChangedFieldInfo[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    amount: "",
    dueDate: "",
    issueNote: "",
    contractorId: null,
  });
  const [contractorOpen, setContractorOpen] = useState(false);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [invitePrefillData, setInvitePrefillData] = useState<ContractorPrefillData | null>(null);
  const [isLinkedDocsOpen, setIsLinkedDocsOpen] = useState(false);
  const [isReferencedDocsOpen, setIsReferencedDocsOpen] = useState(false);
  
  // Get contractors for cabinet
  const contractors = useMemo(() => {
    if (!cabinet) return [];
    return getContractorsForCabinet(cabinet);
  }, [cabinet]);
  
  // Reset edit mode when sheet closes or document changes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  // Initialize edit form when entering edit mode
  useEffect(() => {
    if (doc && isEditing) {
      // Find contractor id from contractors list
      const currentContractor = doc.contractor 
        ? contractors.find(c => c.code === doc.contractor?.code)
        : null;
      setEditForm({
        title: doc.title || "",
        amount: doc.amount?.toString() || "",
        dueDate: doc.dueDate || "",
        issueNote: doc.issueNote || "",
        contractorId: currentContractor?.id || null,
      });
    }
  }, [doc, isEditing, contractors]);
  
  if (!doc) return null;

  const typeConfig = documentTypeConfigs[doc.type];
  const statusConfig = documentStatusConfigs[doc.status];
  const aiChips = getContextualAIChips(doc);
  
  // Check if document can be edited (not signed, archived, cancelled, etc.)
  const lockedStatuses: DocumentFlowStatus[] = ["signed", "sent", "confirmed", "paid", "partially-paid", "registered", "archived", "cancelled"];
  const isLocked = lockedStatuses.includes(doc.status) || (doc.signatures && doc.signatures.length > 0);
  const canEdit = !isReadOnly && !isLocked;
  
  // Detect document issues
  const detectedIssues = detectDocumentIssues(doc);
  const hasIssues = detectedIssues.length > 0;
  const primaryIssue = hasIssues ? detectedIssues[0] : null;
  const primaryIssueConfig = primaryIssue ? documentIssueTypeConfig[primaryIssue] : null;
  const primaryIssueStyles = primaryIssue ? getDocumentIssueStyles(primaryIssue) : null;

  // Get issue icon component based on string icon name
  const getIssueIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      FileSignature,
      UserX: User,
      Clock,
      CreditCard,
      CalendarClock,
      Building2,
      ShieldAlert,
      Copy,
      FileWarning,
      Receipt,
      AlertCircle,
    };
    return iconMap[iconName] || AlertCircle;
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопійовано",
      description: `${label} скопійовано в буфер обміну`,
    });
  };

  const handleAIChipClick = (prompt: string) => {
    onChatPromptInsert?.(prompt);
    onOpenChange(false);
  };

  const handleStatusChange = (newStatus: DocumentFlowStatus) => {
    if (isReadOnly) {
      toast({
        title: "Тільки перегляд",
        description: "Ви не маєте прав для зміни статусу",
        variant: "destructive",
      });
      return;
    }
    onStatusChange?.(doc.id, newStatus);
    toast({
      title: "Статус змінено",
      description: `Документ позначено як "${documentStatusConfigs[newStatus].label}"`,
    });
    onOpenChange(false);
  };

  const handleOpenSignDialog = () => {
    if (!cabinet) {
      toast({
        title: "Помилка",
        description: "Не вдалося визначити кабінет для підписання",
        variant: "destructive",
      });
      return;
    }
    setSignDialogOpen(true);
  };

  const handleDocumentSigned = (signedDoc: Document, certificate: KepCertificate) => {
    onStatusChange?.(doc.id, "signed");
    toast({
      title: "Документ підписано",
      description: `Підпис: ${certificate.owner}`,
    });
    setSignDialogOpen(false);
  };


  const handleOpenSendDialog = () => {
    if (!cabinet) {
      toast({
        title: "Помилка",
        description: "Не вдалося визначити кабінет для відправлення",
        variant: "destructive",
      });
      return;
    }
    setSendDialogOpen(true);
  };

  const handleDocumentSent = (sentDoc: Document, channel: string, recipient?: string) => {
    onStatusChange?.(doc.id, "sent");
    toast({
      title: "Документ відправлено",
      description: `Канал: ${channel === "email" ? "Email" : channel === "edi" ? "EDI" : "Посилання"}${recipient ? ` (${recipient})` : ""}`,
    });
    setSendDialogOpen(false);
  };

  const handleDownload = () => {
    toast({
      title: "Завантаження",
      description: "Документ буде завантажено (демо)",
    });
  };

  const handleNavigateToLinked = (linkedId: string) => {
    onNavigateToDocument?.(linkedId);
    onOpenChange(false);
  };

  // Edit mode handlers
  const handleStartEdit = () => {
    if (!canEdit) {
      toast({
        title: "Редагування заблоковано",
        description: isLocked 
          ? "Документ підписано або в обробці. Редагування неможливе." 
          : "Ви не маєте прав для редагування",
        variant: "destructive",
      });
      return;
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    const currentContractor = doc.contractor 
      ? contractors.find(c => c.code === doc.contractor?.code)
      : null;
    setEditForm({
      title: doc.title || "",
      amount: doc.amount?.toString() || "",
      dueDate: doc.dueDate || "",
      issueNote: doc.issueNote || "",
      contractorId: currentContractor?.id || null,
    });
    setContractorOpen(false);
  };

  const handleSaveEdit = () => {
    const updates: Partial<Document> = {};
    const changes: ChangedFieldInfo[] = [];
    
    if (editForm.title !== (doc.title || "")) {
      updates.title = editForm.title;
      changes.push({
        fieldName: "title",
        fieldLabel: fieldLabels.title || "Назва",
        previousValue: doc.title || "",
        newValue: editForm.title,
      });
    }
    if (editForm.amount !== (doc.amount?.toString() || "")) {
      const parsedAmount = parseFloat(editForm.amount);
      if (!isNaN(parsedAmount) && parsedAmount >= 0) {
        updates.amount = parsedAmount;
        changes.push({
          fieldName: "amount",
          fieldLabel: fieldLabels.amount || "Сума",
          previousValue: doc.amount ? `${doc.amount.toLocaleString("uk-UA")} ₴` : "",
          newValue: `${parsedAmount.toLocaleString("uk-UA")} ₴`,
        });
      }
    }
    if (editForm.dueDate !== (doc.dueDate || "")) {
      updates.dueDate = editForm.dueDate || undefined;
      changes.push({
        fieldName: "dueDate",
        fieldLabel: fieldLabels.dueDate || "Термін оплати",
        previousValue: doc.dueDate || "",
        newValue: editForm.dueDate || "",
      });
    }
    if (editForm.issueNote !== (doc.issueNote || "")) {
      updates.issueNote = editForm.issueNote || undefined;
      changes.push({
        fieldName: "issueNote",
        fieldLabel: "Примітка",
        previousValue: doc.issueNote || "",
        newValue: editForm.issueNote || "",
      });
    }
    
    // Handle contractor update
    const selectedContractor = contractors.find(c => c.id === editForm.contractorId);
    const currentContractorCode = doc.contractor?.code;
    if (editForm.contractorId && selectedContractor?.code !== currentContractorCode) {
      updates.contractor = {
        id: selectedContractor!.id,
        name: selectedContractor!.name,
        code: selectedContractor!.code,
        iban: selectedContractor!.iban,
      };
      changes.push({
        fieldName: "contractor",
        fieldLabel: fieldLabels.contractor || "Контрагент",
        previousValue: doc.contractor?.name || "",
        newValue: selectedContractor!.name,
      });
    } else if (!editForm.contractorId && doc.contractor) {
      // Contractor removed
      updates.contractor = undefined;
      changes.push({
        fieldName: "contractor",
        fieldLabel: fieldLabels.contractor || "Контрагент",
        previousValue: doc.contractor.name,
        newValue: "",
      });
    }

    if (Object.keys(updates).length > 0) {
      // Store pending updates and show version dialog
      setPendingUpdates(updates);
      setChangedFields(changes);
      setVersionDialogOpen(true);
    } else {
      setIsEditing(false);
      setContractorOpen(false);
    }
  };

  const handleVersionConfirm = (description: string, createVersion: boolean) => {
    if (pendingUpdates) {
      // Apply updates
      onDocumentUpdate?.(doc.id, pendingUpdates);
      
      // Create version if requested (demo)
      if (createVersion) {
        addVersionToDocument(doc.id, description, changedFields, doc.version || 1);
      }
      
      // Add audit entries for each changed field
      changedFields.forEach(field => {
        addAuditEntry(doc.id, "field-changed", {
          fieldName: field.fieldName,
          previousValue: field.previousValue,
          newValue: field.newValue,
        });
      });
      
      // Add version-created audit entry if applicable
      if (createVersion) {
        addAuditEntry(doc.id, "version-created", {
          comment: description,
        });
      }
      
      toast({
        title: createVersion ? "Нова версія створена" : "Зміни збережено",
        description: createVersion 
          ? `v${((doc.version || 1) + 1) / 10 || 1}.${((doc.version || 1) + 1) % 10}: ${description}`
          : "Документ оновлено без створення версії",
      });
    }
    
    // Reset state
    setPendingUpdates(null);
    setChangedFields([]);
    setVersionDialogOpen(false);
    setIsEditing(false);
    setContractorOpen(false);
  };

  const handleVersionCancel = () => {
    setPendingUpdates(null);
    setChangedFields([]);
    setVersionDialogOpen(false);
  };
  const paymentStatus = doc.amount && doc.paidAmount !== undefined
    ? doc.paidAmount >= doc.amount
      ? "full"
      : doc.paidAmount > 0
      ? "partial"
      : "unpaid"
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <typeConfig.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{typeConfig.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {isLocked && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        Заблоковано
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Документ підписано. Редагування неможливе.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Badge variant="status" className={cn("text-xs", statusConfig.color)}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold">
                {doc.number}
              </SheetTitle>
              {isEditing ? (
                <div className="mt-2">
                  <Label htmlFor="edit-title" className="text-xs text-muted-foreground">Назва</Label>
                  <Input
                    id="edit-title"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Введіть назву документа"
                    className="mt-1 h-8"
                  />
                </div>
              ) : (
                doc.title && (
                  <p className="text-sm text-muted-foreground mt-1">{doc.title}</p>
                )
              )}
            </div>
            
            {!isReadOnly && (
              <div className="shrink-0">
                {isEditing ? (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancelEdit}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button variant="default" size="icon" className="h-8 w-8" onClick={handleSaveEdit}>
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={handleStartEdit}
                          disabled={!canEdit}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {canEdit ? "Редагувати" : "Редагування заблоковано"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 pr-4">
            {/* Сума та оплата */}
            {(doc.amount !== undefined || isEditing) && (
              <section>
                {isEditing ? (
                  <div className="space-y-2">
                    <Label htmlFor="edit-amount" className="text-xs text-muted-foreground">Сума ({doc.currency})</Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.amount}
                      onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="h-10 text-xl font-bold"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold tabular-nums">
                        {formatDocumentAmount(doc.amount!, doc.currency)}
                      </span>
                      {paymentStatus === "partial" && doc.paidAmount !== undefined && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Оплачено</div>
                          <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            {formatDocumentAmount(doc.paidAmount, doc.currency)}
                          </div>
                        </div>
                      )}
                    </div>
                    {paymentStatus === "partial" && doc.amount && doc.paidAmount !== undefined && (
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${(doc.paidAmount / doc.amount) * 100}%` }}
                        />
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            <Separator />

            {/* Дати */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Дати
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Дата документа</span>
                  </div>
                  <span className="text-sm font-medium">{formatDate(doc.date)}</span>
                </div>
                
                {isEditing ? (
                  <div className="space-y-1">
                    <Label htmlFor="edit-dueDate" className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Термін дії / оплати
                    </Label>
                    <Input
                      id="edit-dueDate"
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="h-8"
                    />
                  </div>
                ) : (
                  doc.dueDate && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Термін дії / оплати</span>
                      </div>
                      <span className="text-sm font-medium">{formatDate(doc.dueDate)}</span>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Проблеми документа */}
            {hasIssues && (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Потребує уваги
                  </h3>
                  <div className="space-y-2">
                    {detectedIssues.map((issueType) => {
                      const config = documentIssueTypeConfig[issueType];
                      const styles = getDocumentIssueStyles(issueType);
                      const IconComponent = getIssueIconComponent(config.icon);
                      
                      return (
                        <div 
                          key={issueType}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border-l-4",
                            styles.border,
                            styles.bg,
                            styles.bgDark
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-full shrink-0",
                            `bg-${config.color}-100 dark:bg-${config.color}-900/30`
                          )}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">
                              {config.label}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Пріоритет: {config.priority === 1 ? "Критичний" : config.priority === 2 ? "Високий" : config.priority <= 4 ? "Середній" : "Низький"}
                            </div>
                          </div>
                          <Badge variant="outline" className={cn(
                            "shrink-0 text-xs",
                            config.priority === 1 && "border-red-400 text-red-600 dark:text-red-400",
                            config.priority === 2 && "border-orange-400 text-orange-600 dark:text-orange-400",
                            config.priority <= 4 && config.priority > 2 && "border-amber-400 text-amber-600 dark:text-amber-400"
                          )}>
                            P{config.priority}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  {isEditing ? (
                    <div className="mt-3 space-y-1">
                      <Label htmlFor="edit-issueNote" className="text-xs text-muted-foreground">
                        Коментар до проблеми
                      </Label>
                      <Textarea
                        id="edit-issueNote"
                        value={editForm.issueNote}
                        onChange={(e) => setEditForm(prev => ({ ...prev, issueNote: e.target.value }))}
                        placeholder="Додайте коментар..."
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  ) : (
                    doc.issueNote && (
                      <div className="mt-3 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{doc.issueNote}</span>
                        </div>
                      </div>
                    )
                  )}
                </section>
              </>
            )}

            {/* Контрагент */}
            {(doc.contractor || isEditing) && (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Контрагент
                  </h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Вибрати контрагента</Label>
                      <Popover open={contractorOpen} onOpenChange={setContractorOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={contractorOpen}
                            className="w-full justify-between h-auto min-h-10 py-2"
                          >
                            {editForm.contractorId ? (
                              <div className="flex flex-col items-start text-left">
                                <span className="text-sm font-medium">
                                  {contractors.find(c => c.id === editForm.contractorId)?.name}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {contractors.find(c => c.id === editForm.contractorId)?.code}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Оберіть контрагента...</span>
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[340px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Пошук за назвою або кодом..." />
                            <CommandList>
                              <CommandEmpty>Контрагентів не знайдено</CommandEmpty>
                              <CommandGroup>
                                {contractors.map((contractor) => (
                                  <CommandItem
                                    key={contractor.id}
                                    value={`${contractor.name} ${contractor.code}`}
                                    onSelect={() => {
                                      setEditForm(prev => ({
                                        ...prev,
                                        contractorId: prev.contractorId === contractor.id ? null : contractor.id,
                                      }));
                                      setContractorOpen(false);
                                    }}
                                    className="flex items-center gap-2 py-2"
                                  >
                                    <Check
                                      className={cn(
                                        "h-4 w-4 shrink-0",
                                        editForm.contractorId === contractor.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium truncate">{contractor.name}</div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-mono">{contractor.code}</span>
                                        {contractor.isSynced && (
                                          <Badge variant="outline" className="h-4 text-[10px] px-1">
                                            Синхр.
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : doc.contractor ? (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{doc.contractor.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pl-6">
                        <div>
                          <span className="text-xs text-muted-foreground">
                            {doc.contractor.code.length === 8 ? "ЄДРПОУ" : "ІПН"}:
                          </span>
                          <span className="text-sm font-mono ml-1.5">{doc.contractor.code}</span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopyToClipboard(doc.contractor!.code, "Код")}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Копіювати</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      {doc.contractor.iban && (
                        <div className="flex items-center justify-between pl-6">
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-muted-foreground">IBAN:</span>
                            <span className="text-sm font-mono ml-1.5 truncate block">
                              {doc.contractor.iban.slice(0, 10)}...{doc.contractor.iban.slice(-4)}
                            </span>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleCopyToClipboard(doc.contractor!.iban!, "IBAN")}
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
                  ) : null}
                </section>
              </>
            )}

            {/* Підписи */}
            {doc.signatures && doc.signatures.length > 0 && (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Підписи
                  </h3>
                  <div className="space-y-2">
                    {doc.signatures.map((sig) => (
                      <div key={sig.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                          {sig.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                          <div>
                            <div className="text-sm font-medium">{sig.signedBy}</div>
                            <div className="text-xs text-muted-foreground">
                              {sig.signatureType === "qualified-kep" ? "Кваліфікований КЕП" : 
                               sig.signatureType === "kep" ? "КЕП" : "Ручний підпис"}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(sig.signedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Документи, згадані в тексті (AI-аналіз) */}
            {(() => {
              const dihSummary = doc.aiAnalysis?.dihSummary as DocumentSummary | undefined;
              const referencedDocs = dihSummary && 'contract' in (dihSummary as any) && (dihSummary as any).contract?.referencedDocuments
                ? (dihSummary as any).contract.referencedDocuments
                : [];
              if (referencedDocs.length === 0) return null;
              return (
                <>
                  <Separator />
                  <section>
                    <button
                      type="button"
                      onClick={() => setIsReferencedDocsOpen((v) => !v)}
                      aria-expanded={isReferencedDocsOpen}
                      aria-controls="referenced-docs-content"
                      className="w-full flex items-center justify-between py-2 mb-1 text-left"
                    >
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Документи, згадані в тексті
                        <Badge variant="secondary" className="text-[10px] ml-1">
                          {referencedDocs.length}
                        </Badge>
                      </h3>
                      {isReferencedDocsOpen
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {isReferencedDocsOpen && (
                      <div id="referenced-docs-content">
                        <DocumentRelatedSection
                          referencedDocuments={referencedDocs}
                          attachedDocumentDescriptions={new Set(doc.linkedDocuments || [])}
                          onNavigateToDocument={handleNavigateToLinked}
                        />
                      </div>
                    )}
                  </section>
                </>
              );
            })()}

            {/* Пов'язані документи */}
            {doc.linkedDocuments && doc.linkedDocuments.length > 0 && (() => {
              const pool: Document[] =
                cabinet?.type === "tov" ? tovDemoDocuments
                : cabinet?.type === "individual" ? individualDemoDocuments
                : fopDemoDocuments;
              const resolved = doc.linkedDocuments.map((id) => ({
                originalId: id,
                found: pool.find((d) => d.id === id || d.number === id),
              }));
              return (
                <>
                  <Separator />
                  <section>
                    <button
                      type="button"
                      onClick={() => setIsLinkedDocsOpen((v) => !v)}
                      aria-expanded={isLinkedDocsOpen}
                      aria-controls="linked-docs-content"
                      className="w-full flex items-center justify-between py-2 mb-1 text-left"
                    >
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Пов'язані документи
                        <Badge variant="secondary" className="text-[10px] ml-1">
                          {doc.linkedDocuments.length}
                        </Badge>
                      </h3>
                      {isLinkedDocsOpen
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {isLinkedDocsOpen && (
                    <div id="linked-docs-content" className="space-y-2">
                      {resolved.map(({ found, originalId }) => {
                        if (!found) {
                          return (
                            <button
                              key={originalId}
                              onClick={() => handleNavigateToLinked(originalId)}
                              className="w-full flex items-center justify-between bg-muted/30 rounded-lg p-2.5 hover:bg-muted/50 transition-colors text-left"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium truncate">{originalId}</span>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            </button>
                          );
                        }
                        const typeConf = documentTypeConfigs[found.type];
                        const statusConf = documentStatusConfigs[found.status];
                        return (
                          <button
                            key={found.id}
                            onClick={() => handleNavigateToLinked(found.id)}
                            className="w-full bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors text-left"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 min-w-0 flex-1">
                                <Link2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate">
                                    {typeConf?.label || found.type} №{found.number}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                                    <span>{formatDate(found.date)}</span>
                                    {found.amount != null && (
                                      <>
                                        <span>·</span>
                                        <span>{formatDocumentAmount(found.amount, found.currency)}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {statusConf && (
                                  <Badge variant="secondary" className={cn("text-[11px] px-1.5 py-0", statusConf.color)}>
                                    {statusConf.label}
                                  </Badge>
                                )}
                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    )}
                  </section>
                </>
              );
            })()}

            {/* Пов'язані оплати */}
            {doc.linkedPayments && doc.linkedPayments.length > 0 && (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Оплати
                  </h3>
                  <div className="space-y-2">
                    {doc.linkedPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <div>
                            <div className="text-sm font-medium">
                              {formatDocumentAmount(payment.amount, doc.currency)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {payment.source || "Оплата"}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(payment.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Архівування */}
            <Separator />
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Зберігання
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Термін зберігання</span>
                <span className="font-medium">{doc.retentionPeriod} років</span>
              </div>
              {doc.retentionDeadline && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Зберігати до</span>
                  <span className="font-medium">{formatDate(doc.retentionDeadline)}</span>
                </div>
              )}
            </section>

            {/* CTA кнопки для зв'язку з іншими розділами */}
            {(onNavigateToIncomeBook || onNavigateToPayments) && (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Дії з документом
                  </h3>
                  <div className="flex flex-col gap-2">
                    {onNavigateToIncomeBook && doc.type === "invoice" && (
                      <Button
                        variant="outline"
                        className="w-full justify-between h-11 px-4"
                        onClick={() => {
                          onNavigateToIncomeBook();
                          onOpenChange(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Додати в Книгу доходів</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                    {onNavigateToPayments && (doc.type === "invoice" || doc.type === "act") && (
                      <Button
                        variant="outline"
                        className="w-full justify-between h-11 px-4"
                        onClick={() => {
                          onNavigateToPayments();
                          onOpenChange(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>Створити платіж</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* AI Analysis Section - DIH Integration */}
            {doc.aiAnalysis?.dihSummary && (
              <>
                <Separator />
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      AI-аналіз документа
                    </span>
                  </div>
                  <div className="space-y-4">
                    <DocumentSummaryCard 
                      summary={doc.aiAnalysis.dihSummary as DocumentSummary}
                      compact
                    />
                    {doc.aiAnalysis.checklist && (
                    <DocumentChecklistCard 
                        checklist={doc.aiAnalysis.checklist as DocumentChecklist}
                        onAction={(item: ChecklistItem) => {
                          if (item.action.type === "invite") {
                            // Open invite sheet with prefill data
                            const prefillData: ContractorPrefillData = {
                              name: item.action.prefillData?.name as string || undefined,
                              code: item.action.prefillData?.code as string || undefined,
                              type: item.action.prefillData?.type as "supplier" | "buyer" | "both" || "supplier",
                              sourceDocument: doc.id,
                            };
                            setInvitePrefillData(prefillData);
                            setInviteSheetOpen(true);
                          } else if (item.action.type === "navigate" && item.action.targetRoute) {
                            toast({
                              title: "Навігація",
                              description: `Перехід до: ${item.action.targetRoute}`,
                            });
                          } else {
                            toast({
                              title: "Дія",
                              description: item.action.label,
                            });
                          }
                        }}
                        onItemComplete={(itemId) => {
                          toast({
                            title: "Виконано",
                            description: `Пункт чек-листа відмічено`,
                          });
                        }}
                      />
                    )}
                  </div>
                </section>
              </>
            )}

            {/* Versions Section */}
            <Separator />
            <DocumentVersionsSection
              documentId={doc.id}
              currentVersion={1}
            />

            {/* Audit Trail Section */}
            <Separator />
            <DocumentAuditSection documentId={doc.id} />

            {/* AI чіпи */}
            <Separator />
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  AI-помічник
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAIChipClick(chip.prompt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Швидкі дії для вирішення проблем */}
            {!isReadOnly && hasIssues && (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Вирішення проблем
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {/* Редагувати - для проблем з реквізитами або контрагентом */}
                    {(detectedIssues.includes("invalid-requisites") || 
                      detectedIssues.includes("missing-contractor")) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Редагування",
                            description: "Редагування документа (демо)",
                          });
                        }}
                        className="gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Редагувати
                      </Button>
                    )}
                    {/* Підписати - для проблем з підписом */}
                    {(detectedIssues.includes("pending-signature") || 
                      detectedIssues.includes("missing-counterparty-sign")) && cabinet && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenSignDialog}
                        className="gap-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Підписати КЕП
                      </Button>
                    )}
                    {/* Оплатити - для проблем з оплатою */}
                    {(detectedIssues.includes("missing-payment") || 
                      detectedIssues.includes("partial-payment") ||
                      detectedIssues.includes("overdue-payment")) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Оплата",
                            description: "Перехід до оплати (демо)",
                          });
                        }}
                        className="gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Оплатити
                      </Button>
                    )}
                    {/* Завантажити файл - для відсутнього файлу */}
                    {detectedIssues.includes("missing-file") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Завантаження",
                            description: "Завантаження файлу документа (демо)",
                          });
                        }}
                        className="gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Додати файл
                      </Button>
                    )}
                    {/* Зареєструвати - для очікування реєстрації */}
                    {detectedIssues.includes("registration-pending") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Реєстрація",
                            description: "Реєстрація в ЄРПН (демо)",
                          });
                        }}
                        className="gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Зареєструвати
                      </Button>
                    )}
                    {/* Перевірити дублікат */}
                    {detectedIssues.includes("duplicate-suspected") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Перевірка",
                            description: "Пошук дублікатів (демо)",
                          });
                        }}
                        className="gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Перевірити дублікат
                      </Button>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* Швидкі дії зміни статусу */}
            {!isReadOnly && !statusConfig.isTerminal && (
              <>
                <Separator />
                <section>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Зміна статусу
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {doc.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange("pending-sign")}
                        className="gap-1.5"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        На підпис
                      </Button>
                    )}
                    {doc.status === "pending-sign" && cabinet && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenSignDialog}
                        className="gap-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Підписати КЕП
                      </Button>
                    )}
                    {doc.status === "signed" && cabinet && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenSendDialog}
                        className="gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Відправити
                      </Button>
                    )}
                    {(doc.status === "sent" || doc.status === "confirmed") && doc.type === "invoice" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange("paid")}
                        className="gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Позначити оплаченим
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange("archived")}
                      className="gap-1.5"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      В архів
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange("cancelled")}
                      className="gap-1.5 text-destructive hover:text-destructive"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Скасувати
                    </Button>
                  </div>
                </section>
              </>
            )}
          </div>
        </ScrollArea>

        <SheetFooter className="pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleOpenSendDialog} disabled={!cabinet}>
                      <Mail className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Надіслати</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleDownload}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Завантажити</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>

      {/* Sign Document Dialog */}
      {cabinet && (
        <SignDocumentDialog
          cabinet={cabinet}
          document={doc}
          open={signDialogOpen}
          onOpenChange={setSignDialogOpen}
          onDocumentSigned={handleDocumentSigned}
        />
      )}

      {/* Send Document Dialog */}
      {cabinet && (
        <SendDocumentDialog
          cabinet={cabinet}
          document={doc}
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          onDocumentSent={handleDocumentSent}
        />
      )}

      {/* Version Change Dialog */}
      <VersionChangeDialog
        open={versionDialogOpen}
        onOpenChange={setVersionDialogOpen}
        currentVersion={doc.version || 1}
        changedFields={changedFields}
        onConfirm={handleVersionConfirm}
        onCancel={handleVersionCancel}
      />

      {/* Invite Contractor Sheet */}
      <InviteContractorSheet
        open={inviteSheetOpen}
        onOpenChange={setInviteSheetOpen}
        prefillData={invitePrefillData || undefined}
        cabinetName={cabinet?.name}
        onInviteSent={(email, name, code) => {
          toast({
            title: "Запрошення надіслано",
            description: `${name} отримає запрошення на ${email}`,
          });
          setInviteSheetOpen(false);
        }}
      />
    </Sheet>
  );
};
