import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowUp, Plus, LayoutGrid, Mic, FileUp, Camera, Sparkles, MoreHorizontal, Home, Briefcase, ScrollText, BarChart3, Settings } from "lucide-react";
import QuickPromptsRow from "./QuickPromptsRow";
import UnifiedCommandPalette from "./UnifiedCommandPalette";
import { getContextualPrompts, type QuickPrompt } from "@/config/chatPromptsConfig";
import type { Cabinet } from "@/types/cabinet";
import type { TabType } from "./WorkspacePanel";
import { getFirstOperationsSubTab } from "@/config/operationsConfig";

type ModeType = "chat" | "desk";

const CABINET_TABS = [
  { id: "overview" as TabType, label: "Огляд", icon: Home },
  { id: "operations" as TabType, label: "Управління", icon: Briefcase },
  { id: "event-journal" as TabType, label: "Події", icon: ScrollText },
  { id: "analytics" as TabType, label: "Аналітика", icon: BarChart3 },
  { id: "settings" as TabType, label: "Налашт.", icon: Settings },
];

interface MobileFooterProps {
  mode: ModeType;
  onModeChange: (mode: ModeType) => void;
  disabled?: boolean;
  deskLabel?: string;
  // Chat input props
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onPlusClick?: () => void;
  onCommandClick?: () => void;
  onBentoClick?: () => void;
  onAIPromptSelect?: (text: string) => void;
  // Context for prompts
  activeCabinet?: Cabinet | null;
  activeTab?: TabType;
  // Cabinet tab navigation (mobile-only compact tabs in desk mode)
  onTabChange?: (tab: TabType) => void;
  onSubTabChange?: (subTab: string) => void;
  // Scroll state for desk mode
  isContentScrolled?: boolean;
}

// Глобальні сторінки без AI підказок (включаючи full-screen wizard-сторінки)
const GLOBAL_PAGES: TabType[] = [
  "user-settings", "faq", "notifications", "pricing",
  "create-template", "add-document", "template-detail", "event-detail"
];

// Сторінки, де підказки показуються тільки при наявності кабінету
const CABINET_CONTEXT_PAGES: TabType[] = ["overview", "operations", "analytics", "settings", "event-journal"];

