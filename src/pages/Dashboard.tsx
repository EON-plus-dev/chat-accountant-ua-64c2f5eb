import { useState, useEffect, useRef, useMemo } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { mockCabinets } from "@/config/cabinetsData";
import Header from "@/components/dashboard/Header";
import ChatOrchestrator, { type TemplateTestState, type DocumentContextForChat } from "@/components/dashboard/ChatOrchestrator";
import WorkspacePanel, { type TabType } from "@/components/dashboard/WorkspacePanel";
import MobileFooter from "@/components/dashboard/MobileFooter";
import UnifiedCommandPalette from "@/components/dashboard/UnifiedCommandPalette";
import NavigationDrawer from "@/components/dashboard/NavigationDrawer";
import { BackTrailBar } from "@/components/shared/BackTrailBar";
import type { TemplateField } from "@/components/cabinets/document-flow/TemplateTextEditor";
import { onContractorOnboarded, getDocumentsPendingContractor, getDocumentWord } from "@/lib/contractorNotificationService";
import { getDocumentsForCabinet } from "@/config/documentFlowConfig";
import { getContractorsForCabinet } from "@/config/settingsConfig";
import { useTodaySnapshot } from "@/hooks/useTodaySnapshot";
import { useUserNotifications } from "@/hooks/useUserNotifications";

import type { Cabinet } from "@/types/cabinet";

type ModeType = "chat" | "desk";

// Вкладки, що потребують контексту кабінету
const CABINET_REQUIRED_TABS: TabType[] = [
  "overview",
  "operations",
  "event-journal",
  "settings",
  "profile",
  "event-detail",
  "create-template",
  "add-document",
  "template-detail",
  "document-detail",
];

const Dashboard = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  // Активуємо realtime-підписку на in-app сповіщення (нагадування подій тощо)
  useUserNotifications();
  
