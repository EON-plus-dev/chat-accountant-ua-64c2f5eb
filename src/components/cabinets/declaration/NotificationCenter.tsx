import { useMemo } from "react";
import { Bell, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "urgent" | "warning" | "info" | "success";
  title: string;
  description: string;
  daysLeft?: number;
  date: string;
}

interface NotificationCenterProps {
  year: number;
  deadlineDate?: string; // ISO date of main deadline
}

export function NotificationCenter({ year, deadlineDate }: NotificationCenterProps) {
  const notifications = useMemo<Notification[]>(() => {
    const now = new Date();
    const deadline = deadlineDate ? new Date(deadlineDate) : new Date(`${year + 1}-05-01`);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const paymentDeadline = new Date(`${year + 1}-07-31`);
    const paymentDaysLeft = Math.ceil((paymentDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const items: Notification[] = [];

    if (daysLeft <= 0) {
      items.push({
        id: "n-overdue",
        type: "urgent",
        title: "Дедлайн декларації прострочено!",
        description: `Термін подання декларації за ${year} рік минув ${Math.abs(daysLeft)} днів тому. Можливі штрафні санкції.`,
        daysLeft,
        date: deadline.toISOString(),
      });
    } else if (daysLeft <= 30) {
      items.push({
        id: "n-deadline-soon",
        type: "urgent",
        title: `До дедлайну декларації ${daysLeft} днів`,
        description: `Декларацію за ${year} рік потрібно подати до 01.05.${year + 1}. Перевірте готовність чернетки.`,
        daysLeft,
        date: deadline.toISOString(),
      });
    } else if (daysLeft <= 90) {
      items.push({
        id: "n-deadline-warn",
        type: "warning",
        title: `До дедлайну декларації ${daysLeft} днів`,
        description: `Рекомендуємо завершити збір документів та перевірити розрахунки.`,
        daysLeft,
        date: deadline.toISOString(),
      });
    }

    if (paymentDaysLeft > 0 && paymentDaysLeft <= 30) {
      items.push({
        id: "n-payment",
        type: "warning",
        title: `До дедлайну сплати ПДФО ${paymentDaysLeft} днів`,
        description: `ПДФО та ВЗ за ${year} рік потрібно сплатити до 31.07.${year + 1}.`,
        daysLeft: paymentDaysLeft,
        date: paymentDeadline.toISOString(),
      });
    }

    if (items.length === 0) {
      items.push({
        id: "n-ok",
        type: "success",
        title: "Немає термінових нагадувань",
        description: `Наступний дедлайн: подання декларації до 01.05.${year + 1} (${daysLeft} днів).`,
        daysLeft,
        date: deadline.toISOString(),
      });
    }

    return items;
  }, [year, deadlineDate]);

  const typeStyles = {
    urgent: "border-l-destructive bg-destructive/5",
    warning: "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
    info: "border-l-primary bg-primary/5",
    success: "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
  };

  const typeIcons = {
    urgent: AlertTriangle,
    warning: Clock,
    info: Bell,
    success: CheckCircle2,
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          Нагадування
          <Badge variant="secondary" size="sm">6.4</Badge>
          {notifications.some(n => n.type === "urgent") && (
            <Badge variant="destructive" size="sm">!</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {notifications.map((n) => {
          const Icon = typeIcons[n.type];
          return (
            <div
              key={n.id}
              className={cn("rounded-lg border-l-4 p-3 space-y-1", typeStyles[n.type])}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn(
                  "w-4 h-4",
                  n.type === "urgent" && "text-destructive",
                  n.type === "warning" && "text-amber-500",
                  n.type === "success" && "text-emerald-500",
                )} />
                <span className="text-sm font-medium">{n.title}</span>
              </div>
              <p className="text-xs text-muted-foreground pl-6">{n.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
