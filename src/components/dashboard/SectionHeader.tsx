import { ArrowLeft, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  description?: string;
  onHomeClick?: () => void;
  showHomeButton?: boolean;
  icon?: LucideIcon;
}

export function SectionHeader({ 
  title, 
  description, 
  onHomeClick,
  showHomeButton = true,
  icon: Icon = ArrowLeft,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      {showHomeButton && onHomeClick && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onHomeClick}
          className="p-2 h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 flex-shrink-0 mt-0.5"
          aria-label="Повернутися назад"
        >
          <Icon className="w-4 h-4" />
        </Button>
      )}
      <div>
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
