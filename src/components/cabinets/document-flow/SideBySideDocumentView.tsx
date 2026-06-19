import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, ShieldCheck, FileSearch, AlertTriangle, Eye, FileCheck, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { EnhancedDocumentViewer } from './EnhancedDocumentViewer';
import { FieldConfidenceBreakdown } from './cards/FieldConfidenceBreakdown';
import { VerificationProgress } from './VerificationProgress';
import type { DocumentSummary, ContractSummary, FieldConfidence } from '@/types/documentSummary';
import type { Document as FlowDocument, DocumentFlowStatus } from '@/config/documentFlowConfig';
import { getBusinessStatus } from '@/config/businessStatusConfig';

// Side-by-Side viewing modes based on document status
type SideBySideMode = 'verification' | 'review' | 'audit';

const getSideBySideMode = (status: DocumentFlowStatus): SideBySideMode => {
  const verificationStatuses: DocumentFlowStatus[] = ['draft'];
  const reviewStatuses: DocumentFlowStatus[] = ['pending-sign'];
  
  if (verificationStatuses.includes(status)) return 'verification';
  if (reviewStatuses.includes(status)) return 'review';
  return 'audit';
};

// Header configuration per mode
const headerConfig = {
  verification: {
    icon: ShieldCheck,
    title: "Верифікація AI-даних",
    subtitle: "Клікніть поле → підтвердіть або оскаржте",
    iconColor: "text-primary",
    badgeVariant: "secondary" as const,
  },
  review: {
    icon: Eye,
    title: "Фінальний перегляд",
    subtitle: "Перевірте дані перед підписанням",
    iconColor: "text-amber-600",
    badgeVariant: "secondary" as const,
  },
  audit: {
    icon: FileCheck,
    title: "Перегляд документа",
    subtitle: "Документ зафіксовано — тільки перегляд",
    iconColor: "text-emerald-600",
    badgeVariant: "outline" as const,
  },
};

interface SideBySideDocumentViewProps {
  document: FlowDocument;
  summary?: DocumentSummary | ContractSummary;
  cabinetName: string;
  cabinetTaxId: string;
  highlightedField?: FieldConfidence | null;
  onFieldClick?: (field: FieldConfidence) => void;
  onFieldValueUpdate?: (fieldName: string, newValue: string) => void;
  onClose: () => void;
  className?: string;
}

