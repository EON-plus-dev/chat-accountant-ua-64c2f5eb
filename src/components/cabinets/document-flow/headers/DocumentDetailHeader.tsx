/**
 * ============================================
 * УНІВЕРСАЛЬНИЙ ХЕДЕР КАРТКИ ДОКУМЕНТА
 * ============================================
 * 
 * Цей хедер використовується для ВСІХ типів документів:
 * - Договори, рахунки, акти, накладні
 * - Податкові накладні, ПРРО-чеки
 * - Кадрові накази, внутрішні документи
 * 
 * Структура хедера (Desktop):
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ [ЛІВА ЗОНА]                              │ [ПРАВА ЗОНА]        │
 * │ Назад + Тип + НОМЕР (заголовок)          │ Статус + Атрибути   │
 * │ Кабінет·Контрагент                       │ + Дії               │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * ПРИМІТКА: Lifecycle Stepper перенесено в DocumentPassportBlock
 * 
 * Дані беруться з розширеної моделі Document v2.0
 * 
 * Data-атрибути для чат-оркестратора:
 * - data-section="document-header"
 * - data-action="sign" | "send" | "process-accounting" | "discrepancy"
 * ============================================
 */

import { ArrowLeft, Copy, Lock, Pencil, Save, X, MoreHorizontal, FileText, Download, FolderPlus, Trash2, UserPlus, CreditCard, FileEdit, CheckCircle2, AlertTriangle, FileX, History } from "lucide-react";
import { useBackTrail } from "@/hooks/useBackTrail";
import { isIncomingDocument } from "@/config/documentFlowConfig";
import { canCreateChildDocument } from "../template-selector/TemplateMasterList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  type Document,
  type DocumentFlowStatus,
  documentTypeConfigs,
  detectDocumentIssues,
  documentIssueTypeConfig,
} from "@/config/documentFlowConfig";
import { getBusinessStatusForDocument } from "@/config/businessStatusConfig";
import { RetentionCountdown } from "../RetentionCountdown";
import { type RetentionCategory } from "@/config/complianceConfig";
import type { CabinetType } from "@/types/cabinet";

interface DocumentDetailHeaderProps {
  document: Document;
  isEditing: boolean;
  isOperationalEditing?: boolean;
  isContentEditing?: boolean;
  canEdit: boolean;
  canEditOperational?: boolean;
  canEditContent?: boolean;
  isLocked: boolean;
  isMobile?: boolean;
  contractorName?: string;
  cabinetType?: CabinetType;
  onBack: () => void;
  onStartEdit: () => void;
  onStartOperationalEdit?: () => void;
  onStartContentEdit?: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onSign?: () => void;
  onSend?: () => void;
  onCreateFromThis?: () => void;
  onDelete?: () => void;
  onInviteContractor?: () => void;
  onCreatePayment?: () => void;
  onAddToAuditPack?: () => void;
  onContractorClick?: () => void;
  onOpenDiscrepancy?: () => void;
  onNavigateToHistory?: () => void;
  className?: string;
}

