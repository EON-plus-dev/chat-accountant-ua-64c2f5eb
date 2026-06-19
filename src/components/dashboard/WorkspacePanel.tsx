import { useState, useRef, useEffect } from "react";
import { FileText, Building2, Users, Home, ArrowLeft, Briefcase, BarChart3, Settings, ScrollText } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PortfolioAnalyticsPage } from "@/components/analytics/PortfolioAnalyticsPage";
import CabinetsPage from "@/components/cabinets/CabinetsPage";
import CabinetAnalyticsPage from "@/components/cabinets/CabinetAnalyticsPage";
import CabinetOverviewPage from "@/components/cabinets/CabinetOverviewPage";
import CabinetProfilePage from "@/components/cabinets/CabinetProfilePage";
import CabinetSettingsPage from "@/components/cabinets/CabinetSettingsPage";
import CabinetEventJournalPage from "@/components/cabinets/CabinetEventJournalPage";
import CabinetEventDetailPage from "@/components/cabinets/CabinetEventDetailPage";
import CabinetOperationsPage from "@/components/cabinets/CabinetOperationsPage";
import WorkCenterPage from "@/components/cabinets/work-center/WorkCenterPage";
import OrdersPage from "@/components/cabinets/orders/OrdersPage";
import DocumentsHubPage from "@/components/cabinets/documents/DocumentsHubPage";
import SavingsPage from "@/components/cabinets/savings/SavingsPage";
import NetworkPage from "@/components/cabinets/network/NetworkPage";
import AiCenterPage from "@/components/cabinets/ai-center/AiCenterPage";
import { CreateTemplatePage } from "@/components/cabinets/document-flow/CreateTemplatePage";
import { AddDocumentPage } from "@/components/cabinets/document-flow/AddDocumentPage";
import { TemplateDetailPage } from "@/components/cabinets/document-flow/TemplateDetailPage";
import { DocumentDetailPage } from "@/components/cabinets/document-flow/DocumentDetailPage";
import UserSettingsPage from "@/pages/UserSettingsPage";
import FAQ from "@/pages/FAQ";
import Notifications from "@/pages/Notifications";
import Pricing from "@/pages/Pricing";
import type { Cabinet } from "@/types/cabinet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { 
  getFirstOperationsSubTab, 
  operationsConfigByType,
  getOperationsSubTabs,
  getOperationsSubTabsForPassive,
  getFirstOperationsSubTabForPassive 
} from "@/config/operationsConfig";
import { 
  getSettingsSubTabs, 
  getFirstSettingsSubTab,
  getSettingsSubTabsForPassive,
  getFirstSettingsSubTabForPassive 
} from "@/config/settingsConfig";
import { getEntityStyle } from "@/config/entityStyles";
import { getContractorsForCabinet } from "@/config/settingsConfig";
import type { Document } from "@/config/documentFlowConfig";
import type { DocumentContextForChat } from "@/components/dashboard/ChatOrchestrator";

export type CabinetTabType = "overview" | "operations" | "event-journal" | "analytics" | "settings" | "profile" | "event-detail" | "document-detail" | "work-center" | "orders" | "documents" | "savings" | "network" | "ai-center";

export type TabType = "overview" | "operations" | "event-journal" | "analytics" | "settings" | "cabinets" | "profile" | "event-detail" | "document-detail" | "user-settings" | "faq" | "notifications" | "pricing" | "create-template" | "add-document" | "template-detail" | "work-center" | "orders" | "documents" | "savings" | "network" | "ai-center";

// Global standalone pages that should NOT display genericTabs navigation
const GLOBAL_STANDALONE_PAGES: TabType[] = ["user-settings", "faq", "notifications", "pricing", "create-template", "add-document", "template-detail", "analytics", "document-detail"];

// Cabinet detail pages that should hide the cabinet header tabs
const CABINET_DETAIL_PAGES: TabType[] = ["event-detail", "add-document", "template-detail", "create-template", "document-detail"];

