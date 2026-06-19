import { Bell, Search, Mail, Calculator, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatAction } from "@/config/chatSalesFunnel";

const iconMap: Record<string, React.ElementType> = {
  Bell, Search, Mail, Calculator, ArrowRight, MessageSquare,
};

interface ChatActionButtonProps {
  action: ChatAction;
  onClick: (action: ChatAction) => void;
  disabled?: boolean;
}

export const ChatActionButton = ({ action, onClick, disabled }: ChatActionButtonProps) => {
  const Icon = iconMap[action.icon] || ArrowRight;

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-xs gap-1.5 whitespace-nowrap"
      onClick={() => onClick(action)}
      disabled={disabled}
    >
      <Icon className="w-3.5 h-3.5" />
      {action.label}
    </Button>
  );
};
