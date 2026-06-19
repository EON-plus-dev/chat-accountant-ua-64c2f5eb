/**
 * RemindersWidget
 * Displays upcoming deadlines and payment reminders for a cabinet
 */

import { useMemo } from "react";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { 
  Bell, 
  Receipt, 
  Building2, 
  Users, 
  FileText, 
  AlertTriangle,
  FileSignature,
  File,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Cabinet } from "@/types/cabinet";
import { 
  generateReminders, 
  getUrgencyLabel,
  type Reminder,
  type ReminderType,
  type ReminderSeverity,
} from "@/lib/reminderEngine";

interface RemindersWidgetProps {
  cabinet: Cabinet;
  onNavigate?: (path: string) => void;
  onChatPromptInsert?: (prompt: string) => void;
  maxItems?: number;
}

const iconMap: Record<ReminderType, React.ElementType> = {
  tax: Receipt,
  rent: Building2,
  salary: Users,
  report: FileText,
  contract: FileSignature,
  limit: AlertTriangle,
  document: File,
};

const severityStyles: Record<ReminderSeverity, {
  badge: string;
  icon: string;
  bg: string;
  border: string;
}> = {
  critical: {
    badge: "bg-destructive text-destructive-foreground",
    icon: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
  },
  warning: {
    badge: "bg-warning text-warning-foreground",
    icon: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
  },
  info: {
    badge: "bg-muted text-muted-foreground",
    icon: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
  },
};

export const RemindersWidget = ({ 
  cabinet, 
  onNavigate, 
  onChatPromptInsert,
  maxItems = 5,
}: RemindersWidgetProps) => {
  const { prefs } = useNotificationPreferences();
  const reminders = useMemo(() => {
    return generateReminders(cabinet, undefined, prefs?.deadline_lead_days).slice(0, maxItems);
  }, [cabinet, maxItems, prefs?.deadline_lead_days]);

  const criticalCount = reminders.filter(r => r.severity === "critical").length;
  const hasReminders = reminders.length > 0;

  // Don't render if no reminders
  if (!hasReminders) return null;

  // Determine card styling based on most severe reminder
  const mostSevere = reminders[0]?.severity || "info";
  const cardStyles = severityStyles[mostSevere];

  const handleReminderClick = (reminder: Reminder) => {
    if (reminder.actionPath && onNavigate) {
      onNavigate(reminder.actionPath);
    }
  };

  const handleAskAI = () => {
    const reminderSummary = reminders
      .slice(0, 3)
      .map(r => r.title)
      .join(", ");
    onChatPromptInsert?.(`Допоможи з найближчими дедлайнами: ${reminderSummary}`);
  };

  return (
    <Card className={cn("border", cardStyles.border, cardStyles.bg)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Calendar className={cn("w-5 h-5", cardStyles.icon)} />
            <span>Нагадування</span>
          </div>
          {criticalCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {criticalCount} терміново
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {reminders.map((reminder) => {
          const Icon = iconMap[reminder.type] || Bell;
          const styles = severityStyles[reminder.severity];
          
          return (
            <div
              key={reminder.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg bg-background/80",
                "hover:bg-background transition-colors cursor-pointer",
                "group"
              )}
              onClick={() => handleReminderClick(reminder)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleReminderClick(reminder);
                }
              }}
            >
              {/* Icon */}
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                styles.bg
              )}>
                <Icon className={cn("w-4.5 h-4.5", styles.icon)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{reminder.title}</span>
                  {reminder.amount && (
                    <Badge variant="outline" className="text-[11px] px-1.5 py-0 font-mono">
                      {(reminder.amount / 1000).toFixed(0)}K ₴
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={cn(
                    reminder.severity === "critical" && "text-destructive font-medium",
                    reminder.severity === "warning" && "text-warning"
                  )}>
                    {getUrgencyLabel(reminder.daysUntil)}
                  </span>
                  {reminder.description && (
                    <>
                      <span>·</span>
                      <span className="truncate">{reminder.description}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReminderClick(reminder);
                  }}
                >
                  {reminder.actionLabel}
                </Button>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </div>
          );
        })}

        {/* AI Help Button */}
        {onChatPromptInsert && reminders.length >= 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground mt-2"
            onClick={handleAskAI}
          >
            <Bell className="w-3.5 h-3.5 mr-1.5" />
            Запитати AI про пріоритети
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
