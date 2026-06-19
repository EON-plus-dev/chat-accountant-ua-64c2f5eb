import { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from "react";
import { useBackTrail } from "@/hooks/useBackTrail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UnsavedChangesDialog } from "@/components/ui/unsaved-changes-dialog";
import {
  ArrowLeft, 
  FileText, 
  Copy, 
  Trash2, 
  Calendar,
  Edit,
  Sparkles,
  History,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Cabinet } from "@/types/cabinet";
import type { DocumentTemplate, DemoDocumentText } from "@/config/documentTemplatesConfig";
import { getTemplateById, demoDocumentTexts } from "@/config/documentTemplatesConfig";
import { 
  getFormSchemaForType, 
  type FormField, 
  type FieldGroup 
} from "@/config/documentFormSchemas";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TemplateViewerTab } from "./tabs/TemplateViewerTab";
import { TemplateJournalTab } from "./tabs/TemplateJournalTab";
import { TemplateOverviewTab } from "./tabs/TemplateOverviewTab";
import type { UnifiedTemplateField } from "@/types/templateField";
import { formFieldToUnified, inferGroupFromKey } from "@/types/templateField";
import { useIsMobile } from "@/hooks/use-mobile";

interface TemplateDetailPageProps {
  templateId: string;
  cabinet: Cabinet;
  onBack: () => void;
  onNavigateToTest?: () => void;
}


// Demo template text for preview
const getDemoTemplateText = (type: string): string => {
  const templates: Record<string, string> = {
    invoice: `РАХУНОК № [Номер рахунку]
від [Дата]

Постачальник: [Постачальник]
ЄДРПОУ: [ЄДРПОУ постачальника]
ІПН: [ІПН постачальника]
Адреса: [Адреса постачальника]
р/р [IBAN постачальника] в [Банк постачальника]

Покупець: [Покупець]
ЄДРПОУ: [ЄДРПОУ покупця]
Адреса: [Адреса покупця]

Оплатити до: [Дата оплати]

Позиції:
[Таблиця позицій]

Всього: [Сума без ПДВ] грн
ПДВ 20%: [Сума ПДВ] грн
Разом до сплати: [Загальна сума] грн

[Сума прописом]

Підпис: _____________ [ПІБ підписанта]`,
    
    act: `АКТ № [Номер акту]
виконаних робіт (наданих послуг)
від [Дата]

Виконавець: [Виконавець]
ЄДРПОУ: [ЄДРПОУ виконавця]

Замовник: [Замовник]
ЄДРПОУ: [ЄДРПОУ замовника]

На підставі: [Підстава]

Виконані роботи:
[Таблиця робіт]

Загальна вартість: [Загальна сума] грн
[Сума прописом]

Роботи виконані в повному обсязі та в строк.
Претензій до якості немає.

Виконавець: _____________ [ПІБ виконавця]
Замовник: _____________ [ПІБ замовника]`,

    contract: `ДОГОВІР № [Номер договору]
про надання послуг

м. [Місто]                                                                              [Дата]

[Виконавець], в особі [Посада виконавця] [ПІБ виконавця], що діє на підставі [Підстава], надалі – Виконавець, з однієї сторони, та

[Замовник], в особі [Посада замовника] [ПІБ замовника], що діє на підставі [Підстава замовника], надалі – Замовник, з іншої сторони,

уклали цей Договір про наступне:

1. ПРЕДМЕТ ДОГОВОРУ
1.1. Виконавець зобов'язується надати Замовнику послуги: [Предмет договору]
1.2. Строк надання послуг: [Строк виконання]

2. ВАРТІСТЬ ПОСЛУГ
2.1. Вартість послуг становить: [Вартість] грн
2.2. Спосіб оплати: [Умови оплати]

3. РЕКВІЗИТИ СТОРІН

Виконавець:                                    Замовник:
[Реквізити виконавця]                        [Реквізити замовника]

_____________ [Підпис виконавця]           _____________ [Підпис замовника]`,
  };
  
  return templates[type] || templates.invoice;
};

// Tabs definition
const tabs = [
  { id: "overview", label: "Огляд", icon: Sparkles },
  { id: "template", label: "Шаблон", icon: FileText },
  { id: "journal", label: "Журнал", icon: History },
];

