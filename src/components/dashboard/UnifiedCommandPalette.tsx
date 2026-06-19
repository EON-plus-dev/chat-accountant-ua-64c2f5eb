import { useEffect, useState, useRef } from "react";
import { 
  FileText, 
  Receipt, 
  FileSignature, 
  PiggyBank,
  Sparkles,
  Lightbulb,
  Zap,
  Search,
  X
} from "lucide-react";
// Command components removed - using ChipRow for both mobile and desktop
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDragToScrollWithMomentum } from "@/hooks/use-drag-to-scroll";
import { getContextualPrompts } from "@/config/chatPromptsConfig";
import type { Cabinet } from "@/types/cabinet";
import type { TabType } from "./WorkspacePanel";
import { AddExpenseSheet } from "@/components/cabinets/expenses";

// Horizontal scrollable chip row component with momentum
interface ChipRowProps<T> {
  items: T[];
  renderChip: (item: T, index: number) => React.ReactNode;
  className?: string;
}

function ChipRow<T>({ items, renderChip, className }: ChipRowProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const getViewport = () => scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;

  const { isDragging, handlers } = useDragToScrollWithMomentum(getViewport, {
    friction: 0.94,
    minVelocity: 0.5
  });

  const checkScroll = () => {
    const el = getViewport();
    if (el) {
      setShowLeftFade(el.scrollLeft > 0);
      setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = getViewport();
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <div 
      className={`relative ${className || ''}`}
      {...handlers}
    >
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none fade-mask-left" />
      )}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none fade-mask-right" />
      )}
      <ScrollArea ref={scrollRef} className="w-full">
        <div className={`flex items-center gap-1.5 py-1 snap-x snap-mandatory ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}>
          {items.map((item, index) => renderChip(item, index))}
        </div>
        <ScrollBar orientation="horizontal" variant="thin" />
      </ScrollArea>
    </div>
  );
}

interface UnifiedCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCabinet?: Cabinet | null;
  activeTab?: TabType;
  onChatCommand?: (command: string) => void;
  onPromptSelect?: (text: string) => void;
}

const quickActions = [
  { id: "create_invoice", label: "Створити рахунок", icon: FileText },
  { id: "add_expense", label: "Додати витрату", icon: Receipt },
  { id: "create_contract", label: "Створити договір", icon: FileSignature },
  { id: "add_income", label: "Додати дохід", icon: PiggyBank },
];

const demoDocuments = [
  { id: "doc1", label: "Рахунок №12 - ТОВ «Ромашка»", type: "Рахунок" },
  { id: "doc2", label: "Акт №45 - ФОП Петренко", type: "Акт" },
  { id: "doc3", label: "Договір №7 - ТОВ «Техно»", type: "Договір" },
];

export function UnifiedCommandPalette({
  open,
  onOpenChange,
  activeCabinet,
  activeTab,
  onChatCommand,
  onPromptSelect,
}: UnifiedCommandPaletteProps) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  
  const prompts = getContextualPrompts(activeCabinet, activeTab, 6);

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handlePromptSelect = (text: string) => {
    onPromptSelect?.(text);
    onOpenChange(false);
    setSearch("");
  };

  const handleQuickAction = (actionId: string) => {
    if (actionId === "add_expense") {
      onOpenChange(false);
      setSearch("");
      setAddExpenseOpen(true);
      return;
    }
    onChatCommand?.(actionId);
    onOpenChange(false);
    setSearch("");
  };

  const handleDocumentSelect = (docLabel: string) => {
    onPromptSelect?.(`Покажи документ: ${docLabel}`);
    onOpenChange(false);
    setSearch("");
  };

  const contextHint = activeCabinet 
    ? `Контекст: ${activeCabinet.name}`
    : "Загальний режим · усі кабінети";

  // Filter items based on search
  const filteredPrompts = prompts.filter(p => 
    p.text.toLowerCase().includes(search.toLowerCase())
  );
  const filteredActions = quickActions.filter(a => 
    a.label.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDocs = demoDocuments.filter(d => 
    d.label.toLowerCase().includes(search.toLowerCase())
  );

  const hasResults = filteredPrompts.length > 0 || filteredActions.length > 0 || filteredDocs.length > 0;

  // Mobile: use Drawer with ChipRows
  if (isMobile) {
    return (
      <>
      <Drawer open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) setSearch("");
      }}>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <DrawerTitle className="text-base font-medium">
                АІ-асистент
              </DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Пошук підказок, команд, документів..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          <div className="px-4 pb-4 space-y-3 overflow-y-auto">
            <p className="text-xs text-muted-foreground">{contextHint}</p>
            
            {!hasResults && search && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Нічого не знайдено
              </p>
            )}

            {filteredPrompts.length > 0 && (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  <Lightbulb className="w-3.5 h-3.5" />
                  AI-підказки
                </div>
                <ChipRow
                  items={filteredPrompts}
                  renderChip={(prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptSelect(prompt.text)}
                      className="flex-shrink-0 snap-start text-xs px-3 py-1.5 rounded-full bg-muted/70 hover:bg-accent border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-95 whitespace-nowrap"
                    >
                      {prompt.text}
                    </button>
                  )}
                />
              </div>
            )}
            
            {filteredActions.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25">
                  <Zap className="w-3.5 h-3.5" />
                  Швидкі дії
                </div>
                <ChipRow
                  items={filteredActions}
                  renderChip={(action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      className="flex-shrink-0 snap-start flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/70 hover:bg-accent border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-95 whitespace-nowrap"
                    >
                      <action.icon className="w-3.5 h-3.5" />
                      {action.label}
                    </button>
                  )}
                />
              </div>
            )}

            {filteredDocs.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800">
                  <FileText className="w-3.5 h-3.5" />
                  Документи
                </div>
                <ChipRow
                  items={filteredDocs}
                  renderChip={(doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleDocumentSelect(doc.label)}
                      className="flex-shrink-0 snap-start flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/70 hover:bg-accent border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-95 whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="max-w-[180px] truncate">{doc.label}</span>
                    </button>
                  )}
                />
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      <AddExpenseSheet open={addExpenseOpen} onOpenChange={setAddExpenseOpen} />
      </>
    );
  }

  // Desktop: use Dialog with ChipRows (same as mobile)
  return (
    <>
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) setSearch("");
    }}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-lg !gap-0">
        <div className="flex flex-col w-full max-w-lg">
          {/* Search input */}
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              type="text"
              placeholder="Пошук підказок, команд, документів..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Context hint */}
          <div className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border">
            {contextHint}
          </div>

          {/* Content with ChipRows */}
          <div className="max-h-[300px] overflow-y-auto px-3 py-3 space-y-3 scrollbar-default">
              {!hasResults && search && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Нічого не знайдено
                </p>
              )}

              {/* AI Prompts - ChipRow */}
              {filteredPrompts.length > 0 && (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    <Lightbulb className="w-3.5 h-3.5" />
                    AI-підказки
                  </div>
                  <ChipRow
                    items={filteredPrompts}
                    renderChip={(prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handlePromptSelect(prompt.text)}
                        className="flex-shrink-0 snap-start text-xs px-3 py-1.5 rounded-full bg-muted/70 hover:bg-accent border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-95 whitespace-nowrap"
                      >
                        {prompt.text}
                      </button>
                    )}
                  />
                </div>
              )}

              {/* Quick Actions - ChipRow */}
              {filteredActions.length > 0 && (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25">
                    <Zap className="w-3.5 h-3.5" />
                    Швидкі дії
                  </div>
                  <ChipRow
                    items={filteredActions}
                    renderChip={(action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        className="flex-shrink-0 snap-start flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/70 hover:bg-accent border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-95 whitespace-nowrap"
                      >
                        <action.icon className="w-3.5 h-3.5" />
                        {action.label}
                      </button>
                    )}
                  />
                </div>
              )}

              {/* Documents - ChipRow */}
              {filteredDocs.length > 0 && (
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800">
                    <FileText className="w-3.5 h-3.5" />
                    Документи
                  </div>
                  <ChipRow
                    items={filteredDocs}
                    renderChip={(doc) => (
                      <button
                        key={doc.id}
                        onClick={() => handleDocumentSelect(doc.label)}
                        className="flex-shrink-0 snap-start flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted/70 hover:bg-accent border border-border/50 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-colors duration-150 active:scale-95 whitespace-nowrap"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="max-w-[180px] truncate">{doc.label}</span>
                      </button>
                    )}
                  />
                </div>
              )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-center gap-2 p-2 text-xs text-muted-foreground border-t border-border">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              <span className="text-xs">⌘</span>K
            </kbd>
            <span>для швидкого доступу</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    <AddExpenseSheet open={addExpenseOpen} onOpenChange={setAddExpenseOpen} />
    </>
  );
}

export default UnifiedCommandPalette;
