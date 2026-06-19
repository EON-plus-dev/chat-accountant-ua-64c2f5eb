import { useEffect, useRef, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Pricing from "@/pages/Pricing";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { userSettingsTabs } from "@/config/userSettingsConfig";
import { cn } from "@/lib/utils";
import PersonalDataSection from "@/components/user-settings/PersonalDataSection";
import SecuritySection from "@/components/user-settings/SecuritySection";
import NotificationsSection from "@/components/user-settings/NotificationsSection";
import LinkedCabinetsSection from "@/components/user-settings/LinkedCabinetsSection";
import ExportDataSection from "@/components/user-settings/ExportDataSection";
import DeleteAccountSection from "@/components/user-settings/DeleteAccountSection";
import SettingsHub from "@/components/user-settings/SettingsHub";

import type { Cabinet } from "@/types/cabinet";

interface UserSettingsPageProps {
  onBack?: () => void;
  onCabinetEnter?: (cabinet: Cabinet) => void;
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  onNavigateToPricing?: () => void;
}

const UserSettingsPage = ({ onBack, onCabinetEnter, activeSubTab, onSubTabChange, onNavigateToPricing }: UserSettingsPageProps) => {
  const subtabNavRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastCenteredTabRef = useRef<string | null>(null);
  
  // Allowed tab IDs for user settings (prevents cross-context pollution)
  const allowedTabIds = useMemo(() => userSettingsTabs.map(t => t.id), []);
  
  // Normalize activeSubTab: use it only if valid for this context; default → hub
  const effectiveTab = allowedTabIds.includes(activeSubTab || "") ? activeSubTab! : "hub";
  
  // Self-heal: sync Dashboard state if activeSubTab is invalid for profile settings
  useEffect(() => {
    if (activeSubTab && !allowedTabIds.includes(activeSubTab)) {
      onSubTabChange?.("hub");
    }
  }, [activeSubTab, allowedTabIds, onSubTabChange]);

  // Manual centering: replaces scrollIntoView to avoid jitter/vertical scroll issues
  useEffect(() => {
    if (!effectiveTab || !subtabNavRef.current) return;
    
    // Skip if already centered this tab (prevents repeated scrolls)
    if (lastCenteredTabRef.current === effectiveTab) return;

    const nav = subtabNavRef.current;
    const activeButton = nav.querySelector(
      `[data-subtab-id="${effectiveTab}"]`
    ) as HTMLElement;
    if (!activeButton) return;
    
    // Find Radix ScrollArea viewport
    const viewport = nav.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!viewport) return;
    
    // Calculate centering offset
    const viewportRect = viewport.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();
    
    const buttonCenter = buttonRect.left + buttonRect.width / 2;
    const viewportCenter = viewportRect.left + viewportRect.width / 2;
    const offset = buttonCenter - viewportCenter;
    
    // Only scroll if offset is significant (avoids micro-jitters)
    if (Math.abs(offset) > 2) {
      const targetScrollLeft = viewport.scrollLeft + offset;
      const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
      const clampedTarget = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
      
      // Instant scroll to avoid jitter
      viewport.scrollTo({ left: clampedTarget, behavior: "instant" });
    }
    
    lastCenteredTabRef.current = effectiveTab;
  }, [effectiveTab]);

  // Reset scroll to top when subtab changes (prevents jitter from scroll position preservation)
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [effectiveTab]);

  const handleTabClick = (tabId: string) => {
    onSubTabChange?.(tabId);
  };

  const renderContent = () => {
    switch (effectiveTab) {
      case "hub": return <SettingsHub onSubTabChange={onSubTabChange} />;
      case "personal": return <PersonalDataSection />;
      case "security": return <SecuritySection />;
      case "notifications": return <NotificationsSection />;
      case "tariff": 
        return <Pricing embedded />;
      case "cabinets": return <LinkedCabinetsSection onCabinetEnter={onCabinetEnter} />;
      case "export": return <ExportDataSection />;
      case "danger-zone": return <DeleteAccountSection />;
      default: return <SettingsHub onSubTabChange={onSubTabChange} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="px-4 md:px-6 pt-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
              aria-label="Назад"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold text-foreground truncate">
              Налаштування профілю
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">
              Особисті дані, безпека та сповіщення
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - inline pills like WorkspacePanel */}
      <div className="bg-subtab-shelf border-b border-border relative">
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
            aria-label="Налаштування профілю"
          >
            {/* Left spacer for symmetric padding */}
            <span aria-hidden="true" className="w-4 shrink-0" />
            {userSettingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === effectiveTab;
              
              return (
                <button
                  key={tab.id}
                  data-subtab-id={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabClick(tab.id)}
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
                          "bg-background text-foreground",
                          "shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]",
                          "ring-[1.5px] ring-primary/30",
                        ]
                      : [
                          // Inactive state
                          "text-muted-foreground",
                          // Hover
                          "hover:text-foreground",
                          "hover:bg-muted",
                          "hover:scale-[1.02]",
                          // Active/pressed
                          "active:scale-[0.97]",
                          "active:bg-accent",
                        ]
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            {/* Right spacer for symmetric padding */}
            <span aria-hidden="true" className="w-4 shrink-0" />
          </nav>
          <ScrollBar orientation="horizontal" variant="thin" />
        </ScrollArea>
      </div>

      {/* Content - with scroll containment and min-height to prevent jitter */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 md:px-6 py-4 min-h-[400px]"
      >
        <div className={cn(effectiveTab !== "tariff" && effectiveTab !== "hub" && "max-w-3xl mx-auto")}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;
