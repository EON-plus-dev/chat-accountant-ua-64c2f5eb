import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { type Document, type DocumentFlowStatus, documentStatusConfigs, documentTypeConfigs, fopDemoDocuments, tovDemoDocuments, individualDemoDocuments } from "@/config/documentFlowConfig";
import { type Cabinet } from "@/types/cabinet";
import { demoScenarios, buildSummaryFromDocument, mergeScenarioWithDocument } from "@/config/documentSummaryDemo";
import { generateDynamicChecklist } from "@/lib/documentAnalysis/generateChecklist";
import { type KepCertificate } from "@/config/settingsConfig";
import type { FieldConfidence } from "@/types/documentSummary";
import type { DiscrepancyAct, DiscrepancyCard } from "@/types/discrepancy";
import { demoDiscrepancyCards } from "@/types/discrepancy";
import type { DocumentComment } from "./DocumentCommentsPanel";
import { DEMO_COMMENTS } from "./viewer/ContextShelf";
import { DocumentChatProvider } from "@/contexts/DocumentChatContext";
import type { DocumentContextForChat } from "@/components/dashboard/ChatOrchestrator";
import { getExtendedTeamMembersForCabinet } from "@/config/teamMembersConfig";
import { notifyMentions, createMentionNotifications, createMentionJournalEntries } from "@/lib/mentionNotificationService";
import type { MentionMember } from "@/components/ui/mention-textarea";
import { useNotifications } from "@/hooks/useNotifications";
import { useEventJournal } from "@/hooks/useEventJournal";

// Headers
import { DocumentDetailHeader } from "./headers/DocumentDetailHeader";

// Tabs
import { DocumentOverviewTab } from "./tabs/DocumentOverviewTab";
import { DocumentViewerTab } from "./tabs/DocumentViewerTab";
import { DocumentLifecycleTab } from "./tabs/DocumentLifecycleTab";

// Components
import { SideBySideDocumentView } from "./SideBySideDocumentView";
import { DiscrepancyEditorSheet } from "./DiscrepancyEditorSheet";
import { VersionDiffViewer } from "./VersionDiffViewer";

// Hooks
import { useDocumentEditing, getDocumentById } from "./hooks/useDocumentEditing";

// Dialogs & Sheets
import { VersionChangeDialog } from "./VersionChangeDialog";
import SignDocumentDialog from "./SignDocumentDialog";
import SendDocumentDialog from "./SendDocumentDialog";
import { UnsavedChangesDialog } from "@/components/ui/unsaved-changes-dialog";
import { DocumentPDFPreview } from "./DocumentPDFPreview";
import { InviteContractorSheet } from "./InviteContractorSheet";
import { AddToAuditPackageSheet } from "./AddToAuditPackageSheet";
import { CreatePaymentSheet, type PaymentFormData } from "./CreatePaymentSheet";

import { UploadDocumentSheet } from "./UploadDocumentSheet";
import { ContractorCardSheet } from "@/components/cabinets/contractors";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Send, FileSignature, Sparkles, FileText, Workflow, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Tab configuration with icons - 3 tabs structure (Огляд, Документ, Життя документа)
const documentTabs: Array<{
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}> = [
  { id: "overview", label: "Огляд", shortLabel: "AI", icon: Sparkles },
  { id: "document", label: "Документ", shortLabel: "Текст", icon: FileText },
  { id: "lifecycle", label: "Журнал", shortLabel: "Журнал", icon: Workflow },
];

interface DocumentDetailPageProps {
  documentId: string;
  cabinet: Cabinet;
  onBack?: () => void;
  onChatPromptInsert?: (prompt: string) => void;
  onStatusChange?: (docId: string, newStatus: DocumentFlowStatus) => void;
  onDocumentUpdate?: (docId: string, updates: Partial<Document>) => void;
  onNavigateToDocument?: (docId: string) => void;
  onNavigateToContractor?: (contractorCode: string) => void;
  onNavigateToIncomeBook?: () => void;
  onNavigateToPayments?: () => void;
  isReadOnly?: boolean;
  // Document context for proactive AI messages
  onDocumentContextChange?: (context: DocumentContextForChat | null) => void;
  // Navigation to unified AddDocumentPage with context (for "Create based on" shortcut)
  onNavigateToAddDocument?: (context: {
    method: "create" | "upload";
    relation: "new" | "linked";
    parentDocument: Document;
    skipToStep: "template" | "upload";
  }) => void;
}