export const SideBySideDocumentView = ({
  document,
  summary,
  cabinetName,
  cabinetTaxId,
  highlightedField: externalHighlightedField,
  onFieldClick,
  onFieldValueUpdate,
  onClose,
  className,
}: SideBySideDocumentViewProps) => {
  const [zoom, setZoom] = useState(75);
  const [internalHighlightedField, setInternalHighlightedField] = useState<FieldConfidence | null>(null);
  const [hoveredField, setHoveredField] = useState<FieldConfidence | null>(null);
  
  // Human-in-the-loop verification state
  const [confirmedFields, setConfirmedFields] = useState<Set<string>>(new Set());
  const [disputedFields, setDisputedFields] = useState<Set<string>>(new Set());
  
  // Determine mode based on document status
  const mode = getSideBySideMode(document.status);
  const config = headerConfig[mode];
  const HeaderIcon = config.icon;
  
  // Get business status for display
  const businessStatus = getBusinessStatus(document);
  
  // Use external highlighted field if provided, otherwise use internal state
  const highlightedField = externalHighlightedField ?? internalHighlightedField;

  const handleFieldClick = (field: FieldConfidence) => {
    setInternalHighlightedField(field);
    onFieldClick?.(field);
  };

  const handleSelectAlternative = (fieldName: string, newValue: string) => {
    onFieldValueUpdate?.(fieldName, newValue);
  };

  const handleConfirmField = (fieldName: string) => {
    setConfirmedFields(prev => new Set([...prev, fieldName]));
    setDisputedFields(prev => {
      const next = new Set(prev);
      next.delete(fieldName);
      return next;
    });
  };

  const handleDisputeField = (fieldName: string) => {
    setDisputedFields(prev => new Set([...prev, fieldName]));
    setConfirmedFields(prev => {
      const next = new Set(prev);
      next.delete(fieldName);
      return next;
    });
  };

  // Build document data for viewer
  const documentData = {
    type: document.type,
    number: document.number,
    date: document.date,
    supplier: {
      name: cabinetName,
      code: cabinetTaxId,
    },
    buyer: {
      name: document.contractor?.name || '',
      code: document.contractor?.code || '',
    },
    amount: document.amount,
    currency: document.currency,
    keyTerms: summary && 'keyTerms' in summary ? (summary as any).keyTerms : undefined,
  };

  const fieldConfidences = summary?.fieldConfidences || [];
  const needsReviewCount = fieldConfidences.filter(f => f.needsReview || f.confidence < 80).length;
  
  // Check if highlighted field has no bounding box
  const highlightHasNoBoundingBox = highlightedField && !highlightedField.boundingBox;

  // Section title based on mode
  const getSectionTitle = () => {
    switch (mode) {
      case 'verification':
        return 'Поля для верифікації';
      case 'review':
        return 'Дані документа';
      case 'audit':
        return 'Зафіксовані дані';
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header - Adaptive based on mode */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-3">
          <HeaderIcon className={cn("w-5 h-5", config.iconColor)} />
          <div>
            <h2 className="font-semibold text-sm">{config.title}</h2>
            <p className="text-xs text-muted-foreground">
              {document.number} · {config.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {fieldConfidences.length > 0 && mode === 'verification' && (
            <Badge variant={config.badgeVariant} className="text-xs">
              {confirmedFields.size + disputedFields.size}/{fieldConfidences.length} перевірено
            </Badge>
          )}
          {mode === 'audit' && (
            <Badge variant="outline" className="text-xs gap-1">
              <Lock className="w-3 h-3" />
              {businessStatus.label}
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Resizable Panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Document Viewer */}
        <ResizablePanel defaultSize={55} minSize={40}>
          <EnhancedDocumentViewer
            documentData={documentData}
            highlightedField={highlightedField}
            hoveredField={hoveredField}
            zoom={zoom}
            onZoomChange={setZoom}
            showToolbar={true}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border" />

        {/* Right Panel - Mode-adaptive content */}
        <ResizablePanel defaultSize={45} minSize={30}>
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Verification Progress - ONLY in verification mode */}
              {mode === 'verification' && fieldConfidences.length > 0 && (
                <VerificationProgress
                  confirmedCount={confirmedFields.size}
                  disputedCount={disputedFields.size}
                  totalCount={fieldConfidences.length}
                />
              )}

              {/* Review mode warning banner */}
              {mode === 'review' && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Документ очікує підпису
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                      Перевірте всі поля перед підписанням. Зміни після підпису будуть неможливі.
                    </p>
                  </div>
                </div>
              )}

              {/* Audit mode info banner */}
              {mode === 'audit' && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <Lock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Документ зафіксовано
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Статус "{businessStatus.label}" — зміни заблоковано. Ви можете переглянути витягнуті дані.
                    </p>
                  </div>
                </div>
              )}

              {/* Missing bounding box fallback message */}
              {highlightHasNoBoundingBox && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-amber-700 dark:text-amber-400">
                      Координати недоступні
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                      Поле "{highlightedField?.fieldLabel}" — знайдіть значення "{highlightedField?.value}" вручну в документі.
                    </p>
                  </div>
                </div>
              )}

              {/* Field Confidence Breakdown with mode-based rendering */}
              {fieldConfidences.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {getSectionTitle()}
                    </h4>
                    {mode === 'verification' && needsReviewCount > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                        {needsReviewCount} потребує уваги
                      </Badge>
                    )}
                    {mode === 'audit' && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {fieldConfidences.length} полів
                      </Badge>
                    )}
                  </div>
                  
                  <FieldConfidenceBreakdown
                    fields={fieldConfidences}
                    mode={mode}
                    onSelectAlternative={mode !== 'audit' ? handleSelectAlternative : undefined}
                    onFieldClick={handleFieldClick}
                    onFieldHover={setHoveredField}
                    onConfirmField={mode === 'verification' ? handleConfirmField : undefined}
                    onDisputeField={mode === 'verification' ? handleDisputeField : undefined}
                    confirmedFields={confirmedFields}
                    disputedFields={disputedFields}
                    className="border rounded-lg"
                  />

                  {highlightedField && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs text-primary">
                        Виділено: {highlightedField.fieldLabel}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto h-6 text-xs"
                        onClick={() => setInternalHighlightedField(null)}
                      >
                        Зняти
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <FileSearch className="w-10 h-10 mb-3 opacity-50" />
                  <p className="text-sm font-medium">Немає полів для перегляду</p>
                  <p className="text-xs mt-1">AI-витягування не знайшло структурованих даних</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