export const TemplateDetailPage = ({ 
  templateId, 
  cabinet, 
  onBack,
  onNavigateToTest,
}: TemplateDetailPageProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Template viewer state
  const [mode, setMode] = useState<"view" | "edit">("view");
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [highlightedFieldKey, setHighlightedFieldKey] = useState<string | null>(null);
  
  // Tab change guard state
  const [pendingTabChange, setPendingTabChange] = useState<string | null>(null);
  const [showUnsavedTabDialog, setShowUnsavedTabDialog] = useState(false);
  
  // Ref for tab auto-centering
  const desktopTabNavRef = useRef<HTMLElement>(null);
  const mobileTabNavRef = useRef<HTMLElement>(null);
  
  // Find template using centralized access
  const template = getTemplateById(templateId);
  const formSchema = template?.fields?.length ? template.fields : (template ? getFormSchemaForType(template.type) : null);
  
  // Convert FormField[] to UnifiedTemplateField[]
  const [fields, setFields] = useState<UnifiedTemplateField[]>([]);
  const [documentText, setDocumentText] = useState("");
  
  // Derive values from template (safe even if template is null)
  const TemplateIcon = template?.icon || FileText;
  const canEdit = template?.category === "custom";
  
  // ============================================================================
  // ALL CALLBACKS DEFINED HERE (before any early returns)
  // ============================================================================
  
  const handleDuplicate = useCallback(() => {
    toast({
      title: "Демо-режим",
      description: "Дублювання шаблону буде доступне після запуску",
    });
  }, [toast]);

  const handleDelete = useCallback(() => {
    toast({
      title: "Демо-режим",
      description: "Видалення шаблону буде доступне після запуску",
    });
  }, [toast]);
  
  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(templateId);
    toast({
      title: "Скопійовано",
      description: "ID шаблону скопійовано в буфер обміну",
    });
  }, [templateId, toast]);
  
  const handleSave = useCallback(() => {
    setHasUnsavedChanges(false);
    toast({
      title: "Збережено",
      description: "Зміни успішно збережено",
    });
  }, [toast]);
  
  const handleCancel = useCallback(() => {
    // Reset changes
    if (formSchema) {
      const unifiedFields = formSchema.map(formFieldToUnified);
      setFields(unifiedFields);
    }
    if (template) {
      setDocumentText(getDemoTemplateText(template.type));
    }
    setHasUnsavedChanges(false);
    setMode("view");
  }, [formSchema, template]);
  
  // Tab change guard
  const handleTabChange = useCallback((newTab: string) => {
    // Guard: if on template tab with unsaved changes in edit mode
    if (activeTab === "template" && hasUnsavedChanges && mode === "edit") {
      setPendingTabChange(newTab);
      setShowUnsavedTabDialog(true);
    } else {
      setActiveTab(newTab);
    }
  }, [activeTab, hasUnsavedChanges, mode]);
  
  // Dialog handlers
  const handleSaveAndSwitchTab = useCallback(() => {
    handleSave();
    setActiveTab(pendingTabChange || activeTab);
    setShowUnsavedTabDialog(false);
    setPendingTabChange(null);
  }, [handleSave, pendingTabChange, activeTab]);
  
  const handleDiscardAndSwitchTab = useCallback(() => {
    handleCancel();
    setActiveTab(pendingTabChange || activeTab);
    setShowUnsavedTabDialog(false);
    setPendingTabChange(null);
  }, [handleCancel, pendingTabChange, activeTab]);
  
  const handleCancelTabSwitch = useCallback(() => {
    setShowUnsavedTabDialog(false);
    setPendingTabChange(null);
  }, []);
  
  // Safe back navigation: пріоритет — back-trail з URL, потім onBack, потім history.
  const { trail, goBack: goBackTrail } = useBackTrail();
  const handleBack = useCallback(() => {
    if (trail) {
      goBackTrail();
    } else if (onBack) {
      onBack();
    } else {
      // Fallback крайнього випадку — попередні два кейси покривають 99% сценаріїв.
      // eslint-disable-next-line lovable-nav/no-untrailed-navigate
      window.history.back();
    }
  }, [trail, goBackTrail, onBack]);
  
  // ============================================================================
  // ALL EFFECTS DEFINED HERE (before any early returns)
  // ============================================================================
  
  // Initialize fields from form schema and sync positions from document text
  useEffect(() => {
    if (formSchema && template) {
      // First try to find demo text by template ID or name
      const demoText = demoDocumentTexts.find(d => 
        d.id === template.id || 
        d.id === `${template.id}-text` ||
        d.name === template.name
      );
      
      // Use demo text if found, otherwise fallback to type-based template
      const text = demoText?.text || getDemoTemplateText(template.type);
      
      // If demoText has detectedFields, use them for richer field metadata
      let unifiedFields: UnifiedTemplateField[];
      if (demoText?.detectedFields && demoText.detectedFields.length > 0) {
        unifiedFields = demoText.detectedFields.map((f, idx) => ({
          key: f.key,
          label: f.label,
          fieldType: f.dataType === "date" ? "date" : "text",
          dataType: f.dataType,
          required: false,
          source: f.source,
          sourceKey: f.sourceKey,
          group: inferGroupFromKey(f.key) as FieldGroup,
          order: idx + 1,
          aiHint: f.aiHint,
          position: f.position,
          originalText: f.originalText,
        }));
      } else {
        unifiedFields = formSchema.map(formFieldToUnified);
      }
      
      // Parse text for [placeholder] positions if not from demoText
      if (!demoText?.detectedFields) {
        const fieldPattern = /\[([^\]]+)\]/g;
        const positions = new Map<string, { start: number; end: number }>();
        let match;
        while ((match = fieldPattern.exec(text)) !== null) {
          positions.set(match[1], { start: match.index, end: match.index + match[0].length });
        }
        
        // Sync field positions with text placeholders
        unifiedFields = unifiedFields.map(field => {
          const pos = positions.get(field.label);
          return pos 
            ? { ...field, position: pos, originalText: `[${field.label}]` } 
            : field;
        });
      }
      
      setFields(unifiedFields);
      setDocumentText(text);
    }
  }, [formSchema, template]);
  
  // Keyboard shortcuts (Alt+1-3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          handleTabChange(tabs[tabIndex].id);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTabChange]);
  
  // Auto-center active tab
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
  
  // ============================================================================
  // EARLY RETURN FOR NOT FOUND
  // ============================================================================
  
  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FileText className="h-12 w-12 mb-4 opacity-50" />
        <p>Шаблон не знайдено</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Повернутися
        </Button>
      </div>
    );
  }
  
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  // Render tab navigation (shared between mobile and desktop)
  const renderTabNav = (navRef: React.RefObject<HTMLElement>) => (
    <div className="bg-subtab-shelf border-b border-border relative shrink-0">
      {/* Left fade mask */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-subtab-shelf to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />
      {/* Right fade mask */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-subtab-shelf to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />
      
      <ScrollArea className="w-full" scrollbarVariant="hidden" orientation="horizontal" viewportClassName="scroll-px-4">
        <nav 
          ref={navRef as React.RefObject<HTMLElement>}
          className="inline-flex items-center gap-1.5 w-max py-2" 
          role="tablist" 
          aria-label="Розділи шаблону"
        >
          <span aria-hidden="true" className="w-6 shrink-0" />
          {tabs.map((tab, index) => {
            const TabIcon = tab.icon;
            const isActive = tab.id === activeTab;
            
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                data-tab-id={tab.id}
                aria-selected={isActive}
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
                <TabIcon className={cn("h-4 w-4", isActive && "text-primary")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <span aria-hidden="true" className="w-6 shrink-0" />
        </nav>
        <ScrollBar orientation="horizontal" variant="thin" />
      </ScrollArea>
    </div>
  );

  // Render content for each tab
  const renderTabContent = () => (
    <div className="flex-1 min-h-0 flex flex-col min-w-0">
      {/* Overview Tab */}
      {activeTab === "overview" && (
        <TemplateOverviewTab
          template={template}
          fields={fields}
          cabinet={cabinet}
          canEdit={canEdit}
          onNavigateToTab={setActiveTab}
          onEditTemplate={() => {
            setActiveTab("template");
            setMode("edit");
          }}
          onTestTemplate={() => {
            setActiveTab("template");
            setMode("edit");
          }}
          onDuplicate={handleDuplicate}
          onChatPrompt={(prompt) => {
            toast({
              title: "AI запит",
              description: prompt,
            });
          }}
          onNavigateToRelatedTemplate={(templateId) => {
            // Navigate to related template - in demo mode just show toast
            toast({
              title: "Навігація",
              description: `Перехід до шаблону ${templateId}`,
            });
          }}
        />
      )}

      {/* Template Tab */}
      {activeTab === "template" && (
        <div className="flex-1 min-h-0 flex flex-col animate-fade-in min-w-0 overflow-x-hidden">
          <TemplateViewerTab
            template={template}
            fields={fields}
            documentText={documentText}
            cabinet={cabinet}
            mode={mode}
            onModeChange={setMode}
            canEdit={canEdit}
            onFieldsChange={setFields}
            onDocumentTextChange={setDocumentText}
            highlightedFieldKey={highlightedFieldKey}
            onFieldClick={setHighlightedFieldKey}
            onHighlightComplete={() => setHighlightedFieldKey(null)}
            hasUnsavedChanges={hasUnsavedChanges}
            onUnsavedChangesChange={setHasUnsavedChanges}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Journal Tab */}
      {activeTab === "journal" && (
        <ScrollArea className="flex-1 animate-fade-in">
          <TemplateJournalTab
            template={template}
            cabinet={cabinet}
          />
        </ScrollArea>
      )}
    </div>
  );

  // =============================================================================
  // MOBILE LAYOUT
  // =============================================================================
  if (isMobile) {
    return (
      <div className="flex flex-col h-full relative">
        {/* Mobile Header */}
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="flex items-center gap-2 px-3 py-2.5">
            <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0 h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <TemplateIcon className="w-4 h-4 shrink-0 text-primary" />
              <span className="font-semibold text-sm truncate">{template.name}</span>
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs h-6">
              {template.category === "system" ? "Системний" : "Мій"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyId}>
                  <Copy className="h-4 w-4 mr-2" />
                  Копіювати ID
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Дублювати
                </DropdownMenuItem>
                {canEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Видалити
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Mobile Tabs */}
        {renderTabNav(mobileTabNavRef)}
        
        {/* Mobile Content */}
        {renderTabContent()}
        
        {/* Unsaved Changes Dialog */}
        <UnsavedChangesDialog
          open={showUnsavedTabDialog}
          onOpenChange={setShowUnsavedTabDialog}
          onSave={handleSaveAndSwitchTab}
          onDiscard={handleDiscardAndSwitchTab}
          onCancel={handleCancelTabSwitch}
          hasChanges={hasUnsavedChanges}
        />
      </div>
    );
  }

  // =============================================================================
  // DESKTOP LAYOUT
  // =============================================================================
  return (
    <div className="h-full flex flex-col min-w-0 overflow-x-hidden">
      {/* Desktop Header - compact like DocumentDetailHeader */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex items-center gap-4 px-6 py-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="rounded-lg bg-primary/10 p-2 shrink-0">
              <TemplateIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 group">
                <h1 className="text-lg font-semibold truncate">{template.name}</h1>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={handleCopyId}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
          
          <Badge variant="secondary" className="text-xs shrink-0">
            {template.category === "system" ? "Системний" : "Мій"}
          </Badge>
          
          {/* Cancel button in header (Edit mode only) */}
          {mode === "edit" && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              className="text-muted-foreground h-8"
            >
              <X className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Скасувати</span>
            </Button>
          )}
          
          {/* More menu (3 dots) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyId}>
                <Copy className="h-4 w-4 mr-2" />
                Копіювати ID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Дублювати
              </DropdownMenuItem>
              {canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Видалити
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Desktop Tabs */}
      {renderTabNav(desktopTabNavRef)}

      {/* Desktop Content */}
      {renderTabContent()}
      
      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showUnsavedTabDialog}
        onOpenChange={setShowUnsavedTabDialog}
        onSave={handleSaveAndSwitchTab}
        onDiscard={handleDiscardAndSwitchTab}
        onCancel={handleCancelTabSwitch}
        hasChanges={hasUnsavedChanges}
      />
    </div>
  );
};

export type { TemplateDetailPageProps };