export const DocumentDetailHeader = ({
  document,
  isEditing,
  isOperationalEditing,
  isContentEditing,
  canEdit,
  canEditOperational = true,
  canEditContent = true,
  isLocked,
  isMobile = false,
  contractorName,
  cabinetType,
  onBack,
  onStartEdit,
  onStartOperationalEdit,
  onStartContentEdit,
  onCancelEdit,
  onSaveEdit,
  onSign,
  onSend,
  onCreateFromThis,
  onDelete,
  onInviteContractor,
  onCreatePayment,
  onAddToAuditPack,
  onContractorClick,
  onOpenDiscrepancy,
  onNavigateToHistory,
  className,
}: DocumentDetailHeaderProps) => {
  const typeConfig = documentTypeConfigs[document.type];
  const businessStatus = getBusinessStatusForDocument(document, cabinetType);
  const TypeIcon = typeConfig.icon;
  const StatusIcon = businessStatus.icon;
  const detectedIssues = detectDocumentIssues(document);
  const isDraft = document.status === "draft";

  // Safe back navigation: пріоритет — back-trail з URL, потім onBack, потім history.
  const { trail, goBack: goBackTrail } = useBackTrail();
  const handleBack = () => {
    if (trail) {
      goBackTrail();
    } else if (onBack) {
      onBack();
    } else {
      console.warn('DocumentDetailHeader: onBack prop is not defined, using history.back()');
      // eslint-disable-next-line lovable-nav/no-untrailed-navigate
      window.history.back();
    }
  };

  // Determine if "Create Discrepancy Act" should be shown
  const canCreateDiscrepancy = 
    ["contract", "invoice", "act", "supply-contract", "rental-agreement"].includes(document.type) &&
    ["sent", "confirmed", "signed", "pending-sign"].includes(document.status) &&
    isIncomingDocument(document);

  // Determine if "Create Payment" should be shown
  const canCreatePaymentTypes = ["invoice", "act"];
  const showCreatePayment = canCreatePaymentTypes.includes(document.type) && 
    ["signed", "sent", "confirmed"].includes(document.status);

  // Document health status - single indicator instead of separate badges
  const getDocumentHealthStatus = () => {
    const hasCritical = detectedIssues.some(issue => 
      documentIssueTypeConfig[issue]?.priority === 1
    );
    
    if (hasCritical) return { icon: AlertTriangle, variant: "destructive" as const, label: "Критично" };
    if (detectedIssues.length > 0) return { icon: AlertTriangle, variant: "warning" as const, label: "Увага" };
    return { icon: CheckCircle2, variant: "success" as const, label: "OK" };
  };

  const healthStatus = getDocumentHealthStatus();

  // Map document type to retention category
  const getRetentionCategory = (docType: string): RetentionCategory => {
    if (["employment-order", "vacation-order", "dismissal-order"].includes(docType)) {
      return "hr";
    }
    if (["contract", "supply-contract", "rental-agreement", "power-of-attorney"].includes(docType)) {
      return "legal";
    }
    if (["tax-invoice", "prro-receipt"].includes(docType)) {
      return "tax";
    }
    return "accounting";
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(document.number);
    toast({
      title: "Скопійовано",
      description: "Номер документа скопійовано в буфер обміну",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Експорт PDF",
      description: "Документ експортовано (демо)",
    });
  };

  const handleAddToAuditPackage = () => {
    toast({
      title: "Додано до пакету",
      description: "Документ додано до пакету перевірки (демо)",
    });
  };

  // Get primary action based on status with data-action for chat orchestrator
  const getPrimaryAction = (): { label: string; action: (() => void) | undefined; dataAction: string } | null => {
    // Check for disputed status first
    if (document.status === "disputed" || document.status === "discrepancy-pending") {
      return {
        label: "Сформувати акт розбіжностей",
        action: onOpenDiscrepancy,
        dataAction: "discrepancy"
      };
    }
    
    switch (document.status) {
      case "draft":
        return { label: "Підготувати до підпису", action: onSign, dataAction: "prepare-sign" };
      case "pending-sign":
        return { label: "Підписати КЕП", action: onSign, dataAction: "sign" };
      case "signed":
        return { label: "Надіслати", action: onSend, dataAction: "send" };
      case "sent":
        return { 
          label: "Провести в обліку", 
          action: () => toast({ title: "Проведено", description: "Документ проведено в обліку (демо)" }),
          dataAction: "process-accounting"
        };
      case "confirmed":
      case "registered":
        return { label: "Експорт PDF", action: handleExportPDF, dataAction: "export-pdf" };
      case "archived":
        return { label: "Створити на основі", action: onCreateFromThis, dataAction: "create-from" };
      default:
        return null;
    }
  };

  // Get contractor display name from parties or legacy contractor field
  const getContractorDisplayName = (): string | null => {
    // Try to get from parties array (v2.0)
    if (document.parties && document.parties.length > 0) {
      const counterparty = document.parties.find(p => p.role === "counterparty");
      if (counterparty) return counterparty.name;
    }
    // Fallback to legacy contractor field
    if (document.contractor?.name) return document.contractor.name;
    if (contractorName) return contractorName;
    return null;
  };

  const contractorDisplayName = getContractorDisplayName();
  const cabinetDisplayName = document.cabinetName || "Мій кабінет";

  const primaryAction = getPrimaryAction();

  // ============================================
  // MOBILE HEADER - SINGLE ROW (Consistent with Desktop)
  // ============================================
  if (isMobile) {
    return (
      <div 
        className={cn("border-b bg-card sticky top-0 z-10", className)}
        data-section="document-header"
      >
        {/* Single row: Back + Number + Status + Menu */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack} 
            className="shrink-0 h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          {/* Document number with type icon */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <TypeIcon className="w-4 h-4 shrink-0 text-primary" />
            <span className="font-semibold text-sm truncate">{document.number}</span>
          </div>
          
          {/* Status Badge - compact */}
          <Badge 
            variant="outline" 
            className={cn("shrink-0 text-xs h-6", businessStatus.color)}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {businessStatus.label}
          </Badge>
          
          {/* Actions */}
          {isEditing ? (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={onCancelEdit} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
              <Button size="icon" onClick={onSaveEdit} className="h-8 w-8">
                <Save className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Primary action at top of menu */}
                {primaryAction && (
                  <>
                    <DropdownMenuItem 
                      onClick={primaryAction.action}
                      className="font-medium text-primary"
                      data-action={primaryAction.dataAction}
                    >
                      {primaryAction.label}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {canEdit && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Pencil className="w-4 h-4 mr-2" />
                      Редагувати
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {canEditOperational && (
                        <DropdownMenuItem onClick={onStartOperationalEdit || onStartEdit}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Редагувати деталі
                        </DropdownMenuItem>
                      )}
                      {canEditContent && (
                        <DropdownMenuItem onClick={onStartContentEdit || onStartEdit}>
                          <FileEdit className="w-4 h-4 mr-2" />
                          Редагувати документ
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                <DropdownMenuItem onClick={onInviteContractor}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Запросити контрагента
                </DropdownMenuItem>
                {showCreatePayment && (
                  <DropdownMenuItem onClick={onCreatePayment}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Створити платіж
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onAddToAuditPack || handleAddToAuditPackage}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Додати до пакету
                </DropdownMenuItem>
                {canCreateDiscrepancy && onOpenDiscrepancy && (
                  <DropdownMenuItem onClick={onOpenDiscrepancy} className="text-orange-600">
                    <FileX className="w-4 h-4 mr-2" />
                    Не погоджуюсь (акт розбіжностей)
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {canCreateChildDocument(document.type) && (
                  <DropdownMenuItem onClick={onCreateFromThis}>
                    <FileText className="w-4 h-4 mr-2" />
                    Створити на основі
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Експорт PDF
                </DropdownMenuItem>
                {isDraft && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Видалити
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // DESKTOP HEADER - 3 ZONE LAYOUT
  // ============================================
  return (
    <div 
      className={cn("border-b bg-card sticky top-0 z-10", className)}
      data-section="document-header"
    >
      {/* Row 1: 3-zone layout */}
      <div className="flex items-center gap-4 px-6 py-3">
        
        {/* === LEFT ZONE: Back + Type + Number (as title) + Subtitle === */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack} 
            className="shrink-0 h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <TypeIcon className="w-5 h-5 text-primary shrink-0" />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 group">
              <span className="font-semibold text-lg truncate">{document.number}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={handleCopyNumber}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* === CENTER ZONE: Removed - Lifecycle Stepper moved to DocumentPassportBlock === */}
        
        {/* === RIGHT ZONE: Status Badge + Attributes + Actions === */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status Badge - always visible */}
          <Badge 
            variant="outline" 
            className={cn("shrink-0", businessStatus.color)}
          >
            <StatusIcon className="w-3.5 h-3.5 mr-1" />
            {businessStatus.label}
          </Badge>
          
          {/* Version Badge - clickable to navigate to history */}
          {document.version && document.version > 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="secondary" 
                    className="shrink-0 cursor-pointer hover:bg-muted gap-1"
                    onClick={() => onNavigateToHistory?.()}
                  >
                    <History className="w-3 h-3" />
                    v{document.version}
                    {document.history && document.history.length > 0 && (
                      <span className="text-muted-foreground ml-0.5">
                        • {document.history.length}
                      </span>
                    )}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Натисніть для перегляду історії версій</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={onCancelEdit} className="gap-1.5">
                <X className="w-4 h-4" />
                Скасувати
              </Button>
              <Button size="sm" onClick={onSaveEdit} className="gap-1.5">
                <Save className="w-4 h-4" />
                Зберегти
              </Button>
            </>
          ) : (
            <>
              {isLocked && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" disabled>
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Документ заблоковано для редагування</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {/* Secondary Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Edit Actions - Submenu */}
                  {canEdit && (
                    <>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Pencil className="w-4 h-4 mr-2" />
                          Редагувати
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {canEditOperational && (
                            <DropdownMenuItem onClick={onStartOperationalEdit || onStartEdit}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Редагувати деталі
                            </DropdownMenuItem>
                          )}
                          {canEditContent && (
                            <DropdownMenuItem onClick={onStartContentEdit || onStartEdit}>
                              <FileEdit className="w-4 h-4 mr-2" />
                              Редагувати документ
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {/* Quick Actions */}
                  <DropdownMenuItem onClick={onInviteContractor}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {contractorName ? `Запросити ${contractorName}` : "Запросити контрагента"}
                  </DropdownMenuItem>
                  {showCreatePayment && (
                    <DropdownMenuItem onClick={onCreatePayment}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Створити платіж
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onAddToAuditPack || handleAddToAuditPackage}>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Додати до пакету
                  </DropdownMenuItem>
                  {canCreateDiscrepancy && onOpenDiscrepancy && (
                    <DropdownMenuItem onClick={onOpenDiscrepancy} className="text-orange-600">
                      <FileX className="w-4 h-4 mr-2" />
                      Не погоджуюсь (акт розбіжностей)
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {/* Document Actions */}
                  {canCreateChildDocument(document.type) && (
                    <DropdownMenuItem onClick={onCreateFromThis}>
                      <FileText className="w-4 h-4 mr-2" />
                      Створити на основі
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Експорт PDF
                  </DropdownMenuItem>
                  {isDraft && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Видалити
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Primary Action Button */}
              {primaryAction && (
                <Button 
                  onClick={primaryAction.action} 
                  className="gap-2"
                  data-action={primaryAction.dataAction}
                >
                  {primaryAction.label}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
