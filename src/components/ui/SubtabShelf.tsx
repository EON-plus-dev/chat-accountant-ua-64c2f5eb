import { useRef, useEffect } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface SubtabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SubtabShelfProps {
  tabs: SubtabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  entityStyle?: {
    pillActiveClass?: string;
    color?: string;
  };
  className?: string;
}

export function SubtabShelf({ 
  tabs, 
  activeTab, 
  onTabChange, 
  entityStyle,
  className 
}: SubtabShelfProps) {
  const navRef = useRef<HTMLElement>(null);

  // Auto-scroll to center active tab when it changes (for external changes / deep-links)
  useEffect(() => {
    if (!activeTab || !navRef.current) return;

    const activeButton = navRef.current.querySelector(
      `[data-subtab-id="${activeTab}"]`
    ) as HTMLElement;
    
    if (activeButton) {
      // Знайти Radix viewport напряму від кнопки (гарантовано працює незалежно від wrapper'ів)
      const viewport = activeButton.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null;
      
      if (viewport) {
        // Ручне центрування з clamp: рахуємо позицію кнопки відносно viewport
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
  }, [activeTab]);

  return (
    <div className={cn("bg-subtab-shelf border-b border-border relative", className)}>
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
          ref={navRef}
          className="inline-flex items-center gap-1.5 w-max" 
          role="tablist" 
          aria-label="Підрозділи"
        >
          {/* Left spacer for symmetric padding */}
          <span aria-hidden="true" className="w-4 shrink-0" />
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            
            return (
              <button
                key={tab.id}
                type="button"
                data-subtab-id={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
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
                        // Hover - помітний фідбек
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
  );
}
