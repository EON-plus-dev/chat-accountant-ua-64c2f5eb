import { Calculator, UserCog, HelpCircle, LogOut, Loader2, Sun, Moon, Monitor, Check, PanelLeftClose, PanelLeftOpen, LayoutDashboard, LayoutPanelLeft, Map, SlidersHorizontal, BarChart3, CalendarDays, History } from "lucide-react";
import type { CmsWorkspaceTab } from "./CmsWorkspaceTabs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { demoUserSubscription } from "@/config/pricingData";
import { User } from "@supabase/supabase-js";
import UserAvatar from "@/components/dashboard/UserAvatar";

import CmsUrlChip from "./CmsUrlChip";

const WORKSPACE_TABS: { id: CmsWorkspaceTab; label: string; icon: typeof LayoutPanelLeft }[] = [
  { id: "dashboard", label: "Огляд", icon: LayoutDashboard },
  { id: "sitemap", label: "Карта", icon: Map },
  { id: "preview", label: "Редактор", icon: LayoutPanelLeft },
  { id: "analytics", label: "Аналітика", icon: BarChart3 },
  { id: "calendar", label: "Календар", icon: CalendarDays },
  { id: "settings", label: "Налашт.", icon: SlidersHorizontal },
];

interface CmsHeaderProps {
  isChatCollapsed: boolean;
  onToggleChat: () => void;
  activeTab: CmsWorkspaceTab;
  onTabChange: (tab: CmsWorkspaceTab) => void;
  historyOpen: boolean;
  onToggleHistory: () => void;
}

export default function CmsHeader({ isChatCollapsed, onToggleChat, activeTab, onTabChange, historyOpen, onToggleHistory }: CmsHeaderProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setAuthUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setAuthUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const user = {
    name: authUser?.email?.split("@")[0] || "Адмін",
    email: authUser?.email || "",
    plan: demoUserSubscription.planName,
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    setIsLoggingOut(false);
    navigate("/");
  };


  return (
    <TooltipProvider>
      <header className="fixed md:relative top-0 left-0 right-0 z-40 h-12 bg-sidebar flex items-center justify-between px-3 md:px-4 text-sidebar-foreground shadow-[0_4px_12px_-4px_hsl(var(--foreground)/0.12)] md:shadow-none">
        <div className="flex items-center gap-3 flex-shrink-0 min-w-0 flex-1">
          {/* Desktop: Chat zone with logo + toggle */}
          <div className={`hidden md:flex items-center gap-3 ${isChatCollapsed ? '' : 'md:w-[380px]'} flex-shrink-0`}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Calculator className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-base font-sans font-semibold tracking-wide text-foreground">
              FINTODO CMS
            </span>
            <div className="flex-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7 transition-colors",
                    historyOpen
                      ? "bg-accent text-accent-foreground hover:bg-accent"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={onToggleHistory}
                  disabled={isChatCollapsed}
                  aria-pressed={historyOpen}
                  aria-label={historyOpen ? "Закрити історію" : "Історія чатів"}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isChatCollapsed ? "Розгорніть чат" : historyOpen ? "Закрити історію" : "Історія чатів"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onToggleChat}>
                  {isChatCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isChatCollapsed ? "Розгорнути чат" : "Згорнути чат"}</TooltipContent>
            </Tooltip>
          </div>

          {/* Mobile: Logo + History */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Calculator className="w-4 h-4 text-primary-foreground" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                historyOpen ? "bg-accent text-accent-foreground" : "text-sidebar-foreground/70"
              )}
              onClick={onToggleHistory}
              aria-label="Історія чатів"
            >
              <History className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop tabs (md+): icons inline */}
          <nav className="hidden md:flex items-center gap-0.5" role="tablist" aria-label="CMS секції">
            {WORKSPACE_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "gap-1.5 h-8 px-2 md:px-3 rounded-md text-sm font-medium relative",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-0.5 rounded-full bg-primary" />
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Mobile tabs: collapsed dropdown with active tab label */}
          <div className="md:hidden flex-1 min-w-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-between gap-2 px-2 text-sm font-medium text-sidebar-foreground bg-sidebar-accent/40 hover:bg-sidebar-accent"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    {(() => {
                      const active = WORKSPACE_TABS.find((t) => t.id === activeTab) ?? WORKSPACE_TABS[0];
                      const Icon = active.icon;
                      return (
                        <>
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{active.label}</span>
                        </>
                      );
                    })()}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0">▾</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {WORKSPACE_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <DropdownMenuItem
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={cn(activeTab === tab.id && "bg-accent")}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right: Profile */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">


          {/* Profile */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full",
                      "bg-muted/70 hover:bg-accent",
                      "border border-border/50 hover:border-primary/30",
                      "transition-[background-color,color,transform,border-color] duration-150 ease-out",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1",
                      "hover:text-foreground",
                      "active:scale-95"
                    )}
                    aria-label="Ваш профіль"
                  >
                    <UserAvatar name={user.name} email={user.email} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Ваш профіль</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.name} email={user.email} size="lg" />
                  <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                        {user.plan}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-none mt-1">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Progress
                    value={Math.round((demoUserSubscription.currentBalance / demoUserSubscription.periodCredits) * 100)}
                    className={cn(
                      "h-1.5 w-full",
                      demoUserSubscription.currentBalance / demoUserSubscription.periodCredits > 0.5
                        ? "[&>div]:bg-emerald-500"
                        : demoUserSubscription.currentBalance / demoUserSubscription.periodCredits > 0.25
                          ? "[&>div]:bg-amber-500"
                          : "[&>div]:bg-destructive"
                    )}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {demoUserSubscription.currentBalance.toLocaleString("uk-UA")} / {demoUserSubscription.periodCredits.toLocaleString("uk-UA")} кредитів
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin")}>
                <UserCog className="w-4 h-4 mr-2" />
                Класична адмін-панель
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Кабінет
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="w-4 h-4 mr-2 dark:hidden" />
                  <Moon className="w-4 h-4 mr-2 hidden dark:block" />
                  Тема
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="w-4 h-4 mr-2" />
                    Світла
                    {theme === "light" && <Check className="w-4 h-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="w-4 h-4 mr-2" />
                    Темна
                    {theme === "dark" && <Check className="w-4 h-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="w-4 h-4 mr-2" />
                    Системна
                    {theme === "system" && <Check className="w-4 h-4 ml-auto" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive" disabled={isLoggingOut}>
                {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                Вийти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
}


