import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { UIMessage } from 'ai';
import { supabase } from '@/integrations/supabase/client';
import CmsChatPanel from '@/admin/components/ai-cms/CmsChatPanel';

import CmsPreviewFrame from '@/admin/components/ai-cms/CmsPreviewFrame';
import CmsHeader from '@/admin/components/ai-cms/CmsHeader';
import CmsWorkspaceHeader from '@/admin/components/ai-cms/CmsWorkspaceHeader';
import type { CmsWorkspaceTab, PreviewMode } from '@/admin/components/ai-cms/CmsWorkspaceTabs';
import CmsDashboardPanel from '@/admin/components/ai-cms/CmsDashboardPanel';
import CmsSitemapPanel from '@/admin/components/ai-cms/CmsSitemapPanel';
import CmsSettingsPanel from '@/admin/components/ai-cms/CmsSettingsPanel';
import CmsAnalyticsPanel from '@/admin/components/ai-cms/CmsAnalyticsPanel';
import CmsCalendarPanel from '@/admin/components/ai-cms/CmsCalendarPanel';
import type { ContentIdea } from '@/admin/hooks/useContentIdeas';
import { loadThreadMessages } from '@/admin/hooks/useCmsThreads';
import CmsHistoryPanel from '@/admin/components/ai-cms/CmsHistoryPanel';
import CmsMobileFooter, { type CmsMobileMode } from '@/admin/components/ai-cms/CmsMobileFooter';
import { QUICK_ACTIONS_BY_TAB } from '@/admin/components/ai-cms/cmsQuickActions';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function AiCmsEditor() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { threadId: routeThreadId } = useParams<{ threadId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPath, setCurrentPath] = useState('/overview');
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<CmsWorkspaceTab>('dashboard');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('page');
  const [mobileMode, setMobileMode] = useState<CmsMobileMode>('desk');

  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const chatPromptRef = useRef<((prompt: string) => void) | null>(null);
  const chatAttachRef = useRef<((shot: { dataUrl: string; rect: { x: number; y: number; w: number; h: number }; path: string }) => void) | null>(null);
  const bootstrappingRef = useRef(false);

  // Bootstrap: if no threadId in URL, create a thread and navigate there
  useEffect(() => {
    if (routeThreadId || bootstrappingRef.current) return;
    bootstrappingRef.current = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const { data, error } = await supabase
        .from('cms_chat_threads')
        .insert({ user_id: userData.user.id, title: null })
        .select('id')
        .single();
      if (error || !data) {
        toast.error('Не вдалось створити чат: ' + (error?.message ?? ''));
        bootstrappingRef.current = false;
        return;
      }
      navigate(`/admin/ai-cms/${data.id}`, { replace: true });
    })();
  }, [routeThreadId, navigate]);

  // Load thread messages on thread change
  useEffect(() => {
    if (!routeThreadId) {
      setInitialMessages([]);
      return;
    }
    setThreadLoading(true);
    loadThreadMessages(routeThreadId)
      .then((msgs) => setInitialMessages(msgs))
      .finally(() => setThreadLoading(false));
  }, [routeThreadId]);

  // Apply ?path= from URL (when opening a thread from history)
  useEffect(() => {
    const p = searchParams.get('path');
    if (!p) return;
    setCurrentPath(p);
    setPreviewMode('page');
    setActiveTab('preview');
    setRefreshKey((k) => k + 1);
    const next = new URLSearchParams(searchParams);
    next.delete('path');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const handleNavigate = useCallback((path: string) => {
    setCurrentPath(path);
    setPreviewMode('page');
    setRefreshKey(k => k + 1);
  }, []);

  const handlePreviewFromPanel = useCallback((path: string) => {
    setCurrentPath(path);
    setPreviewMode('page');
    setRefreshKey(k => k + 1);
    setActiveTab('preview');
  }, []);

  const handleOpenIdeasFromSitemap = useCallback((path: string) => {
    setCurrentPath(path);
    setPreviewMode('edit');
    setRefreshKey(k => k + 1);
    setActiveTab('preview');
  }, []);

  const handleOpenIdeaInEditor = useCallback((_idea: ContentIdea) => {
    setPreviewMode('edit');
    setRefreshKey(k => k + 1);
  }, []);

  const handleChatPrompt = useCallback((prompt: string) => {
    chatPromptRef.current?.(prompt);
  }, []);

  const handleAttachScreenshot = useCallback(
    (shot: { dataUrl: string; rect: { x: number; y: number; w: number; h: number }; path: string }) => {
      chatAttachRef.current?.(shot);
    },
    [],
  );

  const handlePreviewModeChange = useCallback((mode: PreviewMode) => {
    setPreviewMode(mode);
    setActiveTab('preview');
  }, []);

  // When user picks a tab on mobile via bento or header dropdown, also switch to desk mode
  const handleMobileTabChange = useCallback((tab: CmsWorkspaceTab) => {
    setActiveTab(tab);
    setMobileMode('desk');
  }, []);

  const mobileQuickActions = useMemo(
    () => QUICK_ACTIONS_BY_TAB[activeTab] || QUICK_ACTIONS_BY_TAB.dashboard,
    [activeTab],
  );

  const showChatSurface = !isMobile || mobileMode === 'chat';
  const showDeskSurface = !isMobile || mobileMode === 'desk';

  return (
    <div className="h-screen flex flex-col bg-background">
      <CmsHeader
        isChatCollapsed={chatCollapsed}
        onToggleChat={() => setChatCollapsed(c => !c)}
        activeTab={activeTab}
        onTabChange={isMobile ? handleMobileTabChange : setActiveTab}
        historyOpen={historyOpen}
        onToggleHistory={() => setHistoryOpen(o => !o)}
      />

      <div
        className={cn(
          "flex-1 flex min-h-0 bg-background md:bg-sidebar pt-12 md:pt-0",
          isMobile && "pb-[var(--cms-mobile-footer-height,0px)]",
        )}
      >
        {/* History: desktop side-panel; mobile Sheet */}
        {isMobile ? (
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetContent side="left" className="p-0 w-[88vw] sm:w-[380px] [&>button:last-child]:hidden">
              <CmsHistoryPanel
                onClose={() => setHistoryOpen(false)}
                currentPath={currentPath}
                defaultTab={activeTab === 'preview' ? 'page' : 'threads'}
                asSheet
              />
            </SheetContent>
          </Sheet>
        ) : historyOpen && !chatCollapsed ? (
          <CmsHistoryPanel
            onClose={() => setHistoryOpen(false)}
            currentPath={currentPath}
            defaultTab={activeTab === 'preview' ? 'page' : 'threads'}
          />
        ) : threadLoading && routeThreadId ? (
          <div className="hidden md:flex md:w-[380px] flex-shrink-0 items-center justify-center bg-sidebar text-xs text-muted-foreground">
            Завантаження історії чату...
          </div>
        ) : null}

        {/* Chat panel: desktop always (unless collapsed/history); mobile only in chat mode */}
        {!isMobile && !historyOpen && !(threadLoading && routeThreadId) && (
          <CmsChatPanel
            collapsed={chatCollapsed}
            threadId={routeThreadId ?? null}
            initialMessages={initialMessages}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            activeTab={activeTab}
            onSwitchTab={setActiveTab}
            onPreviewModeChange={handlePreviewModeChange}
            registerPromptHandler={(fn) => { chatPromptRef.current = fn; }}
            registerAttachmentHandler={(fn) => { chatAttachRef.current = fn; }}
          />
        )}

        {isMobile && showChatSurface && (
          <CmsChatPanel
            collapsed={false}
            threadId={routeThreadId ?? null}
            initialMessages={initialMessages}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            activeTab={activeTab}
            onSwitchTab={(t) => { setActiveTab(t); setMobileMode('desk'); }}
            onPreviewModeChange={handlePreviewModeChange}
            registerPromptHandler={(fn) => { chatPromptRef.current = fn; }}
            registerAttachmentHandler={(fn) => { chatAttachRef.current = fn; }}
            mobileFullScreen
          />
        )}

        {showDeskSurface && (
          <div className={cn(
            "flex-1 flex flex-col min-h-0 md:my-2 md:mr-2 bg-workspace-bg md:rounded-xl overflow-hidden md:shadow-[inset_0_1px_2px_0_hsl(var(--foreground)/0.03),0_4px_12px_0_hsl(var(--foreground)/0.12),0_0_0_1px_hsl(var(--foreground)/0.06)]",
            chatCollapsed && "md:ml-2",
            isMobile && "w-full"
          )}>
            <CmsWorkspaceHeader
              activeTab={activeTab}
              currentPath={currentPath}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
              onNavigate={handleNavigate}
              onRefresh={handleRefresh}
            />

            <div className="flex-1 relative overflow-hidden md:rounded-b-xl bg-background">
              {activeTab === 'dashboard' && (
                <CmsDashboardPanel
                  onSwitchTab={setActiveTab}
                  onNavigatePreview={handlePreviewFromPanel}
                  onChatPrompt={(p) => { handleChatPrompt(p); if (isMobile) setMobileMode('chat'); }}
                />
              )}
              {activeTab === 'sitemap' && (
                <CmsSitemapPanel onOpenIdeas={handleOpenIdeasFromSitemap} />
              )}
              {activeTab === 'preview' && (
                <CmsPreviewFrame
                  key={`${refreshKey}-${previewMode}`}
                  currentPath={currentPath}
                  onPathChange={setCurrentPath}
                  mode={previewMode}
                  onChatPrompt={(p) => { handleChatPrompt(p); if (isMobile) setMobileMode('chat'); }}
                  onOpenIdeaInEditor={handleOpenIdeaInEditor}
                  onAttachScreenshot={(s) => { handleAttachScreenshot(s); if (isMobile) setMobileMode('chat'); }}
                />
              )}
              {activeTab === 'analytics' && <CmsAnalyticsPanel />}
              {activeTab === 'calendar' && <CmsCalendarPanel />}
              {activeTab === 'settings' && <CmsSettingsPanel />}
            </div>
          </div>
        )}
      </div>

      {isMobile && (
        <CmsMobileFooter
          mode={mobileMode}
          onModeChange={setMobileMode}
          onSend={(text) => {
            if (mobileMode !== 'chat') setMobileMode('chat');
            chatPromptRef.current?.(text);
          }}
          canSend={!!routeThreadId}
          quickActions={mobileQuickActions}
          activeTab={activeTab}
          onTabChange={handleMobileTabChange}
          previewMode={previewMode}
          onPreviewModeChange={handlePreviewModeChange}
        />
      )}
    </div>
  );
}