const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Check URL params first
    const urlTab = searchParams.get('tab');
    if (urlTab && ['overview', 'operations', 'analytics', 'settings', 'cabinets', 'profile', 'user-settings', 'faq', 'notifications', 'pricing', 'create-template', 'add-document', 'template-detail'].includes(urlTab)) {
      return urlTab as TabType;
    }
    const RESTORABLE_TABS = ['overview', 'operations', 'analytics', 'settings', 'cabinets', 'profile', 'user-settings', 'faq', 'notifications', 'pricing'];
    const savedTab = localStorage.getItem('dashboard_active_tab');
    if (savedTab && RESTORABLE_TABS.includes(savedTab)) {
      return savedTab as TabType;
    }
    return "cabinets";
  });
  const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true';
  const [mode, setMode] = useState<ModeType>("chat");
  const [activeCabinet, setActiveCabinet] = useState<Cabinet | null>(() => {
    const savedCabinet = localStorage.getItem('dashboard_active_cabinet');
    if (savedCabinet) {
      try {
        const parsed = JSON.parse(savedCabinet);
        // Валідація: чи існує кабінет з таким ID в mockCabinets
        const validCabinet = mockCabinets.find(c => c.id === parsed.id);
        if (validCabinet) {
          return validCabinet; // Повертаємо актуальну версію кабінету
        }
      } catch {
        // Помилка парсингу — скидаємо
      }
    }
    return null;
  });

  // Analytics snapshot for AI cabinet chat
  // Use a stable dummy cabinet when none is active to satisfy Rules of Hooks
  const dummyCabinet = useMemo<Cabinet>(() => ({
    id: "__dummy__", name: "", type: "fop", accessMode: "active",
  } as unknown as Cabinet), []);
  const snapshotCabinet = activeCabinet || dummyCabinet;
  const todaySnapshot = useTodaySnapshot(snapshotCabinet);
  const analyticsSnapshot = activeCabinet ? todaySnapshot : null;
  
  // Previous navigation state for "Back" button
  const [previousNavigation, setPreviousNavigation] = useState<{
    tab: TabType;
    cabinet: Cabinet | null;
  } | null>(null);
  
  // Lifted state for mobile input
  const [mobileInputValue, setMobileInputValue] = useState("");
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [sendTrigger, setSendTrigger] = useState(0);
  const [mobileCommandOpen, setMobileCommandOpen] = useState(false);
  const [navigationDrawerOpen, setNavigationDrawerOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<string>("documents");
  const [isContentScrolled, setIsContentScrolled] = useState(false);
  const [analyticsSection, setAnalyticsSection] = useState<string | null>(null);
  // Deep-link target: highlight a specific user_event row in MyEventsTab
  const [highlightUserEventId, setHighlightUserEventId] = useState<string | null>(null);
  // Deep-link target: highlight/auto-open a specific report in Reports subtab
  const [highlightReportId, setHighlightReportId] = useState<string | null>(null);

  // Template test mode state for chat <-> wizard synchronization
  const [templateTestState, setTemplateTestState] = useState<TemplateTestState | null>(null);
  const [templateFieldUpdate, setTemplateFieldUpdate] = useState<{ key: string; value: string } | null>(null);
  const [editFieldRequest, setEditFieldRequest] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedContractorId, setSelectedContractorId] = useState<string | null>(null);
  
  // Document context for proactive AI messages
  const [documentContextForChat, setDocumentContextForChat] = useState<DocumentContextForChat | null>(null);
  const [contractorOrigin, setContractorOrigin] = useState<{ tab: string; subTab?: string; referenceCategory?: string } | null>(null);
  const [documentOrigin, setDocumentOrigin] = useState<{ tab: string; subTab?: string } | null>(null);
  const [activeReferenceCategory, setActiveReferenceCategory] = useState<string | null>(null);
  
  // Nomenclature detail navigation state
  const [selectedNomenclatureId, setSelectedNomenclatureId] = useState<string | null>(null);
  const [nomenclatureOrigin, setNomenclatureOrigin] = useState<{ tab: string; subTab?: string; referenceCategory?: string } | null>(null);
  
  // Fixed asset detail navigation state
  const [selectedFixedAssetId, setSelectedFixedAssetId] = useState<string | null>(null);
  const [fixedAssetOrigin, setFixedAssetOrigin] = useState<{ tab: string; subTab?: string; referenceCategory?: string } | null>(null);

  // Template detail navigation state
  const [templateOrigin, setTemplateOrigin] = useState<{ tab: string; subTab?: string } | null>(null);
  
  // AI-driven document creation context (Phase 1: Chat → Template integration)
  const [addDocumentContext, setAddDocumentContext] = useState<{
    method: "create" | "upload";
    relation: "new" | "linked";
    skipToStep: "template";
    initialType?: import("@/config/documentFlowConfig").DocumentType;
    aiSuggestedTags?: string[];
    contractorHint?: string;
    subjectHint?: string;
  } | null>(null);

  // Track previous cabinet for chat system message
  const prevCabinetRef = useRef<Cabinet | null>(null);

  // Deep-linking: sync state from URL query params
  useEffect(() => {
    const urlTab = searchParams.get('tab');
    const urlSubTab = searchParams.get('subtab');
    const urlSection = searchParams.get('section');
    const urlDoc = searchParams.get('doc');
    const urlCabinet = searchParams.get('cabinet');
    const urlEventId = searchParams.get('eventId');
    const urlReportId = searchParams.get('reportId');

    // Handle deep-link to a specific report inside Operations → Reports
    if (urlTab === 'operations' && urlSubTab === 'reports' && urlCabinet && urlReportId) {
      const cabinet = mockCabinets.find(c => c.id === urlCabinet);
      if (cabinet) {
        setActiveCabinet(cabinet);
        setActiveTab('operations' as TabType);
        setActiveSubTab('reports');
        setHighlightReportId(urlReportId);
        setMode('desk');
        setSearchParams({}, { replace: true });
        return;
      }
    }

    // Handle deep-link to a specific user event in the event journal
    if (urlTab === 'event-journal' && urlCabinet && urlEventId) {
      const cabinet = mockCabinets.find(c => c.id === urlCabinet);
      console.log('[Dashboard deep-link]', { urlTab, urlCabinet, urlEventId, found: !!cabinet });
      if (cabinet) {
        setActiveCabinet(cabinet);
        setActiveTab('event-journal' as TabType);
        setHighlightUserEventId(urlEventId);
        setMode('desk');
        // Clear URL params via react-router (keeps RR state in sync for future navigations)
        setSearchParams({}, { replace: true });
        return;
      }
    }

    // Handle deep-link to cabinet settings (e.g. notifications subtab)
    if (urlTab === 'settings' && urlCabinet) {
      const cabinet = mockCabinets.find(c => c.id === urlCabinet);
      if (cabinet) {
        setActiveCabinet(cabinet);
        setActiveTab('settings' as TabType);
        if (urlSubTab) setActiveSubTab(urlSubTab);
        setMode('desk');
        setSearchParams({}, { replace: true });
        return;
      }
    }

    // Handle deep-link to specific document
    if (urlDoc && urlCabinet) {
      const cabinet = mockCabinets.find(c => c.id === urlCabinet);
      if (cabinet) {
        setActiveCabinet(cabinet);
        setSelectedDocumentId(urlDoc);
        setActiveTab("document-detail" as TabType);
        setMode("desk");
        // Clear the URL params after processing to prevent re-triggering
        window.history.replaceState({}, document.title, '/dashboard');
        return; // Skip other processing
      }
    }
    
    if (urlTab && ['overview', 'operations', 'analytics', 'settings', 'cabinets', 'profile', 'user-settings', 'faq', 'notifications', 'pricing', 'create-template', 'add-document', 'template-detail'].includes(urlTab)) {
      // Only update if actually different (prevents re-render loops)
      if (activeTab !== urlTab) {
        setPreviousNavigation({ tab: activeTab, cabinet: activeCabinet });
        setActiveTab(urlTab as TabType);
        setActiveCabinet(null); // Global pages don't have cabinet context
        setMode("desk");
      }
      
      // Handle section scroll after tab change
      if (urlSection) {
        setTimeout(() => {
          const element = document.getElementById(urlSection);
          element?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
    
    // Only update subtab if actually different
    if (urlSubTab && urlSubTab !== activeSubTab) {
      setActiveSubTab(urlSubTab);
    }
  }, [searchParams]);

  // Persist activeTab to localStorage
  useEffect(() => {
    const DETAIL_TABS: TabType[] = ["create-template", "add-document", "template-detail", "document-detail"];
    if (!DETAIL_TABS.includes(activeTab)) {
      localStorage.setItem('dashboard_active_tab', activeTab);
    }
  }, [activeTab]);

  // Валідація tab-cabinet consistency при завантаженні та змінах
  useEffect(() => {
    // Якщо поточна вкладка вимагає кабінет, але кабінету немає — скидаємо на "cabinets"
    if (CABINET_REQUIRED_TABS.includes(activeTab) && !activeCabinet) {
      setActiveTab("cabinets");
    }
  }, [activeCabinet, activeTab]);

  // Persist activeCabinet to localStorage
  useEffect(() => {
    if (activeCabinet) {
      localStorage.setItem('dashboard_active_cabinet', JSON.stringify(activeCabinet));
    } else {
      localStorage.removeItem('dashboard_active_cabinet');
    }
  }, [activeCabinet]);

  // Ref for mobile content container
  const mobileContentRef = useRef<HTMLDivElement>(null);

  // Reset scroll state and scroll to top when tab or cabinet changes
  useEffect(() => {
    setIsContentScrolled(false);
    // Scroll mobile content to top
    if (mobileContentRef.current) {
      mobileContentRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
    // Also scroll main window for desktop
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab, activeCabinet]);

  // Clear analytics section when navigating away from analytics
  useEffect(() => {
    if (activeTab !== "analytics") {
      setAnalyticsSection(null);
    }
  }, [activeTab]);

  // Clear document context when document is closed
  useEffect(() => {
    if (!selectedDocumentId) {
      setDocumentContextForChat(null);
    }
  }, [selectedDocumentId]);

  // Handle navigation state from onboarding redirects
  useEffect(() => {
    const state = location.state as { activeCabinetId?: string; tab?: TabType } | null;
    if (state?.activeCabinetId) {
      const cabinet = mockCabinets.find(c => c.id === state.activeCabinetId);
      if (cabinet) {
        setActiveCabinet(cabinet);
        if (state.tab) {
          setActiveTab(state.tab);
        }
      }
      // Clear the state to prevent re-triggering on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Listen for contractor onboarding completion and show toast
  useEffect(() => {
    const unsubscribe = onContractorOnboarded((detail) => {
      const { contractorId, email } = detail;
      
      // Find contractor name from pending contractors
      const allContractors = activeCabinet 
        ? getContractorsForCabinet(activeCabinet) 
        : [];
      const contractor = allContractors.find(c => c.id === contractorId);
      const contractorName = contractor?.name || email;
      
      // Get documents that were pending this contractor
      const allDocs = activeCabinet 
        ? getDocumentsForCabinet(activeCabinet)
        : [];
      const pendingDocs = getDocumentsPendingContractor(allDocs, contractorId);
      const docCount = pendingDocs.length;
      
      // Generate description based on document count
      const description = docCount > 0
        ? `${docCount} ${getDocumentWord(docCount)} готовий до відправки. Реквізити автозаповнено.`
        : "Контрагент готовий до роботи.";
      
      // Show success toast with action button
      toast.success(`✅ ${contractorName} завершив реєстрацію`, {
        description,
        duration: 10000, // 10 seconds
        action: docCount > 0 ? {
          label: "Переглянути документи",
          onClick: () => {
            // Navigate to first pending document
            if (pendingDocs[0] && activeCabinet) {
              setSelectedDocumentId(pendingDocs[0].id);
              setActiveTab("document-detail" as TabType);
              setActiveSubTab("documents");
              setMode("desk");
            }
          },
        } : undefined,
      });
    });
    
    return unsubscribe;
  }, [activeCabinet]);

  // Handler for tab change with optional section
  const handleTabChangeWithSection = (tab: TabType, section?: string) => {
    if (section) {
      if (tab === "analytics") {
        setAnalyticsSection(section);
      } else if (tab === "operations" || tab === "settings" || tab === "user-settings") {
        setActiveSubTab(section);
      }
    }

    // Save navigation context for standalone/detail pages
    const DETAIL_TABS: TabType[] = ["create-template", "add-document", "template-detail"];
    if (DETAIL_TABS.includes(tab)) {
      setPreviousNavigation({ tab: activeTab, cabinet: activeCabinet });
    }

    setActiveTab(tab);
  };

  const handleChatCommand = (command: string) => {
    if (import.meta.env.DEV) console.log("Chat command:", command);
    setMode("chat");
  };

  const handleMobileSend = () => {
    if (mobileInputValue.trim()) {
      setSendTrigger(prev => prev + 1);
    }
  };

  const handleCabinetsClick = () => {
    setActiveCabinet(null);
    setActiveTab("cabinets");
  };

  const handleCabinetEnter = (cabinet: Cabinet) => {
    if (import.meta.env.DEV) console.log("Entering cabinet:", cabinet.name);
    setActiveCabinet(cabinet);
    setActiveTab("overview");
    setMode("desk"); // Switch to desk mode on mobile
  };

  const handleBackToCabinets = () => {
    setActiveCabinet(null);
    setActiveTab("cabinets");
  };

  const handleProfileSettingsClick = () => {
    setPreviousNavigation({ tab: activeTab, cabinet: activeCabinet });
    setActiveCabinet(null);
    setActiveSubTab("personal"); // Reset to valid profile subtab
    setActiveTab("user-settings");
    setMode("desk");
  };

  const handleFAQClick = () => {
    setPreviousNavigation({ tab: activeTab, cabinet: activeCabinet });
    setActiveCabinet(null);
    setActiveTab("faq");
    setMode("desk");
  };

  const handleNotificationsClick = () => {
    setPreviousNavigation({ tab: activeTab, cabinet: activeCabinet });
    setActiveCabinet(null);
    setActiveTab("notifications");
    setMode("desk");
  };

  const handlePricingClick = () => {
    setPreviousNavigation({ tab: activeTab, cabinet: activeCabinet });
    setActiveCabinet(null);
    setActiveTab("pricing");
    setMode("desk");
  };

  const handleGoBack = () => {
    if (previousNavigation) {
      setActiveTab(previousNavigation.tab);
      setActiveCabinet(previousNavigation.cabinet);
      setPreviousNavigation(null);
    } else if (activeCabinet) {
      setActiveTab("operations");
    } else {
      setActiveTab("cabinets");
      setActiveCabinet(null);
    }
  };

  // Mobile footer height - use CSS variable published by MobileFooter

  // Redirect to onboarding if not complete
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-background">
      <Header
        onCabinetsClick={handleCabinetsClick} 
        activeCabinet={activeCabinet}
        cabinets={mockCabinets}
        onCabinetEnter={handleCabinetEnter}
        onNavigationDrawerOpen={() => setNavigationDrawerOpen(true)}
        activeTab={activeTab}
        activeSubTab={activeSubTab}
        onProfileSettingsClick={handleProfileSettingsClick}
        onFAQClick={handleFAQClick}
        onNotificationsClick={handleNotificationsClick}
        onPricingClick={handlePricingClick}
        onCabinetOverviewClick={() => { if (activeCabinet) setActiveTab("overview"); }}
        isChatCollapsed={isChatCollapsed}
        onToggleChat={() => setIsChatCollapsed(prev => !prev)}
      />

      {/* Back-trail bar — показується лише якщо є ?from= в URL (тип 3 крос-сутністної навігації). */}
      <BackTrailBar />

      <div className="flex-1 flex min-h-0 pt-12 md:pt-0 bg-background md:bg-sidebar md:pb-0 md:overflow-hidden">
        {/* Desktop: Chat + CabinetHeader unified on bg-sidebar */}
        {!isChatCollapsed && (
          <div className="hidden md:flex md:w-[380px] flex-shrink-0 flex-col pt-2">
            <ChatOrchestrator 
              onTabChange={setActiveTab}
              onChatCommand={handleChatCommand}
              activeCabinet={activeCabinet}
              analyticsSnapshot={analyticsSnapshot}
              activeTab={activeTab}
              templateTestState={templateTestState}
              onTemplateFieldUpdate={(key, value) => {
                setTemplateFieldUpdate({ key, value });
                setEditFieldRequest(null);
                if (templateTestState) {
                  setTemplateTestState({
                    ...templateTestState,
                    currentFieldIndex: templateTestState.currentFieldIndex + 1,
                    filledFields: { ...templateTestState.filledFields, [key]: value },
                  });
                }
              }}
              onEditFieldRequest={editFieldRequest}
              documentContext={documentContextForChat}
              onNavigateToAddDocument={(context) => {
                setAddDocumentContext(context);
                setActiveTab("add-document");
              }}
            />
          </div>
        )}
        
        {/* Desktop: Content Card */}
        <div className="hidden md:flex flex-col flex-1 min-w-0">
          <div className={`flex-1 flex flex-col my-2 mr-2 ${isChatCollapsed ? 'ml-2' : ''} bg-workspace-bg rounded-xl shadow-[inset_0_1px_2px_0_hsl(var(--foreground)/0.03),0_4px_12px_0_hsl(var(--foreground)/0.12),0_0_0_1px_hsl(var(--foreground)/0.06)] overflow-hidden overflow-x-hidden`}>
            <WorkspacePanel 
              activeTab={activeTab}
              onTabChange={handleTabChangeWithSection}
              onChatPromptInsert={setMobileInputValue}
              onCabinetEnter={handleCabinetEnter}
              activeCabinet={activeCabinet}
              onBackToCabinets={handleBackToCabinets}
              selectedEventId={selectedEventId}
              onEventSelect={setSelectedEventId}
              activeSubTab={activeSubTab}
              onSubTabChange={setActiveSubTab}
              onGoBack={handleGoBack}
              analyticsSection={analyticsSection}
              templateFieldUpdate={templateFieldUpdate}
              onTemplateTestModeChange={(enabled, fields) => {
                if (enabled) {
                  setTemplateTestState({
                    enabled: true,
                    fields: fields.map(f => ({ key: f.key, label: f.label, source: f.source })),
                    currentFieldIndex: 0,
                    filledFields: {},
                  });
                } else {
                  setTemplateTestState(null);
                }
                setTemplateFieldUpdate(null);
                setEditFieldRequest(null);
              }}
              onEditFieldRequest={setEditFieldRequest}
              selectedTemplateId={selectedTemplateId}
              onTemplateSelect={(id) => {
                if (id) {
                  setTemplateOrigin({ tab: activeTab, subTab: activeSubTab });
                } else {
                  setTemplateOrigin(null);
                }
                setSelectedTemplateId(id);
              }}
              templateOrigin={templateOrigin}
              selectedDocumentId={selectedDocumentId}
              onDocumentSelect={(id) => {
                if (id) {
                  setDocumentOrigin({ tab: activeTab, subTab: activeSubTab });
                } else {
                  setDocumentOrigin(null);
                }
                setSelectedDocumentId(id);
              }}
              documentOrigin={documentOrigin}
              selectedContractorId={selectedContractorId}
              onContractorSelect={(id, referenceCategory) => {
                if (id) {
                  setContractorOrigin({ tab: activeTab, subTab: activeSubTab, referenceCategory });
                } else {
                  setContractorOrigin(null);
                }
                setSelectedContractorId(id);
              }}
              contractorOrigin={contractorOrigin}
              activeReferenceCategory={activeReferenceCategory}
              onSetReferenceCategory={setActiveReferenceCategory}
              onNavigateToPricing={handlePricingClick}
              onDocumentContextChange={setDocumentContextForChat}
              selectedNomenclatureId={selectedNomenclatureId}
              onNomenclatureSelect={(id, referenceCategory) => {
                if (id) {
                  setNomenclatureOrigin({ tab: activeTab, subTab: activeSubTab, referenceCategory });
                } else {
                  setNomenclatureOrigin(null);
                }
                setSelectedNomenclatureId(id);
              }}
              nomenclatureOrigin={nomenclatureOrigin}
              selectedFixedAssetId={selectedFixedAssetId}
              onFixedAssetSelect={(id, referenceCategory) => {
                if (id) {
                  setFixedAssetOrigin({ tab: activeTab, subTab: activeSubTab, referenceCategory });
                } else {
                  setFixedAssetOrigin(null);
                }
                setSelectedFixedAssetId(id);
              }}
              fixedAssetOrigin={fixedAssetOrigin}
              highlightUserEventId={highlightUserEventId}
              onClearHighlightUserEventId={() => setHighlightUserEventId(null)}
              initialHighlightReportId={highlightReportId}
            />
          </div>
        </div>

        {/* Mobile Content - Fixed positioning between header and footer */}
        <div 
          ref={mobileContentRef}
          data-mobile-chat-scroll
          className="md:hidden fixed top-12 left-0 right-0 overflow-y-auto bg-workspace-bg"
          style={{ bottom: 'var(--mobile-footer-height, 0px)', WebkitOverflowScrolling: 'touch' }}
          onScroll={(e) => {
            const scrollTop = (e.target as HTMLDivElement).scrollTop;
            setIsContentScrolled(scrollTop > 10);
          }}
          onScrollCapture={(e) => {
            const scrollTop = (e.target as HTMLElement).scrollTop;
            setIsContentScrolled(scrollTop > 10);
          }}
        >
          {mode === "chat" ? (
            <div key="chat-mobile" className="h-full animate-content-enter">
            <ChatOrchestrator 
              fullScreen
              onTabChange={(tab) => {
                setActiveTab(tab);
                setMode("desk");
              }}
              onChatCommand={handleChatCommand}
              externalInputValue={mobileInputValue}
              onExternalInputChange={setMobileInputValue}
              sendTrigger={sendTrigger}
              activeCabinet={activeCabinet}
              analyticsSnapshot={analyticsSnapshot}
              activeTab={activeTab}
              templateTestState={templateTestState}
              onTemplateFieldUpdate={(key, value) => {
                setTemplateFieldUpdate({ key, value });
                setEditFieldRequest(null);
                if (templateTestState) {
                  setTemplateTestState({
                    ...templateTestState,
                    currentFieldIndex: templateTestState.currentFieldIndex + 1,
                    filledFields: { ...templateTestState.filledFields, [key]: value },
                  });
                }
              }}
              onEditFieldRequest={editFieldRequest}
              documentContext={documentContextForChat}
              onNavigateToAddDocument={(context) => {
                setAddDocumentContext(context);
                setActiveTab("add-document");
                setMode("desk");
              }}
            />
            </div>
          ) : (
            <div key="desk-mobile" className="h-full min-h-0 animate-content-enter">
              <WorkspacePanel 
                activeTab={activeTab}
                onTabChange={handleTabChangeWithSection}
                onChatPromptInsert={setMobileInputValue}
                onCabinetEnter={handleCabinetEnter}
                activeCabinet={activeCabinet}
                onBackToCabinets={handleBackToCabinets}
                selectedEventId={selectedEventId}
                onEventSelect={setSelectedEventId}
                activeSubTab={activeSubTab}
                onSubTabChange={setActiveSubTab}
                onGoBack={handleGoBack}
                onScroll={setIsContentScrolled}
                analyticsSection={analyticsSection}
                templateFieldUpdate={templateFieldUpdate}
                onTemplateTestModeChange={(enabled, fields) => {
                  if (enabled) {
                    setTemplateTestState({
                      enabled: true,
                      fields: fields.map(f => ({ key: f.key, label: f.label, source: f.source })),
                      currentFieldIndex: 0,
                      filledFields: {},
                    });
                  } else {
                    setTemplateTestState(null);
                  }
                  setTemplateFieldUpdate(null);
                  setEditFieldRequest(null);
                }}
                onEditFieldRequest={setEditFieldRequest}
                selectedTemplateId={selectedTemplateId}
                onTemplateSelect={(id) => {
                  if (id) {
                    setTemplateOrigin({ tab: activeTab, subTab: activeSubTab });
                  } else {
                    setTemplateOrigin(null);
                  }
                  setSelectedTemplateId(id);
                }}
                templateOrigin={templateOrigin}
                selectedDocumentId={selectedDocumentId}
                onDocumentSelect={(id) => {
                  if (id) {
                    setDocumentOrigin({ tab: activeTab, subTab: activeSubTab });
                  } else {
                    setDocumentOrigin(null);
                  }
                  setSelectedDocumentId(id);
                }}
                documentOrigin={documentOrigin}
                selectedContractorId={selectedContractorId}
              onContractorSelect={(id, referenceCategory) => {
                  if (id) {
                    setContractorOrigin({ tab: activeTab, subTab: activeSubTab, referenceCategory });
                  } else {
                    setContractorOrigin(null);
                  }
                  setSelectedContractorId(id);
                }}
                contractorOrigin={contractorOrigin}
                activeReferenceCategory={activeReferenceCategory}
                onSetReferenceCategory={setActiveReferenceCategory}
                onNavigateToPricing={handlePricingClick}
                onDocumentContextChange={setDocumentContextForChat}
                selectedNomenclatureId={selectedNomenclatureId}
                onNomenclatureSelect={(id, referenceCategory) => {
                  if (id) {
                    setNomenclatureOrigin({ tab: activeTab, subTab: activeSubTab, referenceCategory });
                  } else {
                    setNomenclatureOrigin(null);
                  }
                  setSelectedNomenclatureId(id);
                }}
                nomenclatureOrigin={nomenclatureOrigin}
                selectedFixedAssetId={selectedFixedAssetId}
                onFixedAssetSelect={(id, referenceCategory) => {
                  if (id) {
                    setFixedAssetOrigin({ tab: activeTab, subTab: activeSubTab, referenceCategory });
                  } else {
                    setFixedAssetOrigin(null);
                  }
                  setSelectedFixedAssetId(id);
                }}
                fixedAssetOrigin={fixedAssetOrigin}
                highlightUserEventId={highlightUserEventId}
                onClearHighlightUserEventId={() => setHighlightUserEventId(null)}
                initialHighlightReportId={highlightReportId}
              />
            </div>
          )}
        </div>
      </div>

      {/* Unified Mobile Footer */}
      <MobileFooter 
        mode={mode}
        onModeChange={setMode}
        inputValue={mobileInputValue}
        onInputChange={setMobileInputValue}
        onSend={handleMobileSend}
        onCommandClick={() => setMobileCommandOpen(true)}
        onBentoClick={handleBackToCabinets}
        onAIPromptSelect={(text) => {
          setMobileInputValue(text);
          setMode("chat");
        }}
        activeCabinet={activeCabinet}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSubTabChange={setActiveSubTab}
        isContentScrolled={isContentScrolled}
      />

      {/* Mobile Unified Command Palette */}
      <UnifiedCommandPalette 
        open={mobileCommandOpen}
        onOpenChange={setMobileCommandOpen}
        activeCabinet={activeCabinet}
        activeTab={activeTab}
        onChatCommand={handleChatCommand}
        onPromptSelect={(text) => {
          setMobileInputValue(text);
          setMode("chat");
        }}
      />

      {/* Mobile Navigation Drawer (Bento Menu) */}
      <NavigationDrawer
        open={navigationDrawerOpen}
        onOpenChange={setNavigationDrawerOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCabinet={activeCabinet}
        onBackToCabinets={handleBackToCabinets}
        activeSubTab={activeSubTab}
        onSubTabChange={setActiveSubTab}
        cabinets={mockCabinets}
        onCabinetEnter={handleCabinetEnter}
        onViewAllCabinets={handleBackToCabinets}
      />
    </div>
  );
};

export default Dashboard;
