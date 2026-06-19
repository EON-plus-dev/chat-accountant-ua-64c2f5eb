import { useState, useMemo, useEffect, useCallback } from "react";
import { ArrowLeft, FileText, Eye, Link2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { Cabinet } from "@/types/cabinet";
import { type DocumentType, type DocumentFlowStatus, type Document, documentTypeConfigs, getDocumentsForCabinet } from "@/config/documentFlowConfig";
import { getContractorsForCabinet, type Contractor } from "@/config/settingsConfig";
import { type DocumentTemplate, systemTemplates, demoCustomTemplates } from "@/config/documentTemplatesConfig";
import { getFormSchemaForType } from "@/config/documentFormSchemas";
import { getCabinetRequisites, mapSourceKeyToValue, mapContractorToValues } from "@/config/cabinetRequisitesDemo";
import {
  type DocumentPosition,
  calculateReadiness,
} from "@/config/documentTemplateGenerator";
import { calculatePositionTotals, type ExtendedDocumentPosition } from "@/types/extendedPosition";
import { fetchNBUExchangeRate } from "@/lib/nbuExchangeRate";
import { AnchorCardStrip } from "./anchor-cards/AnchorCardStrip";
import { DocumentLivePreview } from "./DocumentLivePreview";
import { PositionsSheet } from "./PositionsSheet";
import { DocumentSaveSuccessDialog } from "./DocumentSaveSuccessDialog";
import SignDocumentDialog from "./SignDocumentDialog";
import { type KepCertificate } from "@/config/settingsConfig";
import { useAnchorCardSync } from "@/hooks/use-anchor-card-sync";
import { useDocumentValidation } from "@/hooks/use-document-validation";
import { InviteContractorSheet } from "./InviteContractorSheet";
import { InlinePrintPreview } from "./viewer/InlinePrintPreview";
import { simulateContractorOnboarding, type PendingContractorInfo } from "@/lib/contractorNotificationService";
import { ValidationBanner } from "./validation/ValidationBanner";
import { ReadinessBreakdownPopover } from "./anchor-cards/ReadinessBreakdownPopover";
import { PartyRoleSelector } from "./steps/PartyRoleSelector";
import type { UnifiedTemplateField } from "@/types/templateField";

interface CreateDocumentSplitViewProps {
  cabinet: Cabinet;
  initialType?: DocumentType;
  initialTemplate?: DocumentTemplate | null;
  onBack?: () => void;
  onDocumentCreated?: () => void;
  onNavigateToDocument?: (documentId: string) => void;
  onChatMessage?: (prompt: string) => void;
  onNavigateToCreateTemplate?: () => void;
  // Context for linked document creation (Scenario 3)
  parentDocument?: Document | null;
}

// Generate document number based on type
const generateDocumentNumber = (type: DocumentType): string => {
  const prefixes: Record<DocumentType, string> = {
    invoice: "РАХ", act: "АКТ", contract: "ДОГ", waybill: "НКЛ", ttn: "ТТН",
    "tax-invoice": "ПН", "prro-receipt": "ЧЕК", reconciliation: "АЗ",
    certificate: "ДОВ", receipt: "КВТ", "power-of-attorney": "ДВР",
    order: "НКЗ", "employment-order": "НПР", "dismissal-order": "НЗВ", "vacation-order": "НВП",
    "payment-order": "ПП", "bank-statement": "ВИП",
    "rental-agreement": "ДОА", "sale-agreement": "ДКП", "supply-contract": "ДПС",
    "fop-service-contract": "ДФП", "discrepancy-act": "АР", other: "ДОК",
  };
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${prefixes[type] || "DOC"}-${year}-${randomNum}`;
};

export function CreateDocumentSplitView({
  cabinet,
  initialType,
  initialTemplate,
  onBack,
  onDocumentCreated,
  onNavigateToDocument,
  onChatMessage,
  onNavigateToCreateTemplate,
  parentDocument,
}: CreateDocumentSplitViewProps) {
  // State - use initialType/initialTemplate if provided
  const [documentType, setDocumentType] = useState<DocumentType>(initialType || "invoice");
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(initialTemplate || null);
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [positions, setPositions] = useState<DocumentPosition[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [positionsSheetOpen, setPositionsSheetOpen] = useState(false);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [savedDocumentNumber, setSavedDocumentNumber] = useState("");
  const [isPrintPreviewMode, setIsPrintPreviewMode] = useState(false);
  
  // Sign dialog state
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [signAndSendMode, setSignAndSendMode] = useState(false);
  
  // NEW: Pending contractor state for success dialog
  const [savedDocumentStatus, setSavedDocumentStatus] = useState<DocumentFlowStatus>("draft");
  const [pendingContractorInfo, setPendingContractorInfo] = useState<PendingContractorInfo | null>(null);
  
  // Amount calculator state
  const [vatAmount, setVatAmount] = useState(0);
  const [documentCurrency, setDocumentCurrency] = useState<"UAH" | "USD" | "EUR">("UAH");
  
  // Track previous date for auto-refresh of exchange rates
  const [previousDate, setPreviousDate] = useState<string>("");
  
  // Handle amount change from calculator
  const handleAmountChange = useCallback((total: number, vat: number, currency: "UAH" | "USD" | "EUR") => {
    setVatAmount(vat);
    setDocumentCurrency(currency);
    // Store in form values for document generation
    setFormValues(prev => ({
      ...prev,
      vatAmount: vat,
      currency: currency,
      totalWithVat: total,
    }));
  }, []);
  
  // Track if type/template came from initial setup (should be locked)
  const isTypeFromInitial = !!initialType;
  const isTemplateFromInitial = !!initialTemplate;

  // Fields that can be edited inline in Live Preview (non-obligatory fields)
  const INLINE_EDITABLE_FIELDS = [
    "paymentPurpose",
    "notes",
    "additionalTerms",
    "paymentTerms",
  ];

  // Derived data
  const contractors = useMemo(() => getContractorsForCabinet(cabinet), [cabinet]);
  const cabinetRequisites = useMemo(() => getCabinetRequisites(cabinet), [cabinet]);
  // Priority: template.fields → fallback to type schema
  const formSchema = useMemo(() => {
    // Priority 1: Fields from selected template
    if (selectedTemplate?.fields?.length) {
      return selectedTemplate.fields;
    }
    // Priority 2: Default schema for document type
    return getFormSchemaForType(documentType);
  }, [documentType, selectedTemplate]);
  const typeConfig = documentTypeConfigs[documentType];

  // Party role selection state
  const isTwoSided = typeConfig.requiresContractor;
  const [partyRole, setPartyRole] = useState<"cabinet" | "contractor" | null>(
    parentDocument ? "cabinet" : isTwoSided ? null : "cabinet"
  );

  // Remap fields based on party role selection
  const remappedFormSchema = useMemo(() => {
    if (!partyRole || partyRole === "cabinet") return formSchema;
    return formSchema.map((f: UnifiedTemplateField) => {
      if (f.source === "cabinet") {
        return { ...f, source: "contractor" as const, sourceKey: f.sourceKey?.replace(/^cabinet\./, "contractor.") };
      }
      if (f.source === "contractor") {
        return { ...f, source: "cabinet" as const, sourceKey: f.sourceKey?.replace(/^contractor\./, "cabinet.") };
      }
      return f;
    });
  }, [formSchema, partyRole]);

  // Build text for role detection from field labels
  const roleDetectionText = useMemo(() => {
    const labels = formSchema.map((f: UnifiedTemplateField) => f.label).join(" ");
    return `${typeConfig.label} ${labels}`;
  }, [formSchema, typeConfig.label]);

  const templatesForType = useMemo(() => {
    const allTemplates = [...systemTemplates, ...demoCustomTemplates];
    return allTemplates.filter((t) => t.type === documentType);
  }, [documentType]);

  // Calculate readiness
  const readiness = useMemo(
    () =>
      calculateReadiness(
        documentType,
        formValues,
        selectedContractor,
        positions,
        cabinet
      ),
    [documentType, formValues, selectedContractor, positions, cabinet]
  );

  // Total amount with currency conversion
  const positionTotals = useMemo(
    () => calculatePositionTotals(positions as ExtendedDocumentPosition[]),
    [positions]
  );
  const totalAmount = positionTotals.totalGrossUAH;

  // Get existing documents for duplicate check
  const existingDocuments = useMemo(() => {
    return getDocumentsForCabinet(cabinet);
  }, [cabinet]);

  // Validation warnings
  const { warnings, hasCritical, hasWarnings } = useDocumentValidation({
    documentType,
    contractor: selectedContractor,
    cabinet,
    amount: totalAmount,
    documentNumber: String(formValues.documentNumber || ""),
    existingDocuments: existingDocuments.map(d => ({ number: d.number, id: d.id })),
  });

  // Bidirectional sync
  const {
    highlightedCardId,
    highlightedFieldId,
    onCardClick,
    onCardHover,
    onFieldClick,
    scrollToCard,
  } = useAnchorCardSync();

  // Initialize form when type changes - use remapped schema for correct source mapping
  const initializeFormValues = useCallback(() => {
    if (!remappedFormSchema) return {};

    const values: Record<string, string | number | boolean> = {};

    remappedFormSchema.forEach((field) => {
      if (field.defaultValue !== undefined) {
        values[field.key] = field.defaultValue;
      }

      if (field.source === "cabinet" && field.sourceKey) {
        const value = mapSourceKeyToValue(field.sourceKey, cabinetRequisites);
        if (value) values[field.key] = value;
      }

      if (field.key === "documentNumber" && field.source === "computed") {
        values[field.key] = generateDocumentNumber(documentType);
      }

      if (field.key === "documentDate" && field.fieldType === "date") {
        values[field.key] = new Date().toISOString().split("T")[0];
      }
    });

    // Prefill from parent document (Scenario 3: Create linked document)
    if (parentDocument) {
      if (remappedFormSchema.some(f => f.key === 'subject')) {
        values.subject = `До ${documentTypeConfigs[parentDocument.type]?.label} №${parentDocument.number}`;
      }
      if (parentDocument.currency) {
        values.currency = parentDocument.currency;
      }
    }

    return values;
  }, [remappedFormSchema, cabinetRequisites, documentType, parentDocument]);

  useEffect(() => {
    setFormValues(initializeFormValues());
    setSelectedContractor(null);
    setPositions([]);

    // Only auto-select template if not provided from initial setup
    if (!isTemplateFromInitial && templatesForType.length > 0) {
      setSelectedTemplate(templatesForType[0]);
    } else if (!isTemplateFromInitial) {
      setSelectedTemplate(null);
    }
  }, [documentType, initializeFormValues, isTemplateFromInitial]); // eslint-disable-line

  // Re-initialize form when party role changes
  useEffect(() => {
    if (partyRole) {
      setFormValues(initializeFormValues());
    }
  }, [partyRole]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update contractor fields - use remapped schema
  useEffect(() => {
    if (!selectedContractor || !remappedFormSchema) return;

    const contractorValues = mapContractorToValues(selectedContractor);
    const updates: Record<string, string | number | boolean> = {};

    remappedFormSchema.forEach((field) => {
      if (field.source === "contractor" && field.sourceKey) {
        const value = contractorValues[field.sourceKey];
        if (value) updates[field.key] = value;
      }
    });

    if (Object.keys(updates).length > 0) {
      setFormValues((prev) => ({ ...prev, ...updates }));
    }
  }, [selectedContractor, remappedFormSchema]);

  // Prefill contractor from parent document (Scenario 3)
  useEffect(() => {
    if (!parentDocument?.contractor || selectedContractor) return;
    
    const matchingContractor = contractors.find(
      c => c.code === parentDocument.contractor?.code || c.name === parentDocument.contractor?.name
    );
    if (matchingContractor) {
      setSelectedContractor(matchingContractor);
    }
  }, [parentDocument, contractors]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh exchange rates when document date changes
  useEffect(() => {
    const currentDate = formValues.documentDate ? String(formValues.documentDate) : "";
    
    // Skip if date hasn't changed or is empty
    if (!currentDate || currentDate === previousDate) {
      return;
    }
    
    // Check if there are foreign currency positions
    const hasForeignCurrency = positions.some(pos => {
      const ext = pos as ExtendedDocumentPosition;
      return ext.currency && ext.currency !== "UAH";
    });
    
    if (!hasForeignCurrency) {
      setPreviousDate(currentDate);
      return;
    }
    
    // Update rates for all foreign currency positions
    const updateRates = async () => {
      try {
        const updatedPositions = await Promise.all(
          positions.map(async (pos) => {
            const ext = pos as ExtendedDocumentPosition;
            if (!ext.currency || ext.currency === "UAH") {
              return pos;
            }
            
            const result = await fetchNBUExchangeRate(ext.currency, currentDate);
            if (result) {
              return {
                ...pos,
                exchangeRate: result.rate,
                exchangeRateDate: result.date,
              };
            }
            return pos;
          })
        );
        
        setPositions(updatedPositions);
        toast({ 
          title: "Курси оновлено", 
          description: `Курси валют оновлено на ${currentDate}` 
        });
      } catch (error) {
        console.error("Failed to update exchange rates:", error);
      }
    };
    
    updateRates();
    setPreviousDate(currentDate);
  }, [formValues.documentDate, positions, previousDate]);

  // Handlers
  const handleTypeChange = useCallback((type: DocumentType) => {
    setDocumentType(type);
  }, []);

  const handleTemplateChange = useCallback((template: DocumentTemplate) => {
    setSelectedTemplate(template);
  }, []);

  const handleContractorChange = useCallback((contractor: Contractor) => {
    setSelectedContractor(contractor);
  }, []);

  const handleFieldChange = useCallback(
    (key: string, value: string | number | boolean) => {
      setFormValues((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handlePositionsEdit = useCallback(() => {
    setPositionsSheetOpen(true);
  }, []);

  const handleInviteSent = useCallback((email: string, name: string) => {
    const inviteId = `invite-${Date.now()}`;
    const tempContractor: Contractor = {
      id: `temp-${Date.now()}`,
      name: name,
      code: "—",
      type: "legal",
      isPending: true,
    };
    setSelectedContractor(tempContractor);
    setInviteSheetOpen(false);
    
    // Demo: simulate contractor onboarding after 30 seconds
    simulateContractorOnboarding(tempContractor.id, email, 30000);
    
    // Навігація до списку після invite
    toast({
      title: "Запрошення надіслано",
      description: `Запрошення надіслано на ${email}`,
    });
    onDocumentCreated?.();
  }, [onDocumentCreated]);

  // Handler for inline editing in Live Preview
  const handleInlineEdit = useCallback((fieldKey: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (hasCritical) {
      toast({
        title: "Помилка",
        description: "Виправте критичні помилки перед створенням документа",
        variant: "destructive",
      });
      return;
    }

    if (typeConfig.requiresContractor && !selectedContractor) {
      toast({
        title: "Помилка",
        description: "Оберіть контрагента",
        variant: "destructive",
      });
      return;
    }

    if (typeConfig.hasAmount && positions.length === 0) {
      toast({
        title: "Помилка",
        description: "Додайте хоча б одну позицію",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Check if contractor is pending
    const isPending = selectedContractor?.isPending === true;
    const newStatus: DocumentFlowStatus = isPending ? "draft-pending-contractor" : "draft";

    // Simulate saving with version v1.0
    setTimeout(() => {
      setIsSubmitting(false);
      setSavedDocumentNumber(String(formValues.documentNumber));
      setSavedDocumentStatus(newStatus);
      
      // Store pending contractor info for dialog
      if (isPending && selectedContractor) {
        setPendingContractorInfo({
          id: selectedContractor.id,
          name: selectedContractor.name,
          email: selectedContractor.email || "—",
        });
      } else {
        setPendingContractorInfo(null);
      }
      
      setSuccessDialogOpen(true);
    }, 800);
  }, [
    hasCritical,
    typeConfig,
    selectedContractor,
    positions,
    formValues.documentNumber,
  ]);

  const handleSendToContractor = useCallback(() => {
    toast({
      title: "Документ надіслано",
      description: `Запит надіслано на ${selectedContractor?.email || "контрагента"}`,
    });
    onDocumentCreated?.();
  }, [selectedContractor, onDocumentCreated]);

  const handleSign = useCallback(() => {
    setSignAndSendMode(false);
    setSignDialogOpen(true);
  }, []);

  const handleSignAndSend = useCallback(() => {
    setSignAndSendMode(true);
    setSignDialogOpen(true);
  }, []);

  const handleDocumentSigned = useCallback((doc: { id: string }, cert: KepCertificate) => {
    toast({
      title: "Документ підписано",
      description: `Підписант: ${cert.owner}`,
    });
    
    // Close sign dialog
    setSignDialogOpen(false);
    
    if (signAndSendMode && selectedContractor?.email) {
      toast({
        title: "Документ надіслано",
        description: `Надіслано на ${selectedContractor.email}`,
      });
      // Close success dialog and navigate
      setSuccessDialogOpen(false);
      onDocumentCreated?.();
    } else {
      // Close success dialog and navigate
      setSuccessDialogOpen(false);
      onDocumentCreated?.();
    }
  }, [signAndSendMode, selectedContractor, onDocumentCreated]);

  // handleViewDocument removed — fullscreen toggle is handled internally by DocumentSaveSuccessDialog

  const handleOpenInNewTab = useCallback(() => {
    if (onNavigateToDocument) {
      const docId = String(formValues.documentNumber || savedDocumentNumber);
      onNavigateToDocument(docId);
    }
  }, [formValues.documentNumber, savedDocumentNumber, onNavigateToDocument]);

  const handleGoToList = useCallback(() => {
    onDocumentCreated?.();
  }, [onDocumentCreated]);

  const handlePrintPreviewToggle = useCallback(() => {
    setIsPrintPreviewMode((prev) => !prev);
  }, []);

  // Data for print preview
  const printPreviewData = useMemo(() => {
    const formatDate = (dateStr: string) => {
      if (!dateStr) return new Date().toLocaleDateString("uk-UA");
      const date = new Date(dateStr);
      return date.toLocaleDateString("uk-UA");
    };

    return {
      type: typeConfig.label,
      number: String(formValues.documentNumber || ""),
      date: formatDate(String(formValues.documentDate || "")),
      supplier: {
        name: String(formValues.supplierName || cabinet.name || ""),
        code: String(formValues.supplierCode || ""),
      },
      buyer: {
        name: String(formValues.buyerName || selectedContractor?.name || ""),
        code: String(formValues.buyerCode || selectedContractor?.code || ""),
      },
      amount: totalAmount,
      currency: "₴",
      keyTerms: positions.length > 0 
        ? [`${positions.length} позицій на суму ${totalAmount.toLocaleString("uk-UA")} грн`]
        : undefined,
    };
  }, [formValues, typeConfig.label, cabinet.name, selectedContractor, positions, totalAmount]);

  const bodyText = useMemo(() => {
    if (positions.length === 0) {
      return "Позиції ще не додано. Додайте товари або послуги для формування документа.";
    }
    return positions
      .map((p, i) => `${i + 1}. ${p.name} — ${p.quantity} ${p.unit} × ${p.price.toLocaleString("uk-UA")} грн = ${p.amount.toLocaleString("uk-UA")} грн`)
      .join("\n");
  }, [positions]);

  // Zoom state for print preview (managed in parent for unified header)
  const [previewZoom, setPreviewZoom] = useState(100);
  const handlePreviewZoomIn = () => setPreviewZoom((prev) => Math.min(prev + 25, 200));
  const handlePreviewZoomOut = () => setPreviewZoom((prev) => Math.max(prev - 25, 50));

  return (
    <div className="flex flex-col h-full">
      {/* Unified Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 md:px-6 py-4 border-b bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={isPrintPreviewMode ? handlePrintPreviewToggle : onBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">
            {isPrintPreviewMode ? "Перегляд" : "Новий документ"}
          </h1>
          {/* Parent document context banner */}
          {!isPrintPreviewMode && parentDocument && (
            <div className="flex items-center gap-1.5 text-sm text-primary">
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-[200px] xs:max-w-[280px] sm:max-w-none">
                На основі: {documentTypeConfigs[parentDocument.type]?.label} №{parentDocument.number}
              </span>
            </div>
          )}
          {/* Contextual breadcrumb showing selected type & template */}
          {!isPrintPreviewMode && !parentDocument && (isTypeFromInitial || isTemplateFromInitial) && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-[200px] xs:max-w-[280px] sm:max-w-none">
                {typeConfig.label}
                {selectedTemplate && (
                  <span className="hidden xs:inline"> • {selectedTemplate.name}</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Change role button - only for two-sided documents when role is already selected */}
        {!isPrintPreviewMode && isTwoSided && partyRole && !parentDocument && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPartyRole(null)}
            className="gap-1.5 shrink-0 text-muted-foreground"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Змінити роль</span>
          </Button>
        )}
        
        {/* Zoom Controls - only in preview mode */}
        {isPrintPreviewMode && (
          <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/50">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePreviewZoomOut}
              disabled={previewZoom <= 50}
            >
              <span className="text-sm font-medium">−</span>
            </Button>
            <span className="text-xs font-medium w-12 text-center tabular-nums">
              {previewZoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePreviewZoomIn}
              disabled={previewZoom >= 200}
            >
              <span className="text-sm font-medium">+</span>
            </Button>
          </div>
        )}

        {/* Print Preview Toggle - only in edit mode */}
        {!isPrintPreviewMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintPreviewToggle}
            className="gap-1.5 shrink-0"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Перегляд</span>
          </Button>
        )}

        {!isPrintPreviewMode && (
          <ReadinessBreakdownPopover
            percent={readiness.percent}
            isReady={readiness.isReady}
            items={[
              { id: "type", label: "Тип документа", isComplete: !!documentType, onClick: () => onCardClick?.("type") },
              { id: "template", label: "Шаблон", isComplete: !!selectedTemplate, onClick: () => onCardClick?.("template") },
              { id: "contractor", label: "Контрагент", isComplete: !!selectedContractor, onClick: () => onCardClick?.("contractor") },
              { id: "positions", label: "Позиції", isComplete: positions.length > 0, onClick: () => setPositionsSheetOpen(true) },
              { id: "date", label: "Дата документа", isComplete: !!formValues.documentDate, onClick: () => onCardClick?.("date") },
            ]}
          >
            <Badge
              variant={readiness.isReady ? "default" : "secondary"}
              className={cn(
                "shrink-0 cursor-pointer hover:opacity-80 transition-opacity",
                readiness.isReady && "bg-success hover:bg-success/90"
              )}
            >
              {readiness.percent}% готовий
            </Badge>
          </ReadinessBreakdownPopover>
        )}
      </div>

      {/* Print Preview Mode */}
      {isPrintPreviewMode ? (
        <InlinePrintPreview
          bodyText={bodyText}
          documentData={printPreviewData}
          zoom={previewZoom}
          className="flex-1"
        />
      ) : partyRole === null ? (
        /* Party Role Selection - shown before main editor for two-sided docs */
        <PartyRoleSelector
          documentText={roleDetectionText}
          onSelect={(role) => setPartyRole(role)}
        />
      ) : (
        <>
          {/* Anchor Cards Strip */}
          <div className="shrink-0 border-b bg-muted/30">
            <AnchorCardStrip
              documentType={documentType}
              template={selectedTemplate}
              contractor={selectedContractor}
              positions={positions}
              formValues={formValues}
              readinessPercent={readiness.percent}
              cabinet={cabinet}
              onTypeChange={handleTypeChange}
              onTemplateChange={handleTemplateChange}
              onContractorChange={handleContractorChange}
              onPositionsEdit={handlePositionsEdit}
              onFieldChange={handleFieldChange}
              onInviteContractor={() => setInviteSheetOpen(true)}
              onNavigateToCreateTemplate={onNavigateToCreateTemplate}
              highlightedCardId={highlightedCardId}
              onCardClick={onCardClick}
              onCardHover={onCardHover}
              lockType={isTypeFromInitial}
              lockTemplate={isTemplateFromInitial}
              vatAmount={vatAmount}
              currency={documentCurrency}
              onAmountChange={handleAmountChange}
              scrollToCard={scrollToCard}
            />
          </div>

          {/* Warnings Banner - Enterprise-grade expandable */}
          <ValidationBanner 
            warnings={warnings}
            onCardClick={onCardClick}
          />

          {/* Live Preview */}
          <div className="flex-1 min-h-0">
            <DocumentLivePreview
              documentType={documentType}
              template={selectedTemplate}
              formValues={formValues}
              positions={positions}
              cabinet={cabinet}
              contractor={selectedContractor}
              highlightedFieldId={highlightedFieldId}
              onFieldClick={onFieldClick}
              editableFields={INLINE_EDITABLE_FIELDS}
              onInlineEdit={handleInlineEdit}
              showZoomControls={false}
              className="h-full"
            />
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 px-4 md:px-6 py-3 border-t bg-background pb-safe">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || hasCritical || !readiness.isReady}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              {isSubmitting ? "Збереження..." : "Зберегти"}
            </Button>
          </div>
        </>
      )}

      {/* Sheets */}
      <PositionsSheet
        open={positionsSheetOpen}
        onOpenChange={setPositionsSheetOpen}
        positions={positions}
        onPositionsChange={setPositions}
        cabinet={cabinet}
        documentDate={formValues.documentDate ? String(formValues.documentDate) : ""}
      />

      <InviteContractorSheet
        open={inviteSheetOpen}
        onOpenChange={setInviteSheetOpen}
        onInviteSent={handleInviteSent}
      />

      {/* Success Dialog with versioning, preview, signing, and pending contractor support */}
      <DocumentSaveSuccessDialog
        open={successDialogOpen}
        onOpenChange={setSuccessDialogOpen}
        documentNumber={savedDocumentNumber}
        documentType={typeConfig.label}
        version="v1.0"
        contractor={selectedContractor}
        isPendingContractor={savedDocumentStatus === "draft-pending-contractor"}
        pendingContractorInfo={pendingContractorInfo}
        documentPreviewData={{
          bodyText,
          documentData: printPreviewData,
        }}
        onSendToContractor={handleSendToContractor}
        onSign={handleSign}
        onSignAndSend={handleSignAndSend}
        onDownloadPDF={() => {}}
        onGoToList={handleGoToList}
        onInviteAndSend={() => {
          setSuccessDialogOpen(false);
          setInviteSheetOpen(true);
        }}
      />

      {/* Sign Document Dialog */}
      <SignDocumentDialog
        cabinet={cabinet}
        document={{
          id: savedDocumentNumber || String(formValues.documentNumber),
          type: typeConfig.label,
          number: String(formValues.documentNumber),
          date: String(formValues.documentDate) || new Date().toISOString().split('T')[0],
          status: "draft",
          contractor: selectedContractor ? {
            id: selectedContractor.id,
            name: selectedContractor.name,
            code: selectedContractor.code,
          } : undefined,
          amount: totalAmount,
        }}
        open={signDialogOpen}
        onOpenChange={setSignDialogOpen}
        onDocumentSigned={handleDocumentSigned}
      />
    </div>
  );
}
