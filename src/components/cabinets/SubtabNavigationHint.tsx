import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubtabNavigationHintProps {
  nextLabel: string;
  description?: string;
  onNavigate: () => void;
  className?: string;
}

export function SubtabNavigationHint({ nextLabel, description, onNavigate, className }: SubtabNavigationHintProps) {
  return (
    <button
      type="button"
      onClick={onNavigate}
      className={cn(
        "group w-full flex items-center gap-3 px-4 py-3 rounded-lg",
        "border border-border/60 bg-muted/30",
        "hover:bg-accent/50 hover:border-primary/30",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1",
        className
      )}
    >
      <div className="flex-1 text-left">
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Далі → <span className="text-foreground">{nextLabel}</span>
        </span>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}
