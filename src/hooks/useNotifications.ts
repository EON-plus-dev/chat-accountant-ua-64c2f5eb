import { useState, useMemo, useCallback, useEffect } from "react";
import { isToday, isYesterday, parseISO, compareDesc } from "date-fns";
import type { NotificationType, NotificationPriority } from "@/components/dashboard/NotificationItem";
import { generateDemoReportLifecycleNotifications, type Notification } from "@/lib/reportNotificationService";
import { onContractorOnboarded } from "@/lib/contractorNotificationService";
import { useUserNotifications } from "@/hooks/useUserNotifications";
import { mapDbNotificationToUI, isDbNotificationId, type CabinetLookup } from "@/lib/notificationAdapter";

export type { Notification };

interface UseNotificationsOptions {
  cabinetId?: string;
  cabinetName?: string;
  cabinetType?: string;
  includeReportLifecycle?: boolean;
  persistToLocalStorage?: boolean;
  /** Чи мерджити realtime-сповіщення з public.user_notifications. Default: true. */
  mergeRealtimeDb?: boolean;
  /** Довідник кабінетів для відображення назв у БД-сповіщеннях. */
  cabinetsLookup?: CabinetLookup[];
}

interface UseNotificationsReturn {
  // Data
  notifications: Notification[];
  unreadCount: number;

  // Grouped data
  urgentNotifications: Notification[];
  todayNotifications: Notification[];
  yesterdayNotifications: Notification[];
  earlierNotifications: Notification[];

  // Filtered data
  filteredNotifications: Notification[];

  // Actions
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  toggleRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, "id">) => void;

  // Filters
  setTypeFilter: (type: NotificationType | "all") => void;
  setCabinetFilter: (cabinetId: string | "all") => void;
  setSearchQuery: (query: string) => void;
  setShowUnreadOnly: (show: boolean) => void;
  clearFilters: () => void;

  // Filter state
  activeFilters: {
    type: NotificationType | "all";
    cabinetId: string | "all";
    searchQuery: string;
    showUnreadOnly: boolean;
  };
}

const STORAGE_KEY = "notifications_read_state";

