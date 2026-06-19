import { Calculator, Bell, UserCog, Building2, HelpCircle, CreditCard, LogOut, Loader2, Sun, Moon, Monitor, Check, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CabinetContextChip } from "./CabinetContextChip";
import type { Cabinet } from "@/types/cabinet";
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
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { demoUserSubscription } from "@/config/pricingData";
import { User } from "@supabase/supabase-js";
import { useIsMobile } from "@/hooks/use-mobile";
import UserAvatar from "./UserAvatar";
import NotificationItem from "./NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";
import { operationsConfigByType, getOperationsSubTabs, getOperationsSubTabsForPassive } from "@/config/operationsConfig";
import { getSettingsSubTabs, getSettingsSubTabsForPassive } from "@/config/settingsConfig";
import { getEntityStyle } from "@/config/entityStyles";

interface HeaderProps {
  onCabinetsClick?: () => void;
  activeCabinet?: Cabinet | null;
  cabinets?: Cabinet[];
  onCabinetEnter?: (cabinet: Cabinet) => void;
  onNavigationDrawerOpen?: () => void;
  activeTab?: string;
  activeSubTab?: string;
  onProfileSettingsClick?: () => void;
  onFAQClick?: () => void;
  onNotificationsClick?: () => void;
  onPricingClick?: () => void;
  onCabinetOverviewClick?: () => void;
  isChatCollapsed?: boolean;
  onToggleChat?: () => void;
}

const tabLabels: Record<string, string> = {
  overview: "Огляд",
  operations: "Управління",
  analytics: "Аналітика",
  settings: "Налаштування",
  profile: "Профіль",
  "event-journal": "Події",
};

const getSubTabLabel = (
  activeTab: string | undefined,
  activeSubTab: string | undefined,
  cabinet: Cabinet | null | undefined
): string | null => {
  if (!cabinet || !activeTab || !activeSubTab) return null;

  if (activeTab === "operations") {
    const tabs = cabinet.accessMode === "passive"
      ? getOperationsSubTabsForPassive(cabinet.type)
      : getOperationsSubTabs(cabinet);
    return tabs.find(t => t.id === activeSubTab)?.label ?? null;
  }

  if (activeTab === "settings") {
    const tabs = cabinet.accessMode === "passive"
      ? getSettingsSubTabsForPassive(cabinet.type)
      : getSettingsSubTabs(cabinet.type, cabinet);
    return tabs.find(t => t.id === activeSubTab)?.label ?? null;
  }

  return null;
};

