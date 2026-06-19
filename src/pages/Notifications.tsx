import { ArrowLeft, Bell, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { UnifiedToolbar } from "@/components/ui/UnifiedToolbar";
import NotificationItem from "@/components/dashboard/NotificationItem";
import NotificationFiltersPopover from "@/components/notifications/NotificationFiltersPopover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationType } from "@/components/dashboard/NotificationItem";

interface NotificationsProps {
  onBack?: () => void;
  onScroll?: (isScrolled: boolean) => void;
}

const cabinets = [
  { id: "all", name: "Усі кабінети" },
  { id: "fop-ivanov", name: "ФОП Іванов" },
  { id: "tov-romashka", name: "ТОВ Ромашка" },
  { id: "fop-petrenko", name: "ФОП Петренко" },
];

const typeFilters = [
  { id: "all", label: "Усі" },
  { id: "document", label: "Документи" },
  { id: "deadline", label: "Дедлайни" },
  { id: "alert", label: "Сповіщення" },
  { id: "success", label: "Успішні" },
  { id: "ai", label: "AI/Автоматизація" },
];

const Notifications = ({ onBack, onScroll }: NotificationsProps) => {
  const navigate = useNavigate();
  const {
    notifications,
    filteredNotifications,
    unreadCount,
    urgentNotifications,
    todayNotifications,
    yesterdayNotifications,
    earlierNotifications,
    markAsRead,
    markAllAsRead,
    toggleRead,
    deleteNotification,
    setTypeFilter,
    setCabinetFilter,
    setSearchQuery,
    setShowUnreadOnly,
    clearFilters,
    activeFilters,
  } = useNotifications({
    includeReportLifecycle: true,
    persistToLocalStorage: true,
  });

  const handleNotificationClick = (id: string) => {
    const n = notifications.find((x) => x.id === id);
    markAsRead(id);
    if (n?.actionPath) {
      navigate(n.actionPath);
    }
  };

  const handleToggleRead = (id: string) => {
    toggleRead(id);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    toast({
      title: "Сповіщення видалено",
      description: "Сповіщення було успішно видалено",
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "Усі прочитані",
      description: "Всі сповіщення позначено як прочитані",
    });
  };

  const clearPopoverFilters = () => {
    setCabinetFilter("all");
    setTypeFilter("all");
  };

  const popoverFiltersCount = 
    (activeFilters.cabinetId !== "all" ? 1 : 0) + 
    (activeFilters.type !== "all" ? 1 : 0);
  
  const hasActiveFilters = 
    activeFilters.searchQuery !== "" || 
    activeFilters.cabinetId !== "all" || 
    activeFilters.type !== "all" || 
    activeFilters.showUnreadOnly;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card px-4 md:px-6 pt-5 pb-4 space-y-3 border-b border-border/50 shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Назад">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Сповіщення</h1>
            <p className="text-xs text-muted-foreground">
              {filteredNotifications.length} з {notifications.length}
              {unreadCount > 0 && ` · ${unreadCount} непрочитаних`}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={handleMarkAllAsRead}>
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Усі прочитані</span>
            </Button>
          )}
        </div>

        <UnifiedToolbar
          className="px-0"
          searchValue={activeFilters.searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Пошук сповіщень..."
          filterSlot={
            <NotificationFiltersPopover
              cabinets={cabinets}
              typeFilters={typeFilters}
              selectedCabinet={activeFilters.cabinetId}
              selectedType={activeFilters.type}
              onCabinetChange={setCabinetFilter}
              onTypeChange={(type) => setTypeFilter(type as NotificationType | "all")}
              onReset={clearPopoverFilters}
              activeFiltersCount={popoverFiltersCount}
            />
          }
          mobileFilterContent={
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Кабінет</Label>
                <Select value={activeFilters.cabinetId} onValueChange={setCabinetFilter}>
                  <SelectTrigger><SelectValue placeholder="Оберіть кабінет" /></SelectTrigger>
                  <SelectContent>
                    {cabinets.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Тип сповіщення</Label>
                <Select value={activeFilters.type} onValueChange={(v) => setTypeFilter(v as NotificationType | "all")}>
                  <SelectTrigger><SelectValue placeholder="Оберіть тип" /></SelectTrigger>
                  <SelectContent>
                    {typeFilters.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
          activeChips={[
            activeFilters.searchQuery && { key: "search", label: `"${activeFilters.searchQuery}"`, onRemove: () => setSearchQuery("") },
            activeFilters.cabinetId !== "all" && { 
              key: "cabinet", 
              label: cabinets.find(c => c.id === activeFilters.cabinetId)?.name || activeFilters.cabinetId, 
              onRemove: () => setCabinetFilter("all") 
            },
            activeFilters.type !== "all" && { 
              key: "type", 
              label: typeFilters.find(t => t.id === activeFilters.type)?.label || activeFilters.type, 
              onRemove: () => setTypeFilter("all") 
            },
            activeFilters.showUnreadOnly && { key: "unread", label: "Тільки непрочитані", onRemove: () => setShowUnreadOnly(false) },
          ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[]}
          onClearAllFilters={clearFilters}
          unreadToggle={{
            pressed: activeFilters.showUnreadOnly,
            onPressedChange: setShowUnreadOnly,
            unreadCount: unreadCount,
          }}
          sticky={false}
        />
      </div>

      {/* Notifications List */}
      <div 
        className="flex-1 md:overflow-auto min-h-0 pb-16 md:pb-0"
        onScroll={(e) => {
          const scrollTop = (e.target as HTMLDivElement).scrollTop;
          onScroll?.(scrollTop > 10);
        }}
      >
        {filteredNotifications.length > 0 ? (
          <div className="p-4 space-y-4">
            {urgentNotifications.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="destructive" className="text-xs">Термінові</Badge>
                  <span className="text-xs text-muted-foreground">({urgentNotifications.length})</span>
                </div>
                <div className="space-y-2">
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
                      onToggleRead={() => handleToggleRead(notification.id)}
                      onDelete={() => handleDelete(notification.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {todayNotifications.length > 0 && (
              <section>
                <p className="text-xs font-medium text-muted-foreground mb-2">Сьогодні</p>
                <div className="space-y-2">
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
                      onToggleRead={() => handleToggleRead(notification.id)}
                      onDelete={() => handleDelete(notification.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {yesterdayNotifications.length > 0 && (
              <section>
                <p className="text-xs font-medium text-muted-foreground mb-2">Вчора</p>
                <div className="space-y-2">
                  {yesterdayNotifications.map((notification) => (
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
                      onToggleRead={() => handleToggleRead(notification.id)}
                      onDelete={() => handleDelete(notification.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {earlierNotifications.length > 0 && (
              <section>
                <p className="text-xs font-medium text-muted-foreground mb-2">Раніше</p>
                <div className="space-y-2">
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
                      onToggleRead={() => handleToggleRead(notification.id)}
                      onDelete={() => handleDelete(notification.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Bell className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-base font-medium text-muted-foreground mb-1">
              {hasActiveFilters ? "Нічого не знайдено" : "Немає сповіщень"}
            </h3>
            <p className="text-sm text-muted-foreground/70 max-w-[280px]">
              {hasActiveFilters
                ? "Спробуйте змінити фільтри або пошуковий запит"
                : "Нові сповіщення з'являться тут"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Скинути фільтри
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
