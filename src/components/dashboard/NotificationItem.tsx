import { FileText, Clock, AlertCircle, CheckCircle, Bell, MoreHorizontal, Check, Circle, Trash2, Bot, AtSign, CheckSquare, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NotificationType = "document" | "deadline" | "alert" | "success" | "general" | "ai" | "mention" | "task" | "contractor-onboarded";
export type NotificationPriority = "urgent" | "high" | "normal";

interface NotificationItemProps {
  id: string;
  title: string;
  description: string;
  time: string;
  type?: NotificationType;
  isRead?: boolean;
  cabinetName?: string;
  priority?: NotificationPriority;
  onClick?: () => void;
  onToggleRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const typeConfig: Record<NotificationType, { icon: typeof FileText; color: string }> = {
  document: { icon: FileText, color: "text-blue-500" },
  deadline: { icon: Clock, color: "text-orange-500" },
  alert: { icon: AlertCircle, color: "text-destructive" },
  success: { icon: CheckCircle, color: "text-success" },
  general: { icon: Bell, color: "text-muted-foreground" },
  ai: { icon: Bot, color: "text-purple-500" },
  mention: { icon: AtSign, color: "text-amber-500" },
  task: { icon: CheckSquare, color: "text-indigo-500" },
  "contractor-onboarded": { icon: UserPlus, color: "text-emerald-500" },
};

const NotificationItem = ({
  id,
  title,
  description,
  time,
  type = "general",
  isRead = false,
  cabinetName,
  priority = "normal",
  onClick,
  onToggleRead,
  onDelete,
}: NotificationItemProps) => {
  const { icon: Icon, color } = typeConfig[type];
  const isUrgent = priority === "urgent" || priority === "high";
  const hasActions = onToggleRead || onDelete;

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleRead?.(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg cursor-pointer transition-colors relative group",
        isRead ? "bg-transparent hover:bg-muted/50" : "bg-muted/50 hover:bg-muted",
        isUrgent && !isRead && "border-l-2 border-l-destructive"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5", color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-sm font-medium", !isRead && "font-semibold")}>{title}</p>
            <div className="flex items-center gap-1 shrink-0">
              {!isRead && (
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5",
                  isUrgent ? "bg-destructive animate-pulse" : "bg-primary"
                )} />
              )}
              {hasActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {onToggleRead && (
                      <DropdownMenuItem onClick={handleToggleRead}>
                        {isRead ? (
                          <>
                            <Circle className="w-4 h-4 mr-2" />
                            Позначити непрочитаним
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Позначити прочитаним
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Видалити
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground/70">
            <span>{time}</span>
            {cabinetName && (
              <>
                <span>•</span>
                <span className="truncate max-w-[120px]">{cabinetName}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