const Header = ({ onCabinetsClick, activeCabinet, cabinets = [], onCabinetEnter, onNavigationDrawerOpen, activeTab, activeSubTab, onProfileSettingsClick, onFAQClick, onNotificationsClick, onPricingClick, onCabinetOverviewClick, isChatCollapsed, onToggleChat }: HeaderProps) => {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Cmd+K / Ctrl+K shortcut to open cabinet switcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSwitcherOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Use centralized notifications hook
  const {
    notifications,
    unreadCount,
    urgentNotifications,
    todayNotifications,
    earlierNotifications,
    markAsRead,
    markAllAsRead,
    toggleRead,
    deleteNotification,
  } = useNotifications({
    includeReportLifecycle: true,
    persistToLocalStorage: true,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Use centralized subscription data for consistency
  const user = {
    name: authUser?.email?.split("@")[0] || "Користувач",
    email: authUser?.email || "",
    plan: demoUserSubscription.planName,
    imageUrl: undefined,
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    localStorage.removeItem('onboarding_complete');
    localStorage.removeItem('dashboard_active_tab');
    localStorage.removeItem('dashboard_active_cabinet');
    setIsLoggingOut(false);
    navigate("/");
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleNotificationClick = (id: string) => {
    const n = notifications.find((x) => x.id === id);
    markAsRead(id);
    setIsNotificationsOpen(false);
    if (n?.actionPath) {
      navigate(n.actionPath);
    }
  };

  // Combine today and earlier for display
  const allNotifications = [...urgentNotifications, ...todayNotifications, ...earlierNotifications];


  const NotificationsContent = () => (
    <div className={cn("flex flex-col", isMobile ? "h-full min-h-0" : "")}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between p-3 border-b">
        <h4 className="font-semibold text-sm">Сповіщення</h4>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={handleMarkAllRead}
          >
            Усі прочитані
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className={isMobile ? "flex-1 min-h-0" : "h-[300px]"}>
        {allNotifications.length > 0 ? (
          <div className="p-2 space-y-3">
            {/* Urgent Section */}
            {urgentNotifications.length > 0 && (
              <div>
                <p className="text-xs font-medium text-destructive px-1 mb-1.5">
                  Термінові ({urgentNotifications.length})
                </p>
                <div className="space-y-1">
                  {urgentNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      id={notification.id}
                      title={notification.title}
                      description={notification.description}
                      time={notification.time}
                      type={notification.type}
                      isRead={notification.isRead}
                      cabinetName={notification.cabinetName}
                      priority={notification.priority}
                      onClick={() => handleNotificationClick(notification.id)}
                      onToggleRead={toggleRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Today Section */}
            {todayNotifications.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground px-1 mb-1.5">Сьогодні</p>
                <div className="space-y-1">
                  {todayNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      id={notification.id}
                      title={notification.title}
                      description={notification.description}
                      time={notification.time}
                      type={notification.type}
                      isRead={notification.isRead}
                      cabinetName={notification.cabinetName}
                      priority={notification.priority}
                      onClick={() => handleNotificationClick(notification.id)}
                      onToggleRead={toggleRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Earlier Section */}
            {earlierNotifications.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground px-1 mb-1.5">Раніше</p>
                <div className="space-y-1">
                  {earlierNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      id={notification.id}
                      title={notification.title}
                      description={notification.description}
                      time={notification.time}
                      type={notification.type}
                      isRead={notification.isRead}
                      cabinetName={notification.cabinetName}
                      priority={notification.priority}
                      onClick={() => handleNotificationClick(notification.id)}
                      onToggleRead={toggleRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              Немає нових сповіщень
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Ви побачите тут важливі оновлення
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Sticky Footer - OUTSIDE ScrollArea */}
      {allNotifications.length > 0 && (
        <div className="shrink-0 p-3 border-t bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button 
            variant="default" 
            className="w-full text-sm h-10"
            onClick={() => {
              setIsNotificationsOpen(false);
              onNotificationsClick?.();
            }}
          >
            Переглянути всі сповіщення
          </Button>
        </div>
      )}
    </div>
  );

  const NotificationButton = (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative rounded-full",
        "bg-muted/70 hover:bg-accent",
        "border border-border/50 hover:border-primary/30",
        "transition-[background-color,color,transform,border-color] duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1",
        "hover:text-foreground",
        "active:scale-95"
      )}
      aria-label={`Сповіщення, ${unreadCount} непрочитаних`}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-destructive animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <TooltipProvider>
      <header className="fixed md:relative top-0 left-0 right-0 z-40 h-12 bg-sidebar flex items-center justify-between px-3 md:px-4 text-sidebar-foreground shadow-[0_4px_12px_-4px_hsl(var(--foreground)/0.12)] md:shadow-none">
        <div className="flex items-center gap-3 flex-shrink-0 min-w-0 flex-1">
          {/* Desktop: Chat zone (380px) with logo + toggle */}
          <div className={`hidden md:flex items-center gap-3 ${isChatCollapsed ? '' : 'md:w-[380px]'} flex-shrink-0`}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Calculator className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-base font-sans font-semibold tracking-wide text-foreground">
              FINTODO
            </span>
            <div className="flex-1" />
            {onToggleChat && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onToggleChat}>
                {isChatCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </Button>
            )}
          </div>

          {/* Mobile: Logo only */}
          <div className="md:hidden w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Calculator className="w-4 h-4 text-primary-foreground" />
          </div>
          
          {/* Desktop: Workspace-aligned Context Chip */}
          {!isMobile && (
            <CabinetContextChip
              activeCabinet={activeCabinet ?? null}
              cabinets={cabinets}
              onCabinetEnter={onCabinetEnter}
              onViewAllCabinets={onCabinetsClick}
              isOpen={isSwitcherOpen}
              onOpenChange={setIsSwitcherOpen}
            />
          )}
          
          {/* Mobile: cabinet name + role badge when active, otherwise app name */}
          {isMobile && activeCabinet ? (
            <div
              className="flex items-center gap-1.5 min-w-0 flex-1 max-w-[60vw] sm:max-w-[280px]"
              aria-label={`Поточний кабінет: ${activeCabinet.name}`}
            >
              <span className="truncate text-sm font-semibold text-foreground">
                {activeCabinet.name}
              </span>
              {activeCabinet.roleLabel && (
                <Badge
                  variant="secondary"
                  className="text-[11px] px-1.5 py-0 h-4 font-medium flex-shrink-0 border-0"
                  style={{
                    backgroundColor: `${getEntityStyle(activeCabinet.type).color}15`,
                    color: getEntityStyle(activeCabinet.type).color,
                  }}
                >
                  {activeCabinet.roleLabel}
                </Badge>
              )}
            </div>
          ) : isMobile ? (
            <span className="text-sm md:text-base font-sans font-semibold tracking-wide text-foreground truncate">
              FINTODO
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* Cabinets button removed — switcher is now in CabinetContextChip */}

          {/* Notifications - Adaptive: Popover on desktop, Sheet on mobile */}
          {isMobile ? (
            <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <SheetTrigger asChild>
                {NotificationButton}
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl px-0 flex flex-col">
                <SheetHeader className="sr-only">
                  <SheetTitle>Сповіщення</SheetTitle>
                </SheetHeader>
                <NotificationsContent />
              </SheetContent>
            </Sheet>
          ) : (
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                {NotificationButton}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 md:w-96 p-0">
                <NotificationsContent />
              </PopoverContent>
            </Popover>
          )}

          {/* User Profile */}
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
                    <UserAvatar name={user.name} email={user.email} imageUrl={user.imageUrl} />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Ваш профіль</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-64">
              {/* User Info Header */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={user.name}
                    email={user.email}
                    imageUrl={user.imageUrl}
                    size="lg"
                  />
                  <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                        {user.plan}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-none mt-1">
                      {user.email}
                    </p>
                  </div>
                </div>
                {/* Credit progress bar */}
                <div 
                  className="mt-3 cursor-pointer group" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onPricingClick?.();
                  }}
                >
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
                  <p className="text-[10px] text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                    {demoUserSubscription.currentBalance.toLocaleString("uk-UA")} / {demoUserSubscription.periodCredits.toLocaleString("uk-UA")} кредитів
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Menu Items */}
              <DropdownMenuItem onClick={onProfileSettingsClick}>
                <UserCog className="w-4 h-4 mr-2" />
                Налаштування профілю
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onFAQClick}>
                <HelpCircle className="w-4 h-4 mr-2" />
                Питання та відповіді
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
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Вийти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  );
};

export default Header;