// Static demo notifications
const getStaticDemoNotifications = (): Notification[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  return [
    {
      id: "static-1",
      title: "Термін подачі ЄСВ завтра",
      description: "Необхідно подати звіт з ЄСВ до кінця робочого дня. Переконайтесь, що всі дані актуальні.",
      time: "30 хв тому",
      date: formatDate(today),
      type: "alert",
      isRead: false,
      cabinetId: "fop-ivanov",
      cabinetName: "ФОП Іванов",
      priority: "urgent",
    },
    {
      id: "static-2",
      title: "Новий рахунок створено",
      description: "Рахунок №1234 для ТОВ 'Компанія' на суму 15,000 грн успішно створено",
      time: "2 години тому",
      date: formatDate(today),
      type: "document",
      isRead: false,
      cabinetId: "tov-romashka",
      cabinetName: "ТОВ Ромашка",
      priority: "normal",
    },
    {
      id: "static-3",
      title: "Наближається дедлайн звіту",
      description: "Квартальний звіт потрібно подати до 25 грудня",
      time: "5 годин тому",
      date: formatDate(today),
      type: "deadline",
      isRead: false,
      cabinetId: "fop-ivanov",
      cabinetName: "ФОП Іванов",
      priority: "high",
    },
    {
      id: "static-4",
      title: "Платіж підтверджено",
      description: "Оплата за послуги успішно зарахована на рахунок",
      time: "Вчора, 18:30",
      date: formatDate(yesterday),
      type: "success",
      isRead: true,
      cabinetId: "tov-romashka",
      cabinetName: "ТОВ Ромашка",
      priority: "normal",
    },
    {
      id: "static-5",
      title: "Нова податкова накладна",
      description: "Отримано податкову накладну №5678 від постачальника",
      time: "Вчора, 14:20",
      date: formatDate(yesterday),
      type: "document",
      isRead: true,
      cabinetId: "fop-petrenko",
      cabinetName: "ФОП Петренко",
      priority: "normal",
    },
    {
      id: "static-6",
      title: "Завершено звірку залишків",
      description: "Автоматична звірка залишків на складі успішно завершена",
      time: "2 дні тому",
      date: formatDate(twoDaysAgo),
      type: "success",
      isRead: true,
      cabinetId: "tov-romashka",
      cabinetName: "ТОВ Ромашка",
      priority: "normal",
    },
  ];
};

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    cabinetId,
    cabinetName = "",
    cabinetType = "fop",
    includeReportLifecycle = true,
    persistToLocalStorage = true,
    mergeRealtimeDb = true,
    cabinetsLookup = [],
  } = options;

  // Realtime DB notifications (фаза 2 — токени з public.user_notifications)
  const dbNotifications = useUserNotifications();


  // Read persisted state
  const getPersistedReadState = (): Record<string, boolean> => {
    if (!persistToLocalStorage) return {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  // Initialize notifications
  const [baseNotifications, setBaseNotifications] = useState<Notification[]>(() => {
    const staticNotifications = getStaticDemoNotifications();

    // Generate report lifecycle notifications
    let reportNotifications: Notification[] = [];
    if (includeReportLifecycle) {
      // Demo cabinets for report notifications
      const demoCabinets = [
        { id: "fop-ivanov", name: "ФОП Іванов", type: "fop" },
        { id: "tov-romashka", name: "ТОВ Ромашка", type: "tov" },
      ];

      demoCabinets.forEach((cab) => {
        reportNotifications.push(
          ...generateDemoReportLifecycleNotifications(cab.id, cab.name, cab.type)
        );
      });
    }

    // Combine and apply persisted read state
    const all = [...staticNotifications, ...reportNotifications];
    const persistedState = getPersistedReadState();

    return all.map((n) => ({
      ...n,
      isRead: persistedState[n.id] !== undefined ? persistedState[n.id] : n.isRead,
    }));
  });

  // Filter state
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [cabinetFilter, setCabinetFilter] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Persist read state
  useEffect(() => {
    if (!persistToLocalStorage) return;

    const readState: Record<string, boolean> = {};
    baseNotifications.forEach((n) => {
      readState[n.id] = n.isRead;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(readState));
  }, [baseNotifications, persistToLocalStorage]);

  // Merge: demo (baseNotifications) + realtime DB (user_notifications)
  const mergedNotifications = useMemo(() => {
    if (!mergeRealtimeDb) return baseNotifications;
    const dbAsUi = dbNotifications.items.map((n) => mapDbNotificationToUI(n, cabinetsLookup));
    // dedupe by id (DB wins)
    const seen = new Set(dbAsUi.map((n) => n.id));
    const demo = baseNotifications.filter((n) => !seen.has(n.id));
    return [...dbAsUi, ...demo];
  }, [baseNotifications, dbNotifications.items, mergeRealtimeDb, cabinetsLookup]);

  // Filter notifications based on cabinet if specified
  const notifications = useMemo(() => {
    if (!cabinetId) return mergedNotifications;
    return mergedNotifications.filter((n) => n.cabinetId === cabinetId);
  }, [mergedNotifications, cabinetId]);


  // Apply filters
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
            n.title.toLowerCase().includes(query) ||
            n.description.toLowerCase().includes(query) ||
            n.cabinetName.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        // Type filter
        if (typeFilter !== "all" && n.type !== typeFilter) return false;

        // Cabinet filter
        if (cabinetFilter !== "all" && n.cabinetId !== cabinetFilter) return false;

        // Unread only filter
        if (showUnreadOnly && n.isRead) return false;

        return true;
      })
      .sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));
  }, [notifications, searchQuery, typeFilter, cabinetFilter, showUnreadOnly]);

  // Grouped notifications
  const { urgentNotifications, todayNotifications, yesterdayNotifications, earlierNotifications } =
    useMemo(() => {
      const urgent = filteredNotifications.filter(
        (n) => (n.priority === "urgent" || n.priority === "high") && !n.isRead
      );
      const urgentIds = new Set(urgent.map((n) => n.id));

      const today = filteredNotifications.filter(
        (n) => !urgentIds.has(n.id) && isToday(parseISO(n.date))
      );
      const yesterday = filteredNotifications.filter(
        (n) => !urgentIds.has(n.id) && isYesterday(parseISO(n.date))
      );
      const earlier = filteredNotifications.filter(
        (n) =>
          !urgentIds.has(n.id) &&
          !isToday(parseISO(n.date)) &&
          !isYesterday(parseISO(n.date))
      );

      return {
        urgentNotifications: urgent,
        todayNotifications: today,
        yesterdayNotifications: yesterday,
        earlierNotifications: earlier,
      };
    }, [filteredNotifications]);

  // Unread count
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // Actions — маршрутизація: uuid → БД, інакше — локально
  const markAsRead = useCallback((id: string) => {
    if (isDbNotificationId(id)) {
      void dbNotifications.markRead(id);
      return;
    }
    setBaseNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, [dbNotifications]);

  const markAllAsRead = useCallback(() => {
    void dbNotifications.markAllRead();
    setBaseNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, [dbNotifications]);

  const toggleRead = useCallback((id: string) => {
    if (isDbNotificationId(id)) {
      // Для БД підтримуємо лише markRead (зворотна дія не реалізована в API)
      void dbNotifications.markRead(id);
      return;
    }
    setBaseNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  }, [dbNotifications]);

  const deleteNotification = useCallback((id: string) => {
    if (isDbNotificationId(id)) {
      void dbNotifications.remove(id);
      return;
    }
    setBaseNotifications((prev) => prev.filter((n) => n.id !== id));
  }, [dbNotifications]);


  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setBaseNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const clearFilters = useCallback(() => {
    setTypeFilter("all");
    setCabinetFilter("all");
    setSearchQuery("");
    setShowUnreadOnly(false);
  }, []);

  // Listen for contractor onboarding and add to notifications
  useEffect(() => {
    const unsubscribe = onContractorOnboarded((detail) => {
      const { contractorId, email } = detail;
      
      addNotification({
        title: `Контрагент завершив реєстрацію`,
        description: `${email} приєднався до системи. Документи автоматично оновлено.`,
        time: "Щойно",
        date: new Date().toISOString().split("T")[0],
        type: "contractor-onboarded",
        isRead: false,
        cabinetId: cabinetId || "all",
        cabinetName: cabinetName || "Система",
        priority: "high",
      });
    });
    
    return unsubscribe;
  }, [cabinetId, cabinetName, addNotification]);

  return {
    notifications,
    unreadCount,
    urgentNotifications,
    todayNotifications,
    yesterdayNotifications,
    earlierNotifications,
    filteredNotifications,
    markAsRead,
    markAllAsRead,
    toggleRead,
    deleteNotification,
    addNotification,
    setTypeFilter,
    setCabinetFilter,
    setSearchQuery,
    setShowUnreadOnly,
    clearFilters,
    activeFilters: {
      type: typeFilter,
      cabinetId: cabinetFilter,
      searchQuery,
      showUnreadOnly,
    },
  };
}
