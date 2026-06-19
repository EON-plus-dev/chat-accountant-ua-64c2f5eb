import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, CreditCard, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { MOCK_NOTIFICATIONS, type AdminNotificationMock } from "@/admin/system/data/mocks";
import { cn } from "@/lib/utils";

const ICONS: Record<AdminNotificationMock["kind"], React.ComponentType<{ className?: string }>> = {
  incident: AlertTriangle,
  billing: CreditCard,
  knowledge: BookOpen,
  ticket: MessageSquare,
};

const KIND_COLORS: Record<AdminNotificationMock["kind"], string> = {
  incident: "text-rose-600 dark:text-rose-400",
  billing: "text-amber-600 dark:text-amber-400",
  knowledge: "text-sky-600 dark:text-sky-400",
  ticket: "text-violet-600 dark:text-violet-400",
};

export function NotificationsBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  // Локальний стан непрочитаних (демо)
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(MOCK_NOTIFICATIONS.filter((n) => !n.unread).map((n) => n.id)),
  );

  const items = useMemo(() => MOCK_NOTIFICATIONS.slice(0, 8), []);
  const unreadCount = items.filter((n) => !readIds.has(n.id)).length;

  const handleClick = (n: AdminNotificationMock) => {
    setReadIds((s) => new Set(s).add(n.id));
    setOpen(false);
    navigate(n.url);
  };

  const markAllRead = () => setReadIds(new Set(items.map((n) => n.id)));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label="Сповіщення"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-medium flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <div className="text-sm font-medium">Сповіщення</div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
              Позначити прочитаними
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto divide-y divide-border/60">
          {items.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Немає сповіщень
            </div>
          )}
          {items.map((n) => {
            const Icon = ICONS[n.kind];
            const unread = !readIds.has(n.id);
            return (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "w-full text-left px-3 py-2.5 hover:bg-muted/60 transition-colors flex gap-3",
                  unread && "bg-muted/30",
                )}
              >
                <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", KIND_COLORS[n.kind])} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm leading-snug">{n.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.at).toLocaleString("uk-UA", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                    </span>
                    <Badge variant="outline" className="text-[10px] capitalize">{n.kind}</Badge>
                  </div>
                </div>
                {unread && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