interface WorkspacePanelProps {
  activeTab: TabType;
  onTabChange: (tab: TabType, analyticsSection?: string) => void;
  onChatPromptInsert?: (prompt: string) => void;
  onCabinetEnter?: (cabinet: Cabinet) => void;
  activeCabinet?: Cabinet | null;
  onBackToCabinets?: () => void;
  selectedEventId?: string | null;
  onEventSelect?: (eventId: string | null) => void;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  onGoBack?: () => void;
  onScroll?: (isScrolled: boolean) => void;
  analyticsSection?: string | null;
  // Template test mode
  templateFieldUpdate?: { key: string; value: string } | null;
  onTemplateTestModeChange?: (enabled: boolean, fields: { key: string; label: string; source: string }[]) => void;
  onEditFieldRequest?: (fieldKey: string) => void;
  // Template detail
  selectedTemplateId?: string | null;
  onTemplateSelect?: (templateId: string | null) => void;
  templateOrigin?: { tab: string; subTab?: string } | null;
  // Document detail
  selectedDocumentId?: string | null;
  onDocumentSelect?: (documentId: string | null) => void;
  documentOrigin?: { tab: string; subTab?: string } | null;
  // Contractor detail
  selectedContractorId?: string | null;
  onContractorSelect?: (contractorId: string | null, referenceCategory?: string) => void;
  contractorOrigin?: { tab: string; subTab?: string; referenceCategory?: string } | null;
  // Nomenclature detail
  selectedNomenclatureId?: string | null;
  onNomenclatureSelect?: (itemId: string | null, referenceCategory?: string) => void;
  nomenclatureOrigin?: { tab: string; subTab?: string; referenceCategory?: string } | null;
  // Fixed asset detail
  selectedFixedAssetId?: string | null;
  onFixedAssetSelect?: (assetId: string | null, referenceCategory?: string) => void;
  fixedAssetOrigin?: { tab: string; subTab?: string; referenceCategory?: string } | null;
  activeReferenceCategory?: string | null;
  onSetReferenceCategory?: (category: string | null) => void;
  onNavigateToPricing?: () => void;
  // Document context for proactive AI messages
  onDocumentContextChange?: (context: DocumentContextForChat | null) => void;
  // Deep-link: highlight a specific user event in the event journal
  highlightUserEventId?: string | null;
  onClearHighlightUserEventId?: () => void;
  // Deep-link: highlight a specific report in CabinetOperationsPage → Reports
  initialHighlightReportId?: string | null;
}

const cabinetTabs = [
  { id: "overview" as CabinetTabType, label: "Огляд", icon: Home },
  { id: "operations" as CabinetTabType, label: "Управління", icon: Briefcase },
  { id: "event-journal" as CabinetTabType, label: "Події", icon: ScrollText },
  { id: "analytics" as CabinetTabType, label: "Аналітика", icon: BarChart3 },
  { id: "settings" as CabinetTabType, label: "Налаштування", icon: Settings },
];