export const DocumentDetailPage = ({
  documentId,
  cabinet,
  onBack,
  onChatPromptInsert,
  onStatusChange,
  onDocumentUpdate,
  onNavigateToDocument,
  onNavigateToContractor,
  onNavigateToIncomeBook,
  onNavigateToPayments,
  isReadOnly = false,
  onDocumentContextChange,
  onNavigateToAddDocument,
}: DocumentDetailPageProps) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  const [lifecycleSection, setLifecycleSection] = useState<"history" | "connections" | "techid">("history");
  
  // Notification Center integration for @mentions
  const { addNotification } = useNotifications();
  
  // Event Journal integration for @mentions
  const { addEvent, addEvents } = useEventJournal({
    cabinetId: cabinet.id,
    cabinetType: cabinet.type,
  });
  
  // Refs for auto-centering tabs
  const mobileTabNavRef = useRef<HTMLElement>(null);
  const desktopTabNavRef = useRef<HTMLElement>(null);
  
  // Auto-center active tab on change (mobile + desktop)
  useLayoutEffect(() => {
    if (!activeTab) return;
    
    const navRef = isMobile ? mobileTabNavRef.current : desktopTabNavRef.current;
    if (!navRef) return;
    
    const activeButton = navRef.querySelector(
      `[data-tab-id="${activeTab}"]`
    ) as HTMLElement;
    
    if (activeButton) {
      activeButton.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest', 
        inline: 'center' 
      });
    }
  }, [activeTab, isMobile]);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [inviteContractorOpen, setInviteContractorOpen] = useState(false);
  const [auditPackageSheetOpen, setAuditPackageSheetOpen] = useState(false);
  const [createPaymentSheetOpen, setCreatePaymentSheetOpen] = useState(false);
  
  const [uploadRelatedSheetOpen, setUploadRelatedSheetOpen] = useState(false);
  const [uploadRelatedContext, setUploadRelatedContext] = useState<{
    docType: string;
    description: string;
    parentId: string;
  } | null>(null);
  // Track which referencedDocuments have been attached (by description)
  const [attachedReferencedDocs, setAttachedReferencedDocs] = useState<Set<string>>(new Set());
  
  // Contractor quick view sheet state
  const [contractorSheetOpen, setContractorSheetOpen] = useState(false);
  const [selectedContractorCode, setSelectedContractorCode] = useState<string | null>(null);

  // Side-by-side document view state
  const [sideBySideOpen, setSideBySideOpen] = useState(false);
  const [highlightedField, setHighlightedField] = useState<FieldConfidence | null>(null);

  // Discrepancy editor state
  const [discrepancyEditorOpen, setDiscrepancyEditorOpen] = useState(false);

  // Version diff viewer state for lifecycle tab
  const [versionDiffOpen, setVersionDiffOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{
    left: import("@/config/documentVersioningConfig").DocumentVersion;
    right: import("@/config/documentVersioningConfig").DocumentVersion;
  } | null>(null);
  const [hasDocumentUnsavedChanges, setHasDocumentUnsavedChanges] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<string | null>(null);
  const [showUnsavedTabDialog, setShowUnsavedTabDialog] = useState(false);

  // Discrepancy cards for inline viewer mode (initialized with demo data if available)
  const [discrepancyCards, setDiscrepancyCards] = useState<DiscrepancyCard[]>(() => {
    return demoDiscrepancyCards[documentId] || [];
  });

  // Document comments state - initialized with demo comments for Reply functionality
  const [documentComments, setDocumentComments] = useState<DocumentComment[]>(() => [...DEMO_COMMENTS]);

  // Phase 4: Task auto-completion state - tracks tasks completed via actions
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`doc_action_tasks_${documentId}`);
        return stored ? new Set(JSON.parse(stored)) : new Set();
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Phase 4: Action to task mapping for auto-completion
  const actionToTaskMapping: Record<string, string[]> = {
    "sign": ["demo-1", "sign-document"],
    "register-tax-invoice": ["demo-2"],
    "validate-contractor": ["demo-3"],
    "invite-approver": ["demo-4"],
    "paid": ["demo-5"],
  };

  // Phase 4: Mark tasks as completed when actions are performed
  const markTasksAsCompleted = useCallback((actionId: string) => {
    const taskIds = actionToTaskMapping[actionId] || [];
    if (taskIds.length === 0) return;
    
    setCompletedTaskIds(prev => {
      const newSet = new Set(prev);
      taskIds.forEach(id => newSet.add(id));
      
      // Persist to localStorage
      try {
        localStorage.setItem(`doc_action_tasks_${documentId}`, JSON.stringify([...newSet]));
      } catch {
        // Ignore storage errors
      }
      
      return newSet;
    });
    
    toast({
      title: "Задача виконана",
      description: `Автоматично позначено як виконану`,
    });
  }, [documentId]);

  // Navigate to lifecycle tab → history section (for header version badge)
  const handleNavigateToHistory = useCallback(() => {
    setActiveTab("lifecycle");
    setLifecycleSection("history");
  }, []);

  // Navigate to lifecycle tab → techid section (for legal signatures block)
  const handleNavigateToTechId = useCallback(() => {
    setActiveTab("lifecycle");
    setLifecycleSection("techid");
  }, []);


