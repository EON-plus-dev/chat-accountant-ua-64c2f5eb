import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ArrowUp,
  Sparkles,
  LayoutGrid,
  LayoutDashboard,
  LayoutPanelLeft,
  Map,
  SlidersHorizontal,
  BarChart3,
  CalendarDays,
  Eye,
  Pencil,
  Search,
} from "lucide-react";
import type { CmsWorkspaceTab, PreviewMode } from "./CmsWorkspaceTabs";

export type CmsMobileMode = "chat" | "desk";

interface QuickAction {
  label: string;
  command: string;
}

interface CmsMobileFooterProps {
  mode: CmsMobileMode;
  onModeChange: (mode: CmsMobileMode) => void;
  // Chat composer
  onSend: (text: string) => void;
  canSend: boolean;
  quickActions?: QuickAction[];
  // Desk nav
  activeTab: CmsWorkspaceTab;
  onTabChange: (tab: CmsWorkspaceTab) => void;
  previewMode?: PreviewMode;
  onPreviewModeChange?: (mode: PreviewMode) => void;
}

const WORKSPACE_TABS: { id: CmsWorkspaceTab; label: string; icon: typeof LayoutPanelLeft }[] = [
  { id: "dashboard", label: "Огляд", icon: LayoutDashboard },
  { id: "sitemap", label: "Карта", icon: Map },
  { id: "preview", label: "Редактор", icon: LayoutPanelLeft },
  { id: "analytics", label: "Аналітика", icon: BarChart3 },
  { id: "calendar", label: "Календар", icon: CalendarDays },
  { id: "settings", label: "Налашт.", icon: SlidersHorizontal },
];

const PREVIEW_MODES: { id: PreviewMode; label: string; icon: typeof Eye }[] = [
  { id: "page", label: "Перегляд", icon: Eye },
  { id: "edit", label: "Редагувати", icon: Pencil },
  { id: "seo", label: "SEO", icon: Search },
  { id: "analytics", label: "Аналітика", icon: BarChart3 },
];

export default function CmsMobileFooter({
  mode,
  onModeChange,
  onSend,
  canSend,
  quickActions = [],
  activeTab,
  onTabChange,
  previewMode,
  onPreviewModeChange,
}: CmsMobileFooterProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [bentoOpen, setBentoOpen] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);

  // Publish footer height as CSS variable
  useLayoutEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const update = () => {
      document.documentElement.style.setProperty(
        "--cms-mobile-footer-height",
        `${el.offsetHeight}px`,
      );
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => {
      ro.disconnect();
      document.documentElement.style.setProperty("--cms-mobile-footer-height", "0px");
    };
  }, []);

  // Autoresize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }, [value]);

  const submit = () => {
    const v = value.trim();
    if (!v || !canSend) return;
    onSend(v);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const ModeToggle = () => (
    <div
      role="tablist"
      aria-label="Перемикання чат/панель"
      className="relative bg-muted border border-border shadow-[var(--shadow-sm)] rounded-full p-0.5 flex flex-1 min-w-[180px] max-w-[260px]"
    >
      <div
        className={cn(
          "absolute top-0.5 bottom-0.5 bg-card rounded-full shadow-[var(--shadow-sm)] border border-primary/20 transition-all duration-200 ease-out",
          mode === "desk" ? "left-1/2" : "left-0.5",
        )}
        style={{ width: "calc(50% - 2px)" }}
        aria-hidden="true"
      />
      <button
        role="tab"
        aria-selected={mode === "chat"}
        onClick={() => onModeChange("chat")}
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center py-1 rounded-full min-h-[28px] active:scale-95 transition",
          mode === "chat" ? "text-foreground font-medium" : "text-muted-foreground",
        )}
      >
        <span className="text-sm">Чат</span>
      </button>
      <button
        role="tab"
        aria-selected={mode === "desk"}
        onClick={() => onModeChange("desk")}
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center py-1 rounded-full min-h-[28px] active:scale-95 transition",
          mode === "desk" ? "text-foreground font-medium" : "text-muted-foreground",
        )}
      >
        <span className="text-sm">Панель</span>
      </button>
    </div>
  );

  return (
    <div
      ref={footerRef}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-x border-border rounded-t-2xl shadow-[0_-4px_6px_-1px_hsl(var(--foreground)/0.08)]"
    >
      <div className="pb-safe">
        {mode === "chat" && (
          <div>
            {/* Quick prompts */}
            {quickActions.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto px-3 pt-2 pb-1 scrollbar-none">
                {quickActions.slice(0, 6).map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => onSend(a.command)}
                    disabled={!canSend}
                    className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-md bg-muted border border-border text-foreground hover:bg-accent disabled:opacity-50"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <div className="flex items-end gap-1.5 px-3 pt-1.5">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                enterKeyHint="send"
                placeholder={canSend ? "Напишіть запит до AI…" : "Створюю чат…"}
                rows={1}
                disabled={!canSend}
                className="flex-1 resize-none bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none py-1.5 min-h-[36px] max-h-[140px] text-base leading-relaxed"
              />
              <button
                onClick={submit}
                disabled={!value.trim() || !canSend}
                className={cn(
                  "m-1 p-2 rounded-xl transition shrink-0 disabled:opacity-40",
                  value.trim()
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground/40",
                )}
                aria-label="Надіслати"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom row: prompts + toggle */}
            <div className="flex items-center gap-2 px-3 py-2">
              <Popover open={promptsOpen} onOpenChange={setPromptsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-muted text-muted-foreground shrink-0"
                    aria-label="AI-підказки"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-64 p-1.5">
                  <div className="flex flex-col gap-1">
                    {quickActions.length === 0 && (
                      <p className="text-xs text-muted-foreground px-2 py-2">
                        Немає підказок для цієї секції.
                      </p>
                    )}
                    {quickActions.map((a) => (
                      <button
                        key={a.label}
                        type="button"
                        onClick={() => {
                          onSend(a.command);
                          setPromptsOpen(false);
                        }}
                        disabled={!canSend}
                        className="text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent disabled:opacity-50"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex-1 flex justify-center">
                <ModeToggle />
              </div>

              <div className="w-8 shrink-0" aria-hidden />
            </div>
          </div>
        )}

        {mode === "desk" && (
          <div className="flex items-center gap-2 px-3 py-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onModeChange("chat")}
              className="h-9 w-9 rounded-full bg-primary/10 text-primary shrink-0"
              aria-label="Перейти в чат"
            >
              <Sparkles className="w-4 h-4" />
            </Button>

            <div className="flex-1 flex justify-center">
              <ModeToggle />
            </div>

            <Sheet open={bentoOpen} onOpenChange={setBentoOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-muted text-muted-foreground shrink-0"
                  aria-label="Меню секцій"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
                <SheetHeader className="text-left">
                  <SheetTitle>Розділи CMS</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {WORKSPACE_TABS.map((t) => {
                    const Icon = t.icon;
                    const active = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          onTabChange(t.id);
                          setBentoOpen(false);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-foreground hover:bg-accent",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {activeTab === "preview" && onPreviewModeChange && (
                  <div className="mt-6">
                    <div className="text-xs font-medium text-muted-foreground mb-2 px-1">
                      Режим редактора
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {PREVIEW_MODES.map((m) => {
                        const Icon = m.icon;
                        const active = previewMode === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              onPreviewModeChange(m.id);
                              setBentoOpen(false);
                            }}
                            className={cn(
                              "flex items-center gap-2 p-2.5 rounded-lg border text-sm",
                              active
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-foreground hover:bg-accent",
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </div>
  );
}
