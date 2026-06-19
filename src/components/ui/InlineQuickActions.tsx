import { MoreHorizontal, Copy, Flag, Link2, CheckCircle2, XCircle, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type InlineStatusAction = "income" | "not-income" | "return";

interface InlineQuickActionsProps {
  id: string;
  isFlagged?: boolean;
  onCopyId?: (id: string) => void;
  onToggleFlag?: (id: string) => void;
  onLink?: (id: string) => void;
  /** When provided, shows status-change items (✓ / ✗ / ↩) for fast inline classification */
  onStatusChange?: (id: string, status: InlineStatusAction) => void;
  /** Current status to know which actions to offer (e.g. hide ✓ if already income) */
  currentStatus?: "income" | "not-income" | "return" | "needs-clarification";
  className?: string;
}

export const InlineQuickActions = ({
  id,
  isFlagged = false,
  onCopyId,
  onToggleFlag,
  onLink,
  onStatusChange,
  currentStatus,
  className,
}: InlineQuickActionsProps) => {
  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation();

  const handleCopy = (e: Event) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    toast.success("ID скопійовано", { duration: 1500 });
    onCopyId?.(id);
  };

  const handleFlag = (e: Event) => {
    e.stopPropagation();
    onToggleFlag?.(id);
    toast.success(isFlagged ? "Позначку знято" : "Позначено для перевірки", {
      duration: 1500,
    });
  };

  const handleLink = (e: Event) => {
    e.stopPropagation();
    onLink?.(id);
    toast.success("Звʼязування…", { duration: 1500 });
  };

  const handleStatus = (e: Event, status: InlineStatusAction, label: string) => {
    e.stopPropagation();
    onStatusChange?.(id, status);
    toast.success(label, { duration: 2000 });
  };

  const showIncome = !!onStatusChange && currentStatus !== "income";
  const showNotIncome = !!onStatusChange && currentStatus !== "not-income";
  const showReturn = !!onStatusChange && currentStatus !== "return";
  const hasStatusItems = showIncome || showNotIncome || showReturn;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={stop}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Дії"
          className={cn(
            "h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-muted",
            "data-[state=open]:text-foreground data-[state=open]:bg-muted",
            className,
          )}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" onClick={stop}>
        {showIncome && (
          <DropdownMenuItem
            onSelect={(e) => handleStatus(e, "income", "Включено в дохід")}
            className="text-emerald-600 focus:text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Включити в дохід
          </DropdownMenuItem>
        )}
        {showNotIncome && (
          <DropdownMenuItem
            onSelect={(e) => handleStatus(e, "not-income", "Не включено в дохід")}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Не в дохід
          </DropdownMenuItem>
        )}
        {showReturn && (
          <DropdownMenuItem
            onSelect={(e) => handleStatus(e, "return", "Позначено як повернення")}
            className="text-blue-600 focus:text-blue-700 dark:text-blue-400"
          >
            <Undo2 className="w-4 h-4 mr-2" />
            Позначити як повернення
          </DropdownMenuItem>
        )}
        {hasStatusItems && <DropdownMenuSeparator />}
        <DropdownMenuItem onSelect={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Копіювати ID
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleFlag}>
          <Flag className={cn("w-4 h-4 mr-2", isFlagged && "fill-current text-amber-500")} />
          {isFlagged ? "Зняти позначку" : "Позначити для перевірки"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLink}>
          <Link2 className="w-4 h-4 mr-2" />
          Звʼязати з документом
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