const MobileFooter = ({ 
  mode, 
  onModeChange, 
  disabled = false, 
  deskLabel,
  inputValue,
  onInputChange,
  onSend,
  onPlusClick,
  onCommandClick,
  onBentoClick,
  onAIPromptSelect,
  activeCabinet,
  activeTab,
  onTabChange,
  onSubTabChange,
  isContentScrolled = false
}: MobileFooterProps) => {
  const showCabinetTabs = mode === "desk" && !!activeCabinet && !!onTabChange;

  const handleCabinetTabClick = (tab: TabType) => {
    onTabChange?.(tab);
    if (tab === "operations" && activeCabinet) {
      const first = getFirstOperationsSubTab(activeCabinet.type);
      onSubTabChange?.(first);
    }
  };
  // Логіка показу AI підказок
  const showQuickPrompts = (() => {
    // Ніколи не показуємо на глобальних сторінках
    if (GLOBAL_PAGES.includes(activeTab as TabType)) return false;
    
    // На cabinet-залежних сторінках показуємо тільки якщо є активний кабінет
    if (CABINET_CONTEXT_PAGES.includes(activeTab as TabType)) {
      return !!activeCabinet;
    }
    
    // На сторінці кабінетів завжди показуємо
    return true;
  })();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [commandOpen, setCommandOpen] = useState(false);

  const handleAIPromptSelect = (text: string) => {
    if (onAIPromptSelect) {
      onAIPromptSelect(text);
    } else {
      // Default behavior: switch to chat and insert text
      onInputChange(text);
      onModeChange("chat");
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [inputValue]);

  // Scroll chat to bottom when virtual keyboard opens
  useEffect(() => {
    if (mode !== "chat") return;
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      // When keyboard opens, viewport height shrinks — scroll chat container to bottom
      const chatContainer = document.querySelector('[data-mobile-chat-scroll]');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    };

    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, [mode]);

  // Handle keyboard: Enter = send, Shift+Enter = new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSend();
      }
    }
  };

  // Mode Toggle component - reused in both modes
  const ModeToggle = () => (
    <div 
      role="tablist" 
      aria-label="Перемикання між чатом та кабінетом"
      className="relative bg-muted border border-border shadow-[var(--shadow-sm)] rounded-full p-0.5 flex flex-1 min-w-[200px] max-w-[280px]"
    >
      {/* Animated background indicator */}
      <div 
        className={`absolute top-0.5 bottom-0.5 bg-card rounded-full shadow-[var(--shadow-sm)] border border-primary/20 transition-all duration-200 ease-out ${
          mode === "desk" ? "left-1/2" : "left-0.5"
        }`}
        style={{ width: 'calc(50% - 2px)' }}
        aria-hidden="true"
      />
      
      <button
        role="tab"
        aria-selected={mode === "chat"}
        aria-controls="chat-panel"
        onClick={() => !disabled && onModeChange("chat")}
        disabled={disabled}
        className={`relative z-10 flex-1 flex items-center justify-center py-1 rounded-full transition-all duration-200 min-h-[28px] active:scale-95 ${
          mode === "chat" ? "text-foreground font-medium" : "text-muted-foreground"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="text-sm">Чат</span>
      </button>
      
      <button
        role="tab"
        aria-selected={mode === "desk"}
        aria-controls="cabinet-panel"
        onClick={() => !disabled && onModeChange("desk")}
        disabled={disabled}
        className={`relative z-10 flex-1 flex items-center justify-center py-1 rounded-full transition-all duration-200 min-h-[28px] active:scale-95 ${
          mode === "desk" ? "text-foreground font-medium" : "text-muted-foreground"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {deskLabel ? (
          <span className="text-sm">{deskLabel}</span>
        ) : (
          <MoreHorizontal className="w-4 h-4" />
        )}
      </button>
    </div>
  );

  const footerRef = useRef<HTMLDivElement>(null);

  // Publish footer height as CSS variable for other components
  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const updateHeight = () => {
      const height = footer.offsetHeight;
      document.documentElement.style.setProperty('--mobile-footer-height', `${height}px`);
    };

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(footer);
    updateHeight();

    return () => {
      resizeObserver.disconnect();
      document.documentElement.style.setProperty('--mobile-footer-height', '0px');
    };
  }, []);

  return (
    <div 
      ref={footerRef}
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-x border-border rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden"
    >
      <div className="pb-safe">
        {/* Chat Mode: Two-level layout */}
        {mode === "chat" && (
          <div>
          {/* Quick Prompts Row - hidden on global pages */}
          {showQuickPrompts && (
            <QuickPromptsRow
              prompts={getContextualPrompts(activeCabinet, activeTab)}
              onPromptClick={(text) => onInputChange(text)}
              className="px-3 pt-2"
            />
          )}
          
          {/* Рівень 1: Textarea + Command + Send */}
          <div className="flex items-end gap-1.5 px-3 pt-1.5">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              enterKeyHint="send"
              placeholder="Напиши повідомлення..."
              rows={1}
              className="flex-1 resize-none bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5 min-h-[36px] max-h-[120px] text-base leading-relaxed"
            />
            
            {/* Command Palette button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-muted hover:bg-accent text-muted-foreground active:scale-95 transition-transform shrink-0"
              aria-label="AI-підказки"
              onClick={() => setCommandOpen(true)}
            >
              <Sparkles className="w-4 h-4" />
            </Button>
            
            {/* Send button */}
            <button
              onClick={onSend}
              disabled={!inputValue.trim()}
              className={cn("m-1.5 p-2 rounded-xl transition-all duration-200 shrink-0 disabled:opacity-40", inputValue.trim() ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" : "text-muted-foreground/40 cursor-default")}
              aria-label="Відправити"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
          
          {/* Рівень 2: Plus + Toggle + Mic */}
          <div className="flex items-center gap-3 px-3 py-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full border-border text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-transform shrink-0"
                  aria-label="Додати"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-36 p-1" align="start" side="top">
                <Button variant="ghost" className="w-full justify-start gap-2 h-10 rounded-lg" onClick={onPlusClick}>
                  <FileUp className="w-4 h-4" />
                  <span>Файл</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 h-10 rounded-lg">
                  <Camera className="w-4 h-4" />
                  <span>Камера</span>
                </Button>
              </PopoverContent>
            </Popover>
            
            {/* Mode Toggle - centered */}
            <div className="flex-1 flex justify-center">
              <ModeToggle />
            </div>
            
            {/* Mic button */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-border text-muted-foreground hover:text-foreground hover:bg-accent active:scale-95 transition-transform shrink-0"
              aria-label="Голосовий ввід"
            >
              <Mic className="w-3.5 h-3.5" />
            </Button>
          </div>
          </div>
        )}
        
        {/* Desk Mode: Two-level layout with Quick Prompts */}
        {mode === "desk" && (
          <div>
          {/* Compact cabinet tabs — replaces decision-cards drawer */}
          {showCabinetTabs && (
            <div
              role="tablist"
              aria-label="Секції кабінету"
              className="flex items-stretch gap-0.5 px-2 pt-2 border-b border-border/40"
            >
              {CABINET_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleCabinetTabClick(tab.id)}
                    className={cn(
                      "relative flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-lg transition-colors active:scale-[0.97]",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("w-[18px] h-[18px]", isActive && "text-primary")} />
                    <span className={cn(
                      "text-[10px] leading-none tracking-tight truncate max-w-full",
                      isActive ? "font-semibold" : "font-medium"
                    )}>
                      {tab.label}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {/* Quick Prompts Row прибрано в desk-режимі — підказки доступні через AI-кнопку зліва від перемикача */}

          <div className="flex items-center justify-between px-3 py-2">
            {/* AI Assistant button */}
            <div className="w-10 flex justify-start">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCommandOpen(true)}
                className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary active:scale-95 transition-transform"
                aria-label="AI-підказки"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Mode Toggle - full width */}
            <ModeToggle />
            
            {/* Bento menu button */}
            <div className="w-10 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBentoClick}
                className="h-9 w-9 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground active:scale-95 transition-transform"
                aria-label="Меню навігації"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
          </div>
        )}
      </div>
      
      {/* Unified Command Palette */}
      <UnifiedCommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        activeCabinet={activeCabinet}
        activeTab={activeTab}
        onPromptSelect={handleAIPromptSelect}
      />
    </div>
  );
};

export default MobileFooter;