const WorkspacePanel = ({ 
  activeTab,
  onTabChange,
  onChatPromptInsert,
  onCabinetEnter,
  activeCabinet,
  onBackToCabinets,
  selectedEventId,
  onEventSelect,
  activeSubTab,
  onSubTabChange,
  onGoBack,
  onScroll,
  analyticsSection,
  templateFieldUpdate,
  onTemplateTestModeChange,
  onEditFieldRequest,
  selectedTemplateId,
  onTemplateSelect,
  templateOrigin,
  selectedDocumentId,
  onDocumentSelect,
  documentOrigin,
  selectedContractorId,
  onContractorSelect,
  contractorOrigin,
  selectedNomenclatureId,
  onNomenclatureSelect,
  nomenclatureOrigin,
  selectedFixedAssetId,
  onFixedAssetSelect,
  fixedAssetOrigin,
  activeReferenceCategory,
  onSetReferenceCategory,
  onNavigateToPricing,
  onDocumentContextChange,
  highlightUserEventId,
  onClearHighlightUserEventId,
  initialHighlightReportId,
}: WorkspacePanelProps) => {
  const isMobile = useIsMobile();
  const subtabNavRef = useRef<HTMLElement>(null);
  const entityStyle = activeCabinet ? getEntityStyle(activeCabinet.type) : null;

  // Context for "Create based on" shortcut from DocumentDetailPage
  // Also supports AI-driven creation from ChatOrchestrator
  const [addDocumentContext, setAddDocumentContext] = useState<{
    method?: "create" | "upload";
    relation?: "new" | "linked";
    parentDocument?: Document;
    skipToStep?: "action" | "parent-search" | "template" | "editor" | "upload";
    // AI-driven creation context (Phase 1: Chat → Template integration)
    initialType?: import("@/config/documentFlowConfig").DocumentType;
    aiSuggestedTags?: string[];
    contractorHint?: string;
    subjectHint?: string;
  } | null>(null);

  // Auto-scroll to active subtab when it changes (centers the button) — desktop only
  useEffect(() => {
    const container = subtabNavRef.current;
    
    if (container && activeSubTab) {
      const activeButton = container.querySelector(`[data-subtab-id="${activeSubTab}"]`) as HTMLElement;
      if (activeButton) {
        // Знайти Radix viewport напряму від кнопки (гарантовано працює і на mobile, і на desktop)
        const viewport = activeButton.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null;
        
        if (viewport) {
          // Ручне центрування з clamp
          const buttonRect = activeButton.getBoundingClientRect();
          const viewportRect = viewport.getBoundingClientRect();
          
          const buttonCenter = buttonRect.left + buttonRect.width / 2;
          const viewportCenter = viewportRect.left + viewportRect.width / 2;
          const scrollOffset = buttonCenter - viewportCenter;
          
          // Clamp: не виходити за межі scrollable area
          const nextLeft = Math.max(0, Math.min(
            viewport.scrollLeft + scrollOffset,
            viewport.scrollWidth - viewport.clientWidth
          ));
          
          viewport.scrollTo({
            left: nextLeft,
            behavior: 'smooth'
          });
        }
        // Прибрано fallback scrollIntoView({ inline: 'center' }) — він провокував зсув документа
        
        // Страховка: скинути горизонтальний scroll документа
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
      }
    }
  }, [activeSubTab, isMobile]);
  
  const genericTabs = [
    { id: "overview" as TabType, label: "Огляд", icon: Home },
    { id: "operations" as TabType, label: "Управління", icon: Briefcase },
    { id: "analytics" as TabType, label: "Аналітика", icon: BarChart3 },
    { id: "settings" as TabType, label: "Налаштування", icon: Settings },
  ];

  const renderContent = () => {
    // User settings page (global level)
    if (activeTab === "user-settings") {
      return <UserSettingsPage onBack={onGoBack} onCabinetEnter={onCabinetEnter} activeSubTab={activeSubTab} onSubTabChange={onSubTabChange} onNavigateToPricing={onNavigateToPricing} />;
    }

    // FAQ page (global level)
    if (activeTab === "faq") {
      return <FAQ onBack={onGoBack} />;
    }

    // Notifications page (global level)
    if (activeTab === "notifications") {
      return <Notifications onBack={onGoBack} onScroll={onScroll} />;
    }

    // Pricing page (global level)
    if (activeTab === "pricing") {
      return <Pricing onBack={onGoBack} onTabChange={onTabChange} onSubTabChange={onSubTabChange} />;
    }

    // Create template page (requires cabinet context)
    if (activeTab === "create-template" && activeCabinet) {
      return (
        <CreateTemplatePage
          cabinet={activeCabinet}
          onBack={onGoBack}
          onChatMessage={onChatPromptInsert}
          onTestModeChange={onTemplateTestModeChange}
          externalFieldUpdate={templateFieldUpdate}
          onEditFieldRequest={onEditFieldRequest}
        />
      );
    }

    // Add document page (requires cabinet context)
    if (activeTab === "add-document" && activeCabinet) {
      return (
        <AddDocumentPage
          cabinet={activeCabinet}
          initialContext={addDocumentContext || undefined}
          onBack={() => {
            setAddDocumentContext(null);
            onTabChange("operations");
            onSubTabChange?.("documents");
          }}
          onDocumentCreated={() => {
            setAddDocumentContext(null);
            onTabChange("operations");
            onSubTabChange?.("documents");
          }}
          onNavigateToDocument={(documentId) => {
            setAddDocumentContext(null);
            onDocumentSelect?.(documentId);
            onTabChange("document-detail");
          }}
          onChatMessage={onChatPromptInsert}
          onNavigateToCreateTemplate={() => onTabChange("create-template")}
        />
      );
    }

    // Template detail page (requires cabinet context)
    if (activeTab === "template-detail" && activeCabinet && selectedTemplateId) {
      return (
        <TemplateDetailPage
          templateId={selectedTemplateId}
          cabinet={activeCabinet}
          onBack={() => {
            onTemplateSelect?.(null);
            // Use stored origin context if available, otherwise fallback to document-policies
            if (templateOrigin) {
              onTabChange(templateOrigin.tab as TabType);
              if (templateOrigin.subTab) {
                onSubTabChange?.(templateOrigin.subTab);
              }
            } else {
              onTabChange("settings");
              onSubTabChange?.("document-policies");
            }
          }}
        />
      );
    }

    if (activeTab === "document-detail" && activeCabinet && selectedDocumentId) {
      return (
        <DocumentDetailPage
          documentId={selectedDocumentId}
          cabinet={activeCabinet}
          onBack={() => {
            onDocumentSelect?.(null);
            if (documentOrigin) {
              onTabChange(documentOrigin.tab as TabType);
              if (documentOrigin.subTab) {
                onSubTabChange?.(documentOrigin.subTab);
              }
            } else {
              onTabChange("operations");
              onSubTabChange?.("documents");
            }
          }}
          onChatPromptInsert={onChatPromptInsert}
          onNavigateToDocument={(docId) => {
            onDocumentSelect?.(docId);
          }}
          onNavigateToContractor={(contractorCode) => {
            // Cross-section navigation: jump to Settings → References → Contractors
            // with the contractor pre-selected (in-place detail, single breadcrumb).
            const contractors = getContractorsForCabinet(activeCabinet);
            const contractor = contractors.find(c => c.code === contractorCode);
            if (contractor) {
              onContractorSelect?.(contractor.id, "contractors");
              onSetReferenceCategory?.("contractors");
              onSubTabChange?.("references");
              onTabChange("settings");
            }
          }}
          onDocumentContextChange={onDocumentContextChange}
          onNavigateToAddDocument={(context) => {
            setAddDocumentContext(context);
            onTabChange("add-document");
          }}
        />
      );
    }

    // If viewing cabinets list
    if (activeTab === "cabinets") {
      return (
        <CabinetsPage 
          onCabinetEnter={onCabinetEnter} 
          onScroll={onScroll}
          onNavigateToAnalytics={() => onTabChange("analytics")}
        />
      );
    }

    // If inside a cabinet
    if (activeCabinet) {
      switch (activeTab) {
        case "overview":
          return (
            <CabinetOverviewPage 
              cabinet={activeCabinet} 
              onChatPromptInsert={onChatPromptInsert}
              onTabChange={onTabChange}
            />
          );
        case "event-journal":
          return (
            <CabinetEventJournalPage 
              cabinet={activeCabinet}
              onEventSelect={(eventId) => {
                onEventSelect?.(eventId);
                onTabChange("event-detail");
              }}
              onScroll={onScroll}
              highlightUserEventId={highlightUserEventId ?? null}
              onClearHighlightUserEventId={onClearHighlightUserEventId}
            />
          );
        case "event-detail":
          return selectedEventId ? (
            <CabinetEventDetailPage 
              cabinet={activeCabinet}
              eventId={selectedEventId}
              onBack={() => {
                onEventSelect?.(null);
                onTabChange("event-journal");
              }}
            />
          ) : null;
        case "profile":
          return <CabinetProfilePage cabinet={activeCabinet} />;
        case "settings":
          return (
            <CabinetSettingsPage 
              cabinet={activeCabinet} 
              activeSubTab={activeSubTab}
              onSubTabChange={onSubTabChange}
              onNavigateToCreateTemplate={() => onTabChange("create-template")}
              onNavigateToTemplateDetail={(templateId) => {
                onTemplateSelect?.(templateId);
                onTabChange("template-detail");
              }}
              selectedContractorId={selectedContractorId ?? null}
              selectedNomenclatureId={selectedNomenclatureId ?? null}
              selectedFixedAssetId={selectedFixedAssetId ?? null}
              onSelectContractor={(id) => onContractorSelect?.(id, "contractors")}
              onSelectNomenclature={(id) => onNomenclatureSelect?.(id, "nomenclature")}
              onSelectFixedAsset={(id) => onFixedAssetSelect?.(id, "fixed-assets")}
              activeReferenceCategory={activeReferenceCategory}
              onReferenceCategoryChange={onSetReferenceCategory}
            />
          );
        case "analytics":
          return (
            <CabinetAnalyticsPage 
              cabinet={activeCabinet}
              onChatPromptInsert={onChatPromptInsert}
              scrollToSection={analyticsSection}
            />
          );
        case "operations":
          return (
            <CabinetOperationsPage
              cabinet={activeCabinet}
              onHomeClick={() => onTabChange("overview")}
              activeSubTab={activeSubTab}
              onSubTabChange={onSubTabChange}
              onNavigateToAnalytics={() => onTabChange("analytics")}
              onNavigateToSettings={() => onTabChange("settings", "integrations")}
              onNavigateToReferences={() => onTabChange("settings", "references")}
              onNavigateToCreateTemplate={() => onTabChange("create-template")}
              onNavigateToAddDocument={() => onTabChange("add-document")}
              onNavigateToDocumentDetail={(docId) => {
                onDocumentSelect?.(docId);
                onTabChange("document-detail");
              }}
              onScroll={onScroll}
              initialHighlightReportId={initialHighlightReportId}
            />
          );
        // Legacy individual top-tabs (work-center / orders / documents / savings
        // / network / ai-center) — content moved into operations sub-tab strip.
        // Auto-redirect to operations with corresponding sub-tab if URL still
        // references these.
        case "work-center":
        case "orders":
        case "documents":
        case "savings":
        case "network":
        case "ai-center": {
          const subtabMap: Record<string, string> = {
            "work-center": "work-center",
            "orders": "orders",
            "documents": "documents",
            "savings": "savings",
            "network": "network",
            "ai-center": "ai-center",
          };
          // Defer to next tick to avoid setState during render.
          setTimeout(() => onTabChange("operations", subtabMap[activeTab]), 0);
          return null;
        }
        default:
          return null;
      }
    }

    // Default: no cabinet selected - show analytics
    switch (activeTab) {
      case "analytics":
        return (
          <PortfolioAnalyticsPage 
            onChatPromptInsert={onChatPromptInsert}
            onCabinetSelect={onCabinetEnter}
            onScroll={onScroll}
            onBackToCabinets={() => onTabChange("cabinets")}
          />
        );
      default:
        return (
          <div className="p-4 md:p-6">
            <Card className="border-border">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Оберіть кабінет для доступу до цього розділу.
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  // Show cabinet tabs inside content card for desktop (hide for detail pages)
  const showCabinetTabs = !isMobile && activeCabinet && activeTab !== "cabinets" && !CABINET_DETAIL_PAGES.includes(activeTab);




  // Get subtabs for current active tab
  const getSubtabs = () => {
    if (!activeCabinet) return [];
    
    const isPassive = activeCabinet.accessMode === "passive";
    
    if (activeTab === "operations") {
      return isPassive 
        ? getOperationsSubTabsForPassive(activeCabinet.type)
        : getOperationsSubTabs(activeCabinet);
    }
    if (activeTab === "settings") {
      return isPassive 
        ? getSettingsSubTabsForPassive(activeCabinet.type)
        : getSettingsSubTabs(activeCabinet.type, activeCabinet);
    }
    return [];
  };

  const subtabs = getSubtabs();
  // Усі типи кабінетів: «Управління» та «Налаштування» рендеряться як хаб-картки
  // (LifeLauncherPage / CabinetManagementHub / IndividualSettingsHub / CabinetSettingsHub).
  // Горизонтальна pill-навігація більше не потрібна — навігація через клік по картці
  // + back-bar у детальних розділах.
  const hasSubtabs = false;

  return (
    <div className="h-full flex flex-col w-full min-w-0">

      {/* Connected Folder Tabs - Level 1 + Level 2 unified navigation */}
      {showCabinetTabs && (
        <div className="flex flex-col min-w-0">
          {/* Level 1 - Cabinet Tabs on nav-shelf background */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-0 bg-[hsl(var(--nav-shelf))] min-w-0">
            {/* Inline Tab Navigation - Folder Tabs Level 1 */}
            <nav className="flex items-center" role="tablist" aria-label="Секції кабінету">
              {cabinetTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const hasActiveSubtabs = false;
                
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      onTabChange(tab.id as TabType);
                      // Auto-select first sub-tab when switching to operations or settings
                      const isPassive = activeCabinet?.accessMode === "passive";
                      if (tab.id === "operations" && activeCabinet) {
                        const firstSubTab = isPassive 
                          ? getFirstOperationsSubTabForPassive(activeCabinet.type)
                          : getFirstOperationsSubTab(activeCabinet.type);
                        if (!activeSubTab || activeSubTab !== firstSubTab) {
                          onSubTabChange?.(firstSubTab);
                        }
                      }
                      if (tab.id === "settings" && activeCabinet) {
                        const firstSubTab = isPassive 
                          ? getFirstSettingsSubTabForPassive(activeCabinet.type)
                          : getFirstSettingsSubTab(activeCabinet.type);
                        if (!activeSubTab || activeSubTab !== firstSubTab) {
                          onSubTabChange?.(firstSubTab);
                        }
                      }
                    }}
                    className={cn(
                      // Base styles
                      "flex items-center gap-2 h-10 px-4",
                      "text-sm font-medium rounded-t-lg",
                      "transition-[background-color,color,transform,box-shadow,border-color] duration-150 ease-out",
                      // Focus state (WCAG 2.4.7 compliant)
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50",
                      
                      isActive
                        ? [
                            // Active state - connected folder tab
                            "border-2 border-border/80",
                            hasActiveSubtabs ? "border-b-0 border-b-muted" : "border-b-2",
                            "bg-subtab-shelf",
                            "ring-1 ring-foreground/10",
                            hasActiveSubtabs ? "-mb-[2px]" : "-mb-[2px]",
                            "relative z-10",
                            "text-foreground",
                            "shadow-[0_-2px_8px_-2px_hsl(var(--foreground)/0.08)]"
                          ]
                        : [
                            // Inactive state
                            "text-muted-foreground",
                            "mb-0",
                            // Hover - помітний фідбек (як Linear, Notion)
                            "hover:text-foreground",
                            "hover:bg-muted/60",
                            "hover:scale-[1.02]",
                            // Pressed - тактильний фідбек (як Apple HIG)
                            "active:scale-[0.97]",
                            "active:bg-accent/50",
                          ]
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Level 2 - SubtabNav Pills (only for Operations/Settings) */}
          {hasSubtabs ? (
            <div className="bg-subtab-shelf border-b border-border relative min-w-0">
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
              
              <ScrollArea 
                className="w-full" 
                scrollbarVariant="hidden" 
                orientation="horizontal"
                viewportClassName="py-2 scroll-px-4"
              >
                <nav 
                  ref={subtabNavRef}
                  className="inline-flex items-center gap-1.5 w-max" 
                  role="tablist" 
                  aria-label="Підрозділи"
                >
                  {/* Left spacer for symmetric padding */}
                  <span aria-hidden="true" className="w-4 shrink-0" />
                  {subtabs.map((subtab) => {
                    const Icon = subtab.icon;
                    const isActive = subtab.id === activeSubTab;
                    
                    return (
                      <button
                        key={subtab.id}
                        data-subtab-id={subtab.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onSubTabChange?.(subtab.id)}
                        className={cn(
                          // Base styles
                          "flex items-center gap-1.5 h-8 px-3",
                          "text-sm font-medium rounded-full shrink-0",
                          "transition-[background-color,color,transform,box-shadow] duration-150 ease-out",
                          // Focus state (accessibility)
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/50",
                          
                          isActive
                            ? [
                                // Active state - elevated pill
                                entityStyle?.pillActiveClass || "bg-background text-foreground",
                                "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]",
                                "ring-[1.5px]",
                              ]
                            : [
                                // Inactive state
                                "text-muted-foreground",
                                // Hover - більш помітний фідбек
                                "hover:text-foreground",
                                "hover:bg-muted",
                                "hover:scale-[1.02]",
                                // Active/pressed - тактильний фідбек
                                "active:scale-[0.97]",
                                "active:bg-accent",
                              ]
                        )}
                      >
                        <Icon className={cn("h-4 w-4", isActive && (entityStyle?.color || "text-primary"))} />
                        <span>{subtab.label}</span>
                      </button>
                    );
                  })}
                  {/* Right spacer for symmetric padding */}
                  <span aria-hidden="true" className="w-4 shrink-0" />
                </nav>
                <ScrollBar orientation="horizontal" variant="thin" />
              </ScrollArea>
            </div>
          ) : (
            /* Border bottom for tabs without subtabs */
            <div className="h-px bg-border" />
          )}
        </div>
      )}



      {/* Generic tabs for when not in cabinet context (excluding global standalone pages) */}
      {!activeCabinet && activeTab !== "cabinets" && !GLOBAL_STANDALONE_PAGES.includes(activeTab) && !isMobile && (
        <div 
          role="tablist" 
          aria-label="Основна навігація"
          className="w-full flex gap-1 p-2 bg-background overflow-x-auto"
          onKeyDown={(e) => {
            const currentIndex = genericTabs.findIndex(t => t.id === activeTab);
            if (e.key === 'ArrowRight') {
              const nextIndex = (currentIndex + 1) % genericTabs.length;
              onTabChange(genericTabs[nextIndex].id);
            } else if (e.key === 'ArrowLeft') {
              const prevIndex = (currentIndex - 1 + genericTabs.length) % genericTabs.length;
              onTabChange(genericTabs[prevIndex].id);
            } else if (e.key === 'Home') {
              onTabChange(genericTabs[0].id);
            } else if (e.key === 'End') {
              onTabChange(genericTabs[genericTabs.length - 1].id);
            }
          }}
        >
          {genericTabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => {
                onTabChange(tab.id);
                // Auto-select first sub-tab when switching to operations
                if (tab.id === "operations" && activeCabinet) {
                  const firstSubTab = getFirstOperationsSubTab(activeCabinet.type);
                  onSubTabChange?.(firstSubTab);
                }
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Tab Panel */}
      <div 
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="flex-1 min-h-0 flex flex-col md:overflow-auto overflow-x-hidden bg-background"
        onScroll={(e) => {
          const scrollTop = (e.target as HTMLDivElement).scrollTop;
          onScroll?.(scrollTop > 10);
        }}
      >
        <div 
          key={activeTab === "user-settings" ? activeTab : `${activeTab}-${activeSubTab}`}
          className="flex-1 min-h-0 min-w-0 overflow-x-hidden animate-content-enter"
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default WorkspacePanel;