// Scroll handlers for header badges with proper offset for sticky header
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`) || document.getElementById(sectionId);
    if (element) {
      // Scroll with offset for sticky header
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      // Add highlight effect
      element.classList.add("highlight-active");
      setTimeout(() => {
        element.classList.remove("highlight-active");
      }, 3000);
    }
  }, []);

  const handleNavigateToContractorSection = () => {
    if (activeTab !== "lifecycle") {
      setActiveTab("lifecycle");
      setTimeout(() => scrollToSection("contractor-section"), 300);
    } else {
      scrollToSection("contractor-section");
    }
  };

  // Get document
  const doc = useMemo(() => getDocumentById(cabinet.type, documentId), [cabinet.type, documentId]);

  // Use editing hook
  const editing = useDocumentEditing({
    document: doc,
    cabinet,
    onDocumentUpdate,
    isReadOnly,
  });

  // Tab navigation guard - check for unsaved changes before switching tabs
  const handleTabChange = useCallback((newTab: string) => {
    if (activeTab === "document" && hasDocumentUnsavedChanges && editing.isContentEditing) {
      setPendingTabChange(newTab);
      setShowUnsavedTabDialog(true);
    } else {
      if (activeTab === "document" && editing.isContentEditing) {
        editing.cancelContentEdit();
      }
      setActiveTab(newTab);
    }
  }, [activeTab, hasDocumentUnsavedChanges, editing]);

  const handleSaveAndSwitchTab = useCallback(() => {
    editing.saveContentEdit();
    setActiveTab(pendingTabChange || activeTab);
    setShowUnsavedTabDialog(false);
    setHasDocumentUnsavedChanges(false);
    setPendingTabChange(null);
  }, [editing, pendingTabChange, activeTab]);

  const handleDiscardAndSwitchTab = useCallback(() => {
    editing.cancelContentEdit();
    setActiveTab(pendingTabChange || activeTab);
    setShowUnsavedTabDialog(false);
    setHasDocumentUnsavedChanges(false);
    setPendingTabChange(null);
  }, [editing, pendingTabChange, activeTab]);

  // Keyboard shortcuts for tabs (Alt+1-3) - use handleTabChange for unsaved guard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (documentTabs[tabIndex]) {
          handleTabChange(documentTabs[tabIndex].id);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTabChange]);

  // Handle step action from ActionBadgeStepper
  const handleStepAction = useCallback((actionType: import("@/config/userActionStepsConfig").ActionType) => {
    switch (actionType) {
      case "fill":
        // Navigate to "Документ" tab and enable editing
        setActiveTab("document");
        setTimeout(() => editing.startContentEdit(), 100);
        break;
        
      case "approve":
        // Navigate to "Журнал" tab → history section (approval workflow)
        setActiveTab("lifecycle");
        setLifecycleSection("history");
        break;
        
      case "sign":
        // Open sign dialog
        setSignDialogOpen(true);
        break;
        
      case "send":
        // Open send dialog
        setSendDialogOpen(true);
        break;
        
      case "done":
        // No action for auto-step
        break;
    }
  }, [editing]);

  // Resolve linked documents to full Document objects
  const linkedDocumentsResolved = useMemo(() => {
    if (!doc?.linkedDocuments || doc.linkedDocuments.length === 0) {
      return [];
    }
    // Get all documents for resolution
    const allDocs = cabinet.type === "tov" 
      ? tovDemoDocuments 
      : cabinet.type === "individual" 
        ? individualDemoDocuments 
        : fopDemoDocuments;
    
    return doc.linkedDocuments
      .map((id: string) => allDocs.find((d: Document) => d.id === id))
      .filter(Boolean) as Document[];
  }, [doc, cabinet.type]);

  // Build summary from real document data + get demo scenario for AI fields
  const { demoSummary, demoChecklist } = useMemo(() => {
    if (!doc) {
      return { demoSummary: undefined, demoChecklist: undefined };
    }

    // Find matching demo scenario based on document type
    // Types without AI-scenario use null (reconciliation, bank-statement, etc.)
    const getScenarioForDocument = (document: Document) => {
      switch (document.type) {
        case "contract":
        case "rental-agreement":
        case "supply-contract":
        case "fop-service-contract":
          return demoScenarios.find(s => s.id === "contract-with-unknown-contractor") || demoScenarios[0];
        case "invoice":
          return demoScenarios.find(s => s.id === "invoice-to-contract") || demoScenarios[1];
        case "act":
          return demoScenarios.find(s => s.id === "act-of-work-done") || demoScenarios[2];
        case "waybill":
          return demoScenarios.find(s => s.id === "waybill-validation") || demoScenarios[4];
        case "ttn":
          return demoScenarios.find(s => s.id === "ttn-delivery") || demoScenarios[6];
        // Types that don't need AI-scenario with keyTerms/compliance
        case "reconciliation":
        case "power-of-attorney":
        case "bank-statement":
        case "prro-receipt":
        case "employment-order":
        case "vacation-order":
        case "dismissal-order":
          return null;
        default:
          return demoScenarios[0];
      }
    };

    const scenario = getScenarioForDocument(doc);
    
    // Get all documents for linked document resolution
    const allDocs = cabinet.type === "tov" 
      ? tovDemoDocuments 
      : cabinet.type === "individual" 
        ? individualDemoDocuments 
        : fopDemoDocuments;
    
    // For documents without AI-scenario, build summary without scenario
    if (!scenario) {
      const summary = buildSummaryFromDocument(doc, cabinet.name, cabinet.taxId || "", undefined, allDocs);
      const checklist = generateDynamicChecklist(doc);
      return { demoSummary: summary, demoChecklist: checklist };
    }
    
    // Use mergeScenarioWithDocument to combine real document data with demo AI fields
    const { summary, checklist } = mergeScenarioWithDocument(
      scenario,
      doc,
      cabinet.name,
      cabinet.taxId || "",
      allDocs
    );

    return { demoSummary: summary, demoChecklist: checklist };
  }, [doc, cabinet.name, cabinet.taxId, cabinet.type]);

  // Helper to calculate risk level from compliance warnings (string array)
  const calculateRiskLevel = (warnings: string[] | undefined): 'low' | 'medium' | 'high' | 'critical' | undefined => {
    if (!warnings || warnings.length === 0) return undefined;
    
    // Check for critical keywords in warnings
    const criticalKeywords = ['критичн', 'терміново', 'негайно', 'заблоков', 'недійсн'];
    const highKeywords = ['ризик', 'відсутн', 'новий контрагент', 'перевір'];
    
    const criticalCount = warnings.filter(w => 
      criticalKeywords.some(k => w.toLowerCase().includes(k))
    ).length;
    const highCount = warnings.filter(w => 
      highKeywords.some(k => w.toLowerCase().includes(k))
    ).length;
    
    if (criticalCount >= 1) return 'critical';
    if (highCount >= 2) return 'high';
    if (warnings.length >= 2) return 'medium';
    if (warnings.length >= 1) return 'low';
    return undefined;
  };

  // Notify parent about document context for proactive AI messages
  useEffect(() => {
    if (doc && demoSummary && onDocumentContextChange) {
      const riskLevel = calculateRiskLevel(demoSummary.compliance?.warnings);
      
      // Build parties with validation status
      const parties = demoSummary.parties?.map(p => ({
        name: p.name,
        code: p.code,
        validationStatus: p.validationStatus as 'valid' | 'pending' | 'warning' | 'error' | undefined,
      })) || [];
      
      onDocumentContextChange({
        documentId: doc.id,
        documentType: doc.type,
        documentNumber: doc.number,
        riskLevel,
        parties,
        summary: demoSummary.shortSummary,
        // NEW: Control callbacks for chat orchestration
        navigateToTab: (tabId) => setActiveTab(tabId),
        scrollToSection: scrollToSection,
        enableDiscrepancyMode: () => {
          setActiveTab("document");
          setTimeout(() => setDiscrepancyEditorOpen(true), 300);
        },
        // NEW: Document data for AI responses
        aiSummary: demoSummary.shortSummary,
        keyRisks: demoSummary.compliance?.warnings?.map(w => ({ 
          title: String(w), 
          severity: 'medium'
        })),
        accountingStatus: doc.accountingStatus || 'pending',
        hasLinkedDocuments: (doc.linkedDocuments?.length || 0) > 0,
      });
    }
    
    // Cleanup on unmount or document change
    return () => {
      onDocumentContextChange?.(null);
    };
  }, [doc?.id, demoSummary?.id, onDocumentContextChange, scrollToSection]);

  // Generate operational data from document + auto-calculation
  const operationalData = useMemo(() => {
    if (!doc) return undefined;
    
    // Auto-calculate accounting period from document date
    const getAutoAccountingPeriod = (date: string) => {
      const d = new Date(date);
      const q = Math.ceil((d.getMonth() + 1) / 3);
      return `Q${q} ${d.getFullYear()}`;
    };
    
    // Auto-calculate accounting account based on document type
    const getAutoAccountingAccount = (document: Document) => {
      if (document.type === "invoice") {
        return document.contractor?.name?.includes("Постачальник") ? "631" : "361";
      }
      if (document.type === "act") return "703";
      return undefined;
    };

    // Auto-generate tags based on document properties
    const getAutoTags = (document: Document) => {
      const tags: string[] = [];
      if (document.amount && document.amount > 50000) tags.push("Великий платіж");
      if (document.dueDate) {
        const daysUntil = Math.ceil((new Date(document.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntil < 0) tags.push("Прострочено");
        else if (daysUntil <= 7) tags.push("Терміново");
      }
      return tags;
    };
    
    return {
      responsibleName: doc.createdBy || cabinet.name,
      period: getAutoAccountingPeriod(doc.date),
      accountingAccount: getAutoAccountingAccount(doc),
      tags: getAutoTags(doc),
      internalNote: undefined, // Demo: no internal notes by default
    };
  }, [doc, cabinet.name]);

  if (!doc) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Документ не знайдено</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: DocumentFlowStatus) => {
    onStatusChange?.(doc.id, newStatus);
    toast({
      title: "Статус змінено",
      description: `Документ позначено як "${documentStatusConfigs[newStatus].label}"`,
    });
  };

  const handleDocumentSigned = (signedDoc: Document, certificate: KepCertificate) => {
    onStatusChange?.(doc.id, "signed");
    toast({ title: "Документ підписано", description: `Підпис: ${certificate.owner}` });
    // Phase 4: Auto-complete sign task
    markTasksAsCompleted("sign");
    setSignDialogOpen(false);
  };

  const handleDocumentSent = (sentDoc: Document, channel: string) => {
    onStatusChange?.(doc.id, "sent");
    toast({ title: "Документ відправлено", description: `Канал: ${channel}` });
    setSendDialogOpen(false);
  };

  const handleChatPrompt = (prompt: string) => {
    onChatPromptInsert?.(prompt);
    toast({ title: "Запит надіслано", description: "Чат обробляє ваш запит" });
  };

  const handleExplainSimple = () => {
    onChatPromptInsert?.("Поясни простими словами цей документ: " + (demoSummary?.shortSummary || doc?.number));
  };

  const handleExplainRisks = () => {
    const warnings = demoSummary?.compliance?.warnings?.join(", ") || "ризики документа";
    onChatPromptInsert?.("Поясни ризики цього документа: " + warnings);
  };

  const handleCreateFromThis = () => {
    // Use unified AddDocumentPage navigation if available, otherwise fallback to sheet
    if (onNavigateToAddDocument && doc) {
      onNavigateToAddDocument({
        method: "create",
        relation: "linked",
        parentDocument: doc,
        skipToStep: "template",
      });
    }
  };

  const handleDelete = () => {
    toast({ title: "Видалення", description: "Документ видалено (демо)", variant: "destructive" });
    onBack?.();
  };

  const handleInviteContractor = () => {
    setInviteContractorOpen(true);
  };

  const handleCreatePayment = () => {
    setCreatePaymentSheetOpen(true);
  };

  const handlePaymentCreated = (payment: PaymentFormData) => {
    toast({ 
      title: "Платіж створено", 
      description: `${payment.type === "contractor" ? "Контрагенту" : payment.type === "tax" ? "Податок" : "Зарплата"} на ${payment.amount} ${payment.currency}` 
    });
    onNavigateToPayments?.();
  };


  const handleAddToAuditPack = () => {
    setAuditPackageSheetOpen(true);
  };

  // === Discrepancy Cards Handlers (inline viewer mode) ===
  const handleAddDiscrepancyCard = (card: Partial<DiscrepancyCard>) => {
    const newCard: DiscrepancyCard = {
      id: card.id || `disc-${Date.now()}`,
      originalText: card.originalText || "",
      clauseReference: card.clauseReference,
      proposedText: card.proposedText,
      aiComment: card.aiComment,
      userComment: card.userComment,
      status: "draft",
      createdAt: new Date().toISOString(),
      textSelection: card.textSelection,
    };
    setDiscrepancyCards(prev => [...prev, newCard]);
    toast({
      title: "Картку додано",
      description: "Фрагмент додано до акту розбіжностей",
    });
  };

  const handleEditDiscrepancyCard = (card: DiscrepancyCard) => {
    setDiscrepancyCards(prev => prev.map(c => c.id === card.id ? card : c));
  };

  const handleDeleteDiscrepancyCard = (id: string) => {
    setDiscrepancyCards(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Картку видалено",
      description: "Фрагмент видалено з акту розбіжностей",
    });
  };

  const handleCreateDiscrepancyActFromViewer = () => {
    // Open the full discrepancy editor sheet with current cards
    setDiscrepancyEditorOpen(true);
  };

  const handleAskAIAboutDiscrepancy = (card: DiscrepancyCard) => {
    onChatPromptInsert?.(`Проаналізуй цей пункт договору та запропонуй альтернативне формулювання: "${card.originalText}"`);
    toast({
      title: "Запит надіслано",
      description: "AI аналізує пункт договору",
    });
  };

  // === Team Members for @mentions ===
  const teamMembers: MentionMember[] = useMemo(() => {
    const members = getExtendedTeamMembersForCabinet(cabinet.id);
    return members
      .filter(m => m.status === "active")
      .map(m => ({
        id: m.id,
        userId: m.userId,
        name: m.name,
        role: m.role,
        roleLabel: m.roleLabel,
        avatar: m.avatar,
      }));
  }, [cabinet.id]);

  // === Document Comments Handlers ===
  const handleAddDocumentComment = (content: string, fragmentId?: string, fragmentText?: string, mentionedUserIds?: string[]) => {
    const newComment: DocumentComment = {
      id: `comment-${Date.now()}`,
      content,
      author: cabinet.name,
      authorInitials: cabinet.name.slice(0, 2).toUpperCase(),
      createdAt: new Date().toISOString(),
      fragmentId,
      fragmentText,
      mentionedUserIds,
    };
    setDocumentComments(prev => [...prev, newComment]);
    
    // Send notifications to mentioned users
    if (mentionedUserIds && mentionedUserIds.length > 0 && doc) {
      const mentionContext = {
        mentionerName: cabinet.name,
        commentContent: content,
        documentId: doc.id,
        documentTitle: doc.number || "Документ",
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        fragmentText,
        commentId: newComment.id,
      };
      
      // 1. Send toast notifications
      notifyMentions(mentionedUserIds, mentionContext, teamMembers);
      
      // 2. Add to Notification Center
      const notifications = createMentionNotifications(mentionedUserIds, mentionContext, teamMembers);
      notifications.forEach(n => addNotification(n));
      
      // 3. Add to Event Journal
      const journalEntries = createMentionJournalEntries(mentionedUserIds, mentionContext, teamMembers);
      addEvents(journalEntries);
    } else {
      toast({
        title: "Коментар додано",
        description: fragmentText ? "Коментар прив'язано до фрагмента" : "Коментар додано до документа",
      });
    }
  };

  const handleReplyToDocumentComment = (commentId: string, content: string, mentionedUserIds?: string[]) => {
    const replyId = `reply-${Date.now()}`;
    setDocumentComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const reply: DocumentComment = {
          id: replyId,
          content,
          author: cabinet.name,
          authorInitials: cabinet.name.slice(0, 2).toUpperCase(),
          createdAt: new Date().toISOString(),
          mentionedUserIds,
        };
        return { ...c, replies: [...(c.replies || []), reply] };
      }
      return c;
    }));
    
    // Send notifications to mentioned users in reply
    if (mentionedUserIds && mentionedUserIds.length > 0 && doc) {
      const mentionContext = {
        mentionerName: cabinet.name,
        commentContent: content,
        documentId: doc.id,
        documentTitle: doc.number || "Документ",
        cabinetId: cabinet.id,
        cabinetName: cabinet.name,
        commentId: replyId,
      };
      
      // 1. Send toast notifications
      notifyMentions(mentionedUserIds, mentionContext, teamMembers);
      
      // 2. Add to Notification Center
      const notifications = createMentionNotifications(mentionedUserIds, mentionContext, teamMembers);
      notifications.forEach(n => addNotification(n));
      
      // 3. Add to Event Journal
      const journalEntries = createMentionJournalEntries(mentionedUserIds, mentionContext, teamMembers);
      addEvents(journalEntries);
    }
  };

  const handleDeleteDocumentComment = (commentId: string) => {
    setDocumentComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleResolveDocumentComment = (commentId: string) => {
    setDocumentComments(prev => prev.map(c => 
      c.id === commentId ? { ...c, isResolved: true } : c
    ));
  };

  const handleUploadRelatedDocument = (docType: string, description: string) => {
    setUploadRelatedContext({
      docType,
      description,
      parentId: doc.id,
    });
    setUploadRelatedSheetOpen(true);
  };

  const handleDocumentLinked = (newDocumentId: string) => {
    // Update the document's linkedDocuments array
    const updatedLinkedDocuments = [...(doc.linkedDocuments || []), newDocumentId];
    
    // Call the update handler to persist changes
    onDocumentUpdate?.(doc.id, { 
      linkedDocuments: updatedLinkedDocuments 
    });

    // Mark the referenced document as attached (by description)
    if (uploadRelatedContext?.description) {
      setAttachedReferencedDocs(prev => new Set(prev).add(uploadRelatedContext.description));
    }

    toast({
      title: "Документ прив'язано",
      description: `${uploadRelatedContext?.description} успішно додано до пов'язаних документів`,
    });
  };

  // Contractor quick view handlers
  const handleContractorQuickView = (contractorCode: string) => {
    setSelectedContractorCode(contractorCode);
    setContractorSheetOpen(true);
  };

  const handleOpenContractorFullPage = (contractorId: string) => {
    setContractorSheetOpen(false);
    // Find contractor code from id to pass to parent
    onNavigateToContractor?.(contractorId);
  };

  // Side-by-side view handlers
  const handleNavigateToFieldInPdf = (field: FieldConfidence) => {
    setHighlightedField(field);
    setSideBySideOpen(true);
  };

  const handleOpenSideBySide = () => {
    setSideBySideOpen(true);
  };

  const handleCloseSideBySide = () => {
    setSideBySideOpen(false);
    setHighlightedField(null);
  };

  // Discrepancy Act handler
  const handleCreateDiscrepancyAct = useCallback((act: DiscrepancyAct) => {
    // Create new document of type discrepancy-act
    const newDocId = `doc-discrepancy-${Date.now()}`;
    const newDocNumber = `АР-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    // Build HTML body from cards
    const bodyHtml = `<div class="discrepancy-act">
      <h2>Акт розбіжностей</h2>
      <p><strong>До документа:</strong> ${doc?.number}</p>
      <p><strong>Контрагент:</strong> ${doc?.contractor?.name || "—"}</p>
      <p><strong>Кількість пунктів:</strong> ${act.cards.length}</p>
      <hr/>
      ${act.cards.map((card, i) => `
        <div class="discrepancy-item" style="margin-bottom: 16px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h4 style="margin: 0 0 8px 0;">Пункт ${i + 1}${card.clauseReference ? ` (${card.clauseReference})` : ""}</h4>
          <p style="margin: 4px 0;"><strong>Оригінальний текст:</strong></p>
          <p style="margin: 4px 0; font-style: italic; color: #6b7280;">"${card.originalText}"</p>
          ${card.proposedText ? `<p style="margin: 4px 0;"><strong>Пропозиція:</strong></p><p style="margin: 4px 0; color: #059669;">${card.proposedText}</p>` : ""}
          ${card.userComment ? `<p style="margin: 4px 0;"><strong>Коментар:</strong> ${card.userComment}</p>` : ""}
          ${card.aiComment ? `<p style="margin: 4px 0; font-size: 12px; color: #6366f1;"><em>AI: ${card.aiComment}</em></p>` : ""}
        </div>
      `).join("")}
      ${act.summary ? `<hr/><p><strong>Резюме:</strong> ${act.summary}</p>` : ""}
    </div>`;

    // Update linked documents on original
    if (doc && onDocumentUpdate) {
      onDocumentUpdate(doc.id, {
        linkedDocuments: [...(doc.linkedDocuments || []), newDocId],
      });
    }

    toast({
      title: "Акт розбіжностей створено",
      description: `Документ ${newDocNumber} готовий до відправки контрагенту`,
    });

    setDiscrepancyEditorOpen(false);
  }, [doc, onDocumentUpdate]);

  // Get contractor name and validation status from real document data
  const contractorName = doc.contractor?.name;
  // Get validation status from summary (uses real contractor code lookup)
  const contractorParty = demoSummary?.parties?.find(p => p.role === "buyer" || p.role === "executor");
  const contractorValidationStatus = contractorParty?.validationStatus || "pending";
  // Use keyDates from merged summary (built from real document data)
  const keyDates = demoSummary?.keyDates;

  // Get primary action for FAB based on status
  const getPrimaryFabAction = () => {
    switch (doc.status) {
      case "draft":
      case "pending-sign":
        return { label: "Підписати", icon: FileSignature, action: () => setSignDialogOpen(true) };
      case "signed":
        return { label: "Надіслати", icon: Send, action: () => setSendDialogOpen(true) };
      default:
        return null;
    }
  };

  const fabAction = getPrimaryFabAction();

  // Mobile layout
  if (isMobile) {
    return (
      <DocumentChatProvider onChatCommand={onChatPromptInsert}>
      <div className="flex flex-col h-full relative">
        <DocumentDetailHeader
          document={doc}
          isEditing={editing.isEditing}
          isOperationalEditing={false}
          isContentEditing={editing.isContentEditing}
          canEdit={editing.canEdit}
          canEditOperational={false}
          canEditContent={editing.canEditContent}
          isLocked={editing.isLocked}
          isMobile
          contractorName={contractorName}
          onBack={onBack || (() => {})}
          onStartEdit={editing.startEdit}
          onStartOperationalEdit={() => {}}
          onStartContentEdit={() => {
            setActiveTab("document");
            setTimeout(() => editing.startContentEdit(), 100);
          }}
          onCancelEdit={editing.cancelEdit}
          onSaveEdit={editing.saveEdit}
          onSign={() => setSignDialogOpen(true)}
          onSend={() => setSendDialogOpen(true)}
          onCreateFromThis={handleCreateFromThis}
          onDelete={handleDelete}
          onInviteContractor={handleInviteContractor}
          onCreatePayment={handleCreatePayment}
          onAddToAuditPack={handleAddToAuditPack}
          onOpenDiscrepancy={() => setDiscrepancyEditorOpen(true)}
          onNavigateToHistory={handleNavigateToHistory}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
          {/* Mobile Pill Tabs - SubtabShelf pattern */}
          <div className="bg-subtab-shelf border-b border-border relative">
            {/* Fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-subtab-shelf to-transparent z-10 pointer-events-none" aria-hidden="true" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-subtab-shelf to-transparent z-10 pointer-events-none" aria-hidden="true" />
            
            <ScrollArea className="w-full" scrollbarVariant="hidden" orientation="horizontal">
              <nav ref={mobileTabNavRef} className="inline-flex items-center gap-1.5 w-max py-2" role="tablist" aria-label="Розділи документа">
                <span aria-hidden="true" className="w-4 shrink-0" />
                {documentTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = tab.id === activeTab;
                  
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      data-tab-id={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "flex items-center gap-1.5 h-8 px-3",
                        "text-sm font-medium rounded-full shrink-0",
                        "transition-[background-color,color,transform,box-shadow] duration-150 ease-out",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/50",
                        isActive
                          ? [
                              "bg-background text-foreground",
                              "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]",
                              "ring-[1.5px] ring-border/50",
                            ]
                          : [
                              "text-muted-foreground",
                              "hover:text-foreground hover:bg-muted hover:scale-[1.02]",
                              "active:scale-[0.97] active:bg-accent",
                            ]
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                      <span>{tab.shortLabel}</span>
                    </button>
                  );
                })}
                <span aria-hidden="true" className="w-4 shrink-0" />
              </nav>
              <ScrollBar orientation="horizontal" variant="thin" />
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-auto pb-20">
            <TabsContent value="overview" className="m-0 h-full p-4 animate-fade-in">
              <DocumentOverviewTab
                document={doc}
                summary={demoSummary}
                checklist={demoChecklist}
                linkedDocumentsResolved={linkedDocumentsResolved}
                approvalState={editing.approvalState}
                onApprove={editing.handleApprove}
                onReject={editing.handleReject}
                onRecommend={editing.handleRecommend}
                onRequestClarification={editing.handleRequestClarification}
                onRespondToClarification={editing.handleRespondToClarification}
                onResolveComment={editing.handleResolveComment}
                cabinetType={cabinet.type}
                operationalData={operationalData}
                attachedReferencedDocs={attachedReferencedDocs}
                onChatPrompt={handleChatPrompt}
                onExplainSimple={handleExplainSimple}
                onExplainRisks={handleExplainRisks}
                onNavigateToDocument={onNavigateToDocument}
                onNavigateToContractor={handleContractorQuickView}
                onNavigateToRelatedTab={handleNavigateToContractorSection}
                onNavigateToIntegration={() => setActiveTab("lifecycle")}
                onUploadRelatedDocument={handleUploadRelatedDocument}
                onNavigateToFieldInPdf={handleNavigateToFieldInPdf}
                onOpenSideBySide={handleOpenSideBySide}
                onNavigateToTechId={handleNavigateToTechId}
                onStepAction={handleStepAction}
                // Action workflow handlers for tasks block
                onSignDocument={() => setSignDialogOpen(true)}
                onValidateContractor={() => {
                  const contractorCode = doc?.contractor?.code;
                  if (contractorCode) {
                    handleContractorQuickView(contractorCode);
                  } else {
                    toast({ title: "Перевірка контрагента", description: "Код контрагента не знайдено" });
                  }
                }}
                onInviteContractor={() => setInviteContractorOpen(true)}
                onNavigateToRegistration={() => {
                  toast({ 
                    title: "Перехід до ЄРПН", 
                    description: "Відкриваємо сторінку реєстрації податкової накладної..." 
                  });
                  // In real app: window.open("https://cabinet.tax.gov.ua/...", "_blank")
                }}
                // Phase 4: Pass externally completed task IDs
                externalCompletedTaskIds={completedTaskIds}
                // Open editor for AI suggestions
                onOpenEditor={() => {
                  setActiveTab("document");
                  // Start edit mode after tab change
                  setTimeout(() => {
                    editing.startContentEdit();
                  }, 100);
                }}
              />
            </TabsContent>

            <TabsContent value="document" className="m-0 h-full animate-fade-in">
              <DocumentViewerTab
                flowDocument={doc}
                bodyText={editing.bodyText}
                isEditing={editing.isContentEditing}
                canEditContent={editing.canEditContent}
                onStartContentEdit={editing.startContentEdit}
                onCancelContentEdit={editing.cancelContentEdit}
                onSaveContentEdit={editing.saveContentEdit}
                onTextChange={editing.handleTextChange}
                summary={demoSummary}
                onFieldClick={handleNavigateToFieldInPdf}
                onFieldValueUpdate={(fieldName, newValue) => {
                  toast({
                    title: "Значення оновлено",
                    description: `Поле "${fieldName}" змінено на "${newValue}"`,
                  });
                }}
              />
            </TabsContent>

            <TabsContent value="lifecycle" className="p-4 m-0 animate-fade-in">
              <DocumentLifecycleTab
                document={doc}
                cabinet={cabinet}
                cabinetType={cabinet.type}
                linkedDocumentsResolved={linkedDocumentsResolved}
                onNavigateToDocument={onNavigateToDocument}
                onNavigateToIncomeBook={onNavigateToIncomeBook}
                onNavigateToPayments={onNavigateToPayments}
                onNavigateToReports={() => toast({ title: "Звіти", description: "Перехід до звітів (демо)" })}
                onRestoreVersion={(versionId, version) => {
                  toast({ title: `Версію ${version.versionNumber} відновлено` });
                }}
                onViewVersion={(versionId) => {
                  toast({ title: `Перегляд версії ${versionId}` });
                }}
                onCompareVersions={(left, right) => {
                  setCompareVersions({ left, right });
                  setVersionDiffOpen(true);
                }}
                onExportAudit={() => {
                  toast({ title: "Експорт аудиту розпочато" });
                }}
                initialSection={lifecycleSection}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* FAB with primary action + secondary dropdown */}
        {fabAction && (
          <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 rounded-full shadow-lg bg-background"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="mb-2">
                <DropdownMenuItem onClick={handleInviteContractor}>
                  Запросити контрагента
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreatePayment}>
                  Створити платіж
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddToAuditPack}>
                  Додати до пакету
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-xl gap-0"
              onClick={fabAction.action}
            >
              <fabAction.icon className="w-6 h-6" />
            </Button>
          </div>
        )}

        {/* Dialogs */}
        <SignDocumentDialog open={signDialogOpen} onOpenChange={setSignDialogOpen} document={doc} cabinet={cabinet} onDocumentSigned={handleDocumentSigned} />
        <SendDocumentDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen} document={doc} cabinet={cabinet} onDocumentSent={handleDocumentSent} />
        <DocumentPDFPreview open={pdfPreviewOpen} onOpenChange={setPdfPreviewOpen} documentData={{ type: doc.type, number: doc.number, date: doc.date, supplier: { name: cabinet.name, code: "" }, buyer: doc.contractor || { name: "", code: "" }, amount: doc.amount, currency: doc.currency, bodyText: editing.bodyText }} />
        <VersionChangeDialog open={editing.versionDialogOpen} onOpenChange={() => {}} currentVersion={doc.version || 1} changedFields={editing.changedFields} onConfirm={editing.handleVersionConfirm} onCancel={editing.handleVersionCancel} />
        <InviteContractorSheet
          open={inviteContractorOpen}
          onOpenChange={setInviteContractorOpen}
          prefillData={{
            name: demoSummary?.parties?.find(p => !p.isKnown)?.name,
            sourceDocument: doc.id,
          }}
          cabinetName={cabinet.name}
          onInviteSent={(email, name) => {
            toast({ title: "Запрошення надіслано", description: `${name} отримає лист на ${email}` });
          }}
        />
        <AddToAuditPackageSheet
          open={auditPackageSheetOpen}
          onOpenChange={setAuditPackageSheetOpen}
          documentNumber={doc.number}
          documentId={doc.id}
          onAdd={(auditId, packageType) => {
            toast({ title: "Документ додано", description: `Додано до перевірки як "${packageType}"` });
          }}
        />
        <CreatePaymentSheet
          open={createPaymentSheetOpen}
          onOpenChange={setCreatePaymentSheetOpen}
          document={doc}
          onCreatePayment={handlePaymentCreated}
        />
        <ContractorCardSheet
          open={contractorSheetOpen}
          onOpenChange={setContractorSheetOpen}
          contractorCode={selectedContractorCode}
          cabinet={cabinet}
          onOpenFullPage={handleOpenContractorFullPage}
          onNavigateToDocument={(docId) => {
            setContractorSheetOpen(false);
            onNavigateToDocument?.(docId);
          }}
        />
      </div>
      </DocumentChatProvider>
    );
  }

  // Desktop layout - full width, no Right Rail
  return (
    <DocumentChatProvider onChatCommand={onChatPromptInsert}>
    <div className="flex flex-col h-full min-w-0 overflow-hidden">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        {/* Header + Tabs = один візуальний блок з bg-card */}
        <div className="shrink-0 bg-card border-b border-border/70">
          <DocumentDetailHeader
            document={doc}
            isEditing={editing.isEditing}
            isOperationalEditing={false}
            isContentEditing={editing.isContentEditing}
            canEdit={editing.canEdit}
            canEditOperational={false}
            canEditContent={editing.canEditContent}
            isLocked={editing.isLocked}
            contractorName={contractorName}
            onBack={onBack || (() => {})}
            onStartEdit={editing.startEdit}
            onStartOperationalEdit={() => {}}
            onStartContentEdit={() => {
              setActiveTab("document");
              setTimeout(() => editing.startContentEdit(), 100);
            }}
            onCancelEdit={editing.cancelEdit}
            onSaveEdit={editing.saveEdit}
            onSign={() => setSignDialogOpen(true)}
            onSend={() => setSendDialogOpen(true)}
            onCreateFromThis={handleCreateFromThis}
            onDelete={handleDelete}
            onInviteContractor={handleInviteContractor}
            onCreatePayment={handleCreatePayment}
            onAddToAuditPack={handleAddToAuditPack}
            onOpenDiscrepancy={() => setDiscrepancyEditorOpen(true)}
            onNavigateToHistory={handleNavigateToHistory}
          />
          {/* Desktop Pill Tabs - SubtabShelf pattern */}
          <div className="bg-subtab-shelf border-b border-border relative">
            {/* Fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-subtab-shelf to-transparent z-10 pointer-events-none" aria-hidden="true" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-subtab-shelf to-transparent z-10 pointer-events-none" aria-hidden="true" />
            
            <ScrollArea className="w-full" scrollbarVariant="hidden" orientation="horizontal">
              <nav ref={desktopTabNavRef} className="inline-flex items-center gap-1.5 w-max py-2 scroll-px-4" role="tablist" aria-label="Розділи документа">
                <span aria-hidden="true" className="w-6 shrink-0" />
                {documentTabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = tab.id === activeTab;
                  
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      data-tab-id={tab.id}
                      title={`${tab.label} (Alt+${index + 1})`}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "flex items-center gap-1.5 h-8 px-3",
                        "text-sm font-medium rounded-full shrink-0",
                        "transition-[background-color,color,transform,box-shadow] duration-150 ease-out",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/50",
                        isActive
                          ? [
                              "bg-background text-foreground",
                              "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]",
                              "ring-[1.5px] ring-border/50",
                            ]
                          : [
                              "text-muted-foreground",
                              "hover:text-foreground hover:bg-muted hover:scale-[1.02]",
                              "active:scale-[0.97] active:bg-accent",
                            ]
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
                <span aria-hidden="true" className="w-6 shrink-0" />
              </nav>
              <ScrollBar orientation="horizontal" variant="thin" />
            </ScrollArea>
          </div>
        </div>

        {/* Content - flex-1, native scroll to prevent width expansion */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden min-w-0">
            <TabsContent value="overview" className="m-0 px-6 py-6 animate-fade-in">
              <DocumentOverviewTab
                document={doc}
                summary={demoSummary}
                checklist={demoChecklist}
                linkedDocumentsResolved={linkedDocumentsResolved}
                approvalState={editing.approvalState}
                onApprove={editing.handleApprove}
                onReject={editing.handleReject}
                onRecommend={editing.handleRecommend}
                onRequestClarification={editing.handleRequestClarification}
                onRespondToClarification={editing.handleRespondToClarification}
                onResolveComment={editing.handleResolveComment}
                cabinetType={cabinet.type}
                operationalData={operationalData}
                attachedReferencedDocs={attachedReferencedDocs}
                onChatPrompt={handleChatPrompt}
                onExplainSimple={handleExplainSimple}
                onExplainRisks={handleExplainRisks}
                onNavigateToDocument={onNavigateToDocument}
                onNavigateToContractor={handleContractorQuickView}
                onNavigateToRelatedTab={handleNavigateToContractorSection}
                onNavigateToIntegration={() => setActiveTab("lifecycle")}
                onUploadRelatedDocument={handleUploadRelatedDocument}
                onNavigateToFieldInPdf={handleNavigateToFieldInPdf}
                onOpenSideBySide={handleOpenSideBySide}
                onNavigateToTechId={handleNavigateToTechId}
                onStepAction={handleStepAction}
                // Action workflow handlers for tasks block
                onSignDocument={() => setSignDialogOpen(true)}
                onValidateContractor={() => {
                  const contractorCode = doc?.contractor?.code;
                  if (contractorCode) {
                    handleContractorQuickView(contractorCode);
                  } else {
                    toast({ title: "Перевірка контрагента", description: "Код контрагента не знайдено" });
                  }
                }}
                onInviteContractor={() => setInviteContractorOpen(true)}
                onNavigateToRegistration={() => {
                  toast({ 
                    title: "Перехід до ЄРПН", 
                    description: "Відкриваємо сторінку реєстрації податкової накладної..." 
                  });
                }}
                externalCompletedTaskIds={completedTaskIds}
                onOpenEditor={() => {
                  setActiveTab("document");
                  setTimeout(() => {
                    editing.startContentEdit();
                  }, 100);
                }}
              />
            </TabsContent>

            <TabsContent value="document" className="m-0 pt-4 animate-fade-in min-w-0 max-w-full overflow-hidden">
              <DocumentViewerTab
                flowDocument={doc}
                bodyText={editing.bodyText}
                isEditing={editing.isContentEditing}
                canEditContent={editing.canEditContent}
                onStartContentEdit={editing.startContentEdit}
                onCancelContentEdit={editing.cancelContentEdit}
                onSaveContentEdit={editing.saveContentEdit}
                onTextChange={editing.handleTextChange}
                summary={demoSummary}
                onFieldClick={handleNavigateToFieldInPdf}
                onFieldValueUpdate={(fieldName, newValue) => {
                  toast({
                    title: "Значення оновлено",
                    description: `Поле "${fieldName}" змінено на "${newValue}"`,
                  });
                }}
                // AI integration
                onChatPrompt={handleChatPrompt}
                onExplainSelection={(text) => handleChatPrompt(`Поясни цей фрагмент: "${text}"`)}
                onCheckRisk={(text) => handleChatPrompt(`Чи є тут ризик? "${text}"`)}
                // Version comparison
                onCompareVersions={handleNavigateToHistory}
                // Discrepancy mode
                discrepancyCards={discrepancyCards}
                onAddDiscrepancyCard={handleAddDiscrepancyCard}
                onEditDiscrepancyCard={handleEditDiscrepancyCard}
                onDeleteDiscrepancyCard={handleDeleteDiscrepancyCard}
                onCreateDiscrepancyAct={handleCreateDiscrepancyActFromViewer}
                onAskAI={handleAskAIAboutDiscrepancy}
                // Comments
                comments={documentComments}
                onAddComment={handleAddDocumentComment}
                onReplyToComment={handleReplyToDocumentComment}
                onDeleteComment={handleDeleteDocumentComment}
                onResolveComment={handleResolveDocumentComment}
                teamMembers={teamMembers}
                onUnsavedChangesChange={setHasDocumentUnsavedChanges}
              />
            </TabsContent>

            <TabsContent value="lifecycle" className="m-0 px-6 py-6 animate-fade-in">
              <DocumentLifecycleTab
                document={doc}
                cabinet={cabinet}
                cabinetType={cabinet.type}
                linkedDocumentsResolved={linkedDocumentsResolved}
                onNavigateToDocument={onNavigateToDocument}
                onNavigateToIncomeBook={onNavigateToIncomeBook}
                onNavigateToPayments={onNavigateToPayments}
                onNavigateToReports={() => toast({ title: "Звіти", description: "Перехід до звітів (демо)" })}
                onRestoreVersion={(versionId, version) => {
                  toast({ title: `Версію ${version.versionNumber} відновлено` });
                }}
                onViewVersion={(versionId) => {
                  toast({ title: `Перегляд версії ${versionId}` });
                }}
                onCompareVersions={(left, right) => {
                  setCompareVersions({ left, right });
                  setVersionDiffOpen(true);
                }}
                onExportAudit={() => {
                  toast({ title: "Експорт аудиту розпочато" });
                }}
                initialSection={lifecycleSection}
              />
            </TabsContent>
        </div>
      </Tabs>

      {/* Dialogs */}
      <UnsavedChangesDialog
        open={showUnsavedTabDialog}
        onOpenChange={setShowUnsavedTabDialog}
        onSave={handleSaveAndSwitchTab}
        onDiscard={handleDiscardAndSwitchTab}
        onCancel={() => {
          setShowUnsavedTabDialog(false);
          setPendingTabChange(null);
        }}
      />
      <SignDocumentDialog open={signDialogOpen} onOpenChange={setSignDialogOpen} document={doc} cabinet={cabinet} onDocumentSigned={handleDocumentSigned} />
      <SendDocumentDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen} document={doc} cabinet={cabinet} onDocumentSent={handleDocumentSent} />
      <DocumentPDFPreview open={pdfPreviewOpen} onOpenChange={setPdfPreviewOpen} documentData={{ type: doc.type, number: doc.number, date: doc.date, supplier: { name: cabinet.name, code: "" }, buyer: doc.contractor || { name: "", code: "" }, amount: doc.amount, currency: doc.currency, bodyText: editing.bodyText }} />
      <VersionChangeDialog open={editing.versionDialogOpen} onOpenChange={() => {}} currentVersion={doc.version || 1} changedFields={editing.changedFields} onConfirm={editing.handleVersionConfirm} onCancel={editing.handleVersionCancel} />
        <InviteContractorSheet
          open={inviteContractorOpen}
          onOpenChange={setInviteContractorOpen}
          prefillData={{
            name: demoSummary?.parties?.find(p => !p.isKnown)?.name,
            sourceDocument: doc.id,
          }}
          cabinetName={cabinet.name}
          onInviteSent={(email, name) => {
            toast({ title: "Запрошення надіслано", description: `${name} отримає лист на ${email}` });
          }}
        />
        <AddToAuditPackageSheet
          open={auditPackageSheetOpen}
          onOpenChange={setAuditPackageSheetOpen}
          documentNumber={doc.number}
          documentId={doc.id}
          onAdd={(auditId, packageType) => {
            toast({ title: "Документ додано", description: `Додано до перевірки як "${packageType}"` });
          }}
        />
        <CreatePaymentSheet
          open={createPaymentSheetOpen}
          onOpenChange={setCreatePaymentSheetOpen}
          document={doc}
          onCreatePayment={handlePaymentCreated}
        />
        <UploadDocumentSheet
          cabinet={cabinet}
          open={uploadRelatedSheetOpen}
          onOpenChange={setUploadRelatedSheetOpen}
          parentDocumentId={uploadRelatedContext?.parentId}
          relatedDocumentType={uploadRelatedContext?.docType}
          relatedDocumentDescription={uploadRelatedContext?.description}
          onDocumentLinked={handleDocumentLinked}
        />
        <ContractorCardSheet
          open={contractorSheetOpen}
          onOpenChange={setContractorSheetOpen}
          contractorCode={selectedContractorCode}
          cabinet={cabinet}
          onOpenFullPage={handleOpenContractorFullPage}
          onNavigateToDocument={(docId) => {
            setContractorSheetOpen(false);
            onNavigateToDocument?.(docId);
          }}
        />
        
        {/* Side-by-Side Document View */}
        <Sheet open={sideBySideOpen} onOpenChange={setSideBySideOpen}>
          <SheetContent side="right" className="w-full sm:max-w-[95vw] p-0">
            <SideBySideDocumentView
              document={doc}
              summary={demoSummary}
              cabinetName={cabinet.name}
              cabinetTaxId={cabinet.taxId || ""}
              highlightedField={highlightedField}
              onFieldClick={setHighlightedField}
              onClose={handleCloseSideBySide}
            />
          </SheetContent>
        </Sheet>

        {/* Discrepancy Editor Sheet */}
        <DiscrepancyEditorSheet
          open={discrepancyEditorOpen}
          onOpenChange={setDiscrepancyEditorOpen}
          document={doc}
          cabinet={cabinet}
          bodyText={editing.bodyText}
          onCreateDiscrepancyAct={handleCreateDiscrepancyAct}
        />

        {/* Version Diff Viewer */}
        {compareVersions && (
          <VersionDiffViewer
            leftVersion={compareVersions.left}
            rightVersion={compareVersions.right}
            open={versionDiffOpen}
            onClose={() => {
              setVersionDiffOpen(false);
              setCompareVersions(null);
            }}
          />
        )}
    </div>
    </DocumentChatProvider>
  );
};
